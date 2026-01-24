# CAP-003: Ghost Nodes & Cross-Container Visibility

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** High  
**Checkpoint:** CP-002 (Ghost Nodes & Cross-Container Linking)

## Intent

Automatically display semi-transparent "ghost" copies of edge-linked nodes inside containers to preserve context and connections when drilling into nested structures, preventing information isolation.

## Functional Requirements

1. **Ghost Node Generation**
   - When inside a container, scan all edges connected to nodes in current container
   - If edge connects to node outside current container, create ghost node representation
   - Ghost node appears at edge endpoint with visual distinction (semi-transparent, ghost icon)
   - Ghost nodes are computed on-the-fly, not stored in database

2. **Ghost Node Appearance**
   - Rendered with 40% opacity
   - Small ghost icon badge in corner
   - Shows node title and thumbnail
   - Not fully interactive (no editing)
   - Clicking navigates to original node's location

3. **Ghost Node Behavior**
   - Click ghost: Show tooltip "This node lives in [parent path]" + "Go to source" button
   - "Go to source" navigates breadcrumb to node's actual container
   - Ghost nodes cannot be moved/edited
   - Ghost nodes can be selected to view read-only details in inspector
   - Edges to ghosts render normally (not ghosted)

4. **Ghost Filtering (CAP-015 integration preview)**
   - When filtering active, non-matching nodes render as ghosts (lighter opacity)
   - Filtered ghosts: 60% opacity (distinguish from true ghosts at 40%)
   - This gives context without overwhelming the view

5. **Ghost Node Lifecycle**
   - Created when container canvas loads
   - Updated when edges added/removed
   - Destroyed when leaving container
   - Not persisted to database

## Data Model

### Type Definitions
```typescript
interface GhostNodeData {
  ghost_of: string; // Original node ID
  source_path: string[]; // Breadcrumb path to original
  original_node: BaseMoodboardNode; // Reference to original node data
  edge_id: string; // ID of edge that created this ghost
}

interface ComputedGhostNode extends BaseMoodboardNode {
  is_ghost: true;
  ghost_data: GhostNodeData;
  opacity: 0.4; // Visual property
}
```

### Computation Logic
```typescript
function computeGhostNodes(
  currentContainerId: string | null,
  allNodes: MoodboardNode[],
  allEdges: MoodboardEdge[]
): ComputedGhostNode[] {
  // 1. Get all nodes in current container
  const localNodes = allNodes.filter(n => n.parent_id === currentContainerId);
  const localNodeIds = new Set(localNodes.map(n => n.id));
  
  // 2. Find edges connected to local nodes
  const connectedEdges = allEdges.filter(e => 
    localNodeIds.has(e.source) || localNodeIds.has(e.target)
  );
  
  // 3. For each edge, find external node (not in local set)
  const ghostNodes: ComputedGhostNode[] = [];
  for (const edge of connectedEdges) {
    const externalNodeId = localNodeIds.has(edge.source) ? edge.target : edge.source;
    if (!localNodeIds.has(externalNodeId)) {
      const originalNode = allNodes.find(n => n.id === externalNodeId);
      if (originalNode) {
        ghostNodes.push(createGhostNode(originalNode, edge, allNodes));
      }
    }
  }
  
  return ghostNodes;
}
```

## UI/UX Requirements

1. **Visual Design**
   - Opacity: 40% for ghost nodes
   - Ghost icon: 👻 or outline icon in top-right corner
   - Dashed border (1px, low opacity)
   - Title shown in italic or with "(external)" suffix
   - Thumbnail grayscale or desaturated

2. **Interaction Design**
   - Hover: Tooltip shows "External: [node name] in [parent path]"
   - Click: Show dialog/sheet with "Go to source" and "View details (read-only)" options
   - Right-click: Context menu with "Go to source" only (no edit/delete)
   - Keyboard: Tab to ghost, Enter to open dialog, Escape to dismiss

3. **Mobile Adaptations**
   - Tap: Show bottom sheet with source info and "Go to source" button
   - Long-press: Same as tap (no separate context menu)

4. **Edge Rendering**
   - Edges to/from ghosts render normally (solid lines)
   - Optional: Subtle animation (slow pulse) to indicate ghost status

## Components

### Reuse from Registry
- `ui/dialog.svelte` or `ui/sheet.svelte` - Ghost node action dialog
- `ui/button.svelte` - "Go to source" button
- `ui/badge.svelte` - Ghost icon badge

### New Components Required
- `moodboard/nodes/GhostNode.svelte` - Ghost node rendering wrapper
- `moodboard/GhostNodeDialog.svelte` - Shows ghost node actions

## Edge Cases

1. **Bidirectional Edges**: Only create one ghost per external node (even if multiple edges)
2. **Ghost of Ghost**: Not possible - ghosts only created from real nodes
3. **Deleted Source**: If original node deleted, ghost disappears on next refresh
4. **Deep Nesting**: Ghost source path may be long - truncate in tooltip ("... > Parent > Node")
5. **Many Ghosts**: If container has 50+ ghosts, consider showing count + toggle visibility
6. **Performance**: Limit ghost computation to 200 nodes max (warn if exceeded)

## Performance Considerations

- Ghost nodes computed client-side from existing data (no DB queries)
- Memoize ghost computation result (recompute only when edges/nodes change)
- Render ghosts with lower z-index (behind real nodes)
- Use CSS transforms for opacity (GPU-accelerated)
- Debounce ghost recomputation on rapid edge changes (300ms)

## Testing Strategy

**Unit Tests:**
- `computeGhostNodes()` returns correct ghosts for various scenarios
- Ghost created when edge connects external node
- No ghost created for internal edges
- Ghost data includes correct source path

**Integration Tests:**
- Drill into container with external edges → ghosts appear
- Click ghost → dialog shows correct source path
- "Go to source" navigates to correct container
- Ghost disappears when edge deleted

**E2E Tests:**
- User creates container A with node 1, container B with node 2
- User creates edge from node 1 to node 2
- User drills into container A → ghost of node 2 appears
- User clicks ghost, clicks "Go to source" → navigates to container B

## Success Metrics

- Ghost computation completes in < 100ms for 50-node container
- Ghost rendering does not degrade canvas FPS below 30
- 90% of users understand ghost nodes represent external connections
- "Go to source" navigation success rate > 95%

## Dependencies

- **Requires:** CAP-002 (Container Nodes), edge system (existing)
- **Required By:** CAP-015 (Ghost Filtering uses same rendering)
- **Related:** CAP-005 (Container Peek may show ghosts)

## Open Questions

None - design approved in Council Decision 3 and 5.

## References

- Council Decision 3: Ghost nodes for cross-container visibility
- Council Decision 5: Ghost nodes via edge-linked clones
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Ghost node interactions)
