<script lang="ts">
  import { Dialog, Button } from '$lib/components/ui';
  import { ImageIcon, Star, Trash2 } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    images: string[];
    initialIndex?: number;
    onClose?: () => void;
    onDelete?: (index: number) => Promise<void> | void;
    onSetPrimary?: (index: number) => Promise<void> | void;
    primaryIndex?: number;
    showActions?: boolean;
  }

  let {
    open = $bindable(false),
    images,
    initialIndex = $bindable(0),
    onClose,
    onDelete,
    onSetPrimary,
    primaryIndex = 0,
    showActions = false,
  }: Props = $props();

  // Zoom and pan state
  let zoomLevel = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isPanning = $state(false);
  let panStartX = $state(0);
  let panStartY = $state(0);

  // Touch/swipe state for mobile navigation
  let touchStartX = $state<number | null>(null);
  let touchStartY = $state<number | null>(null);
  let touchEndX = $state<number | null>(null);
  let touchEndY = $state<number | null>(null);
  let initialDistance = $state<number | null>(null);
  let lastZoomLevel = $state(1);

  // Double tap state
  let lastTapTime = $state(0);
  let lastTapX = $state(0);
  let lastTapY = $state(0);

  // Track image errors
  let imageErrors = $state<Set<number>>(new Set());

  // Reset zoom/pan when image changes
  $effect(() => {
    if (open && initialIndex !== undefined) {
      zoomLevel = 1;
      panX = 0;
      panY = 0;
    }
  });

  // Handle touch gestures for lightbox navigation and zoom
  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      // Single touch - navigation swipe
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      if (zoomLevel > 1) {
        // If zoomed, start panning
        isPanning = true;
        panStartX = e.touches[0].clientX - panX;
        panStartY = e.touches[0].clientY - panY;
      }
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      lastZoomLevel = zoomLevel;
      touchStartX = null; // Cancel swipe
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 1 && zoomLevel > 1 && isPanning) {
      // Pan while zoomed
      panX = e.touches[0].clientX - panStartX;
      panY = e.touches[0].clientY - panStartY;
    } else if (e.touches.length === 2 && initialDistance !== null) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      const scale = currentDistance / initialDistance;
      const newZoom = Math.min(Math.max(lastZoomLevel * scale, 1), 5); // Min 1x, max 5x
      zoomLevel = newZoom;
      if (newZoom === 1) {
        panX = 0;
        panY = 0;
      }
    } else if (e.touches.length === 1) {
      // Track for swipe navigation
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }
  }

  function handleTouchEnd() {
    if (
      touchStartX !== null &&
      touchEndX !== null &&
      touchStartY !== null &&
      touchEndY !== null
    ) {
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Only handle horizontal swipes when not zoomed and not panning
      if (
        zoomLevel === 1 &&
        !isPanning &&
        Math.abs(diffX) > Math.abs(diffY) &&
        Math.abs(diffX) > 50
      ) {
        if (diffX > 0 && initialIndex < images.length - 1) {
          // Swipe left - next image
          initialIndex++;
        } else if (diffX < 0 && initialIndex > 0) {
          // Swipe right - previous image
          initialIndex--;
        }
      }
    }

    touchStartX = null;
    touchStartY = null;
    touchEndX = null;
    touchEndY = null;
    initialDistance = null;
    isPanning = false;
  }

  function handleDoubleTap(e: MouseEvent | TouchEvent) {
    const now = Date.now();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

    if (
      now - lastTapTime < 300 &&
      Math.abs(clientX - lastTapX) < 50 &&
      Math.abs(clientY - lastTapY) < 50
    ) {
      // Double tap detected
      if (zoomLevel === 1) {
        zoomLevel = 2;
      } else {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
      }
      lastTapTime = 0;
    } else {
      lastTapTime = now;
      lastTapX = clientX;
      lastTapY = clientY;
    }
  }

  // Mouse wheel zoom on desktop
  function handleWheel(e: WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      zoomLevel = Math.min(Math.max(zoomLevel * delta, 1), 5);
      if (zoomLevel === 1) {
        panX = 0;
        panY = 0;
      }
    }
  }

  // Mouse drag to pan when zoomed
  function handleMouseDown(e: MouseEvent) {
    if (zoomLevel > 1 && e.button === 0) {
      isPanning = true;
      panStartX = e.clientX - panX;
      panStartY = e.clientY - panY;
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (isPanning && zoomLevel > 1) {
      panX = e.clientX - panStartX;
      panY = e.clientY - panStartY;
    }
  }

  function handleMouseUp() {
    isPanning = false;
  }

  function handleClose() {
    open = false;
    onClose?.();
  }

  async function handleDeleteImage() {
    if (!onDelete) return;
    await onDelete(initialIndex);
  }

  async function handleSetPrimary() {
    if (!onSetPrimary) return;
    await onSetPrimary(initialIndex);
  }
</script>

<!-- Image Lightbox - Mobile Friendly with Zoom -->
<Dialog
  bind:open
  size="xl"
  placement="center"
  class="p-0 sm:p-4"
  showCloseButton={false}
>
  <div
    class="relative w-full h-full flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] overflow-hidden"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onwheel={handleWheel}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    style="touch-action: pan-x pan-y pinch-zoom; cursor: {zoomLevel > 1
      ? 'grab'
      : 'default'}; {isPanning ? 'cursor: grabbing;' : ''}"
  >
    {#if images.length > 0 && images[initialIndex]}
      {@const currentImage = images[initialIndex]}
      {@const hasError = imageErrors.has(initialIndex)}

      {#if !hasError}
        <div
          class="relative flex items-center justify-center w-full h-full"
          style="transform: translate({panX}px, {panY}px);"
        >
          <img
            src={currentImage}
            alt="Reference image {initialIndex + 1}"
            class="max-h-[85vh] sm:max-h-[80vh] max-w-full w-auto h-auto object-contain rounded-lg select-none transition-transform duration-200"
            style="transform: scale({zoomLevel}); transform-origin: center center;"
            draggable="false"
            onclick={handleDoubleTap}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleDoubleTap(e);
              }
            }}
            role="button"
            tabindex="0"
            aria-label="Double tap or Ctrl+scroll to zoom"
            onerror={() => {
              const newErrors = new Set(imageErrors);
              newErrors.add(initialIndex);
              imageErrors = newErrors;
            }}
          />
        </div>

        <!-- Zoom indicator -->
        {#if zoomLevel > 1}
          <div
            class="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden"
          >
            <div
              class="rounded-full bg-black/60 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
            >
              {Math.round(zoomLevel * 100)}% - Pinch or drag to pan
            </div>
          </div>
        {/if}
      {:else}
        <div class="flex flex-col items-center justify-center py-16 px-4">
          <ImageIcon class="mb-4 size-16 text-muted-foreground" />
          <p class="text-muted-foreground text-center">Image unavailable</p>
        </div>
      {/if}

      {#if images.length > 1}
        <!-- Navigation Controls - Mobile Optimized -->
        <div
          class="absolute inset-0 flex items-center justify-between pointer-events-none px-2 sm:px-4"
        >
          <!-- Previous Button -->
          <Button
            variant="ghost"
            size="icon"
            disabled={initialIndex === 0}
            onclick={() => {
              if (initialIndex > 0) {
                initialIndex--;
              }
            }}
            class="pointer-events-auto bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 size-10 sm:size-12 rounded-full"
            aria-label="Previous image"
          >
            <svg
              class="size-5 sm:size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>

          <!-- Next Button -->
          <Button
            variant="ghost"
            size="icon"
            disabled={initialIndex === images.length - 1}
            onclick={() => {
              if (initialIndex < images.length - 1) {
                initialIndex++;
              }
            }}
            class="pointer-events-auto bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 size-10 sm:size-12 rounded-full"
            aria-label="Next image"
          >
            <svg
              class="size-5 sm:size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>

        <!-- Image Counter - Bottom Center -->
        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <div
            class="rounded-full bg-black/60 px-3 py-1.5 text-xs sm:text-sm text-white backdrop-blur-sm"
          >
            {initialIndex + 1} / {images.length}
          </div>
        </div>

        <!-- Tap hints for mobile (only show when not zoomed and on first image) -->
        {#if initialIndex === 0 && images.length > 1 && zoomLevel === 1}
          <div
            class="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden"
          >
            <div
              class="rounded-full bg-black/60 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
            >
              Swipe to navigate • Double tap to zoom
            </div>
          </div>
        {/if}

        <!-- Reset zoom button (show when zoomed) -->
        {#if zoomLevel > 1}
          <div
            class="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-auto sm:bottom-20"
          >
            <Button
              variant="ghost"
              size="sm"
              onclick={() => {
                zoomLevel = 1;
                panX = 0;
                panY = 0;
              }}
              class="bg-black/60 text-white hover:bg-black/80"
            >
              Reset Zoom
            </Button>
          </div>
        {/if}
      {/if}

      <!-- Action buttons (Set Primary, Delete) - Top Right -->
      {#if showActions && !hasError}
        <div
          class="absolute top-4 right-4 flex gap-2 pointer-events-auto z-20"
        >
          <!-- Set as Primary Button -->
          {#if onSetPrimary}
            <Button
              variant="ghost"
              size="icon"
              onclick={handleSetPrimary}
              class="bg-black/60 text-white hover:bg-black/80 size-10 sm:size-12 rounded-full {initialIndex ===
              primaryIndex
                ? 'bg-primary/80'
                : ''}"
              title={initialIndex === primaryIndex
                ? 'This is the primary image'
                : 'Set as primary image'}
            >
              {#if initialIndex === primaryIndex}
                <svg
                  class="size-5 sm:size-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              {:else}
                <Star class="size-5 sm:size-6" />
              {/if}
            </Button>
          {/if}

          <!-- Delete Button -->
          {#if onDelete}
            <Button
              variant="ghost"
              size="icon"
              onclick={handleDeleteImage}
              class="bg-black/60 text-white hover:bg-red-600/80 size-10 sm:size-12 rounded-full"
              title="Delete image"
            >
              <Trash2 class="size-5 sm:size-6" />
            </Button>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</Dialog>

<!-- Keyboard navigation (desktop) -->
<svelte:window
  onkeydown={(e) => {
    if (!open) return;
    if (e.key === 'ArrowLeft' && initialIndex > 0) {
      initialIndex--;
    } else if (e.key === 'ArrowRight' && initialIndex < images.length - 1) {
      initialIndex++;
    } else if (e.key === 'Escape') {
      handleClose();
    }
  }}
/>
