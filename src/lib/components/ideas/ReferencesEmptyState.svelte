<script lang="ts">
  import { Button } from '$lib/components/ui';
  import { Link, StickyNote, Image as ImageIcon, Sparkles } from 'lucide-svelte';

  interface Props {
    onAddUrl: () => void;
    onAddNote: () => void;
    onUploadImage: () => void;
  }

  let { onAddUrl, onAddNote, onUploadImage }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div class="mb-6 rounded-full bg-primary/10 p-6">
    <Sparkles class="h-12 w-12 text-primary" />
  </div>

  <h3 class="text-xl font-semibold mb-2">No References Yet</h3>
  <p class="text-muted-foreground mb-8 max-w-md">
    Start collecting inspiration! Add URLs from social media, upload reference images, or jot down notes about your cosplay ideas.
  </p>

  <div class="flex flex-wrap gap-3 justify-center">
    <Button onclick={onAddUrl}>
      <Link class="mr-2 h-4 w-4" />
      Add URL
    </Button>
    <Button onclick={onAddNote} variant="outline">
      <StickyNote class="mr-2 h-4 w-4" />
      Add Note
    </Button>
    <Button onclick={onUploadImage} variant="outline">
      <ImageIcon class="mr-2 h-4 w-4" />
      Upload Image
    </Button>
  </div>

  <div class="mt-8 text-sm text-muted-foreground max-w-md">
    <p class="font-medium mb-2">💡 Tips:</p>
    <ul class="text-left space-y-1">
      <li>• Copy-paste URLs from Instagram, TikTok, Pinterest, or YouTube</li>
      <li>• Upload photos from your camera or gallery</li>
      <li>• Write notes about materials, techniques, or ideas</li>
    </ul>
  </div>
</div>
