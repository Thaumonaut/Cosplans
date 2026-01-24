# CAP-016: CSV Import with Mapping

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Low  
**Checkpoint:** CP-006 (Data Import/Export & Enhanced List View)

## Intent

Enable event coordinators and power users to bulk-import nodes from CSV files (e.g., vendor lists, attendee lists, task lists), with intelligent mapping interface to convert CSV columns to node properties cleanly.

## Functional Requirements

1. **CSV Import Trigger**
   - Canvas context menu → "Import from CSV"
   - Or: File menu → "Import" → "CSV"
   - Drag-drop CSV file onto canvas (with drop zone indicator)

2. **File Upload**
   - Supported formats: .csv, .tsv
   - Max file size: 5MB (warn at 1MB)
   - Encoding: UTF-8, auto-detect others
   - Validation: Check file is valid CSV

3. **Column Mapping Interface**
   - Step 1: Preview CSV (first 5 rows shown)
   - Step 2: Map columns to node properties
     - Column dropdown → Node property dropdown
     - Required: Name column (must map)
     - Optional: Type, Tags, Description, etc.
   - Step 3: Node type selection (default or per-row if Type column mapped)
   - Step 4: Preview nodes (shows 5 example nodes)
   - Step 5: Import (create nodes)

4. **Smart Mapping**
   - Auto-detect common columns: "Name", "Title", "Description", "Tags", "Type"
   - Case-insensitive matching
   - Suggest mappings based on column names
   - User can override suggestions

5. **Import Options**
   - Create as: Individual nodes (default) or Container with children
   - Position: Grid layout (auto-arrange) or Random
   - Delimiter: Auto-detect (comma, semicolon, tab)
   - Skip header row: Toggle (default: true)
   - Tag imported nodes: Add "imported-[date]" tag automatically

6. **Error Handling**
   - Invalid rows: Skip with warning (show which rows failed)
   - Missing required fields: Prompt user or fill with default
   - Duplicate detection: Warn if node name matches existing (option to skip/merge)

7. **Import Progress**
   - Progress bar: "Importing... X of Y rows"
   - Cancellable during import
   - Success summary: "Imported X nodes, skipped Y"

## Data Model

### Type Definitions
```typescript
interface CSVImport {
  file: File;
  delimiter: ',' | ';' | '\t';
  hasHeader: boolean;
  encoding: string;
  rows: string[][]; // Parsed CSV data
}

interface ColumnMapping {
  csvColumnIndex: number;
  csvColumnName: string;
  nodeProperty: string; // 'name', 'description', 'tags', 'node_type', etc.
  transform?: (value: string) => any; // Optional transformation
}

interface ImportConfig {
  mappings: ColumnMapping[];
  defaultNodeType: string; // If Type column not mapped
  createAs: 'individual' | 'container';
  positionMode: 'grid' | 'random';
  skipHeader: boolean;
  addImportTag: boolean;
}

interface ImportResult {
  successCount: number;
  failCount: number;
  skippedRows: number[];
  errors: Array<{ row: number; error: string }>;
  createdNodeIds: string[];
}
```

## UI/UX Requirements

1. **Import Wizard Layout**
   - Modal dialog: 600px wide (desktop), full-screen (mobile)
   - Steps: Progress indicator at top (1→2→3→4→5)
   - Navigation: Back/Next buttons
   - Cancel button (top-right)

2. **Step 1: Preview CSV**
   - Table: Shows first 5 rows with column headers
   - File info: Name, size, row count
   - Encoding selector (if issues detected)
   - Delimiter selector (auto-detected, can override)

3. **Step 2: Column Mapping**
   - Table: CSV Column → Node Property
   - Each row: Column name, dropdown (node property), preview value
   - Required marker: Asterisk on Name row
   - Auto-mapping: Highlighted in green if auto-detected

4. **Step 3: Node Type**
   - Radio buttons:
     - "Same type for all" → Dropdown (select type)
     - "Map from column" → Dropdown (select CSV column)
   - Default: "Same type for all" → "Generic"

5. **Step 4: Preview**
   - Shows 5 example nodes as cards
   - Node properties displayed
   - Warning messages: Missing required fields, invalid types
   - "Looks good? Import" or "Back to adjust"

6. **Step 5: Import Progress**
   - Progress bar with percentage
   - Current row: "Importing row 23 of 150"
   - Cancel button (stops import, keeps created nodes)

7. **Success Dialog**
   - Summary: "✓ Imported 147 nodes successfully"
   - Errors: "⚠ Skipped 3 rows due to errors"
   - View errors: Expandable list of error details
   - Actions: "View Imported Nodes", "Close"

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Import wizard modal
- `ui/button.svelte` - Action buttons
- `ui/select.svelte` - Dropdowns
- `ui/table.svelte` (if exists) - CSV preview table
- `ui/progress.svelte` - Progress bar
- `ui/radio-group.svelte` - Node type selector

### New Components Required
- `moodboard/CSVImportWizard.svelte` - Main import wizard
- `moodboard/CSVPreview.svelte` - CSV preview table
- `moodboard/ColumnMappingEditor.svelte` - Mapping interface
- `moodboard/NodePreview.svelte` - Preview imported nodes

## Edge Cases

1. **Empty CSV**: Show error "CSV file is empty"
2. **Single Column**: Valid but limited (map to Name only)
3. **No Header Row**: User must manually name columns (use "Column 1", "Column 2")
4. **Very Large File (>5MB)**: Reject with error
5. **Invalid CSV Format**: Show error "Could not parse CSV"
6. **Encoding Issues**: Offer encoding selector (UTF-8, Latin-1, etc.)
7. **Duplicate Names**: Append number (e.g., "Node", "Node 2", "Node 3")
8. **Special Characters in Names**: Escape or sanitize
9. **Date/Number Formatting**: Parse dates/numbers correctly (locale-aware)
10. **Empty Rows**: Skip automatically, don't count as errors

## Performance Considerations

- CSV parsing: Use papaparse library (efficient, handles edge cases)
- Stream processing: If file large, parse in chunks (not all at once)
- Batch insert: Create nodes in batches of 50 (avoid 150 individual queries)
- Progress updates: Emit every 10 rows (not every row)
- Grid layout: Calculate positions client-side (simple algorithm)

## Security Considerations

- File size limit: Enforce 5MB max (prevent DOS)
- CSV injection: Sanitize fields starting with =, +, -, @ (prevent formula injection)
- Content validation: Validate node properties (e.g., max length)
- Malware scan: Optional server-side scan for uploaded files

## Testing Strategy

**Unit Tests:**
- CSV parsing (various delimiters, encodings)
- Column mapping logic (auto-detection)
- Node creation from CSV row
- Error handling (invalid rows)

**Integration Tests:**
- Upload CSV → parsed correctly
- Map columns → nodes created with correct properties
- Skip invalid rows → error summary shown
- Import 100 rows → completes successfully

**E2E Tests:**
- User uploads CSV with 50 rows
- User maps Name, Description, Tags columns
- User selects "Generic" node type
- User clicks Import → 50 nodes created on canvas

## Success Metrics

- CSV parsing time < 500ms (1000 rows)
- Import time < 5s (100 nodes)
- Auto-mapping accuracy > 80% (common column names)
- 20% of power users (10+ nodes) use CSV import

## Dependencies

- **Requires:** Base node system, papaparse library
- **Required By:** None (enhancement feature)
- **Related:** CAP-017 (CSV Export - reverse operation), CAP-018 (List view shows imported nodes)

## Open Questions

1. **Excel Files**: Support .xlsx import? → Phase 2 (requires different parser)
2. **Google Sheets**: Direct import from Google Sheets? → Phase 2 (requires API integration)
3. **Import Templates**: Save mapping configurations for reuse? → Phase 2 (mapping presets)

## References

- Council Decision 7: "cvs import is an interesting idea. it could be hard since we need a way to convert the data cleanly from cvs to node"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Import interactions)
