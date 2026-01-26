# FEAT-006: Brainstorming & Moodboard

> **Status:** Approved
> **Version:** 3.0 (SFS-v2 Format — Revised Architecture)
> **Branch:** `006-brainstorming-moodboard`
> **Priority:** P1 — Core Differentiator (v1.0)
> **Last Updated:** 2026-01-21

---

## Goal

Transform the Idea phase from simple text notes into a rich visual inspiration workspace with hierarchical moodboards, social media integration, and budget planning — enabling users to gather, organize, and compare inspiration before committing to a project.

**Why this matters:** This is the core differentiator. Most tools begin at project creation. We start at the idea — gathering inspiration, researching materials, comparing prices, deciding if an idea is even worth pursuing.

---

## Dependencies

**Depends On:**
- `architecture.contract.md` — Team-scoped data model
- `design.contract.md` — Flowbite component system, mobile-first patterns
- `security.contract.md` — RLS policies, OAuth patterns
- `@xyflow/svelte` — Canvas library (to be installed)
- Supabase Storage — Image/thumbnail storage

**Provides:**
- `moodboards` table — First-class moodboard entity
- `moodboard_nodes` table — Hierarchical node storage with tree structure
- `MoodboardCanvas` component — Full-screen infinite canvas editor
- `MoodboardLitePreview` component — View-only embedded preview
- `moodboardService` — CRUD operations for moodboard data
- Share Target PWA configuration — Mobile capture capability
- Moodboard navigation/search — Quick access to any board

---

## User Story

**As a** cosplayer browsing Instagram/TikTok  
**I want to** capture inspiration directly into moodboards without switching apps  
**So that** I can organize my ideas visually and decide what to build

---

## Architecture Overview

### Moodboard Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PERSONAL MOODBOARD                                │
│                      (User's "General" / Home Board)                        │
│  Contains: Team board links, Idea board links, loose notes for later       │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TEAM MOODBOARD                                   │
│                    (Shared resources for the team)                          │
│  Contains: Idea boards, Project boards, shared contacts/vendors, team refs │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IDEA/PROJECT MOODBOARD                              │
│                    (Specific to one cosplay idea)                           │
│  Contains: Characters, Props, Options, references, budget items            │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CHARACTER SUB-BOARD                                 │
│  Contains: Options (variants), references, notes, budget for character     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Moodboard Ownership

| Type | Owner | Purpose |
|------|-------|---------|
| **Personal** | User | General inbox, links to all boards, loose items |
| **Team** | Team | Shared team resources, links to idea/project boards |
| **Idea** | Team (via Idea) | Specific cosplay planning |
| **Project** | Team (via Project) | Active build (often shares Idea's board) |

### Routes

```
/moodboard                    → Personal moodboard (user's home)
/moodboard/[id]               → Any specific moodboard (full editor)
/teams/[id]/moodboard         → Team's shared moodboard
/ideas/[id]/moodboard         → Idea's moodboard
/projects/[id]/moodboard      → Project's moodboard
```

### Views

| Location | View Type | Interactivity |
|----------|-----------|---------------|
| `/moodboard/[id]` | Full Canvas, Gallery, List | Full editing |
| Idea/Project Detail Flyout | Gallery, List + Lite Canvas Preview | View-only, "Open Moodboard" button |
| References Tab | Gallery, List | Add/delete, links to full moodboard |

---

## Card Types

### v1.0 Card Types (14 total)

#### Containers (5)
| Card Type | Icon | Description |
|-----------|------|-------------|
| **Group/Stack** | 📁 | Generic grouping (wig options, fabric swatches) |
| **Character** | 👤 | Character being cosplayed |
| **Option/Variant** | 🎭 | Variant of character (Base Goku vs SSJ Goku) |
| **Prop** | 🔧 | Prop with sub-items (blueprints, materials) |
| **Moodboard Link** | 📋 | Portal to another moodboard |

#### References (4)
| Card Type | Icon | Description |
|-----------|------|-------------|
| **Image** | 🖼️ | Uploaded image |
| **Social Media** | 📱 | Instagram/TikTok/YouTube/Pinterest (auto-detected) |
| **Link** | 🔗 | Generic URL with metadata |
| **Note** | 📝 | Text note with markdown |

#### Design (2)
| Card Type | Icon | Description |
|-----------|------|-------------|
| **Color Palette** | 🎨 | Color swatch collection |
| **Measurements** | 📏 | Body or garment measurements |

#### Materials (1)
| Card Type | Icon | Description |
|-----------|------|-------------|
| **Fabric** | 🧵 | Fabric swatch with properties |

#### People & Money (2)
| Card Type | Icon | Description |
|-----------|------|-------------|
| **Contact** | 👤 | Person (commissioner, photographer, vendor) |
| **Budget Item** | 💰 | Cost estimate with supplier link |

### v1.5 Card Types
- Shot List, Checklist, Location, Video, Pattern, Outfit, Purchase, Vendor, Material

### v2.0+ Card Types (Auto Cards — require edges)
- Auto Budget, Auto Palette, Auto Materials, Auto Comparison

### Platform-Specific URL Detection

| Platform | Detection Pattern | Display |
|----------|-------------------|---------|
| Instagram | `instagram.com/p/`, `/reel/` | 📷 badge, embed |
| TikTok | `tiktok.com/@`, `vm.tiktok.com` | 🎵 badge, embed |
| YouTube | `youtube.com/watch`, `youtu.be` | ▶️ badge, embed |
| Pinterest | `pinterest.com/pin/` | 📌 badge, image |
| Twitter/X | `twitter.com`, `x.com` | 🐦 badge, embed |
| Etsy | `etsy.com/listing` | 🛒 badge, product + price |
| Amazon | `amazon.com/dp/` | 📦 badge, product + price |
| Arda Wigs | `ardawigs.com` | 💇 badge, wig + price |
| Generic | Any other URL | 🔗 link with metadata |

---

## Capabilities

### CAP-01 — Moodboard as First-Class Entity

**Goal:** Moodboards are standalone entities that Ideas, Projects, Teams, and Users can reference.

**Inputs:**
- `owner_type: 'user' | 'team' | 'idea' | 'project'`
- `owner_id: UUID`
- `title: string`

**Processing:**
1. Create `moodboards` record with owner reference
2. Auto-create personal moodboard on user signup
3. Auto-create team moodboard on team creation
4. Auto-create idea moodboard on idea creation
5. Project can share idea's moodboard or have its own

**Outputs:**
- Moodboard record with unique ID
- Accessible via dedicated route

**State & Data:**
- Reads: None
- Writes: `moodboards`
- Persistence: Supabase

**Edge Cases & Failure Modes:**
- Delete owner → Moodboard orphaned or deleted (cascade TBD)
- Multiple projects share same moodboard → All see same content

**Security Considerations:**
- Personal moodboard: Only owner can view/edit
- Team moodboard: Team members can view/edit
- Idea/Project moodboard: Inherits from team permissions

**Verification Steps:**
- Unit: Moodboard creates with correct owner
- Integration: Auto-creation triggers work
- E2E: User signs up, personal moodboard exists

---

### CAP-02 — Hierarchical Node Structure

**Goal:** Nodes form a tree structure with containers that can be drilled into.

**Inputs:**
- `moodboard_id: UUID`
- `parent_id: UUID | null` — Parent node (null = root level)
- `node_type: string` — Card type
- `container_type: string | null` — Container subtype if applicable

**Processing:**
1. Create node with parent reference
2. Containers (Group, Character, Option, Prop) can have children
3. Leaf nodes (Image, Note, etc.) cannot have children
4. Moodboard Link nodes reference another moodboard

**Outputs:**
- Tree structure of nodes
- Breadcrumb navigation path

**State & Data:**
- Reads: `moodboard_nodes` (tree query)
- Writes: `moodboard_nodes`
- Persistence: Supabase with recursive CTE queries

**Edge Cases & Failure Modes:**
- Deep nesting (10+ levels) → Performance acceptable, may limit in UI
- Delete container with children → Prompt: delete children or move to parent
- Circular reference via Moodboard Link → Allowed (user navigates between boards)

**Security Considerations:**
- RLS on nodes inherits from moodboard permissions

**Verification Steps:**
- Unit: Tree structure queries return correct hierarchy
- Integration: Creating child node sets parent_id correctly
- E2E: User creates Character, adds items inside, drills in/out

---

### CAP-03 — Full-Screen Canvas Editor

**Goal:** Dedicated route for full moodboard editing with infinite canvas.

**Inputs:**
- `moodboard_id: UUID`
- `parent_node_id: UUID | null` — Which container we're viewing inside

**Processing:**
1. Load nodes for moodboard at specified level (parent_id = X)
2. Initialize Svelte Flow canvas with node positions
3. Render custom node components based on type
4. Container nodes show as cards; click → drill into sub-canvas
5. Breadcrumb shows path: `Moodboard > Character > Option`
6. Enable zoom/pan, drag to reposition
7. Debounce position saves (300ms)

**Outputs:**
- Full-screen canvas with positioned nodes
- Breadcrumb navigation
- View switcher (Canvas, Gallery, List)

**State & Data:**
- Reads: `moodboard_nodes` (filtered by parent_id)
- Writes: `moodboard_nodes.position_x`, `position_y`
- Persistence: Supabase (positions), localStorage (viewport, view preference)

**Edge Cases & Failure Modes:**
- Empty level → Template-based empty state with demo cards
- 100+ nodes at one level → Performance acceptable
- Navigate up while editing → Unsaved changes prompt

**Security Considerations:**
- Route requires authentication
- Moodboard access checked on load

**Design & UX Notes:**
- Default view: Canvas
- Background: Subtle dots
- Touch: Swipe pan, pinch zoom, tap-hold drag
- Click container → drill in with animation
- Breadcrumb click → navigate up
- **Right-click canvas (empty space) → Context menu:**
  - Add Node → submenu with card types
  - Paste (if clipboard has copied node)
  - Reset Zoom / Fit to View
- **Right-click node → Node actions:** Edit, Duplicate, Delete (existing)
- **Mobile:** Long-press canvas opens same context menu
- **Quick add:** Double-click canvas opens Add Node modal at cursor position

**Verification Steps:**
- Unit: Canvas loads correct nodes for parent_id
- Integration: Position changes persist
- E2E: User drills into Character, adds node, navigates back

---

### CAP-04 — Lite Canvas Preview (Flyout/Detail)

**Goal:** View-only canvas preview in flyouts and detail pages.

**Inputs:**
- `moodboard_id: UUID`
- `height: number` — Container height (e.g., 300px)

**Processing:**
1. Load root-level nodes for moodboard
2. Render in constrained container with zoom-to-fit
3. Pan and zoom enabled for exploration
4. Click node → open detail drawer (read-only)
5. No drag-to-reposition, no add/delete

**Outputs:**
- Embedded canvas preview
- "Open Full Moodboard" button

**State & Data:**
- Reads: `moodboard_nodes`
- Writes: None (view-only)

**Edge Cases & Failure Modes:**
- Many nodes → Zoom out to fit, may be small
- Empty moodboard → Show placeholder with "Open Moodboard" CTA

**Design & UX Notes:**
- Fixed height container
- Floating "Open Moodboard" button
- Shows alongside Gallery/List in References Tab

**Verification Steps:**
- Unit: Preview renders at correct zoom level
- E2E: User sees preview in flyout, clicks to open full editor

---

### CAP-05 — Gallery View (Hierarchical)

**Goal:** Pinterest-style masonry grid showing containers as drillable cards.

**Inputs:**
- `moodboard_id: UUID`
- `parent_node_id: UUID | null`
- `filter_type: NodeType | null`

**Processing:**
1. Load nodes at current level
2. Container cards show thumbnail grid of children + count
3. Leaf cards show content (image, note text, etc.)
4. Click container → drill into that container's gallery
5. Breadcrumb navigation

**Outputs:**
- Masonry grid with mixed containers and leaves
- Container cards show: icon, title, child preview grid, item count, budget subtotal
- Leaf cards show: content, tags, platform badge

**State & Data:**
- Reads: `moodboard_nodes` with child counts
- Writes: None in gallery (editing via detail drawer)

**Edge Cases & Failure Modes:**
- Container with 50+ children → Show first 4 in preview, "+46 more"
- Mixed content types → All render in same grid

**Design & UX Notes:**
- Columns: 1 (mobile) → 2 (tablet) → 3-4 (desktop)
- Hover reveals quick actions
- Container cards visually distinct (border, icon)

**Verification Steps:**
- Unit: Container preview shows correct child count
- E2E: User clicks Character card, sees that character's items

---

### CAP-06 — List View (Hierarchical)

**Goal:** Compact tree-style list with expand/collapse.

**Inputs:**
- `moodboard_id: UUID`
- `parent_node_id: UUID | null`
- `sort_by: 'date' | 'type' | 'title'`

**Processing:**
1. Load nodes as tree structure
2. Render expandable rows for containers
3. Leaf rows show: icon, title, tags, type, date
4. Bulk selection for operations

**Outputs:**
- Tree list with expand/collapse
- Bulk action bar when items selected

**State & Data:**
- Reads: `moodboard_nodes`
- Writes: Bulk delete, bulk tag, bulk move

**Design & UX Notes:**
- Indent children under containers
- Expand/collapse toggles
- Mobile: Single column, swipe actions

**Verification Steps:**
- Unit: Tree renders with correct nesting
- E2E: User expands Character, sees nested items

---

### CAP-07 — Moodboard Navigation & Search

**Goal:** Quick access to any moodboard without drilling through hierarchy.

**Inputs:**
- `query: string` — Search term
- `user_id: UUID` — For access filtering

**Processing:**
1. Show command palette (Cmd+K)
2. Display recent moodboards
3. Show tree of accessible boards (Personal → Teams → Ideas)
4. Search across moodboard titles and node contents
5. Navigate directly to result

**Outputs:**
- Search results with breadcrumb paths
- Quick navigation to any accessible board

**State & Data:**
- Reads: `moodboards`, `moodboard_nodes` (search)
- Writes: Recent history to localStorage

**Design & UX Notes:**
- Cmd+K / Ctrl+K keyboard shortcut
- Recent boards at top
- Search matches boards and nodes within boards
- Result shows path: `Team > Idea > Character`

**Verification Steps:**
- Unit: Search returns matching boards and nodes
- E2E: User searches "goku", navigates directly to character

---

### CAP-08 — Social Media URL Capture

**Goal:** Extract metadata from social media URLs and create appropriate cards.

**Inputs:**
- `url: string` — URL to process
- `moodboard_id: UUID`
- `parent_id: UUID | null`

**Processing:**
1. Detect platform from URL pattern
2. Call metadata extraction API
3. Extract: thumbnail, title, author, description, price (if product)
4. Suggest card type (Social Media, or Budget Item for stores)
5. User confirms, node created

**Outputs:**
- New node with platform badge and metadata
- Auto-filled Budget Item for product URLs

**State & Data:**
- Writes: `moodboard_nodes`
- Persistence: Supabase, Supabase Storage (thumbnails)

**Edge Cases & Failure Modes:**
- Private post → Error message, no node created
- Product URL → Offer to create Budget Item with price pre-filled

**Verification Steps:**
- Unit: Platform detection for all supported sites
- E2E: User pastes Arda Wigs URL, Budget Item created with price

---

### CAP-09 — PWA Share Target (Android)

**Goal:** Capture content from Android share sheet.

**Inputs:**
- `shared_url: string`
- `shared_title: string | null`
- `shared_text: string | null`

**Processing:**
1. PWA intercepts share via Web Share Target API
2. Open share target page
3. User selects moodboard (recent shown first)
4. Preview extracted metadata
5. Confirm → create node

**Outputs:**
- New node in selected moodboard
- Success confirmation

**State & Data:**
- Remember last used moodboard in localStorage

**Verification Steps:**
- E2E: (Manual) Share from Instagram, node appears

---

### CAP-10 — Native Share Extension (Capacitor — iOS & Android)

**Goal:** Native share extensions for consistent experience on both platforms.

**Inputs:**
- Same as CAP-09, plus `shared_images: File[] | null`

**Processing:**
1. Native extension receives content
2. Opens Capacitor webview with share UI
3. Same flow as CAP-09

**Outputs:**
- Consistent experience across iOS and Android

**Design & UX Notes:**
- Android has both PWA and Capacitor; native app preferred when installed

**Verification Steps:**
- E2E: (Manual) Share from Instagram on both platforms

---

### CAP-11 — Budget Item with Supplier Link

**Goal:** Track costs with links to vendors.

**Inputs:**
- `name: string`
- `cost: number`
- `quantity: number`
- `supplier_id: UUID | null` — Link to Contact
- `product_url: string | null`
- `status: 'planned' | 'purchased'`

**Processing:**
1. Create Budget Item node
2. Link to Contact if supplier specified
3. Display in budget aggregations

**Outputs:**
- Budget node with cost display
- Aggregated totals at container level

**State & Data:**
- Links to Contact nodes

**Verification Steps:**
- E2E: User adds budget item, total updates in parent container

---

### CAP-12 — Contact Management

**Goal:** Track vendors, commissioners, photographers.

**Inputs:**
- `name: string`
- `type: 'vendor' | 'commissioner' | 'photographer' | 'other'`
- `email: string | null`
- `website: string | null`
- `social_links: string[]`

**Processing:**
1. Create Contact node
2. Can live in any moodboard (often Team level for sharing)
3. Linkable from Budget Items

**Outputs:**
- Contact card with type badge

**Verification Steps:**
- E2E: User creates contact, links to budget item

---

### CAP-13 — Color Palette

**Goal:** Capture and organize color swatches.

**Inputs:**
- `colors: Array<{hex: string, name?: string}>`
- `source_image: UUID | null` — Link to source image

**Processing:**
1. Create Color Palette node with swatch data
2. Display as color chips
3. Click to copy hex code

**Outputs:**
- Color palette card with visual swatches

**Design & UX Notes:**
- Max 10-12 colors per palette
- Click swatch → copy hex
- Future: Auto Palette extracts from linked image (v2.0)

**Verification Steps:**
- E2E: User creates palette, copies hex code

---

### CAP-14 — Measurements

**Goal:** Store body or garment measurements.

**Inputs:**
- `type: 'body' | 'garment' | 'prop'`
- `measurements: Record<string, number>` — e.g., `{bust: 36, waist: 28}`
- `unit: 'in' | 'cm'`
- `date: Date`

**Processing:**
1. Create Measurements node
2. Display as labeled values
3. Track date for body measurement changes

**Outputs:**
- Measurements card with labeled values

**Verification Steps:**
- E2E: User adds body measurements, values display correctly

---

### CAP-15 — Fabric Card

**Goal:** Track fabric swatches and properties.

**Inputs:**
- `name: string`
- `image: File | null`
- `material_type: string` — e.g., "Cotton", "Satin", "Spandex"
- `weight: string | null`
- `stretch: 'none' | '2-way' | '4-way'`
- `color: string`
- `supplier_id: UUID | null`
- `price_per_yard: number | null`

**Processing:**
1. Create Fabric node with properties
2. Upload swatch image to storage
3. Link to supplier Contact

**Outputs:**
- Fabric card with swatch and properties

**Verification Steps:**
- E2E: User adds fabric with image and properties

---

### CAP-16 — Moodboard Sharing

**Goal:** Share moodboards publicly with optional commenting.

**Inputs:**
- `moodboard_id: UUID`
- `include_budget: boolean`
- `include_contacts: boolean`
- `allow_comments: boolean`

**Processing:**
1. Generate share token
2. Create public route `/share/moodboard/[token]`
3. Render read-only view respecting privacy settings
4. OAuth login for comments if enabled

**Outputs:**
- Shareable URL
- Public read-only view
- Optional comment thread

**Security Considerations:**
- High-entropy tokens (nanoid)
- Budget/contact info hidden by default
- Comments require OAuth

**Verification Steps:**
- E2E: User shares, viewer sees content, can comment with OAuth

---

### CAP-17 — Idea → Project Conversion

**Goal:** Convert idea to project with shared or copied moodboard.

**Inputs:**
- `idea_id: UUID`
- `project_name: string`
- `share_moodboard: boolean` — Share vs copy
- `copy_budget: boolean`

**Processing:**
1. Create Project record
2. If share: Set project.moodboard_id = idea.moodboard_id
3. If copy: Clone moodboard and nodes
4. Copy budget items if selected

**Outputs:**
- New project with moodboard access
- Shared or independent moodboard

**Verification Steps:**
- E2E: User converts idea, project has moodboard access

---

## Data Model

### Tables

```sql
-- Moodboards as first-class entity
CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT CHECK (owner_type IN ('user', 'team', 'idea', 'project')),
  owner_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Nodes with tree structure
CREATE TABLE moodboard_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  
  -- Type
  node_type TEXT NOT NULL,  -- 'image', 'social_media', 'note', 'budget', 'contact', 'container', 'moodboard_link'
  container_type TEXT,  -- 'group', 'character', 'option', 'prop' (NULL for leaf nodes)
  
  -- Position (for canvas view)
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  width FLOAT,
  height FLOAT,
  
  -- Content
  title TEXT,
  content_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- For moodboard links
  linked_moodboard_id UUID REFERENCES moodboards(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Edges (v1.5 - connections between nodes)
CREATE TABLE moodboard_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
  source_node_id UUID REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  edge_type TEXT,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sharing
CREATE TABLE moodboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  include_budget BOOLEAN DEFAULT false,
  include_contacts BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);
```

---

## Checkpoints

### CP-01: Foundation
- Moodboard entity and ownership
- Node tree structure
- Basic CRUD operations

### CP-02: Canvas Editor
- Full-screen canvas with Svelte Flow
- Drill-in/out navigation
- Position persistence

### CP-03: Gallery & List Views
- Hierarchical gallery with container cards
- Tree-style list view
- View switching

### CP-04: Card Types
- All 14 v1.0 card types implemented
- Platform URL detection
- Card-specific forms and displays

### CP-05: Mobile Capture
- PWA Share Target
- Capacitor share extensions
- Offline queue

### CP-06: Integration
- References Tab with lite preview
- Moodboard navigation/search
- Idea → Project conversion

### CP-07: Sharing & Polish
- Public sharing with privacy controls
- E2E tests passing

---

## Future Features (Out of Scope for v1.0)

### v1.5
- Edge connections on canvas
- Shot List, Checklist, Location cards
- Coupon Tracker (separate feature)
- Time Tracking (linked to Tasks)

### v2.0+
- Auto Cards (Auto Budget, Auto Palette)
- WIP / Build Log with social sharing
- 3D Pose/Lighting reference tool

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Activation | 60% of signups create 1+ moodboard item in first session |
| Engagement | Average 5+ items per moodboard |
| Mobile capture | 25% of items added via share target |
| Hierarchy usage | 40% of users create at least one Character container |
| Cross-board navigation | Users visit 2+ moodboards per session |

---

## Related

- **Design Document:** `.cv/design/FEAT-006-design.md`
- **Tasks:** `.cv/tasks/FEAT-006.tasks.md`
- **Product Spec:** `.cv/spec.md`

---

*This feature is the v1.0 core differentiator. Moodboards are first-class entities with hierarchical structure, enabling visual organization from personal inbox to specific character variants.*
