<script lang="ts">
    import type { MoodboardNode } from "$lib/types/domain/moodboard";
    import { User, ChevronRight } from "lucide-svelte";

    interface Props {
        node: MoodboardNode;
        childCount?: number;
        budgetTotal?: number;
        onClick?: () => void;
    }

    let { node, childCount = 0, budgetTotal = 0, onClick }: Props = $props();

    const metadata = $derived(
        node.metadata && typeof node.metadata === "object" ? node.metadata : {},
    );

    const characterName = $derived(
        "character_name" in metadata
            ? String(metadata.character_name)
            : node.title || "Character",
    );

    const seriesName = $derived(
        "series_name" in metadata ? String(metadata.series_name) : undefined,
    );

    const variant = $derived(
        "variant" in metadata ? String(metadata.variant) : undefined,
    );

    const characterImageUrl = $derived(
        "character_image_url" in metadata
            ? String(metadata.character_image_url)
            : node.thumbnailUrl,
    );
</script>

<button type="button" class="w-full text-left" onclick={onClick}>
    <div class="flex items-start gap-2 mb-2">
        {#if characterImageUrl}
            <div
                class="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700"
            >
                <img
                    src={characterImageUrl}
                    alt={characterName}
                    class="w-full h-full object-cover"
                />
            </div>
        {:else}
            <div
                class="flex-shrink-0 w-12 h-12 rounded bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
            >
                <User class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
        {/if}

        <div class="flex-1 min-w-0">
            <h3
                class="font-semibold text-sm text-gray-900 dark:text-white truncate"
            >
                {characterName}
                {#if variant}
                    <span class="text-primary-600 dark:text-primary-400"
                        >({variant})</span
                    >
                {/if}
            </h3>
            {#if seriesName}
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {seriesName}
                </p>
            {/if}
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {childCount}
                {childCount === 1 ? "item" : "items"}
            </p>
        </div>
        <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>

    {#if budgetTotal > 0}
        <div class="text-xs font-medium text-primary-600 dark:text-primary-400">
            ${budgetTotal.toFixed(2)}
        </div>
    {/if}
</button>
