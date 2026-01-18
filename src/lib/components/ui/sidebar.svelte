<script lang="ts">
  import { onMount } from "svelte";
  import { setSidebarContext } from "./sidebar-context.svelte";
  import { sidebarStore } from "$lib/stores/sidebar-store.svelte";
  import Sheet from "./sheet.svelte";
  import { cn } from "$lib/utils";

  interface Props {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
    class?: string;
    children?: any;
  }

  let {
    defaultOpen = true,
    open: openProp = $bindable(),
    onOpenChange,
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    class: className,
    children,
  }: Props = $props();

  // Sync with global store - store is the source of truth
  // Use reactive getters to track store changes
  const open = $derived(openProp !== undefined ? openProp : sidebarStore.open);
  const openMobile = $derived(sidebarStore.openMobile);
  const isMobile = $derived(sidebarStore.isMobile);

  function setOpen(value: boolean) {
    if (openProp !== undefined && onOpenChange) {
      onOpenChange(value);
    } else {
      sidebarStore.open = value;
    }
  }

  function setOpenMobile(value: boolean) {
    sidebarStore.openMobile = value;
  }

  function toggleSidebar() {
    sidebarStore.toggleSidebar();
  }

  // Keyboard shortcut listener
  onMount(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const state = $derived(open ? "expanded" : "collapsed");

  // Create context object that uses reactive getters
  function createContext() {
    return {
      get state() {
        return open ? "expanded" : "collapsed";
      },
      get open() {
        return sidebarStore.open;
      },
      setOpen,
      get openMobile() {
        return sidebarStore.openMobile;
      },
      setOpenMobile,
      get isMobile() {
        return sidebarStore.isMobile;
      },
      toggleSidebar,
    };
  }

  // Set context SYNCHRONOUSLY for SSR (this runs during component initialization)
  setSidebarContext(createContext());

  // Also update context reactively for client-side state changes
  $effect(() => {
    setSidebarContext(createContext());
  });

  const SIDEBAR_WIDTH = "16rem";
  const SIDEBAR_WIDTH_MOBILE = "18rem";
  const SIDEBAR_WIDTH_ICON = "3rem";
</script>

{#if collapsible === "none"}
  <div
    class={cn(
      "bg-sidebar text-sidebar-foreground flex h-full flex-col",
      className,
    )}
    style="width: {SIDEBAR_WIDTH};"
  >
    {@render children?.()}
  </div>
{:else}
  <!-- Unified sidebar for all screen sizes -->
  {@const isOpen = isMobile ? openMobile : open}

  <div
    class="group peer text-sidebar-foreground"
    data-state={isOpen ? "expanded" : "collapsed"}
    data-collapsible={!isOpen ? collapsible : ""}
    data-variant={variant}
    data-side={side}
  >
    <!-- Sidebar gap - creates space for sidebar in the layout flow (desktop only) -->
    {#if !isMobile}
      <div
        class="relative bg-transparent transition-[width] duration-200 ease-linear"
        style="width: {isOpen ? SIDEBAR_WIDTH : '0'};"
      ></div>
    {/if}

    <!-- Mobile backdrop -->
    {#if isMobile && openMobile}
      <button
        class="fixed inset-0 z-20 bg-black/50 transition-opacity duration-200"
        onclick={() => setOpenMobile(false)}
        aria-label="Close sidebar"
      ></button>
    {/if}

    <!-- Sidebar container - fixed position, slides from left edge -->
    <div
      data-testid="sidebar"
      class={cn(
        "fixed inset-y-0 h-screen transition-transform duration-200 ease-linear flex",
        isMobile ? "z-30" : "z-10",
        side === "left" ? "left-0" : "right-0",
        variant === "floating" || variant === "inset"
          ? "p-2"
          : side === "left"
            ? "border-r border-[var(--theme-sidebar-border)]"
            : "border-l border-[var(--theme-sidebar-border)]",
        className,
      )}
      style="width: {isMobile
        ? SIDEBAR_WIDTH_MOBILE
        : SIDEBAR_WIDTH}; height: 100vh; height: 100dvh; transform: translateX({isOpen
        ? '0'
        : side === 'left'
          ? '-100%'
          : '100%'});"
    >
      <div
        class={cn(
          "bg-sidebar flex h-full w-full flex-col",
          variant === "floating" &&
            "rounded-lg border border-[var(--theme-sidebar-border)] shadow-sm",
        )}
      >
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
