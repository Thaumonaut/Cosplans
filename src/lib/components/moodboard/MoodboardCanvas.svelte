<script lang="ts">
    import { Background, Controls, SvelteFlow } from "@xyflow/svelte";
    import type { Edge, Node, NodeDragHandler } from "@xyflow/svelte";
    import type { MoodboardNode as MoodboardNodeType } from "$lib/types/domain/moodboard";
    import MoodboardNode from "$lib/components/moodboard/nodes/MoodboardNode.svelte";
    import { moodboardsService } from "$lib/api/services/moodboardsService";
    import "@xyflow/svelte/dist/style.css";

    interface Props {
        nodes: MoodboardNodeType[];
        childCounts?: Map<string, number>;
        onSelect?: (node: MoodboardNodeType) => void;
        onEdit?: (node: MoodboardNodeType) => void;
        onUpdate?: (nodeId: string, updates: any) => void;
        onDelete?: (node: MoodboardNodeType) => void;
        onDuplicate?: (node: MoodboardNodeType) => void;
        onPositionChange?: (nodeId: string, x: number, y: number) => void;
        onDrillIn?: (nodeId: string) => void;
        onContextMenu?: (
            node: MoodboardNodeType,
            position: { x: number; y: number },
        ) => void;
        onCanvasContextMenu?: (position: { x: number; y: number }) => void;
        onCloseContextMenu?: () => void;
    }

    let {
        nodes,
        childCounts = new Map(),
        onSelect,
        onEdit,
        onUpdate,
        onDelete,
        onDuplicate,
        onPositionChange,
        onDrillIn,
        onContextMenu,
        onCanvasContextMenu,
        onCloseContextMenu,
    }: Props = $props();

    const nodeTypes = {
        moodboard: MoodboardNode,
    };

    const edges: Edge[] = [];

    const flowNodes = $derived(
        nodes.map<Node>((node) => ({
            id: node.id,
            type: "moodboard",
            position: {
                x: node.positionX ?? 0,
                y: node.positionY ?? 0,
            },
            draggable: true,
            style: `width: ${node.width ?? 300}px; height: ${node.height ?? 150}px; min-height: 100px;`,
            // No dragHandle - entire node is draggable
            data: {
                node,
                childCount: childCounts.get(node.id) || 0,
                onSelect,
                onEdit,
                onUpdate,
                onDelete,
                onDuplicate,
                onDrillIn,
                onContextMenu,
            },
        })),
    );

    // Debounce map for position updates (nodeId -> timeout)
    const debounceTimers = new Map<string, number>();

    // Handle node drag start - close context menu
    const handleNodeDragStart = (e: any) => {
        console.log("[MoodboardCanvas] ===== NODE DRAG START =====");
        console.log("[MoodboardCanvas] Event:", e);
        console.log("[MoodboardCanvas] Target node:", e.targetNode);
        console.log("[MoodboardCanvas] Closing context menu");
        onCloseContextMenu?.();
    };

    // Handle node drag end - save position with debouncing
    const handleNodeDragStop = (e: any) => {
        const draggedNode = e.targetNode;
        if (!draggedNode) {
            console.log("[MoodboardCanvas] No target node in drag stop event");
            return;
        }

        const nodeId = draggedNode.id;
        const newX = draggedNode.position.x;
        const newY = draggedNode.position.y;

        console.log(
            `[MoodboardCanvas] Node ${nodeId} drag stopped at (${newX}, ${newY})`,
        );
        console.log(`[MoodboardCanvas] Drag event:`, e);

        // Clear existing debounce timer for this node
        const existingTimer = debounceTimers.get(nodeId);
        if (existingTimer) {
            console.log(
                `[MoodboardCanvas] Clearing existing timer for node ${nodeId}`,
            );
            clearTimeout(existingTimer);
        }

        // Set new debounced save (300ms)
        const timer = setTimeout(async () => {
            try {
                console.log(
                    `[MoodboardCanvas] Saving position for node ${nodeId}: (${newX}, ${newY})`,
                );
                await moodboardsService.updateNode(nodeId, {
                    positionX: newX,
                    positionY: newY,
                });
                console.log(
                    `[MoodboardCanvas] Successfully saved position for node ${nodeId}`,
                );

                // Notify parent if callback provided
                if (onPositionChange) {
                    console.log(
                        `[MoodboardCanvas] Calling onPositionChange callback for node ${nodeId}`,
                    );
                    onPositionChange(nodeId, newX, newY);
                } else {
                    console.log(
                        `[MoodboardCanvas] WARNING: No onPositionChange callback provided`,
                    );
                }

                debounceTimers.delete(nodeId);
            } catch (error) {
                console.error(
                    "[MoodboardCanvas] Failed to save node position:",
                    error,
                );
            }
        }, 300);

        debounceTimers.set(nodeId, timer);
    };

    // Handle node resize - save dimensions with debouncing
    const handleNodeResize = (event: any, node: Node) => {
        const nodeId = node.id;

        console.log(
            "[MoodboardCanvas] Resize event triggered for node:",
            nodeId,
        );
        console.log("[MoodboardCanvas] Event details:", event);
        console.log("[MoodboardCanvas] Node object:", node);
        console.log("[MoodboardCanvas] Node.style:", node.style);
        console.log("[MoodboardCanvas] Node.measured:", node.measured);

        const width = node.style?.width
            ? parseInt(node.style.width as string)
            : node.measured?.width;
        const height = node.style?.height
            ? parseInt(node.style.height as string)
            : node.measured?.height;

        console.log(
            `[MoodboardCanvas] Calculated dimensions - width=${width}, height=${height}`,
        );

        if (!width || !height) {
            console.log(
                "[MoodboardCanvas] No width/height found, skipping resize save",
            );
            return;
        }

        // Clear existing debounce timer
        const existingTimer = debounceTimers.get(`${nodeId}-resize`);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Set new debounced save (300ms)
        const timer = setTimeout(async () => {
            try {
                console.log(
                    `Saving size for node ${nodeId}: ${Math.round(width)}x${Math.round(height)}`,
                );
                await moodboardsService.updateNode(nodeId, {
                    width: Math.round(width),
                    height: Math.round(height),
                });
                console.log(`Successfully saved size for node ${nodeId}`);

                debounceTimers.delete(`${nodeId}-resize`);
            } catch (error) {
                console.error("Failed to save node size:", error);
            }
        }, 300);

        debounceTimers.set(`${nodeId}-resize`, timer);
    };
</script>

<div
    class="h-full w-full"
    oncontextmenu={(e) => {
        // Handle context menu on canvas background
        const target = e.target as HTMLElement;
        if (!target.closest("[data-id]")) {
            e.preventDefault();
            onCanvasContextMenu?.({ x: e.clientX, y: e.clientY });
        }
    }}
>
    <SvelteFlow
        nodes={flowNodes}
        {edges}
        {nodeTypes}
        fitView={nodes.length > 0}
        fitViewOptions={{ padding: 0.2, duration: 200 }}
        nodesConnectable={false}
        nodesDraggable={true}
        panOnDrag={[1, 2]}
        selectionOnDrag={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        preventScrolling={true}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        snapToGrid={true}
        snapGrid={[20, 20]}
        onnodedragstart={handleNodeDragStart}
        onnodedrag={(e, node) => {
            console.log(
                "[MoodboardCanvas] onnodedrag event - e:",
                e,
                "node:",
                node,
            );
        }}
        onnodedragstop={handleNodeDragStop}
        onnoderesize={handleNodeResize}
    >
        <Background variant="dots" gap={18} size={1} />
        <Controls showInteractive={false} />
    </SvelteFlow>
</div>
