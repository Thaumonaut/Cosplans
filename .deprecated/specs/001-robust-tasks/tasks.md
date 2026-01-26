# Tasks: Robust Task Management

**Input**: Design documents from `/specs/001-robust-tasks/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Constitution Compliance**: Tasks implement features per `.specify/memory/constitution.md` principles (Project-Centric, MVP First, Modular organization by domain)

**Tests**: E2E tests are included for critical user journeys (P1 bug fixes) per test-first approach in constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

**Web application (SvelteKit monorepo)**: `src/`, `supabase/migrations/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration framework and project structure verification

- [x] T001 Verify project structure matches plan.md in `/home/jek/Downloads/cosplay-tracker/`
- [x] T002 [P] Verify Supabase CLI is configured and migrations directory exists at `supabase/migrations/`
- [x] T003 [P] Verify TypeScript and Svelte 5 (Runes) are configured correctly in `tsconfig.json` and `svelte.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database migrations and type definitions that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create migration to add `team_id` column to `tasks` table in `supabase/migrations/20251102140000_add_task_team_id.sql`
- [x] T005 Create migration to add `stage_id` column to `tasks` table in `supabase/migrations/20251102140001_add_task_stage_id.sql`
- [x] T006 Create migration to create `task_stages` table in `supabase/migrations/20251102140002_create_task_stages.sql`
- [x] T007 Create migration to create default task stages for all existing teams in `supabase/migrations/20251102140003_create_default_task_stages.sql`
- [x] T008 Create migration to migrate existing tasks to default stages based on `completed` boolean in `supabase/migrations/20251102140004_migrate_tasks_to_stages.sql`
- [x] T009 Update TypeScript types to add `TaskStage` interface and update `Task` interface with `teamId` and `stageId` in `src/lib/types/domain/task.ts`
- [x] T010 Create migration to update RLS policies for team-based task scoping in `supabase/migrations/20251102140005_fix_task_rls_policies.sql`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Fix Task Completion Bug (Priority: P1) 🎯 MVP

**Goal**: Fix critical bug where task completion toggles reset. Ensure stage changes persist to database and UI reflects completed state without resetting.

**Independent Test**: Create a task, drag it to the "Done" stage (or use completion action), verify the task stays in the completed stage after the update. Test in both kanban and detail views. Refresh page and verify state persists.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Create E2E test for task completion persistence in `tests/e2e/tasks/task-completion.spec.ts`
- [ ] T012 [P] [US1] Create E2E test for stage changes persisting in kanban view in `tests/e2e/tasks/task-completion.spec.ts`

### Implementation for User Story 1

- [x] T013 [US1] Investigate completion bug in `src/lib/components/tasks/TaskDetail.svelte` - verify reactive state updates after API calls
- [x] T014 [US1] Update `taskService.update` method to ensure `stageId` changes persist in `src/lib/api/services/taskService.ts`
- [x] T015 [US1] Fix `handleDrop` function in `src/routes/(auth)/tasks/+page.svelte` to use `moveToStage` instead of `toggleComplete`
- [x] T016 [US1] Add `moveToStage` method to task service in `src/lib/api/services/taskService.ts`
- [x] T017 [US1] Update task store to handle stage changes correctly in `src/lib/stores/tasks-store.ts`
- [x] T018 [US1] Fix error handling in task update - show errors and revert UI state if update fails in `src/lib/components/tasks/TaskDetail.svelte`
- [x] T019 [US1] Verify completion status is derived from `stage.is_completion_stage` in task mapping function in `src/lib/api/services/taskService.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Task completion should persist correctly.

---

## Phase 4: User Story 2 - Secure Task Visibility (Priority: P1) 🎯 MVP

**Goal**: Fix critical security/privacy bug where tasks are visible to all accounts. Ensure tasks are only visible to team members via proper RLS enforcement.

**Independent Test**: Create a task as User A (Team 1), verify User B (Team 2) cannot see it, verify User C (same team as User A) can see it. Test both project-scoped and standalone tasks.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US2] Create E2E test for cross-team task visibility isolation in `tests/e2e/tasks/task-visibility.spec.ts`
- [ ] T021 [P] [US2] Create E2E test for standalone task team scoping in `tests/e2e/tasks/task-visibility.spec.ts`

### Implementation for User Story 2

- [x] T022 [US2] Verify RLS policies filter tasks by team membership in `supabase/migrations/20251102140005_fix_task_rls_policies.sql`
- [x] T023 [US2] Update `taskService.list` to filter by current active team by default in `src/lib/api/services/taskService.ts`
- [x] T024 [US2] Update `taskService.listAll` to enforce team-based filtering via RLS in `src/lib/api/services/taskService.ts`
- [x] T025 [US2] Ensure standalone task creation sets `team_id` from current active team in `src/lib/api/services/taskService.ts`
- [x] T026 [US2] Update task creation form to default `teamId` to current active team in `src/lib/components/tasks/TaskDetail.svelte`
- [x] T027 [US2] Add team selector to standalone task creation form in `src/lib/components/tasks/TaskDetail.svelte`
- [x] T028 [US2] Update RLS SELECT policy to filter project-scoped tasks via `projects.team_id` in `supabase/migrations/20251102140005_fix_task_rls_policies.sql`
- [x] T029 [US2] Update RLS SELECT policy to filter standalone tasks via `tasks.team_id` in `supabase/migrations/20251102140005_fix_task_rls_policies.sql`
- [ ] T030 [US2] Test cross-team data isolation - verify User A's tasks are not visible to User B in different team
- [ ] T031 [US2] Add logging for RLS policy violations if any in `src/lib/api/services/taskService.ts`

**Checkpoint**: At this point, User Story 2 should be fully functional. Tasks should only be visible to team members.

---

## Phase 5: User Story 3 - Modern Task Card Design (Priority: P1)

**Goal**: Create task cards that follow modern task management design patterns with all key information displayed clearly.

**Independent Test**: View tasks in kanban/list view, verify cards display all information clearly with modern styling, proper spacing, and visual hierarchy. Compare with industry-standard task management tools (Linear, Asana, Trello).

### Implementation for User Story 3

- [x] T032 [P] [US3] Create modern `TaskCard.svelte` component with all info fields in `src/lib/components/tasks/TaskCard.svelte`
- [x] T033 [US3] Display task title with proper typography (`text-base font-semibold`) in `src/lib/components/tasks/TaskCard.svelte`
- [x] T034 [US3] Display description preview with `line-clamp-3` and placeholder text "No description provided" in `src/lib/components/tasks/TaskCard.svelte`
- [x] T035 [US3] Display priority badge with color-coded styling (high=red, medium=yellow, low=blue) in `src/lib/components/tasks/TaskCard.svelte`
- [x] T036 [US3] Display due date with icon and formatted date or "No due date" placeholder in `src/lib/components/tasks/TaskCard.svelte`
- [x] T037 [US3] Display assigned user with avatar/initials or "Unassigned" placeholder in `src/lib/components/tasks/TaskCard.svelte`
- [x] T038 [US3] Display project link at bottom with separator or "No project linked" placeholder in `src/lib/components/tasks/TaskCard.svelte`
- [x] T039 [US3] Add hover states and transitions for interactivity in `src/lib/components/tasks/TaskCard.svelte`
- [x] T040 [US3] Update kanban view to use new `TaskCard` component in `src/routes/(auth)/tasks/+page.svelte`
- [x] T041 [US3] Update list view to use new `TaskCard` component in `src/routes/(auth)/tasks/+page.svelte`
- [x] T042 [US3] Ensure consistent spacing and visual hierarchy (`p-5`, `gap-3`, `rounded-xl`) in `src/lib/components/tasks/TaskCard.svelte`

**Checkpoint**: At this point, User Story 3 should be complete. Task cards should be modern and scannable.

---

## Phase 6: User Story 4 - Scrollable Kanban Board (Priority: P2)

**Goal**: Make kanban board columns independently scrollable so teams can manage many tasks without layout issues.

**Independent Test**: Add 20+ tasks to a kanban stage, verify columns scroll independently without affecting other columns or the page layout. Verify smooth scrolling and preserved drag-and-drop functionality.

### Implementation for User Story 4

- [x] T043 [US4] Add `overflow-y-auto` and `max-h-[600px]` to kanban column containers in `src/routes/(auth)/tasks/+page.svelte`
- [x] T044 [US4] Make column headers sticky with `position: sticky top-0 z-10 bg-card` in `src/routes/(auth)/tasks/+page.svelte`
- [x] T045 [US4] Verify drag-and-drop works correctly with scrollable columns in `src/routes/(auth)/tasks/+page.svelte`
- [x] T046 [US4] Implement auto-scroll on drop - scroll column to show dropped task in `src/routes/(auth)/tasks/+page.svelte`
- [ ] T047 [US4] Test with 50+ tasks per column to verify smooth scrolling performance
- [x] T048 [US4] Ensure column headers remain visible when scrolling in `src/routes/(auth)/tasks/+page.svelte`

**Checkpoint**: At this point, User Story 4 should be complete. Kanban columns should scroll independently.

---

## Phase 7: User Story 5 - Custom Task Stages (Priority: P2)

**Goal**: Allow teams to define custom task stages beyond default "todo/in-progress/done" so tasks can follow team-specific workflows.

**Independent Test**: Create custom stages as owner/editor, verify kanban board displays custom stages as columns. Move tasks between custom stages and verify updates persist.

### Tests for User Story 5

- [ ] T049 [P] [US5] Create E2E test for custom stage configuration in `tests/e2e/tasks/task-stages.spec.ts`
- [ ] T050 [P] [US5] Create E2E test for kanban displaying custom stages in `tests/e2e/tasks/task-stages.spec.ts`

### Implementation for User Story 5

- [x] T051 [US5] Create `taskStageService.ts` with list, create, update, delete, and ensureDefaults methods in `src/lib/api/services/taskStageService.ts`
- [x] T052 [US5] Update kanban view to load team's custom stages instead of hardcoded stages in `src/routes/(auth)/tasks/+page.svelte`
- [x] T053 [US5] Render kanban columns dynamically from team's stages (ordered by `display_order`) in `src/routes/(auth)/tasks/+page.svelte`
- [x] T054 [US5] Create stage management UI component for settings page in `src/lib/components/tasks/TaskStageSettings.svelte`
- [x] T055 [US5] Implement add stage functionality in `src/lib/components/tasks/TaskStageSettings.svelte`
- [x] T056 [US5] Implement remove stage functionality with validation (prevent if tasks reference it) in `src/lib/components/tasks/TaskStageSettings.svelte`
- [x] T057 [US5] Implement reorder stages functionality (update `display_order`) in `src/lib/components/tasks/TaskStageSettings.svelte`
- [x] T058 [US5] Enforce at least one completion stage per team in application logic in `src/lib/components/tasks/TaskStageSettings.svelte`
- [x] T059 [US5] Restrict stage management to owners and editors only (viewers can see but not modify) in `src/lib/components/tasks/TaskStageSettings.svelte`
- [x] T060 [US5] Add stage management route to settings page in `src/routes/(auth)/settings/task-stages/+page.svelte`
- [x] T061 [US5] Update task creation to default to first non-completion stage in `src/lib/api/services/taskService.ts`
- [ ] T062 [US5] Verify custom stage changes apply immediately to all team members viewing kanban

**Checkpoint**: At this point, User Story 5 should be complete. Teams should be able to configure custom stages.

---

## Phase 8: User Story 6 - Enhanced Dashboard Task Display (Priority: P3)

**Goal**: Improve visual presentation of tasks on the dashboard for better scanability and visual hierarchy.

**Independent Test**: View dashboard, verify tasks are displayed with improved visual design. Verify tasks show key info in compact format and handle overflow gracefully.

### Implementation for User Story 6

- [ ] T063 [US6] Update dashboard task widget with improved visual hierarchy in `src/routes/(auth)/dashboard/+page.svelte`
- [ ] T064 [US6] Improve spacing and typography for dashboard task cards in `src/routes/(auth)/dashboard/+page.svelte`
- [ ] T065 [US6] Display key information (title, priority, due date, assigned user) in compact format in `src/routes/(auth)/dashboard/+page.svelte`
- [ ] T066 [US6] Add hover and click interactions with clear feedback in `src/routes/(auth)/dashboard/+page.svelte`
- [ ] T067 [US6] Implement overflow handling - add scroll or "View All" link for many tasks in `src/routes/(auth)/dashboard/+page.svelte`
- [ ] T068 [US6] Ensure dashboard tasks link to full task detail or task list page

**Checkpoint**: At this point, User Story 6 should be complete. Dashboard tasks should be visually appealing.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final polish

- [ ] T069 [P] Add team filter dropdown to task list page in `src/routes/(auth)/tasks/+page.svelte`
- [ ] T070 [P] Implement "Show all teams" toggle with team indicators on task cards in `src/routes/(auth)/tasks/+page.svelte`
- [ ] T071 [P] Update task cards to show team name indicator when in multi-team view in `src/lib/components/tasks/TaskCard.svelte`
- [ ] T072 Add error boundaries for task operations in task-related components
- [ ] T073 [P] Update documentation in `README.md` with custom stages configuration
- [ ] T074 Code cleanup and refactoring - remove deprecated `completed` boolean usage (after migration period)
- [ ] T075 [P] Performance optimization - verify indexes are used correctly for team-scoped queries
- [ ] T076 Run quickstart.md validation - verify all implementation steps completed
- [ ] T077 Security hardening - verify RLS policies prevent all cross-team data leaks
- [ ] T078 Accessibility improvements - add ARIA labels to task cards and kanban columns
- [ ] T079 [P] Mobile responsive improvements for kanban board on small screens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Fix Completion Bug**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1) - Secure Visibility**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1) - Modern Cards**: Can start after Foundational (Phase 2) - Works with US1 but independently testable
- **User Story 4 (P2) - Scrollable Kanban**: Can start after Foundational (Phase 2) - Enhances existing kanban, works with US3
- **User Story 5 (P2) - Custom Stages**: Can start after Foundational (Phase 2) - Requires stages table from Phase 2
- **User Story 6 (P3) - Dashboard Display**: Can start after Foundational (Phase 2) - Enhances existing dashboard

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Database migrations before service updates
- Service updates before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create E2E test for task completion persistence in tests/e2e/tasks/task-completion.spec.ts"
Task: "Create E2E test for stage changes persisting in kanban view in tests/e2e/tasks/task-completion.spec.ts"

# Implementation tasks can proceed after tests are written:
Task: "Investigate completion bug in src/lib/components/tasks/TaskDetail.svelte"
Task: "Update taskService.update method in src/lib/api/services/taskService.ts"
```

---

## Parallel Example: User Story 5

```bash
# Service implementation and settings UI can be developed in parallel:
Task: "Create taskStageService.ts in src/lib/api/services/taskStageService.ts"
Task: "Create stage management UI component in src/lib/components/tasks/TaskStageSettings.svelte"

# Then integrate:
Task: "Update kanban view to load team's custom stages"
Task: "Render kanban columns dynamically from team's stages"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Fix Completion Bug)
4. Complete Phase 4: User Story 2 (Secure Visibility)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Completion bug fixed!)
3. Add User Story 2 → Test independently → Deploy/Demo (Visibility bug fixed!)
4. Add User Story 3 → Test independently → Deploy/Demo (Modern cards!)
5. Add User Story 4 → Test independently → Deploy/Demo (Scrollable kanban!)
6. Add User Story 5 → Test independently → Deploy/Demo (Custom stages!)
7. Add User Story 6 → Test independently → Deploy/Demo (Enhanced dashboard!)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Completion Bug)
   - Developer B: User Story 2 (Visibility Bug)
   - Developer C: User Story 3 (Modern Cards)
3. After P1 stories complete:
   - Developer A: User Story 4 (Scrollable Kanban)
   - Developer B: User Story 5 (Custom Stages)
   - Developer C: User Story 6 (Dashboard Display)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Critical**: Phase 2 (Foundational) MUST be complete before any user story work begins

## Summary

- **Total Tasks**: 79
- **Tasks per Story**: US1 (9), US2 (12), US3 (11), US4 (6), US5 (14), US6 (6), Setup (3), Foundational (7), Polish (11)
- **MVP Scope**: User Stories 1 & 2 (P1 bug fixes)
- **Suggested MVP**: Complete Phase 1, Phase 2, Phase 3 (US1), Phase 4 (US2), then validate and deploy

