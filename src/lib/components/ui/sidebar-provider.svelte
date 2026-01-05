<script lang="ts">
  import { onMount } from 'svelte';
  import { setSidebarContext } from './sidebar-context.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    class?: string;
    style?: string;
    children: Snippet;
  }

  let {
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    class: className = '',
    style = '',
    children
  }: Props = $props();

  // Mobile detection - simplified for now
  let isMobile = false;
  let openMobile = false;

  // Internal state
  let _open = defaultOpen;
  const open = $derived(openProp ?? _open);

  function setOpen(value: boolean | ((value: boolean) => boolean)) {
    const openState = typeof value === 'function' ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _open = openState;
    }

    // Set cookie to keep sidebar state
    if (typeof document !== 'undefined') {
      document.cookie = `sidebar_state=${openState}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  }

  function setOpenMobile(value: boolean | ((value: boolean) => boolean)) {
    openMobile = typeof value === 'function' ? value(openMobile) : value;
  }

  function toggleSidebar() {
    return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
  }

  // Set up context
  const state = $derived(open ? 'expanded' : 'collapsed');
  
  $effect(() => {
    const context = {
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    };
    console.log('[SidebarProvider] Setting context:', context);
    setSidebarContext(context);
  });

  onMount(() => {
    // Simple mobile detection
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Keyboard shortcut
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<div
  data-slot="sidebar-wrapper"
  style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem; {style}"
  class="group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full {className}"
  data-state={state}
>
  {@render children()}
</div>