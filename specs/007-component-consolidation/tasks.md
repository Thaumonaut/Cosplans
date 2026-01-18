# Tasks: Component Consolidation

**Input**: Design documents from `/specs/007-component-consolidation/`  
**Prerequisites**: spec.md, consolidation-audit.md  
**Constitution Compliance**: Project-centric, MVP-first, modular by domain  
**Tests**: Optional - only included if explicitly requested

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Ensure environment and dependencies are ready.

- [ ] T001 Verify development environment and install dependencies with `bun install` at `/home/jek/Documents/projects/Cosplans`
- [ ] T002 Review existing base component patterns in `src/lib/components/base/` and `src/lib/components/ui/`
- [ ] T003 Audit current Card component implementation in `src/lib/components/ui/card.svelte` (already updated with padding management)
- [ ] T004 Document component consolidation patterns and migration approach in `specs/007-component-consolidation/migration-guide.md`

---

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Core utilities and types required before any user story.

- [ ] T005 [P] Create shared image upload types and interfaces in `src/lib/types/image-upload.ts`
- [ ] T006 [P] Add image validation utilities (size, type, dimensions) in `src/lib/utils/image-validation.ts`
- [ ] T007 [P] Create Supabase storage helpers for upload operations in `src/lib/api/services/storageService.ts`
- [ ] T008 [P] Add shared loading state types and interfaces in `src/lib/types/ui-state.ts`
- [ ] T009 Configure TypeScript strict mode for new components in `tsconfig.json` (verify settings)

---

## Phase 3: User Story 1 - Image Upload Component Consolidation (Priority: P1) 🎯 MVP
**Goal**: Create a single, reusable ImageUploadZone component to replace 7+ duplicate InlineImageUpload implementations.
**Independent Test**: Upload single/multiple images with drag-drop, verify progress indication, validate file types/sizes, preview thumbnails, handle errors gracefully.

### Implementation for User Story 1
- [ ] T010 [P] [US1] Create base ImageUploadZone component with drag-drop support in `src/lib/components/base/ImageUploadZone.svelte`
- [ ] T011 [P] [US1] Add image preview thumbnails and progress indicators to ImageUploadZone in `src/lib/components/base/ImageUploadZone.svelte`
- [ ] T012 [P] [US1] Implement error handling and validation feedback in ImageUploadZone in `src/lib/components/base/ImageUploadZone.svelte`
- [ ] T013 [US1] Add ImageUploadZone API documentation and usage examples in `src/lib/components/base/ImageUploadZone.md`

### Migration for User Story 1
- [ ] T014 [P] [US1] Replace InlineImageUpload with ImageUploadZone in `src/lib/components/ideas/IdeaDetail.svelte`
- [ ] T015 [P] [US1] Replace InlineImageUpload with ImageUploadZone in `src/lib/components/projects/ProjectDetail.svelte`
- [ ] T016 [P] [US1] Replace InlineImageUpload with ImageUploadZone in `src/lib/components/tools/ToolDetail.svelte`
- [ ] T017 [P] [US1] Replace InlineImageUpload with ImageUploadZone in `src/lib/components/resources/ResourceDetail.svelte`
- [ ] T018 [P] [US1] Replace InlineImageUpload with ImageUploadZone in `src/lib/components/projects/tabs/GalleryTab.svelte`
- [ ] T019 [P] [US1] Replace InlineImageUpload with ImageUploadZone in `src/lib/components/photoshoots/PhotoshootDetail.svelte`
- [ ] T020 [P] [US1] Replace InlineImageUpload with ImageUploadZone in `src/lib/components/domain/ShotListEditor.svelte`
- [ ] T021 [US1] Remove old InlineImageUpload code and add deprecation notices across migrated components

---

## Phase 4: User Story 2 - Loading & Empty States Consolidation (Priority: P2)
**Goal**: Consolidate 121 different loading/empty state implementations into a single standard component.
**Independent Test**: Verify consistent loading spinners, empty state messages, error boundaries, and transitions across all pages.

### Implementation for User Story 2
- [ ] T022 [US2] Analyze existing LoadingState and data-loader components in `src/lib/components/ui/LoadingState.svelte` and `src/lib/components/data-loader.svelte`
- [ ] T023 [US2] Design unified DataState component API supporting loading, empty, error, and success states in `src/lib/components/base/DataState.svelte`
- [ ] T024 [P] [US2] Implement DataState component with loading spinner in `src/lib/components/base/DataState.svelte`
- [ ] T025 [P] [US2] Add empty state templates with customizable messages to DataState in `src/lib/components/base/DataState.svelte`
- [ ] T026 [P] [US2] Add error boundary support to DataState component in `src/lib/components/base/DataState.svelte`
- [ ] T027 [US2] Create DataState API documentation with migration examples in `src/lib/components/base/DataState.md`

### High-Priority Migrations for User Story 2
- [ ] T028 [P] [US2] Replace inline loading states in Dashboard with DataState in `src/routes/(auth)/dashboard/+page.svelte`
- [ ] T029 [P] [US2] Replace inline loading states in Ideas page with DataState in `src/routes/(auth)/ideas/+page.svelte`
- [ ] T030 [P] [US2] Replace inline loading states in Projects page with DataState in `src/routes/(auth)/projects/+page.svelte`
- [ ] T031 [P] [US2] Replace inline loading states in Tasks page with DataState in `src/routes/(auth)/tasks/+page.svelte`
- [ ] T032 [P] [US2] Replace inline loading states in Budget page with DataState in `src/routes/(auth)/budget/+page.svelte`
- [ ] T033 [P] [US2] Replace inline loading states in ResourcesList component with DataState in `src/lib/components/resources/ResourcesList.svelte`
- [ ] T034 [P] [US2] Replace inline loading states in ToolsList component with DataState in `src/lib/components/tools/ToolsList.svelte`
- [ ] T035 [US2] Create script to identify remaining inline loading states in `scripts/find-inline-loading-states.ts`
- [ ] T036 [US2] Batch migrate remaining loading states in component files (identified by script)

---

## Phase 5: User Story 3 - Modal/Dialog Components Consolidation (Priority: P3)
**Goal**: Consolidate CreationFlyout and Sheet components, replace custom modals with standard components.
**Independent Test**: Verify consistent modal behavior, keyboard shortcuts (Escape), focus management, and accessibility across all modal interactions.

### Implementation for User Story 3
- [ ] T037 [US3] Audit existing modal components: Dialog, ConfirmDialog, CreationFlyout, Sheet in `src/lib/components/ui/`
- [ ] T038 [US3] Design consolidation strategy: keep Dialog and ConfirmDialog, merge CreationFlyout and Sheet in `specs/007-component-consolidation/modal-consolidation-plan.md`
- [ ] T039 [P] [US3] Update Sheet component to incorporate CreationFlyout features in `src/lib/components/ui/sheet.svelte`
- [ ] T040 [P] [US3] Add accessibility improvements to Sheet (ARIA labels, focus trap, Escape handling) in `src/lib/components/ui/sheet.svelte`
- [ ] T041 [US3] Create Sheet component documentation and migration guide in `src/lib/components/ui/sheet.md`

### Migrations for User Story 3
- [ ] T042 [P] [US3] Replace CreationFlyout with Sheet in Dashboard in `src/routes/(auth)/dashboard/+page.svelte`
- [ ] T043 [P] [US3] Replace CreationFlyout with Sheet in Ideas page in `src/routes/(auth)/ideas/+page.svelte`
- [ ] T044 [P] [US3] Replace CreationFlyout with Sheet in Projects page in `src/routes/(auth)/projects/+page.svelte`
- [ ] T045 [P] [US3] Replace TaskDeleteModal with ConfirmDialog in task components in `src/lib/components/tasks/TaskDeleteModal.svelte` and usage sites
- [ ] T046 [P] [US3] Replace custom delete modals with ConfirmDialog in detail views (Ideas, Projects, Resources) in various detail components
- [ ] T047 [US3] Remove deprecated CreationFlyout component and update imports in `src/lib/components/creation-flyout.svelte` and test file
- [ ] T048 [US3] Update component index exports to remove CreationFlyout in `src/lib/components/index.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns
**Purpose**: Final hardening, documentation, and cleanup.

- [ ] T049 [P] Update component consolidation documentation in `specs/007-component-consolidation/spec.md` with completion status
- [ ] T050 [P] Create component usage guide with examples in `docs/COMPONENT_LIBRARY.md`
- [ ] T051 [P] Add component consolidation metrics to consolidation-audit.md (before/after comparisons) in `specs/007-component-consolidation/consolidation-audit.md`
- [ ] T052 [US3] Run linter and fix any import errors from removed components with `bun run lint --fix`
- [ ] T053 Run TypeScript type checking across entire codebase with `bun run check`
- [ ] T054 [P] Create codemod script for automated future migrations in `scripts/migrate-to-shared-components.ts`
- [ ] T055 Verify all deprecated components are removed and no orphaned files remain in `src/lib/components/`

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → All User Stories (Phases 3-5) → **Polish (Phase 6)**
- User stories are independent after foundational is complete. Recommended order by priority: US1 (P1) → US2 (P2) → US3 (P3).

**Dependency Graph (story level)**:
- Foundational → {US1, US2, US3} (all can proceed in parallel)
- US1 (image upload) has no dependencies on other user stories
- US2 (loading states) has no dependencies on other user stories
- US3 (modals) has no dependencies on other user stories

---

## Parallel Execution Examples

**After Foundational Phase**:
- US1, US2, and US3 can all start in parallel (completely different component areas)

**Within US1 (Image Upload)**:
- T014-T020 (migration tasks) can all proceed in parallel after T010-T012 complete
- Each migration touches different files, no conflicts

**Within US2 (Loading States)**:
- T024-T026 (component implementation) can proceed in parallel
- T028-T034 (page migrations) can all proceed in parallel after T024-T027 complete

**Within US3 (Modals)**:
- T039-T040 (Sheet improvements) can proceed in parallel
- T042-T046 (migrations) can all proceed in parallel after T039-T041 complete

---

## Implementation Strategy

- **MVP First**: Deliver US1 fully (ImageUploadZone created and migrated to all 7 locations). This provides immediate value by reducing maintenance burden and improving consistency.
- **Incremental**: Complete US2 (loading states consolidation) for high-traffic pages first, then remaining pages. Then complete US3 (modal consolidation).
- **Testing**: Visual regression testing recommended for US1 and US2 to ensure UI consistency. Manual accessibility testing for US3 modal improvements.
- **Backward Compatibility**: Maintain old components with deprecation warnings until all migrations complete, then remove in final phase.

---

## Success Metrics

**Projected Impact**:
- Reduce duplicate code by ~85% for image upload implementations
- Standardize loading states across 121 instances in 64 files
- Consolidate 5+ modal implementations down to 3 standard components
- Reduce test code by ~70% (shared components tested once)
- Improve feature development speed by ~50% (clear patterns to follow)

**Before Consolidation**:
- 7+ duplicate image upload implementations
- 121 different loading/empty state implementations across 64 files
- 5+ modal/dialog implementations with inconsistent behavior

**After Consolidation (Target)**:
- 1 ImageUploadZone component (7 instances replaced)
- 1 DataState component (121 instances replaced)
- 3 modal components: Dialog, ConfirmDialog, Sheet (5+ instances replaced)

---

**Format validation**: All tasks follow `- [ ] T### [P?] [Story?] Description with file path`. Tasks are organized by user story for independent implementation and testing.




