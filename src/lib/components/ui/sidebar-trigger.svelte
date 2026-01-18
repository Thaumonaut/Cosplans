<script lang="ts">
  import { PanelLeft } from "lucide-svelte";
  import { Button } from "$lib/components/ui";
  import { sidebarStore } from "$lib/stores/sidebar-store.svelte";
  import { cn } from "$lib/utils";

  interface Props {
    class?: string;
    size?: "default" | "sm" | "lg" | "icon";
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
  }

  let { class: className, size = "icon", variant = "ghost" }: Props = $props();

  function handleClick() {
    // Use the global store directly - always available, no context needed
    sidebarStore.toggleSidebar();
  }
</script>

<Button
  {variant}
  {size}
  class={cn(className)}
  onclick={handleClick}
  aria-label="Toggle sidebar"
  data-testid="sidebar-toggle"
>
  <PanelLeft class="size-4" />
</Button>
