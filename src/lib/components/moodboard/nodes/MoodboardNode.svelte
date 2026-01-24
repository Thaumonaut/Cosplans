<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NodeResizer } from "@xyflow/svelte";
    import type { MoodboardNode } from "$lib/types/domain/moodboard";
    import GroupNode from "./GroupNode.svelte";
    import CharacterNode from "./CharacterNode.svelte";
    import MoodboardLinkNode from "./MoodboardLinkNode.svelte";
    import ContainerDetailsNode from "./ContainerDetailsNode.svelte";

    interface Props {
        id: string;
        selected?: boolean;
        data: {
            node: MoodboardNode;
            childCount?: number;
            onSelect?: (node: MoodboardNode) => void;
            onEdit?: (node: MoodboardNode) => void;
            onUpdate?: (nodeId: string, updates: any) => void;
            onDelete?: (node: MoodboardNode) => void;
            onDuplicate?: (node: MoodboardNode) => void;
            onDrillIn?: (nodeId: string) => void;
            onContextMenu?: (
                node: MoodboardNode,
                position: { x: number; y: number },
            ) => void;
        };
    }

    let { data, selected = false }: Props = $props();

    const dispatch = createEventDispatcher<{ select: MoodboardNode }>();

    function resolveTypeLabel(node: MoodboardNode | undefined) {
        const nodeType = node?.nodeType;
        switch (nodeType) {
            case "container":
                return node?.containerType
                    ? `${node.containerType} container`
                    : "container";
            case "social_media":
                return "social media";
            case "moodboard_link":
                return "moodboard link";
            case "container_details":
                return "details";
            default:
                return nodeType || "item";
        }
    }

    const typeLabel = $derived(resolveTypeLabel(data?.node));

    const title = $derived(
        data?.node.title ||
            data?.node.shortComment ||
            data?.node.longNote ||
            data?.node.contentUrl ||
            "Untitled",
    );

    const tags = $derived(data?.node.tags ?? []);

    // Check if this is a container node
    const isContainer = $derived(
        data?.node.nodeType === "container" ||
            data?.node.nodeType === "moodboard_link",
    );

    let longPressTimer: number | null = null;
    let lastTouchPoint: { x: number; y: number } | null = null;
    let nodeElement = $state<HTMLDivElement | null>(null);

    function handleSelect(event: MouseEvent) {
        event.stopPropagation();
        data?.onSelect?.(data.node);
        dispatch("select", data.node);
    }

    function openMenu(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        console.log(
            "[MoodboardNode] Right-click menu requested for node:",
            data.node.id,
        );
        console.log("[MoodboardNode] Click position:", {
            x: event.clientX,
            y: event.clientY,
        });

        // Use the actual click position for the context menu
        if (data.onContextMenu) {
            data.onContextMenu(data.node, {
                x: event.clientX,
                y: event.clientY,
            });
        } else {
            console.log(
                "[MoodboardNode] WARNING: No onContextMenu callback provided",
            );
        }
    }

    function startLongPress(event: TouchEvent) {
        if (longPressTimer) return;
        const touch = event.touches[0];
        lastTouchPoint = touch ? { x: touch.clientX, y: touch.clientY } : null;
        longPressTimer = window.setTimeout(() => {
            const rect = nodeElement?.getBoundingClientRect();
            if (data.onContextMenu) {
                if (lastTouchPoint) {
                    data.onContextMenu(data.node, lastTouchPoint);
                } else if (rect) {
                    data.onContextMenu(data.node, {
                        x: rect.left + rect.width,
                        y: rect.top + rect.height,
                    });
                }
            }
            longPressTimer = null;
        }, 500);
    }

    function cancelLongPress() {
        if (longPressTimer) {
            window.clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }

    // Get child count from data (passed from canvas)
    const childCount = $derived(data.childCount || 0);
    const budgetTotal = 0; // TODO: Calculate from children budget items

    // Track hover state for showing resize handles
    let isHovering = $state(false);
</script>

<div
    bind:this={nodeElement}
    class={`relative h-full rounded-lg border bg-white px-3 py-2 shadow-sm transition
    ${selected ? "border-primary-500 ring-2 ring-primary-200" : "border-gray-200"}
    dark:border-gray-700 dark:bg-gray-800`}
    onclick={handleSelect}
    oncontextmenu={openMenu}
    ontouchstart={startLongPress}
    ontouchend={cancelLongPress}
    ontouchcancel={cancelLongPress}
    onmouseenter={() => {
        isHovering = true;
    }}
    onmouseleave={() => {
        isHovering = false;
    }}
>
    <!-- Node Resizer - show when selected or hovering -->
    {#if selected || isHovering}
        <NodeResizer
            minWidth={200}
            minHeight={100}
            maxWidth={1200}
            maxHeight={800}
            color="rgb(99, 102, 241)"
            handleStyle={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                border: "3px solid rgb(99, 102, 241)",
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            lineStyle={{ borderColor: "rgb(99, 102, 241)", borderWidth: "2px" }}
            isVisible={true}
        />
    {/if}

    <div class="mb-2">
        <span class="text-xs uppercase tracking-wide text-gray-400"
            >{typeLabel}</span
        >
    </div>

    <!-- Render specialized container component if it's a container -->
    {#if isContainer}
        {#if data.node.nodeType === "moodboard_link"}
            <MoodboardLinkNode
                node={data.node}
                onClick={() => {
                    // For moodboard links, navigate to the linked moodboard
                    if (data.node.linkedMoodboardId) {
                        window.location.href = `/moodboard/${data.node.linkedMoodboardId}`;
                    }
                }}
            />
        {:else if data.node.containerType === "character"}
            <CharacterNode
                node={data.node}
                {childCount}
                {budgetTotal}
                onClick={() => data.onDrillIn?.(data.node.id)}
            />
        {:else}
            <GroupNode
                node={data.node}
                {childCount}
                {budgetTotal}
                onClick={() => data.onDrillIn?.(data.node.id)}
            />
        {/if}
    {:else}
        <!-- Generic node content for non-containers -->
        {#if data.node.nodeType === "container_details"}
            <!-- Container details node: show custom fields and metadata -->
            <ContainerDetailsNode
                node={data.node}
                onUpdate={(updates) => {
                    // Use onUpdate to save changes directly
                    data.onUpdate?.(data.node.id, updates);
                }}
            />
        {:else if data.node.nodeType === "note"}
            <!-- Note node: show full content -->
            {#if data.node.title}
                <h3
                    class="text-sm font-semibold text-gray-900 dark:text-white mb-1"
                >
                    {data.node.title}
                </h3>
            {/if}
            {#if data.node.longNote || data.node.shortComment}
                <p
                    class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                >
                    {data.node.longNote || data.node.shortComment}
                </p>
            {/if}
        {:else}
            <!-- Other node types: show title and URL -->
            <div class="text-sm font-medium text-gray-900 dark:text-white">
                {title}
            </div>

            {#if data?.node.contentUrl}
                <div
                    class="mt-1 text-xs text-gray-500 dark:text-gray-400 break-all"
                >
                    {data.node.contentUrl}
                </div>
            {/if}
        {/if}

        {#if tags.length > 0}
            <div class="mt-2 flex flex-wrap gap-1">
                {#each tags as tag}
                    <span
                        class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                        {tag}
                    </span>
                {/each}
            </div>
        {/if}
    {/if}
</div>
