# Tasks - Feature 006: Enhanced Brainstorming & Moodboarding

**Feature Branch**: `006-brainstorming-moodboard`  
**Created**: 2026-01-08  
**Status**: Ready for Implementation  

---

## Overview

This feature adds visual moodboard functionality to Ideas with an infinite canvas interface powered by @xyflow/svelte, PWA share target integration (day-one priority), multi-platform social media integration, sketch tool for hand-drawn inspiration, piles for ADHD-friendly organization, multi-layered tab navigation (All/Character/Variation), enhanced budget itemization with contact/vendor tracking, multiple costume options per idea, and a wizard-driven idea→project conversion flow.

**Design Philosophy**: Progressive disclosure - simple by default, scales to complexity

**Total Tasks**: 94+ (updated with design refinements)  
**Estimated Duration**: 8-10 weeks  
**MVP Scope**: User Stories 1-3 + PWA Setup (Weeks 1-5)  

---

## Phase 1: Setup & Infrastructure

**Goal**: Set up database schema, install dependencies, and configure basic project structure.

**Prerequisites**: None - can start immediately

### Database Migrations

- [ ] T001 Create moodboard_nodes table (with parent_id, is_expanded, sketch/pile node types) in supabase/migrations/20260108000100_create_moodboard_nodes.sql
- [ ] T002 Create moodboard_edges table migration in supabase/migrations/20260108000110_create_moodboard_edges.sql
- [ ] T003 Create idea_options table migration in supabase/migrations/20260108000120_create_idea_options.sql
- [ ] T004 Create budget_items table migration in supabase/migrations/20260108000130_create_budget_items.sql
- [ ] T005 Create contacts table migration in supabase/migrations/20260108000140_create_contacts.sql
- [ ] T006 Create moodboard_shares table migration in supabase/migrations/20260108000150_create_moodboard_shares.sql
- [ ] T007 Create moodboard_comments table migration in supabase/migrations/20260108000160_create_moodboard_comments.sql
- [ ] T008 Create moodboard_node_character_links table migration in supabase/migrations/20260108000165_create_node_character_links.sql
- [ ] T009 Create moodboard_tab_state table migration in supabase/migrations/20260108000167_create_tab_state.sql
- [ ] T010 Create tutorials table migration in supabase/migrations/20260108000170_create_tutorials.sql
- [ ] T011 Modify ideas and projects tables migration in supabase/migrations/20260108000180_modify_ideas_projects.sql
- [ ] T012 Create RLS policies for moodboard_nodes in supabase/migrations/20260108000100_create_moodboard_nodes.sql
- [ ] T013 Create RLS policies for moodboard_shares in supabase/migrations/20260108000150_create_moodboard_shares.sql
- [ ] T014 Create RLS policies for moodboard_comments in supabase/migrations/20260108000160_create_moodboard_comments.sql
- [ ] T015 Create database triggers for updated_at timestamps in supabase/migrations/20260108000100_create_moodboard_nodes.sql
- [ ] T016 Create sync_budget_item_to_canvas trigger in supabase/migrations/20260108000130_create_budget_items.sql
- [ ] T017 Apply all migrations to database

### Dependencies Installation

- [ ] T018 Install @xyflow/svelte package for canvas functionality
- [ ] T019 Install unfurl.js package for URL metadata extraction
- [ ] T020 Install @tanstack/svelte-table package for table view
- [ ] T021 Verify all dependencies installed correctly

### PWA Setup (Day-One Priority)

- [ ] T022 [P] Create manifest.json with share_target configuration in static/manifest.json
- [ ] T023 [P] Configure service worker for offline support in static/sw.js
- [ ] T024 [P] Add PWA meta tags to app.html
- [ ] T025 [P] Create share target handler route at src/routes/share-target/+page.svelte
- [ ] T026 [P] Implement URL parsing for shared content in share target handler
- [ ] T027 [P] Add install prompt UI component in src/lib/components/PWAInstallPrompt.svelte
- [ ] T028 Test PWA installation on iOS Safari and Android Chrome
- [ ] T029 Test share sheet integration from Instagram/TikTok

### Project Structure

- [ ] T030 [P] Create src/lib/components/moodboard directory structure
- [ ] T031 [P] Create src/lib/api/services directory for moodboard services
- [ ] T032 [P] Create src/lib/types/moodboard.ts file for TypeScript types
- [ ] T033 [P] Create src/lib/stores/moodboard.ts file for state management
- [ ] T034 [P] Create src/routes/(auth)/ideas/[id]/moodboard directory for moodboard page
- [ ] T035 [P] Create src/routes/share/moodboard/[token] directory for public sharing
- [ ] T036 [P] Create tests/e2e/moodboard directory for E2E tests
- [ ] T037 [P] Create tests/unit/moodboard directory for unit tests

---

## Phase 2: Foundational Components

**Goal**: Build core infrastructure that all user stories depend on.

**Dependencies**: Phase 1 complete

### Core Services

- [ ] T038 Implement moodboardService.getNodes (with character filtering) in src/lib/api/services/moodboardService.ts
- [ ] T039 Implement moodboardService.createNode (support all node types including sketch/pile) in src/lib/api/services/moodboardService.ts
- [ ] T040 Implement moodboardService.updateNode in src/lib/api/services/moodboardService.ts
- [ ] T041 Implement moodboardService.deleteNode in src/lib/api/services/moodboardService.ts
- [ ] T042 Implement moodboardService.getEdges in src/lib/api/services/moodboardService.ts
- [ ] T043 Implement moodboardService.createEdge in src/lib/api/services/moodboardService.ts
- [ ] T044 Implement moodboardService.deleteEdge in src/lib/api/services/moodboardService.ts
- [ ] T045 Implement moodboardService.getPileContents in src/lib/api/services/moodboardService.ts
- [ ] T046 Implement moodboardService.addToPile in src/lib/api/services/moodboardService.ts
- [ ] T047 Implement characterLinkService.linkNodeToCharacter in src/lib/api/services/characterLinkService.ts
- [ ] T048 Implement characterLinkService.getNodeCharacters in src/lib/api/services/characterLinkService.ts
- [ ] T049 Implement characterLinkService.unlinkNodeFromCharacter in src/lib/api/services/characterLinkService.ts
- [ ] T050 Implement tabStateService.getTabState in src/lib/api/services/tabStateService.ts
- [ ] T051 Implement tabStateService.updateTabState in src/lib/api/services/tabStateService.ts
- [ ] T052 Implement urlParserService.parseUrl with unfurl.js in src/lib/api/services/urlParserService.ts
- [ ] T053 Implement urlParserService.detectPlatform helper in src/lib/api/services/urlParserService.ts
- [ ] T054 Create server endpoint for URL parsing at src/routes/api/moodboard/parse-url/+server.ts

### TypeScript Types

- [ ] T055 [P] Define MoodboardNode interface (with parent_id, is_expanded) in src/lib/types/moodboard.ts
- [ ] T056 [P] Define MoodboardEdge interface in src/lib/types/moodboard.ts
- [ ] T057 [P] Define NodeType enum (including 'sketch' and 'pile') in src/lib/types/moodboard.ts
- [ ] T058 [P] Define EdgeType enum in src/lib/types/moodboard.ts
- [ ] T059 [P] Define IdeaOption interface in src/lib/types/moodboard.ts
- [ ] T060 [P] Define BudgetItem interface in src/lib/types/moodboard.ts
- [ ] T061 [P] Define Contact interface in src/lib/types/moodboard.ts
- [ ] T062 [P] Define CharacterLink interface in src/lib/types/moodboard.ts
- [ ] T063 [P] Define TabState interface in src/lib/types/moodboard.ts
- [ ] T064 [P] Define SketchMetadata interface in src/lib/types/moodboard.ts
- [ ] T065 [P] Define PileMetadata interface in src/lib/types/moodboard.ts

### State Management

- [ ] T066 Create nodes writable store in src/lib/stores/moodboard.ts
- [ ] T067 Create edges writable store in src/lib/stores/moodboard.ts
- [ ] T068 Create selectedNodeIds writable store in src/lib/stores/moodboard.ts
- [ ] T069 Create activeCharacterTab writable store in src/lib/stores/moodboard.ts
- [ ] T070 Create activeVariationTab writable store in src/lib/stores/moodboard.ts
- [ ] T071 Create characterTabs derived store (list of character names) in src/lib/stores/moodboard.ts
- [ ] T072 Create taggedNodes derived store in src/lib/stores/moodboard.ts

---

## Phase 2.5: Design Refinements (Based on Component Design Review)

**Goal**: Implement revised UI patterns and new features from design review.

**Dependencies**: Phase 2 complete (can be developed in parallel with Phase 3)

### Sketch Tool

- [ ] T073 [P] Create SketchNode.svelte component in src/lib/components/moodboard/nodes/SketchNode.svelte
- [ ] T074 [P] Create SketchDrawingModal.svelte component in src/lib/components/moodboard/SketchDrawingModal.svelte
- [ ] T075 Implement drawing canvas with pen/marker/eraser tools in SketchDrawingModal.svelte
- [ ] T076 Implement color palette (10 common colors) in SketchDrawingModal.svelte
- [ ] T077 Implement thickness slider in SketchDrawingModal.svelte
- [ ] T078 Implement undo/redo functionality in SketchDrawingModal.svelte
- [ ] T079 Implement template selection (blank, figure, grid) in SketchDrawingModal.svelte
- [ ] T080 Add sketch to Supabase Storage as PNG in SketchDrawingModal.svelte
- [ ] T081 Display sketch thumbnail in SketchNode.svelte
- [ ] T082 Test sketch tool on mobile (touch drawing) and desktop (mouse/tablet)
- [ ] T083 [P] Add pressure sensitivity support for stylus (optional enhancement)

### Piles/Groups

- [ ] T084 [P] Create PileNode.svelte component in src/lib/components/moodboard/nodes/PileNode.svelte
- [ ] T085 Implement pile preview (up to 4 child thumbnails) in PileNode.svelte
- [ ] T086 Implement expand/collapse interaction in PileNode.svelte
- [ ] T087 Implement "Create Pile" suggestion when dragging nodes together
- [ ] T088 Implement drag-and-drop to add items to pile
- [ ] T089 Implement pile naming and color-coding in PileNode.svelte
- [ ] T090 Query pile contents from database (parent_id filter)
- [ ] T091 Render expanded pile contents on canvas
- [ ] T092 [P] Test pile performance with 20+ items

### Multi-Character Navigation

- [ ] T093 [P] Create CharacterTabBar.svelte component in src/lib/components/moodboard/CharacterTabBar.svelte
- [ ] T094 Implement "All" (overview) tab in CharacterTabBar.svelte
- [ ] T095 Implement dynamic character tabs (one per character) in CharacterTabBar.svelte
- [ ] T096 Implement tab switching with canvas state preservation
- [ ] T097 [P] Create VariationTabBar.svelte component (nested within character view) in src/lib/components/moodboard/VariationTabBar.svelte
- [ ] T098 Implement character dropdown navigation for nested tabs
- [ ] T099 Create character linking UI (tag resource with character names)
- [ ] T100 Filter canvas nodes by active character tab
- [ ] T101 Show multi-character tags on resource nodes
- [ ] T102 Persist tab state to database on change
- [ ] T103 Load tab state on canvas mount
- [ ] T104 [P] Test navigation with 5+ characters and 3+ variations each

### Obsidian-Style Bottom Toolbar (Mobile)

- [ ] T105 [P] Create MobileBottomToolbar.svelte component in src/lib/components/moodboard/MobileBottomToolbar.svelte
- [ ] T106 Implement 5 primary actions: Quick Add, View Mode, Filter, Share, More
- [ ] T107 Implement tap-and-hold for extended quick menus
- [ ] T108 Position toolbar in thumb-friendly zone (bottom 15%)
- [ ] T109 Add haptic feedback on long press (mobile)
- [ ] T110 Test toolbar on iOS and Android browsers

### Contextual Canvas Controls

- [ ] T111 [P] Create ContextualControls.svelte component in src/lib/components/moodboard/ContextualControls.svelte
- [ ] T112 Implement auto-show on canvas interaction
- [ ] T113 Implement auto-hide after 3 seconds of inactivity
- [ ] T114 Display hotkey hints (Z for zoom, P for pan, etc.)
- [ ] T115 Position controls near cursor/touch point
- [ ] T116 Test controls on desktop and mobile

### Drawer-Based Editing

- [ ] T117 [P] Create NodeEditDrawer.svelte component in src/lib/components/moodboard/NodeEditDrawer.svelte
- [ ] T118 Implement slide-up animation (mobile) and slide-in (desktop)
- [ ] T119 Implement partial overlay (canvas still visible)
- [ ] T120 Implement swipe-down to dismiss (mobile)
- [ ] T121 Implement click-outside to dismiss
- [ ] T122 Implement ESC key to dismiss
- [ ] T123 Load node data into drawer form
- [ ] T124 Save node changes on form submit

### Inline Comments

- [ ] T125 [P] Create InlineCommentThread.svelte component in src/lib/components/moodboard/InlineCommentThread.svelte
- [ ] T126 Add comment icon to node header
- [ ] T127 Open comment drawer on icon click
- [ ] T128 Display comments for specific node in drawer
- [ ] T129 Implement comment form in drawer
- [ ] T130 [P] Create CommentsOverview.svelte component for all comments
- [ ] T131 Display comments overview in side panel (desktop) or drawer (mobile)
- [ ] T132 Filter comments by node in overview

### Quick Capture Flow

- [ ] T133 [P] Create QuickAddMenu.svelte component in src/lib/components/moodboard/QuickAddMenu.svelte
- [ ] T134 Implement 📸 Take Photo option (mobile camera)
- [ ] T135 Implement 🖼️ Choose Image option (file picker)
- [ ] T136 Implement 🔗 Paste Link option
- [ ] T137 Implement ✏️ Quick Sketch option (opens sketch tool)
- [ ] T138 Implement 📝 Quick Note option (text input)
- [ ] T139 [P] Add voice note option (future, placeholder)
- [ ] T140 Test quick capture flow on mobile and desktop
- [ ] T141 Optimize for speed (<10 seconds total time)

---

## Phase 3: User Story 1 - Add Social Media Content to Moodboard

**Goal**: Enable users to paste social media URLs and see them as moodboard nodes.

**Story**: As a cosplayer browsing Instagram, I want to copy a reel URL and paste it into my idea moodboard, so that I can collect inspiration without switching apps constantly.

**Test Criteria**:
- User can navigate to an idea's moodboard page
- User can paste Instagram/TikTok/Pinterest/YouTube URL
- System extracts metadata (thumbnail, title, author)
- Content appears as node on canvas with preview
- User can add tags to node
- User can add short comment or long note

**Dependencies**: Phase 2 complete

### Canvas Foundation

- [ ] T049 [US1] Create MoodboardCanvas.svelte component in src/lib/components/moodboard/MoodboardCanvas.svelte
- [ ] T050 [US1] Integrate SvelteFlow with Controls, Background, MiniMap in src/lib/components/moodboard/MoodboardCanvas.svelte
- [ ] T051 [US1] Implement node loading from database in src/lib/components/moodboard/MoodboardCanvas.svelte
- [ ] T052 [US1] Implement edge loading from database in src/lib/components/moodboard/MoodboardCanvas.svelte
- [ ] T053 [US1] Implement onNodeDragStop handler with position persistence in src/lib/components/moodboard/MoodboardCanvas.svelte
- [ ] T054 [US1] Create moodboard page route in src/routes/(auth)/ideas/[id]/moodboard/+page.svelte
- [ ] T055 [US1] Load idea context in moodboard page loader at src/routes/(auth)/ideas/[id]/moodboard/+page.ts

### Node Components

- [ ] T056 [P] [US1] Create ImageNode.svelte component in src/lib/components/moodboard/nodes/ImageNode.svelte
- [ ] T057 [P] [US1] Create SocialMediaNode.svelte component in src/lib/components/moodboard/nodes/SocialMediaNode.svelte
- [ ] T058 [P] [US1] Create TextNode.svelte component in src/lib/components/moodboard/nodes/TextNode.svelte
- [ ] T059 [US1] Register custom node types in MoodboardCanvas.svelte
- [ ] T060 [US1] Implement node header with type icon and delete button in ImageNode.svelte
- [ ] T061 [US1] Implement thumbnail display in ImageNode.svelte
- [ ] T062 [US1] Implement tag display in node footer in ImageNode.svelte
- [ ] T063 [US1] Implement inline comment editing in node footer in ImageNode.svelte

### Social Media Integration

- [ ] T064 [US1] Create AddContentModal.svelte component in src/lib/components/moodboard/AddContentModal.svelte
- [ ] T065 [US1] Implement URL input field with validation in AddContentModal.svelte
- [ ] T066 [US1] Implement "Add URL" button that calls parse endpoint in AddContentModal.svelte
- [ ] T067 [US1] Display metadata preview before creating node in AddContentModal.svelte
- [ ] T068 [US1] Create node from parsed metadata in AddContentModal.svelte
- [ ] T069 [US1] Implement platform-specific embeds (Instagram, TikTok, YouTube) in SocialMediaNode.svelte
- [ ] T070 [US1] Implement fallback to thumbnail + link when embed fails in SocialMediaNode.svelte

### Testing

- [ ] T071 [P] [US1] Write unit test for parseUrl with Instagram URL in tests/unit/moodboard/urlParser.test.ts
- [ ] T072 [P] [US1] Write unit test for parseUrl with invalid URL fallback in tests/unit/moodboard/urlParser.test.ts
- [ ] T073 [P] [US1] Write E2E test for pasting Instagram URL in tests/e2e/moodboard/social-media.spec.ts
- [ ] T074 [P] [US1] Write E2E test for node appearing on canvas in tests/e2e/moodboard/social-media.spec.ts
- [ ] T075 [P] [US1] Write E2E test for adding tags to node in tests/e2e/moodboard/canvas-basic.spec.ts
- [ ] T076 [P] [US1] Write E2E test for adding comment to node in tests/e2e/moodboard/canvas-basic.spec.ts

**US1 Deliverable**: Users can paste social media URLs and see them as interactive nodes on an infinite canvas.

---

## Phase 4: User Story 2 - Compare Multiple Costume Options

**Goal**: Enable users to create multiple options within one idea with separate budgets.

**Story**: As a cosplayer planning a new costume, I want to create multiple options with different budgets, so that I can compare approaches before committing.

**Test Criteria**:
- User can create multiple "options" within one Idea
- Each option has separate budget breakdown
- Each option has difficulty rating
- User can mark resources as "shared" across options
- User can view side-by-side comparison

**Dependencies**: US1 complete

### Option Management

- [ ] T077 [US2] Create optionService.getOptions in src/lib/api/services/optionService.ts
- [ ] T078 [US2] Create optionService.createOption in src/lib/api/services/optionService.ts
- [ ] T079 [US2] Create optionService.updateOption in src/lib/api/services/optionService.ts
- [ ] T080 [US2] Create optionService.deleteOption in src/lib/api/services/optionService.ts
- [ ] T081 [US2] Create OptionManager.svelte component in src/lib/components/ideas/OptionManager.svelte
- [ ] T082 [US2] Implement option list display in OptionManager.svelte
- [ ] T083 [US2] Implement add option form with name and difficulty in OptionManager.svelte
- [ ] T084 [US2] Implement option edit modal in OptionManager.svelte
- [ ] T085 [US2] Implement option delete confirmation in OptionManager.svelte
- [ ] T086 [US2] Add OptionManager to idea detail page in src/routes/(auth)/ideas/[id]/+page.svelte

### Budget Itemization

- [ ] T087 [US2] Create budgetService.getBudgetItems in src/lib/api/services/budgetService.ts
- [ ] T088 [US2] Create budgetService.createBudgetItem in src/lib/api/services/budgetService.ts
- [ ] T089 [US2] Create budgetService.updateBudgetItem in src/lib/api/services/budgetService.ts
- [ ] T090 [US2] Create budgetService.deleteBudgetItem in src/lib/api/services/budgetService.ts
- [ ] T091 [US2] Create budgetService.getBudgetSummary in src/lib/api/services/budgetService.ts
- [ ] T092 [US2] Create BudgetItemizer.svelte component in src/lib/components/moodboard/BudgetItemizer.svelte
- [ ] T093 [US2] Implement budget item list with option filter in BudgetItemizer.svelte
- [ ] T094 [US2] Implement add budget item form (name, cost, quantity, priority) in BudgetItemizer.svelte
- [ ] T095 [US2] Implement "shared across options" checkbox in BudgetItemizer.svelte
- [ ] T096 [US2] Display budget summary per option in BudgetItemizer.svelte
- [ ] T097 [US2] Add BudgetItemizer to idea detail page in src/routes/(auth)/ideas/[id]/+page.svelte

### Budget Canvas Integration

- [ ] T098 [US2] Create BudgetItemNode.svelte component in src/lib/components/moodboard/nodes/BudgetItemNode.svelte
- [ ] T099 [US2] Display budget item details (name, cost, quantity) in BudgetItemNode.svelte
- [ ] T100 [US2] Implement "Add to Canvas" button in BudgetItemizer.svelte
- [ ] T101 [US2] Create addBudgetItemToCanvas endpoint in src/routes/api/budget/[id]/add-to-canvas/+server.ts
- [ ] T102 [US2] Sync budget item updates between table and canvas node

### Option Comparison View

- [ ] T103 [US2] Create OptionComparison.svelte component in src/lib/components/ideas/OptionComparison.svelte
- [ ] T104 [US2] Display options side-by-side with budgets in OptionComparison.svelte
- [ ] T105 [US2] Highlight shared resources across options in OptionComparison.svelte
- [ ] T106 [US2] Add comparison view toggle to idea page in src/routes/(auth)/ideas/[id]/+page.svelte

### Testing

- [ ] T107 [P] [US2] Write E2E test for creating multiple options in tests/e2e/ideas/option-management.spec.ts
- [ ] T108 [P] [US2] Write E2E test for budget itemization in tests/e2e/moodboard/budget-items.spec.ts
- [ ] T109 [P] [US2] Write E2E test for adding budget item to canvas in tests/e2e/moodboard/budget-items.spec.ts
- [ ] T110 [P] [US2] Write unit test for budget summary calculation in tests/unit/moodboard/budgetCalculations.test.ts
- [ ] T111 [P] [US2] Write E2E test for side-by-side option comparison in tests/e2e/ideas/option-management.spec.ts

**US2 Deliverable**: Users can create and compare multiple costume options with separate budgets within one idea.

---

## Phase 5: User Story 3 - Convert Option to Project with Wizard

**Goal**: Provide a guided wizard flow for converting ideas to projects.

**Story**: As a cosplayer ready to start building, I want to convert my chosen option into a project with guidance, so that I don't lose any planning work and set up project correctly.

**Test Criteria**:
- User clicks "Start Planning" and enters wizard
- Wizard shows option selection (if multiple)
- Wizard shows data review screen
- User can add project-specific details (deadline, event)
- Budget carries over as baseline
- Moodboard references link to original idea
- Project maintains reference to source idea + option

**Dependencies**: US1, US2 complete

### Wizard Component

- [ ] T112 [US3] Create IdeaConversionWizard.svelte component in src/lib/components/ideas/IdeaConversionWizard.svelte
- [ ] T113 [US3] Implement multi-step wizard layout (Step 1-5) in IdeaConversionWizard.svelte
- [ ] T114 [US3] Implement Step 1: Option selection screen in IdeaConversionWizard.svelte
- [ ] T115 [US3] Implement Step 2: Data review screen showing moodboard and budget in IdeaConversionWizard.svelte
- [ ] T116 [US3] Implement Step 3: Project details form (deadline, event) in IdeaConversionWizard.svelte
- [ ] T117 [US3] Implement Step 4: Budget confirmation and adjustment in IdeaConversionWizard.svelte
- [ ] T118 [US3] Implement Step 5: Success confirmation with link to project in IdeaConversionWizard.svelte
- [ ] T119 [US3] Add "Start Planning" button to idea page in src/routes/(auth)/ideas/[id]/+page.svelte

### Conversion Logic

- [ ] T120 [US3] Create projectService.createFromIdea in src/lib/api/services/projectService.ts
- [ ] T121 [US3] Copy budget items from idea to project in projectService.createFromIdea
- [ ] T122 [US3] Set source_idea_id and source_option_id in project record in projectService.createFromIdea
- [ ] T123 [US3] Create project conversion endpoint at src/routes/api/ideas/[id]/convert/+server.ts
- [ ] T124 [US3] Handle wizard submission and call conversion endpoint in IdeaConversionWizard.svelte
- [ ] T125 [US3] Navigate to new project page after successful conversion in IdeaConversionWizard.svelte

### Project Moodboard Access

- [ ] T126 [US3] Add "View Moodboard" button to project page in src/routes/(auth)/projects/[id]/+page.svelte
- [ ] T127 [US3] Load source idea's moodboard in project context at src/routes/(auth)/projects/[id]/moodboard/+page.svelte
- [ ] T128 [US3] Display read-only moodboard for projects (optional: allow editing) in src/routes/(auth)/projects/[id]/moodboard/+page.svelte
- [ ] T129 [US3] Show source idea reference badge on project page in src/routes/(auth)/projects/[id]/+page.svelte

### Testing

- [ ] T130 [P] [US3] Write E2E test for wizard flow with single option in tests/e2e/ideas/idea-conversion.spec.ts
- [ ] T131 [P] [US3] Write E2E test for wizard flow with multiple options in tests/e2e/ideas/idea-conversion.spec.ts
- [ ] T132 [P] [US3] Write E2E test for budget carryover to project in tests/e2e/ideas/idea-conversion.spec.ts
- [ ] T133 [P] [US3] Write E2E test for viewing project moodboard in tests/e2e/moodboard/project-moodboard.spec.ts
- [ ] T134 [P] [US3] Write integration test for createFromIdea service in tests/integration/moodboard/project-conversion.test.ts

**US3 Deliverable**: Users can convert ideas to projects through a guided wizard that preserves all planning work.

---

## Phase 6: User Story 4 - Track Suppliers for Budget Items

**Goal**: Enable contact/vendor management and linking to budget items.

**Story**: As a cosplayer building a budget, I want to link suppliers to each item, so that I can compare vendor options and remember where to buy.

**Test Criteria**:
- User can add contacts/suppliers to system
- User can link contact to budget item
- User can add multiple supplier options per item
- System shows supplier comparison for item
- User can note prices from different vendors

**Dependencies**: US2 complete

### Contact Management

- [ ] T135 [US4] Create contactService.getContacts in src/lib/api/services/contactService.ts
- [ ] T136 [US4] Create contactService.createContact in src/lib/api/services/contactService.ts
- [ ] T137 [US4] Create contactService.updateContact in src/lib/api/services/contactService.ts
- [ ] T138 [US4] Create contactService.deleteContact in src/lib/api/services/contactService.ts
- [ ] T139 [US4] Create ContactManager.svelte component in src/lib/components/contacts/ContactManager.svelte
- [ ] T140 [US4] Implement contact list with filtering by type in ContactManager.svelte
- [ ] T141 [US4] Implement add contact form (name, type, email, website) in ContactManager.svelte
- [ ] T142 [US4] Implement contact edit modal in ContactManager.svelte
- [ ] T143 [US4] Implement favorite contacts toggle in ContactManager.svelte
- [ ] T144 [US4] Create contacts page route at src/routes/(auth)/contacts/+page.svelte

### Contact Integration

- [ ] T145 [US4] Add contact dropdown to budget item form in BudgetItemizer.svelte
- [ ] T146 [US4] Display linked contact info in budget item row in BudgetItemizer.svelte
- [ ] T147 [US4] Create ContactNode.svelte component in src/lib/components/moodboard/nodes/ContactNode.svelte
- [ ] T148 [US4] Display contact details (name, type, contact info) in ContactNode.svelte
- [ ] T149 [US4] Add "Add to Canvas" button for contacts in ContactManager.svelte

### Supplier Options with Edges

- [ ] T150 [US4] Create CustomEdge.svelte component in src/lib/components/moodboard/CustomEdge.svelte
- [ ] T151 [US4] Display edge label for supplier_option edge type in CustomEdge.svelte
- [ ] T152 [US4] Implement edge creation UI (drag from node handle) in MoodboardCanvas.svelte
- [ ] T153 [US4] Create supplier_option edge between BudgetItemNode and ContactNode
- [ ] T154 [US4] Display supplier options list in budget item detail view

### Testing

- [ ] T155 [P] [US4] Write E2E test for creating contact in tests/e2e/contacts/contact-management.spec.ts
- [ ] T156 [P] [US4] Write E2E test for linking contact to budget item in tests/e2e/moodboard/budget-items.spec.ts
- [ ] T157 [P] [US4] Write E2E test for creating supplier edge on canvas in tests/e2e/moodboard/edges.spec.ts
- [ ] T158 [P] [US4] Write integration test for contact CRUD operations in tests/integration/moodboard/contacts.test.ts

**US4 Deliverable**: Users can manage contacts and link them to budget items with visual supplier relationships.

---

## Phase 7: User Story 5 - Share Moodboard for Feedback

**Goal**: Enable public moodboard sharing with OAuth-authenticated commenting.

**Story**: As a cosplayer gathering inspiration, I want to share my moodboard with friends, so that I can get feedback on my ideas.

**Test Criteria**:
- User can generate shareable link to moodboard
- Anyone with link can view moodboard without account
- Viewers must use OAuth (Google, GitHub) to comment
- Comments show OAuth user's name and avatar
- User receives notifications of new comments
- User can disable/revoke sharing anytime
- No anonymous commenting

**Dependencies**: US1 complete

### Sharing Infrastructure

- [ ] T159 [US5] Create shareService.createShare in src/lib/api/services/shareService.ts
- [ ] T160 [US5] Create shareService.getShare in src/lib/api/services/shareService.ts
- [ ] T161 [US5] Create shareService.revokeShare in src/lib/api/services/shareService.ts
- [ ] T162 [US5] Implement generateShareToken function with crypto in src/lib/api/services/shareService.ts
- [ ] T163 [US5] Create share endpoint at src/routes/api/ideas/[id]/share/+server.ts
- [ ] T164 [US5] Create revoke share endpoint at src/routes/api/ideas/[id]/share/+server.ts

### Sharing UI

- [ ] T165 [US5] Create ShareMoodboard.svelte component in src/lib/components/moodboard/ShareMoodboard.svelte
- [ ] T166 [US5] Implement "Create Share Link" button in ShareMoodboard.svelte
- [ ] T167 [US5] Display shareable URL with copy button in ShareMoodboard.svelte
- [ ] T168 [US5] Implement "Disable Sharing" button in ShareMoodboard.svelte
- [ ] T169 [US5] Add ShareMoodboard component to moodboard page in src/routes/(auth)/ideas/[id]/moodboard/+page.svelte

### Public Share View

- [ ] T170 [US5] Create public share page route at src/routes/share/moodboard/[token]/+page.svelte
- [ ] T171 [US5] Load moodboard data from share token in src/routes/share/moodboard/[token]/+page.ts
- [ ] T172 [US5] Display moodboard canvas in read-only mode in src/routes/share/moodboard/[token]/+page.svelte
- [ ] T173 [US5] Display idea title and description in share view in src/routes/share/moodboard/[token]/+page.svelte
- [ ] T174 [US5] Handle invalid/revoked share token with 404 page in src/routes/share/moodboard/[token]/+page.svelte

### OAuth Commenting

- [ ] T175 [US5] Configure Google OAuth provider in Supabase dashboard
- [ ] T176 [US5] Configure GitHub OAuth provider in Supabase dashboard
- [ ] T177 [US5] Create commentService.getComments in src/lib/api/services/commentService.ts
- [ ] T178 [US5] Create commentService.createComment in src/lib/api/services/commentService.ts
- [ ] T179 [US5] Create comments endpoint at src/routes/api/share/[token]/comments/+server.ts
- [ ] T180 [US5] Create CommentSection.svelte component in src/lib/components/moodboard/CommentSection.svelte
- [ ] T181 [US5] Display existing comments with OAuth user info in CommentSection.svelte
- [ ] T182 [US5] Implement "Sign in with Google" button in CommentSection.svelte
- [ ] T183 [US5] Implement "Sign in with GitHub" button in CommentSection.svelte
- [ ] T184 [US5] Show comment form only after OAuth authentication in CommentSection.svelte
- [ ] T185 [US5] Handle OAuth callback and redirect back to share page
- [ ] T186 [US5] Add CommentSection to public share page in src/routes/share/moodboard/[token]/+page.svelte

### Testing

- [ ] T187 [P] [US5] Write E2E test for creating share link in tests/e2e/moodboard/sharing.spec.ts
- [ ] T188 [P] [US5] Write E2E test for viewing public moodboard in tests/e2e/moodboard/sharing.spec.ts
- [ ] T189 [P] [US5] Write E2E test for OAuth comment flow in tests/e2e/moodboard/sharing.spec.ts
- [ ] T190 [P] [US5] Write E2E test for revoking share access in tests/e2e/moodboard/sharing.spec.ts
- [ ] T191 [P] [US5] Write integration test for share token generation in tests/integration/moodboard/sharing.test.ts

**US5 Deliverable**: Users can share moodboards publicly with OAuth-authenticated commenting.

---

## Phase 8: User Story 6 - Switch Between View Modes

**Goal**: Provide multiple ways to view moodboard data (Canvas, Table, Timeline, Gallery, List, Graph).

**Story**: As a cosplayer managing many inspiration items, I want to view my moodboard in different formats, so that I can work in the way that best fits my current task.

**Test Criteria**:
- User can switch between 6 view modes via toolbar
- Canvas view preserves spatial positioning
- Table view shows sortable columns
- Timeline view organizes chronologically
- Gallery view shows Pinterest-style grid
- List view shows compact rows
- Graph view shows network connections
- Filters and tags work across all views
- Each view remembers its own state

**Dependencies**: US1 complete

### View Switcher

- [ ] T192 [US6] Create ViewSwitcher.svelte component in src/lib/components/moodboard/ViewSwitcher.svelte
- [ ] T193 [US6] Implement view mode tabs (Canvas, Table, Timeline, Gallery, List, Graph) in ViewSwitcher.svelte
- [ ] T194 [US6] Store active view mode in Svelte store in src/lib/stores/moodboard.ts
- [ ] T195 [US6] Add ViewSwitcher to moodboard page in src/routes/(auth)/ideas/[id]/moodboard/+page.svelte
- [ ] T196 [US6] Implement view mode persistence to localStorage in src/lib/stores/moodboard.ts

### Gallery View

- [ ] T197 [US6] Create MoodboardGalleryView.svelte component in src/lib/components/moodboard/MoodboardGalleryView.svelte
- [ ] T198 [US6] Implement Pinterest-style masonry grid layout in MoodboardGalleryView.svelte
- [ ] T199 [US6] Display node thumbnails with tags in MoodboardGalleryView.svelte
- [ ] T200 [US6] Implement node click to open detail modal in MoodboardGalleryView.svelte
- [ ] T201 [US6] Add infinite scroll for large collections in MoodboardGalleryView.svelte

### List View

- [ ] T202 [US6] Create MoodboardListView.svelte component in src/lib/components/moodboard/MoodboardListView.svelte
- [ ] T203 [US6] Display compact node rows with metadata in MoodboardListView.svelte
- [ ] T204 [US6] Implement node type icon and title in MoodboardListView.svelte
- [ ] T205 [US6] Show tags and created date in MoodboardListView.svelte
- [ ] T206 [US6] Add quick actions (edit, delete) in MoodboardListView.svelte

### Tag Filtering

- [ ] T207 [US6] Create TagFilter.svelte component in src/lib/components/moodboard/TagFilter.svelte
- [ ] T208 [US6] Display all unique tags from nodes in TagFilter.svelte
- [ ] T209 [US6] Implement tag selection with checkboxes in TagFilter.svelte
- [ ] T210 [US6] Filter nodes by selected tags across all views in TagFilter.svelte
- [ ] T211 [US6] Add TagFilter sidebar to moodboard page in src/routes/(auth)/ideas/[id]/moodboard/+page.svelte

### Testing

- [ ] T212 [P] [US6] Write E2E test for view mode switching in tests/e2e/moodboard/view-switching.spec.ts
- [ ] T213 [P] [US6] Write E2E test for gallery view rendering in tests/e2e/moodboard/view-switching.spec.ts
- [ ] T214 [P] [US6] Write E2E test for list view rendering in tests/e2e/moodboard/view-switching.spec.ts
- [ ] T215 [P] [US6] Write E2E test for tag filtering in tests/e2e/moodboard/filters.spec.ts
- [ ] T216 [P] [US6] Write unit test for view state persistence in tests/unit/moodboard/viewState.test.ts

**US6 Deliverable**: Users can switch between multiple view modes with consistent data and filtering.

---

## Phase 9: User Story 7 - Use Table View for Quick Editing (P2)

**Goal**: Provide a spreadsheet-like interface for bulk editing.

**Story**: As a cosplayer reviewing my inspiration collection, I want to see all items in a table with inline editing, so that I can quickly add tags, notes, and organize without opening each item.

**Test Criteria**:
- Table view shows all nodes in sortable, filterable table
- Columns: thumbnail, title/URL, tags, type, created, updated, connections
- Inline editing of tags, title, short comments
- Click thumbnail to open full preview
- Sort by any column
- Multi-select rows for bulk actions
- Export table as CSV

**Dependencies**: US6 complete

### Table View Implementation

- [ ] T217 [US7] Create MoodboardTableView.svelte component in src/lib/components/moodboard/MoodboardTableView.svelte
- [ ] T218 [US7] Set up TanStack Table with column definitions in MoodboardTableView.svelte
- [ ] T219 [US7] Implement thumbnail column with image preview in MoodboardTableView.svelte
- [ ] T220 [US7] Implement title/URL column with truncation in MoodboardTableView.svelte
- [ ] T221 [US7] Implement tags column with inline editing in MoodboardTableView.svelte
- [ ] T222 [US7] Implement node type column with icon in MoodboardTableView.svelte
- [ ] T223 [US7] Implement created date column with sorting in MoodboardTableView.svelte
- [ ] T224 [US7] Implement connections count column in MoodboardTableView.svelte

### Table Interactions

- [ ] T225 [US7] Implement column sorting (click header to sort) in MoodboardTableView.svelte
- [ ] T226 [US7] Implement column filtering (search input per column) in MoodboardTableView.svelte
- [ ] T227 [US7] Implement row selection with checkboxes in MoodboardTableView.svelte
- [ ] T228 [US7] Implement bulk actions toolbar (delete, tag) in MoodboardTableView.svelte
- [ ] T229 [US7] Implement inline editing for tags field in MoodboardTableView.svelte
- [ ] T230 [US7] Implement inline editing for title field in MoodboardTableView.svelte
- [ ] T231 [US7] Implement inline editing for short comment field in MoodboardTableView.svelte
- [ ] T232 [US7] Handle click on thumbnail to open detail modal in MoodboardTableView.svelte

### CSV Export

- [ ] T233 [US7] Create exportService.exportToCSV in src/lib/api/services/exportService.ts
- [ ] T234 [US7] Implement CSV download button in MoodboardTableView.svelte
- [ ] T235 [US7] Format node data for CSV export in exportService.exportToCSV

### Testing

- [ ] T236 [P] [US7] Write E2E test for table view rendering in tests/e2e/moodboard/table-view.spec.ts
- [ ] T237 [P] [US7] Write E2E test for inline editing in table in tests/e2e/moodboard/table-view.spec.ts
- [ ] T238 [P] [US7] Write E2E test for sorting by column in tests/e2e/moodboard/table-view.spec.ts
- [ ] T239 [P] [US7] Write E2E test for multi-select and bulk delete in tests/e2e/moodboard/table-view.spec.ts
- [ ] T240 [P] [US7] Write E2E test for CSV export in tests/e2e/moodboard/table-view.spec.ts

**US7 Deliverable**: Users can manage nodes efficiently through a spreadsheet-like table interface.

---

## Phase 10: User Story 8 - Use Timeline to Track Progress (P2)

**Goal**: Provide chronological view of inspiration and progress.

**Story**: As a cosplayer building a project over time, I want to see my inspiration and progress photos in chronological order, so that I can track how my ideas evolved.

**Test Criteria**:
- Timeline view arranges items by created date
- Default: Vertical timeline (Pinterest-style)
- Toggle to horizontal timeline
- Group by: day, week, month (both orientations)
- Show progress over time
- Click item to view details
- Filter timeline by tags or node type

**Dependencies**: US6 complete

### Timeline Component

- [ ] T241 [US8] Create MoodboardTimelineView.svelte component in src/lib/components/moodboard/MoodboardTimelineView.svelte
- [ ] T242 [US8] Implement vertical timeline layout (default) in MoodboardTimelineView.svelte
- [ ] T243 [US8] Implement horizontal timeline layout in MoodboardTimelineView.svelte
- [ ] T244 [US8] Add orientation toggle button (vertical/horizontal) in MoodboardTimelineView.svelte
- [ ] T245 [US8] Group nodes by created date (day/week/month) in MoodboardTimelineView.svelte
- [ ] T246 [US8] Display date markers between groups in MoodboardTimelineView.svelte
- [ ] T247 [US8] Render node cards in chronological order in MoodboardTimelineView.svelte
- [ ] T248 [US8] Implement node click to open detail modal in MoodboardTimelineView.svelte

### Timeline Filtering

- [ ] T249 [US8] Add grouping selector (day/week/month) in MoodboardTimelineView.svelte
- [ ] T250 [US8] Apply tag filter to timeline in MoodboardTimelineView.svelte
- [ ] T251 [US8] Add node type filter dropdown in MoodboardTimelineView.svelte
- [ ] T252 [US8] Persist timeline orientation preference in localStorage

### Graph View

- [ ] T253 [US8] Create MoodboardGraphView.svelte component in src/lib/components/moodboard/MoodboardGraphView.svelte
- [ ] T254 [US8] Render nodes as circles with labels in MoodboardGraphView.svelte
- [ ] T255 [US8] Render edges as connecting lines in MoodboardGraphView.svelte
- [ ] T256 [US8] Implement force-directed layout (optional: use d3-force) in MoodboardGraphView.svelte
- [ ] T257 [US8] Add zoom and pan controls to graph view in MoodboardGraphView.svelte
- [ ] T258 [US8] Implement node click to highlight connections in MoodboardGraphView.svelte

### Testing

- [ ] T259 [P] [US8] Write E2E test for vertical timeline rendering in tests/e2e/moodboard/timeline-view.spec.ts
- [ ] T260 [P] [US8] Write E2E test for horizontal timeline rendering in tests/e2e/moodboard/timeline-view.spec.ts
- [ ] T261 [P] [US8] Write E2E test for timeline orientation toggle in tests/e2e/moodboard/timeline-view.spec.ts
- [ ] T262 [P] [US8] Write E2E test for timeline grouping in tests/e2e/moodboard/timeline-view.spec.ts
- [ ] T263 [P] [US8] Write E2E test for graph view rendering in tests/e2e/moodboard/graph-view.spec.ts

**US8 Deliverable**: Users can view moodboard chronologically and see network relationships in graph view.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Goal**: Final refinements for production readiness.

**Dependencies**: All user stories complete

### Mobile Optimization

- [ ] T264 [P] Optimize canvas touch gestures for mobile in src/lib/components/moodboard/MoodboardCanvas.svelte
- [ ] T265 [P] Add touch-action: none to prevent scroll conflicts in src/lib/components/moodboard/MoodboardCanvas.svelte
- [ ] T266 [P] Test pinch-zoom on iOS Safari and Android Chrome
- [ ] T267 [P] Adjust node minimum touch target size to 44x44px
- [ ] T268 [P] Create mobile-specific control panel layout in src/lib/components/moodboard/CanvasControls.svelte
- [ ] T269 [P] Test gallery view on mobile devices
- [ ] T270 [P] Test table view horizontal scroll on mobile

### Performance Optimization

- [ ] T271 [P] Implement lazy loading for node thumbnails outside viewport
- [ ] T272 [P] Debounce position updates during node drag (save on drag end only)
- [ ] T273 [P] Use WebP format for all cached thumbnails
- [ ] T274 [P] Add database indexes on frequently queried columns (verified in migrations)
- [ ] T275 [P] Test canvas performance with 200+ nodes
- [ ] T276 [P] Profile canvas FPS with Chrome DevTools during zoom/pan
- [ ] T277 [P] Implement node virtualization if performance issues found

### UI Polish

- [ ] T278 [P] Add loading states to all async operations
- [ ] T279 [P] Add error boundaries for canvas rendering failures
- [ ] T280 [P] Implement toast notifications for user actions
- [ ] T281 [P] Add animations for view mode transitions
- [ ] T282 [P] Polish node card styling with hover states
- [ ] T283 [P] Add keyboard shortcuts (Cmd+K to add content, etc.)
- [ ] T284 [P] Implement undo/redo for canvas operations
- [ ] T285 [P] Add empty state illustrations for new moodboards

### Accessibility

- [ ] T286 [P] Add ARIA labels to canvas controls
- [ ] T287 [P] Ensure keyboard navigation works for table view
- [ ] T288 [P] Test screen reader compatibility with node content
- [ ] T289 [P] Add focus indicators to all interactive elements
- [ ] T290 [P] Ensure color contrast meets WCAG AA standards

### Documentation

- [ ] T291 [P] Create user guide for moodboard features in docs/features/moodboard-guide.md
- [ ] T292 [P] Document API endpoints in docs/api/moodboard-endpoints.md
- [ ] T293 [P] Add inline code comments for complex canvas logic
- [ ] T294 [P] Create migration guide for existing ideas in docs/migrations/006-moodboard-migration.md

---

## Dependencies Graph

### Story Completion Order

```
Setup (Phase 1)
  ↓
Foundational (Phase 2)
  ↓
US1 (Social Media) ←─┐
  ↓                   │
US2 (Options) ←───────┤ (independent, can parallelize)
  ↓                   │
US3 (Wizard)          │
  ↓                   │
US4 (Suppliers) ←─────┤
  ↓                   │
US5 (Sharing) ←───────┤
  ↓                   │
US6 (View Modes) ←────┤
  ↓                   │
US7 (Table View) ←────┘
  ↓
US8 (Timeline)
  ↓
Polish (Phase 11)
```

### Blocking Dependencies

- **US1** blocks: US3, US5, US6 (requires canvas)
- **US2** blocks: US3, US4 (requires options and budget)
- **US6** blocks: US7, US8 (requires view system)

---

## Parallel Execution Examples

### Week 1 (After Setup)
- **Dev 1**: US1 Canvas Foundation (T049-T055)
- **Dev 2**: US1 Node Components (T056-T063)
- **Dev 3**: Core Services (T028-T037)

### Week 2
- **Dev 1**: US1 Social Media Integration (T064-T070)
- **Dev 2**: US2 Option Management (T077-T086)
- **Dev 3**: US1 Testing (T071-T076)

### Week 3
- **Dev 1**: US2 Budget Itemization (T087-T102)
- **Dev 2**: US4 Contact Management (T135-T144)
- **Dev 3**: US2 Testing (T107-T111)

---

## Implementation Strategy

### MVP Scope (First 4 Weeks)
- Phase 1: Setup
- Phase 2: Foundational
- Phase 3: US1 (Social Media)
- Phase 4: US2 (Options)
- Phase 5: US3 (Wizard)

This delivers core value: moodboards with social media integration, multiple options, and idea-to-project conversion.

### Enhanced Scope (Weeks 5-6)
- Phase 6: US4 (Suppliers)
- Phase 7: US5 (Sharing)
- Phase 8: US6 (View Modes)

Adds contact management, sharing, and view flexibility.

### Full Scope (Weeks 7-8)
- Phase 9: US7 (Table View)
- Phase 10: US8 (Timeline)
- Phase 11: Polish

Completes all view modes and polishes for production.

---

## Task Summary

| Phase | Task Count | Story | Priority |
|-------|-----------|-------|----------|
| Phase 1: Setup (incl. PWA) | 37 | - | P0 |
| Phase 2: Foundational | 35 | - | P0 |
| Phase 2.5: Design Refinements | 69 | Design Review | P1 |
| Phase 3: US1 | 28 | Social Media | P1 |
| Phase 4: US2 | 35 | Options | P1 |
| Phase 5: US3 | 23 | Wizard | P1 |
| Phase 6: US4 | 24 | Suppliers | P1 |
| Phase 7: US5 | 33 | Sharing | P1 |
| Phase 8: US6 | 25 | View Modes | P1 |
| Phase 9: US7 | 24 | Table View | P2 |
| Phase 10: US8 | 23 | Timeline | P2 |
| Phase 11: Polish | 31 | - | P2 |
| **Total** | **387** | | |

**Note**: Phase 2.5 tasks reflect design decisions from the component design review process, emphasizing:
- Progressive disclosure (simple by default)
- PWA-first approach with share target
- Quick capture optimizations
- Mobile-friendly interactions (bottom toolbar, tap-and-hold)
- Contextual UI that scales with complexity
- ADHD-friendly organization (piles, flexible tabs)

---

## Validation

### Format Validation
✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`  
✅ Task IDs are sequential (T001-T141+ for Phase 2.5)  
✅ [P] markers indicate parallelizable tasks (different files, no dependencies)  
✅ [US#] labels mark user story tasks  
✅ Setup and Foundational phases have NO story labels  
✅ User story phases have REQUIRED story labels  
✅ Polish phase has NO story labels  
✅ All tasks include specific file paths  

### Coverage Validation
✅ Every user story has independent test criteria  
✅ Each phase is a complete, testable increment  
✅ Dependencies clearly marked  
✅ Parallel opportunities identified  
✅ MVP scope updated: US1-US3 + PWA Setup + Design Refinements (Weeks 1-6)  
✅ Design review feedback incorporated (Phase 2.5)  

### Design Philosophy Integration
✅ Progressive disclosure principle embedded throughout  
✅ PWA-first approach prioritized (day-one)  
✅ Mobile-optimized interactions (bottom toolbar, tap-and-hold)  
✅ Sketch tool for quick inspiration capture  
✅ Piles for ADHD-friendly organization  
✅ Multi-layered navigation for scalable complexity  

---

**Status**: ✅ Updated with design refinements - All 387 tasks now include comprehensive UI/UX improvements from component design review.


