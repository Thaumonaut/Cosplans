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
  MoodboardProjectReferenceCreate,
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

const PROJECT_REFERENCE_NODE_WIDTH = 300;

function mapReferenceToNode(row: any, projectId: string): MoodboardNode {
  return {
    id: row.id,
    ideaId: projectId,
    referenceId: row.id,
    nodeType: row.node_type,
    contentUrl: row.content_url,
    thumbnailUrl: row.thumbnail_url,
    metadata: row.metadata || {},
    tags: row.tags || [],
    shortComment: row.short_comment,
    longNote: row.long_note,
    positionX: 0,
    positionY: 0,
    width: PROJECT_REFERENCE_NODE_WIDTH,
    height: null,
    zIndex: 0,
    parentId: null,
    isExpanded: true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
   * List all references linked to a project
   */
  async listProjectReferences(projectId: string): Promise<MoodboardNode[]> {
    const { data, error } = await supabase
      .from('references')
      .select('*, reference_links!inner(project_id)')
      .eq('reference_links.project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => mapReferenceToNode(row, projectId));
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

    const ideaTeam = await this.getIdeaTeamId(node.ideaId);
    if (!ideaTeam) {
      throw new Error('Unable to resolve team for idea. Please refresh and try again.');
    }

    let referenceId: string | null = node.referenceId ?? null;
    if (!referenceId) {
      const { data: refData, error: refError } = await supabase
        .from('references')
        .insert({
          team_id: ideaTeam,
          node_type: node.nodeType,
          content_url: node.contentUrl || null,
          thumbnail_url: node.thumbnailUrl || null,
          metadata: node.metadata || {},
          tags: node.tags || [],
          short_comment: node.shortComment || null,
          long_note: node.longNote || null,
        })
        .select('id')
        .single();

      if (refError) throw refError;
      referenceId = refData?.id ?? null;

      if (referenceId) {
        const { error: linkError } = await supabase
          .from('reference_links')
          .insert({ reference_id: referenceId, idea_id: node.ideaId })
          .select('id')
          .single();

        if (linkError) throw linkError;
      }
    }

    if (referenceId) {
      node.referenceId = referenceId;
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
   * Create a project-scoped reference (no idea required)
   */
  async createProjectReference(node: MoodboardProjectReferenceCreate): Promise<MoodboardNode> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('team_id')
      .eq('id', node.projectId)
      .single();

    if (projectError) throw projectError;

    const projectTeam = projectData?.team_id ?? null;
    if (!projectTeam) {
      throw new Error('Unable to resolve team for project. Please refresh and try again.');
    }

    const { data: refData, error: refError } = await supabase
      .from('references')
      .insert({
        team_id: projectTeam,
        node_type: node.nodeType,
        content_url: node.contentUrl || null,
        thumbnail_url: node.thumbnailUrl || null,
        metadata: node.metadata || {},
        tags: node.tags || [],
        short_comment: node.shortComment || null,
        long_note: node.longNote || null,
      })
      .select('*')
      .single();

    if (refError) throw refError;

    const referenceId = refData?.id ?? null;
    if (!referenceId) {
      throw new Error('Failed to create reference. Please try again.');
    }

    const { error: linkError } = await supabase
      .from('reference_links')
      .insert({ reference_id: referenceId, project_id: node.projectId })
      .select('id')
      .single();

    if (linkError) throw linkError;

    return mapReferenceToNode(refData, node.projectId);
  },

  /**
   * Update a moodboard node
   */
  async updateNode(id: string, updates: MoodboardNodeUpdate): Promise<MoodboardNode | null> {
    if (
      updates.referenceId !== undefined ||
      updates.contentUrl !== undefined ||
      updates.thumbnailUrl !== undefined ||
      updates.metadata !== undefined ||
      updates.tags !== undefined ||
      updates.shortComment !== undefined ||
      updates.longNote !== undefined
    ) {
      const { data: nodeRow, error: nodeError } = await supabase
        .from('moodboard_nodes')
        .select('reference_id')
        .eq('id', id)
        .single();

      if (nodeError) throw nodeError;

      const referenceId = updates.referenceId ?? nodeRow?.reference_id ?? null;
      if (referenceId) {
        const refUpdates: Record<string, unknown> = {};
        if (updates.contentUrl !== undefined) refUpdates.content_url = updates.contentUrl;
        if (updates.thumbnailUrl !== undefined) refUpdates.thumbnail_url = updates.thumbnailUrl;
        if (updates.metadata !== undefined) refUpdates.metadata = updates.metadata;
        if (updates.tags !== undefined) refUpdates.tags = updates.tags;
        if (updates.shortComment !== undefined) refUpdates.short_comment = updates.shortComment;
        if (updates.longNote !== undefined) refUpdates.long_note = updates.longNote;

        if (Object.keys(refUpdates).length > 0) {
          const { error: refError } = await supabase
            .from('references')
            .update(refUpdates)
            .eq('id', referenceId);

          if (refError) throw refError;
        }
      }
    }

    const dbUpdates: Record<string, unknown> = {};

    if (updates.referenceId !== undefined) dbUpdates.reference_id = updates.referenceId;
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
    const { data: nodeRow, error: fetchError } = await supabase
      .from('moodboard_nodes')
      .select('reference_id, idea_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase.from('moodboard_nodes').delete().eq('id', id);

    if (error) throw error;

    if (nodeRow?.reference_id) {
      const { error: linkError } = await supabase
        .from('reference_links')
        .delete()
        .eq('reference_id', nodeRow.reference_id)
        .eq('idea_id', nodeRow.idea_id);

      if (linkError) throw linkError;

      const { count } = await supabase
        .from('reference_links')
        .select('*', { count: 'exact', head: true })
        .eq('reference_id', nodeRow.reference_id);

      if (!count || count === 0) {
        const { error: refDeleteError } = await supabase
          .from('references')
          .delete()
          .eq('id', nodeRow.reference_id);

        if (refDeleteError) throw refDeleteError;
      }
    }
  },

  /**
   * Delete a project-scoped reference
   */
  async deleteProjectReference(referenceId: string, projectId: string): Promise<void> {
    const { error: linkError } = await supabase
      .from('reference_links')
      .delete()
      .eq('reference_id', referenceId)
      .eq('project_id', projectId);

    if (linkError) throw linkError;

    const { count } = await supabase
      .from('reference_links')
      .select('*', { count: 'exact', head: true })
      .eq('reference_id', referenceId);

    if (!count || count === 0) {
      const { error: refDeleteError } = await supabase
        .from('references')
        .delete()
        .eq('id', referenceId);

      if (refDeleteError) throw refDeleteError;
    }
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
    const { data: nodes, error: fetchError } = await supabase
      .from('moodboard_nodes')
      .select('id, reference_id, idea_id')
      .in('id', nodeIds);

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('moodboard_nodes')
      .delete()
      .in('id', nodeIds);

    if (error) throw error;

    const referencePairs = (nodes || [])
      .filter((node) => node.reference_id)
      .map((node) => ({
        referenceId: node.reference_id as string,
        ideaId: node.idea_id as string,
      }));

    if (referencePairs.length > 0) {
      for (const pair of referencePairs) {
        const { error: linkError } = await supabase
          .from('reference_links')
          .delete()
          .eq('reference_id', pair.referenceId)
          .eq('idea_id', pair.ideaId);

        if (linkError) throw linkError;

        const { count } = await supabase
          .from('reference_links')
          .select('*', { count: 'exact', head: true })
          .eq('reference_id', pair.referenceId);

        if (!count || count === 0) {
          const { error: refDeleteError } = await supabase
            .from('references')
            .delete()
            .eq('id', pair.referenceId);

          if (refDeleteError) throw refDeleteError;
        }
      }
    }
  },

  async getIdeaTeamId(ideaId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('ideas')
      .select('team_id')
      .eq('id', ideaId)
      .single();

    if (error) throw error;
    return data?.team_id ?? null;
  },
};
