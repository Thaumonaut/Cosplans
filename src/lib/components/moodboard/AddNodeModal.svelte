<script lang="ts">
    /**
     * Add Node Modal
     * Feature: 006-brainstorming-moodboard
     * Task: T-006
     *
     * Modal for adding new nodes to a moodboard.
     * Supports creating containers, notes, links, and image uploads.
     */
    import {
        Modal,
        Button,
        Input,
        Textarea,
        Label,
        Select,
    } from "flowbite-svelte";
    import {
        X,
        Folder,
        StickyNote,
        Link,
        Image,
        Users,
        Palette,
        Scissors,
    } from "lucide-svelte";
    import type {
        MoodboardNodeType,
        MoodboardNodeCreate,
        ContainerType,
    } from "$lib/types/domain/moodboard";
    import {
        detectPlatformFromUrl,
        determineNodeType,
    } from "$lib/types/domain/moodboard";

    interface Props {
        open?: boolean;
        moodboardId: string;
        parentId?: string | null;
        onClose: () => void;
        onSave: (node: MoodboardNodeCreate) => Promise<void>;
    }

    let {
        open = $bindable(false),
        moodboardId,
        parentId = null,
        onClose,
        onSave,
    }: Props = $props();

    // Form state
    let selectedType = $state<
        "container" | "note" | "link" | "image" | "moodboard_link"
    >("note");
    let containerType = $state<ContainerType>("group");
    let title = $state("");
    let content = $state(""); // URL for link, text for note
    let shortComment = $state("");
    let tags = $state("");
    let saving = $state(false);
    let error = $state<string | null>(null);

    // Container-specific fields
    let characterName = $state("");
    let seriesName = $state("");
    let variant = $state("");
    let characterImageUrl = $state("");
    let linkedMoodboardId = $state("");

    // Node type options for the selector
    const nodeTypeOptions = [
        {
            value: "note",
            label: "Note",
            icon: StickyNote,
            description: "Text note or reminder",
        },
        {
            value: "link",
            label: "Link",
            icon: Link,
            description: "URL from web or social media",
        },
        {
            value: "container",
            label: "Container",
            icon: Folder,
            description: "Group items together",
        },
        {
            value: "image",
            label: "Image",
            icon: Image,
            description: "Upload an image (coming soon)",
        },
    ];

    // Container type options
    const containerTypeOptions: {
        value: ContainerType;
        label: string;
        icon: any;
    }[] = [
        { value: "group", label: "Group", icon: Folder },
        { value: "character", label: "Character", icon: Users },
    ];

    function resetForm() {
        selectedType = "note";
        containerType = "group";
        title = "";
        content = "";
        shortComment = "";
        tags = "";
        characterName = "";
        seriesName = "";
        variant = "";
        characterImageUrl = "";
        linkedMoodboardId = "";
        error = null;
    }

    function handleClose() {
        resetForm();
        open = false;
        onClose();
    }

    async function handleSave() {
        error = null;
        saving = true;

        try {
            // Build the node based on type
            let nodeType: MoodboardNodeType;
            let nodeCreate: MoodboardNodeCreate;

            if (selectedType === "container") {
                nodeType = "container";

                // Validate character container
                if (containerType === "character" && !characterName && !title) {
                    error = "Please enter a character name";
                    saving = false;
                    return;
                }

                // Build metadata based on container type
                let metadata: any = {};
                if (containerType === "character") {
                    metadata = {
                        character_name: characterName || title || "Character",
                        series_name: seriesName || undefined,
                        variant: variant || undefined,
                        character_image_url: characterImageUrl || undefined,
                    };
                }

                nodeCreate = {
                    moodboardId,
                    parentId: parentId ?? undefined,
                    nodeType,
                    containerType,
                    title:
                        title ||
                        characterName ||
                        containerTypeOptions.find(
                            (c) => c.value === containerType,
                        )?.label ||
                        "Container",
                    thumbnailUrl:
                        containerType === "character"
                            ? characterImageUrl || undefined
                            : undefined,
                    metadata,
                    tags: tags
                        ? tags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                        : [],
                    shortComment: shortComment || undefined,
                };
            } else if (selectedType === "note") {
                nodeType = "note";
                nodeCreate = {
                    moodboardId,
                    parentId: parentId ?? undefined,
                    nodeType,
                    title: title || undefined,
                    shortComment: content || undefined,
                    longNote: content || undefined,
                    tags: tags
                        ? tags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                        : [],
                    metadata: {
                        rich_text: content,
                    },
                };
            } else if (selectedType === "link") {
                // Validate URL
                if (!content) {
                    error = "Please enter a URL";
                    saving = false;
                    return;
                }

                try {
                    new URL(content);
                } catch {
                    error = "Please enter a valid URL";
                    saving = false;
                    return;
                }

                // Detect if it's social media
                const platform = detectPlatformFromUrl(content);
                nodeType = platform ? "social_media" : "link";

                nodeCreate = {
                    moodboardId,
                    parentId: parentId ?? undefined,
                    nodeType,
                    title: title || undefined,
                    contentUrl: content,
                    shortComment: shortComment || undefined,
                    tags: tags
                        ? tags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                        : [],
                    metadata: platform
                        ? { platform, extracted_at: new Date().toISOString() }
                        : { title: title || undefined },
                };
            } else {
                // Image - placeholder for now
                error = "Image upload coming soon";
                saving = false;
                return;
            }

            await onSave(nodeCreate);
            handleClose();
        } catch (err) {
            console.error("Failed to save node:", err);
            error = err instanceof Error ? err.message : "Failed to save";
        } finally {
            saving = false;
        }
    }
</script>

<Modal bind:open size="md" dismissable={false}>
    <div class="p-6">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Add to Moodboard
            </h3>
            <button
                onclick={handleClose}
                class="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={saving}
            >
                <X class="size-5" />
            </button>
        </div>

        {#if error}
            <div
                class="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400"
            >
                {error}
            </div>
        {/if}

        <div class="space-y-4">
            <!-- Type selector -->
            <div>
                <Label class="mb-2">Type</Label>
                <div class="grid grid-cols-2 gap-2">
                    {#each nodeTypeOptions as option}
                        <button
                            type="button"
                            onclick={() =>
                                (selectedType =
                                    option.value as typeof selectedType)}
                            disabled={option.value === "image"}
                            class="flex items-center gap-3 p-3 rounded-lg border transition-colors
                {selectedType === option.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                {option.value === 'image'
                                ? 'opacity-50 cursor-not-allowed'
                                : ''}"
                        >
                            <svelte:component
                                this={option.icon}
                                class="w-5 h-5 text-gray-600 dark:text-gray-400"
                            />
                            <div class="text-left">
                                <div
                                    class="font-medium text-sm text-gray-900 dark:text-white"
                                >
                                    {option.label}
                                </div>
                                <div
                                    class="text-xs text-gray-500 dark:text-gray-400"
                                >
                                    {option.description}
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Container type selector (when container is selected) -->
            {#if selectedType === "container"}
                <div>
                    <Label class="mb-2">Container Type</Label>
                    <div class="grid grid-cols-2 gap-2">
                        {#each containerTypeOptions as option}
                            <button
                                type="button"
                                onclick={() => (containerType = option.value)}
                                class="flex items-center gap-2 p-2 rounded-lg border transition-colors
                  {containerType === option.value
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
                            >
                                <svelte:component
                                    this={option.icon}
                                    class="w-4 h-4 text-gray-600 dark:text-gray-400"
                                />
                                <span
                                    class="text-sm font-medium text-gray-900 dark:text-white"
                                    >{option.label}</span
                                >
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Character-specific fields -->
                {#if containerType === "character"}
                    <div>
                        <Label for="character-name" class="mb-2"
                            >Character Name *</Label
                        >
                        <Input
                            id="character-name"
                            bind:value={characterName}
                            placeholder="e.g., Goku, Spider-Man"
                        />
                    </div>

                    <div>
                        <Label for="series-name" class="mb-2"
                            >Series (optional)</Label
                        >
                        <Input
                            id="series-name"
                            bind:value={seriesName}
                            placeholder="e.g., Dragon Ball Z, Marvel"
                        />
                    </div>

                    <div>
                        <Label for="variant" class="mb-2"
                            >Variant (optional)</Label
                        >
                        <Input
                            id="variant"
                            bind:value={variant}
                            placeholder="e.g., Base, Super Saiyan, Symbiote"
                        />
                    </div>

                    <div>
                        <Label for="character-image" class="mb-2"
                            >Character Image URL (optional)</Label
                        >
                        <Input
                            id="character-image"
                            type="url"
                            bind:value={characterImageUrl}
                            placeholder="https://..."
                        />
                    </div>
                {/if}
            {/if}

            <!-- Title (hide for character containers since we have character name field) -->
            {#if selectedType !== "container" || containerType !== "character"}
                <div>
                    <Label for="node-title" class="mb-2">
                        {selectedType === "container" ? "Name" : "Title"}
                        {selectedType !== "link" ? "" : "(optional)"}
                    </Label>
                    <Input
                        id="node-title"
                        bind:value={title}
                        placeholder={selectedType === "container"
                            ? 'e.g., "Base Outfit", "Wig Options"'
                            : selectedType === "note"
                              ? 'e.g., "Remember to check sizing"'
                              : 'e.g., "Reference from Instagram"'}
                    />
                </div>
            {/if}

            <!-- Content field (varies by type) -->
            {#if selectedType === "link"}
                <div>
                    <Label for="node-url" class="mb-2">URL *</Label>
                    <Input
                        id="node-url"
                        type="url"
                        bind:value={content}
                        placeholder="https://instagram.com/p/... or any URL"
                    />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Supports Instagram, TikTok, Pinterest, YouTube, and web
                        links
                    </p>
                </div>
            {:else if selectedType === "note"}
                <div>
                    <Label for="node-content" class="mb-2">Note</Label>
                    <Textarea
                        id="node-content"
                        bind:value={content}
                        placeholder="Write your note here..."
                        rows={4}
                    />
                </div>
            {/if}

            <!-- Short comment (for links) -->
            {#if selectedType === "link"}
                <div>
                    <Label for="node-comment" class="mb-2"
                        >Comment (optional)</Label
                    >
                    <Textarea
                        id="node-comment"
                        bind:value={shortComment}
                        placeholder="Why you saved this..."
                        rows={2}
                    />
                </div>
            {/if}

            <!-- Tags -->
            <div>
                <Label for="node-tags" class="mb-2">Tags (optional)</Label>
                <Input
                    id="node-tags"
                    bind:value={tags}
                    placeholder="fabric, red, wig (comma separated)"
                />
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex gap-3">
            <Button
                color="light"
                class="flex-1"
                onclick={handleClose}
                disabled={saving}
            >
                Cancel
            </Button>
            <Button
                color="primary"
                class="flex-1"
                onclick={handleSave}
                disabled={saving}
            >
                {saving ? "Adding..." : "Add"}
            </Button>
        </div>
    </div>
</Modal>
