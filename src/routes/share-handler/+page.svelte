<script lang="ts">
  /**
   * Share Handler Page
   * Feature: 006-brainstorming-moodboard
   *
   * Handles shared content from PWA share target.
   * Allows user to create new idea or add to existing idea.
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { currentTeam } from '$lib/stores/teams';
  import type { PageData } from './$types';
  import { ideas } from '$lib/stores/ideas';
  import { moodboard } from '$lib/stores/moodboard';
  import { ideaService } from '$lib/api/services/ideaService';
  import { metadataService } from '$lib/api/services/metadataService';
  import type { ExtractedMetadata } from '$lib/api/services/metadataService';
  import { determineNodeType } from '$lib/types/domain/moodboard';
  import type { MoodboardNodeType } from '$lib/types/domain/moodboard';
  import { toast } from '$lib/stores/toast';
  import { Button, Input, Label, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui';
  import { Loader2, Plus, Check, ExternalLink, Instagram, Music, Youtube, Facebook, Link as LinkIcon } from 'lucide-svelte';

  // Get page data (includes authenticated session)
  let { data }: { data: PageData } = $props();

  // Parse URL params
  const sharedTitle = $page.url.searchParams.get('title') || '';
  const sharedText = $page.url.searchParams.get('text') || '';
  const sharedUrl = $page.url.searchParams.get('url') || '';

  // Debug logging
  console.log('[Share Handler] Page loaded with params:', {
    title: sharedTitle,
    text: sharedText,
    url: sharedUrl,
    fullUrl: $page.url.toString()
  });

  // State
  let loading = $state(true);
  let extractingMetadata = $state(false);
  let metadata = $state<ExtractedMetadata | null>(null);
  let nodeType = $state<MoodboardNodeType>('note');

  let mode = $state<'select' | 'create-new' | 'add-existing'>('select');
  let characterName = $state('');
  let selectedIdeaId = $state<string | null>(null);
  let saving = $state(false);
  let error = $state<string | null>(null);

  // Computed values
  const userIdeas = $derived($ideas.items || []);
  const hasIdeas = $derived(userIdeas.length > 0);
  const canCreateNew = $derived(characterName.trim().length > 0);
  const canAddToExisting = $derived(selectedIdeaId !== null);

  /**
   * Extract metadata from URL
   */
  async function extractMetadata() {
    if (!sharedUrl) {
      metadata = null;
      return;
    }

    extractingMetadata = true;
    try {
      const extracted = await metadataService.extractFromUrl(sharedUrl);
      metadata = extracted;

      if (!extracted.success) {
        console.warn('[Share Handler] Metadata extraction failed:', extracted.error);
        // Continue anyway with basic info
      }
    } catch (err) {
      console.error('[Share Handler] Error extracting metadata:', err);
      metadata = null;
    } finally {
      extractingMetadata = false;
    }
  }

  /**
   * Create new idea with shared content
   */
  async function handleCreateNew() {
    if (!canCreateNew) {
      error = 'Please enter a character name';
      return;
    }

    const team = $currentTeam;
    if (!team) {
      error = 'No team selected';
      return;
    }

    saving = true;
    error = null;

    try {
      // Create the idea
      const newIdea = await ideas.create(team.id, {
        character: characterName.trim(),
        difficulty: 'beginner',
        tags: [],
        images: [],
      });

      toast.success('Character Created', `${newIdea.character} has been created!`);

      // Create the moodboard node
      await createMoodboardNode(newIdea.id);

      // Redirect to idea detail
      goto(`/ideas/${newIdea.id}`);
    } catch (err: any) {
      error = err?.message || 'Failed to create idea';
      toast.error('Failed to Create Character', error);
      saving = false;
    }
  }

  /**
   * Add to existing idea
   */
  async function handleAddToExisting() {
    if (!canAddToExisting || !selectedIdeaId) {
      error = 'Please select an idea';
      return;
    }

    saving = true;
    error = null;

    try {
      // Create the moodboard node
      await createMoodboardNode(selectedIdeaId);

      // Redirect to idea detail
      goto(`/ideas/${selectedIdeaId}`);
    } catch (err: any) {
      error = err?.message || 'Failed to add to idea';
      toast.error('Failed to Add Reference', error);
      saving = false;
    }
  }

  /**
   * Create moodboard node with extracted metadata
   */
  async function createMoodboardNode(ideaId: string) {
    // Determine node type based on content
    nodeType = determineNodeType({
      url: sharedUrl,
      text: sharedText,
    });

    // Create metadata for the node
    const nodeMetadata = metadata && metadata.success
      ? metadataService.toNodeMetadata(metadata, sharedUrl)
      : {};

    // Create the node
    await moodboard.createNode({
      ideaId,
      nodeType,
      contentUrl: sharedUrl || undefined,
      thumbnailUrl: metadata?.thumbnailUrl || undefined,
      metadata: nodeMetadata,
      shortComment: sharedTitle || undefined,
      longNote: sharedText || undefined,
      tags: [],
    });

    toast.success('Reference Added', 'Content saved to moodboard!');
  }

  /**
   * Initialize on mount
   */
  onMount(async () => {
    // Authentication is handled by +page.server.ts
    // User is guaranteed to be authenticated at this point

    // Load user's ideas
    const team = $currentTeam;
    console.log('[Share Handler] Current team:', team);

    if (team) {
      try {
        await ideas.load(team.id);
        console.log('[Share Handler] Loaded ideas:', $ideas.items?.length || 0, 'ideas');
      } catch (err) {
        console.error('[Share Handler] Failed to load ideas:', err);
      }
    } else {
      console.warn('[Share Handler] No current team found');
    }

    // Extract metadata from URL if provided
    if (sharedUrl) {
      await extractMetadata();
    }

    loading = false;
  });

  /**
   * Get platform icon component
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
</script>

<svelte:head>
  <title>Save Reference - Cosplans</title>
</svelte:head>

<div class="container mx-auto max-w-4xl py-8 px-4">
  {#if loading}
    <!-- Loading state -->
    <div class="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 class="h-12 w-12 animate-spin text-primary" />
      <p class="mt-4 text-muted-foreground">Loading...</p>
    </div>
  {:else}
    <!-- No content shared message -->
    {#if !sharedTitle && !sharedText && !sharedUrl}
      <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div class="mb-4 rounded-full bg-muted p-6">
          <LinkIcon class="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 class="text-2xl font-bold mb-2">No Content to Share</h2>
        <p class="text-muted-foreground mb-6 max-w-md">
          This page is used to save shared content to your moodboard. Share a post from Instagram, TikTok, or any app to get started!
        </p>
        <Button href="/dashboard">Go to Dashboard</Button>
      </div>
    {:else}
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Save Reference</h1>
        <p class="text-muted-foreground mt-2">
          Add this content to your cosplay moodboard
        </p>
        <!-- Debug info -->
        {#if import.meta.env.DEV}
          <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs">
            <strong>Debug:</strong> Team: {$currentTeam?.name || 'none'} |
            Ideas loaded: {userIdeas.length} |
            Has ideas: {hasIdeas ? 'yes' : 'no'} |
            Mode: {mode}
          </div>
        {/if}
      </div>

      <!-- Preview Card -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <svelte:component this={getPlatformIcon(metadata?.platform)} class="h-5 w-5" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Thumbnail -->
        {#if extractingMetadata}
          <div class="flex items-center justify-center h-48 bg-muted rounded-lg">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        {:else if metadata?.thumbnailUrl}
          <div class="relative h-48 bg-muted rounded-lg overflow-hidden">
            <img
              src={metadata.thumbnailUrl}
              alt={metadata.title || 'Shared content'}
              class="w-full h-full object-cover"
            />
          </div>
        {/if}

        <!-- Title -->
        {#if sharedTitle || metadata?.title}
          <div>
            <h3 class="font-semibold text-lg">
              {sharedTitle || metadata?.title}
            </h3>
          </div>
        {/if}

        <!-- Description -->
        {#if sharedText || metadata?.description}
          <p class="text-sm text-muted-foreground line-clamp-3">
            {sharedText || metadata?.description}
          </p>
        {/if}

        <!-- URL -->
        {#if sharedUrl}
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink class="h-4 w-4" />
            <a
              href={sharedUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline truncate"
            >
              {sharedUrl}
            </a>
          </div>
        {/if}

        <!-- Platform badge -->
        {#if metadata?.platform}
          <div class="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {metadataService.getPlatformDisplayName(metadata.platform)}
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Action Selection -->
    {#if mode === 'select'}
      <div class="grid gap-4 md:grid-cols-2">
        <!-- Create New Idea -->
        <Card class="cursor-pointer hover:border-primary transition-colors" onclick={() => mode = 'create-new'}>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Plus class="h-5 w-5" />
              Create New Idea
            </CardTitle>
            <CardDescription>
              Start a new cosplay idea with this reference
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- Add to Existing -->
        <Card
          class="cursor-pointer hover:border-primary transition-colors {!hasIdeas ? 'opacity-50 cursor-not-allowed' : ''}"
          onclick={() => hasIdeas && (mode = 'add-existing')}
        >
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Check class="h-5 w-5" />
              Add to Existing
            </CardTitle>
            <CardDescription>
              {hasIdeas
                ? 'Add this reference to an existing idea'
                : 'Create your first idea to use this option'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    {/if}

    <!-- Create New Idea Form -->
    {#if mode === 'create-new'}
      <Card>
        <CardHeader>
          <CardTitle>Create New Idea</CardTitle>
          <CardDescription>
            Enter a character name to create a new cosplay idea
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="character">Character Name *</Label>
            <Input
              id="character"
              type="text"
              placeholder="e.g., Tanjiro Kamado"
              bind:value={characterName}
              disabled={saving}
            />
          </div>

          {#if error}
            <p class="text-sm text-destructive">{error}</p>
          {/if}
        </CardContent>
        <CardFooter class="flex gap-2">
          <Button variant="outline" onclick={() => mode = 'select'} disabled={saving}>
            Back
          </Button>
          <Button onclick={handleCreateNew} disabled={!canCreateNew || saving}>
            {#if saving}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {:else}
              <Plus class="mr-2 h-4 w-4" />
            {/if}
            Create & Add Reference
          </Button>
        </CardFooter>
      </Card>
    {/if}

    <!-- Add to Existing Form -->
    {#if mode === 'add-existing'}
      <Card>
        <CardHeader>
          <CardTitle>Add to Existing Idea</CardTitle>
          <CardDescription>
            Select an idea to add this reference to
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-3 max-h-[400px] overflow-y-auto">
            {#each userIdeas as idea}
              <button
                class="flex items-start gap-4 p-4 rounded-lg border-2 transition-colors text-left {selectedIdeaId === idea.id ? 'border-primary bg-primary/5' : 'border-input'}"
                onclick={() => selectedIdeaId = idea.id}
                disabled={saving}
              >
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold truncate">{idea.character || idea.title}</h4>
                  {#if idea.series}
                    <p class="text-sm text-muted-foreground truncate">{idea.series}</p>
                  {/if}
                </div>
                {#if selectedIdeaId === idea.id}
                  <Check class="h-5 w-5 text-primary flex-shrink-0" />
                {/if}
              </button>
            {/each}
          </div>

          {#if error}
            <p class="text-sm text-destructive">{error}</p>
          {/if}
        </CardContent>
        <CardFooter class="flex gap-2">
          <Button variant="outline" onclick={() => mode = 'select'} disabled={saving}>
            Back
          </Button>
          <Button onclick={handleAddToExisting} disabled={!canAddToExisting || saving}>
            {#if saving}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {:else}
              <Check class="mr-2 h-4 w-4" />
            {/if}
            Add to Selected Idea
          </Button>
        </CardFooter>
      </Card>
    {/if}
    {/if}
  {/if}
</div>
