<script lang="ts">
    import { tick } from "svelte";
    import { mount, unmount } from "svelte";

    interface ContextMenuItem {
        label: string;
        onClick: () => void;
        variant?: "default" | "danger";
        disabled?: boolean;
    }

    interface Props {
        open: boolean;
        x: number;
        y: number;
        items: ContextMenuItem[];
        onClose?: () => void;
    }

    let { open, x, y, items, onClose }: Props = $props();

    let menuElement = $state<HTMLDivElement | null>(null);
    let menuStyle = $state("");

    function closeMenu() {
        console.log("[ContextMenu] Closing menu");
        onClose?.();
    }

    $effect(() => {
        if (!open) {
            console.log("[ContextMenu] Menu is closed, skipping effect");
            return;
        }

        console.log("[ContextMenu] Menu opened at", { x, y });

        const handleClick = (event: MouseEvent) => {
            if (!menuElement) {
                console.log("[ContextMenu] Click handler: no menuElement");
                return;
            }
            if (!menuElement.contains(event.target as Node)) {
                console.log("[ContextMenu] Click outside menu, closing");
                closeMenu();
            } else {
                console.log("[ContextMenu] Click inside menu");
            }
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                console.log("[ContextMenu] Escape key pressed, closing");
                closeMenu();
            }
        };

        // Delay adding click listener to prevent immediate close
        const timeoutId = setTimeout(() => {
            console.log("[ContextMenu] Adding click listener after 50ms delay");
            window.addEventListener("click", handleClick);
        }, 50);

        window.addEventListener("keydown", handleKey);

        return () => {
            console.log("[ContextMenu] Cleaning up event listeners");
            clearTimeout(timeoutId);
            window.removeEventListener("click", handleClick);
            window.removeEventListener("keydown", handleKey);
        };
    });

    $effect(() => {
        if (!open) return;

        // This effect needs to react to x, y changes as well as open
        const currentX = x;
        const currentY = y;

        console.log(
            "[ContextMenu] Position effect triggered - x:",
            currentX,
            "y:",
            currentY,
        );

        tick().then(() => {
            if (!menuElement) {
                console.log(
                    "[ContextMenu] No menuElement yet, skipping position update",
                );
                return;
            }
            const rect = menuElement.getBoundingClientRect();
            const margin = 8;
            const maxX = window.innerWidth - rect.width - margin;
            const maxY = window.innerHeight - rect.height - margin;
            const left = Math.min(maxX, Math.max(margin, currentX));
            const top = Math.min(maxY, Math.max(margin, currentY));
            const newStyle = `left: ${left}px; top: ${top}px; pointer-events: auto;`;
            console.log("[ContextMenu] Updating menu style:", newStyle);
            menuStyle = newStyle;
        });
    });
</script>

{#if open}
    <div
        bind:this={menuElement}
        class="fixed w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        style="{menuStyle}; z-index: 9999;"
        role="menu"
        onclick={(event) => event.stopPropagation()}
        oncontextmenu={(event) => event.preventDefault()}
    >
        {#each items as item}
            <button
                class={`block w-full px-3 py-2 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    item.variant === "danger"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-700 dark:text-gray-200"
                } ${item.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onclick={() => {
                    if (item.disabled) return;
                    item.onClick();
                    closeMenu();
                }}
            >
                {item.label}
            </button>
        {/each}
    </div>
{/if}
