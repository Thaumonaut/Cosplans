# CAP-015: Ghost Filtering

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Low  
**Checkpoint:** CP-005 (Bulk Operations & Templates)

## Intent

Enable users to filter/search nodes on the canvas, with non-matching nodes rendered as "ghosts" (semi-transparent) to maintain spatial context while highlighting relevant items, preventing disorientation from hiding nodes entirely.

## Functional Requirements

1. **Filter Activation**
   - Search bar in toolbar: Type to filter by node name
   - Filter panel: Advanced filters (node type, tags, date range, status)
   - Keyboard shortcut: Ctrl+F to focus search

2. **Filter Criteria**
   - **Text Search**: Match node name/description (case-insensitive, fuzzy)
   - **Node Type**: Filter by type (character, prop, event, checklist, etc.)
   - **Tags**: Filter by tags (AND/OR logic)
   - **Date Range**: Filter by created/modified date
   - **Status**: Filter by progress status (pending, in progress, complete)
   - **Connections**: Filter by connected nodes ("Show nodes linked to X")

3. **Ghost Rendering**
   - Non-matching nodes: Rendered at 60% opacity (ghosted)
   - Matching nodes: Full opacity (100%), highlighted border
   - Edges: Connected to matching nodes = full opacity, others = 60% opacity
   - True ghosts (CAP-003): Rendered at 40% opacity (distinguish from filtered)

4. **Filter State Indicator**
   - Active filter: Badge in toolbar shows "X of Y nodes"
   - Clear filter button (X icon)
   - Filter summary tooltip: Shows active criteria

5. **Filter Persistence**
   - Filter state persists during session (in memory)
   - Clearing filter: Restores full view
   - Filter not saved to database (per-session only)

6. **Filter Combinations**
   - Multiple criteria: Combined with AND logic (all must match)
   - OR logic for tags: "Tag A OR Tag B"
   - Exclude mode: "NOT Tag C" (exclude nodes with tag)

## Data Model

### Type Definitions
```typescript
interface FilterState {
  active: boolean;
  criteria: FilterCriteria;
  matchingNodeIds: Set<string>;
  totalNodes: number;
}

interface FilterCriteria {
  searchText?: string;
  nodeTypes?: string[]; // Filter by types
  tags?: TagFilter;
  dateRange?: { start: string; end: string };
  status?: ('pending' | 'in_progress' | 'complete')[];
  connectedTo?: string; // Node ID
}

interface TagFilter {
  mode: 'AND' | 'OR';
  tags: string[];
  exclude?: string[]; // Tags to exclude
}

interface FilterResult {
  matchingNodes: MoodboardNode[];
  ghostedNodes: MoodboardNode[];
  matchCount: number;
  totalCount: number;
}
```

## UI/UX Requirements

1. **Search Bar Design**
   - Toolbar: Prominent search input (expandable on mobile)
   - Icon: Magnifying glass (left), clear X (right, when active)
   - Placeholder: "Search nodes..."
   - Live results: Filter updates as you type (debounced 300ms)

2. **Advanced Filter Panel**
   - Toggle: "Advanced Filters" button in toolbar
   - Panel: Slide out from right (desktop) or bottom sheet (mobile)
   - Sections: Node Type, Tags, Date Range, Status, Connections
   - Apply/Clear buttons

3. **Filter Badge**
   - Toolbar: Badge shows "12 of 45 nodes"
   - Color: Blue when active
   - Click badge: Opens filter panel (to adjust)

4. **Highlighted Matches**
   - Matching nodes: Blue border (2px), subtle glow
   - First match: Auto-pan canvas to show (optional)
   - Cycle through matches: Arrow buttons (next/previous)

5. **Ghost Visual**
   - Ghosted nodes: 60% opacity, grayscale filter (optional)
   - Hover: Restore full opacity temporarily
   - Click: Can still interact (view details, edit)

6. **Clear Filter**
   - X button in search bar
   - "Clear All Filters" button in advanced panel
   - Keyboard: Escape key clears filter

## Components

### Reuse from Registry
- `ui/input.svelte` - Search input
- `ui/sheet.svelte` - Advanced filter panel (mobile)
- `ui/button.svelte` - Action buttons
- `ui/select.svelte` - Dropdowns
- `ui/checkbox.svelte` - Filter checkboxes
- `ui/badge.svelte` - Filter count badge
- `base/TagSelector.svelte` - Tag filter

### New Components Required
- `moodboard/FilterBar.svelte` - Search bar component
- `moodboard/AdvancedFilterPanel.svelte` - Advanced filter panel
- `moodboard/FilterBadge.svelte` - Match count badge

## Edge Cases

1. **No Matches**: Show "No nodes match your filter" message, suggest clearing
2. **All Matches**: Badge shows "45 of 45 nodes" (no ghosting)
3. **Filter Empty Canvas**: If container empty, show empty state
4. **Filter During Edit**: Editing node remains full opacity even if doesn't match
5. **Filter with Ghost Nodes**: True ghosts (CAP-003) at 40%, filtered ghosts at 60%
6. **Complex Filter (>5 criteria)**: Performance warning if filter too complex
7. **Filter Text Special Characters**: Escape regex special chars in search

## Performance Considerations

- Filter computation: Run on client-side (no DB query)
- Debounce search input: 300ms (avoid filtering on every keystroke)
- Memoize filter results: Recompute only when criteria or nodes change
- Fuzzy search: Use efficient algorithm (e.g., Fuse.js, limit 1000 nodes)
- Ghost rendering: CSS opacity (GPU-accelerated)
- Filter large datasets (>200 nodes): Show "Computing..." spinner if > 500ms

## Testing Strategy

**Unit Tests:**
- Filter matching logic (text, tags, date, status)
- Fuzzy search algorithm accuracy
- Filter combination (AND/OR logic)
- Ghost opacity calculation

**Integration Tests:**
- Type in search bar → non-matching nodes ghosted
- Select node type filter → only that type shown
- Clear filter → all nodes restored
- Apply multiple criteria → correct matches

**E2E Tests:**
- User types "character" in search → character nodes highlighted
- User opens advanced filters, selects "event" type → only events shown
- User clicks clear filter → all nodes visible
- User filters by tag → tagged nodes highlighted

## Success Metrics

- Filter response time < 300ms (100 nodes)
- Filter response time < 1s (500 nodes)
- Search accuracy: 90% of users find target node in < 3 searches
- 50% of users with 20+ nodes use filter feature

## Dependencies

- **Requires:** Base node system, search/filter logic
- **Required By:** None (enhancement feature)
- **Related:** CAP-003 (Ghost nodes), CAP-013 (Batch operations may use filter to select)

## Open Questions

1. **Saved Filters**: Allow saving frequently-used filters? → Phase 2 (filter presets)
2. **Filter by Custom Fields**: Support filtering by user-defined properties? → Phase 2 (requires custom fields feature)
3. **Fuzzy Search Threshold**: How fuzzy? (strict vs loose matching) → Configurable in settings

## References

- Council Decision 5: "yes, i want a way to either filter nodes. maybe it will ghost the other nodes so the ones you are looking for are highlighted"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Filter/search interactions)
