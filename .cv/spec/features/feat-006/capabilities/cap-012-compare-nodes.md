# CAP-012: Compare Nodes

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-004 (Progress Tracking & Comparison)

## Intent

Enable cosplayers and prop makers to create side-by-side comparisons of any node types (sketches, images, references, progress photos) to evaluate options, track progress, or analyze differences.

## Functional Requirements

1. **Compare Node Creation**
   - Canvas context menu → "Create Compare Node"
   - Or: Select 2+ nodes → Right-click → "Compare Selected"
   - Compare node accepts 2-4 items
   - Items can be: Image nodes, Sketch nodes, Reference nodes, or any node with image

2. **Comparison Modes**
   - **Side-by-Side**: Items arranged horizontally (default)
   - **Stacked**: Items arranged vertically
   - **Overlay**: Items overlayed with opacity slider (for alignment checks)
   - **Slider**: Divider slider reveals left/right image (before/after)

3. **Compare Node Display**
   - Shows thumbnails of compared items (2x2 or 1x4 grid)
   - Labels under each item (editable)
   - Comparison mode indicator icon
   - Click to open full comparison view

4. **Full Comparison View**
   - Modal or dedicated view showing items in selected mode
   - Zoom/pan synchronized across items (in side-by-side/stacked)
   - Toggle labels/annotations visibility
   - Quick switch between comparison modes
   - Export as single image (comparison view)

5. **Comparison Annotations**
   - Add notes/highlights specific to comparison
   - Circle/arrow overlays to point out differences
   - Text labels: "Option A", "Before", "After"
   - Annotations saved separately from original nodes

6. **Linked Updates**
   - If source node updated, compare node shows indicator
   - "Refresh" button to reload updated version
   - Option to auto-refresh or manual only

## Data Model

### Database Schema
```sql
-- Add to moodboard_nodes table
ALTER TABLE moodboard_nodes ADD COLUMN compare_data JSONB DEFAULT NULL;

-- Compare data structure
-- {
--   "items": [
--     { "node_id": "uuid", "label": "Option A" },
--     { "node_id": "uuid", "label": "Option B" }
--   ],
--   "mode": "side-by-side" | "stacked" | "overlay" | "slider",
--   "annotations": [...],
--   "settings": { "sync_zoom": true, "show_labels": true }
-- }
```

### Type Definitions
```typescript
interface CompareNode extends BaseMoodboardNode {
  node_type: 'compare';
  compare_data: {
    items: CompareItem[];
    mode: 'side-by-side' | 'stacked' | 'overlay' | 'slider';
    annotations?: ComparisonAnnotation[];
    settings: {
      sync_zoom: boolean;
      show_labels: boolean;
      auto_refresh: boolean;
    };
  };
}

interface CompareItem {
  node_id: string;
  label: string;
  node_data?: MoodboardNode; // Populated via join
  last_synced_at: string;
}

interface ComparisonAnnotation {
  id: string;
  type: 'circle' | 'arrow' | 'text';
  position: { x: number; y: number };
  applies_to: 'all' | number; // All items or specific item index
  data: any; // Shape-specific data
}
```

## UI/UX Requirements

1. **Compare Node Card Design**
   - Grid layout: 2x2 (4 items) or 1x2 (2 items)
   - Each thumbnail: 100x100px
   - Labels below thumbnails
   - Mode indicator badge (icon: side-by-side/stacked/overlay/slider)
   - "View Comparison" button on hover

2. **Full Comparison View Layout**
   - Header: Mode switcher tabs, zoom controls, export button
   - Main area: Items displayed in selected mode
   - Footer: Item labels (editable inline)
   - Side panel: Annotation tools (if enabled)

3. **Mode-Specific Layouts**
   - **Side-by-Side**: Items in horizontal row, equal width
   - **Stacked**: Items in vertical column, equal height
   - **Overlay**: Items layered with opacity sliders for each
   - **Slider**: Two items with vertical divider (drag to reveal)

4. **Synchronized Interactions**
   - Zoom: All items zoom together (if sync_zoom enabled)
   - Pan: All items pan together
   - Toggle: "Lock/Unlock Sync" button

5. **Annotation Tools**
   - Circle: Drag to create highlight circle
   - Arrow: Click-drag to draw arrow pointing to feature
   - Text: Click to place label
   - Annotations shown on all items or specific item (toggle)

6. **Export Options**
   - Export as PNG: Full comparison view with labels
   - Layout: Preserve selected mode
   - Resolution: Original or scaled (1920px width max)

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Full comparison view modal
- `ui/button.svelte` - Action buttons
- `ui/tabs.svelte` - Mode switcher
- `ui/slider.svelte` - Overlay opacity sliders
- `base/InlineTextEditor.svelte` - Label editing

### New Components Required
- `moodboard/nodes/CompareNode.svelte` - Compare node card
- `moodboard/ComparisonView.svelte` - Full comparison view
- `moodboard/ComparisonSideBySide.svelte` - Side-by-side layout
- `moodboard/ComparisonOverlay.svelte` - Overlay layout
- `moodboard/ComparisonSlider.svelte` - Slider layout
- `moodboard/ComparisonAnnotations.svelte` - Annotation tools

## Edge Cases

1. **Mismatched Aspect Ratios**: Scale to fit, maintain aspect ratio, show letterboxing
2. **Different Node Types**: Support any node with image (extract thumbnail)
3. **Missing Node**: If source node deleted, show placeholder "Item removed"
4. **Large Images**: Load lower-resolution for comparison view, full res on zoom
5. **More Than 4 Items**: Limit to 4, warn if user tries to add more
6. **No Images**: If node has no image, show icon/title instead
7. **Overlay Mode with 3+ Items**: Only compare first two, show warning
8. **Slider Mode with 3+ Items**: Only compare first two, show warning

## Performance Considerations

- Lazy-load images: Load only when comparison view opened
- Thumbnail generation: Use lower-res thumbnails for card display
- Synchronized pan/zoom: Use CSS transforms (GPU-accelerated)
- Export: Render to canvas, then export as PNG (client-side)
- Cache: Store rendered comparison for 5 minutes

## Testing Strategy

**Unit Tests:**
- Compare node data validation (2-4 items)
- Mode switching logic
- Annotation data structure
- Synchronized zoom/pan calculations

**Integration Tests:**
- Create compare node with 2 items → displays in grid
- Switch modes → layout updates
- Add annotation → saved to compare_data
- Export PNG → file generated

**E2E Tests:**
- User selects 2 nodes, clicks "Compare Selected" → compare node created
- User opens comparison view, switches to overlay mode → items overlayed
- User adds circle annotation → visible on both items
- User exports comparison → PNG downloaded

## Success Metrics

- Comparison view opens in < 1s (2 items)
- Mode switching latency < 200ms
- Export generation time < 3s (1920px)
- 60% of users with progress photos use compare nodes

## Dependencies

- **Requires:** Base node system, image nodes
- **Required By:** None (enhancement feature)
- **Related:** CAP-011 (Sketch nodes can be compared)

## Open Questions

1. **Video Comparison**: Support comparing video nodes? → Phase 2 (requires video player)
2. **3D Model Comparison**: Compare 3D models? → Phase 2 (requires Three.js)
3. **Difference Highlighting**: Auto-detect differences between images? → Phase 2 (requires image processing library)

## References

- Council Decision 6: "i think a special compare node would be good so you can compare any node type"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Compare node interactions)
