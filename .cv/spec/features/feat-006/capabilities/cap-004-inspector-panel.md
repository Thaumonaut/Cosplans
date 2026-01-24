# CAP-004: Inspector Panel & Context Bar

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** High  
**Checkpoint:** CP-001 (Foundation & Core Nodes)

## Intent

Provide persistent access to selected node/edge details and properties in a side panel (desktop) or slide-out drawer (mobile), solving the context loss problem when drilling into containers by keeping parent container details visible.

## Functional Requirements

1. **Inspector Panel Placement**
   - Desktop: Right-side panel (300px default, resizable 250-500px)
   - Tablet: Right-side panel (280px fixed, collapsible)
   - Mobile: Bottom drawer (slide up, full-width)

2. **Panel Visibility**
   - Shows when node/edge selected
   - Persists across navigation (stays open with updated content)
   - User can pin panel open (always visible)
   - User can minimize panel (collapsed to icon bar)
   - Remembers state per session (localStorage)

3. **Inspector Content**
   - **Node Details**: Title, type, description, created/modified dates
   - **Container Details**: If inside container, show parent container card
   - **Properties**: Editable fields (name, color, tags, custom fields)
   - **Connections**: List of edges (incoming/outgoing)
   - **Actions**: Quick actions (duplicate, delete, convert, export)
   - **History**: Recent changes (if available)

4. **Context Bar (Inside Containers)**
   - When inside a container, show compact context bar at top of inspector
   - Context bar shows: Parent container thumbnail, name, breadcrumb path
   - Collapsible on mobile (Council Decision 1)
   - Clicking context bar opens parent container in read-only preview (CAP-005)

5. **Editing Capabilities**
   - Inline editing for text fields
   - Tag selector for tags
   - Color picker for colors
   - Date pickers for date fields
   - Changes save automatically (debounced 500ms)

6. **Progressive Disclosure**
   - Default: Show title, type, description, key properties
   - Expandable sections: Connections (edges list), Metadata, History
   - Mobile: More aggressive collapsing - show only title + type + expand button

## Data Model

### State Management
```typescript
interface InspectorState {
  isOpen: boolean;
  isPinned: boolean;
  width?: number; // Desktop only
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  expandedSections: Set<string>; // Which sections are expanded
}

interface ContextBarData {
  visible: boolean;
  containerNode: ContainerNode;
  breadcrumbPath: string[];
}
```

## UI/UX Requirements

1. **Desktop Layout**
   - Panel slides in from right (300ms animation)
   - Resizable handle on left edge
   - Fixed header: Node icon + title + pin/close buttons
   - Scrollable body: Sections with expand/collapse
   - Sticky action bar at bottom (if pinned)

2. **Mobile Layout**
   - Drawer slides up from bottom (300ms animation)
   - Handle bar at top (swipe down to dismiss)
   - Fixed header: Node icon + title + collapse button
   - Scrollable body (max-height: 70vh)
   - Action bar sticky at bottom

3. **Context Bar Design**
   - Compact card (80px height)
   - Left: Parent container thumbnail (60x60px)
   - Center: Name + breadcrumb (truncated)
   - Right: Expand button (opens CAP-005 peek)
   - Collapsible: Minimize to thin bar with icon + expand button

4. **Interactions**
   - Select node: Open inspector with node details
   - Select edge: Open inspector with edge details
   - Click elsewhere: Keep inspector open if pinned, close if not
   - Escape key: Close inspector (if not pinned)
   - Resize: Drag handle to resize panel width

5. **Responsive Behavior**
   - Desktop (>1024px): Side panel, resizable
   - Tablet (768-1024px): Side panel, fixed width, collapsible
   - Mobile (<768px): Bottom drawer

## Components

### Reuse from Registry
- `ui/sheet.svelte` - Mobile drawer
- `ui/button.svelte` - Action buttons
- `base/InlineTextEditor.svelte` - Inline field editing
- `base/TagSelector.svelte` - Tag editing
- `ui/input.svelte`, `ui/select.svelte` - Form controls
- `ui/badge.svelte` - Type badges

### New Components Required
- `moodboard/InspectorPanel.svelte` - Main inspector panel component
- `moodboard/ContextBar.svelte` - Context bar for containers
- `moodboard/NodeInspector.svelte` - Node-specific inspector view
- `moodboard/EdgeInspector.svelte` - Edge-specific inspector view
- `moodboard/InspectorSection.svelte` - Collapsible section component

## Edge Cases

1. **No Selection**: Show inspector with "Select a node to view details" placeholder
2. **Multi-Selection**: Show count + bulk actions (if CAP-013 implemented)
3. **Deleted Node**: Close inspector or show "Node deleted" message
4. **Deep Nesting**: Context bar breadcrumb truncates middle levels
5. **Rapid Selection Changes**: Debounce content updates (100ms) to prevent flashing
6. **Panel Overflow**: Long descriptions scroll within section, not entire panel
7. **Resize Below Min**: Snap to minimum width (250px) if user drags below

## Performance Considerations

- Lazy-load sections (render only expanded sections)
- Virtualize connections list if > 50 edges
- Debounce auto-save on edits (500ms)
- Memoize breadcrumb path calculation
- Cache inspector state in memory (avoid localStorage churn)

## Testing Strategy

**Unit Tests:**
- Inspector state management (open/close/pin/unpin)
- Context bar visibility logic (only inside containers)
- Breadcrumb truncation for various path lengths
- Auto-save debouncing

**Integration Tests:**
- Select node → inspector opens with correct details
- Edit field in inspector → node updates in canvas
- Pin inspector → persists across navigation
- Resize panel → width persists in session

**E2E Tests:**
- User selects node → inspector shows details
- User drills into container → context bar appears
- User edits node name in inspector → updates in canvas
- Mobile user opens drawer, swipes down to close

## Accessibility

- Panel announced as "region" with label "Node Inspector"
- Focus management: Focus first interactive element when opened
- Keyboard shortcuts: `Ctrl+I` toggle inspector, `Ctrl+Shift+P` toggle pin
- Screen reader: Announce context bar content when entering container
- High contrast: Ensure panel border visible in all themes

## Success Metrics

- Inspector opens in < 100ms after selection
- Edit save latency < 200ms (perceived, with optimistic update)
- 95% of users find and use inspector within first session
- Context bar reduces "where am I?" questions by 80% (user feedback)

## Dependencies

- **Requires:** Node selection system (existing), CAP-002 (Container context)
- **Required By:** CAP-005 (Container Peek launched from context bar)
- **Related:** CAP-013 (Multi-selection inspector)

## Open Questions

None - design approved in Council Decision 1 (mobile progressive disclosure).

## References

- Council Decision 1: Mobile progressive disclosure with collapsible context bar
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Inspector interactions)
