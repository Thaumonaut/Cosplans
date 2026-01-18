<script lang="ts">
  import { moodboard } from '$lib/stores/moodboard';
  import { metadataService } from '$lib/api/services/metadataService';
  import { uploadImageToStorage } from '$lib/utils/storage';
  import { currentTeam } from '$lib/stores/teams';
  import { toast } from '$lib/stores/toast';
  import { Button, Input, Label, Card, CardContent, Dialog, DialogFooter, Textarea } from '$lib/components/ui';
  import { Link, Image as ImageIcon, StickyNote, Loader2, X, Plus } from 'lucide-svelte';
  import ReferenceCard from './ReferenceCard.svelte';
  import { determineNodeType } from '$lib/types/domain/moodboard';

  interface Props {
    ideaId: string;
  }

  let { ideaId }: Props = $props();

  let showAddReferenceModal = $state(false);
  let selectedType = $state<'url' | 'note' | 'image'>('url');
  let urlInput = $state('');
  let noteText = $state('');
  let uploading = $state(false);
  let extracting = $state(false);
  let selectedFiles = $state<FileList | null>(null);

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
      showAddReferenceModal = false;
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
      showAddReferenceModal = false;
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
      selectedFiles = null;
    }
  }

  function resetModalState() {
    urlInput = '';
    noteText = '';
    selectedFiles = null;
    extracting = false;
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

<div class="mx-auto max-w-5xl space-y-6 px-4 sm:px-6">
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold">References</h3>
      <p class="text-sm text-muted-foreground">Save links, images, or notes for inspiration.</p>
    </div>
    <Button onclick={() => {
      showAddReferenceModal = true;
      selectedType = 'url';
    }}>
      <Plus class="h-4 w-4" />
      Add Reference
    </Button>
  </div>

  <!-- Hidden file input -->
  <input
    id="ref-image-upload"
    type="file"
    accept="image/*"
    multiple
    hidden
    onchange={(e) => {
      selectedFiles = e.currentTarget.files;
    }}
  />

  <!-- References Grid with Quick-Add Cards -->
  {#if $moodboard.loading}
    <div class="flex justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>
  {:else}
    <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Existing Reference Cards -->
      {#each $moodboard.nodes as node (node.id)}
        <ReferenceCard {node} onDelete={handleDeleteNode} />
      {/each}
    </div>
  {/if}

  <Dialog
    bind:open={showAddReferenceModal}
    title="Add Reference"
    description="Choose the type of content and add it to the moodboard."
    onOpenChange={(open) => {
      showAddReferenceModal = open;
      if (!open) resetModalState();
    }}
  >
    <div class="space-y-5">
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors {selectedType === 'url' ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:text-foreground'}"
          onclick={() => selectedType = 'url'}
        >
          <Link class="h-4 w-4" />
          URL
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors {selectedType === 'note' ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:text-foreground'}"
          onclick={() => selectedType = 'note'}
        >
          <StickyNote class="h-4 w-4" />
          Note
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors {selectedType === 'image' ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:text-foreground'}"
          onclick={() => selectedType = 'image'}
        >
          <ImageIcon class="h-4 w-4" />
          Image
        </button>
      </div>

      {#if selectedType === 'url'}
        <div class="space-y-3">
          <Label for="reference-url" class="text-sm font-medium">URL</Label>
          <Input
            id="reference-url"
            bind:value={urlInput}
            placeholder="https://instagram.com/p/..."
            disabled={extracting}
            class="w-full"
            onkeydown={(e) => {
              if (e.key === 'Enter' && urlInput.trim()) {
                handleAddUrl();
              }
            }}
          />
          <p class="text-xs text-muted-foreground">Instagram, TikTok, Pinterest, YouTube, and other links.</p>
        </div>
      {:else if selectedType === 'note'}
        <div class="space-y-3">
          <Label for="reference-note" class="text-sm font-medium">Note</Label>
          <Textarea
            id="reference-note"
            bind:value={noteText}
            placeholder="Write your thoughts, ideas, or reminders..."
            rows={5}
          />
        </div>
      {:else}
        <div class="space-y-3">
          <Label class="text-sm font-medium">Images</Label>
          <Button variant="outline" onclick={() => document.getElementById('ref-image-upload')?.click()}>
            <ImageIcon class="h-4 w-4" />
            Choose Images
          </Button>
          {#if selectedFiles?.length}
            <p class="text-xs text-muted-foreground">Selected {selectedFiles.length} image{selectedFiles.length === 1 ? '' : 's'}.</p>
          {:else}
            <p class="text-xs text-muted-foreground">Select one or more images to upload.</p>
          {/if}
        </div>
      {/if}
    </div>

    <DialogFooter class="mt-6">
      <Button variant="outline" onclick={() => { showAddReferenceModal = false; resetModalState(); }}>
        Cancel
      </Button>
      {#if selectedType === 'url'}
        <Button onclick={handleAddUrl} disabled={!urlInput.trim() || extracting}>
          {#if extracting}
            <Loader2 class="h-4 w-4 animate-spin" />
          {/if}
          Add URL
        </Button>
      {:else if selectedType === 'note'}
        <Button onclick={handleAddNote} disabled={!noteText.trim()}>
          Add Note
        </Button>
      {:else}
        <Button
          onclick={async () => {
            await handleImageUpload(selectedFiles);
            if (!uploading) {
              showAddReferenceModal = false;
              resetModalState();
            }
          }}
          disabled={!selectedFiles || uploading}
        >
          {#if uploading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {/if}
          Upload Images
        </Button>
      {/if}
    </DialogFooter>
  </Dialog>
</div>
