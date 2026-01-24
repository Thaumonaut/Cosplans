/**
 * Moodboards Service
 * Feature: 006-brainstorming-moodboard
 * Task: T-003
 *
 * Service for first-class moodboard entities and hierarchical node operations.
 * Moodboards are standalone entities owned by users, teams, ideas, or projects.
 */

import { supabase } from "$lib/supabase";
import type {
  Moodboard,
  MoodboardCreate,
  MoodboardUpdate,
  MoodboardNode,
  MoodboardNodeCreate,
  MoodboardNodeUpdate,
  MoodboardOwnerType,
  GridLayoutConfig,
  GridPosition,
} from "$lib/types/domain/moodboard";
import {
  mapMoodboardFromDb,
  mapMoodboardNodeFromDb,
  mapMoodboardNodeToDb,
  calculateGridPosition,
  DEFAULT_GRID_CONFIG,
} from "$lib/types/domain/moodboard";

// ============================================================================
// Moodboard CRUD Operations (CAP-01)
// ============================================================================

export const moodboardsService = {
  /**
   * Create a new moodboard
   */
  async createMoodboard(moodboard: MoodboardCreate): Promise<Moodboard> {
    const { data, error } = await supabase
      .from("moodboards")
      .insert({
        owner_type: moodboard.ownerType,
        owner_id: moodboard.ownerId,
        title: moodboard.title || null,
      })
      .select()
      .single();

    if (error) throw error;
    return mapMoodboardFromDb(data);
  },

  /**
   * Get a moodboard by ID
   */
  async getMoodboard(id: string): Promise<Moodboard | null> {
    const { data, error } = await supabase
      .from("moodboards")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapMoodboardFromDb(data) : null;
  },

  /**
   * Get a moodboard by owner
   */
  async getMoodboardByOwner(
    ownerType: MoodboardOwnerType,
    ownerId: string,
  ): Promise<Moodboard | null> {
    const { data, error } = await supabase
      .from("moodboards")
      .select("*")
      .eq("owner_type", ownerType)
      .eq("owner_id", ownerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapMoodboardFromDb(data) : null;
  },

  /**
   * Get the user's personal moodboard
   */
  async getPersonalMoodboard(userId: string): Promise<Moodboard | null> {
    return this.getMoodboardByOwner("user", userId);
  },

  /**
   * Get a team's moodboard
   */
  async getTeamMoodboard(teamId: string): Promise<Moodboard | null> {
    return this.getMoodboardByOwner("team", teamId);
  },

  /**
   * Get an idea's moodboard
   */
  async getIdeaMoodboard(ideaId: string): Promise<Moodboard | null> {
    // First check if idea has a moodboard_id reference
    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .select("moodboard_id")
      .eq("id", ideaId)
      .single();

    if (ideaError) throw ideaError;

    if (idea?.moodboard_id) {
      return this.getMoodboard(idea.moodboard_id);
    }

    // Fall back to owner lookup
    return this.getMoodboardByOwner("idea", ideaId);
  },

  /**
   * Get a project's moodboard
   */
  async getProjectMoodboard(projectId: string): Promise<Moodboard | null> {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("moodboard_id")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;

    if (project?.moodboard_id) {
      return this.getMoodboard(project.moodboard_id);
    }

    return this.getMoodboardByOwner("project", projectId);
  },

  /**
   * Update a moodboard
   */
  async updateMoodboard(
    id: string,
    updates: MoodboardUpdate,
  ): Promise<Moodboard | null> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;

    const { data, error } = await supabase
      .from("moodboards")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data ? mapMoodboardFromDb(data) : null;
  },

  /**
   * Delete a moodboard
   */
  async deleteMoodboard(id: string): Promise<void> {
    const { error } = await supabase.from("moodboards").delete().eq("id", id);
    if (error) throw error;
  },

  /**
   * List all moodboards accessible to the current user
   */
  async listAccessibleMoodboards(): Promise<Moodboard[]> {
    const { data, error } = await supabase
      .from("moodboards")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapMoodboardFromDb);
  },

  // ============================================================================
  // Node Operations (CAP-02)
  // ============================================================================

  /**
   * Get nodes at a specific level in the hierarchy
   * @param moodboardId - The moodboard to query
   * @param parentId - Parent node ID (null for root level)
   */
  async getNodesAtLevel(
    moodboardId: string,
    parentId: string | null = null,
  ): Promise<MoodboardNode[]> {
    let query = supabase
      .from("moodboard_nodes")
      .select("*")
      .eq("moodboard_id", moodboardId)
      .order("created_at", { ascending: true });

    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapMoodboardNodeFromDb);
  },

  /**
   * Get the breadcrumb path from a node to the root
   * Returns array from root to the specified node
   */
  async getNodePath(nodeId: string): Promise<MoodboardNode[]> {
    // Use recursive CTE to get the path
    const { data, error } = await supabase.rpc("get_moodboard_node_path", {
      p_node_id: nodeId,
    });

    if (error) {
      // If function doesn't exist yet, fall back to manual traversal
      if (error.code === "42883") {
        return this._getNodePathManual(nodeId);
      }
      throw error;
    }

    return (data || []).map(mapMoodboardNodeFromDb);
  },

  /**
   * Manual path traversal (fallback if RPC not available)
   */
  async _getNodePathManual(nodeId: string): Promise<MoodboardNode[]> {
    const path: MoodboardNode[] = [];
    let currentId: string | null = nodeId;

    while (currentId) {
      const { data, error } = await supabase
        .from("moodboard_nodes")
        .select("*")
        .eq("id", currentId)
        .single();

      if (error) throw error;
      if (!data) break;

      const node = mapMoodboardNodeFromDb(data);
      path.unshift(node); // Add to beginning
      currentId = node.parentId ?? null;
    }

    return path;
  },

  /**
   * Get all descendants of a node recursively
   */
  async getDescendants(nodeId: string): Promise<MoodboardNode[]> {
    const { data, error } = await supabase.rpc(
      "get_moodboard_node_descendants",
      {
        p_node_id: nodeId,
      },
    );

    if (error) {
      // Fallback to manual if function doesn't exist
      if (error.code === "42883") {
        return this._getDescendantsManual(nodeId);
      }
      throw error;
    }

    return (data || []).map(mapMoodboardNodeFromDb);
  },

  /**
   * Manual descendants query (fallback)
   */
  async _getDescendantsManual(nodeId: string): Promise<MoodboardNode[]> {
    const descendants: MoodboardNode[] = [];
    const queue: string[] = [nodeId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const { data, error } = await supabase
        .from("moodboard_nodes")
        .select("*")
        .eq("parent_id", currentId);

      if (error) throw error;

      for (const row of data || []) {
        const node = mapMoodboardNodeFromDb(row);
        descendants.push(node);
        // Add containers to queue to get their children
        if (
          node.nodeType === "container" ||
          node.nodeType === "moodboard_link"
        ) {
          queue.push(node.id);
        }
      }
    }

    return descendants;
  },

  /**
   * Get child count for a container node
   */
  async getChildCount(nodeId: string): Promise<number> {
    const { count, error } = await supabase
      .from("moodboard_nodes")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", nodeId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Create a new node
   */
  async createNode(node: MoodboardNodeCreate): Promise<MoodboardNode> {
    // Validate container type constraints
    if (node.nodeType === "container" && !node.containerType) {
      throw new Error("Container nodes must specify a container_type");
    }
    if (node.nodeType === "moodboard_link" && !node.linkedMoodboardId) {
      throw new Error(
        "Moodboard link nodes must specify a linked_moodboard_id",
      );
    }

    // Auto-position if not specified
    if (node.positionX === undefined || node.positionY === undefined) {
      const nextPosition = await this.getNextGridPosition(
        node.moodboardId,
        node.parentId,
      );
      node.positionX = nextPosition.x;
      node.positionY = nextPosition.y;
    }

    const dbNode = mapMoodboardNodeToDb(node);

    const { data, error } = await supabase
      .from("moodboard_nodes")
      .insert(dbNode)
      .select()
      .single();

    if (error) {
      if (error.code === "42501") {
        throw new Error(
          "Permission denied: You must have access to this moodboard.",
        );
      }
      throw error;
    }

    return mapMoodboardNodeFromDb(data);
  },

  /**
   * Update a node
   */
  async updateNode(
    nodeId: string,
    updates: MoodboardNodeUpdate,
  ): Promise<MoodboardNode | null> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.referenceId !== undefined)
      dbUpdates.reference_id = updates.referenceId;
    if (updates.containerType !== undefined)
      dbUpdates.container_type = updates.containerType;
    if (updates.linkedMoodboardId !== undefined)
      dbUpdates.linked_moodboard_id = updates.linkedMoodboardId;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.contentUrl !== undefined)
      dbUpdates.content_url = updates.contentUrl;
    if (updates.thumbnailUrl !== undefined)
      dbUpdates.thumbnail_url = updates.thumbnailUrl;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.shortComment !== undefined)
      dbUpdates.short_comment = updates.shortComment;
    if (updates.longNote !== undefined) dbUpdates.long_note = updates.longNote;
    if (updates.positionX !== undefined)
      dbUpdates.position_x = updates.positionX;
    if (updates.positionY !== undefined)
      dbUpdates.position_y = updates.positionY;
    if (updates.width !== undefined) dbUpdates.width = updates.width;
    if (updates.height !== undefined) dbUpdates.height = updates.height;
    if (updates.zIndex !== undefined) dbUpdates.z_index = updates.zIndex;
    if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
    if (updates.isExpanded !== undefined)
      dbUpdates.is_expanded = updates.isExpanded;

    const { data, error } = await supabase
      .from("moodboard_nodes")
      .update(dbUpdates)
      .eq("id", nodeId)
      .select()
      .single();

    if (error) throw error;
    return data ? mapMoodboardNodeFromDb(data) : null;
  },

  /**
   * Delete a node
   * @param nodeId - Node to delete
   * @param cascade - If true, delete all descendants. If false, move children to parent.
   */
  async deleteNode(nodeId: string, cascade: boolean = true): Promise<void> {
    if (!cascade) {
      // Move children to this node's parent first
      const { data: node, error: fetchError } = await supabase
        .from("moodboard_nodes")
        .select("parent_id")
        .eq("id", nodeId)
        .single();

      if (fetchError) throw fetchError;

      const { error: moveError } = await supabase
        .from("moodboard_nodes")
        .update({ parent_id: node?.parent_id || null })
        .eq("parent_id", nodeId);

      if (moveError) throw moveError;
    }

    // Delete the node (cascade will handle children if enabled via FK)
    const { error } = await supabase
      .from("moodboard_nodes")
      .delete()
      .eq("id", nodeId);

    if (error) throw error;
  },

  /**
   * Move a node to a new parent
   */
  async moveNode(
    nodeId: string,
    newParentId: string | null,
    newPosition?: GridPosition,
  ): Promise<MoodboardNode | null> {
    const updates: MoodboardNodeUpdate = {
      parentId: newParentId,
    };

    if (newPosition) {
      updates.positionX = newPosition.x;
      updates.positionY = newPosition.y;
    }

    return this.updateNode(nodeId, updates);
  },

  /**
   * Get the next grid position for a new node at a level
   */
  async getNextGridPosition(
    moodboardId: string,
    parentId: string | null = null,
    config: GridLayoutConfig = DEFAULT_GRID_CONFIG,
  ): Promise<GridPosition> {
    let query = supabase
      .from("moodboard_nodes")
      .select("*", { count: "exact", head: true })
      .eq("moodboard_id", moodboardId);

    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    const { count, error } = await query;
    if (error) throw error;

    return calculateGridPosition(count || 0, config);
  },

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * Get child counts for container nodes
   */
  async getChildCounts(nodeIds: string[]): Promise<Map<string, number>> {
    if (nodeIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from("moodboard_nodes")
      .select("parent_id")
      .in("parent_id", nodeIds);

    if (error) throw error;

    const counts = new Map<string, number>();
    for (const row of data || []) {
      const parentId = row.parent_id;
      counts.set(parentId, (counts.get(parentId) || 0) + 1);
    }

    return counts;
  },

  /**
   * Get all nodes and their structure for a moodboard
   * Useful for canvas view
   */
  async getMoodboardData(
    moodboardId: string,
    parentId: string | null = null,
  ): Promise<{
    moodboard: Moodboard | null;
    nodes: MoodboardNode[];
    path: MoodboardNode[];
    childCounts: Map<string, number>;
  }> {
    const [moodboard, nodes, path] = await Promise.all([
      this.getMoodboard(moodboardId),
      this.getNodesAtLevel(moodboardId, parentId),
      parentId ? this.getNodePath(parentId) : Promise.resolve([]),
    ]);

    // Get child counts for all nodes
    const nodeIds = nodes.map((n) => n.id);
    const childCounts = await this.getChildCounts(nodeIds);

    return { moodboard, nodes, path, childCounts };
  },

  /**
   * Search across moodboards and nodes (CAP-07)
   */
  async search(
    query: string,
    options?: {
      moodboardsOnly?: boolean;
      limit?: number;
    },
  ): Promise<{
    moodboards: Moodboard[];
    nodes: MoodboardNode[];
  }> {
    const limit = options?.limit || 20;
    const searchPattern = `%${query}%`;

    // Search moodboards
    const { data: moodboardData, error: moodboardError } = await supabase
      .from("moodboards")
      .select("*")
      .ilike("title", searchPattern)
      .limit(limit);

    if (moodboardError) throw moodboardError;

    const moodboards = (moodboardData || []).map(mapMoodboardFromDb);

    if (options?.moodboardsOnly) {
      return { moodboards, nodes: [] };
    }

    // Search nodes
    const { data: nodeData, error: nodeError } = await supabase
      .from("moodboard_nodes")
      .select("*")
      .or(`title.ilike.${searchPattern},short_comment.ilike.${searchPattern}`)
      .limit(limit);

    if (nodeError) throw nodeError;

    const nodes = (nodeData || []).map(mapMoodboardNodeFromDb);

    return { moodboards, nodes };
  },
};
