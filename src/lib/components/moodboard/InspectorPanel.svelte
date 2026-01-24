<script lang="ts">
    /**
     * InspectorPanel Component
     * Task: T-038
     *
     * Right-side panel (desktop) or bottom sheet (mobile) for inspecting
     * and editing selected node/container details.
     */
    import type { MoodboardNode, MoodboardNodeUpdate } from "$lib/types/domain/moodboard";
    import { Sheet } from "$lib/components/ui";
    import { Tabs, TabsList, TabsTrigger, TabsContent } from "$lib/components/ui";
    import { Button, Badge, Spinner } from "flowbite-svelte";
    import InlineTextEditor from "$lib/components/base/InlineTextEditor.svelte";
    import TagSelector from "$lib/components/base/TagSelector.svelte";
    import { XMarkSolid, PinSolid, PinOutline } from "flowbite-svelte-icons";
    import { cn } from "$lib/utils";

    interface Props {
        node: MoodboardNode | null;
        open?: boolean;
        pinned?: boolean;
        parentContext?: string | null; // Parent container name for context
        onClose?: () => void;
        onUpdate?: (nodeId: string, updates: MoodboardNodeUpdate) => Promise<void>;
        onTogglePin?: () => void;
        className?: string;
    }

    let {
        node = $bindable(null),
        open = $bindable(false),
        pinned = $bindable(false),
        parentContext = null,
        onClose,
        onUpdate,
        onTogglePin,
        className = "",
    }: Props = $props();

    // Responsive breakpoint
    let isMobile = $state(false);
    let panelWidth = $state(300); // Default width in pixels
    let isResizing = $state(false);
    let activeTab = $state("details");
    let saving = $state(false);

    // Check if mobile on mount and on resize
    $effect(() => {
        function checkMobile() {
            isMobile = window.innerWidth < 768; // md breakpoint
        }
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    });

    // Auto-close when node is deselected (unless pinned)
    $effect(() => {
        if (!node && !pinned) {
            open = false;
        }
    });

    // Handle save for inline editors
    async function handleSave(field: keyof MoodboardNodeUpdate, value: any) {
        if (!node || !onUpdate) return;
        saving = true;
        try {
            await onUpdate(node.id, { [field]: value });
        } catch (err) {
            console.error(`Failed to update ${String(field)}:`, err);
        } finally {
            saving = false;
        }
    }

    // Node type label formatting
    function formatNodeType(nodeType: string): string {
        return nodeType
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    // Get badge color based on node type
    function getBadgeColor(nodeType: string): string {
        if (nodeType === "container") return "blue";
        if (nodeType === "social_media") return "purple";
        if (nodeType === "image") return "green";
        if (nodeType === "note") return "yellow";
        if (nodeType === "link") return "indigo";
        return "gray";
    }

    // Resize handler for desktop
    function startResize() {
        isResizing = true;
        document.body.style.cursor = "ew-resize";
        document.addEventListener("mousemove", handleResize);
        document.addEventListener("mouseup", stopResize);
    }

    function handleResize(e: MouseEvent) {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        // Constrain between 250px and 500px
        panelWidth = Math.max(250, Math.min(500, newWidth));
    }

    function stopResize() {
        isResizing = false;
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", stopResize);
    }

    function handleClose() {
        open = false;
        onClose?.();
    }
</script>

{#if isMobile}
    <!-- Mobile: Bottom sheet -->
    <Sheet bind:open side="bottom" class="h-[80vh]">
        <div class="p-4 h-full flex flex-col">
            {#if node}
                <!-- Header -->
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-2">
                        <Badge color={getBadgeColor(node.nodeType)}>
                            {formatNodeType(node.nodeType)}
                        </Badge>
                        {#if node.containerType}
                            <Badge color="light">{node.containerType}</Badge>
                        {/if}
                    </div>
                    <div class="flex items-center gap-2">
                        <Button
                            size="xs"
                            color="alternative"
                            onclick={onTogglePin}
                            title={pinned ? "Unpin panel" : "Pin panel"}
                        >
                            {#if pinned}
                                <PinSolid class="w-3 h-3" />
                            {:else}
                                <PinOutline class="w-3 h-3" />
                            {/if}
                        </Button>
                    </div>
                </div>

                <!-- Parent context (if inside container) -->
                {#if parentContext}
                    <div class="mb-3 text-xs text-gray-500 dark:text-gray-400">
                        Inside: <span class="font-medium">{parentContext}</span>
                    </div>
                {/if}

                <!-- Tabs -->
                <Tabs bind:value={activeTab} className="flex-1 flex flex-col overflow-hidden">
                    {#snippet children({ value, setValue })}
                        <TabsList class="mb-3">
                            <TabsTrigger value="details" onclick={() => setValue("details")}>
                                Details
                            </TabsTrigger>
                            <TabsTrigger value="connections" onclick={() => setValue("connections")} disabled>
                                Connections
                            </TabsTrigger>
                        </TabsList>

                        <div class="flex-1 overflow-auto">
                            <TabsContent value="details">
                                <div class="space-y-4">
                                    <!-- Title -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Title
                                        </label>
                                        <InlineTextEditor
                                            bind:value={node.title}
                                            placeholder="Untitled"
                                            variant="body"
                                            onSave={(val) => handleSave("title", val)}
                                        />
                                    </div>

                                    <!-- Short comment -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Comment
                                        </label>
                                        <InlineTextEditor
                                            bind:value={node.shortComment}
                                            placeholder="Add a short comment..."
                                            variant="caption"
                                            onSave={(val) => handleSave("shortComment", val)}
                                        />
                                    </div>

                                    <!-- Long note -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Notes
                                        </label>
                                        <InlineTextEditor
                                            bind:value={node.longNote}
                                            placeholder="Add detailed notes..."
                                            variant="body"
                                            multiline
                                            onSave={(val) => handleSave("longNote", val)}
                                        />
                                    </div>

                                    <!-- Tags -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tags
                                        </label>
                                        <TagSelector
                                            bind:tags={node.tags}
                                            onSave={(tags) => handleSave("tags", tags)}
                                        />
                                    </div>

                                    <!-- Content URL (if applicable) -->
                                    {#if node.contentUrl}
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Content URL
                                            </label>
                                            <a
                                                href={node.contentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                                            >
                                                {node.contentUrl}
                                            </a>
                                        </div>
                                    {/if}

                                    <!-- Metadata preview -->
                                    {#if node.metadata && Object.keys(node.metadata).length > 0}
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Metadata
                                            </label>
                                            <pre class="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
{JSON.stringify(node.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    {/if}
                                </div>
                            </TabsContent>

                            <TabsContent value="connections">
                                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p class="text-sm">Connections coming in v1.5</p>
                                </div>
                            </TabsContent>
                        </div>
                    {/snippet}
                </Tabs>

                {#if saving}
                    <div class="mt-3 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        <Spinner size="4" class="mr-2" />
                        Saving...
                    </div>
                {/if}
            {:else}
                <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p>No node selected</p>
                </div>
            {/if}
        </div>
    </Sheet>
{:else}
    <!-- Desktop: Fixed right panel -->
    {#if open}
        <aside
            class={cn(
                "fixed top-0 right-0 h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-lg z-40",
                className
            )}
            style="width: {panelWidth}px;"
        >
            <!-- Resize handle -->
            <div
                class="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors"
                role="separator"
                onmousedown={startResize}
            ></div>

            {#if node}
                <!-- Header -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-2">
                        <Badge color={getBadgeColor(node.nodeType)}>
                            {formatNodeType(node.nodeType)}
                        </Badge>
                        {#if node.containerType}
                            <Badge color="light">{node.containerType}</Badge>
                        {/if}
                    </div>
                    <div class="flex items-center gap-2">
                        <Button
                            size="xs"
                            color="alternative"
                            onclick={onTogglePin}
                            title={pinned ? "Unpin panel" : "Pin panel"}
                        >
                            {#if pinned}
                                <PinSolid class="w-3 h-3" />
                            {:else}
                                <PinOutline class="w-3 h-3" />
                            {/if}
                        </Button>
                        <Button
                            size="xs"
                            color="alternative"
                            onclick={handleClose}
                            title="Close panel"
                        >
                            <XMarkSolid class="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                <!-- Parent context (if inside container) -->
                {#if parentContext}
                    <div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                        Inside: <span class="font-medium">{parentContext}</span>
                    </div>
                {/if}

                <!-- Tabs -->
                <div class="flex-1 overflow-hidden flex flex-col">
                    <Tabs bind:value={activeTab} className="flex-1 flex flex-col overflow-hidden">
                        {#snippet children({ value, setValue })}
                            <TabsList class="mx-4 mt-3 mb-0">
                                <TabsTrigger value="details" onclick={() => setValue("details")}>
                                    Details
                                </TabsTrigger>
                                <TabsTrigger value="connections" onclick={() => setValue("connections")} disabled>
                                    Connections
                                </TabsTrigger>
                            </TabsList>

                            <div class="flex-1 overflow-auto px-4 py-3">
                                <TabsContent value="details">
                                    <div class="space-y-4">
                                        <!-- Title -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Title
                                            </label>
                                            <InlineTextEditor
                                                bind:value={node.title}
                                                placeholder="Untitled"
                                                variant="body"
                                                onSave={(val) => handleSave("title", val)}
                                            />
                                        </div>

                                        <!-- Short comment -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Comment
                                            </label>
                                            <InlineTextEditor
                                                bind:value={node.shortComment}
                                                placeholder="Add a short comment..."
                                                variant="caption"
                                                onSave={(val) => handleSave("shortComment", val)}
                                            />
                                        </div>

                                        <!-- Long note -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Notes
                                            </label>
                                            <InlineTextEditor
                                                bind:value={node.longNote}
                                                placeholder="Add detailed notes..."
                                                variant="body"
                                                multiline
                                                onSave={(val) => handleSave("longNote", val)}
                                            />
                                        </div>

                                        <!-- Tags -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Tags
                                            </label>
                                            <TagSelector
                                                bind:tags={node.tags}
                                                onSave={(tags) => handleSave("tags", tags)}
                                            />
                                        </div>

                                        <!-- Content URL (if applicable) -->
                                        {#if node.contentUrl}
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Content URL
                                                </label>
                                                <a
                                                    href={node.contentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                                                >
                                                    {node.contentUrl}
                                                </a>
                                            </div>
                                        {/if}

                                        <!-- Metadata preview -->
                                        {#if node.metadata && Object.keys(node.metadata).length > 0}
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Metadata
                                                </label>
                                                <pre class="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
{JSON.stringify(node.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        {/if}
                                    </div>
                                </TabsContent>

                                <TabsContent value="connections">
                                    <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <p class="text-sm">Connections coming in v1.5</p>
                                    </div>
                                </TabsContent>
                            </div>
                        {/snippet}
                    </Tabs>
                </div>

                {#if saving}
                    <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        <Spinner size="4" class="mr-2" />
                        Saving...
                    </div>
                {/if}
            {:else}
                <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p>No node selected</p>
                </div>
            {/if}
        </aside>
    {/if}
{/if}
