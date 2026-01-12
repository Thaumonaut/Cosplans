# Tasks: Application Stability and Quality Improvement

**Input**: Design documents from `/specs/004-bugfix-testing/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Constitution Compliance**: Project-centric, MVP-first, modular by domain  
**Tests**: Included where required by spec (quality/testing FR-032..FR-036)

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Ensure environment and dependencies are ready.

- [x] T001 Configure environment variables in `.env` for Supabase and optional character APIs (IGDB, Comic Vine, TMDB) per `quickstart.md`
- [x] T002 Install dependencies with Bun and verify lockfile: run `bun install` at `/home/jek/Documents/projects/Cosplans`
- [x] T003 Verify Supabase CLI availability and connectivity: `supabase status` in repo root
- [x] T004 Create local development config for Playwright/Vitest in `playwright.config.ts` and `vitest.config.ts` (no code change, confirm paths)

---

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Core infrastructure required before any user story.

- [x] T005 Create database migrations for task soft delete, dependency count, team ownership, personal team, characters, ownership history in `supabase/migrations/` (SQL files per data-model.md)
- [x] T006 Update RLS policies for tasks, teams, characters, ownership history to enforce deleted filters and owner checks in `supabase/migrations/` (policy statements)
- [x] T007 Add shared types for character and offline sync in `src/lib/types/character.ts` and `src/lib/types/offline.ts`
- [x] T008 [P] Add offline sync utilities (Dexie wrapper, queue types) in `src/lib/utils/offlineSync.ts`
- [x] T009 [P] Add API aggregation utilities (deduplication, fuzzy matching) in `src/lib/utils/apiAggregation.ts`
- [x] T010 [P] Add responsive utilities and breakpoints in `src/lib/utils/responsive.ts`
- [x] T011 Configure Playwright projects for mobile/tablet/desktop/large-desktop and offline simulation in `playwright.config.ts`
- [x] T012 Create initial offline store scaffold in `src/lib/stores/offlineStore.ts`

---

## Phase 3: User Story 1 - Task Management Reliability (Priority: P1) 🎯 MVP
**Goal**: Reliable task CRUD with delete, immediate kanban sync, and custom field preservation.
**Independent Test**: Create tasks in list, verify delete with confirmation and dependency counts; ensure tasks appear in kanban immediately; custom fields persist across views.

### Tests for User Story 1
- [x] T013 [P] [US1] Add E2E for task deletion and dependency confirmation in `tests/e2e/tasks/task-deletion.spec.ts`
- [x] T014 [P] [US1] Add E2E for kanban sync after creation in `tests/e2e/tasks/task-sync.spec.ts`
- [x] T015 [P] [US1] Add E2E for task custom fields persistence in `tests/e2e/tasks/task-fields.spec.ts`

### Implementation for User Story 1
- [X] T016 [P] [US1] Implement TaskDeleteModal with dependency counts in `src/lib/components/tasks/TaskDeleteModal.svelte`
- [X] T017 [US1] Wire delete flow with soft delete fields in `src/lib/api/services/taskService.ts`
- [X] T018 [P] [US1] Ensure task deletion UI in `src/routes/(app)/tasks/+page.svelte` triggers confirmation and refreshes stores
- [X] T019 [P] [US1] Fix kanban creation sync in `src/lib/components/tasks/TaskBoardView.svelte` and `src/lib/stores/tasks.ts`
- [X] T020 [P] [US1] Ensure custom fields display/persist in task views in `src/lib/components/tasks/TaskDetailPanel.svelte`
- [X] T021 [US1] Add RLS-aware filters for deleted tasks in task data loaders `src/lib/services/task-service.ts`

---

## Phase 4: User Story 2 - Cross-Device and Mobile Experience (Priority: P1)
**Goal**: Correct layouts across mobile/tablet/desktop with sticky action bar and fixed sidebar.
**Independent Test**: Verify no horizontal overflow, sticky action bar, fixed sidebar, correct tablet headers, correct button position at 320px+.

### Tests for User Story 2
- [x] T022 [P] [US2] Add Playwright viewport coverage (mobile/tablet/desktop/large) in `tests/e2e/responsive/mobile-layout.spec.ts` and `tablet-layout.spec.ts`
- [x] T023 [P] [US2] Add E2E for action bar and sidebar positioning in `tests/e2e/responsive/layout-position.spec.ts`

### Implementation for User Story 2
- [X] T024 [P] [US2] Add ResponsiveContainer and breakpoints in `src/lib/components/layout/ResponsiveContainer.svelte`
- [X] T025 [P] [US2] Fix action bar sticky height calculations in `src/lib/components/page-header.svelte` and `src/routes/(auth)/+layout.svelte`
- [X] T026 [P] [US2] Fix sidebar fixed positioning and mobile toggle behavior in `src/lib/components/ui/sidebar.svelte`
- [X] T027 [P] [US2] Fix task board headers rendering on tablet in `src/lib/components/tasks/TaskBoardView.svelte`
- [X] T028 [P] [US2] Correct "what should I do now" button positioning (responsive utilities added)
- [X] T029 [US2] Update global styles for breakpoints/overflow handling in `src/app.css`

---

## Phase 5: User Story 3 - Navigation and Interface Consistency (Priority: P2)
**Goal**: Reliable sidebar toggle and organized navigation (photoshoots/tools/resources/calendar grouped).
**Independent Test**: Toggle works, grouping visible, settings shows notifications (no dark mode).

### Tests for User Story 3
- [x] T030 [P] [US3] Add E2E for sidebar toggle and grouping in `tests/e2e/navigation/sidebar-toggle.spec.ts`
- [x] T031 [P] [US3] Add E2E for settings notifications section (no dark mode) in `tests/e2e/navigation/settings-notifications.spec.ts`

### Implementation for User Story 3
- [X] T032 [P] [US3] Implement grouped navigation sections in `src/lib/components/app-sidebar.svelte`
- [X] T033 [US3] Ensure toggle state persistence and accessibility in `src/lib/components/app-sidebar.svelte` and `src/lib/components/ui/sidebar.svelte`
- [X] T034 [US3] Rename settings section to notifications and remove dark mode toggle in `src/routes/(auth)/settings/preferences/+page.svelte`

---

## Phase 6: User Story 4 - Data Persistence and Integrity (Priority: P1)
**Goal**: Reliable data persistence for notes, task associations, and offline safety.
**Independent Test**: Notes persist across idea→planning; tasks link to resources/projects; subtasks tracked together/separately; offline changes saved and synced with conflict prompts.

### Tests for User Story 4
- [ ] T035 [P] [US4] Add E2E for notes persistence through phase transition in `tests/e2e/persistence/notes-persistence.spec.ts`
- [ ] T036 [P] [US4] Add E2E for task-resource/project linking in `tests/e2e/persistence/task-links.spec.ts`
- [ ] T037 [P] [US4] Add E2E for offline queue + conflict resolution in `tests/e2e/persistence/offline-sync.spec.ts`

### Implementation for User Story 4
- [X] T038 [P] [US4] Persist idea→planning notes in `src/routes/(auth)/projects/[id]/+page.svelte` and services
- [X] T039 [P] [US4] Implement task-to-resource/project linking UI and API in `src/lib/components/tasks/TaskDetailPanel.svelte` and `src/lib/api/services/taskService.ts`
- [X] T040 [P] [US4] Add subtask aggregation controls (together/separate) in `src/lib/components/tasks/TaskListView.svelte`
- [X] T041 [P] [US4] Implement offline queue processing and conflict prompts in `src/lib/api/services/offlineService.ts`
- [X] T042 [US4] Surface offline indicator in `src/lib/components/shared/OfflineIndicator.svelte`

---

## Phase 7: User Story 5 - Team Management Functionality (Priority: P2)
**Goal**: Invitations, safe deletion with ownership transfer, auto personal team creation.
**Independent Test**: Invite members; delete team only after transfer; personal team auto-created on signup.

### Tests for User Story 5
- [ ] T043 [P] [US5] Add E2E for ownership transfer requirement before deletion in `tests/e2e/teams/team-deletion.spec.ts`
- [ ] T044 [P] [US5] Add E2E for personal team auto-create on signup in `tests/e2e/teams/team-creation-fallback.spec.ts`

### Implementation for User Story 5
- [ ] T045 [P] [US5] Implement ownership transfer dialog and flow in `src/lib/components/teams/OwnershipTransferDialog.svelte`
- [ ] T046 [US5] Enforce transfer check in team delete flow `src/lib/api/services/teamService.ts` and `src/lib/components/teams/TeamDeleteModal.svelte`
- [ ] T047 [P] [US5] Implement personal team auto-create in `src/routes/(auth)/signup/+page.server.ts`
- [ ] T048 [US5] Add team invitation UI/logic (placeholder if backend exists) in `src/routes/(app)/teams/[teamId]/+page.svelte`

---

## Phase 8: User Story 6 - Enhanced Feature Integration (Priority: P3)
**Goal**: Calendar/iCal integration and multi-API character search with fallback/manual entry.
**Independent Test**: Calendar settings expose third-party/ical options; character search queries multiple APIs, dedupes, falls back to manual entry.

### Tests for User Story 6
- [ ] T049 [P] [US6] Add E2E for character API aggregation/fallback/manual entry in `tests/e2e/characters/character-search.spec.ts`
- [ ] T050 [P] [US6] Add E2E for calendar/iCal integration settings in `tests/e2e/integration/calendar-integration.spec.ts`

### Implementation for User Story 6
- [ ] T051 [P] [US6] Implement character service aggregation with fallback per contract in `src/lib/api/services/characterService.ts` and `src/lib/utils/apiAggregation.ts`
- [ ] T052 [P] [US6] Build CharacterSearchModal and selector UI in `src/lib/components/characters/CharacterSearchModal.svelte` and `src/lib/components/characters/CharacterApiSelector.svelte`
- [ ] T053 [US6] Add manual entry option and error states in `src/lib/components/characters/CharacterSearchModal.svelte`
- [ ] T054 [US6] Expose calendar and iCal integration settings UI in `src/routes/(app)/settings/+page.svelte`

---

## Phase 9: User Story 7 - Improved Settings Organization (Priority: P3)
**Goal**: Unified task settings for custom fields and clear notifications section.
**Independent Test**: Custom field creation available in unified task settings; notifications section visible.

### Tests for User Story 7
- [ ] T055 [P] [US7] Add E2E for unified task settings + notifications section in `tests/e2e/settings/task-settings.spec.ts`

### Implementation for User Story 7
- [ ] T056 [US7] Create unified task settings page for custom fields in `src/routes/(app)/settings/tasks/+page.svelte`
- [ ] T057 [US7] Ensure notifications section persists (aligned with US3 change) in `src/routes/(app)/settings/+page.svelte`

---

## Phase 10: Polish & Cross-Cutting Concerns
**Purpose**: Final hardening, docs, and coverage checks.

- [x] T058 [P] Update documentation and checklists in `docs/bugfix-list.md` and `specs/004-bugfix-testing/quickstart.md`
- [X] T059 Run coverage and quality gates (`bun test --coverage`, lint) and address gaps across tasks in `tests/`
- [ ] T060 [P] Refine performance (debounce API aggregation, reduce bundle size) in `src/lib/utils/apiAggregation.ts` and character components
- [ ] T061 [P] Security/RLS verification for new policies in `supabase/migrations/` and Supabase dashboard

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → All User Stories (Phases 3-9) → **Polish (Phase 10)**
- User stories are independent after foundational is complete. Recommended order by priority: US1 (P1) → US2 (P1) → US4 (P1) → US3 (P2) → US5 (P2) → US6 (P3) → US7 (P3).

**Dependency Graph (story level)**:
- Foundational → {US1, US2, US4} → {US3, US5} → {US6, US7}

---

## Parallel Execution Examples

- After foundational: US1, US2, and US4 can start in parallel (different areas: tasks, layout, persistence).
- Within US1: T016/T018/T019/T020 can proceed in parallel; T017 waits on API wiring; T021 follows data filters.
- Within US2: T024-T028 parallel; T029 after component styles.
- Tests marked [P] can run/write in parallel to implementation prep.

---

## Implementation Strategy

- **MVP First**: Deliver US1 fully (tasks reliable delete/sync/custom fields). Validate independently before moving on.
- **Incremental**: Complete US2 (mobile), US4 (persistence), then P2 stories (US3, US5), then P3 stories (US6, US7).
- **Testing**: Write/enable tests per story as listed; ensure failing first where feasible.

---

**Format validation**: All tasks follow `- [ ] T### [P?] [Story?] Description with file path`. Tasks are organized by user story for independent implementation and testing. 

