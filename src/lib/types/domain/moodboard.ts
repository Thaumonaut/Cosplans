/**
 * Moodboard Domain Types
 * Feature: 006-brainstorming-moodboard
 *
 * Types for moodboard nodes and edges that form the visual canvas
 * for collecting references from social media and other sources.
 */

// ============================================================================
// Node Types
// ============================================================================

export type MoodboardNodeType =
  | 'social_media'  // Instagram, TikTok, Pinterest, YouTube posts
  | 'image'         // Uploaded images
  | 'link'          // Generic web links
  | 'note'          // Text notes
  | 'swatch'        // Color swatches
  | 'budget_item'   // Budget item cards
  | 'contact'       // Vendor/commissioner contacts
  | 'sketch'        // Hand-drawn sketches
  | 'pile';         // Expandable groups

export type SocialMediaPlatform =
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'youtube'
  | 'facebook'
  | 'google_maps';  // NEW: For location scout ideas

// ============================================================================
// Metadata Structures (JSONB field)
// ============================================================================

export interface SocialMediaMetadata {
  platform: SocialMediaPlatform;
  post_id?: string;
  author?: string;
  author_avatar?: string;
  caption?: string;
  publish_date?: string;
  embed_html?: string;
  extracted_at: string;
  // NEW: Embedding support
  embed_type?: 'iframe' | 'oembed' | 'fallback';
  embed_url?: string;
}

// NEW: Google Maps metadata
export interface GoogleMapsMetadata {
  platform: 'google_maps';
  place_id?: string;
  place_name?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  place_type?: string;
  extracted_at: string;
}

export interface ImageMetadata {
  original_filename: string;
  file_size: number;
  mime_type: string;
  dimensions?: {
    width: number;
    height: number;
  };
  storage_path: string;
}

export interface LinkMetadata {
  title?: string;
  description?: string;
  site_name?: string;
  favicon?: string;
  og_image?: string;
}

export interface NoteMetadata {
  rich_text?: string;
  background_color?: string;
  font_size?: number;
}

export interface SwatchMetadata {
  color_hex: string;
  color_name?: string;
}

export interface SketchMetadata {
  drawing_data: string;
  template_type?: 'blank' | 'figure' | 'grid';
  dimensions: {
    width: number;
    height: number;
  };
  storage_path: string;
  tool_settings?: {
    color: string;
    thickness: number;
  };
}

export interface PileMetadata {
  pile_name: string;
  pile_color?: string;
  child_count: number;
  preview_thumbnails?: string[];
}

export interface BudgetItemMetadata {
  budget_item_id: string;
}

export interface ContactMetadata {
  contact_id: string;
}

// Union type for all metadata
export type MoodboardNodeMetadata =
  | SocialMediaMetadata
  | GoogleMapsMetadata  // NEW
  | ImageMetadata
  | LinkMetadata
  | NoteMetadata
  | SwatchMetadata
  | SketchMetadata
  | PileMetadata
  | BudgetItemMetadata
  | ContactMetadata
  | Record<string, unknown>; // Fallback for unknown metadata

// ============================================================================
// Moodboard Node Interface
// ============================================================================

export interface MoodboardNode {
  id: string;
  ideaId: string;
  nodeType: MoodboardNodeType;
  contentUrl?: string | null;
  thumbnailUrl?: string | null;
  metadata: MoodboardNodeMetadata;
  tags: string[];
  shortComment?: string | null;
  longNote?: string | null;
  positionX: number;
  positionY: number;
  width: number;
  height?: number | null;
  zIndex: number;
  parentId?: string | null;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MoodboardNodeCreate {
  ideaId: string;
  nodeType: MoodboardNodeType;
  contentUrl?: string;
  thumbnailUrl?: string;
  metadata?: MoodboardNodeMetadata;
  tags?: string[];
  shortComment?: string;
  longNote?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  parentId?: string;
  isExpanded?: boolean;
}

export interface MoodboardNodeUpdate {
  contentUrl?: string | null;
  thumbnailUrl?: string | null;
  metadata?: MoodboardNodeMetadata;
  tags?: string[];
  shortComment?: string | null;
  longNote?: string | null;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number | null;
  zIndex?: number;
  parentId?: string | null;
  isExpanded?: boolean;
}

// ============================================================================
// Moodboard Edge Interface
// ============================================================================

export type MoodboardEdgeType =
  | 'connection'      // Generic connection
  | 'reference'       // References inspiration
  | 'alternative'     // Alternative approach
  | 'shared_resource' // Shared across options
  | 'supplier_option'; // Vendor/supplier link

export interface MoodboardEdge {
  id: string;
  ideaId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: MoodboardEdgeType;
  label?: string | null;
  createdAt: string;
}

export interface MoodboardEdgeCreate {
  ideaId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: MoodboardEdgeType;
  label?: string;
}

// ============================================================================
// Grid Layout Types
// ============================================================================

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridLayoutConfig {
  columns: number;
  nodeWidth: number;
  nodeHeight: number;
  spacingX: number;
  spacingY: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_GRID_CONFIG: GridLayoutConfig = {
  columns: 4,
  nodeWidth: 300,
  nodeHeight: 400,
  spacingX: 20,
  spacingY: 20,
  offsetX: 50,
  offsetY: 50,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate grid position for a node based on its index
 */
export function calculateGridPosition(
  nodeIndex: number,
  config: GridLayoutConfig = DEFAULT_GRID_CONFIG
): GridPosition {
  const col = nodeIndex % config.columns;
  const row = Math.floor(nodeIndex / config.columns);

  return {
    x: config.offsetX + col * (config.nodeWidth + config.spacingX),
    y: config.offsetY + row * (config.nodeHeight + config.spacingY),
  };
}

/**
 * Detect social media platform from URL
 */
export function detectPlatformFromUrl(url: string): SocialMediaPlatform | null {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('instagram.com')) return 'instagram';
  if (lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('pinterest.com')) return 'pinterest';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) return 'facebook';
  // NEW: Google Maps support
  if (lowerUrl.includes('google.com/maps') || lowerUrl.includes('goo.gl/maps') || lowerUrl.includes('maps.app.goo.gl')) return 'google_maps';

  return null;
}

/**
 * Determine node type based on content
 */
export function determineNodeType(params: {
  url?: string;
  text?: string;
  file?: File;
}): MoodboardNodeType {
  const { url, text, file } = params;

  // If file provided, it's an image
  if (file && file.type.startsWith('image/')) {
    return 'image';
  }

  // If URL provided, check if it's social media
  if (url) {
    const platform = detectPlatformFromUrl(url);
    if (platform) {
      return 'social_media';
    }
    // Generic URL
    return 'link';
  }

  // If only text provided, it's a note
  if (text && !url) {
    return 'note';
  }

  // Default to note
  return 'note';
}

/**
 * Type guard to check if metadata is social media
 */
export function isSocialMediaMetadata(
  metadata: MoodboardNodeMetadata
): metadata is SocialMediaMetadata {
  return 'platform' in metadata && typeof metadata.platform === 'string';
}

/**
 * Type guard to check if metadata is image
 */
export function isImageMetadata(
  metadata: MoodboardNodeMetadata
): metadata is ImageMetadata {
  return 'storage_path' in metadata && 'mime_type' in metadata;
}

/**
 * Type guard to check if metadata is link
 */
export function isLinkMetadata(
  metadata: MoodboardNodeMetadata
): metadata is LinkMetadata {
  return 'site_name' in metadata || 'og_image' in metadata;
}

// ============================================================================
// Database Mapping Functions
// ============================================================================

/**
 * Map database row to MoodboardNode
 */
export function mapMoodboardNodeFromDb(row: any): MoodboardNode {
  return {
    id: row.id,
    ideaId: row.idea_id,
    nodeType: row.node_type as MoodboardNodeType,
    contentUrl: row.content_url,
    thumbnailUrl: row.thumbnail_url,
    metadata: row.metadata || {},
    tags: row.tags || [],
    shortComment: row.short_comment,
    longNote: row.long_note,
    positionX: Number(row.position_x) || 0,
    positionY: Number(row.position_y) || 0,
    width: Number(row.width) || 300,
    height: row.height ? Number(row.height) : null,
    zIndex: Number(row.z_index) || 0,
    parentId: row.parent_id,
    isExpanded: row.is_expanded !== undefined ? Boolean(row.is_expanded) : true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Map database row to MoodboardEdge
 */
export function mapMoodboardEdgeFromDb(row: any): MoodboardEdge {
  return {
    id: row.id,
    ideaId: row.idea_id,
    sourceNodeId: row.source_node_id,
    targetNodeId: row.target_node_id,
    edgeType: row.edge_type as MoodboardEdgeType,
    label: row.label,
    createdAt: row.created_at,
  };
}

/**
 * Convert MoodboardNodeCreate to database format
 */
export function mapMoodboardNodeToDb(node: MoodboardNodeCreate): Record<string, unknown> {
  return {
    idea_id: node.ideaId,
    node_type: node.nodeType,
    content_url: node.contentUrl || null,
    thumbnail_url: node.thumbnailUrl || null,
    metadata: node.metadata || {},
    tags: node.tags || [],
    short_comment: node.shortComment || null,
    long_note: node.longNote || null,
    position_x: node.positionX !== undefined ? node.positionX : 0,
    position_y: node.positionY !== undefined ? node.positionY : 0,
    width: node.width || 300,
    height: node.height || null,
    z_index: node.zIndex || 0,
    parent_id: node.parentId || null,
    is_expanded: node.isExpanded !== undefined ? node.isExpanded : true,
  };
}

// ============================================================================
// Additional Domain Types
// ============================================================================

export type BudgetPriority = 'need' | 'want' | 'nice_to_have';
export type ContactType = 'commissioner' | 'supplier' | 'venue' | 'photographer' | 'other';
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'microsoft';

// Idea Option (costume variation)
export interface IdeaOption {
  id: string;
  ideaId: string;
  name: string;
  description?: string | null;
  difficulty?: number | null;  // 1-5
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Budget Item
export interface BudgetItem {
  id: string;
  ideaId?: string | null;
  optionId?: string | null;
  projectId?: string | null;
  itemName: string;
  estimatedCost: number;
  actualCost?: number | null;
  quantity: number;
  contactId?: string | null;
  priority: BudgetPriority;
  isShared: boolean;
  notes?: string | null;
  linkedNodeId?: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// Contact/vendor
export interface Contact {
  id: string;
  teamId: string;
  name: string;
  type: ContactType;
  email?: string | null;
  website?: string | null;
  socialMedia: Record<string, string>;
  notes?: string | null;
  rating?: number | null;  // 1-5
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// Moodboard share
export interface MoodboardShare {
  id: string;
  ideaId: string;
  shareToken: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  revokedAt?: string | null;
}

// Moodboard comment
export interface MoodboardComment {
  id: string;
  ideaId: string;
  nodeId?: string | null;
  oauthProvider: OAuthProvider;
  oauthUserId: string;
  commenterName: string;
  commenterAvatar?: string | null;
  commenterEmail?: string | null;
  commentText: string;
  createdAt: string;
  updatedAt: string;
}

// Character link (multi-character resources)
export interface CharacterLink {
  id: string;
  nodeId: string;
  characterName: string;
  ideaId: string;
  createdAt: string;
}

// Tab state (navigation persistence)
export interface TabState {
  id: string;
  ideaId: string;
  userId: string;
  activeCharacterTab?: string | null;
  activeVariationTab?: string | null;
  tabOrder: string[];
  createdAt: string;
  updatedAt: string;
}

// Tutorial
export interface Tutorial {
  id: string;
  teamId: string;
  title: string;
  url: string;
  techniqueTags: string[];
  notes?: string | null;
  rating?: number | null;  // 1-5
  createdAt: string;
  updatedAt: string;
}

/**
 * Helper to check if platform supports embedding
 */
export function supportsEmbedding(platform: SocialMediaPlatform): boolean {
  // Instagram, TikTok, YouTube support embedding
  return ['instagram', 'tiktok', 'youtube'].includes(platform);
}
