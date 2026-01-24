# CAP-002: Container Nodes & Drill-In Navigation

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Critical  
**Checkpoint:** CP-001 (Foundation & Core Nodes)

## Intent

Enable users to create nested organizational containers (character, prop, group) that can be drilled into, providing dedicated canvas space for complex hierarchical information while managing context loss through breadcrumb navigation.

## Functional Requirements

1. **Container Creation**
   - Three container subtypes: Character, Prop, Group (generic)
   - Created via canvas context menu → "Create Container" → select type
   - Container appears as card with icon/image, title, and "Enter" button
   - Container properties: name, description, color, icon/image, subtype

2. **Drill-In Navigation**
   - Click "Enter" or double-click container to drill in
   - Canvas transitions to container's internal canvas
   - Breadcrumb bar updates: Home > Container Name > ...
   - "Back" button in top-left returns to parent canvas
   - Browser history tracks navigation (back button works)

3. **Container Canvas**
   - Each container has its own independent canvas
   - Supports all node types (including nested containers)
   - Ghost nodes appear for items linked from outside (CAP-003)
   - Empty state shows "Add items to organize your [container type]"

4. **Context Management**
   - Breadcrumb shows full path: Home > Group A > Character B > current
   - Breadcrumb items clickable to jump to that level
   - Mobile: Show Home + current level only (expandable dropdown)
   - Inspector panel shows container details regardless of depth

5. **Container Details Display**
   - When viewing parent canvas, container shows summary:
     - Title, description (truncated), item count
     - Preview thumbnails of first few items inside
   - Inspector panel shows full details when container selected

## Data Model

### Database Schema
```sql
-- Existing moodboard_nodes table supports this via:
-- node_type: 'character' | 'prop' | 'group'
-- parent_id: References another node (container) or NULL (root level)

-- Add index for hierarchy queries
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_parent_id 
  ON moodboard_nodes(parent_id) WHERE parent_id IS NOT NULL;

-- Add computed column for depth (optional, for performance)
ALTER TABLE moodboard_nodes 
  ADD COLUMN hierarchy_depth INTEGER GENERATED ALWAYS AS (
    -- Computed via recursive query, see functions below
  ) STORED;
```

### Type Definitions
```typescript
interface ContainerNode extends BaseMoodboardNode {
  node_type: 'character' | 'prop' | 'group';
  parent_id: string | null; // Parent container or null for root
  description?: string;
  color?: string;
  icon?: string;
  image_url?: string;
  metadata?: {
    item_count?: number; // Cached count of children
    preview_items?: string[]; // IDs of first 3-5 items for preview
  };
}
```

## UI/UX Requirements

1. **Container Card Design**
   - Displays as larger card (200x250px default)
   - Shows container icon/image at top
   - Title (bold, 16px)
   - Description (truncated, 12px, 2 lines max)
   - Item count badge
   - Preview thumbnails in grid (3x2)
   - "Enter" button overlays on hover (desktop) or always visible (mobile)

2. **Navigation Interactions**
   - Double-click container: Drill in
   - Single click: Select (show in inspector)
   - "Enter" button click: Drill in
   - Breadcrumb click: Navigate to that level
   - Back button: Return to parent
   - Browser back/forward: Navigate container history

3. **Breadcrumb Behavior**
   - Desktop: Full path shown, scrollable if too long
   - Tablet: Show first + last 2 levels
   - Mobile: Home + current (dropdown for full path)
   - Each level shows icon + name
   - Current level highlighted, not clickable

4. **Progressive Disclosure (Mobile)**
   - Collapsible context bar (Council Decision 1)
   - Breadcrumb in collapsed state shows only icon
   - Expand reveals full breadcrumb + back button

## Components

### Reuse from Registry
- `ui/button.svelte` - Enter/Back buttons
- `base/InlineTextEditor.svelte` - Container name editing
- `ui/badge.svelte` - Item count badge
- `ui/breadcrumb.svelte` (if exists) or create new

### New Components Required
- `moodboard/nodes/ContainerNode.svelte` - Main container node component
- `moodboard/ContainerCanvas.svelte` - Container's internal canvas view
- `moodboard/Breadcrumb.svelte` - Navigation breadcrumb component
- `moodboard/ContainerDetails.svelte` - Inspector panel view for containers

## Edge Cases

1. **Deep Nesting**: Warn at depth 5+, limit to depth 10 (prevent infinite recursion)
2. **Empty Container**: Show helpful empty state with "Add Node" shortcut
3. **Orphaned Container**: If parent deleted, move to root level
4. **Circular Reference**: Validate on creation - container cannot be moved into its own descendant
5. **Ghost Node Conflicts**: If ghost node conflicts with real node, ghost takes precedence visually (CAP-003)
6. **Breadcrumb Overflow**: Truncate middle levels with "..." dropdown on desktop

## Performance Considerations

- Lazy-load container contents (only load when drilling in)
- Cache item count and preview thumbnails in metadata
- Use virtual scrolling for breadcrumb if path exceeds 10 levels
- Canvas state persists during session (cached in memory)
- Breadcrumb path calculated via indexed parent_id queries

## Testing Strategy

**Unit Tests:**
- Container creation with all subtypes
- Parent-child relationship validation
- Breadcrumb path generation for various depths
- Circular reference prevention

**Integration Tests:**
- Drill-in navigation updates breadcrumb and canvas
- Back button restores parent canvas state
- Browser back/forward navigates correctly
- Inspector shows container details at any depth

**E2E Tests:**
- User creates Character container, adds nodes, drills in, adds more, returns
- User navigates: Root > Group > Character > back to Group > back to Root
- User clicks breadcrumb to jump to middle level
- Mobile user uses collapsible breadcrumb

## Success Metrics

- Drill-in transition completes in < 500ms
- Breadcrumb renders in < 100ms
- 95% of users successfully navigate in/out on first attempt
- No memory leaks after 20+ navigation actions

## Dependencies

- **Requires:** Base canvas rendering, navigation state management
- **Required By:** CAP-003 (Ghost Nodes), CAP-005 (Container Peek)
- **Related:** CAP-004 (Inspector Panel shows container details)

## Open Questions

None - design approved in Council Decision 3.

## References

- Council Decision 1: Mobile progressive disclosure
- Council Decision 3: Containers for nesting with context loss
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Container interactions)
