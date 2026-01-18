<script lang="ts">
  /**
   * Social Media Embed Component
   * Feature: 006-brainstorming-moodboard
   *
   * Renders platform-specific embeds for Instagram, TikTok, YouTube
   * Falls back to thumbnail + link if embed unavailable
   * Implements graceful degradation for failed embeds
   */

  import type { SocialMediaMetadata, SocialMediaPlatform } from '$lib/types/domain/moodboard';
  import { onMount, onDestroy } from 'svelte';
  import { ExternalLink, Loader2, AlertCircle } from 'lucide-svelte';

  interface Props {
    metadata: SocialMediaMetadata;
    contentUrl: string;
    thumbnailUrl?: string | null;
    class?: string;
  }

  let { metadata, contentUrl, thumbnailUrl, class: className = '' }: Props = $props();

  // Generate unique component ID for debugging
  const componentId = Math.random().toString(36).substring(7);

  // Cache for failed attempts to prevent loops (must be declared before use)
  const FAILED_CACHE_KEY = 'social-embed-failed-attempts';

  // Check for errors IMMEDIATELY during initialization, not in onMount
  // This prevents state changes from triggering parent re-renders
  const urlValid = isValidUrl(contentUrl);
  const recentlyFailed = hasRecentlyFailed(contentUrl);
  const shouldShowError = !urlValid || recentlyFailed;

  let initialized = $state(shouldShowError); // Start initialized if we have an error
  let loading = $state(false);
  let error = $state<string | null>(
    !urlValid ? 'Invalid URL format' :
    recentlyFailed ? 'Embed unavailable - recently failed' :
    null
  );
  let errorType = $state<'network' | 'api' | 'content' | 'configuration' | null>(
    shouldShowError ? 'content' : null
  );
  let embedHtml = $state<string | null>(null);
  let hasAttemptedFetch = $state(false);
  let retryCount = $state(0);
  let hasError = $state(shouldShowError);

  let fallbackEmbedUrl = $state<string | null>(null);

  $effect(()=> {
    if (metadata.platform === 'instagram' && contentUrl && !fallbackEmbedUrl) {
      fallbackEmbedUrl = getInstagramEmbedUrl(contentUrl);
    }
  }) 

  const MAX_RETRIES = 3;
  let failedAttempts = $state<Set<string>>(new Set());

  /**
   * Validate URL format
   */
  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if this URL has recently failed
   */
  function hasRecentlyFailed(url: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const cache = sessionStorage.getItem(FAILED_CACHE_KEY);
    if (cache) {
      const failedUrls = JSON.parse(cache) as string[];
      return failedUrls.includes(url);
    }
    return false;
  }

  /**
   * Read cached failure metadata for a URL (logging only).
   */
  function getFailureMetadata(url: string): {
    entry: unknown | null;
    reason?: string;
    status?: number;
    statusText?: string;
    bodyLength?: number | null;
    errorMessage?: string;
  } {
    if (typeof window === 'undefined') return { entry: null };

    const cache = sessionStorage.getItem(FAILED_CACHE_KEY);
    if (!cache) return { entry: null };

    try {
      const failedUrls = JSON.parse(cache) as unknown;
      if (Array.isArray(failedUrls)) {
        for (const entry of failedUrls) {
          if (typeof entry === 'string' && entry === url) {
            return { entry };
          }

          if (entry && typeof entry === 'object' && 'url' in entry) {
            const typedEntry = entry as {
              url?: string;
              reason?: string;
              status?: number;
              statusText?: string;
              bodyLength?: number | null;
              errorMessage?: string;
            };
            if (typedEntry.url === url) {
              return {
                entry,
                reason: typedEntry.reason,
                status: typedEntry.status,
                statusText: typedEntry.statusText,
                bodyLength: typedEntry.bodyLength,
                errorMessage: typedEntry.errorMessage,
              };
            }
          }
        }
      }
    } catch {
      return { entry: null };
    }

    return { entry: null };
  }

  /**
   * Record a failed attempt
   */
  function recordFailedAttempt(
    url: string,
    meta?: {
      reason?: string;
      status?: number;
      statusText?: string;
      bodyLength?: number | null;
      errorMessage?: string;
    }
  ) {
    if (typeof window === 'undefined') return;
    
    const cache = sessionStorage.getItem(FAILED_CACHE_KEY);
    let failedUrls: Array<string | {
      url: string;
      reason?: string;
      status?: number;
      statusText?: string;
      bodyLength?: number | null;
      errorMessage?: string;
    }> = cache ? JSON.parse(cache) : [];
    
    // Add URL if not already present
    const alreadyPresent = failedUrls.some((entry) => {
      if (typeof entry === 'string') return entry === url;
      return entry?.url === url;
    });

    if (!alreadyPresent) {
      if (meta && Object.keys(meta).length > 0) {
        failedUrls.push({
          url,
          ...meta,
        });
      } else {
        failedUrls.push(url);
      }
      // Keep only last 50 failed attempts
      if (failedUrls.length > 50) {
        failedUrls = failedUrls.slice(-50);
      }
      sessionStorage.setItem(FAILED_CACHE_KEY, JSON.stringify(failedUrls));
    }
  }

  /**
   * Load Instagram embed script
   */
  function loadInstagramEmbed() {
    if (typeof window !== 'undefined' && !(window as any).instgrm) {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    }
  }

  /**
   * Load TikTok embed script
   */
  function loadTikTokEmbed() {
    if (typeof window !== 'undefined' && !(window as any).TikTok) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  /**
   * Extract YouTube video ID from URL
   */
  function getYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }

    return null;
  }

  function getInstagramEmbedUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const baseUrl = `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}/embed`;
      const params = new URLSearchParams({
        utm_source: 'cosplans',
      });
      return `${baseUrl}?${params.toString()}`;
    } catch {
      return `${url.replace(/\/$/, '')}/embed`;
    }
  }

  /**
   * Classify error based on response or exception
   * Returns: { type, message, retryable }
   */
  function classifyError(response: Response | null, err: any): {
    type: 'network' | 'api' | 'content' | 'configuration',
    message: string,
    retryable: boolean
  } {
    if (!response) {
      return {
        type: 'network',
        message: 'Network error - check your connection',
        retryable: true // Network errors are retryable
      };
    }

    switch (response.status) {
      case 400:
        // 400 Bad Request - client error, don't retry
        return {
          type: 'content',
          message: 'Invalid request - check URL and platform',
          retryable: false
        };
      case 401:
      case 403:
        // Authentication/authorization errors - configuration issue
        return {
          type: 'configuration',
          message: 'Authentication required or insufficient permissions',
          retryable: false
        };
      case 404:
        // Content not found - don't retry
        return {
          type: 'content',
          message: 'Content not found or is private',
          retryable: false
        };
      case 408:
      case 429:
        // Timeout or rate limit - retry with backoff
        return {
          type: 'network',
          message: response.status === 429 ? 'Rate limited - try again later' : 'Request timeout',
          retryable: true
        };
      case 503:
        // Service unavailable - retry with backoff
        return {
          type: 'configuration',
          message: 'Service temporarily unavailable',
          retryable: true
        };
      case 504:
        // Gateway timeout - retry with backoff
        return {
          type: 'network',
          message: 'Request timeout',
          retryable: true
        };
      default:
        if (response.status >= 500) {
          // Server errors - retry with backoff
          return {
            type: 'api',
            message: 'Server error',
            retryable: true
          };
        }
        // Other 4xx errors - client errors, don't retry
        return {
          type: 'content',
          message: 'Failed to load embed',
          retryable: false
        };
    }
  }

  /**
   * Fetch oEmbed data from our proxy with improved error handling and retry logic
   */
  async function fetchOEmbedData(attempt = 1) {
    // URL validation and recently-failed checks are now done in onMount
    // before this function is called, so we can proceed directly to fetching

    hasAttemptedFetch = true;
    retryCount = attempt - 1;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(
        `/api/oembed?url=${encodeURIComponent(contentUrl)}&platform=${metadata.platform}`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = 'Failed to load embed';
        let responseBodyLength: number | null = null;
        try {
          const responseText = await response.text();
          responseBodyLength = responseText.length;
          const errorData = JSON.parse(responseText);
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
          if (errorData?.note) {
            errorMessage += `: ${errorData.note}`;
          }
        } catch {
          // Use default message
        }

        if (import.meta.env.DEV) {
          console.warn('[SocialMediaEmbed] oEmbed request failed', {
            status: response.status,
            statusText: response.statusText,
            bodyLength: responseBodyLength,
          });
        }

        const classified = classifyError(response, null);
        error = errorMessage;
        errorType = classified.type;
        
        // Handle retry logic
        if (classified.retryable && attempt < MAX_RETRIES) {
          // Calculate exponential backoff: 1s, 2s, 4s
          const backoffDelay = Math.pow(2, attempt - 1) * 1000;
    if (import.meta.env.DEV) {
      console.warn(
        `[SocialMediaEmbed] Retryable error (${response.status}), retrying in ${backoffDelay}ms (attempt ${attempt}/${MAX_RETRIES})`
      );
    }
          
          setTimeout(() => {
            fetchOEmbedData(attempt + 1);
          }, backoffDelay);
          return;
        } else {
          // No more retries or non-retryable error
          if (!classified.retryable) {
            // Record non-retryable errors (400, 404, etc.)
            recordFailedAttempt(contentUrl, {
              reason: classified.type,
              status: response.status,
              statusText: response.statusText,
              bodyLength: responseBodyLength,
              errorMessage: errorMessage,
            });
          }
          hasError = true;
          loading = false;
        }
        return;
      }

      const data = await response.json();

      if (data.html) {
        embedHtml = data.html;

        // Process platform-specific embeds
        if (metadata.platform === 'instagram') {
          setTimeout(() => loadInstagramEmbed(), 100);
        } else if (metadata.platform === 'tiktok') {
          setTimeout(() => loadTikTokEmbed(), 100);
        }
      } else {
        // No HTML in response, show fallback
        error = 'Embed not available for this content';
        errorType = 'content';
        hasError = true;
      }

      loading = false;
    } catch (err) {
      clearTimeout(timeoutId);
      
      const classified = classifyError(null, err);
      error = classified.message;
      errorType = classified.type;
      
      // Handle retry logic for network errors
      if (classified.retryable && attempt < MAX_RETRIES) {
        // Calculate exponential backoff: 1s, 2s, 4s
        const backoffDelay = Math.pow(2, attempt - 1) * 1000;
      if (import.meta.env.DEV) {
        console.warn(
          `[SocialMediaEmbed] Network error, retrying in ${backoffDelay}ms (attempt ${attempt}/${MAX_RETRIES})`
        );
      }
        
        setTimeout(() => {
          fetchOEmbedData(attempt + 1);
        }, backoffDelay);
        return;
      } else {
        // No more retries or non-retryable error
        if (classified.retryable) {
          // Record retryable errors that exhausted all attempts
          recordFailedAttempt(contentUrl, {
            reason: classified.type,
            errorMessage: err instanceof Error ? err.message : String(err),
          });
        }
        console.warn('[SocialMediaEmbed] Error fetching embed:', err);
        hasError = true;
        loading = false;
      }
    }
  }

  onMount(() => {
    // If we already have an error from initialization, skip everything
    if (hasError) {
      if (recentlyFailed && import.meta.env.DEV) {
        const failureMeta = getFailureMetadata(contentUrl);
        console.warn('[SocialMediaEmbed] Skipping recently failed URL:', {
          url: contentUrl,
          failureMeta,
        });
      }
      return;
    }

    // For YouTube, generate iframe directly
    if (metadata.platform === 'youtube') {
      const videoId = getYouTubeVideoId(contentUrl);
      if (videoId) {
        embedHtml = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        initialized = true;
        return;
      } else {
        // Invalid YouTube URL
        error = 'Invalid YouTube URL';
        errorType = 'content';
        hasError = true;
        initialized = true;
        return;
      }
    }

    // For Instagram and TikTok, use oEmbed API
    if (metadata.platform === 'instagram' || metadata.platform === 'tiktok') {
      loading = true; // Only set loading when we actually start fetching
      initialized = true;
      fetchOEmbedData();
      return;
    }

    // For other platforms, show fallback immediately (loading stays false)
    initialized = true;
  });

  onDestroy(() => {
  });
</script>

<div class="social-media-embed {className}">
  {#if !initialized}
    <!-- Show nothing until we've determined what to display -->
    <!-- This prevents any flickering during the synchronous onMount checks -->
  {:else if hasError}
    <!-- Simple fallback to prevent re-render loop -->
    <div class="rounded-lg border bg-muted p-4 text-center">
      <p class="text-sm text-muted-foreground">Invalid Link</p>
      {#if error}
        <p class="text-xs text-muted-foreground mt-1">{error}</p>
      {/if}
    </div>
  {:else if loading}
    <div class="flex flex-col items-center justify-center h-64 bg-muted rounded-lg p-4">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground mb-2" />
      <p class="text-sm text-muted-foreground text-center">
        {#if retryCount > 0}
          Loading embed... (retry {retryCount}/{MAX_RETRIES})
        {:else}
          Loading embed...
        {/if}
      </p>
    </div>
  {:else if error || !embedHtml}
    <!-- Graceful fallback with error context -->
    <div class="fallback-embed rounded-lg border overflow-hidden bg-background">
      {#if errorType === 'configuration' || errorType === 'api'}
        <!-- Configuration/API errors show warning -->
        <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border-b">
          <div class="flex items-start gap-2">
            <AlertCircle class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-amber-800 dark:text-amber-300">
              <p class="font-medium">Embed configuration needed</p>
              <p class="mt-1 opacity-90">{error}</p>
              {#if retryCount > 0}
                <p class="mt-1 text-xs opacity-75">Tried {retryCount} time{retryCount === 1 ? '' : 's'}</p>
              {/if}
            </div>
          </div>
        </div>
      {:else if errorType === 'network'}
        <!-- Network errors -->
        <div class="p-4 bg-red-50 dark:bg-red-900/20 border-b">
          <div class="flex items-start gap-2">
            <AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-red-800 dark:text-red-300">
              <p class="font-medium">Connection issue</p>
              <p class="mt-1 opacity-90">{error}</p>
              {#if retryCount >= MAX_RETRIES}
                <p class="mt-1 text-xs opacity-75">Gave up after {MAX_RETRIES} attempts</p>
              {:else if retryCount > 0}
                <p class="mt-1 text-xs opacity-75">Retrying... ({retryCount}/{MAX_RETRIES})</p>
              {/if}
            </div>
          </div>
        </div>
      {:else if errorType === 'content'}
        <!-- Content errors (400, 404, etc.) -->
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border-b">
          <div class="flex items-start gap-2">
            <AlertCircle class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-blue-800 dark:text-blue-300">
              <p class="font-medium">Embed unavailable</p>
              <p class="mt-1 opacity-90">{error}</p>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Thumbnail preview -->
      {#if thumbnailUrl}
        <img
          src={thumbnailUrl}
          alt={metadata.caption || 'Social media post'}
          class="w-full h-48 object-cover"
          onerror={(evt) => { evt.currentTarget.setAttribute("style", "display: none;"); }}
        />
      {:else}
        <!-- Placeholder for missing thumbnail -->
        <div class="w-full h-48 bg-muted flex items-center justify-center">
          <ExternalLink class="h-12 w-12 text-muted-foreground opacity-50" />
        </div>
      {/if}

      {#if metadata.platform === 'instagram' && fallbackEmbedUrl}
        <div class="fallback-embed-frame border-t bg-muted/30">
          <iframe
            src={fallbackEmbedUrl}
            title="Instagram preview"
            allowfullscreen
            loading="lazy"
            class="w-full h-96"
          ></iframe>
        </div>
      {/if}
      
      <!-- Content preview -->
      <div class="p-4">
        {#if metadata.caption}
          <p class="text-sm text-muted-foreground line-clamp-3 mb-3">
            {metadata.caption}
          </p>
        {/if}

        {#if metadata.author || metadata.tags?.length}
          <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
            {#if metadata.author}
              <span>@{metadata.author}</span>
            {/if}
            {#if metadata.tags?.length}
              <span class="flex flex-wrap gap-1">
                {#each metadata.tags as tag}
                  <span class="rounded bg-muted px-2 py-0.5">#{tag}</span>
                {/each}
              </span>
            {/if}
          </div>
        {/if}
        
        <div class="flex items-center justify-between">
          <a
            href={contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
          >
            <ExternalLink class="h-4 w-4" />
            View on {metadata.platform}
          </a>
          
          {#if errorType === 'configuration' && metadata.platform === 'instagram'}
            <span class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
              Requires Facebook App setup
            </span>
          {/if}
        </div>
        
        <!-- Help text for configuration issues -->
        {#if errorType === 'configuration' && metadata.platform === 'instagram'}
          <p class="text-xs text-muted-foreground mt-3">
            Instagram embeds require a Facebook App with proper permissions.
            Update the access token in <code class="text-xs">src/routes/api/oembed/+server.ts</code>
          </p>
        {/if}
        
        <!-- Final fallback message -->
        {#if retryCount >= MAX_RETRIES}
          <p class="text-xs text-muted-foreground mt-3 italic">
            Showing fallback after {MAX_RETRIES} failed attempts
          </p>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Render embed HTML -->
    <div class="embed-container">
      {@html embedHtml}
    </div>
  {/if}
</div>

<style>
  .embed-container {
    max-width: 100%;
  }

  .embed-container :global(iframe) {
    max-width: 100%;
    border-radius: 0.5rem;
  }

  .embed-container :global(blockquote) {
    margin: 0;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  /* Instagram embed styling */
  .embed-container :global(.instagram-media) {
    max-width: 540px !important;
    min-width: 326px !important;
    margin: 0 auto;
  }

  /* TikTok embed styling */
  .embed-container :global(blockquote.tiktok-embed) {
    max-width: 605px;
    min-width: 325px;
  }
</style>
