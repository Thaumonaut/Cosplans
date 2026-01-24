# CAP-019: Unified Card Component

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** High  
**Checkpoint:** CP-007 (Container Peek & Polish)

## Intent

Create a single, flexible card component that renders all node types consistently across canvas, gallery, and inspector views, reducing code duplication and ensuring visual consistency throughout the moodboard system.

## Functional Requirements

1. **Single Component Architecture**
   - One `UnifiedCard.svelte` component handles all node types
   - Type-specific rendering via slot composition or conditional blocks
   - Shared layout: Header, body, footer structure
   - Context-aware: Adapts to canvas vs gallery vs inspector context

2. **Card Variants**
   - **Canvas Variant**: Optimized for canvas (compact, icon-focused)
   - **Gallery Variant**: Medium detail (thumbnail, title, description)
   - **Inspector Variant**: Full detail (all properties visible)
   - **List Variant**: Horizontal layout (row format)
   - **Peek Variant**: Read-only, simplified

3. **Shared Features**
   - Selection state: Visual indicator (border, background)
   - Hover state: Subtle highlight, show quick actions
   - Status badge: Progress status (pending, in progress, complete)
   - Type badge: Node type icon/label
   - Actions menu: Three-dot menu (context-sensitive)

4. **Type-Specific Content**
   - Pile: Stack icon, item count
   - Container: Thumbnail grid, enter button
   - Event: Date/time, countdown, calendar icon
   - Contact: Avatar, role, contact icons
   - Checklist: Progress bar, item count
   - Sketch: Image with annotation indicator
   - Compare: Multi-image grid
   - Ghost: Semi-transparent, ghost badge

5. **Responsive Behavior**
   - Desktop: Full card with all details
   - Tablet: Medium card, some details hidden
   - Mobile: Compact card, minimal details
   - Adaptive sizing: Card scales based on viewport

6. **Interaction Modes**
   - View mode: Display only (default)
   - Edit mode: Inline editing enabled
   - Select mode: Multi-select enabled
   - Drag mode: Draggable handle visible

## Data Model

### Type Definitions
```typescript
interface UnifiedCardProps {
  node: MoodboardNode;
  variant: 'canvas' | 'gallery' | 'inspector' | 'list' | 'peek';
  mode: 'view' | 'edit' | 'select' | 'drag';
  selected?: boolean;
  showActions?: boolean;
  showStatus?: boolean;
  showType?: boolean;
  compact?: boolean;
  onSelect?: (nodeId: string) => void;
  onAction?: (action: string, nodeId: string) => void;
}

interface CardLayout {
  width: number; // CSS pixels
  height: number; // CSS pixels or 'auto'
  padding: number;
  borderRadius: number;
  elevation: number; // Shadow depth 0-5
}

interface CardSection {
  header?: boolean;
  body?: boolean;
  footer?: boolean;
  actions?: boolean;
}
```

## UI/UX Requirements

1. **Card Structure**
   - Container: Border, shadow, background
   - Header: Icon, type badge, status badge, actions menu
   - Body: Type-specific content (main area)
   - Footer: Metadata (dates, tags, counts)

2. **Canvas Variant Design**
   - Size: 150x150px (compact), 200x200px (default)
   - Header: Type icon only (20px)
   - Body: Minimal content (title, thumbnail)
   - Footer: Hidden (show on hover)

3. **Gallery Variant Design**
   - Size: 250x300px (card aspect)
   - Header: Type badge + actions menu
   - Body: Thumbnail (60% height) + title + description (2 lines)
   - Footer: Tags + modified date

4. **Inspector Variant Design**
   - Size: Full width of panel
   - Header: Type badge + status badge + actions
   - Body: All properties visible (form-like)
   - Footer: Metadata + quick actions

5. **Visual States**
   - Default: White background, subtle shadow
   - Hover: Slight elevation increase, actions appear
   - Selected: Blue border (3px), blue background tint
   - Dragging: Higher elevation, semi-transparent
   - Disabled/Ghost: 40-60% opacity, grayscale

6. **Type-Specific Rendering**
   - Pile: Stack icon with count badge, first 3 items thumbnails
   - Container: 3x2 thumbnail grid, "Enter" button overlay
   - Event: Large date display, countdown timer, location
   - Contact: Avatar (80px circle), name, role, contact icons
   - Checklist: Progress bar, first 3 items, "X/Y complete"
   - Sketch: Image preview, annotation count badge
   - Compare: 2x2 grid of compared items

## Components

### Reuse from Registry
- `ui/badge.svelte` - Status/type badges
- `ui/button.svelte` - Action buttons
- `base/InlineTextEditor.svelte` - Title editing
- `base/TagSelector.svelte` - Tag display/editing
- `ui/avatar.svelte` - Contact avatars

### New Components Required
- `moodboard/UnifiedCard.svelte` - Main unified card component
- `moodboard/card/CardHeader.svelte` - Card header subcomponent
- `moodboard/card/CardBody.svelte` - Card body subcomponent
- `moodboard/card/CardFooter.svelte` - Card footer subcomponent
- `moodboard/card/CardActions.svelte` - Actions menu subcomponent
- `moodboard/card/type-renderers/` - Type-specific content renderers

## Edge Cases

1. **Missing Data**: Show placeholder for missing thumbnails/images
2. **Long Titles**: Truncate with ellipsis (1-2 lines max per variant)
3. **Many Tags**: Show first 3, "+X more" badge
4. **No Thumbnail**: Show type icon as fallback
5. **Custom Node Types**: Extensible rendering system (plugin support in future)
6. **Animation Performance**: Disable animations on low-end devices
7. **Dark Mode**: Ensure card contrast in all themes

## Performance Considerations

- Card rendering: Memoize based on node data (avoid unnecessary re-renders)
- Thumbnail lazy-loading: Load images as they enter viewport
- Virtual scrolling: In gallery view, render only visible cards
- CSS transforms: Use GPU-accelerated properties for animations
- Type-specific components: Lazy-load heavy renderers (e.g., sketch canvas)

## Accessibility

- Card semantics: `<article>` with proper ARIA labels
- Keyboard navigation: Tab to card, Enter to open, Space to select
- Screen reader: Announce card type, title, status
- Focus indicators: Visible focus ring on keyboard navigation
- Action menu: Keyboard accessible (Tab, Arrow keys, Enter)

## Testing Strategy

**Unit Tests:**
- Card renders correctly for each node type
- Variant switching (canvas, gallery, inspector)
- Selection state management
- Action menu triggers

**Integration Tests:**
- Card displays in canvas view
- Card displays in gallery view
- Card displays in inspector
- Card updates when node data changes

**E2E Tests:**
- User hovers card → actions appear
- User clicks card → selects card
- User double-clicks card → opens in canvas
- User clicks action menu → actions execute

## Success Metrics

- Card render time < 16ms (60fps)
- Card re-render on data change < 10ms
- Memory usage: < 50KB per card (including thumbnails)
- Code reduction: 40% less code vs separate card components

## Dependencies

- **Requires:** Base node system, all node types (CAP-001 through CAP-012)
- **Required By:** All views (Canvas, Gallery, List, Inspector)
- **Related:** All capabilities (unified rendering layer)

## Open Questions

1. **Plugin System**: Support custom node type renderers via plugins? → Phase 2
2. **Theming**: Allow users to customize card appearance? → Phase 2 (theme system)
3. **Card Templates**: Allow saving card layout preferences? → Phase 2

## References

- Council Decision 1: Progressive disclosure applies to card variants (mobile compact)
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (All node interactions)
- Design principle: Consistency across views
