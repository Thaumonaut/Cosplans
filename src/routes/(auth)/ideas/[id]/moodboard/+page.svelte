<script lang="ts">
  /**
   * Idea Moodboard Redirect
   * Route: /ideas/[id]/moodboard
   * Task: T-005
   *
   * Redirects to the idea's moodboard in the main moodboard editor.
   */
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { moodboardsService } from '$lib/api/services/moodboardsService';
  import { Spinner } from 'flowbite-svelte';

  const ideaId = $derived($page.params.id);

  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const moodboard = await moodboardsService.getIdeaMoodboard(ideaId);

      if (moodboard) {
        goto(`/moodboard/${moodboard.id}`, { replaceState: true });
      } else {
        error = 'Moodboard not found for this idea';
      }
    } catch (err) {
      console.error('Failed to load idea moodboard:', err);
      error = err instanceof Error ? err.message : 'Failed to load moodboard';
    }
  });
</script>

<svelte:head>
  <title>Loading Moodboard - Cosplans</title>
</svelte:head>

<div class="flex items-center justify-center h-64 p-6">
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <p class="text-red-700 dark:text-red-400">{error}</p>
    </div>
  {:else}
    <Spinner size="8" />
    <span class="ml-3 text-gray-600 dark:text-gray-400">Loading moodboard...</span>
  {/if}
</div>
