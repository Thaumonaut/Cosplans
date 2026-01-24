# Implementation Plan: Enhanced Brainstorming & Moodboarding

**Branch**: `006-brainstorming-moodboard` | **Date**: 2026-01-08 | **Spec**: [spec.md](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/spec.md)
**Input**: Feature specification from `/specs/006-brainstorming-moodboard/spec.md`

---

## Summary

Add visual moodboard functionality to Ideas with an infinite canvas interface (Milanote + Obsidian hybrid), **PWA share target integration (day-one priority)**, multi-platform social media integration (Instagram, TikTok, Pinterest, YouTube, Facebook), **sketch tool for hand-drawn inspiration**, **piles for ADHD-friendly organization**, **multi-layered tab navigation** (All/Character/Variation), enhanced budget itemization with contact/vendor linking, multiple costume options per idea, and a wizard-driven idea→project conversion flow. Core technology is @xyflow/svelte for the canvas with 6 view modes (Canvas, Table, Timeline, Gallery, List, Graph).

**Design Philosophy**: Progressive disclosure - simple by default, scales to complexity

**Key Deliverables**:
1. **PWA with share target** for direct sharing from Instagram/TikTok
2. Svelte Flow canvas with custom node types (images, social media, notes, **sketches**, **piles**, budget items, contacts)
3. **Multi-layered tab navigation** (All → Character → Variation)
4. **Multi-character resource linking** for shared items
5. URL parsing service for social media metadata extraction
6. Multiple view modes with state persistence
7. Budget itemization with contact database
8. Idea options system for comparing approaches
9. Idea→Project conversion wizard with moodboard sharing
10. Public shareable moodboards with OAuth-authenticated commenting
11. **Obsidian-style mobile bottom toolbar** with tap-and-hold
12. **Contextual canvas controls** that auto-hide
13. **Quick capture flow** optimized for speed (<10 seconds)

---

## Technical Context

**Language/Version**: TypeScript 5.3+ with SvelteKit  
**Primary Dependencies**: 
- @xyflow/svelte (canvas)
- unfurl.js (URL parsing)
- @tanstack/svelte-table (table view)
- **Service Worker** (PWA offline support)
- **Web Share Target API** (PWA share integration)
- **Canvas API** (sketch tool drawing)

**Storage**: Supabase PostgreSQL + Supabase Storage (R2)  
**Testing**: Playwright E2E, Bun unit tests  
**Target Platform**: **Progressive Web App (PWA)** - Desktop + Mobile browsers, installable  
**Project Type**: Web application (existing SvelteKit monolith) with PWA manifest  
**Performance Goals**: 
- 60fps canvas pan/zoom
- <2s initial load
- Support 50-200 nodes
- **<10 seconds quick capture flow**
- **Offline-capable** (service worker)

**Constraints**: No new paid services; use existing Supabase/Cloudflare infrastructure  
**Scale/Scope**: Team-scoped moodboards, ~100 items average per board

---

## Constitution Check

*GATE: Verified before Phase 0 research. Will re-check after Phase 1 design.*

- [x] **Project-Centric**: Moodboards attach to Ideas (which convert to Projects) ✓
- [x] **Team-Based**: Ideas are team-scoped; moodboard nodes inherit team access ✓
- [x] **Feature Scope**: Moodboards listed in MVP Core (Resources domain) ✓
- [x] **Complete Workflow**: Supports Ideation & Planning phase ✓
- [x] **MVP First**: Phased approach - canvas first, then views, then sharing ✓
- [x] **Test-First**: E2E tests planned before implementation ✓
- [x] **Modular**: Fits in Resources domain (Gallery, Characters, Moodboards) ✓
- [x] **Cost-Conscious**: Uses existing Supabase + Cloudflare infrastructure ✓
- [x] **Future-Ready**: Data model supports future collaboration/AI features ✓
- [x] **Data Privacy**: RLS policies defined in data-model.md ✓
- [x] **Tech Stack**: SvelteKit + Supabase + Tailwind ✓
- [x] **Navigation**: Moodboard as sub-route of Ideas (/ideas/[id]/moodboard) ✓

**Feature Phase**: MVP Core (Resources → Moodboards)

**Violations**: None

---

## Project Structure

### Documentation (this feature)

```text
specs/006-brainstorming-moodboard/
├── spec.md               # Feature specification (complete)
├── plan/
│   ├── plan.md           # This file
│   ├── research.md       # Phase 0 output (complete)
│   ├── data-model.md     # Phase 1 output (complete)
│   └── quickstart.md     # Phase 1 output (complete)
├── contracts/
│   └── moodboard-api.yaml  # OpenAPI spec (complete)
└── tasks.md              # Phase 2 output (run /speckit.tasks)
```

### Source Code

```text
src/lib/
├── components/
│   └── moodboard/               # NEW: Moodboard UI components
│       ├── MoodboardCanvas.svelte
│       ├── nodes/
│       │   ├── ImageNode.svelte
│       │   ├── SocialMediaNode.svelte
│       │   ├── TextNode.svelte
│       │   ├── SketchNode.svelte        # NEW: Sketch nodes
│       │   ├── PileNode.svelte          # NEW: Expandable piles
│       │   ├── BudgetItemNode.svelte
│       │   └── ContactNode.svelte
│       ├── CustomEdge.svelte
│       ├── ContextualControls.svelte    # NEW: Auto-hide controls
│       ├── CharacterTabBar.svelte       # NEW: Multi-layered tabs
│       ├── VariationTabBar.svelte       # NEW: Nested variation tabs
│       ├── MobileBottomToolbar.svelte   # NEW: Obsidian-style toolbar
│       ├── ViewSwitcher.svelte
│       ├── MoodboardTableView.svelte
│       ├── MoodboardTimelineView.svelte
│       ├── MoodboardGalleryView.svelte
│       ├── MoodboardListView.svelte
│       ├── MoodboardGraphView.svelte
│       ├── AddContentModal.svelte       # Or QuickAddMenu.svelte
│       ├── QuickAddMenu.svelte          # NEW: Quick capture
│       ├── SketchDrawingModal.svelte    # NEW: Sketch tool
│       ├── NodeEditDrawer.svelte        # NEW: Drawer instead of modal
│       ├── InlineCommentThread.svelte   # NEW: Per-node comments
│       ├── CommentsOverview.svelte      # NEW: All comments panel
│       └── TagFilter.svelte
│   ├── ideas/
│   │   ├── IdeaConversionWizard.svelte  # NEW
│   │   └── OptionManager.svelte         # NEW
│   └── PWAInstallPrompt.svelte          # NEW: PWA install UI
│
├── api/services/
│   ├── moodboardService.ts      # NEW: CRUD for nodes/edges (with piles, character filtering)
│   ├── urlParserService.ts      # NEW: URL metadata extraction
│   ├── contactService.ts        # NEW: Contact management
│   ├── budgetItemService.ts     # NEW: Budget itemization
│   ├── characterLinkService.ts  # NEW: Multi-character resource linking
│   ├── tabStateService.ts       # NEW: Tab navigation state persistence
│   └── ideaService.ts           # MODIFY: Add options support
│
├── stores/
│   └── moodboard.ts             # NEW: Canvas state stores
│
└── types/
    └── moodboard.ts             # NEW: TypeScript types

src/routes/(auth)/
└── ideas/
    └── [id]/
        └── moodboard/
            └── +page.svelte     # NEW: Moodboard page

src/routes/share/
└── moodboard/
    └── [token]/
        └── +page.svelte         # NEW: Public share view

src/routes/share-target/
└── +page.svelte                 # NEW: PWA share target handler

static/
├── manifest.json                # NEW: PWA manifest with share_target
├── sw.js                        # NEW: Service worker for offline
└── icons/
    ├── icon-192.png             # NEW: PWA icons
    └── icon-512.png             # NEW: PWA icons

supabase/migrations/
├── 20260108000100_create_moodboard_nodes.sql
├── 20260108000110_create_moodboard_edges.sql
├── 20260108000120_create_idea_options.sql
├── 20260108000130_create_budget_items.sql
├── 20260108000140_create_contacts.sql
├── 20260108000150_create_moodboard_shares.sql
├── 20260108000160_create_moodboard_comments.sql
├── 20260108000170_create_tutorials.sql
└── 20260108000180_modify_ideas_projects.sql

tests/
├── e2e/
│   └── moodboard/               # NEW: E2E tests
│       ├── canvas-basic.spec.ts
│       ├── social-media.spec.ts
│       ├── budget-items.spec.ts
│       └── idea-conversion.spec.ts
└── unit/
    └── urlParser.test.ts        # NEW: URL parsing tests
```

**Structure Decision**: Single SvelteKit application (existing monolith pattern). Moodboard components in dedicated directory under `/lib/components/moodboard/`. Service layer follows existing pattern (`ideaService.ts`, `taskService.ts`).

---

## Phased Implementation

### Phase 1: Foundation (MVP Canvas)

**Objective**: Basic moodboard canvas with image nodes and URL parsing.

| Component | Description | Priority |
|-----------|-------------|----------|
| Database migrations | Create 8 new tables + modify 2 | P0 |
| @xyflow/svelte setup | Install and configure canvas | P0 |
| MoodboardCanvas.svelte | Base canvas wrapper | P0 |
| ImageNode.svelte | Image display node | P0 |
| SocialMediaNode.svelte | Social media embed node | P0 |
| urlParserService.ts | URL metadata extraction | P0 |
| moodboardService.ts | CRUD operations | P0 |
| /ideas/[id]/moodboard route | Page routing | P0 |
| Basic E2E tests | Canvas interaction tests | P0 |

### Phase 2: Core Features

**Objective**: Complete node types, budget integration, options system.

| Component | Description | Priority |
|-----------|-------------|----------|
| TextNode.svelte | Rich text notes | P1 |
| BudgetItemNode.svelte | Budget item cards | P1 |
| ContactNode.svelte | Contact/vendor cards | P1 |
| budgetItemService.ts | Budget CRUD | P1 |
| contactService.ts | Contact CRUD | P1 |
| OptionManager.svelte | Manage idea options | P1 |
| Edge connections | Node linking with labels | P1 |
| Tag system | Node tagging and filtering | P1 |

### Phase 3: View Modes

**Objective**: Multiple ways to view moodboard data.

| Component | Description | Priority |
|-----------|-------------|----------|
| ViewSwitcher.svelte | View mode toolbar | P1 |
| MoodboardGalleryView | Pinterest-style grid | P1 |
| MoodboardTableView | Sortable/filterable table | P2 |
| MoodboardListView | Compact list | P2 |
| MoodboardTimelineView | Chronological layout | P2 |
| MoodboardGraphView | Network visualization | P2 |
| View state persistence | Remember user preferences | P2 |

### Phase 4: Polish & Sharing

**Objective**: Wizard flow and public sharing.

| Component | Description | Priority |
|-----------|-------------|----------|
| IdeaConversionWizard | Multi-step wizard UI | P2 |
| ShareMoodboard.svelte | Sharing controls | P2 |
| /share/moodboard/[token] route | Public view | P2 |
| OAuth comment flow | Google/GitHub sign-in | P2 |
| Mobile touch optimization | Gesture refinements | P2 |

---

## Key Technical Decisions

### 1. Canvas Library: @xyflow/svelte

Selected for native Svelte 5 support, DOM-based rendering (critical for iframes), and built-in zoom/pan/minimap. See [research.md](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/plan/research.md#1-infinite-canvas-library-selection).

### 2. URL Parsing: Server-Side with unfurl.js

URL parsing must happen server-side (CORS restrictions). SvelteKit server endpoint will call unfurl.js and return normalized metadata. See [research.md](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/plan/research.md#2-url-metadata-extraction).

### 3. Moodboard Sharing Model

Ideas own moodboards. Projects reference the same moodboard via `source_idea_id`. This avoids data duplication and keeps the planning context linked. See [data-model.md](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/plan/data-model.md).

### 4. Budget Dual Representation

Budget items exist in dedicated table (source of truth) AND can optionally appear as canvas nodes. Sync via `linked_node_id` field. See spec clarifications.

---

## Verification Plan

### Automated Tests

#### 1. E2E Tests (Playwright)

**Test File**: `tests/e2e/moodboard/canvas-basic.spec.ts`

```bash
# Run moodboard E2E tests
bunx playwright test tests/e2e/moodboard/ --project=chromium
```

**Test Cases**:
- Navigate to moodboard page for an idea
- Add image node via upload
- Add social media node via URL paste
- Drag node to new position
- Create connection between nodes
- Delete node
- Zoom and pan canvas
- Switch between view modes

#### 2. Unit Tests (Bun)

**Test File**: `tests/unit/urlParser.test.ts`

```bash
# Run URL parser unit tests
bun test tests/unit/urlParser.test.ts
```

**Test Cases**:
- Parse Instagram URL → extract thumbnail, author
- Parse YouTube URL → extract thumbnail, title
- Parse invalid URL → graceful fallback
- Parse private content URL → error handling

#### 3. Integration Tests

**Location**: `tests/integration/moodboard/`

```bash
# Run integration tests
bun test tests/integration/
```

**Test Cases**:
- moodboardService.createNode persists to database
- moodboardService.getNodes respects RLS policies
- Budget item sync with canvas node

### Manual Verification

> [!IMPORTANT]
> **Test Database Required**: E2E tests require `.env.test` configured with test Supabase credentials. See `docs/TEST_ENVIRONMENT_SETUP.md`.

#### Manual Test 1: Canvas Interaction

1. Login to the app as test user
2. Navigate to Ideas page
3. Create or select an existing idea
4. Click "Moodboard" button to open moodboard
5. **Expected**: Empty canvas with controls (zoom, minimap)
6. Paste an Instagram URL using keyboard shortcut or button
7. **Expected**: Node appears with thumbnail and metadata
8. Drag node to reposition
9. **Expected**: Node stays at new position after page reload

#### Manual Test 2: Mobile Touch

1. Open app on mobile device or Chrome DevTools mobile emulation
2. Navigate to an idea's moodboard
3. Pinch to zoom
4. **Expected**: Smooth zoom without page scrolling
5. Pan with one finger
6. **Expected**: Canvas moves, not page scroll

#### Manual Test 3: Idea Conversion

1. Create idea with moodboard nodes and budget items
2. Click "Start Planning" button
3. **Expected**: Wizard opens with option selection (if multiple)
4. Complete wizard steps
5. **Expected**: Project created with reference to idea's moodboard
6. Open project, click "View Moodboard"
7. **Expected**: Same moodboard content visible (shared, not copied)

---

## Dependencies

### New NPM Packages

```bash
bun add @xyflow/svelte
bun add unfurl.js
bun add @tanstack/svelte-table
```

### External APIs

None for MVP (using generic metadata extraction). Official platform APIs deferred to Phase 2 enhancement.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Social media embed restrictions | Medium | Medium | Graceful fallback to thumbnails |
| Canvas performance on mobile | Medium | High | Virtualization, lazy loading |
| OAuth complexity for comments | Low | Medium | Use existing Supabase Auth |
| Migration conflicts | Low | High | Sequential migration numbering |

---

## Related Artifacts

- [spec.md](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/spec.md) - Full feature specification
- [research.md](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/plan/research.md) - Technical research findings
- [data-model.md](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/plan/data-model.md) - Database schema
- [quickstart.md](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/plan/quickstart.md) - Implementation guide
- [moodboard-api.yaml](file:///home/jek/Documents/projects/Cosplans/specs/006-brainstorming-moodboard/contracts/moodboard-api.yaml) - API contract

---

**Status**: ✅ Planning complete - Ready for `/speckit.tasks`
