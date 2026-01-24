# CAP-009: Checklist Nodes

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-003 (Event, Contact, Checklist Nodes)

## Intent

Enable cosplayers to track tasks, shopping lists, and progress items directly within moodboards, providing actionable to-do lists embedded in visual planning context.

## Functional Requirements

1. **Checklist Node Creation**
   - Canvas context menu → "Create Checklist"
   - Checklist properties:
     - Title (required)
     - Items (list of checkbox items)
     - Show progress bar (optional)
     - Due date (optional)

2. **Checklist Items**
   - Each item: Checkbox, text label, optional notes
   - Item actions: Check/uncheck, reorder (drag), edit, delete
   - Nested items (sub-tasks) - indent level 1 only
   - Item metadata: Created date, completed date, assignee (if team feature)

3. **Checklist Display**
   - Shows title and progress (X/Y completed)
   - Progress bar (visual indicator)
   - First 3-5 uncompleted items visible on card
   - "Show all" expands full list
   - Completed items collapsed by default (expandable)

4. **Checklist Interactions**
   - Click checkbox: Toggle item completion
   - Click item text: Edit inline
   - Drag item: Reorder
   - Add item: "+" button or press Enter in last item
   - Delete item: Trash icon or backspace in empty item

5. **Checklist Templates**
   - Predefined templates: "Convention Packing", "Costume Build", "Photoshoot Prep"
   - User can save custom templates
   - Create checklist from template via dropdown

6. **Progress Tracking**
   - Percentage complete (automatic)
   - Progress bar with color coding:
     - 0-33%: Red
     - 34-66%: Yellow
     - 67-99%: Blue
     - 100%: Green
   - Completion celebration (subtle animation)

## Data Model

### Database Schema
```sql
-- Add to moodboard_nodes table
ALTER TABLE moodboard_nodes ADD COLUMN checklist_data JSONB DEFAULT NULL;

-- Checklist templates (optional, Phase 2)
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  items JSONB NOT NULL, -- Array of template items
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Type Definitions
```typescript
interface ChecklistItem {
  id: string; // UUID
  text: string;
  completed: boolean;
  notes?: string;
  parent_id?: string; // For nested items
  order: number; // For sorting
  created_at: string;
  completed_at?: string;
}

interface ChecklistNode extends BaseMoodboardNode {
  node_type: 'checklist';
  checklist_data: {
    items: ChecklistItem[];
    show_progress: boolean;
    due_date?: string;
  };
}

interface ChecklistTemplate {
  id: string;
  name: string;
  items: { text: string; parent_id?: string }[];
}
```

## UI/UX Requirements

1. **Checklist Node Card Design**
   - Header: Checklist icon + title
   - Progress bar: Full-width, color-coded
   - Progress text: "5/12 completed (42%)"
   - Item list: First 3-5 uncompleted items with checkboxes
   - Completed section: Collapsed by default, click to expand
   - "Add item" button at bottom

2. **Checklist Expansion**
   - Click "Show all" → Expands full list in dialog or inline
   - Dialog mode (mobile): Full-screen checklist editor
   - Inline mode (desktop): Card expands to show all items

3. **Item Row Design**
   - Checkbox (left)
   - Text (center, editable inline)
   - Drag handle (left of checkbox, appears on hover)
   - Notes icon (if notes exist)
   - Nested items: Indented 20px, smaller checkbox

4. **Item Interactions**
   - Click checkbox: Smooth check animation, item moves to "Completed" section
   - Double-click text: Edit mode (inline text editor)
   - Drag handle: Reorder items (live preview)
   - Hover: Show edit/delete icons
   - Enter key: Create new item below
   - Shift+Enter: Create nested sub-item

5. **Template Selection**
   - Create checklist dialog: "Start from template" dropdown
   - Template preview: Shows item count and first 3 items
   - Select template → items populated in new checklist

6. **Progress Celebration**
   - When 100%: Confetti animation (subtle, 1 second)
   - Checkmark icon badge on card
   - Optional notification: "Checklist complete! 🎉"

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Full checklist editor (mobile)
- `ui/checkbox.svelte` - Checklist item checkboxes
- `ui/button.svelte` - Action buttons
- `ui/progress.svelte` - Progress bar (if exists)
- `base/InlineTextEditor.svelte` - Item text editing

### New Components Required
- `moodboard/nodes/ChecklistNode.svelte` - Checklist node card
- `moodboard/ChecklistEditor.svelte` - Full checklist editor dialog
- `moodboard/ChecklistItem.svelte` - Individual item component
- `moodboard/ChecklistTemplateSelector.svelte` - Template picker

## Edge Cases

1. **Empty Checklist**: Show "Add your first item" placeholder
2. **All Items Completed**: Show celebration, collapse all items
3. **Very Long List (>100 items)**: Virtualize list, warn about performance
4. **Rapid Check/Uncheck**: Debounce save (300ms)
5. **Item Text Too Long**: Truncate after 2 lines on card, show full in editor
6. **Nested Item Without Parent**: Auto-promote to top level if parent deleted
7. **Reorder During Edit**: Save edit first, then reorder
8. **Due Date Passed**: Highlight overdue with red badge

## Performance Considerations

- Checklist data stored as JSONB (single DB write per checklist)
- Debounce auto-save on edits (300ms)
- Virtualize item list if > 50 items
- Progress calculation memoized (only recalculate on item change)
- Optimistic UI: Update checkbox immediately, sync to DB in background

## Testing Strategy

**Unit Tests:**
- Progress calculation (various completion states)
- Item reordering logic
- Nested item parent-child relationships
- Template population

**Integration Tests:**
- Create checklist → add items → save to DB
- Check item → progress updates
- Reorder items → order persists
- Load template → items populated

**E2E Tests:**
- User creates checklist, adds 5 items
- User checks 3 items → progress shows 60%
- User reorders items → order saved
- User completes all items → celebration animation plays

## Success Metrics

- Checklist creation time < 1s
- Item check/uncheck latency < 100ms (optimistic)
- Template usage rate > 40% (indicates usefulness)
- Completion rate > 60% (indicates engagement)

## Dependencies

- **Requires:** Base node system
- **Required By:** None (standalone feature)
- **Related:** CAP-007 (Event nodes may link to checklists), CAP-010 (Sequential edges for task dependencies)

## Open Questions

1. **Assignees**: Support assigning items to team members? → Phase 2 (team feature)
2. **Recurring Checklists**: Create checklist that resets periodically? → Phase 2 (convention packing lists)
3. **Checklist Sharing**: Share templates publicly? → Phase 2 (community templates)

## References

- Council Decision 4: "i also like the idea of a checkbox node for lists"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Checklist interactions)
