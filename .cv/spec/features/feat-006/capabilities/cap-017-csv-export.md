# CAP-017: CSV Export

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Low  
**Checkpoint:** CP-006 (Data Import/Export & Enhanced List View)

## Intent

Enable users to export moodboard nodes to CSV format for external processing, reporting, sharing with team members, or backup, complementing the import functionality for full data portability.

## Functional Requirements

1. **Export Trigger**
   - Canvas context menu → "Export to CSV"
   - Or: File menu → "Export" → "CSV"
   - Or: Select nodes → Right-click → "Export Selected to CSV"

2. **Export Scope**
   - All nodes: Export entire moodboard
   - Selected nodes: Export only selected (if multi-selection active)
   - Current container: Export nodes in current container only
   - Filtered nodes: Export only visible/matching nodes (if filter active)

3. **Column Selection**
   - Default columns: Name, Type, Description, Tags, Created, Modified
   - Optional columns: Position (X, Y), Parent Container, Custom Fields
   - User can toggle columns on/off
   - Column order: Drag to reorder

4. **Export Options**
   - File name: Auto-generated "[Moodboard Name] - [Date].csv" (editable)
   - Delimiter: Comma (default), Semicolon, Tab
   - Include header row: Toggle (default: true)
   - Encoding: UTF-8 (default), UTF-16, Latin-1
   - Quote style: All fields (default), Only text fields, Minimal

5. **Special Field Handling**
   - Tags: Concatenate with pipe separator "tag1|tag2|tag3"
   - Dates: ISO 8601 format "YYYY-MM-DD HH:mm:ss"
   - URLs: Full URLs (not relative paths)
   - Nested containers: Show full path "Container A / Container B / Node"
   - Complex fields (JSONB): JSON string or omit (user choice)

6. **Export Progress**
   - For large exports (>100 nodes): Show progress bar
   - Success notification: "CSV exported successfully" + download

## Data Model

### Type Definitions
```typescript
interface CSVExport {
  scope: 'all' | 'selected' | 'container' | 'filtered';
  nodeIds?: string[]; // If scope is 'selected'
  containerId?: string; // If scope is 'container'
}

interface ExportConfig {
  columns: ExportColumn[];
  delimiter: ',' | ';' | '\t';
  includeHeader: boolean;
  encoding: 'utf-8' | 'utf-16' | 'latin-1';
  quoteStyle: 'all' | 'text' | 'minimal';
  fileName: string;
}

interface ExportColumn {
  id: string; // 'name', 'type', 'description', etc.
  label: string; // Column header
  enabled: boolean;
  order: number;
  transform?: (node: MoodboardNode) => string; // Value transformation
}

interface ExportResult {
  csvContent: string;
  fileName: string;
  rowCount: number;
  fileSize: number; // Bytes
}
```

## UI/UX Requirements

1. **Export Dialog Layout**
   - Modal: 500px wide
   - Sections: Scope, Columns, Options, Preview
   - Export button: Bottom-right (primary)

2. **Scope Selection**
   - Radio buttons:
     - "All nodes (X total)"
     - "Selected nodes (Y selected)" (disabled if no selection)
     - "Current container (Z nodes)" (disabled if at root)
     - "Filtered nodes (W visible)" (disabled if no filter)

3. **Column Configuration**
   - Checklist: Each column with checkbox
   - Default columns: Checked by default
   - Optional columns: Unchecked by default
   - Drag handles: Reorder columns
   - "Select All" / "Deselect All" shortcuts

4. **Options Panel**
   - File name input: Pre-filled, editable
   - Delimiter dropdown: Comma, Semicolon, Tab
   - Encoding dropdown: UTF-8, UTF-16, Latin-1
   - Quote style dropdown: All, Text Only, Minimal
   - Include header: Checkbox (default: checked)

5. **Preview Section**
   - Table: Shows first 5 rows of export
   - Scrollable horizontally (if many columns)
   - Updates live as options change

6. **Export Action**
   - Click "Export" → File downloads
   - Browser download dialog appears
   - Success toast: "CSV exported successfully"

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Export dialog
- `ui/button.svelte` - Action buttons
- `ui/select.svelte` - Dropdowns
- `ui/checkbox.svelte` - Column toggles
- `ui/radio-group.svelte` - Scope selector
- `ui/input.svelte` - File name input
- `ui/table.svelte` - Preview table

### New Components Required
- `moodboard/CSVExportDialog.svelte` - Main export dialog
- `moodboard/ColumnSelector.svelte` - Column configuration UI
- `moodboard/ExportPreview.svelte` - Preview table

## Edge Cases

1. **No Nodes to Export**: Show error "No nodes to export"
2. **Empty Fields**: Export as empty cell ""
3. **Commas in Text**: Properly quoted if delimiter is comma
4. **Newlines in Text**: Quoted and preserved (multiline cell)
5. **Special Characters**: Escaped according to CSV spec (RFC 4180)
6. **Large Export (>10000 nodes)**: Warn "This may take a moment"
7. **File Name Conflicts**: Browser handles (appends number)
8. **Unicode Characters**: Ensure proper encoding (UTF-8 BOM if needed for Excel)
9. **Empty Moodboard**: Show "No nodes to export" message

## Performance Considerations

- CSV generation: Client-side using papaparse (no server round-trip)
- Large datasets: Generate in chunks (avoid blocking UI)
- Progress updates: Show progress bar if > 500 nodes
- Memory: Stream to file (avoid loading entire CSV in memory)
- Download: Use Blob URL for efficient download

## Testing Strategy

**Unit Tests:**
- CSV generation (various delimiters, quote styles)
- Field transformation (tags, dates, URLs)
- Special character escaping
- Column ordering

**Integration Tests:**
- Export all nodes → CSV contains all nodes
- Export selected → CSV contains only selected
- Toggle columns → CSV includes/excludes columns
- Change delimiter → CSV uses correct delimiter

**E2E Tests:**
- User clicks "Export to CSV"
- User selects columns, changes file name
- User clicks Export → file downloads
- User opens CSV in Excel → data correct

## Success Metrics

- Export generation time < 1s (100 nodes)
- Export generation time < 10s (1000 nodes)
- File size: ~1KB per node (average)
- 15% of users export moodboard at least once

## Dependencies

- **Requires:** Base node system, papaparse library
- **Required By:** None (enhancement feature)
- **Related:** CAP-016 (CSV Import - reverse operation), CAP-018 (List view as alternative export format)

## Open Questions

1. **Excel Format**: Support .xlsx export? → Phase 2 (requires different library)
2. **Export Edges**: Include edges in export? → Phase 2 (requires multi-sheet or separate file)
3. **Export Templates**: Save export configurations for reuse? → Phase 2 (export presets)

## References

- Council Decision 7: CSV import/export for data portability
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Export interactions)
