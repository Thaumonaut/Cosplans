<script lang="ts">
    /**
     * Container Drop Zone Component
     * Shows a drop zone at the top of the canvas to move nodes back to parent/root
     */
    import { FolderUp } from "lucide-svelte";

    interface Props {
        visible: boolean;
        isDragging: boolean;
        onDrop: () => void;
    }

    let { visible = false, isDragging = false, onDrop }: Props = $props();

    let isOver = $state(false);

    function handleDragOver(e: DragEvent) {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        isOver = true;
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isOver = false;
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        isOver = false;
        onDrop();
    }
</script>

{#if visible && isDragging}
    <div
        class="absolute top-4 left-1/2 -translate-x-1/2 z-50 transition-all pointer-events-auto"
        class:opacity-100={isOver}
        class:opacity-60={!isOver}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
        role="button"
    >
        <div
            class="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed
                   backdrop-blur-sm shadow-lg transition-colors"
            class:bg-primary-100={isOver}
            class:border-primary-400={isOver}
            class:dark:bg-primary-900={isOver}
            class:dark:border-primary-500={isOver}
            class:bg-white={!isOver}
            class:border-gray-300={!isOver}
            class:dark:bg-gray-800={!isOver}
            class:dark:border-gray-600={!isOver}
        >
            <FolderUp class="w-5 h-5" />
            <span
                class="text-sm font-medium"
                class:text-primary-700={isOver}
                class:dark:text-primary-300={isOver}
                class:text-gray-700={!isOver}
                class:dark:text-gray-300={!isOver}
            >
                Drop here to move to parent level
            </span>
        </div>
    </div>
{/if}
