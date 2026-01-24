<script lang="ts">
    /**
     * Moodboard Editor Page
     * Route: /moodboard/[id]
     * Task: T-005, T-006
     *
     * Full-screen moodboard editor with Canvas, Gallery, and List views.
     * Supports hierarchical navigation via ?parent=[node_id] query param.
     * Includes CRUD operations for nodes.
     */
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { moodboardsService } from "$lib/api/services/moodboardsService";
    import type {
        Moodboard,
        MoodboardNode,
        MoodboardNodeCreate,
        MoodboardNodeUpdate,
    } from "$lib/types/domain/moodboard";
    import Breadcrumbs from "$lib/components/base/Breadcrumbs.svelte";
    import ConfirmDialog from "$lib/components/base/ConfirmDialog.svelte";
    import AddNodeModal from "$lib/components/moodboard/AddNodeModal.svelte";
    import EditNodeModal from "$lib/components/moodboard/EditNodeModal.svelte";
    import MoodboardCanvas from "$lib/components/moodboard/MoodboardCanvas.svelte";
    import NodeCard from "$lib/components/moodboard/NodeCard.svelte";
    import ContextMenu from "$lib/components/moodboard/ContextMenu.svelte";
    import ContainerDropZone from "$lib/components/moodboard/ContainerDropZone.svelte";
    import InspectorPanel from "$lib/components/moodboard/InspectorPanel.svelte";
    import { Button, Spinner, ButtonGroup } from "flowbite-svelte";
    import {
        GridSolid,
        GridOutline,
        ListOutline,
        CirclePlusSolid,
        ShareNodesSolid,
        ChevronLeftOutline,
    } from "flowbite-svelte-icons";

    // Route params
    const moodboardId = $derived($page.params.id);
    const parentId = $derived($page.url.searchParams.get("parent"));

    // State
    let loading = $state(true);
    let error = $state<string | null>(null);
    let moodboard = $state<Moodboard | null>(null);
    let nodes = $state<MoodboardNode[]>([]);
    let breadcrumbPath = $state<MoodboardNode[]>([]);
    let childCounts = $state<Map<string, number>>(new Map());
    let viewMode = $state<"canvas" | "gallery" | "list">("gallery"); // Default to gallery for now

    // Modal states
    let showAddModal = $state(false);
    let showEditModal = $state(false);
    let showDeleteConfirm = $state(false);
    let editingNode = $state<MoodboardNode | null>(null);
    let deletingNode = $state<MoodboardNode | null>(null);
    let deleteLoading = $state(false);
    let selectedNode = $state<MoodboardNode | null>(null);

    // Context menu state (managed globally to ensure only one is open)
    let contextMenuOpen = $state(false);
    let contextMenuNode = $state<MoodboardNode | null>(null);
    let contextMenuPosition = $state({ x: 0, y: 0 });

    // Inspector panel state (T-038)
    let inspectorOpen = $state(false);
    let inspectorPinned = $state(false);

    // Load view preference from localStorage
    onMount(() => {
        const savedView = localStorage.getItem(`moodboard-view-${moodboardId}`);
        if (savedView && ["canvas", "gallery", "list"].includes(savedView)) {
            viewMode = savedView as "canvas" | "gallery" | "list";
        }
    });

    // Save view preference
    function setViewMode(mode: "canvas" | "gallery" | "list") {
        viewMode = mode;
        localStorage.setItem(`moodboard-view-${moodboardId}`, mode);
    }

    // Load moodboard data
    async function loadMoodboard() {
        loading = true;
        error = null;

        try {
            const data = await moodboardsService.getMoodboardData(
                moodboardId,
                parentId,
            );

            if (!data.moodboard) {
                error = "Moodboard not found";
                loading = false;
                return;
            }

            moodboard = data.moodboard;
            nodes = data.nodes;
            breadcrumbPath = data.path;
            childCounts = data.childCounts;

            console.log("[Page] Loaded moodboard with", nodes.length, "nodes");
            console.log(
                "[Page] Node positions:",
                nodes.map((n) => ({
                    id: n.id,
                    title: n.title,
                    x: n.positionX,
                    y: n.positionY,
                    width: n.width,
                    height: n.height,
                })),
            );
        } catch (err) {
            console.error("Failed to load moodboard:", err);
            error =
                err instanceof Error ? err.message : "Failed to load moodboard";
        } finally {
            loading = false;
        }
    }

    // Reload when params change
    $effect(() => {
        if (moodboardId) {
            loadMoodboard();
        }
    });

    // Navigate to a container node
    function drillInto(nodeId: string) {
        goto(`/moodboard/${moodboardId}?parent=${nodeId}`);
    }

    // Navigate up one level
    function navigateUp() {
        if (breadcrumbPath.length > 1) {
            const parentNode = breadcrumbPath[breadcrumbPath.length - 2];
            goto(`/moodboard/${moodboardId}?parent=${parentNode.id}`);
        } else {
            goto(`/moodboard/${moodboardId}`);
        }
    }

    // Build breadcrumb items for UI
    const breadcrumbItems = $derived(() => {
        const items = [
            {
                label: moodboard?.title || "Moodboard",
                href: `/moodboard/${moodboardId}`,
            },
        ];

        for (const node of breadcrumbPath) {
            items.push({
                label: node.title || node.containerType || "Container",
                href: `/moodboard/${moodboardId}?parent=${node.id}`,
            });
        }

        return items;
    });

    // Get owner type label for subtitle
    function getOwnerLabel(m: Moodboard): string {
        switch (m.ownerType) {
            case "user":
                return "Personal";
            case "team":
                return "Team";
            case "idea":
                return "Idea";
            case "project":
                return "Project";
            default:
                return "";
        }
    }

    // CRUD Operations
    async function handleAddNode(nodeCreate: MoodboardNodeCreate) {
        const ideaId =
            moodboard?.ownerType === "idea" ? moodboard.ownerId : undefined;
        const newNode = await moodboardsService.createNode({
            ...nodeCreate,
            ideaId: nodeCreate.ideaId ?? ideaId,
        });
        nodes = [...nodes, newNode];

        // Auto-create child nodes for all containers
        if (newNode.nodeType === "container") {
            const childNodes: MoodboardNode[] = [];

            // 1. Create a container_details node with metadata
            const containerMetadata = newNode.metadata as any;
            const detailsMetadata: any = {
                container_type: newNode.containerType,
                description: "",
                custom_fields: [],
            };

            // Copy character-specific metadata if it's a character container
            if (newNode.containerType === "character") {
                detailsMetadata.character_name =
                    containerMetadata?.character_name;
                detailsMetadata.series_name = containerMetadata?.series_name;
                detailsMetadata.variant = containerMetadata?.variant;
                detailsMetadata.character_image_url =
                    containerMetadata?.character_image_url;
            }

            const detailsNode = await moodboardsService.createNode({
                moodboardId,
                parentId: newNode.id,
                ideaId,
                nodeType: "container_details",
                title: "Details",
                metadata: detailsMetadata,
                positionX: 50,
                positionY: 50,
            });
            childNodes.push(detailsNode);

            // 2. Create project/idea reference node if linked to project or idea
            if (
                moodboard?.ownerType === "project" ||
                moodboard?.ownerType === "idea"
            ) {
                const referenceNote = await moodboardsService.createNode({
                    moodboardId,
                    parentId: newNode.id,
                    ideaId,
                    nodeType: "note",
                    title: `${moodboard.ownerType === "project" ? "Project" : "Idea"} Reference`,
                    longNote: `This character is part of ${moodboard.ownerType === "project" ? "project" : "idea"}: ${moodboard.title || "Untitled"}`,
                    shortComment: `Linked to ${moodboard.ownerType}`,
                    metadata: {
                        reference_type: moodboard.ownerType,
                        reference_id: moodboard.ownerId,
                    },
                    positionX: 400,
                    positionY: 50,
                });
                childNodes.push(referenceNote);
            }

            // Add child nodes to the nodes array
            nodes = [...nodes, ...childNodes];

            // Update child count
            const nodeIds = nodes.map((n) => n.id);
            childCounts = await moodboardsService.getChildCounts(nodeIds);
        }
    }

    async function handleUpdateNode(
        nodeId: string,
        updates: MoodboardNodeUpdate,
    ) {
        const updatedNode = await moodboardsService.updateNode(nodeId, updates);
        if (updatedNode) {
            nodes = nodes.map((n) => (n.id === nodeId ? updatedNode : n));
        }
    }

    async function handleDuplicateNode(node: MoodboardNode) {
        try {
            const duplicated = await moodboardsService.createNode({
                moodboardId,
                parentId: node.parentId ?? undefined,
                ideaId: node.ideaId ?? undefined,
                referenceId: node.referenceId ?? null,
                nodeType: node.nodeType,
                containerType: node.containerType ?? undefined,
                linkedMoodboardId: node.linkedMoodboardId ?? undefined,
                title: node.title ?? undefined,
                contentUrl: node.contentUrl ?? undefined,
                thumbnailUrl: node.thumbnailUrl ?? undefined,
                metadata: node.metadata ?? undefined,
                tags: node.tags ?? [],
                shortComment: node.shortComment ?? undefined,
                longNote: node.longNote ?? undefined,
                positionX: node.positionX + 24,
                positionY: node.positionY + 24,
                width: node.width ?? undefined,
                height: node.height ?? undefined,
                zIndex: node.zIndex ?? undefined,
                isExpanded: node.isExpanded ?? undefined,
            });

            nodes = [...nodes, duplicated];
        } catch (err) {
            console.error("Failed to duplicate node:", err);
            error =
                err instanceof Error ? err.message : "Failed to duplicate node";
        }
    }

    async function handleDeleteNode() {
        if (!deletingNode) return;

        deleteLoading = true;
        try {
            await moodboardsService.deleteNode(deletingNode.id);
            nodes = nodes.filter((n) => n.id !== deletingNode?.id);
            showDeleteConfirm = false;
            deletingNode = null;
        } catch (err) {
            console.error("Failed to delete node:", err);
            error = err instanceof Error ? err.message : "Failed to delete";
        } finally {
            deleteLoading = false;
        }
    }

    function openEditModal(node: MoodboardNode) {
        contextMenuOpen = false; // Close context menu when opening edit
        editingNode = node;
        showEditModal = true;
    }

    function openDeleteConfirm(node: MoodboardNode) {
        contextMenuOpen = false; // Close context menu when opening delete
        deletingNode = node;
        showDeleteConfirm = true;
    }

    function handleSelectNode(node: MoodboardNode) {
        selectedNode = node;
        // Open inspector when node is selected (T-038)
        inspectorOpen = true;
    }

    function handleInspectorClose() {
        if (!inspectorPinned) {
            inspectorOpen = false;
            selectedNode = null;
        }
    }

    function handleToggleInspectorPin() {
        inspectorPinned = !inspectorPinned;
    }

    function openContextMenu(
        node: MoodboardNode,
        position: { x: number; y: number },
    ) {
        console.log(
            "[Page] Opening context menu for node:",
            node.id,
            "at position:",
            position,
        );
        console.log(
            "[Page] Previous context menu state - open:",
            contextMenuOpen,
            "node:",
            contextMenuNode?.id,
        );

        // Close any existing context menu and open new one
        contextMenuNode = node;
        contextMenuPosition = position;
        contextMenuOpen = true;

        console.log(
            "[Page] New context menu state - open:",
            contextMenuOpen,
            "node:",
            contextMenuNode?.id,
        );
    }

    function closeContextMenu() {
        console.log("[Page] Closing context menu");
        contextMenuOpen = false;
        contextMenuNode = null;
    }

    function openCanvasContextMenu(position: { x: number; y: number }) {
        console.log(
            "[Page] Opening canvas context menu at position:",
            position,
        );
        // Open context menu for canvas background
        contextMenuNode = null;
        contextMenuPosition = position;
        contextMenuOpen = true;
    }

    function handlePositionChange(nodeId: string, x: number, y: number) {
        console.log(
            "[Page] handlePositionChange called for node:",
            nodeId,
            "new position:",
            { x, y },
        );

        // Update local node positions when dragged on canvas
        const oldNode = nodes.find((n) => n.id === nodeId);
        console.log("[Page] Old position:", {
            x: oldNode?.positionX,
            y: oldNode?.positionY,
        });

        nodes = nodes.map((n) =>
            n.id === nodeId ? { ...n, positionX: x, positionY: y } : n,
        );

        const updatedNode = nodes.find((n) => n.id === nodeId);
        console.log("[Page] Updated position:", {
            x: updatedNode?.positionX,
            y: updatedNode?.positionY,
        });
    }

    function getDeleteMessage(node: MoodboardNode | null): string {
        if (!node) return "";
        if (node.nodeType === "container") {
            return `Are you sure you want to delete "${node.title || "this container"}"? All items inside will also be deleted.`;
        }
        return `Are you sure you want to delete "${node.title || node.shortComment || "this item"}"?`;
    }

    // Drag-and-drop handlers (T-037)
    async function handleMoveToContainer(nodeId: string, containerId: string) {
        try {
            await moodboardsService.moveNode(nodeId, containerId);
            // Reload to reflect changes
            await loadMoodboard();
        } catch (err) {
            console.error("Failed to move node to container:", err);
            error = err instanceof Error ? err.message : "Failed to move node";
        }
    }

    async function handleMoveToParent(nodeId: string) {
        try {
            // Get the current parent's parent (grandparent)
            const currentNode = nodes.find((n) => n.id === nodeId);
            if (!currentNode) return;

            // Move to the parent of the current parent (or null for root)
            const grandparentId =
                breadcrumbPath.length > 0
                    ? (breadcrumbPath[breadcrumbPath.length - 1]?.parentId ??
                      null)
                    : null;

            await moodboardsService.moveNode(nodeId, grandparentId);
            // Reload to reflect changes
            await loadMoodboard();
        } catch (err) {
            console.error("Failed to move node to parent:", err);
            error = err instanceof Error ? err.message : "Failed to move node";
        }
    }
</script>

<svelte:head>
    <title>{moodboard?.title || "Moodboard"} - Cosplans</title>
</svelte:head>

<div class="flex flex-col h-full">
    <!-- Header -->
    <div
        class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3"
    >
        <div class="flex items-center justify-between">
            <!-- Left: Back button and breadcrumbs -->
            <div class="flex items-center gap-3">
                {#if parentId}
                    <Button size="sm" color="alternative" onclick={navigateUp}>
                        <ChevronLeftOutline class="w-4 h-4 mr-1" />
                        Back
                    </Button>
                {/if}

                <div class="flex items-center gap-2">
                    <h1
                        class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        {moodboard?.title || "Moodboard"}
                    </h1>
                    {#if moodboard}
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            ({getOwnerLabel(moodboard)})
                        </span>
                    {/if}
                </div>
            </div>

            <!-- Center: View switcher -->
            <div class="flex items-center">
                <ButtonGroup>
                    <Button
                        size="sm"
                        color={viewMode === "canvas"
                            ? "primary"
                            : "alternative"}
                        onclick={() => setViewMode("canvas")}
                    >
                        <GridOutline class="w-4 h-4 mr-1" />
                        Canvas
                    </Button>
                    <Button
                        size="sm"
                        color={viewMode === "gallery"
                            ? "primary"
                            : "alternative"}
                        onclick={() => setViewMode("gallery")}
                    >
                        <GridSolid class="w-4 h-4 mr-1" />
                        Gallery
                    </Button>
                    <Button
                        size="sm"
                        color={viewMode === "list" ? "primary" : "alternative"}
                        onclick={() => setViewMode("list")}
                    >
                        <ListOutline class="w-4 h-4 mr-1" />
                        List
                    </Button>
                </ButtonGroup>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-2">
                <Button
                    size="sm"
                    color="primary"
                    onclick={() => (showAddModal = true)}
                >
                    <CirclePlusSolid class="w-4 h-4 mr-1" />
                    Add
                </Button>
                <Button size="sm" color="alternative">
                    <ShareNodesSolid class="w-4 h-4 mr-1" />
                    Share
                </Button>
            </div>
        </div>

        <!-- Breadcrumbs (when inside a container) -->
        {#if breadcrumbPath.length > 0}
            <div class="mt-2">
                <Breadcrumbs items={breadcrumbItems()} />
            </div>
        {/if}
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
        {#if loading}
            <div class="flex items-center justify-center h-full">
                <Spinner size="8" />
                <span class="ml-3 text-gray-600 dark:text-gray-400"
                    >Loading moodboard...</span
                >
            </div>
        {:else if error}
            <div class="p-6">
                <div
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                >
                    <p class="text-red-700 dark:text-red-400">{error}</p>
                </div>
            </div>
        {:else}
            <!-- View content -->
            {#if viewMode === "canvas"}
                <div class="h-full bg-gray-50 dark:bg-gray-900 relative">
                    {#if parentId}
                        <ContainerDropZone
                            visible={true}
                            isDragging={false}
                            onDrop={() => {
                                // TODO: Track dragged node for canvas drop
                                console.log(
                                    "Canvas drop zone clicked - implement node tracking",
                                );
                            }}
                        />
                    {/if}
                    <MoodboardCanvas
                        {nodes}
                        {childCounts}
                        onSelect={handleSelectNode}
                        onEdit={openEditModal}
                        onUpdate={handleUpdateNode}
                        onDelete={openDeleteConfirm}
                        onDuplicate={handleDuplicateNode}
                        onDrillIn={drillInto}
                        onContextMenu={openContextMenu}
                        onCanvasContextMenu={openCanvasContextMenu}
                        onCloseContextMenu={closeContextMenu}
                        onPositionChange={handlePositionChange}
                    />
                </div>
            {:else if viewMode === "gallery"}
                {#if nodes.length === 0}
                    <!-- Empty state for gallery -->
                    <div
                        class="flex flex-col items-center justify-center h-full text-center p-8"
                    >
                        <div
                            class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4"
                        >
                            <GridSolid class="w-8 h-8 text-gray-400" />
                        </div>
                        <h2
                            class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                        >
                            {parentId
                                ? "This container is empty"
                                : "Your moodboard is empty"}
                        </h2>
                        <p
                            class="text-gray-500 dark:text-gray-400 mb-4 max-w-md"
                        >
                            {parentId
                                ? "Add references, notes, or sub-containers to organize your inspiration."
                                : "Start collecting inspiration by adding images, links, or notes. You can also create containers to organize by character or prop."}
                        </p>
                        <Button
                            color="primary"
                            onclick={() => (showAddModal = true)}
                        >
                            <CirclePlusSolid class="w-4 h-4 mr-2" />
                            Add your first item
                        </Button>
                    </div>
                {:else}
                    <!-- Gallery view with NodeCard components -->
                    <div class="p-6 overflow-auto h-full">
                        <div
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            {#each nodes as node (node.id)}
                                <NodeCard
                                    {node}
                                    variant="gallery"
                                    onDrillIn={drillInto}
                                    onEdit={openEditModal}
                                    onDelete={openDeleteConfirm}
                                    onMoveToContainer={handleMoveToContainer}
                                    onclick={() => handleSelectNode(node)}
                                />
                            {/each}
                        </div>
                    </div>
                {/if}
            {:else if viewMode === "list"}
                {#if nodes.length === 0}
                    <!-- Empty state for list -->
                    <div
                        class="flex flex-col items-center justify-center h-full text-center p-8"
                    >
                        <div
                            class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4"
                        >
                            <GridSolid class="w-8 h-8 text-gray-400" />
                        </div>
                        <h2
                            class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                        >
                            {parentId
                                ? "This container is empty"
                                : "Your moodboard is empty"}
                        </h2>
                        <p
                            class="text-gray-500 dark:text-gray-400 mb-4 max-w-md"
                        >
                            {parentId
                                ? "Add references, notes, or sub-containers to organize your inspiration."
                                : "Start collecting inspiration by adding images, links, or notes. You can also create containers to organize by character or prop."}
                        </p>
                        <Button
                            color="primary"
                            onclick={() => (showAddModal = true)}
                        >
                            <CirclePlusSolid class="w-4 h-4 mr-2" />
                            Add your first item
                        </Button>
                    </div>
                {:else}
                    <!-- List view with NodeCard components -->
                    <div class="p-6 overflow-auto h-full">
                        <div
                            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            <table class="w-full">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Type
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Title
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Tags
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Date
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody
                                    class="divide-y divide-gray-200 dark:divide-gray-700"
                                >
                                    {#each nodes as node (node.id)}
                                        <NodeCard
                                            {node}
                                            variant="list"
                                            onDrillIn={drillInto}
                                            onEdit={openEditModal}
                                            onDelete={openDeleteConfirm}
                                            onclick={() =>
                                                handleSelectNode(node)}
                                        />
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                {/if}
            {/if}
        {/if}
    </div>

    <!-- Footer -->
    <div
        class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2"
    >
        <div
            class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
        >
            <span
                >{nodes.length} items{parentId
                    ? " in this container"
                    : ""}</span
            >
            {#if selectedNode}
                <span class="truncate max-w-[240px]">
                    Selected: {selectedNode.title ||
                        selectedNode.shortComment ||
                        "Untitled"}
                </span>
            {/if}
            <!-- Budget total will go here when implemented -->
        </div>
    </div>
</div>

<!-- Add Node Modal -->
<AddNodeModal
    bind:open={showAddModal}
    {moodboardId}
    {parentId}
    onClose={() => (showAddModal = false)}
    onSave={handleAddNode}
/>

<!-- Edit Node Modal -->
<EditNodeModal
    bind:open={showEditModal}
    node={editingNode}
    onClose={() => {
        showEditModal = false;
        editingNode = null;
    }}
    onSave={handleUpdateNode}
/>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
    bind:open={showDeleteConfirm}
    title="Delete Item"
    message={getDeleteMessage(deletingNode)}
    confirmText="Delete"
    variant="danger"
    loading={deleteLoading}
    on:confirm={handleDeleteNode}
    on:cancel={() => {
        showDeleteConfirm = false;
        deletingNode = null;
    }}
/>

<!-- Global Context Menu -->
<ContextMenu
    open={contextMenuOpen}
    x={contextMenuPosition.x}
    y={contextMenuPosition.y}
    items={contextMenuNode
        ? [
              { label: "Edit", onClick: () => openEditModal(contextMenuNode!) },
              {
                  label: "Duplicate",
                  onClick: () => handleDuplicateNode(contextMenuNode!),
              },
              {
                  label: "Delete",
                  onClick: () => openDeleteConfirm(contextMenuNode!),
                  variant: "danger",
              },
          ]
        : [
              { label: "Add Node", onClick: () => (showAddModal = true) },
              { label: "Paste", onClick: () => {}, disabled: true },
          ]}
    onClose={closeContextMenu}
/>

<!-- Inspector Panel (T-038) -->
<InspectorPanel
    bind:node={selectedNode}
    bind:open={inspectorOpen}
    bind:pinned={inspectorPinned}
    parentContext={breadcrumbPath.length > 0
        ? (breadcrumbPath[breadcrumbPath.length - 1]?.title ?? null)
        : null}
    onClose={handleInspectorClose}
    onUpdate={handleUpdateNode}
    onTogglePin={handleToggleInspectorPin}
/>
