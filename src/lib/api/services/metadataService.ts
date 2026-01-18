/**
 * Metadata Service
 * Feature: 006-brainstorming-moodboard
 *
 * Client-side service for extracting metadata from URLs.
 * Wraps the metadata API and provides platform detection.
 */

import type { MoodboardNodeMetadata, SocialMediaPlatform } from '$lib/types/domain/moodboard';
import { detectPlatformFromUrl } from '$lib/types/domain/moodboard';

export interface ExtractedMetadata {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  siteName?: string;
  platform?: string;
  postId?: string;
  author?: string;
  tags?: string[];
  success: boolean;
  error?: string;
}

export const metadataService = {
  /**
   * Extract metadata from a URL by calling the server-side API
   */
  async extractFromUrl(url: string): Promise<ExtractedMetadata> {
    try {
      // Call the metadata API
      const apiUrl = `/api/metadata?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error('[Metadata Service] API call failed:', response.status, response.statusText);
        return {
          success: false,
          error: `Failed to extract metadata: ${response.statusText}`,
        };
      }

      const metadata: ExtractedMetadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('[Metadata Service] Error extracting metadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract metadata',
      };
    }
  },

  /**
   * Convert extracted metadata to moodboard node metadata format
   */
  toNodeMetadata(
    extracted: ExtractedMetadata,
    url: string
  ): MoodboardNodeMetadata {
    const platform = extracted.platform as SocialMediaPlatform | undefined;

    // If it's a social media platform, create social media metadata
    if (platform && ['instagram', 'tiktok', 'pinterest', 'youtube', 'facebook'].includes(platform)) {
      const normalizedTags = (extracted.tags || [])
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      return {
        platform: platform as SocialMediaPlatform,
        post_id: extracted.postId,
        author: extracted.author,
        caption: extracted.description,
        tags: normalizedTags.length > 0 ? normalizedTags : undefined,
        extracted_at: new Date().toISOString(),
      };
    }

    // Otherwise, create link metadata
    return {
      title: extracted.title,
      description: extracted.description,
      site_name: extracted.siteName,
      og_image: extracted.thumbnailUrl,
    };
  },

  /**
   * Quick platform detection from URL (synchronous)
   */
  detectPlatform(url: string): SocialMediaPlatform | null {
    return detectPlatformFromUrl(url);
  },

  /**
   * Check if a URL is from a social media platform
   */
  isSocialMediaUrl(url: string): boolean {
    const platform = detectPlatformFromUrl(url);
    return platform !== null;
  },

  /**
   * Get a display name for a platform
   */
  getPlatformDisplayName(platform: SocialMediaPlatform): string {
    const displayNames: Record<SocialMediaPlatform, string> = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      pinterest: 'Pinterest',
      youtube: 'YouTube',
      facebook: 'Facebook',
    };
    return displayNames[platform] || platform;
  },

  /**
   * Get a platform icon name (for Lucide icons)
   */
  getPlatformIcon(platform: SocialMediaPlatform): string {
    const icons: Record<SocialMediaPlatform, string> = {
      instagram: 'Instagram',
      tiktok: 'Music', // TikTok icon not in Lucide, use Music as proxy
      pinterest: 'Pin', // Pinterest icon not in Lucide, use Pin
      youtube: 'Youtube',
      facebook: 'Facebook',
    };
    return icons[platform] || 'Link';
  },
};
