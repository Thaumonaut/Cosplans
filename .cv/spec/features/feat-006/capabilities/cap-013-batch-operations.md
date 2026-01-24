# CAP-013: Batch Operations

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-005 (Bulk Operations & Templates)

## Intent

Enable power users (wig makers, event coordinators) to perform bulk actions on multiple nodes simultaneously, reducing repetitive work when managing large moodboards with dozens of items.

## Functional Requirements

1. **Multi-Selection**
   - Marquee selection: Click-drag on empty canvas to create selection box
   - Shift+Click: Add node to selection
   - Ctrl+Click: Toggle node in selection
   - Ctrl+A: Select all nodes in current container
   - Selection indicator: Blue outline/highlight on selected nodes

2. **Batch Actions Available**
   - **Move**: Drag selected nodes together
   - **Delete**: Delete all selected nodes (with confirmation)
   - **Duplicate**: Create copies of all selected nodes
   - **Group**: Create pile or container from selection
   - **Tag**: Add/remove tags to all selected
   - **Color**: Change color of all selected
   - **Export**: Export selected nodes as JSON or CSV
   - **Link**: Create edges between selected nodes (various patterns)

3. **Batch Action Menu**
   - Right-click on selection → Context menu with batch actions
   - Or: Floating toolbar appears above selection
   - Action categories: Organize, Edit, Export, Delete

4. **Linking Patterns**
   - **Chain**: Link nodes in selection order (A→B→C→D)
   - **Star**: Link all to first selected (A→B, A→C, A→D)
   - **Mesh**: Link all to all (fully connected)
   - **Sequential**: Create sequential edges (CAP-010) in order

5. **Batch Edit Inspector**
   - When multiple nodes selected, inspector shows:
     - "X nodes selected"
     - Bulk edit form: Tags, Color, Parent Container
     - Only fields that apply to all selected types
     - Changes apply to all selected

6. **Progress Indication**
   - For large batches (>20 nodes): Show progress bar
   - Action cancellable during progress
   - Success toast: "X nodes updated"
   - Error handling: Partial success shows "X of Y succeeded, Z failed"

## Data Model

### Type Definitions
```typescript
interface SelectionState {
  selectedNodeIds: Set<string>;
  anchorNodeId: string | null; // First selected node
  selectionMode: 'none' | 'single' | 'multiple';
}

interface BatchOperation {
  operation: 'move' | 'delete' | 'duplicate' | 'group' | 'tag' | 'color' | 'link';
  nodeIds: string[];
  parameters?: any; // Operation-specific params
}

interface BatchResult {
  success: boolean;
  successCount: number;
  failCount: number;
  errors?: Array<{ nodeId: string; error: string }>;
}

interface LinkingPattern {
  type: 'chain' | 'star' | 'mesh' | 'sequential';
  nodeIds: string[];
  edgeType?: 'default' | 'sequential';
}
```

## UI/UX Requirements

1. **Marquee Selection Visual**
   - Dashed blue rectangle (selection box)
   - Semi-transparent blue fill (10% opacity)
   - Nodes inside box highlighted during drag
   - Release to finalize selection

2. **Selection Indicators**
   - Selected nodes: Blue outline (3px), slight shadow
   - Selection count badge: Floating top-right "X selected"
   - Deselect: Click empty canvas or press Escape

3. **Floating Action Toolbar**
   - Appears above selection center
   - Buttons: Move, Group, Tag, Color, Link, Delete
   - "More" dropdown: Duplicate, Export
   - Auto-hides on deselect

4. **Batch Delete Confirmation**
   - Dialog: "Delete X nodes?"
   - List: Shows node names (first 10, "+ Y more")
   - Warning: "This cannot be undone" (unless soft delete)
   - Buttons: "Delete" (danger), "Cancel"

5. **Batch Tag Editor**
   - Dialog: "Add Tags to X Nodes"
   - Tag selector: Existing tags + create new
   - Option: "Replace existing tags" or "Add to existing"
   - Preview: Shows how many nodes already have each tag

6. **Linking Pattern Selector**
   - Dialog: "Link X Nodes"
   - Visualization: Shows each pattern with diagram
   - Radio buttons: Chain, Star, Mesh, Sequential
   - Preview: Shows how many edges will be created
   - Warning: "This will create Y edges"

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Confirmation dialogs
- `ui/button.svelte` - Action buttons
- `base/TagSelector.svelte` - Batch tag editor
- `base/ConfirmDialog.svelte` - Delete confirmation
- `ui/progress.svelte` - Batch operation progress

### New Components Required
- `moodboard/MarqueeSelection.svelte` - Selection box renderer
- `moodboard/BatchActionToolbar.svelte` - Floating toolbar
- `moodboard/BatchInspector.svelte` - Multi-selection inspector view
- `moodboard/LinkingPatternSelector.svelte` - Pattern selection dialog
- `moodboard/BatchProgress.svelte` - Progress indicator

## Edge Cases

1. **Mixed Node Types**: Batch edit only shows fields common to all types
2. **Large Selection (>100 nodes)**: Warn about performance impact
3. **Selection Across Containers**: Not allowed - warn "Select nodes in same container"
4. **Batch Move Collision**: If nodes would overlap existing, auto-spread or warn
5. **Linking Large Selection**: Mesh pattern with 50 nodes = 1225 edges (warn)
6. **Partial Failure**: Some nodes fail (e.g., permission), show which succeeded/failed
7. **Undo Batch Operation**: Support undo for batch actions (single undo undoes all)
8. **Concurrent Edits**: If nodes modified during batch operation, abort and warn

## Performance Considerations

- Marquee selection: Use spatial index to find nodes in box (O(log n))
- Batch operations: Use database transactions (all-or-nothing)
- Batch linking: Create edges in single SQL query (not loop)
- Progress updates: Emit every 10% or 10 nodes (whichever is less frequent)
- Debounce marquee: Update selection every 100ms during drag (not every pixel)

## Testing Strategy

**Unit Tests:**
- Marquee selection box geometry (which nodes inside)
- Linking pattern edge generation (chain, star, mesh)
- Batch operation transaction logic (rollback on error)
- Selection state management

**Integration Tests:**
- Marquee select 5 nodes → all selected
- Batch delete 10 nodes → all deleted, transaction succeeds
- Batch tag 20 nodes → tags applied to all
- Link 4 nodes in chain → 3 edges created (A→B→C→D)

**E2E Tests:**
- User drags marquee, selects 5 nodes → floating toolbar appears
- User clicks "Group" → pile created containing all 5 nodes
- User right-clicks selection, "Link" → "Chain" → edges created
- User batch deletes 10 nodes → confirmation shown, nodes deleted

## Success Metrics

- Marquee selection response time < 100ms (50 nodes in viewport)
- Batch operation completes in < 500ms (20 nodes)
- Batch linking (chain, 10 nodes) < 200ms
- 40% of users with 10+ nodes use batch operations

## Dependencies

- **Requires:** Base node/edge system, selection state management
- **Required By:** None (enhancement feature)
- **Related:** CAP-001 (Batch select all in pile), CAP-006 (Batch convert piles to containers)

## Open Questions

1. **Batch Undo**: Single undo for all batch operations, or individual undo per node? → Single undo (less complex)
2. **Clipboard**: Support copy/paste across moodboards? → Phase 2 (requires clipboard API)
3. **Batch Templates**: Save common batch operations as templates? → Phase 2 (macro system)

## References

- Council Decision 5: Batch operations for power users (wig makers managing multiple projects)
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Multi-selection interactions)
