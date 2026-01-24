# Feature Specification: FEAT-006 — Enhanced Moodboard System

**Version:** 1.0  
**Status:** Draft  
**Created:** 2026-01-23  
**Last Updated:** 2026-01-23  
**CodeVision:** SFS-v2 Compliant

---

## Feature Intent

Transform the Cosplans moodboard from a simple reference collection into a comprehensive visual planning workspace that supports:
- Complex multi-project organization (containers, piles, ghost nodes)
- Event scheduling and contact management (calendar sync, task lists)
- Progress tracking and comparison (sequential chains, compare nodes, annotations)
- Bulk operations and data interoperability (CSV import/export, templates)
- Full accessibility (WCAG 2.1 AA via alternative views)

This feature addresses the core problem: creators currently bounce between multiple tools (Instagram for inspiration, Excel for planning, Calendar for scheduling, notes for annotations). The enhanced moodboard consolidates these workflows into one connected system.

---

## Scope

### In Scope

**Core Organization:**
- Pile nodes (single-layer grouping, expand in-place)
- Container nodes (deep nesting with drill-in: character, prop, group types)
- Ghost nodes (cross-container visibility via edges)
- Pile-to-container conversion workflow

**Planning & Tracking:**
- Event nodes (calendar sync: Google Calendar, Apple Calendar, Outlook)
- Contact nodes (people/businesses with profile info)
- Checklist nodes (task lists with progress tracking, nested items, attachments)
- Sequential edges (ordered progression chains)

**Visualization & Comparison:**
- Enhanced sketch tool (image annotation with drawing + side notes)
- Compare nodes (side-by-side, slider, overlay modes)
- Sequential timeline view (scrubber, animation)

**Power User Features:**
- Batch operations (multi-select: tag, delete, move, connect)
- Node templates (reusable checklists, containers, notes)
- CSV import with column mapping interface
- CSV export (current view, selected, all)
- Enhanced list view with advanced filtering

**UI/UX:**
- Progressive disclosure (collapsible context bar, dropdown toolbars)
- Inspector panel (right sidebar desktop, bottom drawer mobile)
- Container peek (quick view modal without navigation)
- Ghost filtering (visual highlighting via opacity)
- Unified card component (compact/expanded density modes)

**Accessibility:**
- Canvas view: basic keyboard support (limited accessibility)
- List view: full WCAG 2.1 AA compliance (screen reader optimized)
- Table view: full keyboard navigation (spreadsheet-style)
- Gallery view: accessible with keyboard + screen reader
- Screen reader detection and view recommendations

### Out of Scope

**Phase 1 (Current):**
- Real-time collaboration (future: multi-user editing)
- Cross-team project sharing with granular permissions (future enhancement)
- AI-powered features (auto-tagging, budget estimation)
- Video annotation (only image annotation)
- Voice input for quick capture
- Advanced animation/motion graphics tools
- Native mobile app (PWA focus first)

---

## Dependencies

**Required:**
- Existing moodboard infrastructure (`moodboard_nodes`, `moodboard_edges` tables)
- Supabase Storage (image/file uploads)
- Svelte Flow (@xyflow/svelte) - already in use
- Component registry (`.cv/components/registry.md`)

**External APIs:**
- Google Calendar API (OAuth + sync)
- Apple Calendar (CalDAV protocol)
- Outlook Calendar API (Microsoft Graph)
- Social media metadata parsers (existing: oembed-parser)

**Component Dependencies:**
- Check `.cv/components/registry.md` for reusable components
- Inspector panel pattern (check if exists or create)
- Drawer/Sheet components (exist in `ui/sheet.svelte`)
- Modal components (exist in `ui/dialog.svelte`)

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Svelte Flow performance with 200+ nodes | High | Medium | Virtual rendering, lazy load children |
| Calendar API rate limits | Medium | Medium | Local caching, batch sync every 15min |
| CSV import parsing errors | Medium | High | Preview before import, robust error handling |
| Ghost node query performance | High | Medium | Optimized indexes on edges table, depth limits |
| Mobile canvas usability | Medium | Low | Smart defaults (gallery on mobile), progressive disclosure |
| Component bloat (too many new components) | Medium | High | **Reuse from registry first**, create only when necessary |
| WCAG compliance gaps | High | Low | Dedicated accessibility testing, screen reader validation |

---

## Implementation Approach

### Architecture

**Data Model Extensions:**
- Add node types: `pile`, `event`, `contact`, `checklist`, `compare`
- Enhance `sketch` type: add `has_background_image`, `side_notes`
- Add edge types: `sequential` (with `sequence_number`)
- Ghost nodes: computed from edges (not stored as separate nodes)
- New table: `node_templates` (team-scoped reusable structures)

**Component Strategy:**
1. **Audit registry first** - identify reusable components
2. **Create atomic components** - PileNode, EventNode, ContactNode, etc.
3. **Compose complex features** - CompareView uses existing modal + card components
4. **Document new components** - add to registry with examples

**View System:**
- Extend existing Canvas/Gallery views
- Enhance List view with advanced filters
- Add Table view (new)
- Add Timeline view with event date toggle

### Technology Choices

**Frontend:**
- Svelte 5 + Runes (existing)
- @xyflow/svelte for canvas (existing)
- CVA for component variants (existing pattern)

**Backend:**
- Supabase Edge Functions for calendar sync
- PostgreSQL JSONB for flexible metadata
- Row Level Security (RLS) for multi-tenancy

**External Libraries:**
- `papaparse` - CSV parsing/generation
- Calendar APIs - official SDKs for each provider
- Canvas API (browser native) - sketch tool rendering

---

## Security Considerations

**Calendar OAuth:**
- OAuth 2.0 flow for Google/Microsoft
- Refresh tokens stored encrypted in Supabase
- Minimum scope requests (read/write calendars only)
- Token expiration handling

**CSV Import:**
- Server-side validation of uploaded files
- Max file size: 5MB
- Sanitize all imported text (prevent XSS)
- Preview before commit (transaction safety)

**Ghost Nodes:**
- Respect parent node permissions
- If user loses access to real node, ghost disappears
- RLS policies enforce visibility rules

**Templates:**
- Team-scoped only (no cross-team access)
- Sanitize template content on save
- Rate limit template creation (prevent abuse)

---

## Design & UX Considerations

**Progressive Disclosure:**
- Context bar: collapsed by default (44px), expands to show metadata
- Toolbars: primary actions visible, secondary in "More" menu
- Inspector: opens on selection, auto-closes on deselect
- Keep mobile canvas space: ~460-500px after chrome

**Real-World Analogies:**
- Piles = stacks of paper (expandable)
- Containers = binders (open to enter)
- Peek = looking through binder sleeve (no opening)
- Templates = blank forms to fill out

**Component Reuse Strategy:**
See individual capability specs for detailed component mapping.

**Key Reusable Components** (from registry):
- `ui/dialog.svelte`, `ui/sheet.svelte` - Modals and drawers
- `ui/button.svelte`, `ui/input.svelte`, `ui/select.svelte` - Form controls
- `base/InlineTextEditor.svelte`, `base/TagSelector.svelte` - Inline editing
- `base/ConfirmDialog.svelte` - Confirmations
- `ui/tabs.svelte` - View switcher tabs
- `ui/badge.svelte` - Status indicators
- `ui/tooltip.svelte` - Help text
- `ui/avatar.svelte` - Contact profile photos
- `base/LoadingState.svelte` - Loading/error states

**New Components Needed:**
- `PileNode.svelte` - Pile card with expand/collapse
- `ContainerNode.svelte` - Container card with peek/open
- `EventNode.svelte` - Event card with calendar icon
- `ContactNode.svelte` - Contact card with avatar
- `ChecklistNode.svelte` - Checklist with progress bar
- `CompareNode.svelte` - Comparison wrapper
- `InspectorPanel.svelte` - Right sidebar/bottom drawer
- `ContextBar.svelte` - Collapsible breadcrumb bar
- `ContainerPeek.svelte` - Quick view modal
- `SketchEditor.svelte` - Canvas-based annotation tool
- `CompareView.svelte` - Side-by-side/slider/overlay viewer
- `CSVImportModal.svelte` - Column mapping interface
- `TemplateLibrary.svelte` - Template browser

---

## Capabilities

This feature consists of the following capabilities (detailed specs in separate files):

### CAP-001: Pile Nodes & In-Place Expansion
**Status:** Specified  
**File:** `capabilities/cap-001-pile-nodes.md`

Single-layer grouping that expands in-place on the canvas without navigation.

### CAP-002: Container Nodes & Drill-In Navigation
**Status:** Specified  
**File:** `capabilities/cap-002-container-nodes.md`

Deep nesting with dedicated canvas per container (character, prop, group types).

### CAP-003: Ghost Nodes & Cross-Container Visibility
**Status:** Specified  
**File:** `capabilities/cap-003-ghost-nodes.md`

Virtual node clones appear in containers when edges connect them.

### CAP-004: Inspector Panel & Context Bar
**Status:** Specified  
**File:** `capabilities/cap-004-inspector-context.md`

Right sidebar (desktop) / bottom drawer (mobile) for editing + collapsible breadcrumb bar.

### CAP-005: Container Peek (Quick View)
**Status:** Specified  
**File:** `capabilities/cap-005-container-peek.md`

Modal overlay showing container contents without navigation.

### CAP-006: Pile-to-Container Conversion
**Status:** Specified  
**File:** `capabilities/cap-006-pile-conversion.md`

Promote piles to containers when content grows beyond 20 items.

### CAP-007: Event Nodes & Calendar Sync
**Status:** Specified  
**File:** `capabilities/cap-007-event-nodes.md`

Calendar-synced events with date/time/location + bidirectional sync.

### CAP-008: Contact Nodes
**Status:** Specified  
**File:** `capabilities/cap-008-contact-nodes.md`

People/businesses with profile info, social media links, and project relationships.

### CAP-009: Checklist Nodes
**Status:** Specified  
**File:** `capabilities/cap-009-checklist-nodes.md`

Task lists with nested items, progress tracking, and photo attachments.

### CAP-010: Sequential Edges & Timeline
**Status:** Specified  
**File:** `capabilities/cap-010-sequential-edges.md`

Ordered progression chains (WIP Day 1 → 2 → 3) with timeline visualization.

### CAP-011: Enhanced Sketch Tool (Image Annotation)
**Status:** Specified  
**File:** `capabilities/cap-011-sketch-annotation.md`

Canvas-based annotation tool with drawing tools + side notes panel.

### CAP-012: Compare Nodes
**Status:** Specified  
**File:** `capabilities/cap-012-compare-nodes.md`

Side-by-side comparison with slider/overlay modes for any node type.

### CAP-013: Batch Operations
**Status:** Specified  
**File:** `capabilities/cap-013-batch-operations.md`

Multi-select with bulk actions: tag, delete, move, connect.

### CAP-014: Node Templates
**Status:** Specified  
**File:** `capabilities/cap-014-templates.md`

Reusable structures for checklists, containers, and notes.

### CAP-015: Ghost Filtering
**Status:** Specified  
**File:** `capabilities/cap-015-ghost-filtering.md`

Visual highlighting (opacity-based) of matching nodes while keeping context visible.

### CAP-016: CSV Import with Mapping
**Status:** Specified  
**File:** `capabilities/cap-016-csv-import.md`

Bulk node creation with flexible column-to-field mapping interface.

### CAP-017: CSV Export
**Status:** Specified  
**File:** `capabilities/cap-017-csv-export.md`

Export current view, selected nodes, or all nodes to CSV/JSON/Markdown.

### CAP-018: Enhanced List View
**Status:** Specified  
**File:** `capabilities/cap-018-enhanced-list-view.md`

Advanced filtering, sorting, search with container-only mode.

### CAP-019: Unified Card Component
**Status:** Specified  
**File:** `capabilities/cap-019-unified-card.md`

Single card component with compact/expanded density modes.

### CAP-020: Accessibility Strategy
**Status:** Specified  
**File:** `capabilities/cap-020-accessibility.md`

WCAG 2.1 AA compliance via List/Table/Gallery views, canvas with basic keyboard support.

---

## Checkpoints

Implementation is organized into verifiable checkpoints:

### CP-001: Foundation & Core Nodes
**Capabilities:** CAP-001, CAP-002, CAP-004, CAP-019  
**Goal:** Basic pile/container functionality with inspector panel

**Tasks:**
- Update data model (add pile/container node types)
- Create PileNode component
- Create ContainerNode component  
- Create InspectorPanel component
- Create ContextBar component
- Create UnifiedCard base component
- Wire up basic expand/drill-in navigation

**Evidence:**
- Can create piles and containers
- Piles expand in-place showing children
- Containers drill into dedicated canvas
- Inspector opens on node selection
- Context bar shows breadcrumbs when inside container

**Acceptance Criteria:**
- [ ] Pile expands to show all child nodes
- [ ] Container double-click navigates to container canvas
- [ ] Breadcrumb "All" button returns to parent
- [ ] Inspector panel edits node metadata
- [ ] Works on desktop and mobile (responsive)

---

### CP-002: Ghost Nodes & Cross-Container Linking
**Capabilities:** CAP-003, CAP-015  
**Goal:** Ghost node system for multi-project cross-referencing

**Tasks:**
- Implement ghost node query logic
- Create ghost node renderer (80% opacity)
- Handle ghost delete (remove link vs delete all)
- Implement ghost filtering (opacity-based highlighting)
- Store ghost positions per container in edge metadata

**Evidence:**
- Node connected to container appears as ghost inside
- Ghost edits affect real node (visible in all locations)
- Ghost delete shows "Remove link" vs "Delete everywhere" modal
- Filtering highlights matching ghosts

**Acceptance Criteria:**
- [ ] Creating edge to container creates ghost inside
- [ ] Ghost position independent per container
- [ ] Editing ghost updates real node
- [ ] Deleting ghost offers two options
- [ ] Filtering works for real and ghost nodes

---

### CP-003: Event, Contact, Checklist Nodes
**Capabilities:** CAP-007, CAP-008, CAP-009  
**Goal:** Planning and tracking node types

**Tasks:**
- Create EventNode component
- Create ContactNode component
- Create ChecklistNode component
- Implement calendar sync service (Google/Apple/Outlook)
- Create event-checklist connection workflow
- Build checklist progress tracking UI

**Evidence:**
- Can create events with date/time/location
- Events sync to Google Calendar bidirectionally
- Can create contacts with profile info
- Can create checklists with nested items
- Checklists show progress (X/Y complete)

**Acceptance Criteria:**
- [ ] Event created on moodboard syncs to calendar
- [ ] Calendar event edit syncs back to moodboard
- [ ] Contact card displays profile photo and links
- [ ] Checklist items check/uncheck and persist
- [ ] Event-checklist connection visible in inspector

---

### CP-004: Progress Tracking & Comparison
**Capabilities:** CAP-010, CAP-011, CAP-012  
**Goal:** Sequential chains, annotations, and comparisons

**Tasks:**
- Implement sequential edge type with numbering
- Create sequential timeline view
- Build SketchEditor component (canvas-based)
- Create CompareView component (side-by-side, slider, overlay)
- Wire up compare node creation workflow

**Evidence:**
- Can create sequential chains (WIP 1 → 2 → 3)
- Timeline view detects and displays sequences
- Can annotate images with arrows/text/shapes
- Can create compare nodes from two selected nodes
- Compare modes (side-by-side, slider, overlay) all work

**Acceptance Criteria:**
- [ ] Sequential edge shows numbered arrows
- [ ] Timeline view has scrubber/play button
- [ ] Sketch editor saves annotations + side notes
- [ ] Compare node shows both nodes with toggle modes
- [ ] Image compare slider works smoothly

---

### CP-005: Bulk Operations & Templates
**Capabilities:** CAP-013, CAP-014, CAP-006  
**Goal:** Power user efficiency features

**Tasks:**
- Implement multi-select state management
- Create bulk action toolbar
- Build TemplateLibrary component
- Implement template save/load/apply
- Create pile-to-container conversion workflow

**Evidence:**
- Can multi-select nodes (lasso or shift-click)
- Bulk tag/delete/move operations work
- Can save checklist as template
- Can create container from template
- Pile with 20+ items shows conversion suggestion

**Acceptance Criteria:**
- [ ] Multi-select works on desktop and mobile
- [ ] Bulk tag adds tags to all selected nodes
- [ ] Template saved and appears in library
- [ ] Creating from template duplicates structure
- [ ] Pile-to-container preserves all children and edges

---

### CP-006: Data Import/Export & Enhanced List View
**Capabilities:** CAP-016, CAP-017, CAP-018  
**Goal:** Interoperability with external tools

**Tasks:**
- Build CSVImportModal with column mapping UI
- Implement CSV parsing with papaparse
- Create preview before import workflow
- Build CSV/JSON/Markdown export functions
- Enhance List view with advanced filters

**Evidence:**
- Can upload CSV and map columns to fields
- Preview shows first 5 rows before import
- Import creates nodes from CSV data
- Can export filtered view to CSV
- List view filters by metadata, tags, date range

**Acceptance Criteria:**
- [ ] CSV upload detects columns automatically
- [ ] Column mapping dropdown shows all field options
- [ ] Preview accurately reflects import result
- [ ] Exported CSV opens correctly in Excel
- [ ] List view filtering by custom metadata works

---

### CP-007: Container Peek & Polish
**Capabilities:** CAP-005, remainder of CAP-004  
**Goal:** UX refinements and progressive disclosure

**Tasks:**
- Create ContainerPeek modal component
- Implement context bar collapse/expand
- Add preview thumbnails to container cards
- Refine mobile progressive disclosure (toolbar dropdowns)
- Polish animations (expand, collapse, transitions)

**Evidence:**
- Peek shows 6-8 preview items without navigation
- Context bar collapses to save space
- Container cards show first 4 child thumbnails
- Mobile toolbar uses dropdown menus
- All transitions smooth at 60fps

**Acceptance Criteria:**
- [ ] Peek opens on hover + spacebar (desktop)
- [ ] Peek shows container contents read-only
- [ ] Context bar toggles collapsed/expanded
- [ ] Mobile context bar shows only name when collapsed
- [ ] Animations don't lag on mid-range devices

---

### CP-008: Accessibility Compliance
**Capability:** CAP-020  
**Goal:** WCAG 2.1 AA compliance via alternative views

**Tasks:**
- Audit all ARIA markup in List/Table/Gallery views
- Implement screen reader detection
- Create accessibility onboarding flow
- Test with NVDA, JAWS, VoiceOver
- Document accessibility strategy

**Evidence:**
- Screen reader announces nodes correctly in List view
- Keyboard-only navigation works in Table view
- Gallery view accessible with arrow keys
- Screen reader detection suggests List view
- Accessibility statement published

**Acceptance Criteria:**
- [ ] WCAG 2.1 AA automated tests pass (axe, WAVE)
- [ ] Manual screen reader testing passes
- [ ] Keyboard-only testing passes (all views)
- [ ] High contrast mode works correctly
- [ ] Accessibility documentation complete

---

## Testing Strategy

### Unit Tests
- Node type validation (pile, container, event, contact, checklist, compare)
- Edge type validation (sequential, ghost)
- CSV parsing edge cases
- Ghost node query logic
- Template serialization/deserialization

### Integration Tests
- Calendar sync (mock API responses)
- CSV import/export round-trip
- Ghost node creation from edges
- Sequential chain numbering
- Template application workflow

### E2E Tests
- Create pile → expand → convert to container
- Create event → sync to calendar → edit in calendar → sync back
- Multi-select nodes → bulk tag → verify all tagged
- Upload CSV → map columns → import → verify nodes created
- Create sequential chain → view in timeline → verify order

### Manual Validation
- Mobile responsive design (test on real devices)
- Screen reader experience (NVDA, JAWS, VoiceOver)
- Calendar sync with actual Google/Apple/Outlook accounts
- Performance with 200+ nodes on canvas
- Touch gestures on iPad

### Regression Tests
- Existing moodboard functionality still works
- Canvas view zoom/pan unchanged
- Gallery view unchanged
- Basic node CRUD unchanged
- Edges still render correctly

---

## Success Metrics

**Adoption:**
- % of users who create at least one pile/container
- Average nodes per moodboard (expect increase from better organization)
- % of users who use event/contact/checklist nodes

**Usage:**
- View mode distribution (Canvas vs Gallery vs List vs Table)
- Mobile vs desktop usage (expect smart defaults to improve mobile engagement)
- Ghost node creation rate (validates multi-project cross-referencing need)

**Efficiency:**
- Time to organize 30 references (expect reduction with bulk operations)
- CSV import adoption rate (event coordinators, power users)
- Template usage (measure reuse via template library)

**Accessibility:**
- % of screen reader users (via detection)
- View preference by assistive tech users (expect List > Canvas)
- Accessibility-related support tickets (expect decrease)

---

## Open Questions

*To be resolved during implementation:*

1. **Calendar sync frequency:** 15 minutes acceptable? Or user-triggered refresh button?
2. **Ghost node depth limit:** Max 3 levels deep? Or unlimited?
3. **CSV import max rows:** 1000? 5000? 10000?
4. **Template sharing:** Team-only or allow export/import between teams?
5. **Compare node types:** Support all node types or just images/sketches/notes?
6. **Sequential edge renumbering:** Auto or manual when inserting nodes?
7. **Container thumbnail:** Auto (first image) or always manual selection?
8. **Mobile canvas default:** Force gallery or allow canvas with warning?

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-23 | Initial SFS-v2 specification | Council-approved design |

---

## References

- **Design Decisions:** `.cv/design/feat-006/council-decisions.md`
- **Interaction Patterns:** `.cv/design/feat-006/interaction-patterns.md`
- **Component Registry:** `.cv/components/registry.md`
- **CodeVision Spec:** Section 4 (Planning & Specification)
- **Historical Context:** `.cv/ledger/feat-006/` (informative only)
