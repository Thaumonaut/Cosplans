# Moodboard Design Council Review
**Date**: 2026-01-22  
**Status**: Awaiting Council Approval  
**Reviewers**: Lead Designer, UX/UI Design Lead, Product Stakeholders

---

## Executive Summary

We've reached a critical design decision point for the moodboard feature, specifically around:
1. **Container/Stack organization pattern** - How users group related content spatially
2. **Detail information display** - Where metadata lives and how it's edited
3. **Unified card design** - One component for canvas/gallery views
4. **View mode strategy** - Responsive defaults and user preferences

Five key design decisions have been clarified through stakeholder questions. This document presents those decisions for council review and approval before proceeding with implementation.

---

## Background: The Design Challenge

### Current State
- Moodboards implemented with basic node types
- Container nodes (character, prop, group) auto-create detail child nodes
- Separate card components for canvas (NodeCard) vs references (ReferenceCard)
- Gallery and canvas views are disconnected

### User Problem Identified
**"When I create a character container and drill into it, I lose sight of the character's details. The detail node feels awkward - it's metadata ABOUT the space, not content IN the space."**

### Use Cases Driving Design
1. **Comparing options during ideation**: "Link Default Tunic" vs "Link BotW Tunic" vs "Archived Beedle Project"
2. **Research organization**: Photographer organizing equipment lists for different cons
3. **Multi-context planning**: Cosplayer deciding which character to wear each day of different cons
4. **Creator resource library**: Wig maker saving materials, tutorials, and techniques

---

## Design Decisions for Review

### Decision 1: Container Detail Information Display ✅

**Question**: Where should container metadata (description, budget, custom fields) be displayed and edited?

**Approved Answer**: **Inspector Panel (Sidebar/Drawer)**

**Implementation**:
- Desktop: Right sidebar slides out (Figma-style)
- Mobile: Bottom drawer (Apple Notes-style)
- Triggered by: Click "Edit" button on container card OR click metadata in context bar
- Applies to: ALL node types (not just containers) - unified editing pattern

**Rationale**:
- Industry standard (Figma, Notion, Linear)
- Solves "context loss" problem
- Doesn't clutter canvas with metadata nodes
- Works across all views (canvas/gallery/list)
- Consistent UX everywhere

**What This Replaces**:
- ❌ Auto-created `container_details` child node (current implementation)
- ❌ Detail metadata as a separate node in database

---

### Decision 2: Unified Card Design ✅

**Question**: Should the same card component be used in both Canvas and Gallery views?

**Approved Answer**: **Unified component with expand/collapse, user preferences**

**Implementation**:
```typescript
<UnifiedCard 
  node={node}
  variant="canvas" | "gallery" | "list"
  density="compact" | "expanded"
  // density can be toggled by user, saved in settings
/>
```

**Features**:
- Both canvas AND gallery support compact ⟷ expanded toggle
- Default density saved per-view in user settings
- Compact: Title, thumbnail, key metadata only
- Expanded: Full embeds, notes preview, all metadata
- Same underlying component, CSS/props control presentation

**Rationale**:
- DRY principle - one component, less code
- Consistent behavior across views
- User control over information density
- Follows modern design system patterns (shadcn, Material UI)

**What This Replaces**:
- ❌ Separate NodeCard and ReferenceCard components
- ❌ Fixed density per view

---

### Decision 3: Context When Inside Container ✅

**Question**: How should container metadata remain visible when drilling into a container?

**Approved Answer**: **Compact context bar with quick edit access**

**Implementation**:
```
┌────────────────────────────────────────┐
│ ← Back to Parent   👗 Link (BotW)      │
│ Budget: $200 • 12 items • [Edit ✏️]   │  ← Context bar
├────────────────────────────────────────┤
│ 🎨 Canvas | 📋 Gallery | 📝 List      │  ← View toggle
├────────────────────────────────────────┤
│ [Research nodes displayed here]        │
└────────────────────────────────────────┘
```

**Features**:
- Always visible at top when inside container
- Shows: Container name, icon, key metadata (budget, item count)
- Clickable: Click metadata or Edit button → Opens inspector panel
- Integrates with breadcrumb navigation
- Collapses on scroll (mobile) to save space

**Rationale**:
- Keeps users oriented ("Where am I?")
- Balances visibility with screen real estate
- Works well on mobile where space is premium
- Quick access to editing without leaving context

---

### Decision 4: Gallery vs References Tab Unification ✅

**Question**: How should "References Tab" and "Moodboard" be unified?

**Approved Answer**: **Replace References Tab with Moodboard Tab + Smart Responsive Defaults**

**Implementation**:
- Rename "References" tab to "Moodboard" tab on idea detail page
- Show same view toggle as standalone moodboard: Canvas | Gallery | List
- **Smart defaults based on context**:
  - Desktop moodboard page: Default to Canvas
  - Mobile/tablet: Default to Gallery  
  - Slide-out drawer/limited space: Default to Gallery
  - User can always switch, preferences saved per-context
- Same component everywhere (no duplicate code)

**Rationale**:
- References ARE moodboard - same concept
- Eliminates confusion and code duplication
- Responsive defaults respect device constraints
- User preference system allows personalization

**What This Changes**:
- "References Tab" → "Moodboard Tab" (naming only)
- Tab shows full view options (not just gallery prototype)

---

### Decision 5: Container Node Purpose & Flexibility ✅

**Question**: What should container nodes primarily represent?

**Approved Answer**: **Flexible "Sacks/Stacks" for Spatial Organization**

**Key Insight from User**:
> "Container nodes are what I originally was planning as 'sacks' where the canvas was like a table full of sticky notes and you're grouping some notes together... containers or stacks are an organizational tool to keep related information together which can be a lot of different things"

**Use Case Examples**:
- **Photographer**: "PAX Equipment Option A" vs "Option B" (1 lens vs 2 lenses)
- **Cosplayer**: "Day 1 Outfit" vs "Day 2 Outfit" at same con
- **Cosplayer**: "Con A Character" vs "Con B Character" 
- **Wig Maker**: "Lace Front Techniques" vs "Synthetic Styling Methods"
- **General**: ANY spatial grouping that makes sense to the user

**Implementation**:
- Container types: `character`, `prop`, `group` (generic), `event`, `location`
- User decides what each container represents
- No forced categorization
- Flexible metadata - custom fields support any use case
- Container ≠ Character specifically (common misconception to avoid)

**Rationale**:
- Respects user's mental model
- Supports diverse creator types (photographers, makers, cosplayers)
- Spatial organization is powerful and flexible
- Avoids rigid category systems

---

## Design System Implications

### Component Architecture

```
┌─────────────────────────────────────────┐
│ Moodboard Page (Ideas/Projects)         │
├─────────────────────────────────────────┤
│ Context Bar (when in container)         │
│ ┌─────────────────────────────────────┐ │
│ │ ← Back | Container Info | Edit      │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ View Toggle (Canvas|Gallery|List)       │
├─────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────┐  │
│ │                 │ Inspector Panel │  │
│ │ Content Area    │ (slide-out)     │  │
│ │                 │                 │  │
│ │ UnifiedCard x N │ [Edit Form]     │  │
│ │                 │                 │  │
│ └─────────────────┴─────────────────┘  │
└─────────────────────────────────────────┘
```

### New Components Needed

1. **ContextBar.svelte** - Shows container info when inside container
2. **InspectorPanel.svelte** - Sidebar/drawer for editing any node
3. **UnifiedCard.svelte** - Replaces NodeCard + ReferenceCard
4. **DensityToggle.svelte** - Compact ⟷ Expanded switcher

### Components to Refactor

1. **MoodboardNode.svelte** → Becomes UnifiedCard.svelte
2. **ReferenceCard.svelte** → Merged into UnifiedCard.svelte  
3. **NodeCard.svelte** → Deprecated

---

## User Flows

### Flow 1: Creating and Drilling Into Container

```
1. User on Idea Moodboard (Gallery view)
   └─ Clicks "Add" → "Container" → "Character"
   └─ Fills: Name "Link BotW", Budget "$200"
   └─ Container card appears in gallery

2. User clicks container card "Open" button
   └─ Navigates to container's moodboard
   └─ Context bar appears: "← Back | Link BotW | Budget: $200 • 0 items | Edit"
   └─ Empty canvas/gallery (no auto-created detail node)
   └─ User adds research nodes (images, links, notes)

3. User clicks "Edit" in context bar
   └─ Inspector panel slides out from right (desktop)
   └─ Shows form: Description, Budget, Custom Fields
   └─ User edits, changes save automatically
   └─ Panel stays open or closes on outside click
```

### Flow 2: Toggling Card Density

```
1. User in Gallery view, cards showing compact
   └─ User clicks density toggle icon (expand/collapse)
   └─ All cards expand to show full embeds, notes preview
   └─ Preference saved: "gallery_density=expanded"

2. User switches to Canvas view
   └─ Cards display in compact mode (separate preference)
   └─ User toggles density in canvas
   └─ Preference saved: "canvas_density=expanded"

3. User returns tomorrow
   └─ Gallery opens in expanded mode (remembered)
   └─ Canvas opens in expanded mode (remembered)
```

### Flow 3: Mobile Responsive Experience

```
1. User opens moodboard on mobile phone
   └─ View defaults to Gallery (smart default)
   └─ Cards display in compact mode (mobile friendly)
   └─ User can manually switch to Canvas
   └─ Canvas works but less optimal on small screen

2. User clicks "Edit" on a card
   └─ Bottom drawer slides up (mobile pattern)
   └─ Edit form shown in drawer
   └─ Drawer partially obscures content (can see context)
   └─ Swipe down or tap outside to dismiss

3. User drills into container
   └─ Context bar appears at top
   └─ Scrolling down collapses context bar (saves space)
   └─ Scrolling up reveals context bar again
```

---

## Technical Considerations

### Inspector Panel Implementation

**Desktop** (Right Sidebar):
```svelte
<aside class="fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform"
       class:translate-x-0={open}
       class:translate-x-full={!open}>
  <!-- Edit form here -->
</aside>
```

**Mobile** (Bottom Drawer):
```svelte
<div class="fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-xl transform transition-transform"
     class:translate-y-0={open}
     class:translate-y-full={!open}>
  <!-- Edit form here -->
</div>
```

### Unified Card Component Props

```typescript
interface UnifiedCardProps {
  node: MoodboardNode;
  variant: 'canvas' | 'gallery' | 'list';
  density?: 'compact' | 'expanded';  // Optional, falls back to user preference
  onEdit?: () => void;
  onDrillIn?: () => void;  // Only for containers
  onDelete?: () => void;
  isSelected?: boolean;
}
```

### User Preferences Schema

```typescript
interface MoodboardPreferences {
  canvas_density: 'compact' | 'expanded';
  gallery_density: 'compact' | 'expanded';
  list_density: 'compact' | 'expanded';
  default_view_desktop: 'canvas' | 'gallery' | 'list';
  default_view_mobile: 'canvas' | 'gallery' | 'list';
}
```

Stored in: `user_settings.moodboard_preferences` (JSONB field)

---

## Impact Analysis

### Code Changes Required

**New Files**:
- `ContextBar.svelte` (~150 lines)
- `InspectorPanel.svelte` (~300 lines)
- `UnifiedCard.svelte` (~400 lines, merges NodeCard + ReferenceCard)
- `DensityToggle.svelte` (~50 lines)

**Modified Files**:
- `+page.svelte` (moodboard page) - Add context bar, inspector panel
- `IdeaDetail.svelte` - Rename tab, add view toggle
- `MoodboardCanvas.svelte` - Use UnifiedCard
- User settings service - Add preference getters/setters

**Deprecated Files**:
- `NodeCard.svelte` (replaced by UnifiedCard)
- `ReferenceCard.svelte` (merged into UnifiedCard)
- `ContainerDetailsNode.svelte` (replaced by inspector panel)

**Database Changes**:
- ❌ Remove `container_details` from node_type enum (no longer used)
- ✅ Container metadata stays in `metadata` JSONB on container node itself

### Migration Strategy

**Phase 1**: Build new components alongside old (parallel)
- Create UnifiedCard, InspectorPanel, ContextBar
- Test in isolation, ensure feature parity

**Phase 2**: Migrate views one at a time
- Gallery view → Use UnifiedCard
- Canvas view → Use UnifiedCard  
- List view → Use UnifiedCard

**Phase 3**: Clean up
- Remove old components (NodeCard, ReferenceCard)
- Database: Delete any existing `container_details` nodes (data migration)
- Update tests

---

## Open Questions for Council

### Question 1: Animation & Transitions
**Inspector Panel**: Should the panel slide in/out, or fade in/out?
- **Option A**: Slide transition (Figma, Notion style) - more dynamic
- **Option B**: Fade transition (simpler, faster)
- **Recommendation**: Slide for desktop (spatial affordance), fade for mobile (performance)

### Question 2: Context Bar Behavior on Scroll
**Mobile Scroll**: Should context bar auto-hide on scroll down?
- **Option A**: Always visible (consistent)
- **Option B**: Hide on scroll down, show on scroll up (more space)
- **Recommendation**: Option B - common mobile pattern, saves space

### Question 3: Default Density
**First-time Users**: What should default density be?
- **Option A**: Compact (less overwhelming, faster loading)
- **Option B**: Expanded (shows more info immediately)
- **Recommendation**: Compact for canvas, Expanded for gallery (gallery users want rich preview)

### Question 4: Edit Button Placement
**UnifiedCard**: Where should Edit button appear?
- **Option A**: Always visible on card
- **Option B**: Visible on hover (desktop) / tap (mobile)
- **Option C**: Context menu only (right-click / long-press)
- **Recommendation**: Option B - clean but discoverable

### Question 5: Container Icon System
**Visual Distinction**: How should different container types be visually distinct?
- **Option A**: Icon only (👤 character, 📦 prop, 📁 group)
- **Option B**: Icon + color coding
- **Option C**: Custom user-defined icons
- **Recommendation**: Start with A, add B in phase 2, C in phase 3

---

## Success Criteria

### Functional Goals
- ✅ Users can edit container metadata without hunting for detail nodes
- ✅ Same card component works in all views (no visual inconsistency)
- ✅ Mobile users have optimized defaults (gallery, not canvas)
- ✅ Context bar prevents "where am I?" confusion
- ✅ Containers work for diverse use cases (not just characters)

### Performance Goals
- Inspector panel opens in <100ms
- Card density toggle updates all cards in <200ms
- UnifiedCard component renders in <50ms (same as current cards)
- Context bar doesn't cause layout shift on drill-in

### UX Goals
- Users discover inspector panel within first 2 minutes (onboarding)
- 80%+ of users successfully edit container metadata
- Mobile users prefer gallery view (validate with metrics)
- Density preferences are used (not just set and forgotten)

---

## Recommendation

**Status**: ✅ **Recommend Approval**

All five design decisions are well-reasoned, solve real user problems, and follow industry best practices. The implementation strategy is clear with manageable scope.

**Next Steps After Approval**:
1. Update `spec.md` with approved decisions
2. Create detailed component designs (Figma mockups)
3. Build UnifiedCard component first (most critical)
4. Implement InspectorPanel
5. Add ContextBar
6. Migrate views one at a time
7. User testing with photographers and wig makers (not just cosplayers)

---

## Appendix: Competitive Analysis

### Inspector Panels in the Wild

| Tool | Desktop Pattern | Mobile Pattern | Notable Features |
|------|-----------------|----------------|------------------|
| **Figma** | Right sidebar, always visible when selected | Not mobile-optimized | Properties panel, layer panel |
| **Notion** | Right sidebar, toggle on/off | Bottom drawer | Database properties, page settings |
| **Linear** | Right sidebar, auto-opens on select | Bottom sheet | Inline editing, keyboard shortcuts |
| **Apple Notes** | No sidebar (inline only) | Bottom drawer for attachments | Simple, focused |
| **Miro** | Left sidebar (board settings), right sidebar (object properties) | Bottom drawer | Dual sidebars |

**Our Approach**: Figma + Notion hybrid
- Right sidebar (desktop) like Figma/Notion
- Bottom drawer (mobile) like Notion/Apple Notes
- Auto-opens on edit action, closeable

### Card Density Systems

| Tool | Density Options | User Control | Default |
|------|-----------------|--------------|---------|
| **Gmail** | Comfortable, Compact, Default | Settings menu | Default |
| **Notion** | Small, Medium, Large (text) | Per-page setting | Medium |
| **Airtable** | Short, Medium, Tall, Extra Tall | View menu | Short |
| **Linear** | Compact, Comfortable | Settings | Comfortable |

**Our Approach**: Compact ⟷ Expanded toggle
- Simpler than 3-4 options (less decision fatigue)
- Inline toggle (no buried setting)
- Per-view preferences (canvas vs gallery)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-22  
**Next Review**: After council feedback
