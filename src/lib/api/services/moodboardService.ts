/**
 * Moodboard Service
 * Feature: 006-brainstorming-moodboard
 *
 * CRUD operations for moodboard nodes and edges.
 * Includes grid layout algorithm for auto-positioning nodes.
 */

import { supabase } from '$lib/supabase';
import type {
  MoodboardNode,
  MoodboardNodeCreate,
  MoodboardNodeUpdate,
  MoodboardEdge,
  MoodboardEdgeCreate,
  GridPosition,
  GridLayoutConfig,
} from '$lib/types/domain/moodboard';
import {
  mapMoodboardNodeFromDb,
  mapMoodboardNodeToDb,
  mapMoodboardEdgeFromDb,
  calculateGridPosition,
  DEFAULT_GRID_CONFIG,
} from '$lib/types/domain/moodboard';

export const moodboardService = {
  // ============================================================================
  // Moodboard Nodes
  // ============================================================================

  /**
   * List all nodes for an idea
   */
  async listNodes(ideaId: string): Promise<MoodboardNode[]> {
    const { data, error } = await supabase
      .from('moodboard_nodes')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(mapMoodboardNodeFromDb);
  },

  /**
   * Get a single node by ID
   */
  async getNode(id: string): Promise<MoodboardNode | null> {
    const { data, error } = await supabase
      .from('moodboard_nodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data ? mapMoodboardNodeFromDb(data) : null;
  },

  /**
   * Create a new moodboard node
   */
  async createNode(node: MoodboardNodeCreate): Promise<MoodboardNode> {
    // Ensure user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // If position not specified, calculate next grid position
    if (node.positionX === undefined || node.positionY === undefined) {
      const nextPosition = await this.getNextGridPosition(node.ideaId);
      node.positionX = nextPosition.x;
      node.positionY = nextPosition.y;
    }

    // Convert to database format
    const dbNode = mapMoodboardNodeToDb(node);

    const { data, error } = await supabase
      .from('moodboard_nodes')
      .insert(dbNode)
      .select()
      .single();

    if (error) {
      // Provide helpful error message for RLS violations
      if (error.code === '42501') {
        throw new Error(
          'Permission denied: You must be a member of this team to create moodboard nodes.'
        );
      }
      throw error;
    }

    return mapMoodboardNodeFromDb(data);
  },

  /**
   * Update a moodboard node
   */
  async updateNode(id: string, updates: MoodboardNodeUpdate): Promise<MoodboardNode | null> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.contentUrl !== undefined) dbUpdates.content_url = updates.contentUrl;
    if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.shortComment !== undefined) dbUpdates.short_comment = updates.shortComment;
    if (updates.longNote !== undefined) dbUpdates.long_note = updates.longNote;
    if (updates.positionX !== undefined) dbUpdates.position_x = updates.positionX;
    if (updates.positionY !== undefined) dbUpdates.position_y = updates.positionY;
    if (updates.width !== undefined) dbUpdates.width = updates.width;
    if (updates.height !== undefined) dbUpdates.height = updates.height;
    if (updates.zIndex !== undefined) dbUpdates.z_index = updates.zIndex;
    if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
    if (updates.isExpanded !== undefined) dbUpdates.is_expanded = updates.isExpanded;

    const { data, error } = await supabase
      .from('moodboard_nodes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data ? mapMoodboardNodeFromDb(data) : null;
  },

  /**
   * Delete a moodboard node
   */
  async deleteNode(id: string): Promise<void> {
    const { error } = await supabase.from('moodboard_nodes').delete().eq('id', id);

    if (error) throw error;
  },

  /**
   * Get the next available grid position for a new node
   */
  async getNextGridPosition(
    ideaId: string,
    config: GridLayoutConfig = DEFAULT_GRID_CONFIG
  ): Promise<GridPosition> {
    // Get count of existing nodes for this idea
    const { count, error } = await supabase
      .from('moodboard_nodes')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .is('parent_id', null); // Only count top-level nodes

    if (error) throw error;

    const nodeCount = count || 0;
    return calculateGridPosition(nodeCount, config);
  },

  // ============================================================================
  // Moodboard Edges (Connections)
  // ============================================================================

  /**
   * List all edges for an idea
   */
  async listEdges(ideaId: string): Promise<MoodboardEdge[]> {
    const { data, error } = await supabase
      .from('moodboard_edges')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(mapMoodboardEdgeFromDb);
  },

  /**
   * Create a new edge between nodes
   */
  async createEdge(edge: MoodboardEdgeCreate): Promise<MoodboardEdge> {
    // Ensure user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('moodboard_edges')
      .insert({
        idea_id: edge.ideaId,
        source_node_id: edge.sourceNodeId,
        target_node_id: edge.targetNodeId,
        edge_type: edge.edgeType,
        label: edge.label || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error(
          'Permission denied: You must be a member of this team to create connections.'
        );
      }
      throw error;
    }

    return mapMoodboardEdgeFromDb(data);
  },

  /**
   * Delete an edge
   */
  async deleteEdge(id: string): Promise<void> {
    const { error } = await supabase.from('moodboard_edges').delete().eq('id', id);

    if (error) throw error;
  },

  // ============================================================================
  // Batch Operations
  // ============================================================================

  /**
   * Get all nodes and edges for an idea (for canvas view)
   */
  async getMoodboardData(ideaId: string): Promise<{
    nodes: MoodboardNode[];
    edges: MoodboardEdge[];
  }> {
    const [nodes, edges] = await Promise.all([
      this.listNodes(ideaId),
      this.listEdges(ideaId),
    ]);

    return { nodes, edges };
  },

  /**
   * Delete multiple nodes at once
   */
  async deleteNodes(nodeIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('moodboard_nodes')
      .delete()
      .in('id', nodeIds);

    if (error) throw error;
  },
};
