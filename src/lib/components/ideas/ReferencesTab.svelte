<script lang="ts">
  import { moodboard } from '$lib/stores/moodboard';
  import { metadataService } from '$lib/api/services/metadataService';
  import { uploadImageToStorage } from '$lib/utils/storage';
  import { currentTeam } from '$lib/stores/teams';
  import { toast } from '$lib/stores/toast';
  import { Button, Input, Label, Card, CardContent } from '$lib/components/ui';
  import { Link, Image as ImageIcon, StickyNote, Loader2, X } from 'lucide-svelte';
  import ReferenceCard from './ReferenceCard.svelte';
  import { determineNodeType } from '$lib/types/domain/moodboard';

  interface Props {
    ideaId: string;
  }

  let { ideaId }: Props = $props();

  let showUrlInput = $state(false);
  let showNoteInput = $state(false);
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
      showUrlInput = false;
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
      showNoteInput = false;
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

<div class="mx-auto max-w-5xl space-y-6 px-4 sm:px-6">
  <!-- Hidden file input -->
  <input
    id="ref-image-upload"
    type="file"
    accept="image/*"
    multiple
    hidden
    onchange={(e) => handleImageUpload(e.currentTarget.files)}
  />

  <!-- References Grid with Quick-Add Cards -->
  {#if $moodboard.loading}
    <div class="flex justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>
  {:else}
    <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Quick Add URL Card -->
      <Card class="overflow-hidden hover:shadow-lg transition-shadow {showUrlInput ? '' : 'cursor-pointer'}">
        {#if !showUrlInput}
          <CardContent
            class="pt-6 pb-4 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground hover:text-foreground transition-colors"
            onclick={() => showUrlInput = true}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && (showUrlInput = true)}
          >
            <Link class="h-12 w-12 mb-3" />
            <p class="text-sm font-medium">Add URL Reference</p>
            <p class="text-xs text-center mt-1 px-4">Instagram, TikTok, Pinterest, YouTube</p>
          </CardContent>
        {:else}
          <CardContent class="pt-6 pb-4 space-y-4">
            <div class="flex items-center justify-between mb-2">
              <Label for="inline-url" class="text-sm font-medium">URL</Label>
              <Button
                variant="ghost"
                size="sm"
                onclick={() => { showUrlInput = false; urlInput = ''; }}
                class="h-8 w-8 p-0"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="inline-url"
              bind:value={urlInput}
              placeholder="https://instagram.com/p/..."
              disabled={extracting}
              class="w-full"
              autofocus
              onkeydown={(e) => {
                if (e.key === 'Enter' && urlInput.trim()) {
                  handleAddUrl();
                } else if (e.key === 'Escape') {
                  showUrlInput = false;
                  urlInput = '';
                }
              }}
            />
            <Button
              size="sm"
              onclick={handleAddUrl}
              disabled={!urlInput.trim() || extracting}
              class="w-full"
            >
              {#if extracting}
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              {/if}
              Add Reference
            </Button>
          </CardContent>
        {/if}
      </Card>

      <!-- Quick Add Note Card -->
      <Card class="overflow-hidden hover:shadow-lg transition-shadow {showNoteInput ? '' : 'cursor-pointer'}">
        {#if !showNoteInput}
          <CardContent
            class="pt-6 pb-4 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground hover:text-foreground transition-colors"
            onclick={() => showNoteInput = true}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && (showNoteInput = true)}
          >
            <StickyNote class="h-12 w-12 mb-3" />
            <p class="text-sm font-medium">Add Note</p>
            <p class="text-xs text-center mt-1 px-4">Write thoughts, ideas, or reminders</p>
          </CardContent>
        {:else}
          <CardContent class="pt-6 pb-4 space-y-4">
            <div class="flex items-center justify-between mb-2">
              <Label for="inline-note" class="text-sm font-medium">Note</Label>
              <Button
                variant="ghost"
                size="sm"
                onclick={() => { showNoteInput = false; noteText = ''; }}
                class="h-8 w-8 p-0"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
            <textarea
              id="inline-note"
              bind:value={noteText}
              placeholder="Write your thoughts, ideas, or reminders..."
              rows="4"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              autofocus
              onkeydown={(e) => {
                if (e.key === 'Escape') {
                  showNoteInput = false;
                  noteText = '';
                }
              }}
            />
            <Button
              size="sm"
              onclick={handleAddNote}
              disabled={!noteText.trim()}
              class="w-full"
            >
              Add Note
            </Button>
          </CardContent>
        {/if}
      </Card>

      <!-- Upload Image Card -->
      <Card class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent
          class="pt-6 pb-4 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground hover:text-foreground transition-colors"
          onclick={() => document.getElementById('ref-image-upload')?.click()}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && document.getElementById('ref-image-upload')?.click()}
        >
          {#if uploading}
            <Loader2 class="h-12 w-12 mb-3 animate-spin" />
            <p class="text-sm font-medium">Uploading...</p>
          {:else}
            <ImageIcon class="h-12 w-12 mb-3" />
            <p class="text-sm font-medium">Upload Image</p>
            <p class="text-xs text-center mt-1 px-4">Click to select images</p>
          {/if}
        </CardContent>
      </Card>

      <!-- Existing Reference Cards -->
      {#each $moodboard.nodes as node (node.id)}
        <ReferenceCard {node} onDelete={handleDeleteNode} />
      {/each}
    </div>
  {/if}

</div>
