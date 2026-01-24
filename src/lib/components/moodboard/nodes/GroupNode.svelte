<script lang="ts">
    import type { MoodboardNode } from "$lib/types/domain/moodboard";
    import { Folder, ChevronRight } from "lucide-svelte";

    interface Props {
        node: MoodboardNode;
        childCount?: number;
        budgetTotal?: number;
        onClick?: () => void;
    }

    let { node, childCount = 0, budgetTotal = 0, onClick }: Props = $props();

    const title = $derived(node.title || "Group");
</script>

<button
    type="button"
    class="w-full text-left"
    onclick={onClick}
>
    <div class="flex items-start gap-2 mb-2">
        <div class="flex-shrink-0 w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Folder class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {title}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
                {childCount} {childCount === 1 ? 'item' : 'items'}
            </p>
        </div>
        <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>

    {#if node.shortComment}
        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {node.shortComment}
        </p>
    {/if}

    {#if budgetTotal > 0}
        <div class="text-xs font-medium text-primary-600 dark:text-primary-400">
            ${budgetTotal.toFixed(2)}
        </div>
    {/if}
</button>
