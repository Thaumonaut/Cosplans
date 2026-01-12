<script lang="ts">
  import { moodboard } from '$lib/stores/moodboard';
  import { metadataService } from '$lib/api/services/metadataService';
  import { uploadImageToStorage } from '$lib/utils/storage';
  import { currentTeam } from '$lib/stores/teams';
  import { toast } from '$lib/stores/toast';
  import { Button, Input, Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Label } from '$lib/components/ui';
  import { Link, Image as ImageIcon, StickyNote, Loader2 } from 'lucide-svelte';
  import ReferenceCard from './ReferenceCard.svelte';
  import ReferencesEmptyState from './ReferencesEmptyState.svelte';
  import { determineNodeType } from '$lib/types/domain/moodboard';

  interface Props {
    ideaId: string;
  }

  let { ideaId }: Props = $props();

  let showAddUrlDialog = $state(false);
  let showAddNoteDialog = $state(false);
  let urlInput = $state('');
  let noteText = $state('');
  let uploading = $state(false);
  let extracting = $state(false);

  /**
   * Add URL reference
   */
  async function handleAddUrl() {
    if (!urlInput.trim()) return;

    const team = $currentTeam;
    if (!team) {
      toast.error('Error', 'No team selected');
      return;
    }

    extracting = true;
    try {
      // Extract metadata from URL
      const metadata = await metadataService.extractFromUrl(urlInput);

      // Determine node type
      const nodeType = determineNodeType({ url: urlInput });

      // Convert extracted metadata to node metadata
      const nodeMetadata = metadataService.toNodeMetadata(metadata, urlInput);

      // Create the node
      await moodboard.createNode({
        ideaId,
        nodeType,
        contentUrl: urlInput,
        thumbnailUrl: metadata.thumbnailUrl,
        metadata: nodeMetadata,
        shortComment: metadata.title,
        tags: [],
      });

      toast.success('Reference Added', 'URL reference added to moodboard');
      showAddUrlDialog = false;
      urlInput = '';
    } catch (err: any) {
      console.error('[ReferencesTab] Error adding URL:', err);
      toast.error('Failed to Add Reference', err?.message || 'An error occurred');
    } finally {
      extracting = false;
    }
  }

  /**
   * Add note
   */
  async function handleAddNote() {
    if (!noteText.trim()) return;

    try {
      await moodboard.createNode({
        ideaId,
        nodeType: 'note',
        longNote: noteText.trim(),
        tags: [],
      });

      toast.success('Note Added', 'Note added to moodboard');
      showAddNoteDialog = false;
      noteText = '';
    } catch (err: any) {
      console.error('[ReferencesTab] Error adding note:', err);
      toast.error('Failed to Add Note', err?.message || 'An error occurred');
    }
  }

  /**
   * Handle image upload
   */
  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const team = $currentTeam;
    if (!team) {
      toast.error('Error', 'No team selected');
      return;
    }

    uploading = true;
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Upload to Supabase Storage
          const result = await uploadImageToStorage(file, 'moodboard', team.id);

          // Create image node
          await moodboard.createNode({
            ideaId,
            nodeType: 'image',
            contentUrl: result.url,
            thumbnailUrl: result.url, // Use same URL for thumbnail
            metadata: {
              original_filename: file.name,
              file_size: file.size,
              mime_type: file.type,
              storage_path: result.path,
            },
            tags: [],
          });

          successCount++;
        } catch (err) {
          console.error('[ReferencesTab] Error uploading image:', file.name, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          'Images Uploaded',
          `${successCount} image${successCount > 1 ? 's' : ''} added to moodboard`
        );
      }

      if (failCount > 0) {
        toast.error(
          'Upload Failed',
          `Failed to upload ${failCount} image${failCount > 1 ? 's' : ''}`
        );
      }
    } catch (err: any) {
      console.error('[ReferencesTab] Error in image upload:', err);
      toast.error('Upload Failed', err?.message || 'An error occurred');
    } finally {
      uploading = false;
      // Reset file input
      const fileInput = document.getElementById('ref-image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  /**
   * Delete node
   */
  async function handleDeleteNode(nodeId: string) {
    try {
      await moodboard.deleteNode(nodeId);
      toast.success('Reference Deleted', 'Reference removed from moodboard');
    } catch (err: any) {
      console.error('[ReferencesTab] Error deleting node:', err);
      toast.error('Failed to Delete', err?.message || 'An error occurred');
    }
  }
</script>

<div class="mx-auto max-w-5xl space-y-6">
  <!-- Action Bar -->
  <div class="flex flex-wrap gap-2">
    <Button onclick={() => showAddUrlDialog = true} disabled={uploading}>
      <Link class="mr-2 h-4 w-4" />
      Add URL
    </Button>
    <Button onclick={() => showAddNoteDialog = true} disabled={uploading}>
      <StickyNote class="mr-2 h-4 w-4" />
      Add Note
    </Button>
    <Button onclick={() => document.getElementById('ref-image-upload')?.click()} disabled={uploading}>
      {#if uploading}
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      {:else}
        <ImageIcon class="mr-2 h-4 w-4" />
      {/if}
      Upload Image
    </Button>
    <input
      id="ref-image-upload"
      type="file"
      accept="image/*"
      multiple
      hidden
      onchange={(e) => handleImageUpload(e.currentTarget.files)}
    />
  </div>

  <!-- References Grid -->
  {#if $moodboard.loading}
    <div class="flex justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>
  {:else if $moodboard.nodes.length === 0}
    <ReferencesEmptyState
      onAddUrl={() => showAddUrlDialog = true}
      onAddNote={() => showAddNoteDialog = true}
      onUploadImage={() => document.getElementById('ref-image-upload')?.click()}
    />
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each $moodboard.nodes as node (node.id)}
        <ReferenceCard {node} onDelete={handleDeleteNode} />
      {/each}
    </div>
  {/if}

  <!-- Add URL Dialog -->
  <Dialog bind:open={showAddUrlDialog}>
    <div slot="content" class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add Reference URL</DialogTitle>
        <DialogDescription>
          Paste a link from Instagram, TikTok, Pinterest, YouTube, or any website
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="url-input">URL</Label>
          <Input
            id="url-input"
            bind:value={urlInput}
            placeholder="https://instagram.com/p/..."
            disabled={extracting}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onclick={() => showAddUrlDialog = false}>
          Cancel
        </Button>
        <Button onclick={handleAddUrl} disabled={!urlInput.trim() || extracting}>
          {#if extracting}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          {/if}
          Add Reference
        </Button>
      </DialogFooter>
    </div>
  </Dialog>

  <!-- Add Note Dialog -->
  <Dialog bind:open={showAddNoteDialog}>
    <div slot="content" class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add Note</DialogTitle>
        <DialogDescription>
          Write a note about this cosplay idea
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="note-input">Note</Label>
          <textarea
            id="note-input"
            bind:value={noteText}
            placeholder="Write your thoughts, ideas, or reminders..."
            rows="4"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onclick={() => showAddNoteDialog = false}>
          Cancel
        </Button>
        <Button onclick={handleAddNote} disabled={!noteText.trim()}>
          Add Note
        </Button>
      </DialogFooter>
    </div>
  </Dialog>
</div>
