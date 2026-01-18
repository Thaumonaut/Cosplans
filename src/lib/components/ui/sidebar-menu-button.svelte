<script lang="ts">
  import { cn } from "$lib/utils";
  import { getSidebarContext } from "./sidebar-context.svelte";
  import { sidebarStore } from "$lib/stores/sidebar-store.svelte";
  import Tooltip from "./tooltip.svelte";

  interface Props {
    href?: string;
    isActive?: boolean;
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
    tooltip?: string;
    class?: string;
    onclick?: () => void;
    children?: any;
  }

  let {
    href,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    class: className,
    onclick,
    children,
  }: Props = $props();

  // Try to get context, fall back to store if unavailable (SSR safety)
  let sidebarContext: ReturnType<typeof getSidebarContext> | null = null;
  try {
    sidebarContext = getSidebarContext();
  } catch {
    // Context not available, will use store directly
  }

  // Use context if available, otherwise use store
  const state = $derived(sidebarContext?.state ?? sidebarStore.state);
  const isMobile = $derived(sidebarContext?.isMobile ?? sidebarStore.isMobile);

  const baseClasses = $derived(
    cn(
      "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding]",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-active active:text-sidebar-active-foreground",
      "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
      "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
      isActive &&
        "bg-sidebar-active font-medium text-sidebar-active-foreground",
      variant === "outline" &&
        "bg-background shadow-[0_0_0_1px_var(--theme-sidebar-border)] hover:shadow-[0_0_0_1px_var(--theme-sidebar-accent)]",
      size === "sm" && "h-7 text-xs",
      size === "default" && "h-8 text-sm",
      size === "lg" && "h-12 text-sm",
      className,
    ),
  );
</script>

{#if tooltip && state === "collapsed" && !isMobile}
  <Tooltip content={tooltip} placement="right">
    {#if href}
      <a {href} class={baseClasses} {onclick}>
        {@render children?.()}
      </a>
    {:else}
      <button class={baseClasses} {onclick}>
        {@render children?.()}
      </button>
    {/if}
  </Tooltip>
{:else if href}
  <a {href} class={baseClasses} {onclick}>
    {@render children?.()}
  </a>
{:else}
  <button class={baseClasses} {onclick}>
    {@render children?.()}
  </button>
{/if}
