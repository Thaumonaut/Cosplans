# CAP-001: Pile Nodes & In-Place Expansion

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Critical  
**Checkpoint:** CP-001 (Foundation & Core Nodes)

## Intent

Enable users to group related nodes in a single-layer "pile" that can be expanded in-place to view all contained items without losing context of the surrounding canvas.

## Functional Requirements

1. **Pile Creation**
   - User can create a pile node via canvas context menu → "Create Pile"
   - User can drag-and-drop existing nodes onto a pile to add them
   - Pile displays count badge showing number of contained items
   - Pile shows preview of top 1-3 items (thumbnails/titles)

2. **In-Place Expansion**
   - Click/tap pile to expand in-place
   - Expansion spreads items in radial or grid layout around pile position
   - Canvas zooms/pans slightly to ensure all expanded items visible
   - Expanded items remain selectable and editable
   - Visual connection (subtle lines/background) shows items belong to pile

3. **Collapse Behavior**
   - Click pile again or click "Collapse" button to return items to pile
   - Items retain their individual positions within the pile for next expansion
   - Items can be removed from pile by dragging out while expanded

4. **Pile Properties**
   - Name/title (editable inline)
   - Color/icon (customizable)
   - Description (optional, shown in inspector)
   - Contains array of node IDs (stored in database)

## Data Model

### Database Schema
```sql
-- Add to moodboard_nodes table
pile_contents JSONB DEFAULT '[]'::jsonb, -- Array of node IDs in this pile
pile_layout JSONB DEFAULT NULL, -- Expansion layout data (positions, style)
```

### Type Definitions
```typescript
interface PileNode extends BaseMoodboardNode {
  node_type: 'pile';
  pile_contents: string[]; // Array of node IDs
  pile_layout?: {
    expansion_style: 'radial' | 'grid';
    item_positions?: Record<string, {x: number, y: number}>; // Relative positions
  };
}
```

## UI/UX Requirements

1. **Visual Design**
   - Pile appears as stacked card icon with count badge
   - Preview thumbnails of top items shown
   - Expansion animation (300ms) with easing
   - Collapsed state shows subtle shadow suggesting depth

2. **Interactions**
   - Single click: Expand/collapse
   - Double-click: Open inspector
   - Right-click: Context menu (rename, delete, convert to container)
   - Drag-drop: Add/remove items
   - Keyboard: Space to expand/collapse when focused

3. **Mobile Adaptations**
   - Tap to expand
   - Long-press for context menu
   - Expansion may use sheet/modal on small screens if items don't fit

## Components

### Reuse from Registry
- `base/InlineTextEditor.svelte` - Pile name editing
- `ui/badge.svelte` - Item count badge
- `base/ConfirmDialog.svelte` - Delete confirmation

### New Components Required
- `moodboard/nodes/PileNode.svelte` - Main pile node component
- `moodboard/PileExpansionContainer.svelte` - Handles expansion layout

## Edge Cases

1. **Empty Pile**: Show placeholder text "Drop items here"
2. **Single Item**: Still functions as pile, allows adding more
3. **Max Items**: Consider warning if pile exceeds 50 items (performance)
4. **Nested Piles**: Not allowed - prevent dragging pile into another pile
5. **Circular References**: Validate node cannot be added to pile if already contains it

## Performance Considerations

- Expansion layout calculated client-side
- Pile contents loaded with initial canvas data (part of node data)
- Expansion animation uses CSS transforms (GPU-accelerated)
- Limit preview thumbnails to 3 items to reduce rendering cost

## Testing Strategy

**Unit Tests:**
- Pile creation with empty contents
- Add/remove items from pile
- Expansion layout calculation (radial/grid)
- Validation prevents nested piles

**Integration Tests:**
- Drag-drop workflow to create and populate pile
- Expansion/collapse preserves item positions
- Inspector panel shows pile contents
- Context menu actions (rename, delete, convert)

**E2E Tests:**
- User creates pile, adds 5 items, expands, collapses
- User removes item from expanded pile by dragging out
- User converts pile to container (CAP-006 integration)

## Success Metrics

- Pile creation time < 500ms
- Expansion animation completes in 300ms
- No layout thrashing during expansion
- 95% of users successfully expand pile on first attempt

## Dependencies

- **Requires:** Base canvas rendering (existing)
- **Required By:** CAP-006 (Pile-to-Container Conversion)
- **Related:** CAP-013 (Batch Operations - select all in pile)

## Open Questions

None - design approved in Council Decision 3.

## References

- Council Decision 3: Piles vs Containers distinction
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Pile interactions)
