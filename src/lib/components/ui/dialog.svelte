<script lang="ts">
  import { Modal } from "flowbite-svelte";
  import { X } from "lucide-svelte";
  import { Button } from ".";
  import { cn } from "$lib/utils";

  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    description?: string;
    showCloseButton?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    placement?:
      | "top-left"
      | "top-center"
      | "top-right"
      | "center-left"
      | "center"
      | "center-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right";
    class?: string;
    children?: any;
  }

  let {
    open = $bindable(false),
    onOpenChange,
    title,
    description,
    showCloseButton = false,
    size = "md",
    placement = "center",
    class: className,
    children,
  }: Props = $props();

  function handleOpenChange(isOpen: boolean) {
    open = isOpen;
    onOpenChange?.(isOpen);
  }
</script>

<Modal
  bind:open
  {size}
  {placement}
  outsideclose
  dismissable={false}
  class={cn("bg-background border shadow-lg", className)}
  on:close={() => handleOpenChange(false)}
>
  <div class="flex flex-col gap-4">
    {#if title || showCloseButton}
      <div class="flex items-center justify-between">
        {#if title}
          <h3 class="text-lg font-semibold leading-none">{title}</h3>
        {/if}
        <!-- {#if showCloseButton}
          <Button
            variant="ghost"
            size="icon"
            class="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100"
            onclick={() => handleOpenChange(false)}
          >
            <X class="size-4" />
            <span class="sr-only">Close</span>
          </Button>
        {/if} -->
      </div>
    {/if}

    {#if description}
      <p class="text-sm text-muted-foreground">{description}</p>
    {/if}

    <div class="flex flex-col gap-4">
      {@render children?.()}
    </div>
  </div>
</Modal>
