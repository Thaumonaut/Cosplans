/**
 * oEmbed Proxy API
 * Feature: 006-brainstorming-moodboard
 *
 * Server-side proxy for fetching oEmbed data from social media platforms
 * Handles CORS issues and provides consistent interface
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface OEmbedResponse {
  html?: string;
  thumbnail_url?: string;
  title?: string;
  author_name?: string;
  width?: number;
  height?: number;
}

/**
 * Get oEmbed endpoint for platform
 */
function getOEmbedEndpoint(platform: string, url: string): string | null {
  const encodedUrl = encodeURIComponent(url);

  switch (platform) {
    case 'instagram':
      // Instagram oEmbed (requires Facebook App)
      // Note: Instagram deprecated their oEmbed API for most use cases
      // This may require a Facebook App ID: access_token parameter
      return `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodedUrl}&access_token=EAAStIwEIpJ8BQUDnxhZBqhE3uAppZB0WMSF4ynWP22lNO7G5LZCZBnKIkzZAxzSgtJdnSlz8qg05xRMtIZBrtTqBD4DMKzuz4fWU72ao9DYilOf0jraJDTESZAWZBP8Q2NxZBfVAG8lT7m8SvimGg3VZBOJQ1KnnHKRFSyhW8W568xo03Dn1WLNNZCG4ON3JYU9x5ewrUnF37tEt67xxxuA3D8Mcv3YZAOolHZCHkWhvXmyQDyk8Hi3VinjXG`;

    case 'tiktok':
      return `https://www.tiktok.com/oembed?url=${encodedUrl}`;

    case 'youtube':
      // YouTube oEmbed
      return `https://www.youtube.com/oembed?url=${encodedUrl}&format=json`;

    case 'facebook':
      // Facebook oEmbed requires access token
      return null;

    default:
      return null;
  }
}

export const GET: RequestHandler = async ({ url: requestUrl }) => {
  const url = requestUrl.searchParams.get('url');
  const platform = requestUrl.searchParams.get('platform');

  if (!url || !platform) {
    return json({ error: 'Missing url or platform parameter' }, { status: 400 });
  }

  try {
    const oembedEndpoint = getOEmbedEndpoint(platform, url);

    if (!oembedEndpoint) {
      return json({ error: `oEmbed not supported for platform: ${platform}` }, { status: 400 });
    }

    // Note: Instagram requires Facebook App credentials
    // For Instagram, we'll attempt the request but expect it may fail without proper credentials
    // We provide a helpful error message if it fails due to authentication

    // Fetch oEmbed data with proper headers
    const response = await fetch(oembedEndpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Cosplans/1.0; +https://cosplans.com)',
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`[oEmbed] Failed to fetch from ${platform}:`, response.status, response.statusText);
      
      // Provide more helpful error messages for specific platforms
      let errorMessage = 'Failed to fetch embed data';
      let note = '';
      
      if (platform === 'instagram') {
        if (response.status === 400 || response.status === 403) {
          errorMessage = 'Instagram embed requires Facebook App configuration';
          note = 'Please configure a valid Facebook access token in the API endpoint';
        } else if (response.status === 404) {
          errorMessage = 'Instagram post not found or is private';
        }
      } else if (platform === 'tiktok' && response.status === 404) {
        errorMessage = 'TikTok video not found or is private';
      } else if (platform === 'youtube' && response.status === 404) {
        errorMessage = 'YouTube video not found or is private';
      }
      
      return json({
        error: errorMessage,
        note: note,
        platform: platform,
        status: response.status
      }, { status: response.status });
    }

    const data: OEmbedResponse = await response.json();

    // Return oEmbed data
    return json(data);
  } catch (error) {
    console.error('[oEmbed] Error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return json({ error: 'Request timeout' }, { status: 504 });
    }

    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
