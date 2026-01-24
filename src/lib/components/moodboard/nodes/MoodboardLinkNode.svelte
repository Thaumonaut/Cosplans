<script lang="ts">
    import type { MoodboardNode } from "$lib/types/domain/moodboard";
    import { ExternalLink, Grid } from "lucide-svelte";

    interface Props {
        node: MoodboardNode;
        targetMoodboardTitle?: string;
        onClick?: () => void;
    }

    let { node, targetMoodboardTitle, onClick }: Props = $props();

    const title = $derived(node.title || targetMoodboardTitle || "Linked Moodboard");
</script>

<button
    type="button"
    class="w-full text-left border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-3 hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
    onclick={onClick}
>
    <div class="flex items-start gap-2">
        <div class="flex-shrink-0 w-8 h-8 rounded bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <Grid class="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm text-primary-900 dark:text-primary-100 truncate">
                {title}
            </h3>
            <p class="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1">
                <ExternalLink class="w-3 h-3" />
                Open moodboard
            </p>
        </div>
    </div>

    {#if node.shortComment}
        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
            {node.shortComment}
        </p>
    {/if}
</button>
