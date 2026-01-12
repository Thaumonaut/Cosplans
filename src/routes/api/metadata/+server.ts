/**
 * Metadata Extraction API
 * Feature: 006-brainstorming-moodboard
 *
 * Server-side URL fetching and metadata extraction.
 * Extracts Open Graph tags, Twitter Card tags, and basic HTML meta tags
 * from external URLs to avoid CORS issues.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface ExtractedMetadata {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  siteName?: string;
  platform?: string;
  postId?: string;
  author?: string;
  success: boolean;
  error?: string;
}

export const GET: RequestHandler = async ({ url, fetch }) => {
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return json(
      {
        success: false,
        error: 'Missing required parameter: url',
      } as ExtractedMetadata,
      { status: 400 }
    );
  }

  console.log('[Metadata API] Extracting metadata from:', targetUrl);

  try {
    // Validate URL
    const parsedUrl = new URL(targetUrl);

    // Fetch the URL with a proper User-Agent to avoid bot blocking
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Cosplans/1.0; +https://cosplans.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      // Set a timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    if (!response.ok) {
      console.warn('[Metadata API] Failed to fetch URL:', response.status, response.statusText);
      return json(
        {
          success: false,
          error: `Failed to fetch URL: ${response.statusText}`,
        } as ExtractedMetadata,
        { status: response.status }
      );
    }

    const html = await response.text();

    // Extract metadata using regex (MVP approach)
    const metadata: ExtractedMetadata = {
      success: true,
    };

    // Open Graph tags
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i);

    // Twitter Card tags (fallback)
    const twitterTitle = html.match(/<meta\s+name="twitter:title"\s+content="([^"]+)"/i);
    const twitterDescription = html.match(/<meta\s+name="twitter:description"\s+content="([^"]+)"/i);
    const twitterImage = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);

    // Standard HTML meta tags (fallback)
    const metaDescription = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    // Populate metadata with priority: OG > Twitter > HTML
    metadata.title = ogTitle?.[1] || twitterTitle?.[1] || titleTag?.[1] || parsedUrl.hostname;
    metadata.description =
      ogDescription?.[1] || twitterDescription?.[1] || metaDescription?.[1];
    metadata.thumbnailUrl = ogImage?.[1] || twitterImage?.[1];
    metadata.siteName = ogSiteName?.[1] || parsedUrl.hostname;

    // Detect platform from URL
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname.includes('instagram.com')) {
      metadata.platform = 'instagram';
      // Extract post ID from Instagram URL
      const instagramPostId = targetUrl.match(/\/p\/([A-Za-z0-9_-]+)/);
      if (instagramPostId) {
        metadata.postId = instagramPostId[1];
      }
    } else if (hostname.includes('tiktok.com')) {
      metadata.platform = 'tiktok';
      // Extract video ID from TikTok URL
      const tiktokVideoId = targetUrl.match(/\/video\/(\d+)/);
      if (tiktokVideoId) {
        metadata.postId = tiktokVideoId[1];
      }
    } else if (hostname.includes('pinterest.com')) {
      metadata.platform = 'pinterest';
      // Extract pin ID from Pinterest URL
      const pinterestPinId = targetUrl.match(/\/pin\/(\d+)/);
      if (pinterestPinId) {
        metadata.postId = pinterestPinId[1];
      }
    } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      metadata.platform = 'youtube';
      // Extract video ID from YouTube URL
      const youtubeVideoId =
        targetUrl.match(/[?&]v=([A-Za-z0-9_-]+)/) || targetUrl.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
      if (youtubeVideoId) {
        metadata.postId = youtubeVideoId[1];
      }
    } else if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      metadata.platform = 'facebook';
    }

    // Try to extract author from various meta tags
    const ogAuthor = html.match(/<meta\s+property="og:author"\s+content="([^"]+)"/i);
    const articleAuthor = html.match(/<meta\s+name="author"\s+content="([^"]+)"/i);
    if (ogAuthor?.[1] || articleAuthor?.[1]) {
      metadata.author = ogAuthor?.[1] || articleAuthor?.[1];
    }

    console.log('[Metadata API] Extracted metadata:', metadata);

    return json(metadata);
  } catch (error) {
    console.error('[Metadata API] Error extracting metadata:', error);

    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract metadata',
      } as ExtractedMetadata,
      { status: 500 }
    );
  }
};
