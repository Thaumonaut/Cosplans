<script lang="ts">
  /**
   * Edit Node Modal
   * Feature: 006-brainstorming-moodboard
   * Task: T-006
   *
   * Modal for editing existing moodboard nodes.
   */
  import { Modal, Button, Input, Textarea, Label } from 'flowbite-svelte';
  import { X } from 'lucide-svelte';
  import type { MoodboardNode, MoodboardNodeUpdate, ContainerType } from '$lib/types/domain/moodboard';

  interface Props {
    open?: boolean;
    node: MoodboardNode | null;
    onClose: () => void;
    onSave: (nodeId: string, updates: MoodboardNodeUpdate) => Promise<void>;
  }

  let { open = $bindable(false), node, onClose, onSave }: Props = $props();

  // Form state
  let title = $state('');
  let shortComment = $state('');
  let longNote = $state('');
  let tags = $state('');
  let contentUrl = $state('');
  let saving = $state(false);
  let error = $state<string | null>(null);

  // Sync form state when node changes
  $effect(() => {
    if (node && open) {
      title = node.title || '';
      shortComment = node.shortComment || '';
      longNote = node.longNote || '';
      tags = node.tags.join(', ');
      contentUrl = node.contentUrl || '';
    }
  });

  function resetForm() {
    title = '';
    shortComment = '';
    longNote = '';
    tags = '';
    contentUrl = '';
    error = null;
  }

  function handleClose() {
    resetForm();
    open = false;
    onClose();
  }

  async function handleSave() {
    if (!node) return;

    error = null;
    saving = true;

    try {
      // Validate URL if provided
      if (contentUrl && node.nodeType !== 'note' && node.nodeType !== 'container') {
        try {
          new URL(contentUrl);
        } catch {
          error = 'Please enter a valid URL';
          saving = false;
          return;
        }
      }

      const updates: MoodboardNodeUpdate = {
        title: title || null,
        shortComment: shortComment || null,
        longNote: longNote || null,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      // Only include URL for link/social_media types
      if (node.nodeType === 'link' || node.nodeType === 'social_media') {
        updates.contentUrl = contentUrl || null;
      }

      await onSave(node.id, updates);
      handleClose();
    } catch (err) {
      console.error('Failed to save node:', err);
      error = err instanceof Error ? err.message : 'Failed to save';
    } finally {
      saving = false;
    }
  }

  // Get display name for node type
  function getNodeTypeName(n: MoodboardNode): string {
    if (n.nodeType === 'container') {
      return n.containerType
        ? n.containerType.charAt(0).toUpperCase() + n.containerType.slice(1)
        : 'Container';
    }
    switch (n.nodeType) {
      case 'social_media': return 'Social Media Link';
      case 'link': return 'Link';
      case 'note': return 'Note';
      case 'image': return 'Image';
      default: return n.nodeType;
    }
  }
</script>

<Modal bind:open size="md" dismissable={false}>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Edit {node ? getNodeTypeName(node) : 'Item'}</h3>
        {#if node?.nodeType === 'social_media' || node?.nodeType === 'link'}
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">
            {node.contentUrl}
          </p>
        {/if}
      </div>
      <button
        onclick={handleClose}
        class="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        disabled={saving}
      >
        <X class="size-5" />
      </button>
    </div>

    {#if error}
      <div class="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    {/if}

    {#if node}
      <div class="space-y-4">
        <!-- Title -->
        <div>
          <Label for="edit-title" class="mb-2">
            {node.nodeType === 'container' ? 'Name' : 'Title'}
          </Label>
          <Input
            id="edit-title"
            bind:value={title}
            placeholder={node.nodeType === 'container' ? 'Container name' : 'Title'}
          />
        </div>

        <!-- URL (for link types) -->
        {#if node.nodeType === 'link' || node.nodeType === 'social_media'}
          <div>
            <Label for="edit-url" class="mb-2">URL</Label>
            <Input
              id="edit-url"
              type="url"
              bind:value={contentUrl}
              placeholder="https://..."
            />
          </div>
        {/if}

        <!-- Short comment -->
        <div>
          <Label for="edit-comment" class="mb-2">
            {node.nodeType === 'note' ? 'Note' : 'Comment'}
          </Label>
          <Textarea
            id="edit-comment"
            bind:value={shortComment}
            placeholder={node.nodeType === 'note' ? 'Your note...' : 'Why you saved this...'}
            rows={3}
          />
        </div>

        <!-- Long note (for non-note types) -->
        {#if node.nodeType !== 'note'}
          <div>
            <Label for="edit-note" class="mb-2">Notes</Label>
            <Textarea
              id="edit-note"
              bind:value={longNote}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        {/if}

        <!-- Tags -->
        <div>
          <Label for="edit-tags" class="mb-2">Tags</Label>
          <Input
            id="edit-tags"
            bind:value={tags}
            placeholder="fabric, red, wig (comma separated)"
          />
        </div>

        <!-- Metadata display (read-only) -->
        {#if node.nodeType === 'social_media' && 'platform' in node.metadata}
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform</div>
            <div class="text-sm text-gray-900 dark:text-white capitalize">{node.metadata.platform}</div>
          </div>
        {/if}
      </div>

      <!-- Actions -->
      <div class="mt-6 flex gap-3">
        <Button color="light" class="flex-1" onclick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button color="primary" class="flex-1" onclick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    {/if}
  </div>
</Modal>
