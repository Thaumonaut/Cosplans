/**
 * Moodboard Store
 * Feature: 006-brainstorming-moodboard
 *
 * Reactive store for moodboard nodes and edges state management.
 */

import { writable } from 'svelte/store';
import { moodboardService } from '$lib/api/services/moodboardService';
import type {
  MoodboardNode,
  MoodboardNodeCreate,
  MoodboardNodeUpdate,
  MoodboardEdge,
  MoodboardEdgeCreate,
} from '$lib/types/domain/moodboard';

interface MoodboardState {
  nodes: MoodboardNode[];
  edges: MoodboardEdge[];
  loading: boolean;
  error: string | null;
  currentIdeaId: string | null;
}

function createMoodboardStore() {
  const { subscribe, set, update } = writable<MoodboardState>({
    nodes: [],
    edges: [],
    loading: false,
    error: null,
    currentIdeaId: null,
  });

  return {
    subscribe,

    /**
     * Reset the store to initial state
     */
    reset: () =>
      set({
        nodes: [],
        edges: [],
        loading: false,
        error: null,
        currentIdeaId: null,
      }),

    /**
     * Load all nodes and edges for an idea
     */
    load: async (ideaId: string) => {
      update((state) => ({ ...state, loading: true, error: null, currentIdeaId: ideaId }));
      try {
        const { nodes, edges } = await moodboardService.getMoodboardData(ideaId);
        set({ nodes, edges, loading: false, error: null, currentIdeaId: ideaId });
      } catch (err: any) {
        set({
          nodes: [],
          edges: [],
          loading: false,
          error: err?.message || 'Failed to load moodboard',
          currentIdeaId: ideaId,
        });
      }
    },

    /**
     * Load only nodes for an idea
     */
    loadNodes: async (ideaId: string) => {
      update((state) => ({ ...state, loading: true, error: null, currentIdeaId: ideaId }));
      try {
        const nodes = await moodboardService.listNodes(ideaId);
        update((state) => ({ ...state, nodes, loading: false, error: null }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to load nodes',
        }));
      }
    },

    /**
     * Create a new node
     */
    createNode: async (node: MoodboardNodeCreate): Promise<MoodboardNode> => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const created = await moodboardService.createNode(node);
        update((state) => ({
          ...state,
          nodes: [...state.nodes, created],
          loading: false,
          error: null,
        }));
        return created;
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to create node',
        }));
        throw err;
      }
    },

    /**
     * Update a node
     */
    updateNode: async (id: string, updates: MoodboardNodeUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const updated = await moodboardService.updateNode(id, updates);
        if (updated) {
          update((state) => ({
            ...state,
            nodes: state.nodes.map((node) => (node.id === id ? updated : node)),
            loading: false,
            error: null,
          }));
        }
        return updated;
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to update node',
        }));
        throw err;
      }
    },

    /**
     * Delete a node
     */
    deleteNode: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        await moodboardService.deleteNode(id);
        update((state) => ({
          ...state,
          nodes: state.nodes.filter((node) => node.id !== id),
          edges: state.edges.filter((edge) => edge.sourceNodeId !== id && edge.targetNodeId !== id),
          loading: false,
          error: null,
        }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to delete node',
        }));
        throw err;
      }
    },

    /**
     * Create a new edge
     */
    createEdge: async (edge: MoodboardEdgeCreate): Promise<MoodboardEdge> => {
      try {
        const created = await moodboardService.createEdge(edge);
        update((state) => ({
          ...state,
          edges: [...state.edges, created],
        }));
        return created;
      } catch (err: any) {
        update((state) => ({
          ...state,
          error: err?.message || 'Failed to create edge',
        }));
        throw err;
      }
    },

    /**
     * Delete an edge
     */
    deleteEdge: async (id: string) => {
      try {
        await moodboardService.deleteEdge(id);
        update((state) => ({
          ...state,
          edges: state.edges.filter((edge) => edge.id !== id),
        }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          error: err?.message || 'Failed to delete edge',
        }));
        throw err;
      }
    },

    /**
     * Get node count for current idea
     */
    getNodeCount: (): number => {
      let count = 0;
      update((state) => {
        count = state.nodes.length;
        return state;
      });
      return count;
    },
  };
}

export const moodboard = createMoodboardStore();
