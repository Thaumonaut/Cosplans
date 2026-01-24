# FEAT-006 Component Specifications

**Feature**: Moodboard Organization & Container Detail Display Patterns  
**Created**: 2026-01-23

## Overview

This document specifies all new components required for FEAT-006, organized by category. Each component identifies opportunities to reuse existing registry components to maintain DRY principles.

---

## Component Reuse Strategy

### Existing Components to Leverage

From the component registry, we will heavily reuse:

**UI Primitives (`ui/`):**
- `dialog.svelte`, `sheet.svelte` - Modals and drawers
- `button.svelte`, `input.svelte`, `select.svelte`, `textarea.svelte` - Form controls
- `badge.svelte` - Status/type badges
- `tabs.svelte` - View mode switchers
- `dropdown-menu.svelte` - Context menus
- `tooltip.svelte` - Hover tooltips
- `progress.svelte` - Progress bars
- `checkbox.svelte` - Selection checkboxes
- `avatar.svelte` - Contact avatars
- `skeleton.svelte` - Loading states
- `color-picker.svelte` - Color selection

**Base Components (`base/`):**
- `InlineTextEditor.svelte` - Name/title editing
- `TagSelector.svelte` - Tag management
- `InlineDatePicker.svelte` - Date selection
- `InlineImageUpload.svelte` - Image uploads
- `ConfirmDialog.svelte` - Confirmations
- `LoadingState.svelte` - Loading/error/empty states
- `Breadcrumbs.svelte` - Navigation breadcrumbs (enhance for containers)
- `ImageLightbox.svelte` - Image viewing

**Cards (`cards/`):**
- Study `IdeaCard.svelte`, `ProjectCard.svelte` for patterns
- Will create unified `UnifiedCard` that supersedes these for moodboard context

**Patterns to Follow:**
- Inline editors from `base/` (consistent save/cancel UX)
- Tag-based selectors (consistent multi-select pattern)
- Card structure (header/body/footer)
- Detail page tabs pattern from `projects/tabs/`

---

## New Components Required

### Category: `moodboard/` (Root Level)

Main moodboard orchestration components.

---

#### `moodboard/MoodboardCanvas.svelte`

**Purpose**: Main canvas view container (integrates with @xyflow/svelte)  
**Version**: v1.0  
**Capability**: CAP-002, CAP-004

**Props:**
```typescript
interface Props {
  moodboardId: string;
  containerId?: string | null; // null = root level
  nodes: MoodboardNode[];
  edges: MoodboardEdge[];
  viewMode: 'canvas' | 'gallery' | 'list';
  onNodeSelect?: (nodeId: string) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<MoodboardNode>) => void;
}
```

**Reuses:**
- `ui/skeleton.svelte` - Loading state
- `base/LoadingState.svelte` - Error/empty states
- Context menu via `ui/dropdown-menu.svelte`

**Responsibilities:**
- Initialize @xyflow/svelte canvas
- Render node components based on type
- Handle pan/zoom/drag interactions
- Coordinate with inspector panel
- Mobile touch handling (48px targets)

**State Management:**
- Local: Selected nodes, viewport position
- Global: Moodboard data (via store)

---

#### `moodboard/InspectorPanel.svelte`

**Purpose**: Right-side panel showing selected node details  
**Version**: v1.0  
**Capability**: CAP-004

**Props:**
```typescript
interface Props {
  selectedNode: MoodboardNode | null;
  isOpen: boolean;
  isPinned: boolean;
  width?: number; // Desktop only
  onClose?: () => void;
  onPinToggle?: () => void;
}
```

**Reuses:**
- `ui/sheet.svelte` - Mobile drawer
- `ui/button.svelte` - Action buttons
- `ui/tabs.svelte` - Details/Connections/History tabs
- `base/InlineTextEditor.svelte` - Name editing
- `base/TagSelector.svelte` - Tag editing
- Node-specific renderers (delegates to type-specific components)

**Responsibilities:**
- Display node details (type-specific)
- Context bar (if inside container)
- Inline property editing
- Show connections/edges
- Quick actions (duplicate, delete, export)

**Responsive:**
- Desktop: Side panel (resizable 250-500px)
- Tablet: Fixed 280px
- Mobile: Bottom sheet (slide-up)

---

#### `moodboard/ContextBar.svelte`

**Purpose**: Shows parent container context when drilled in  
**Version**: v1.0  
**Capability**: CAP-004

**Props:**
```typescript
interface Props {
  containerNode: ContainerNode;
  breadcrumbPath: BreadcrumbItem[];
  isCollapsed: boolean;
  onToggle?: () => void;
  onPeekClick?: () => void; // v1.5
}
```

**Reuses:**
- `base/Breadcrumbs.svelte` - Enhance for container navigation
- `ui/button.svelte` - Expand/collapse button

**Responsibilities:**
- Display parent container thumbnail + name
- Show breadcrumb path (truncated on mobile)
- Collapsible on mobile (progressive disclosure)
- Launch container peek (v1.5)

**Mobile:**
- Default: Collapsed (show icon only)
- Expand: Shows full breadcrumb + context

---

### Category: `moodboard/nodes/` (Node Renderers)

Type-specific node rendering components.

---

#### `moodboard/nodes/ContainerNode.svelte`

**Purpose**: Render container node (character, prop, group)  
**Version**: v1.0  
**Capability**: CAP-002

**Props:**
```typescript
interface Props {
  node: ContainerNode;
  variant: 'canvas' | 'gallery' | 'list';
  selected?: boolean;
  onEnter?: () => void; // Drill in
}
```

**Reuses:**
- `ui/badge.svelte` - Item count, type badge
- `ui/button.svelte` - Enter button
- `base/InlineTextEditor.svelte` - Name editing
- Preview thumbnail grid (custom layout)

**Responsibilities:**
- Display container icon/image
- Show item count and preview thumbnails (3x2 grid)
- "Enter" button to drill in
- Type-specific styling (character/prop/group)

**Variants:**
- Canvas: 200x250px card
- Gallery: Larger card with description
- List: Horizontal row format

---

#### `moodboard/nodes/GhostNode.svelte`

**Purpose**: Render ghost node (semi-transparent external node reference)  
**Version**: v1.1  
**Capability**: CAP-003

**Props:**
```typescript
interface Props {
  node: ComputedGhostNode;
  variant: 'canvas' | 'gallery' | 'list';
  onGoToSource?: () => void;
}
```

**Reuses:**
- Wraps any node component with ghost styling
- `ui/dialog.svelte` or `ui/sheet.svelte` - "Go to source" action
- `ui/badge.svelte` - Ghost icon badge
- `ui/tooltip.svelte` - Source path tooltip

**Responsibilities:**
- Render at 40% opacity with ghost badge
- Show source path on hover/click
- Navigate to source location
- Prevent editing (read-only)

**Styling:**
- Opacity: 40%
- Dashed border
- Ghost icon badge (👻 or outline)
- Grayscale or desaturated

---

#### `moodboard/nodes/EventNode.svelte`

**Purpose**: Render event node with calendar integration  
**Version**: v1.2  
**Capability**: CAP-007

**Props:**
```typescript
interface Props {
  node: EventNode;
  variant: 'canvas' | 'gallery' | 'list';
  selected?: boolean;
}
```

**Reuses:**
- `ui/badge.svelte` - Calendar provider badge, sync status
- `base/InlineDatePicker.svelte` - Date editing
- `base/InlineTextEditor.svelte` - Name/location editing
- Calendar icon (Lucide icon library)

**Responsibilities:**
- Display date/time prominently
- Show countdown ("in 3 days")
- Calendar provider badge (Google/Apple/Outlook)
- Sync status indicator (synced/syncing/error)
- Link to calendar event

**Special:**
- Past events: Grayed out with "Past" badge
- Upcoming: Countdown timer (dynamic)

---

#### `moodboard/nodes/ContactNode.svelte`

**Purpose**: Render contact node  
**Version**: v1.2  
**Capability**: CAP-008

**Props:**
```typescript
interface Props {
  node: ContactNode;
  variant: 'canvas' | 'gallery' | 'list';
  selected?: boolean;
}
```

**Reuses:**
- `ui/avatar.svelte` - Contact avatar (80px circle)
- `ui/badge.svelte` - Role badge
- `base/InlineTextEditor.svelte` - Name editing
- `ui/button.svelte` - Contact action buttons (email, call)

**Responsibilities:**
- Display avatar (or default icon)
- Show name and role
- Contact method icons (email/phone/social)
- Quick actions (mailto:, tel:, social links)

**Quick Actions:**
- Email icon → opens mailto: link
- Phone icon → opens tel: link (mobile)
- Social icons → open in new tab

---

#### `moodboard/nodes/ChecklistNode.svelte`

**Purpose**: Render checklist node with task items  
**Version**: v1.2  
**Capability**: CAP-009

**Props:**
```typescript
interface Props {
  node: ChecklistNode;
  variant: 'canvas' | 'gallery' | 'list';
  selected?: boolean;
  onItemToggle?: (itemId: string) => void;
}
```

**Reuses:**
- `ui/checkbox.svelte` - Item checkboxes
- `ui/progress.svelte` - Progress bar
- `base/InlineTextEditor.svelte` - Item text editing
- `ui/button.svelte` - Add item button

**Responsibilities:**
- Display progress bar (X/Y completed)
- Show first 3-5 uncompleted items
- Checkbox interactions
- "Show all" to expand full list
- Celebration animation at 100% (subtle confetti)

**Variants:**
- Canvas: Compact, first 3 items
- Gallery: First 5 items with progress
- List: Progress percentage only

---

#### `moodboard/nodes/SketchNode.svelte`

**Purpose**: Render sketch node with annotated image  
**Version**: v1.3  
**Capability**: CAP-011

**Props:**
```typescript
interface Props {
  node: SketchNode;
  variant: 'canvas' | 'gallery' | 'list';
  selected?: boolean;
  onEdit?: () => void;
}
```

**Reuses:**
- `base/ImageLightbox.svelte` - Full image view
- `ui/badge.svelte` - Annotation count
- `ui/button.svelte` - Edit button

**Responsibilities:**
- Display image with annotations overlayed (static)
- Show annotation count badge
- "Edit" button opens sketch editor
- Thumbnail view (annotations visible)

**Special:**
- Click → Opens `SketchEditor.svelte` (modal)

---

#### `moodboard/nodes/CompareNode.svelte`

**Purpose**: Render compare node with multiple images  
**Version**: v1.3  
**Capability**: CAP-012

**Props:**
```typescript
interface Props {
  node: CompareNode;
  variant: 'canvas' | 'gallery' | 'list';
  selected?: boolean;
  onView?: () => void;
}
```

**Reuses:**
- `ui/badge.svelte` - Mode indicator
- `ui/button.svelte` - "View Comparison" button
- Thumbnail grid (2x2 or 1x2 layout)

**Responsibilities:**
- Display compared item thumbnails (2-4 items)
- Show labels below each thumbnail
- Mode indicator badge (side-by-side/overlay/slider)
- Click → Opens `ComparisonView.svelte`

---

#### `moodboard/nodes/PileNode.svelte`

**Purpose**: Render pile node (single-layer grouping)  
**Version**: v1.5  
**Capability**: CAP-001

**Props:**
```typescript
interface Props {
  node: PileNode;
  variant: 'canvas' | 'gallery' | 'list';
  expanded?: boolean;
  onToggle?: () => void;
}
```

**Reuses:**
- `ui/badge.svelte` - Item count
- Thumbnail previews (top 3 items)
- Stacked icon visualization

**Responsibilities:**
- Display as stacked cards with count
- Show preview thumbnails (top 3)
- Expand/collapse in-place
- Expansion animation (300ms)

**Visual:**
- Stacked card icon with shadow depth
- Count badge
- Preview thumbnails in grid

---

### Category: `moodboard/` (Feature Components)

Higher-level feature components.

---

#### `moodboard/SketchEditor.svelte`

**Purpose**: Full-screen sketch annotation editor  
**Version**: v1.3  
**Capability**: CAP-011

**Props:**
```typescript
interface Props {
  sketchNode: SketchNode;
  onSave?: (annotations: SketchAnnotation[]) => void;
  onCancel?: () => void;
}
```

**Reuses:**
- `ui/dialog.svelte` - Full-screen modal (desktop)
- `ui/button.svelte` - Tool buttons, save/cancel
- `ui/slider.svelte` - Stroke width, opacity
- `ui/color-picker.svelte` or `ui/circular-color-picker.svelte` - Color selection
- HTML Canvas API for drawing

**Responsibilities:**
- Display image with annotation layer
- Drawing tools (pencil, pen, line, rect, circle, text, eraser)
- Tool properties (color, size, opacity)
- Undo/redo (Ctrl+Z/Y)
- Save annotations as SVG paths
- Export PNG with annotations

**Toolbar:**
- Tool selector icons
- Color picker
- Stroke size slider
- Undo/redo buttons
- Save/cancel buttons

---

#### `moodboard/ComparisonView.svelte`

**Purpose**: Full comparison view modal with multiple modes  
**Version**: v1.3  
**Capability**: CAP-012

**Props:**
```typescript
interface Props {
  compareNode: CompareNode;
  onClose?: () => void;
}
```

**Reuses:**
- `ui/dialog.svelte` - Modal container
- `ui/tabs.svelte` - Mode switcher (side-by-side/stacked/overlay/slider)
- `ui/slider.svelte` - Opacity controls (overlay mode)
- `ui/button.svelte` - Zoom controls, export button
- `base/InlineTextEditor.svelte` - Label editing

**Responsibilities:**
- Display items in selected comparison mode
- Synchronized zoom/pan (if enabled)
- Mode switching (tabs)
- Annotation tools (circle, arrow, text)
- Export as PNG

**Modes:**
- Side-by-side: Horizontal layout
- Stacked: Vertical layout
- Overlay: Layered with opacity sliders
- Slider: Divider slider (before/after)

---

#### `moodboard/ContainerPeek.svelte`

**Purpose**: Quick preview modal for container contents  
**Version**: v1.5  
**Capability**: CAP-005

**Props:**
```typescript
interface Props {
  containerId: string;
  onClose?: () => void;
  onOpenFull?: () => void;
}
```

**Reuses:**
- `ui/dialog.svelte` - Modal (desktop)
- `ui/sheet.svelte` - Bottom sheet (mobile)
- `ui/button.svelte` - "Open Full View" button
- Miniature canvas (read-only)

**Responsibilities:**
- Fetch and display container contents (lazy-load)
- Read-only canvas (pan/zoom only)
- Show container title
- "Open Full View" button → drill in normally
- Loading state (skeleton)

**Performance:**
- Lazy-load: Fetch on peek trigger
- Cache: 5 minutes
- Limit: 100 nodes max

---

#### `moodboard/BatchActionToolbar.svelte`

**Purpose**: Floating toolbar for multi-selection actions  
**Version**: v1.4  
**Capability**: CAP-013

**Props:**
```typescript
interface Props {
  selectedNodeIds: Set<string>;
  position: { x: number; y: number };
  onAction?: (action: string) => void;
}
```

**Reuses:**
- `ui/button.svelte` - Action buttons
- `ui/dropdown-menu.svelte` - "More" menu
- `base/TagSelector.svelte` - Batch tag editor
- `base/ConfirmDialog.svelte` - Delete confirmation

**Responsibilities:**
- Float above selection center
- Quick actions: Group, Tag, Color, Link, Delete
- "More" dropdown: Duplicate, Export
- Auto-hide on deselect

---

#### `moodboard/CSVImportWizard.svelte`

**Purpose**: Multi-step CSV import wizard  
**Version**: v1.4  
**Capability**: CAP-016

**Props:**
```typescript
interface Props {
  moodboardId: string;
  onComplete?: (importedNodeIds: string[]) => void;
  onCancel?: () => void;
}
```

**Reuses:**
- `ui/dialog.svelte` - Wizard modal
- `ui/button.svelte` - Navigation buttons
- `ui/select.svelte` - Column mapping dropdowns
- `ui/progress.svelte` - Import progress
- `ui/checkbox.svelte` - Options toggles
- Papaparse library for CSV parsing

**Steps:**
1. File upload & preview
2. Column mapping
3. Node type selection
4. Preview nodes
5. Import progress

**Responsibilities:**
- Parse CSV with papaparse
- Smart column detection
- Mapping UI (CSV column → node property)
- Batch node creation
- Error handling (skip invalid rows)

---

#### `moodboard/ListView.svelte`

**Purpose**: Table-based list view of nodes  
**Version**: v1.4  
**Capability**: CAP-018

**Props:**
```typescript
interface Props {
  nodes: MoodboardNode[];
  columns: ListColumn[];
  sortBy: SortConfig[];
  onNodeSelect?: (nodeId: string) => void;
  onSort?: (columnId: string) => void;
}
```

**Reuses:**
- `ui/table.svelte` (if exists) or custom table
- `ui/checkbox.svelte` - Row selection
- `ui/badge.svelte` - Type badges, tags
- `base/InlineTextEditor.svelte` - Name editing
- `ui/dropdown-menu.svelte` - Row actions

**Responsibilities:**
- Render nodes as table rows
- Sortable columns
- Multi-select rows (checkbox)
- Inline editing (name, tags)
- Pagination (50/page default)
- Virtual scrolling (if > 200 nodes)

**Columns (default):**
- Checkbox, Thumbnail, Name, Type, Tags, Modified, Actions

---

#### `moodboard/TemplateLibrary.svelte`

**Purpose**: Template library panel/modal  
**Version**: v1.5  
**Capability**: CAP-014

**Props:**
```typescript
interface Props {
  templates: NodeTemplate[];
  onUseTemplate?: (templateId: string) => void;
  onCreateTemplate?: () => void;
}
```

**Reuses:**
- `ui/sheet.svelte` - Sidebar panel (desktop) or modal (mobile)
- `ui/input.svelte` - Search bar
- `ui/select.svelte` - Filter dropdown
- `ui/badge.svelte` - Usage count, visibility badges
- `ui/button.svelte` - Action buttons

**Responsibilities:**
- Display template library (My/Team/Public/Built-in)
- Search and filter templates
- Template cards (icon, name, description, usage count)
- "Use Template" action
- Template management (edit, delete)

---

#### `moodboard/UnifiedCard.svelte` ⭐

**Purpose**: Single card component for all node types (v2.0 refactor)  
**Version**: v2.0  
**Capability**: CAP-019

**Props:**
```typescript
interface Props {
  node: MoodboardNode;
  variant: 'canvas' | 'gallery' | 'inspector' | 'list' | 'peek';
  mode: 'view' | 'edit' | 'select' | 'drag';
  selected?: boolean;
  compact?: boolean;
  showActions?: boolean;
  showStatus?: boolean;
  showType?: boolean;
}
```

**Reuses:**
- All `ui/` primitives
- Type-specific renderers as slots/components
- `base/` inline editors

**Responsibilities:**
- Unified rendering for all node types
- Variant-aware layout (canvas/gallery/inspector/list)
- Consistent header/body/footer structure
- Type-specific content delegation
- Visual states (default, hover, selected, dragging)

**Impact:**
- Replaces all individual node components
- Ensures visual consistency
- Reduces code duplication ~40%

---

## Component Organization

### Directory Structure

```
src/lib/components/
├── moodboard/
│   ├── MoodboardCanvas.svelte         (v1.0)
│   ├── InspectorPanel.svelte          (v1.0)
│   ├── ContextBar.svelte              (v1.0)
│   ├── ContainerPeek.svelte           (v1.5)
│   ├── SketchEditor.svelte            (v1.3)
│   ├── ComparisonView.svelte          (v1.3)
│   ├── BatchActionToolbar.svelte      (v1.4)
│   ├── CSVImportWizard.svelte         (v1.4)
│   ├── ListView.svelte                (v1.4)
│   ├── TemplateLibrary.svelte         (v1.5)
│   ├── UnifiedCard.svelte             (v2.0)
│   ├── nodes/
│   │   ├── ContainerNode.svelte       (v1.0)
│   │   ├── GhostNode.svelte           (v1.1)
│   │   ├── EventNode.svelte           (v1.2)
│   │   ├── ContactNode.svelte         (v1.2)
│   │   ├── ChecklistNode.svelte       (v1.2)
│   │   ├── SketchNode.svelte          (v1.3)
│   │   ├── CompareNode.svelte         (v1.3)
│   │   ├── PileNode.svelte            (v1.5)
│   └── utils/
│       ├── ghostNodeComputation.ts    (v1.1)
│       ├── csvParser.ts               (v1.4)
│       ├── canvasLayout.ts            (v1.5)
```

---

## Component Count Summary

### New Components by Version

| Version | New Components | Reused Components |
|---------|----------------|-------------------|
| v1.0 | 3 | ~15 |
| v1.1 | 1 | ~5 |
| v1.2 | 3 | ~10 |
| v1.3 | 4 | ~8 |
| v1.4 | 3 | ~12 |
| v1.5 | 4 | ~8 |
| v2.0 | 1 (replaces 8) | All existing |
| **Total** | **19 new** | **~60 reused** |

### Reuse Efficiency

- **60+ existing components** leveraged (from registry)
- **~40% code reduction** expected with UnifiedCard (v2.0)
- **DRY maintained** through consistent patterns (inline editors, selectors, cards)

---

## Component Patterns to Follow

### 1. Inline Editing Pattern (from `base/`)

```svelte
<script>
  let isEditing = false;
  let value = $props.value;
  
  function save() {
    $props.onSave?.(value);
    isEditing = false;
  }
  
  function cancel() {
    value = $props.value; // Reset
    isEditing = false;
  }
</script>

{#if isEditing}
  <Input bind:value />
  <Button onclick={save}>Save</Button>
  <Button onclick={cancel}>Cancel</Button>
{:else}
  <span onclick={() => isEditing = true}>{value}</span>
{/if}
```

### 2. Card Structure Pattern

```svelte
<Card>
  <CardHeader>
    <Badge>{type}</Badge>
    <DropdownMenu>...</DropdownMenu>
  </CardHeader>
  <CardContent>
    <!-- Type-specific content -->
  </CardContent>
  <CardFooter>
    <TagSelector />
    <span class="text-muted">Modified {date}</span>
  </CardFooter>
</Card>
```

### 3. Modal/Dialog Pattern

```svelte
<Dialog {open} {onOpenChange}>
  <DialogHeader>
    <DialogTitle>{title}</DialogTitle>
  </DialogHeader>
  <DialogContent>
    <!-- Content -->
  </DialogContent>
  <DialogFooter>
    <Button onclick={cancel}>Cancel</Button>
    <Button onclick={save}>Save</Button>
  </DialogFooter>
</Dialog>
```

---

## Next Steps

1. ✅ **Component specifications complete** (this document)
2. **Create tasks.md** for v1.0 implementation
3. **Begin component implementation** starting with v1.0:
   - `ContainerNode.svelte`
   - `InspectorPanel.svelte`
   - `ContextBar.svelte`
   - `MoodboardCanvas.svelte`

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-23 | 1.0 | Initial component specifications | Assistant |

