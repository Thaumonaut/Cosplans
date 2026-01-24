# Council Design Review: Moodboard Container Nodes & Detail Display

**Date**: 2026-01-23  
**Feature**: 006-brainstorming-moodboard  
**Reviewers**: Lead Designer, UX/UI Design Lead  
**Status**: ✅ Approved

---

## Executive Summary

Following user feedback about context loss when drilling into container nodes, we conducted a stakeholder clarification session to address fundamental UX patterns for moodboard organization and detail display. The council approved 5 key design decisions that will unify the user experience and solve the container detail visibility problem.

### Core Problem Solved

**Before**: Users create container nodes (characters, props, equipment lists) with metadata at the parent level. When they drill into a container's moodboard, that context disappears. The previous `container_details` child node approach felt awkward because it's metadata ABOUT the space, not content IN the space.

**After**: Inspector panel + context bar pattern preserves visibility of container metadata while users work inside containers, with unified card design across all contexts.

---

## Approved Design Decisions

### Decision 1: Inspector Panel + Context Bar for Container Details

**Question**: How should container node details be displayed when users drill into containers to prevent context loss?

**Approved Answer**: Inspector panel (desktop: right sidebar, mobile: bottom drawer) + compact context bar at top showing parent container metadata

**Implementation**:

**Inspector Panel** (Figma/Notion pattern):
- **Desktop**: Right sidebar (300-400px) slides in when node selected
- **Mobile**: Bottom drawer (60-80% screen height) slides up from bottom
- **Purpose**: Edit all node properties inline
- **Context-aware fields**:
  - Container nodes: character_name, series, variant, budget, custom_fields
  - Image nodes: tags, notes, source URL
  - Social media nodes: platform, author, tags, notes
  - Budget item nodes: cost, quantity, supplier, priority
- **Auto-save**: On blur or explicit save button
- **Collapsible**: User can hide to maximize canvas space

**Context Bar**:
- **Always visible**: Appears at top when inside a container's moodboard
- **Height**: 40-50px (compact to preserve canvas space)
- **Content**: Breadcrumb navigation + key metadata preview
  - Example: "All > Character: Link (BotW) | Series: Zelda | Budget: $250"
- **Actions**: 
  - Click breadcrumb → navigate back to parent
  - Edit button → opens inspector panel
  - View switcher (canvas/gallery/table/timeline)
- **Mobile-optimized**: Touch-friendly tap targets, swipe to collapse

**User Flow**:
1. User on main moodboard sees container card "Character: Link (BotW)"
2. Card shows preview: character name, series, estimated budget
3. User taps/clicks container → Drills into container's moodboard
4. Context bar appears: "All > Character: Link (BotW) | Series: Zelda | Budget: $250"
5. User taps background or container icon → Inspector slides in
6. Inspector shows all editable fields
7. User edits, saves, continues working
8. Context bar keeps user oriented at all times
9. Tap breadcrumb "All" to return to parent

**Why This Works**:
- **No context loss**: Metadata always visible via context bar
- **No awkward detail nodes**: Metadata lives in proper inspector, not as fake content
- **Familiar pattern**: Figma, Notion, Linear all use inspector panels
- **Mobile-friendly**: Bottom drawer is natural mobile pattern
- **Scalable**: Works for simple and complex metadata structures

---

### Decision 2: Unified Card Component with Expand/Collapse

**Question**: Should NodeCard and ReferenceCard remain separate or unify into one component?

**Approved Answer**: Unified component with expand/collapse functionality and user preferences for default density (compact/expanded)

**Implementation**:

**Single Component** (`UnifiedCard.svelte`):
- Replaces: `ReferenceCard.svelte`, `NodeCard.svelte` (separate components)
- Used everywhere: Canvas view, gallery view, table view, references tab (now moodboard tab)
- Props: `node`, `density` ("compact" | "expanded"), `viewMode`, `onExpand`, `onEdit`, `onDelete`

**Two Density Modes**:

**Compact Mode**:
- Small thumbnail (100x100px or 150x150px)
- Title (1 line, truncated)
- 1-2 key metadata fields
- Tag pills (max 3 visible, "+2 more" indicator)
- Hover: Show full title tooltip
- **Use case**: Canvas view, scanning many items quickly

**Expanded Mode**:
- Large preview (300x200px, full width in gallery)
- Full title (2-3 lines)
- All metadata fields visible
- Notes section (up to 3 lines preview, "Read more" if longer)
- Embedded content inline (Instagram, TikTok, YouTube iframes)
- All tags visible
- **Use case**: Gallery view, deep inspection of items

**Toggle Control**:
- Icon button on card (expand/collapse icon)
- Click → instantly switch density
- Animation: Smooth height transition (200ms ease-out)

**User Preferences**:
- **Per-view defaults**: User sets preferred density for each view mode
  - Example: "I want compact on canvas, expanded in gallery"
- **Saved in user settings**: `user_preferences.moodboard_card_density`
  ```json
  {
    "canvas": "compact",
    "gallery": "expanded",
    "table": "compact",
    "list": "compact"
  }
  ```
- **Per-card override**: User can expand/collapse individual cards temporarily
- **Session persistence**: Override persists during session, resets on page load

**Consistent Visual Design**:
- Shadows: `shadow-sm` (compact), `shadow-md` (expanded)
- Borders: 1px solid border with theme color
- Hover state: Lift shadow (`shadow-lg`), scale (1.02)
- Platform badges: Consistent positioning (top-right corner)
  - Instagram: Red gradient badge
  - TikTok: Black badge with white logo
  - YouTube: Red badge with play icon
  - Pinterest: Red "P" badge
- Tag pills: Same styling everywhere (rounded, small, theme-colored)
- Action buttons: Consistent icon set (Lucide), same positions (top-right menu)

**Why This Works**:
- **DRY**: One component, one codebase (easier maintenance)
- **Flexibility**: Users choose density based on task
- **Performance**: No duplicate rendering logic
- **Consistency**: Same visual language everywhere
- **User control**: Preferences + per-card override = power + simplicity

---

### Decision 3: Compact Context Bar for Container Navigation

**Question**: How should context about parent containers be shown when inside a container's moodboard?

**Approved Answer**: Compact context bar at the top showing container name, type, and key metadata (character name, series, variant) with breadcrumb navigation

**Implementation**:

**Context Bar Layout**:
```
┌────────────────────────────────────────────────────────────┐
│ 🏠 All > 🎭 Character: Link (BotW) │ Series: Zelda │ $250 │
│ [Edit] [Add Content] [View: Canvas ▼] [···]              │
└────────────────────────────────────────────────────────────┘
```

**Key Elements**:
1. **Breadcrumb trail**: 
   - Home icon + "All" (clickable → parent moodboard)
   - Separator: " > "
   - Container icon (based on type: 🎭 character, 📦 prop, 📁 group)
   - Container name with type prefix
2. **Metadata preview**: 
   - Most important 2-3 fields (varies by container type)
   - Character: series_name, variant, budget
   - Prop: material, difficulty, cost
   - Group: purpose, item_count
3. **Actions**: 
   - Edit button → Opens inspector
   - Add Content → Quick add menu
   - View switcher → Canvas/Gallery/Table/Timeline dropdown
   - More menu → Share, Export, Settings

**Responsive Behavior**:
- **Desktop (>1024px)**: Full metadata visible, all actions
- **Tablet (768-1024px)**: Abbreviated metadata (max 2 fields), main actions only
- **Mobile (<768px)**: Container name only, actions in collapsed menu
  - Example: "🏠 All > Link (BotW) [···]"

**Collapse/Expand**:
- **Collapsed mode**: Icon-only breadcrumb (saves 30px vertical space)
  - Shows: 🏠 > 🎭 [···]
  - Hover/tap to expand temporarily
- **Toggle button**: Pin/unpin icon (top-right of bar)
- **Auto-collapse**: After 10 seconds of no interaction (optional setting)

**Visual Design**:
- Height: 48px (desktop), 44px (mobile)
- Background: Subtle gray (`bg-gray-50` dark:`bg-gray-900`)
- Border bottom: 1px solid border
- Sticky: Stays at top on scroll
- Z-index: High (above canvas content, below modals)

**Why This Works**:
- **Always oriented**: User never loses track of where they are
- **Compact**: Minimal vertical space (preserves canvas)
- **Actionable**: Quick access to edit, add, switch views
- **Familiar**: Breadcrumbs are universal web pattern
- **Mobile-optimized**: Responsive design adapts to screen size

---

### Decision 4: References Tab → Moodboard Tab with Smart Defaults

**Question**: Should References Tab and Moodboard be unified or kept separate?

**Approved Answer**: Replace References Tab with Moodboard Tab using the same unified component everywhere, with smart responsive defaults (canvas for desktop, gallery for mobile)

**Implementation**:

**Tab Rename**:
- **Before**: Idea Details page has "Overview | References | Budget | Timeline"
- **After**: Idea Details page has "Overview | Moodboard | Budget | Timeline"
- Same component as standalone `/ideas/[id]/moodboard` page

**Smart Responsive Defaults**:

| Screen Size | Default View | Reasoning |
|-------------|--------------|-----------|
| Desktop (>1024px) | Canvas View | Infinite workspace, spatial freedom, mouse precision |
| Tablet (768-1024px) | Gallery View | Touch-friendly, easier than canvas manipulation |
| Mobile (<768px) | Gallery View | Limited space, touch-first, vertical scroll natural |

**User Override**:
- User can manually switch to any view mode (canvas/gallery/table/timeline/list/graph)
- Preference saved: `user_preferences.moodboard_view_mode`
- Applies across all moodboard contexts (standalone page, idea tab, project tab)

**Component Reuse**:
- **Single component**: `MoodboardView.svelte`
- **Used in**:
  1. Standalone page: `/ideas/[id]/moodboard` (full screen)
  2. Idea details tab: Embedded in tab content
  3. Project details tab: Embedded, linked to source idea moodboard
  4. Share page: Public view (read-only)
- **Props**: 
  - `ideaId` (required)
  - `viewMode` (optional, falls back to smart default or user preference)
  - `embedded` (boolean, changes chrome/layout)
  - `readonly` (boolean, for shared public views)

**Benefits**:
- **DRY**: No duplicate code, single source of truth
- **Consistency**: Same UX everywhere
- **Feature parity**: All moodboard features available in all contexts
  - Inspector panel works in tab view
  - Context bar works in tab view
  - All view modes work in tab view
- **Reduced maintenance**: Fix bugs once, applies everywhere
- **Responsive**: Smart defaults reduce friction on mobile

**Migration**:
- **Old component**: `src/lib/components/ideas/ReferencesTab.svelte` (deprecated)
- **Old card**: `src/lib/components/ideas/ReferenceCard.svelte` (deprecated)
- **New component**: `src/lib/components/moodboard/MoodboardView.svelte` (replaces both)
- **Data migration**: None needed (data structure compatible)

**Why This Works**:
- **Reduces confusion**: "References" and "Moodboard" were same concept, different names
- **Mobile-friendly**: Gallery view default on mobile = better UX
- **Consistent**: Same experience whether on standalone page or in tab
- **Future-proof**: One component to enhance with new features

---

### Decision 5: Container Flexibility - "Sacks/Stacks" for Any Purpose

**Question**: What is the intended purpose and flexibility of container nodes?

**Approved Answer**: Flexible "sacks/stacks" for any spatial organization need - characters, props, equipment lists, outfit options, event planning. Not limited to characters only.

**Implementation**:

**Container Types**:
1. **Character** (`container_type: "character"`)
   - Use case: Character options, variations, archived versions
   - Example: "Link Default", "Link BotW", "Link Twilight Princess"
   - Metadata: character_name, series_name, variant, estimated_budget, actual_budget
   
2. **Prop** (`container_type: "prop"`)
   - Use case: Prop collections, prop variations
   - Example: "Master Sword", "Hylian Shield", "Bow of Light"
   - Metadata: prop_name, material, difficulty, estimated_cost
   
3. **Group** (`container_type: "group"`)
   - Use case: ANY flexible grouping
   - Examples:
     - **Equipment lists**: "PAX Setup: 2 Lenses", "PAX Setup: 1 Lens + Lighting"
     - **Event planning**: "PAX East Day 1", "PAX East Day 2", "Anime Boston"
     - **Material groups**: "Fabrics for Tunic", "Armor Materials"
     - **Outfit options**: "Winter Version", "Summer Version"
   - Metadata: group_name, purpose, custom_fields (flexible JSON)

**Custom Fields**:
- All container types support custom_fields (JSONB)
- Users can add arbitrary fields
- Examples:
  ```json
  {
    "event_date": "2026-03-15",
    "priority": "high",
    "difficulty_rating": 4,
    "reference_url": "https://...",
    "notes": "Must finish before PAX"
  }
  ```

**Use Case Examples**:

**Example 1: Photographer's Equipment Planning**
- Idea: "PAX East 2026 Photography"
- Container 1 (group): "Setup A: Travel Light"
  - Inside: Camera body, 50mm lens, 1 speedlight, SD cards
  - Budget: $150 (rental costs)
- Container 2 (group): "Setup B: Studio Quality"
  - Inside: Camera body, 24-70mm lens, 70-200mm lens, 2 speedlights, light stand
  - Budget: $350 (rental costs)
- User compares containers to decide which equipment list to bring

**Example 2: Cosplayer's Multi-Con Planning**
- Idea: "Spring Convention Season"
- Container 1 (character): "Tanjiro - PAX East Day 1"
  - Inside: Costume references, wig, sword prop, makeup notes
- Container 2 (character): "Inosuke - PAX East Day 2"
  - Inside: Boar mask reference, shirtless muscle suit notes, dual swords
- Container 3 (character): "Zenitsu - Anime Boston"
  - Inside: Yellow haori fabric swatch, wig style reference, thunder effect ideas

**Example 3: Wig Maker's Material Organization**
- Idea: "Wig Commissions - March 2026"
- Container 1 (group): "Materials: Blonde Wigs"
  - Inside: Weft samples, lace front caps, blonde dye references
- Container 2 (group): "Materials: Colored Wigs"
  - Inside: Pink weft, blue weft, purple gradient tutorial

**Why This Works**:
- **Flexible**: Not forced into "character" mental model
- **Diverse creators**: Supports cosplayers, photographers, wig makers, prop makers
- **Real use cases**: Validated against actual user needs
- **Scalable**: Custom fields allow for any future metadata needs
- **Progressive disclosure**: Simple by default (just a group), complex when needed (custom fields)

---

## Impact Analysis

### User Experience Impact

**Before Changes**:
- ❌ Context loss when drilling into containers
- ❌ Awkward `container_details` child nodes
- ❌ Separate ReferenceCard and NodeCard components (inconsistent UX)
- ❌ "References Tab" vs "Moodboard" naming confusion
- ❌ Containers seen as "character-only" feature

**After Changes**:
- ✅ Context always visible via context bar
- ✅ Proper inspector panel for metadata editing
- ✅ Unified card design (consistent everywhere)
- ✅ Clear naming: Moodboard Tab
- ✅ Containers flexible for any organizational need

### Developer Impact

**Component Consolidation**:
- **Before**: 2 card components (ReferenceCard, NodeCard) + separate References tab component
- **After**: 1 unified card component (UnifiedCard) + 1 moodboard view component

**Code Reduction** (estimated):
- Delete ~400 lines: ReferenceCard.svelte
- Delete ~300 lines: NodeCard.svelte
- Delete ~500 lines: ReferencesTab.svelte
- Add ~600 lines: UnifiedCard.svelte (with density modes)
- Add ~200 lines: InspectorPanel.svelte
- Add ~100 lines: ContextBar.svelte
- **Net**: -700 lines of code (36% reduction in moodboard UI code)

**Maintenance Benefits**:
- Fix bugs once (not in 2-3 places)
- Add features once (applies everywhere)
- Consistent behavior (no drift between components)

### Performance Impact

**Neutral/Positive**:
- Unified component = less bundle size
- Smart defaults = better mobile performance (gallery instead of canvas)
- Context bar adds minimal overhead (static component)
- Inspector panel lazy-loaded (only when needed)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create `UnifiedCard.svelte` with compact/expanded modes
- [ ] Create `InspectorPanel.svelte` (desktop + mobile responsive)
- [ ] Create `ContextBar.svelte` with breadcrumb navigation
- [ ] Add user preferences schema: `moodboard_card_density`, `moodboard_view_mode`

### Phase 2: Integration (Week 2)
- [ ] Replace ReferenceCard usage with UnifiedCard
- [ ] Replace NodeCard usage with UnifiedCard
- [ ] Add inspector panel to moodboard canvas view
- [ ] Add context bar to container drill-down views

### Phase 3: Unification (Week 3)
- [ ] Rename "References Tab" to "Moodboard Tab"
- [ ] Replace ReferencesTab component with MoodboardView component
- [ ] Implement smart responsive defaults (canvas/gallery)
- [ ] Migrate container types to include "group" type

### Phase 4: Polish (Week 4)
- [ ] Animations: expand/collapse transitions
- [ ] Mobile gestures: swipe context bar, pinch inspector
- [ ] Keyboard shortcuts: Cmd+I for inspector, Cmd+B for breadcrumb
- [ ] Accessibility: ARIA labels, keyboard navigation, screen reader support
- [ ] Testing: Unit tests, integration tests, visual regression tests

### Phase 5: Migration (Week 5)
- [ ] Deprecation warnings for old components
- [ ] Data migration script (if needed for container_type)
- [ ] Update all references in codebase
- [ ] Delete deprecated components
- [ ] Documentation updates

---

## Open Questions

### Technical Questions
1. **Inspector panel state**: Should inspector state be URL-encoded (e.g., `?inspector=node_123`) for deep linking?
2. **Context bar collapse**: Should collapse preference be global or per-container?
3. **Card density animation**: Should we animate thumbnail size change or just use CSS transition?
4. **Mobile bottom drawer**: Use native sheet API (iOS) or custom implementation for consistency?

### UX Questions
1. **First-time users**: Should we show tooltip/tour explaining inspector panel on first container creation?
2. **Context bar auto-hide**: Should it auto-hide on mobile after inactivity to maximize canvas space?
3. **Keyboard shortcuts**: What should the full shortcut map be? (Cmd+I for inspector, Cmd+B for breadcrumb, etc.)
4. **Accessibility**: Should inspector panel be accessible via keyboard-only navigation? (Yes, but how do we communicate this?)

### Product Questions
1. **Container templates**: Should we provide templates for common container types (character, equipment list, event planning)?
2. **Bulk operations**: Should users be able to multi-select and bulk-edit container metadata?
3. **Container search**: Should context bar include search/filter for containers with many nested levels?

---

## Success Criteria

### Functional Requirements
- ✅ Context bar visible when inside containers
- ✅ Inspector panel edits all node types
- ✅ Unified card works in all view modes
- ✅ References tab renamed and unified with moodboard
- ✅ Smart responsive defaults work correctly

### User Experience Metrics
- **Context retention**: Users report no confusion about "where am I?" when inside containers
- **Component consistency**: Users feel same experience across all moodboard contexts
- **Mobile usability**: Mobile users prefer gallery default (measured via view mode analytics)
- **Flexibility**: Users create non-character containers (proves flexibility)

### Performance Metrics
- **Page load**: No regression (unified component reduces bundle size)
- **Animation smoothness**: Expand/collapse transitions at 60fps
- **Mobile scrolling**: Gallery view scrolls at 60fps on mid-range devices

---

## Competitive Analysis

| Feature | Figma | Notion | Milanote | Our App |
|---------|-------|--------|----------|---------|
| Inspector Panel | ✅ Right sidebar | ✅ Right sidebar | ❌ | ✅ Right sidebar + mobile drawer |
| Context Bar | ❌ | ✅ Breadcrumbs | ❌ | ✅ Breadcrumbs + metadata |
| Unified Cards | ✅ | ✅ | ✅ | ✅ |
| Responsive Defaults | ❌ (desktop-only) | ✅ | ⚠️ (limited mobile) | ✅ Smart defaults |
| Container Flexibility | ✅ Frames | ✅ Databases | ✅ Boards | ✅ Sacks/stacks |

**Key Differentiators**:
- **Our context bar**: Shows metadata preview (Notion only shows breadcrumbs)
- **Our smart defaults**: Canvas on desktop, gallery on mobile (others don't adapt)
- **Our flexibility**: Containers for ANY purpose (not just organizational structure)

---

## Appendix: Design References

### Inspector Panel References
- **Figma**: Right sidebar with properties panel
- **Notion**: Right sidebar with page info, metadata, comments
- **Linear**: Right sidebar with issue details
- **Apple Notes**: Bottom drawer on iOS for sharing/metadata

### Context Bar References
- **Notion**: Breadcrumb navigation at top
- **Figma**: File path breadcrumb
- **Google Drive**: Breadcrumb with folder icons
- **VS Code**: Breadcrumb in editor

### Card Design References
- **Pinterest**: Masonry grid, hover states, save button
- **Are.na**: Block cards with expand/collapse
- **Raindrop.io**: Compact list / expanded gallery toggle
- **Cosmos**: Clean card design with platform badges

---

## Council Approval

**Lead Designer**: ✅ Approved - Inspector panel + context bar pattern solves context loss elegantly

**UX/UI Design Lead**: ✅ Approved - Unified card design with user preferences gives flexibility while maintaining consistency

**Implementation Team**: Ready to begin Phase 1

**Next Steps**: 
1. ✅ Update specification with clarifications
2. Create component designs (Figma mockups)
3. Begin Phase 1 implementation
4. Schedule design review checkpoint after Phase 2

---

**Document Status**: Final - Ready for Implementation  
**Last Updated**: 2026-01-23  
**Approval Date**: 2026-01-23
