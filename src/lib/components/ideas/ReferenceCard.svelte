<script lang="ts">
  import type { MoodboardNode } from '$lib/types/domain/moodboard';
  import { isSocialMediaMetadata, isLinkMetadata, supportsEmbedding } from '$lib/types/domain/moodboard';
  import { Card, CardContent, CardFooter, Button } from '$lib/components/ui';
  import { Instagram, Music, Youtube, Facebook, Link as LinkIcon, StickyNote, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-svelte';
  import ImageLightbox from '$lib/components/base/ImageLightbox.svelte';
  import SocialMediaEmbed from '$lib/components/moodboard/SocialMediaEmbed.svelte';

  interface Props {
    node: MoodboardNode;
    onDelete: (id: string) => void;
    isReadOnly?: boolean;
  }

  let { node, onDelete, isReadOnly = false }: Props = $props();

  let lightboxOpen = $state(false);

  /**
   * Get platform icon component based on platform name
   */
  function getPlatformIcon(platform?: string) {
    if (!platform) return LinkIcon;
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'tiktok': return Music;
      case 'youtube': return Youtube;
      case 'facebook': return Facebook;
      default: return LinkIcon;
    }
  }

  /**
   * Get platform color for badge
   */
  function getPlatformColor(platform?: string) {
    if (!platform) return 'bg-gray-500';
    switch (platform.toLowerCase()) {
      case 'instagram': return 'bg-pink-500';
      case 'tiktok': return 'bg-black';
      case 'youtube': return 'bg-red-600';
      case 'facebook': return 'bg-blue-600';
      case 'pinterest': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  }

  /**
   * Truncate text to max length
   */
  function truncate(text: string | undefined | null, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
</script>

<Card class="overflow-hidden hover:shadow-lg transition-shadow min-w-0">
  {#if node.nodeType === 'social_media'}
    <!-- Social Media Card -->
    {#if isSocialMediaMetadata(node.metadata) && supportsEmbedding(node.metadata.platform) && node.contentUrl}
      <!-- Use embed for Instagram, TikTok, YouTube -->
      <div class="relative">
        <SocialMediaEmbed
          metadata={node.metadata}
          contentUrl={node.contentUrl}
          thumbnailUrl={node.thumbnailUrl}
        />
        <!-- Platform badge -->
        <div class="absolute top-2 right-2 pointer-events-none z-10">
          <div class="flex items-center gap-1 px-2 py-1 rounded-full {getPlatformColor(node.metadata.platform)} text-white text-xs font-medium shadow-lg">
            <svelte:component this={getPlatformIcon(node.metadata.platform)} class="h-3 w-3" />
            <span class="capitalize">{node.metadata.platform}</span>
          </div>
        </div>
      </div>
    {:else}
      <!-- Fallback thumbnail display for non-embeddable platforms -->
      <div
        class="aspect-video bg-muted relative {node.thumbnailUrl ? 'cursor-pointer group' : ''}"
        onclick={() => node.thumbnailUrl && (lightboxOpen = true)}
        role={node.thumbnailUrl ? "button" : undefined}
        tabindex={node.thumbnailUrl ? 0 : undefined}
        onkeydown={(e) => e.key === 'Enter' && node.thumbnailUrl && (lightboxOpen = true)}
      >
        {#if node.thumbnailUrl}
          <img src={node.thumbnailUrl} alt={node.shortComment || 'Social media post'} class="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <!-- Zoom hint overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="bg-white/90 dark:bg-gray-800/90 rounded-full p-3">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        {:else}
          <div class="w-full h-full flex items-center justify-center">
            <svelte:component this={getPlatformIcon(isSocialMediaMetadata(node.metadata) ? node.metadata.platform : undefined)} class="h-12 w-12 text-muted-foreground" />
          </div>
        {/if}
        <!-- Platform badge -->
        {#if isSocialMediaMetadata(node.metadata) && node.metadata.platform}
          <div class="absolute top-2 right-2 pointer-events-none">
            <div class="flex items-center gap-1 px-2 py-1 rounded-full {getPlatformColor(node.metadata.platform)} text-white text-xs font-medium">
              <svelte:component this={getPlatformIcon(node.metadata.platform)} class="h-3 w-3" />
              <span class="capitalize">{node.metadata.platform}</span>
            </div>
          </div>
        {/if}
      </div>
    {/if}
    <CardContent class="pt-4">
      {#if isSocialMediaMetadata(node.metadata) && node.metadata.caption}
        <p class="text-sm font-medium line-clamp-2">
          {node.metadata.caption}
        </p>
      {:else if node.shortComment}
        <p class="text-sm font-medium line-clamp-2">
          {node.shortComment}
        </p>
      {/if}
      {#if isSocialMediaMetadata(node.metadata) && (node.metadata.author || node.metadata.tags?.length)}
        <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {#if node.metadata.author}
            <span>@{node.metadata.author}</span>
          {/if}
          {#if node.metadata.tags?.length}
            <span class="flex flex-wrap gap-1">
              {#each node.metadata.tags as tag}
                <span class="rounded bg-muted px-2 py-0.5">#{tag}</span>
              {/each}
            </span>
          {/if}
        </div>
      {/if}
      {#if node.contentUrl}
        <a
          href={node.contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
        >
          View original
          <ExternalLink class="h-3 w-3" />
        </a>
      {/if}
    </CardContent>
  {:else if node.nodeType === 'image'}
    <!-- Image Card -->
    <div
      class="aspect-video bg-muted {node.contentUrl ? 'cursor-pointer relative group' : ''}"
      onclick={() => node.contentUrl && (lightboxOpen = true)}
      role={node.contentUrl ? "button" : undefined}
      tabindex={node.contentUrl ? 0 : undefined}
      onkeydown={(e) => e.key === 'Enter' && node.contentUrl && (lightboxOpen = true)}
    >
      {#if node.contentUrl}
        <img src={node.contentUrl} alt={node.shortComment || 'Reference image'} class="w-full h-full object-cover transition-transform group-hover:scale-105" />
        <!-- Zoom hint overlay -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="bg-white/90 dark:bg-gray-800/90 rounded-full p-3">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
      {:else}
        <div class="w-full h-full flex items-center justify-center">
          <ImageIcon class="h-12 w-12 text-muted-foreground" />
        </div>
      {/if}
    </div>
    {#if node.shortComment}
      <CardContent class="pt-4">
        <p class="text-sm">{node.shortComment}</p>
      </CardContent>
    {/if}
  {:else if node.nodeType === 'note'}
    <!-- Note Card -->
    <CardContent class="pt-6 pb-4">
      <div class="flex items-start gap-3">
        <StickyNote class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {truncate(node.longNote, 200)}
          </p>
        </div>
      </div>
    </CardContent>
  {:else if node.nodeType === 'link'}
    <!-- Link Card -->
    <CardContent class="pt-6 pb-4">
      <div class="flex items-start gap-3">
        <LinkIcon class="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          {#if isLinkMetadata(node.metadata) && node.metadata.title}
            <p class="text-sm font-medium mb-1">{truncate(node.metadata.title, 80)}</p>
          {:else if node.shortComment}
            <p class="text-sm font-medium mb-1">{truncate(node.shortComment, 80)}</p>
          {/if}
          {#if isLinkMetadata(node.metadata) && node.metadata.description}
            <p class="text-xs text-muted-foreground mb-2 line-clamp-2">{node.metadata.description}</p>
          {/if}
          {#if node.contentUrl}
            <a
              href={node.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-primary hover:underline flex items-center gap-1 truncate min-w-0"
            >
              {truncate(node.contentUrl, 40)}
              <ExternalLink class="h-3 w-3 flex-shrink-0" />
            </a>
          {/if}
        </div>
      </div>
    </CardContent>
  {:else}
    <!-- Unknown/Other Node Types -->
    <CardContent class="pt-6 pb-4">
      <p class="text-sm text-muted-foreground">
        Unknown reference type: {node.nodeType}
      </p>
    </CardContent>
  {/if}

  <!-- Card Footer with Delete Button -->
  <CardFooter class="flex justify-between items-center border-t pt-3">
    <div class="text-xs text-muted-foreground">
      {new Date(node.createdAt).toLocaleDateString()}
    </div>
    {#if !isReadOnly}
      <Button
        variant="ghost"
        size="sm"
        onclick={() => {
          if (confirm('Are you sure you want to delete this reference?')) {
            onDelete(node.id);
          }
        }}
        class="h-8 w-8 p-0"
      >
        <Trash2 class="h-4 w-4 text-destructive" />
      </Button>
    {/if}
  </CardFooter>
</Card>

<!-- Lightbox for images -->
{#if (node.nodeType === 'image' && node.contentUrl) || (node.nodeType === 'social_media' && node.thumbnailUrl)}
  <ImageLightbox
    bind:open={lightboxOpen}
    images={node.nodeType === 'image' && node.contentUrl ? [node.contentUrl] : node.nodeType === 'social_media' && node.thumbnailUrl ? [node.thumbnailUrl] : []}
    initialIndex={0}
    showActions={false}
  />
{/if}
