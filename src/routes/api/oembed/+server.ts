/**
 * oEmbed Proxy API
 * Feature: 006-brainstorming-moodboard
 *
 * Server-side proxy for fetching oEmbed data from social media platforms
 * Handles CORS issues and provides consistent interface
 */

import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
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
function getOEmbedEndpoint(
  platform: string,
  url: string,
  accessToken?: string
): string | null {
  const endpoint = (() => {
    switch (platform) {
      case 'instagram':
        return 'https://graph.facebook.com/v18.0/instagram_oembed';
      case 'tiktok':
        return 'https://www.tiktok.com/oembed';
      case 'youtube':
        return 'https://www.youtube.com/oembed';
      case 'facebook':
        return 'https://graph.facebook.com/v18.0/oembed_post';
      default:
        return null;
    }
  })();

  if (!endpoint) return null;

  if ((platform === 'instagram' || platform === 'facebook') && !accessToken) {
    return null;
  }

  const endpointUrl = new URL(endpoint);
  endpointUrl.searchParams.set('url', url);

  if (platform === 'youtube') {
    endpointUrl.searchParams.set('format', 'json');
  }

  if (platform === 'instagram' || platform === 'facebook') {
    endpointUrl.searchParams.set('access_token', accessToken ?? '');
  }

  return endpointUrl.toString();
}

function sanitizeUpstreamBody(body: string): string {
  if (!body) return '';

  const redactedAccessToken = body
    .replace(/access_token=([^&\s"']+)/gi, 'access_token=[redacted]')
    .replace(/"access_token"\s*:\s*"[^"]+"/gi, '"access_token":"[redacted]"');

  return redactedAccessToken
    .replace(/https?:\/\/[^\s"']+/gi, '[redacted-url]')
    .slice(0, 1000);
}

export const GET: RequestHandler = async ({ url: requestUrl }) => {
  const url = requestUrl.searchParams.get('url');
  const platform = requestUrl.searchParams.get('platform');
  const accessToken = env.FACEBOOK_OEMBED_ACCESS_TOKEN;
  const shouldLogDiagnostics = dev;

  if (!url || !platform) {
    return json({ error: 'Missing url or platform parameter' }, { status: 400 });
  }

  if ((platform === 'instagram' || platform === 'facebook') && !accessToken) {
    return json(
      {
        error: 'Facebook oEmbed access token not configured',
        note: 'Set FACEBOOK_OEMBED_ACCESS_TOKEN in the server environment',
        platform,
      },
      { status: 400 }
    );
  }

  try {
    const oembedEndpoint = getOEmbedEndpoint(platform, url, accessToken);

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
      const rawErrorBody = await response.text();

      if (shouldLogDiagnostics) {
        console.warn('[oEmbed] Upstream oEmbed failure', {
          platform,
          status: response.status,
          statusText: response.statusText,
          bodyLength: rawErrorBody.length,
        });
      }

      const sanitizedBody = sanitizeUpstreamBody(rawErrorBody);

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

      return json(
        {
          error: errorMessage,
          note: note,
          platform: platform,
          status: response.status,
          ...(shouldLogDiagnostics
            ? {
                upstreamError: {
                  status: response.status,
                  statusText: response.statusText,
                  body: sanitizedBody,
                },
              }
            : {}),
        },
        { status: response.status }
      );
    }

    const data: OEmbedResponse = await response.json();

    // Return oEmbed data
    return json(data);
  } catch (error) {
    if (shouldLogDiagnostics) {
      console.error('[oEmbed] Error:', error);
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return json({ error: 'Request timeout' }, { status: 504 });
    }

    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
