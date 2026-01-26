# FEAT-006: Brainstorming & Moodboard — Tasks

> **Feature:** `.cv/spec/features/FEAT-006.md`
> **Design:** `.cv/design/FEAT-006-design.md`
> **Branch:** `006-brainstorming-moodboard`
> **Generated:** 2026-01-22
> **Spec Version:** 3.0 (SFS-v2 — Hierarchical Architecture)

---

## Current State

**Already implemented:**
- Database schema: `moodboard_nodes`, `moodboard_edges`, `budget_items`, `contacts`, `idea_options`, `moodboard_shares`, `moodboard_comments`
- Moodboard store (`src/lib/stores/moodboard.ts`)
- ReferencesTab with URL/image/note adding
- ReferenceCard component
- SocialMediaEmbed component
- Metadata extraction service
- Basic content filtering (all/posts/videos)

**Changes required for new architecture:**
- ~~Add `moodboards` table (first-class entity)~~ ✅
- ~~Add `moodboard_id` to `moodboard_nodes` for hierarchy~~ ✅
- ~~Add `container_type` to `moodboard_nodes`~~ ✅
- ~~Add `linked_moodboard_id` for moodboard links~~ ✅
- New routes: `/moodboard`, `/moodboard/[id]`
- ~~Auto-creation triggers for personal/team/idea moodboards~~ ✅

---

## Checkpoint 1: Foundation (CP-01)

### T-001: Database migration for moodboards table ✅
**Satisfies:** CAP-01 (Moodboard as First-Class Entity)
**Dependencies:** None
**Size:** S
**Status:** COMPLETED (2026-01-22)
**Migration:** `20260122000001_create_moodboards_table.sql`

- [x] Create migration for `moodboards` table
- [x] Add RLS policies matching owner permissions
- [x] Add `can_access_moodboard()` helper function
- [x] Add `moodboard_id` FK to ideas and projects tables

**Verification:**
- [ ] `supabase db push` succeeds
- [ ] Can insert/query moodboards via SQL
- [ ] RLS prevents cross-user access

---

### T-002: Database migration for hierarchical nodes ✅
**Satisfies:** CAP-02 (Hierarchical Node Structure)
**Dependencies:** T-001
**Size:** S
**Status:** COMPLETED (2026-01-22)
**Migration:** `20260122000002_migrate_nodes_to_moodboards.sql`

- [x] Alter `moodboard_nodes` table to add:
  - `moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE`
  - `container_type TEXT` (null for leaf nodes)
  - `linked_moodboard_id UUID REFERENCES moodboards(id)` (for moodboard links)
  - `title TEXT`
- [x] Create index on `(moodboard_id, parent_id)` for tree queries
- [x] Migrate existing nodes to new schema (link to idea moodboards)
- [x] Update node_type constraint for new card types

**Verification:**
- [ ] Migration succeeds without data loss
- [ ] Tree queries with recursive CTE work
- [ ] Existing references still display correctly

---

### T-003: Create moodboardsService ✅
**Satisfies:** CAP-01, CAP-02
**Dependencies:** T-001, T-002
**Size:** M
**Status:** COMPLETED (2026-01-22)
**File:** `src/lib/api/services/moodboardsService.ts`

- [x] Create `src/lib/api/services/moodboardsService.ts`
- [x] Implement CRUD operations:
  - `createMoodboard(owner_type, owner_id, title)`
  - `getMoodboard(id)`
  - `getMoodboardByOwner(owner_type, owner_id)`
  - `updateMoodboard(id, updates)`
  - `deleteMoodboard(id)`
- [x] Implement tree queries:
  - `getNodesAtLevel(moodboard_id, parent_id)` — returns direct children
  - `getNodePath(node_id)` — returns breadcrumb path to root
  - `getDescendants(node_id)` — returns all children recursively
- [x] Create RPC functions for tree queries (`20260122000004_create_tree_query_functions.sql`)

**Verification:**
- [ ] Unit tests for all CRUD operations
- [ ] Tree query returns correct hierarchy
- [ ] Path query returns correct breadcrumb order

---

### T-004: Auto-create moodboards on entity creation ✅
**Satisfies:** CAP-01
**Dependencies:** T-003
**Size:** M
**Status:** COMPLETED (2026-01-22)
**Migration:** `20260122000003_create_moodboard_auto_triggers.sql`

- [x] Create database trigger: user signup → create personal moodboard
- [x] Create database trigger: team creation → create team moodboard
- [x] Create database trigger: idea creation → create idea moodboard
- [x] Backfill existing users, teams, and ideas with moodboards

**Verification:**
- [ ] New user signup creates personal moodboard
- [ ] New team creates team moodboard
- [ ] New idea creates idea moodboard
- [ ] Idea/project references correct moodboard

---

### T-005: Create moodboard routes ✅
**Satisfies:** CAP-03 (Full-Screen Canvas Editor)
**Dependencies:** T-003
**Size:** M
**Status:** COMPLETED (2026-01-22)

- [x] Create route: `src/routes/(auth)/moodboard/+page.svelte` — personal moodboard
- [x] Create route: `src/routes/(auth)/moodboard/[id]/+page.svelte` — specific moodboard
- [x] Create route: `src/routes/(auth)/teams/[id]/moodboard/+page.svelte` — team moodboard (redirect)
- [x] Create route: `src/routes/(auth)/ideas/[id]/moodboard/+page.svelte` — idea moodboard (redirect)
- [x] Create route: `src/routes/(auth)/projects/[id]/moodboard/+page.svelte` — project moodboard (redirect)
- [x] Implement route loaders to fetch moodboard data
- [x] Add authentication guards (via (auth) layout group)

**Verification:**
- [ ] `/moodboard` loads user's personal moodboard
- [ ] `/moodboard/[id]` loads specific moodboard with permission check
- [ ] `/ideas/[id]/moodboard` redirects to correct moodboard

---

### T-006: Create basic node CRUD operations ✅
**Satisfies:** CAP-02
**Dependencies:** T-002, T-003
**Size:** M
**Status:** COMPLETED (2026-01-22)

- [x] Extend moodboardsService with node operations:
  - `createNode(moodboard_id, parent_id, node_type, data)` — in moodboardsService.ts
  - `updateNode(node_id, updates)` — in moodboardsService.ts
  - `deleteNode(node_id)` — with cascade option in moodboardsService.ts
  - `moveNode(node_id, new_parent_id, new_position)` — in moodboardsService.ts
- [x] Handle container vs leaf node validation
- [x] Create UI components:
  - `src/lib/components/moodboard/AddNodeModal.svelte` — for creating nodes
  - `src/lib/components/moodboard/EditNodeModal.svelte` — for editing nodes
  - `src/lib/components/moodboard/NodeCard.svelte` — for displaying nodes in gallery/list
- [x] Wire up CRUD operations in moodboard editor page

**Verification:**
- [ ] Can create nodes at root and nested levels
- [ ] Delete container prompts for children handling
- [ ] Move node updates parent_id correctly

---

## Checkpoint 2: Canvas Editor (CP-02)

### T-007: Install and configure Svelte Flow
**Satisfies:** CAP-03
**Dependencies:** T-005
**Size:** S

- [ ] Install `@xyflow/svelte` package
- [ ] Create `src/lib/components/moodboard/MoodboardCanvas.svelte` wrapper
- [ ] Configure:
  - Background: dots
  - Controls: zoom buttons
  - Disable edge creation (v1.0 scope)
- [ ] Add placeholder for custom node types

**Verification:**
- [ ] Canvas renders with zoom/pan working
- [ ] No edge creation UI visible
- [ ] Touch gestures work (swipe pan, pinch zoom)

---

### T-008: Create base MoodboardNode component
**Satisfies:** CAP-03
**Dependencies:** T-007
**Size:** M

- [ ] Create `src/lib/components/moodboard/nodes/MoodboardNode.svelte`
- [ ] Accept `node_type` prop and render appropriate content
- [ ] Common card structure: header (badge), content area, footer (tags)
- [ ] Drag handle for repositioning
- [ ] Click handler for selection/detail view
- [ ] Context menu (right-click/long-press): Edit, Delete, Duplicate

**Verification:**
- [ ] Node renders correctly on canvas
- [ ] Drag updates position
- [ ] Context menu shows actions

---

### T-008.5: Create canvas context menu
**Satisfies:** CAP-03 (Canvas Editor - Interaction Patterns)
**Dependencies:** T-008
**Size:** S

- [ ] Create `src/lib/components/moodboard/CanvasContextMenu.svelte`
- [ ] Show on right-click/long-press on canvas (not on nodes)
- [ ] Menu items:
  - "Add Node" → Opens submenu with all card types
  - "Paste" (if clipboard has copied node)
  - "Reset Zoom" → Reset to 100%
  - "Fit to View" → Zoom to show all nodes
- [ ] Clicking card type opens AddNodeModal with cursor position
- [ ] Handle mobile long-press (300-500ms delay)
- [ ] Close menu on click outside or ESC key

**Verification:**
- [ ] Right-click canvas opens menu at cursor
- [ ] Selecting card type opens modal with position preserved
- [ ] Long-press on mobile (not on node) opens menu
- [ ] Menu closes properly on blur/escape

---

### T-009: Implement drill-in navigation for containers
**Satisfies:** CAP-02, CAP-03
**Dependencies:** T-008
**Size:** M

- [ ] Container nodes show visual indicator (icon, "Click to open →")
- [ ] Click container → update URL with `?parent=[node_id]`
- [ ] Load children of clicked container
- [ ] Show breadcrumb: `Moodboard > Character > Option`
- [ ] Breadcrumb click → navigate up levels
- [ ] Animate transition between levels

**Verification:**
- [ ] Clicking Character card shows its children
- [ ] Breadcrumb displays correct path
- [ ] Can navigate back via breadcrumb

---

### T-010: Implement position persistence
**Satisfies:** CAP-03
**Dependencies:** T-006, T-008
**Size:** S

- [ ] On drag end → update `position_x`, `position_y` in database
- [ ] Debounce saves (300ms)
- [ ] On load → position nodes from database values
- [ ] Handle new nodes with no position (auto-layout or center)

**Verification:**
- [ ] Positions persist across page reloads
- [ ] Rapid dragging doesn't cause excessive saves
- [ ] New nodes appear at reasonable position

---

### T-011: Create ViewSwitcher component
**Satisfies:** CAP-03, CAP-05, CAP-06
**Dependencies:** T-005
**Size:** S

- [ ] Create `src/lib/components/moodboard/ViewSwitcher.svelte`
- [ ] Three options: Canvas, Gallery, List
- [ ] Store preference in localStorage per moodboard
- [ ] Emit view change event

**Verification:**
- [ ] Switcher renders with three options
- [ ] Preference persists across reloads
- [ ] Active view visually highlighted

---

## Checkpoint 3: Gallery & List Views (CP-03)

### T-012: Implement Gallery view (hierarchical)
**Satisfies:** CAP-05
**Dependencies:** T-003, T-011
**Size:** L

- [ ] Create `src/lib/components/moodboard/views/GalleryView.svelte`
- [ ] Masonry grid layout (CSS columns or library)
- [ ] Container cards show:
  - Icon + title
  - Thumbnail grid of first 4 children
  - Item count, budget subtotal
  - "Click to open →" indicator
- [ ] Leaf cards show content (image, note text, etc.)
- [ ] Click container → drill into gallery for that container
- [ ] Breadcrumb navigation
- [ ] Responsive: 1 col mobile → 2 tablet → 3-4 desktop

**Verification:**
- [ ] Grid displays all nodes at current level
- [ ] Container preview shows child thumbnails
- [ ] Drilling into container shows its children
- [ ] Layout responsive across breakpoints

---

### T-013: Implement List view (hierarchical tree)
**Satisfies:** CAP-06
**Dependencies:** T-003, T-011
**Size:** M

- [ ] Create `src/lib/components/moodboard/views/ListView.svelte`
- [ ] Tree structure with expand/collapse for containers
- [ ] Row shows: icon, title, tags, type badge, date
- [ ] Indentation for nested items
- [ ] Sortable by: date, type, title
- [ ] Checkbox selection for bulk actions
- [ ] Bulk action bar: Delete, Tag, Move

**Verification:**
- [ ] Tree renders with correct nesting
- [ ] Expand/collapse toggles children
- [ ] Sort controls reorder items
- [ ] Bulk selection enables action bar

---

### T-014: Integrate views into moodboard page
**Satisfies:** CAP-03, CAP-05, CAP-06
**Dependencies:** T-007, T-011, T-012, T-013
**Size:** M

- [ ] Add ViewSwitcher to moodboard page header
- [ ] Conditionally render Canvas/Gallery/List based on selection
- [ ] Pass current `parent_id` to all views
- [ ] Maintain filter state across view switches
- [ ] Add toolbar: Filter dropdown, Add button, Share button

**Verification:**
- [ ] Can switch between all three views
- [ ] Current level (parent_id) preserved on switch
- [ ] Toolbar actions work in all views

---

## Checkpoint 4: Card Types (CP-04)

### T-015: Implement container card types
**Satisfies:** CAP-02 (container types)
**Dependencies:** T-008
**Size:** M

- [ ] Create node components for containers:
  - `GroupNode.svelte` — 📁 Group/Stack
  - `CharacterNode.svelte` — 👤 Character
  - `OptionNode.svelte` — 🎭 Option/Variant
  - `PropNode.svelte` — 🔧 Prop
  - `MoodboardLinkNode.svelte` — 📋 Moodboard Link
- [ ] Each shows: icon, title, child count, budget subtotal (if applicable)
- [ ] Moodboard Link shows target moodboard preview

**Verification:**
- [ ] All container types render with correct icon
- [ ] Child count displays accurately
- [ ] Moodboard Link navigates to target board

---

### T-016: Implement reference card types
**Satisfies:** CAP-08 (URL capture)
**Dependencies:** T-008
**Size:** M

- [ ] Create/update node components:
  - `ImageNode.svelte` — 🖼️ Image (update existing ReferenceCard)
  - `SocialMediaNode.svelte` — 📱 Social Media with platform badge
  - `LinkNode.svelte` — 🔗 Generic link with metadata
  - `NoteNode.svelte` — 📝 Note with markdown
- [ ] Platform detection for social media URLs
- [ ] Platform badge display (Instagram, TikTok, etc.)

**Verification:**
- [ ] Instagram URL shows 📷 badge
- [ ] TikTok URL shows 🎵 badge
- [ ] Generic URL shows metadata preview

---

### T-017: Implement design card types
**Satisfies:** CAP-13 (Color Palette), CAP-14 (Measurements)
**Dependencies:** T-008
**Size:** M

- [ ] Create node components:
  - `ColorPaletteNode.svelte` — 🎨 Color swatches
  - `MeasurementsNode.svelte` — 📏 Body/garment measurements
- [ ] Color palette: max 12 colors, click to copy hex
- [ ] Measurements: labeled values with unit, date tracked

**Verification:**
- [ ] Color swatches display correctly
- [ ] Click swatch copies hex to clipboard
- [ ] Measurements show with labels and units

---

### T-018: Implement budget and contact card types
**Satisfies:** CAP-11 (Budget Item), CAP-12 (Contact)
**Dependencies:** T-008
**Size:** M

- [ ] Create node components:
  - `BudgetItemNode.svelte` — 💰 Cost with supplier link
  - `ContactNode.svelte` — 👤 Person with type badge
- [ ] Budget: name, cost, quantity, status, supplier link
- [ ] Contact: name, type (vendor/photographer/etc), primary contact

**Verification:**
- [ ] Budget item shows cost and status
- [ ] Contact shows type badge and info
- [ ] Supplier link navigates to contact

---

### T-019: Implement Fabric card type
**Satisfies:** CAP-15 (Fabric)
**Dependencies:** T-008
**Size:** S

- [ ] Create `FabricNode.svelte` — 🧵 Fabric swatch
- [ ] Display: swatch image, material type, stretch, weight, price/yard
- [ ] Link to supplier contact

**Verification:**
- [ ] Fabric card shows swatch and properties
- [ ] Supplier link works

---

### T-020: Create Add Card menu
**Satisfies:** All card types
**Dependencies:** T-015 through T-019
**Size:** M

- [ ] Create `src/lib/components/moodboard/AddCardMenu.svelte`
- [ ] Organize by category:
  - Quick Add: URL, Image, Note, Budget
  - Containers: Group, Character, Option, Prop, Moodboard Link
  - References: Image, Social Media, Link, Note
  - Design: Color Palette, Measurements
  - Materials: Fabric
  - People & Money: Contact, Budget Item
- [ ] Search filter for card types
- [ ] Create appropriate form for selected type

**Verification:**
- [ ] Menu shows all card types organized by category
- [ ] Search filters card types
- [ ] Selecting type opens correct creation form

---

## Checkpoint 5: Mobile Capture (CP-05)

### T-021: Configure PWA Share Target
**Satisfies:** CAP-09 (PWA Share Target)
**Dependencies:** T-003
**Size:** M

- [ ] Update `manifest.json` with `share_target` configuration:
  ```json
  "share_target": {
    "action": "/share",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
  ```
- [ ] Create route: `src/routes/share/+page.svelte`
- [ ] Parse shared URL/text from query params
- [ ] Show moodboard selector (recent first)
- [ ] Extract metadata and create node

**Verification:**
- [ ] (Manual) Share from Instagram on Android shows Cosplans
- [ ] Share target page loads with URL pre-filled
- [ ] Can select moodboard and confirm add

---

### T-022: Create share target UI
**Satisfies:** CAP-09
**Dependencies:** T-021
**Size:** S

- [ ] Moodboard selector with recent boards at top
- [ ] Metadata preview (thumbnail, title, author)
- [ ] Optional note field
- [ ] Cancel and Add buttons
- [ ] Success confirmation with "Open Moodboard" option

**Verification:**
- [ ] Recent moodboards shown first
- [ ] Preview displays extracted metadata
- [ ] Success shows confirmation

---

### T-023: Configure Capacitor share extension (iOS & Android)
**Satisfies:** CAP-10 (Native Share Extension)
**Dependencies:** T-021
**Size:** L

- [ ] Initialize Capacitor project (if not exists)
- [ ] Install share extension plugin
- [ ] Configure iOS share extension
- [ ] Configure Android share extension (in addition to PWA)
- [ ] Bridge shared data to web UI
- [ ] Match PWA share target behavior

**Verification:**
- [ ] (Manual) Share from Instagram on iOS shows Cosplans
- [ ] (Manual) Share from TikTok on Android shows Cosplans (native)
- [ ] Behavior matches PWA share target

---

### T-024: Implement offline capture queue
**Satisfies:** CAP-09 Edge Case (offline)
**Dependencies:** T-021, T-023
**Size:** M

- [ ] Queue shared items in IndexedDB when offline
- [ ] Show "pending sync" badge on queued items
- [ ] Sync automatically on reconnect
- [ ] Retry failed syncs (3 attempts with backoff)
- [ ] Show error state for permanent failures

**Verification:**
- [ ] Can capture URLs while offline
- [ ] Pending items visible with badge
- [ ] Items sync when back online
- [ ] Failed items show retry option

---

## Checkpoint 6: Integration (CP-06)

### T-025: Create MoodboardLitePreview component
**Satisfies:** CAP-04 (Lite Canvas Preview)
**Dependencies:** T-007
**Size:** M

- [ ] Create `src/lib/components/moodboard/MoodboardLitePreview.svelte`
- [ ] Accept `moodboard_id` and `height` props
- [ ] Load root-level nodes
- [ ] Render in constrained container with zoom-to-fit
- [ ] Enable pan/zoom for exploration
- [ ] Disable editing (view-only)
- [ ] "Open Full Moodboard" floating button

**Verification:**
- [ ] Preview renders in fixed-height container
- [ ] Nodes zoom-to-fit automatically
- [ ] Cannot drag or edit nodes
- [ ] Button opens full moodboard route

---

### T-026: Integrate lite preview into References Tab
**Satisfies:** CAP-04
**Dependencies:** T-025
**Size:** S

- [ ] Add MoodboardLitePreview to ReferencesTab
- [ ] Show below Gallery/List views
- [ ] Add "Open Full Moodboard" button to tab header
- [ ] Handle empty moodboard state

**Verification:**
- [ ] Preview visible in References Tab
- [ ] Button navigates to full moodboard
- [ ] Empty state shows appropriate message

---

### T-027: Implement Moodboard Navigation (Cmd+K)
**Satisfies:** CAP-07 (Moodboard Navigation & Search)
**Dependencies:** T-003
**Size:** L

- [ ] Create `src/lib/components/moodboard/MoodboardNavigation.svelte`
- [ ] Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows)
- [ ] Show command palette modal
- [ ] Display recent moodboards at top
- [ ] Show tree of accessible boards (Personal → Teams → Ideas)
- [ ] Search across moodboard titles and node contents
- [ ] Navigate on selection

**Verification:**
- [ ] Cmd+K opens navigation modal
- [ ] Recent boards shown first
- [ ] Search returns matching boards and nodes
- [ ] Selection navigates to correct board

---

### T-028: Implement Idea → Project conversion
**Satisfies:** CAP-17 (Idea → Project Conversion)
**Dependencies:** T-003, T-006
**Size:** L

- [ ] Create `src/lib/components/ideas/ConversionWizard.svelte`
- [ ] Step 1: Choose option (if multiple characters/variants)
- [ ] Step 2: Review moodboard and budget data
- [ ] Step 3: Enter project details (name, deadline, event)
- [ ] Step 4: Confirm
- [ ] Implement conversion service:
  - Create project with `source_idea_id`
  - Share moodboard (set project.moodboard_id = idea.moodboard_id) OR copy
  - Copy budget items to project

**Verification:**
- [ ] Wizard navigates through all steps
- [ ] Project created with correct references
- [ ] Moodboard shared or copied based on selection
- [ ] Budget items copied correctly

---

## Checkpoint 7: Sharing & Polish (CP-07)

### T-029: Create moodboard sharing service
**Satisfies:** CAP-16 (Moodboard Sharing)
**Dependencies:** T-003
**Size:** M

- [ ] Create `src/lib/api/services/moodboardShareService.ts`
- [ ] Generate unique share token (nanoid)
- [ ] CRUD for `moodboard_shares`:
  - `createShare(moodboard_id, options)`
  - `getShare(token)`
  - `revokeShare(share_id)`
- [ ] Privacy options: include_budget, include_contacts, allow_comments

**Verification:**
- [ ] Can create share with unique token
- [ ] Can revoke (deactivate) share
- [ ] Token lookup returns correct moodboard

---

### T-030: Create public share route
**Satisfies:** CAP-16
**Dependencies:** T-029
**Size:** M

- [ ] Create route: `src/routes/share/moodboard/[token]/+page.svelte`
- [ ] Load moodboard data without auth
- [ ] Respect privacy settings (hide budget/contacts if disabled)
- [ ] Render read-only Gallery view
- [ ] Show "Sign in to comment" prompt

**Verification:**
- [ ] Share URL loads without login
- [ ] Moodboard displays correctly
- [ ] Budget hidden if not included in share
- [ ] Cannot edit (read-only)

---

### T-031: Create ShareDialog component
**Satisfies:** CAP-16
**Dependencies:** T-029
**Size:** S

- [ ] Create `src/lib/components/moodboard/ShareDialog.svelte`
- [ ] Show/generate share link
- [ ] Copy link button with feedback
- [ ] Privacy toggles: budget, contacts, comments
- [ ] Active/revoked status indicator
- [ ] Stop Sharing button

**Verification:**
- [ ] Dialog shows current share status
- [ ] Copy button works
- [ ] Privacy toggles update share settings
- [ ] Revoke disables the link

---

### T-032: Implement OAuth commenting
**Satisfies:** CAP-16
**Dependencies:** T-030
**Size:** L

- [ ] Verify Supabase OAuth providers configured (Google, GitHub)
- [ ] Create comment input on public share page
- [ ] Trigger OAuth flow on comment attempt
- [ ] Store comment with OAuth user info (name, avatar, provider)
- [ ] Display comments with author info
- [ ] Notify moodboard owner of new comments

**Verification:**
- [ ] Can sign in with Google/GitHub on share page
- [ ] Comment saved with user info
- [ ] Comments display with name/avatar
- [ ] Owner receives notification

---

### T-033: Add E2E tests for critical flows
**Satisfies:** All verification steps
**Dependencies:** All implementation tasks
**Size:** L

- [ ] Test: Create moodboard, add nodes at multiple levels
- [ ] Test: Drill into container, add child, navigate back
- [ ] Test: Switch between Canvas/Gallery/List views
- [ ] Test: Share moodboard, view as unauthenticated user
- [ ] Test: PWA share target flow (simulated)
- [ ] Test: Idea → Project conversion

**Verification:**
- [ ] All E2E tests pass
- [ ] Critical paths covered

---

### T-034: Performance optimization
**Satisfies:** Edge cases (100+ items)
**Dependencies:** T-012, T-013, T-014
**Size:** M

- [ ] Virtualization for List view (large trees)
- [ ] Lazy load images in Gallery view
- [ ] Canvas viewport culling (Svelte Flow handles this)
- [ ] Paginate node queries (50 per page)
- [ ] Optimize recursive tree queries

**Verification:**
- [ ] 100+ nodes loads in <2s
- [ ] Smooth scrolling in List/Gallery
- [ ] Canvas remains responsive

---

### T-035: Accessibility audit
**Satisfies:** Design contract
**Dependencies:** All UI tasks
**Size:** M

- [ ] Keyboard navigation for all controls
- [ ] ARIA labels on canvas nodes
- [ ] Focus management in modals/dialogs
- [ ] Screen reader testing
- [ ] Touch targets ≥44px on mobile

**Verification:**
- [ ] Can navigate with keyboard only
- [ ] Screen reader announces content correctly
- [ ] No accessibility violations in audit

---

## Task Mapping to Capabilities

| Capability | Tasks |
|------------|-------|
| CAP-01: Moodboard Entity | T-001, T-003, T-004 |
| CAP-02: Hierarchical Nodes | T-002, T-006, T-009, T-015 |
| CAP-03: Canvas Editor | T-005, T-007, T-008, T-010, T-011, T-014 |
| CAP-04: Lite Preview | T-025, T-026 |
| CAP-05: Gallery View | T-012, T-014 |
| CAP-06: List View | T-013, T-014 |
| CAP-07: Navigation/Search | T-027 |
| CAP-08: URL Capture | T-016 |
| CAP-09: PWA Share Target | T-021, T-022, T-024 |
| CAP-10: Capacitor Extension | T-023 |
| CAP-11: Budget Item | T-018 |
| CAP-12: Contact | T-018 |
| CAP-13: Color Palette | T-017 |
| CAP-14: Measurements | T-017 |
| CAP-15: Fabric | T-019 |
| CAP-16: Sharing | T-029, T-030, T-031, T-032 |
| CAP-17: Conversion | T-028 |

---

## Checkpoint Summary

| Checkpoint | Tasks | Focus |
|------------|-------|-------|
| CP-01: Foundation | T-001 → T-006 | Database, service, routes |
| CP-02: Canvas Editor | T-007 → T-011 (6 tasks) | Svelte Flow, navigation, context menu |
| CP-03: Gallery & List | T-012 → T-014 | Alternative views |
| CP-04: Card Types | T-015 → T-020 | All 14 v1.0 card types |
| CP-05: Mobile Capture | T-021 → T-024 | Share targets, offline |
| CP-06: Integration | T-025 → T-028 | Lite preview, nav, conversion |
| CP-07: Sharing & Polish | T-029 → T-035 | Public sharing, tests, a11y |

---

## Critical Path

```
T-001 (moodboards table)
    ↓
T-002 (hierarchical nodes)
    ↓
T-003 (moodboardsService)
    ↓
T-005 (routes) ────────────────→ T-007 (Svelte Flow) → T-008 (node component)
    ↓                                   ↓
T-006 (node CRUD) ←─────────────────────┘
    ↓
T-009 (drill-in) → T-015 (containers) → T-020 (add menu)
```

**Start with:** T-001, T-002, T-003 (database foundation)
**Then:** T-005, T-007 (routes and canvas setup)
**Then:** T-008, T-009 (node rendering and navigation)

---

## Definition of Done

Each task is complete when:
1. Code implemented and compiles without errors
2. All verification steps pass
3. No TypeScript errors
4. Relevant unit/integration tests added
5. Manual testing confirms expected behavior
6. Code reviewed (if applicable)

---

*Generated from FEAT-006 spec v3.0 (SFS-v2). Tasks ordered by checkpoint and dependency.*
