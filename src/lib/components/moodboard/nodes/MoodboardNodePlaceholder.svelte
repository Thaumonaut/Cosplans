<script lang="ts">
    import type { MoodboardNode } from "$lib/types/domain/moodboard";

    interface Props {
        data: {
            node: MoodboardNode;
        };
    }

    let { data }: Props = $props();

    const title = $derived(
        data?.node.title ||
            data?.node.shortComment ||
            data?.node.longNote ||
            "Untitled",
    );
</script>

<div
    class="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
    <div class="text-xs uppercase tracking-wide text-gray-400">
        {data?.node.nodeType}
    </div>
    <div class="text-sm font-medium text-gray-900 dark:text-white">
        {title}
    </div>
</div>
