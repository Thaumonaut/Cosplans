# CAP-014: Node Templates

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Low  
**Checkpoint:** CP-005 (Bulk Operations & Templates)

## Intent

Enable users to save commonly-used node configurations as reusable templates, reducing repetitive setup for recurring patterns (e.g., character reference sheets, prop material lists, convention prep checklists).

## Functional Requirements

1. **Template Creation**
   - Right-click any node → "Save as Template"
   - Dialog: Name template, add description, choose visibility (private/public)
   - Template captures: Node type, properties, structure (for containers)
   - Template does NOT capture: Specific content (images, text), position

2. **Template Library**
   - Access via: Canvas context menu → "Create from Template"
   - Or: Dedicated template panel (collapsible sidebar)
   - Library sections: My Templates, Team Templates (if team feature), Public Templates
   - Search/filter: By node type, tags, name

3. **Built-in Templates**
   - Character Reference: Container with sections for front/back/detail views
   - Prop Blueprint: Sketch node + checklist + material list
   - Event Timeline: Sequential event nodes (CAP-007 + CAP-010)
   - Convention Prep: Checklist with common items
   - Progress Tracker: Compare node + status indicators

4. **Template Usage**
   - Click template → Node created with template structure
   - User fills in content (images, text, etc.)
   - Template instances are independent (not linked to template)

5. **Template Sharing**
   - Private: Only creator can see
   - Team: All team members can see (if team feature)
   - Public: Available to all users (requires moderation)
   - Export: Download template as JSON file
   - Import: Upload template JSON to add to library

6. **Template Management**
   - Edit template: Update name, description, structure
   - Delete template: Soft delete (hide, not remove)
   - Duplicate template: Create variation
   - Template versioning: Show "Updated" badge if template changed since last use

## Data Model

### Database Schema
```sql
CREATE TABLE node_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  node_type TEXT NOT NULL,
  template_data JSONB NOT NULL, -- Node structure without specific content
  visibility TEXT DEFAULT 'private', -- 'private' | 'team' | 'public'
  is_builtin BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_node_templates_user_id ON node_templates(user_id);
CREATE INDEX idx_node_templates_visibility ON node_templates(visibility);
CREATE INDEX idx_node_templates_node_type ON node_templates(node_type);
```

### Type Definitions
```typescript
interface NodeTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  node_type: string;
  template_data: TemplateData;
  visibility: 'private' | 'team' | 'public';
  is_builtin: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface TemplateData {
  // Node properties without specific content
  properties: Record<string, any>;
  // For containers: child structure
  children?: TemplateData[];
  // For complex nodes: configuration
  config?: Record<string, any>;
}

interface TemplateLibrary {
  myTemplates: NodeTemplate[];
  teamTemplates: NodeTemplate[];
  publicTemplates: NodeTemplate[];
  builtinTemplates: NodeTemplate[];
}
```

## UI/UX Requirements

1. **Template Creation Dialog**
   - Form: Name (required), Description (optional)
   - Visibility: Radio buttons (Private, Team, Public)
   - Preview: Shows template structure (read-only)
   - Save button

2. **Template Library Panel**
   - Desktop: Collapsible sidebar (left or right)
   - Mobile: Bottom sheet or full-screen modal
   - Search bar: Filter by name
   - Filter dropdown: By node type
   - Template cards: Icon, name, description (truncated), usage count

3. **Template Card Design**
   - Icon: Node type icon
   - Name: Bold, 14px
   - Description: Gray, 12px, 2 lines max
   - Usage count: "Used X times" (if > 0)
   - Badge: "Built-in", "Public", "Team" (if applicable)
   - Actions: Use, Edit (if owner), Delete (if owner)

4. **Template Usage Flow**
   - Click "Use Template" → Node created at canvas center
   - Toast: "Template applied. Fill in content."
   - Node selected automatically (ready to edit)

5. **Built-in Template Showcase**
   - First-time users: Show "Getting Started" with built-in templates
   - Template carousel or grid
   - "Try Template" button creates example

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Template creation/edit dialog
- `ui/sheet.svelte` - Template library (mobile)
- `ui/button.svelte` - Action buttons
- `ui/input.svelte` - Search bar
- `ui/select.svelte` - Filter dropdown
- `ui/badge.svelte` - Template badges

### New Components Required
- `moodboard/TemplateLibrary.svelte` - Template library panel
- `moodboard/TemplateCard.svelte` - Template card component
- `moodboard/TemplateDialog.svelte` - Create/edit template dialog
- `moodboard/TemplatePreview.svelte` - Template structure preview

## Edge Cases

1. **Empty Template**: Cannot save template with no properties (validate)
2. **Template of Container**: Saves structure, not content of children
3. **Template with Edges**: Edges not saved in template (only node structure)
4. **Template Deletion**: If built-in, hide instead of delete
5. **Template Update**: Existing instances not affected by template updates
6. **Duplicate Template Name**: Allow (append number: "Template", "Template 2")
7. **Large Template (>100 children)**: Warn about complexity
8. **Public Template Moderation**: Require admin approval before public (Phase 2)

## Performance Considerations

- Template library: Paginate if > 50 templates (lazy-load)
- Template search: Debounce search (300ms)
- Template usage: Create node transaction (atomic)
- Template export: JSON stringify on demand (not pre-cached)
- Built-in templates: Pre-loaded on app init (small dataset)

## Testing Strategy

**Unit Tests:**
- Template data extraction from node (remove content, keep structure)
- Template instantiation (create node from template)
- Template search/filter logic
- Template visibility permissions

**Integration Tests:**
- Create template from container → structure saved
- Use template → node created with structure
- Edit template → changes saved
- Delete template → soft deleted, hidden from library

**E2E Tests:**
- User right-clicks container, "Save as Template" → template created
- User opens template library, searches for template → finds it
- User clicks "Use Template" → node created on canvas
- User fills in content → template instance independent

## Success Metrics

- Template creation time < 1s
- Template library load time < 500ms (50 templates)
- Template usage rate: 30% of users create at least one template
- Built-in template usage: 60% of new users try at least one built-in

## Dependencies

- **Requires:** Base node system
- **Required By:** None (enhancement feature)
- **Related:** CAP-009 (Checklist templates mentioned), CAP-013 (Batch operations could use templates)

## Open Questions

1. **Template Marketplace**: Community template sharing platform? → Phase 2 (requires moderation system)
2. **Template Versioning**: Track template versions and updates? → Phase 2 (simple timestamp for now)
3. **Template Variables**: Allow placeholders in templates (e.g., "{{character_name}}")? → Phase 2 (advanced feature)

## References

- Council Decision 5: "we should consider node templates for reusable nodes"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Template interactions)
