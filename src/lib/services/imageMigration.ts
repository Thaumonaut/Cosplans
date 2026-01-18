/**
 * Image Migration Service
 * Feature: 006-brainstorming-moodboard
 *
 * Handles migration of idea.images[] to moodboard_nodes and provides rollback capability
 */

import { supabase } from '$lib/supabase';
import type { MoodboardNode } from '$lib/types/domain/moodboard';

export interface MigrationStatus {
  hasMigratedNodes: boolean;
  hasLegacyImages: boolean;
  totalMigratedNodes: number;
  ideasWithLegacyImages: number;
}

/**
 * Check migration status for a specific idea
 */
export async function checkIdeaMigrationStatus(ideaId: string): Promise<MigrationStatus> {
  try {
    // Check for migrated nodes (nodes with migration metadata)
    const { data: migratedNodes, error: nodesError } = await supabase
      .from('moodboard_nodes')
      .select('id, metadata')
      .eq('idea_id', ideaId)
      .eq('node_type', 'image');

    if (nodesError) throw nodesError;

    const hasMigratedNodes = migratedNodes?.some(
      node => node.metadata?.migrated_from_idea_images === true
    ) ?? false;

    const totalMigratedNodes = migratedNodes?.filter(
      node => node.metadata?.migrated_from_idea_images === true
    ).length ?? 0;

    // Check for legacy images array
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('images')
      .eq('id', ideaId)
      .single();

    if (ideaError) throw ideaError;

    const hasLegacyImages = Array.isArray(idea?.images) && idea.images.length > 0;

    return {
      hasMigratedNodes,
      hasLegacyImages,
      totalMigratedNodes,
      ideasWithLegacyImages: hasLegacyImages ? 1 : 0,
    };
  } catch (error) {
    // Only log network errors in development to reduce console spam
    if (process.env.NODE_ENV === 'development' ||
        (error instanceof Error && !error.message.includes('Failed to fetch'))) {
      console.error('[imageMigration] Error checking status:', error);
    }
    return {
      hasMigratedNodes: false,
      hasLegacyImages: false,
      totalMigratedNodes: 0,
      ideasWithLegacyImages: 0,
    };
  }
}

/**
 * Check global migration status across all ideas
 */
export async function checkGlobalMigrationStatus(): Promise<MigrationStatus> {
  try {
    // Check for any migrated nodes
    const { data: migratedNodes, error: nodesError } = await supabase
      .from('moodboard_nodes')
      .select('id, metadata')
      .eq('node_type', 'image');

    if (nodesError) throw nodesError;

    const totalMigratedNodes = migratedNodes?.filter(
      node => node.metadata?.migrated_from_idea_images === true
    ).length ?? 0;

    // Check for ideas with legacy images
    const { data: ideasWithImages, error: ideasError } = await supabase
      .from('ideas')
      .select('id, images')
      .not('images', 'is', null);

    if (ideasError) throw ideasError;

    const ideasWithLegacyImages = ideasWithImages?.filter(
      idea => Array.isArray(idea.images) && idea.images.length > 0
    ).length ?? 0;

    return {
      hasMigratedNodes: totalMigratedNodes > 0,
      hasLegacyImages: ideasWithLegacyImages > 0,
      totalMigratedNodes,
      ideasWithLegacyImages,
    };
  } catch (error) {
    console.error('[imageMigration] Error checking global status:', error);
    return {
      hasMigratedNodes: false,
      hasLegacyImages: false,
      totalMigratedNodes: 0,
      ideasWithLegacyImages: 0,
    };
  }
}

/**
 * Rollback migration for a specific idea
 * Removes migrated moodboard nodes and keeps idea.images[] intact
 */
export async function rollbackIdeaMigration(ideaId: string): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    // Find all migrated image nodes for this idea
    const { data: nodesToDelete, error: fetchError } = await supabase
      .from('moodboard_nodes')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('node_type', 'image')
      .contains('metadata', { migrated_from_idea_images: true });

    if (fetchError) throw fetchError;

    if (!nodesToDelete || nodesToDelete.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const nodeIds = nodesToDelete.map(n => n.id);

    // Delete the migrated nodes
    const { error: deleteError } = await supabase
      .from('moodboard_nodes')
      .delete()
      .in('id', nodeIds);

    if (deleteError) throw deleteError;

    console.log(`[imageMigration] Rolled back ${nodeIds.length} nodes for idea ${ideaId}`);

    return {
      success: true,
      deletedCount: nodeIds.length,
    };
  } catch (error) {
    console.error('[imageMigration] Rollback error:', error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Manually trigger migration for a specific idea
 * Useful for testing or re-running migration
 */
export async function migrateIdeaImages(ideaId: string): Promise<{
  success: boolean;
  nodesCreated: number;
  error?: string;
}> {
  try {
    // Fetch the idea with its images
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, images')
      .eq('id', ideaId)
      .single();

    if (ideaError) throw ideaError;

    if (!idea.images || !Array.isArray(idea.images) || idea.images.length === 0) {
      return { success: true, nodesCreated: 0 };
    }

    let nodesCreated = 0;

    // Create moodboard nodes for each image
    for (let i = 0; i < idea.images.length; i++) {
      const imageUrl = idea.images[i];

      // Check if node already exists
      const { data: existingNode } = await supabase
        .from('moodboard_nodes')
        .select('id')
        .eq('idea_id', ideaId)
        .eq('node_type', 'image')
        .eq('content_url', imageUrl)
        .single();

      if (existingNode) {
        console.log(`[imageMigration] Node already exists for ${imageUrl}, skipping`);
        continue;
      }

      // Calculate grid position (4 columns, 300px width, 400px height, 20px spacing)
      const gridCol = i % 4;
      const gridRow = Math.floor(i / 4);
      const posX = 50 + (gridCol * 320); // 300px width + 20px spacing
      const posY = 50 + (gridRow * 420); // 400px height + 20px spacing

      // Create moodboard node
      const { error: createError } = await supabase
        .from('moodboard_nodes')
        .insert({
          idea_id: ideaId,
          node_type: 'image',
          content_url: imageUrl,
          thumbnail_url: imageUrl,
          metadata: {
            migrated_from_idea_images: true,
            original_index: i,
            migration_date: new Date().toISOString(),
          },
          tags: [],
          position_x: posX,
          position_y: posY,
          width: 300,
          height: null,
          z_index: 0,
          is_expanded: true,
        });

      if (createError) {
        console.error(`[imageMigration] Error creating node for image ${i}:`, createError);
        continue;
      }

      nodesCreated++;
    }

    console.log(`[imageMigration] Created ${nodesCreated} nodes for idea ${ideaId}`);

    return {
      success: true,
      nodesCreated,
    };
  } catch (error) {
    console.error('[imageMigration] Migration error:', error);
    return {
      success: false,
      nodesCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all image nodes for an idea (both migrated and manually created)
 */
export async function getImageNodesForIdea(ideaId: string): Promise<MoodboardNode[]> {
  try {
    const { data, error } = await supabase
      .from('moodboard_nodes')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('node_type', 'image')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data?.map(row => ({
      id: row.id,
      ideaId: row.idea_id,
      nodeType: row.node_type,
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
    })) || [];
  } catch (error) {
    console.error('[imageMigration] Error fetching image nodes:', error);
    return [];
  }
}
