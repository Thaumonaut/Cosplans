# CAP-018: Enhanced List View

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-006 (Data Import/Export & Enhanced List View)

## Intent

Provide table-based list view of moodboard nodes as alternative to canvas visualization, enabling better accessibility, sorting, filtering, and data-focused workflows (complementing visual Canvas and Gallery views).

## Functional Requirements

1. **View Switching**
   - View toggle: Canvas / Gallery / List (tabs or dropdown)
   - Keyboard shortcut: Ctrl+1 (Canvas), Ctrl+2 (Gallery), Ctrl+3 (List)
   - View preference persists per session

2. **List View Layout**
   - Table format: Rows (nodes), Columns (properties)
   - Sortable columns: Click header to sort (ascending/descending)
   - Resizable columns: Drag column borders
   - Fixed header: Scrollable body
   - Row actions: Click row to select, double-click to open in canvas

3. **Default Columns**
   - Checkbox: Multi-select
   - Thumbnail: Node icon/image (50x50px)
   - Name: Node name (editable inline)
   - Type: Node type badge
   - Tags: Tag chips (inline)
   - Modified: Last modified date (relative, e.g., "2 hours ago")
   - Actions: Context menu icon

4. **Column Customization**
   - User can show/hide columns
   - User can reorder columns (drag column headers)
   - User can resize columns
   - Column preferences saved per user (localStorage)

5. **Available Columns**
   - Core: Name, Type, Tags, Created, Modified, Parent Container
   - Node-specific: Event Date (events), Progress (checklists), Status
   - Custom: User-defined properties

6. **Sorting**
   - Single-column sort: Click header
   - Multi-column sort: Shift+click additional columns
   - Sort indicators: Arrow icons (↑ ascending, ↓ descending)
   - Default: Modified date descending (newest first)

7. **Filtering Integration**
   - Filter bar above table (same as canvas filter - CAP-015)
   - Applied filters update table rows
   - Export visible rows only (if filtered)

8. **Bulk Actions**
   - Select rows via checkbox
   - Bulk actions: Delete, Tag, Export, Move to Container
   - Action bar appears when rows selected

9. **Pagination**
   - Default: 50 rows per page
   - Options: 25, 50, 100, 200, All
   - Pagination controls: First, Previous, Next, Last, Page jump

10. **Quick Actions**
    - Row hover: Show action icons (Edit, Duplicate, Delete)
    - Right-click: Context menu (same as canvas)
    - Double-click: Navigate to node in canvas view

## Data Model

### Type Definitions
```typescript
interface ListViewState {
  columns: ListColumn[];
  sortBy: SortConfig[];
  pageSize: number;
  currentPage: number;
  selectedRowIds: Set<string>;
}

interface ListColumn {
  id: string; // 'name', 'type', 'tags', etc.
  label: string;
  visible: boolean;
  width: number; // Pixels
  order: number;
  sortable: boolean;
  resizable: boolean;
}

interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
  priority: number; // For multi-column sort
}

interface ListViewNode {
  id: string;
  thumbnail: string;
  name: string;
  type: string;
  tags: string[];
  created_at: string;
  modified_at: string;
  parent_container?: string;
  // Additional fields per node type
  [key: string]: any;
}
```

## UI/UX Requirements

1. **View Toggle Design**
   - Tabs: Canvas (icon: grid), Gallery (icon: cards), List (icon: table)
   - Active tab: Highlighted with underline
   - Positioned: Top toolbar, right of search bar

2. **Table Design**
   - Header row: Fixed, sticky at top
   - Zebra striping: Alternating row colors (subtle)
   - Row hover: Light background color
   - Row selected: Blue background (lighter)
   - Borders: Subtle lines between columns

3. **Column Header Design**
   - Label: Bold text
   - Sort indicator: Arrow icon (↑/↓), gray if not sorted
   - Resize handle: Visible on hover (right border)
   - Drag handle: Icon for column reorder

4. **Cell Design**
   - Thumbnail cell: 50x50px image/icon
   - Name cell: Editable inline (click to edit)
   - Tags cell: Tag chips (max 3 visible, "+X more" if > 3)
   - Date cell: Relative time + tooltip (absolute date on hover)
   - Actions cell: Three-dot menu icon

5. **Pagination Design**
   - Footer: Sticky at bottom
   - Info: "Showing 1-50 of 234 nodes"
   - Controls: First, Previous, Page numbers, Next, Last
   - Page size selector: Dropdown (25, 50, 100, 200, All)

6. **Empty State**
   - Message: "No nodes in this moodboard"
   - Action: "Create Node" button
   - Image: Illustration or icon

7. **Loading State**
   - Skeleton rows: Placeholder rows while loading
   - Progress: Show spinner if load > 500ms

## Components

### Reuse from Registry
- `ui/table.svelte` (if exists) - Base table component
- `ui/button.svelte` - Action buttons
- `ui/checkbox.svelte` - Row selection checkboxes
- `ui/badge.svelte` - Type badges, tag chips
- `ui/select.svelte` - Page size selector
- `base/InlineTextEditor.svelte` - Name editing

### New Components Required
- `moodboard/ListView.svelte` - Main list view component
- `moodboard/ListViewTable.svelte` - Table component
- `moodboard/ListViewRow.svelte` - Table row component
- `moodboard/ColumnCustomizer.svelte` - Column configuration UI
- `moodboard/ListViewPagination.svelte` - Pagination controls

## Edge Cases

1. **Empty Moodboard**: Show empty state with "Create Node" action
2. **Single Node**: Table works same (1 row)
3. **Very Long Names**: Truncate with ellipsis, show full on hover
4. **Many Tags**: Show first 3, "+X more" badge (click to expand)
5. **No Thumbnail**: Show default icon based on node type
6. **Large Dataset (>1000 nodes)**: Virtualize table rows (render only visible)
7. **Column Overflow**: Horizontal scroll if total width exceeds viewport
8. **Narrow Viewport**: Hide less important columns automatically
9. **Slow Sort/Filter**: Show loading spinner during operation

## Performance Considerations

- Virtual scrolling: Render only visible rows (not all 1000+)
- Lazy-load thumbnails: Load as they enter viewport
- Client-side sorting: Use efficient algorithm (merge sort)
- Debounce inline edits: Auto-save 500ms after typing stops
- Pagination: Load page data on demand (not all at once)
- Column resize: Throttle resize events (60fps max)

## Accessibility

- Table role: `<table>` with proper ARIA roles
- Keyboard navigation: Arrow keys to navigate cells, Tab to move between rows
- Screen reader: Announce sort changes, filter results
- Focus management: Focus moves to first selected row after bulk action
- High contrast: Ensure row selection visible in all themes

## Testing Strategy

**Unit Tests:**
- Sorting logic (single/multi-column)
- Column visibility/ordering
- Pagination calculations
- Row selection state management

**Integration Tests:**
- Load list view → nodes displayed in table
- Sort by column → rows reordered
- Filter nodes → table updates
- Select rows, bulk delete → nodes removed

**E2E Tests:**
- User switches to list view → table appears
- User clicks "Name" column header → sorts ascending
- User selects 5 rows, clicks Delete → confirmation, rows removed
- User edits name inline → node updated

## Success Metrics

- List view load time < 1s (100 nodes)
- List view load time < 3s (500 nodes)
- Sort/filter response time < 500ms
- 40% of users with 20+ nodes use list view

## Dependencies

- **Requires:** Base node system
- **Required By:** CAP-020 (Accessibility strategy uses list view)
- **Related:** CAP-015 (Filter), CAP-016/017 (CSV import/export), CAP-013 (Batch operations)

## Open Questions

1. **Inline Editing**: Which fields editable inline? → Name, Tags (start simple)
2. **Column Presets**: Save column configurations as presets? → Phase 2
3. **Grouping**: Group rows by container or type? → Phase 2 (tree table)

## References

- Council Decision 7: "so there will be a list view along with the canvas and gallery view with filtering options"
- Council Decision 8: List view for accessibility (better than canvas for screen readers)
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (List view interactions)
