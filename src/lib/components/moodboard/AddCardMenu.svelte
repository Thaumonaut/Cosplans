<script lang="ts">
    /**
     * AddCardMenu Component
     * Task: T-020
     *
     * Organized menu for creating different types of moodboard cards.
     * Categories: Quick Add, Containers, References, Design, Materials, People & Money
     */
    import type {
        MoodboardNodeType,
        ContainerType,
    } from "$lib/types/domain/moodboard";
    import { Button } from "flowbite-svelte";
    import { PlusOutline, SearchOutline } from "flowbite-svelte-icons";

    interface CardTypeOption {
        type: MoodboardNodeType;
        containerType?: ContainerType;
        label: string;
        icon: string;
        description: string;
    }

    interface Props {
        open?: boolean;
        onClose?: () => void;
        onSelectType?: (
            type: MoodboardNodeType,
            containerType?: ContainerType,
        ) => void;
        className?: string;
    }

    let {
        open = $bindable(false),
        onClose,
        onSelectType,
        className = "",
    }: Props = $props();

    let searchQuery = $state("");

    // Card type categories
    const categories = {
        "Quick Add": [
            {
                type: "link",
                label: "URL",
                icon: "🔗",
                description: "Paste a link",
            } as CardTypeOption,
            {
                type: "image",
                label: "Image",
                icon: "🖼️",
                description: "Upload an image",
            } as CardTypeOption,
            {
                type: "note",
                label: "Note",
                icon: "📝",
                description: "Quick text note",
            } as CardTypeOption,
        ],
        Containers: [
            {
                type: "container",
                containerType: "group",
                label: "Group",
                icon: "📁",
                description: "Organize items together",
            } as CardTypeOption,
            {
                type: "container",
                containerType: "character",
                label: "Character",
                icon: "👤",
                description: "Character or variant",
            } as CardTypeOption,
            {
                type: "moodboard_link",
                label: "Moodboard Link",
                icon: "🔗",
                description: "Link to another board",
            } as CardTypeOption,
        ],
        References: [
            {
                type: "social_media",
                label: "Social Media",
                icon: "📱",
                description: "Instagram, TikTok, etc.",
            } as CardTypeOption,
            {
                type: "link",
                label: "Web Link",
                icon: "🌐",
                description: "Any website",
            } as CardTypeOption,
            {
                type: "image",
                label: "Image",
                icon: "🖼️",
                description: "Reference image",
            } as CardTypeOption,
            {
                type: "note",
                label: "Note",
                icon: "📝",
                description: "Text notes",
            } as CardTypeOption,
        ],
        Design: [
            {
                type: "color_palette",
                label: "Color Palette",
                icon: "🎨",
                description: "Color swatches",
            } as CardTypeOption,
            {
                type: "measurements",
                label: "Measurements",
                icon: "📏",
                description: "Body or garment sizes",
            } as CardTypeOption,
        ],
        Materials: [
            {
                type: "fabric",
                label: "Fabric",
                icon: "🧵",
                description: "Fabric swatch",
            } as CardTypeOption,
        ],
        "People & Money": [
            {
                type: "contact",
                label: "Contact",
                icon: "👤",
                description: "Vendor or commissioner",
            } as CardTypeOption,
            {
                type: "budget_item",
                label: "Budget Item",
                icon: "💰",
                description: "Track costs",
            } as CardTypeOption,
        ],
    };

    // Filtered categories based on search
    const filteredCategories = $derived(() => {
        if (!searchQuery.trim()) {
            return categories;
        }

        const query = searchQuery.toLowerCase();
        const filtered: Record<string, CardTypeOption[]> = {};

        Object.entries(categories).forEach(([category, options]) => {
            const matchingOptions = options.filter(
                (opt) =>
                    opt.label.toLowerCase().includes(query) ||
                    opt.description.toLowerCase().includes(query),
            );

            if (matchingOptions.length > 0) {
                filtered[category] = matchingOptions;
            }
        });

        return filtered;
    });

    function handleSelectType(option: CardTypeOption) {
        onSelectType?.(option.type, option.containerType);
        handleClose();
    }

    function handleClose() {
        open = false;
        searchQuery = "";
        onClose?.();
    }
</script>

{#if open}
    <!-- Modal overlay -->
    <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onclick={handleClose}
        role="presentation"
    >
        <!-- Modal content -->
        <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="add-card-title"
        >
            <!-- Header -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2
                    id="add-card-title"
                    class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                    Add Card
                </h2>

                <!-- Search -->
                <div class="relative">
                    <div
                        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    >
                        <SearchOutline
                            class="w-4 h-4 text-gray-500 dark:text-gray-400"
                        />
                    </div>
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search card types..."
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </div>

            <!-- Card type categories -->
            <div class="flex-1 overflow-y-auto p-4">
                <div class="space-y-6">
                    {#each Object.entries(filteredCategories()) as [categoryName, options]}
                        <div>
                            <h3
                                class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
                            >
                                {categoryName}
                            </h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {#each options as option}
                                    <button
                                        type="button"
                                        class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left"
                                        onclick={() => handleSelectType(option)}
                                    >
                                        <span class="text-2xl flex-shrink-0"
                                            >{option.icon}</span
                                        >
                                        <div class="flex-1 min-w-0">
                                            <div
                                                class="font-medium text-gray-900 dark:text-white text-sm"
                                            >
                                                {option.label}
                                            </div>
                                            <div
                                                class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                                            >
                                                {option.description}
                                            </div>
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/each}

                    {#if Object.keys(filteredCategories()).length === 0}
                        <div
                            class="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                            <p class="text-sm">No card types found</p>
                            <p class="text-xs mt-1">
                                Try a different search term
                            </p>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Footer -->
            <div
                class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"
            >
                <Button color="alternative" onclick={handleClose}>Cancel</Button
                >
            </div>
        </div>
    </div>
{/if}
