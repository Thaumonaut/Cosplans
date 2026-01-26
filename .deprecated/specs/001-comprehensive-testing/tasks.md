# Tasks: Comprehensive Testing Infrastructure

**Input**: Design documents from `/specs/001-comprehensive-testing/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Constitution Compliance**: Tasks implement Constitution Principle IV (Test-First Development - NON-NEGOTIABLE) and address Critical Blocker #3 (No E2E Tests) from Project Status Review.

**Tests**: This feature IS the testing infrastructure - all tasks create tests that enable test-first development for other MVP features.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each test type.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install test frameworks and create basic project structure

- [x] T001 Install Playwright dependencies: `bun add -D playwright@1.56.1 @playwright/test` ✅ (already installed)
- [x] T002 Install Vitest dependencies: `bun add -D vitest@4.0.3 @testing-library/svelte@5.2.8 @testing-library/jest-dom jsdom` ✅ (already installed)
- [x] T003 Install Faker.js for test data: `bun add -D @faker-js/faker@8.4.1` ✅
- [x] T004 Install Playwright browsers: `bunx playwright install --with-deps` ✅
- [x] T005 [P] Create directory structure: `tests/e2e/`, `tests/unit/`, `tests/integration/`, `tests/utils/`, `tests/config/` ✅
- [x] T006 [P] Create `.env.test` template with Supabase test environment variables ✅
- [x] T007 [P] Add test scripts to `package.json`: `test`, `test:unit`, `test:integration`, `test:e2e`, `test:coverage`, `test:watch` ✅

**Checkpoint**: Test framework dependencies installed and project structure ready

---

## Phase 2: Foundational (US5 - Test Infrastructure & CI/CD)

**Purpose**: Core test infrastructure that MUST be complete before ANY tests can be written

**⚠️ CRITICAL**: No test implementation (US1-US4) can begin until this phase is complete

### User Story 5: Test Infrastructure & CI/CD Integration (Priority: P1)

**Goal**: Automated testing infrastructure that runs on every commit with test data isolation, flaky test handling, and visual regression support.

**Independent Test**: Commit a code change and verify tests run automatically in CI/CD, with results reported and test data cleaned up.

### Configuration Files

- [x] T008 [P] [US5] Create Playwright config in `playwright.config.ts` with multi-browser support (Chromium, Firefox, WebKit), 2-minute timeout, retries: 3, workers: 4, visual regression threshold: 0.05 ✅
- [x] T009 [P] [US5] Create Vitest config in `vitest.config.ts` with 5-second timeout, 80% coverage thresholds, jsdom environment, 8 workers ✅
- [x] T010 [P] [US5] Create timeout configuration in `tests/config/timeouts.ts` with tiered timeouts (Unit: 5s, Integration: 30s, E2E: 2min, warning at 80%) ✅

### Test Utilities (Database Isolation)

- [x] T011 [P] [US5] Create SQL migrations for test schema functions in `supabase/migrations/test-schema-functions.sql`: `create_test_schema()`, `clone_schema_structure()`, `drop_test_schema()`, `list_test_schemas()` ✅
- [x] T012 [P] [US5] Implement test database utilities in `tests/utils/test-database.ts`: `createSchema()`, `cloneSchemaStructure()`, `dropSchema()`, `listTestSchemas()`, `cleanupOrphanedSchemas()` ✅
- [x] T013 [P] [US5] Create test Supabase client in `tests/utils/test-supabase.ts` with schema-scoped queries ✅

### Test Data Factories

- [x] T014 [P] [US5] Create User factory in `tests/utils/factory.ts`: `createTestUser()`, `createTestUserInsert()`, `FIXED_TEST_USERS` (alice, bob, charlie) ✅
- [x] T015 [P] [US5] Create Team factory in `tests/utils/factory.ts`: `createTestTeam()`, `createPersonalTeam()`, `createTestTeamMember()` ✅
- [x] T016 [P] [US5] Create Project factory in `tests/utils/factory.ts`: `createTestProject()`, `createInProgressProject()`, `createCompletedProject()`, `createArchivedProject()`, `createIdeaProject()`, `createPlanningProject()` ✅
- [x] T017 [P] [US5] Create Task factory in `tests/utils/factory.ts`: `createTestTask()`, `createHighPriorityTask()`, `createOverdueTask()` ✅
- [x] T018 [P] [US5] Create Event factory in `tests/utils/factory.ts`: `createTestEvent()`, `createConventionEvent()`, `createPhotoshootEvent()` ✅
- [x] T019 [P] [US5] Create Character factory in `tests/utils/factory.ts`: `createTestCharacter()` ✅
- [x] T020 [P] [US5] Create batch factory utilities in `tests/utils/factory.ts`: `createTestUsers()`, `createTestProjects()`, `createTestTasks()` ✅

### Test Fixtures & Seeding

- [x] T021 [P] [US5] Create test schema setup utility in `tests/integration/fixtures/test-schema.ts`: `setupTestSchema()` returns `TestSchemaContext` with users, teams, projects, cleanup function ✅
- [x] T022 [P] [US5] Create edge case fixtures in `tests/e2e/fixtures/edge-case-projects.ts`: projects with no budget, overdue deadline, long title, special characters ✅
- [x] T023 [P] [US5] Create E2E test users fixture in `tests/e2e/fixtures/test-users.ts`: export `FIXED_TEST_USERS` for consistent E2E tests ✅
- [x] T024 [P] [US5] Create cleanup utility in `tests/utils/cleanup.ts`: `cleanupTestData()`, `resetTestDatabase()` ✅

### Page Object Models (E2E Helpers)

- [x] T025 [P] [US5] Create LoginPage POM in `tests/e2e/support/page-objects/LoginPage.ts` with `login()`, `loginWithGithub()`, `loginWithGoogle()`, `clickSignup()`, `clickForgotPassword()` ✅
- [x] T026 [P] [US5] Create DashboardPage POM in `tests/e2e/support/page-objects/DashboardPage.ts` with `clickCreateProject()`, `navigateToSection()`, `searchProjects()`, `getProjectCount()` ✅
- [x] T027 [P] [US5] Create ProjectPage POM in `tests/e2e/support/page-objects/ProjectPage.ts` with `editProject()`, `deleteProject()`, `archiveProject()`, `updateStatus()` ✅
- [x] T028 [P] [US5] Create TaskPage POM in `tests/e2e/support/page-objects/TaskPage.ts` with `createTask()`, `filterTasks()`, `completeTask()`, `deleteTask()` ✅
- [x] T029 [P] [US5] Create TeamPage POM in `tests/e2e/support/page-objects/TeamPage.ts` with `createTeam()`, `inviteMember()`, `removeMember()` ✅
- [x] T030 [P] [US5] Create E2E helpers in `tests/e2e/support/helpers.ts`: `fillInput()`, `clickButton()`, `selectOption()`, `waitForNavigation()`, `waitForApiCall()` ✅

### Flaky Test Detection & Quarantine

- [x] T031 [P] [US5] Create flaky test reporter in `tests/config/flaky-test-reporter.ts`: custom Playwright reporter that flags tests passing on retry ✅
- [x] T032 [P] [US5] Create quarantine directory with README in `tests/quarantine/README.md`: document quarantine process and weekly review ✅
- [x] T033 [P] [US5] Add flaky test reporter to Playwright config: integrate custom reporter in `playwright.config.ts` ✅

### Mock Utilities

- [x] T034 [P] [US5] Create Supabase mock in `tests/unit/mocks/supabase.ts`: mock Supabase client for unit tests ✅
- [x] T035 [P] [US5] Create API mock in `tests/unit/mocks/api.ts`: mock API client responses for unit tests ✅

### CI/CD Workflows

- [x] T036 [P] [US5] Create unit test workflow in `.github/workflows/test-unit.yml`: run on every commit (push), execute `bun test:unit`, generate coverage ✅
- [x] T037 [P] [US5] Create E2E test workflow in `.github/workflows/test-e2e.yml`: run on pull requests, execute `bun test:e2e`, upload artifacts on failure ✅
- [x] T038 [P] [US5] Create integration test workflow in `.github/workflows/test-integration.yml`: run on pull requests, execute `bun test:integration` ✅
- [x] T039 [P] [US5] Create coverage workflow in `.github/workflows/test-coverage.yml`: upload coverage to Codecov or similar service ✅ (integrated into test-unit.yml)
- [x] T040 [US5] Configure GitHub Actions caching: cache `node_modules` and Playwright browsers in all workflows ✅
- [ ] T041 [US5] Add branch protection rules: require passing tests before merge, require coverage threshold (requires GitHub admin access)

### Test Environment Setup

- [ ] T042 [US5] Create test Supabase project: provision dedicated test database at supabase.com
- [ ] T043 [US5] Apply test schema migrations: run `create_test_schema()` and related functions on test Supabase
- [ ] T044 [US5] Configure test environment variables: set `SUPABASE_TEST_URL` and `SUPABASE_TEST_KEY` in GitHub Actions secrets
- [ ] T045 [US5] Deploy staging environment: persistent test deployment for E2E tests (Cloudflare Pages staging)

### Documentation

- [x] T046 [P] [US5] Copy quickstart.md to project root as `TESTING.md`: developer guide for running tests ✅
- [x] T047 [P] [US5] Add testing section to README.md: quick commands and link to TESTING.md ✅

**Checkpoint**: Test infrastructure complete - test implementation (US1-US4) can now begin in parallel

---

## Phase 3: US1 - Critical User Journey E2E Tests (Priority: P1) 🎯 MVP

**Goal**: E2E tests for 5 critical user journeys (authentication, projects, tasks, teams, resources) to validate MVP features and prevent regressions.

**Independent Test**: Run `bun test:e2e tests/e2e/auth tests/e2e/projects tests/e2e/tasks tests/e2e/teams tests/e2e/resources` and verify all critical journey tests pass.

### Authentication Flow Tests

- [ ] T048 [P] [US1] Create login test in `tests/e2e/auth/login.spec.ts`: test successful login, invalid credentials error, redirect to dashboard
- [ ] T049 [P] [US1] Create signup test in `tests/e2e/auth/signup.spec.ts`: test account creation, email validation, automatic personal team creation
- [ ] T050 [P] [US1] Create logout test in `tests/e2e/auth/logout.spec.ts`: test logout clears session, redirects to login
- [ ] T051 [P] [US1] Create password reset test in `tests/e2e/auth/password-reset.spec.ts`: test reset email sent, reset link works, password updated

### Project Lifecycle Tests

- [ ] T052 [P] [US1] Create project creation test in `tests/e2e/projects/create-project.spec.ts`: test project form, validation, project appears in list
- [ ] T053 [P] [US1] Create project view test in `tests/e2e/projects/view-project.spec.ts`: test project details display, navigation from list
- [ ] T054 [P] [US1] Create project update test in `tests/e2e/projects/update-project.spec.ts`: test editing project fields, budget updates, status changes
- [ ] T055 [P] [US1] Create project archive test in `tests/e2e/projects/archive-project.spec.ts`: test archiving project, archived view, reactivation

### Task Management Tests

- [ ] T056 [P] [US1] Create task creation test in `tests/e2e/tasks/create-task.spec.ts`: test task form, project linking, priority selection
- [ ] T057 [P] [US1] Create task assignment test in `tests/e2e/tasks/assign-task.spec.ts`: test assigning task to team member, notifications
- [ ] T058 [P] [US1] Create task completion test in `tests/e2e/tasks/complete-task.spec.ts`: test marking complete, filtering completed tasks

### Team Creation Tests

- [ ] T059 [P] [US1] Create personal team test in `tests/e2e/teams/personal-team.spec.ts`: test automatic personal team creation on signup
- [ ] T060 [P] [US1] Create private team test in `tests/e2e/teams/private-team.spec.ts`: test creating private team, inviting members, role assignment

### Resource Management Tests

- [ ] T061 [P] [US1] Create props test in `tests/e2e/resources/props.spec.ts`: test adding prop to project, editing prop details, linking to character
- [ ] T062 [P] [US1] Create materials test in `tests/e2e/resources/materials.spec.ts`: test adding materials, quantity tracking, budget linking
- [ ] T063 [P] [US1] Create outfits test in `tests/e2e/resources/outfits.spec.ts`: test creating outfit for character, linking materials, completion tracking

**Checkpoint**: All 5 critical user journeys have passing E2E tests

---

## Phase 4: US2 - Component Unit Tests (Priority: P2)

**Goal**: Unit tests for 60+ UI components to enable confident refactoring and catch regressions early.

**Independent Test**: Run `bun test:unit tests/unit/components` and verify all component tests pass with 80%+ coverage.

### Base UI Component Tests (Flowbite Components)

- [ ] T064 [P] [US2] Create Button test in `tests/unit/components/ui/Button.test.ts`: test rendering, click events, variants (primary, secondary, outline), disabled state, loading state
- [ ] T065 [P] [US2] Create Card test in `tests/unit/components/ui/Card.test.ts`: test rendering, slots (header, footer, default), variants
- [ ] T066 [P] [US2] Create Input test in `tests/unit/components/ui/Input.test.ts`: test value binding, validation, error states, input types
- [ ] T067 [P] [US2] Create Select test in `tests/unit/components/ui/Select.test.ts`: test option rendering, selection, change events, multiple selection
- [ ] T068 [P] [US2] Create Checkbox test in `tests/unit/components/ui/Checkbox.test.ts`: test checked state, change events, disabled state
- [ ] T069 [P] [US2] Create Radio test in `tests/unit/components/ui/Radio.test.ts`: test group behavior, selection, disabled options
- [ ] T070 [P] [US2] Create Modal test in `tests/unit/components/ui/Modal.test.ts`: test open/close, backdrop click, escape key, slots
- [ ] T071 [P] [US2] Create Dropdown test in `tests/unit/components/ui/Dropdown.test.ts`: test toggle, menu items, click outside close
- [ ] T072 [P] [US2] Create Tabs test in `tests/unit/components/ui/Tabs.test.ts`: test tab switching, active state, slots
- [ ] T073 [P] [US2] Create Alert test in `tests/unit/components/ui/Alert.test.ts`: test variants (success, error, warning, info), dismissible
- [ ] T074 [P] [US2] Create Badge test in `tests/unit/components/ui/Badge.test.ts`: test variants, sizes, icons
- [ ] T075 [P] [US2] Create Progress test in `tests/unit/components/ui/Progress.test.ts`: test percentage display, color variants
- [ ] T076 [P] [US2] Create Spinner test in `tests/unit/components/ui/Spinner.test.ts`: test rendering, sizes, colors
- [ ] T077 [P] [US2] Create Tooltip test in `tests/unit/components/ui/Tooltip.test.ts`: test show on hover, positioning, content
- [ ] T078 [P] [US2] Create Accordion test in `tests/unit/components/ui/Accordion.test.ts`: test expand/collapse, multiple open
- [ ] T079 [P] [US2] Create Breadcrumb test in `tests/unit/components/ui/Breadcrumb.test.ts`: test navigation items, active state
- [ ] T080 [P] [US2] Create Pagination test in `tests/unit/components/ui/Pagination.test.ts`: test page navigation, total pages, current page
- [ ] T081 [P] [US2] Create Table test in `tests/unit/components/ui/Table.test.ts`: test rows, columns, sorting, selection
- [ ] T082 [P] [US2] Create Avatar test in `tests/unit/components/ui/Avatar.test.ts`: test image display, fallback initials, sizes
- [ ] T083 [P] [US2] Create Sidebar test in `tests/unit/components/ui/Sidebar.test.ts`: test navigation items, active state, collapse/expand

### Feature Component Tests

- [ ] T084 [P] [US2] Create ProjectCard test in `tests/unit/components/ProjectCard.test.ts`: test project data display, progress bar, budget, status badge, click navigation
- [ ] T085 [P] [US2] Create CharacterCreationForm test in `tests/unit/components/CharacterCreationForm.test.ts`: test form fields, validation, submission, image upload
- [ ] T086 [P] [US2] Create TeamSelector test in `tests/unit/components/TeamSelector.test.ts`: test team list, selection, personal team default
- [ ] T087 [P] [US2] Create TaskList test in `tests/unit/components/TaskList.test.ts`: test task items, filtering, sorting, completion toggle
- [ ] T088 [P] [US2] Create BudgetTracker test in `tests/unit/components/BudgetTracker.test.ts`: test spent/total display, progress, over-budget warning
- [ ] T089 [P] [US2] Create EventCalendar test in `tests/unit/components/EventCalendar.test.ts`: test month view, event markers, click navigation
- [ ] T090 [P] [US2] Create ResourceGallery test in `tests/unit/components/ResourceGallery.test.ts`: test image grid, lightbox, filtering by type
- [ ] T091 [P] [US2] Create MoodboardCreator test in `tests/unit/components/MoodboardCreator.test.ts`: test drag-drop images, layout, save functionality
- [ ] T092 [P] [US2] Create NotificationBell test in `tests/unit/components/NotificationBell.test.ts`: test unread count, dropdown, mark as read
- [ ] T093 [P] [US2] Create AppSidebar test in `tests/unit/components/AppSidebar.test.ts`: test navigation items, active route highlighting, collapse state

### Svelte Store Tests

- [ ] T094 [P] [US2] Create projects store test in `tests/unit/stores/projects.test.ts`: test `loadProjects()`, `addProject()`, `updateProject()`, `deleteProject()`, derived stores (activeProjects, completedProjects, etc.)
- [ ] T095 [P] [US2] Create tasks store test in `tests/unit/stores/tasks.test.ts`: test task CRUD operations, filtering, derived counts
- [ ] T096 [P] [US2] Create events store test in `tests/unit/stores/events.test.ts`: test event CRUD operations, filtering by type, upcoming events
- [ ] T097 [P] [US2] Create auth store test in `tests/unit/stores/auth-store.test.ts`: test login, logout, session management, user state
- [ ] T098 [P] [US2] Create settings store test in `tests/unit/stores/settings.test.ts`: test theme toggle, notification preferences, auto-save
- [ ] T099 [P] [US2] Create theme store test in `tests/unit/stores/theme.test.ts`: test light/dark/system modes, persistence

### Utility Function Tests

- [ ] T100 [P] [US2] Create utils test in `tests/unit/utils/utils.test.ts`: test helper functions (formatDate, formatCurrency, truncateText, etc.)
- [ ] T101 [P] [US2] Create validation test in `tests/unit/utils/validation.test.ts`: test form validation functions (email, password, required fields)

**Checkpoint**: All 60+ components and stores have passing unit tests with 80%+ coverage

---

## Phase 5: US3 - Integration Tests for Data Layer (Priority: P2)

**Goal**: Integration tests for service layer, data transformers, and RLS policies to verify Supabase interactions work correctly.

**Independent Test**: Run `bun test:integration` against test Supabase and verify all CRUD operations and RLS policies work correctly.

### Service Layer Tests

- [ ] T102 [P] [US3] Create ProjectService test in `tests/integration/services/projectService.test.ts`: test create, read, update, delete, list, filter by status, team scoping
- [ ] T103 [P] [US3] Create TaskService test in `tests/integration/services/taskService.test.ts`: test CRUD, project linking, priority filtering, completion toggle
- [ ] T104 [P] [US3] Create TeamService test in `tests/integration/services/teamService.test.ts`: test create team, add members, update roles, remove members, personal team auto-creation
- [ ] T105 [P] [US3] Create BudgetService test in `tests/integration/services/budgetService.test.ts`: test expense tracking, budget calculations, over-budget alerts
- [ ] T106 [P] [US3] Create EventService test in `tests/integration/services/eventService.test.ts`: test CRUD, type filtering, date range queries, project linking
- [ ] T107 [P] [US3] Create ResourceService test in `tests/integration/services/resourceService.test.ts`: test CRUD for props, materials, outfits, project linking, many-to-many relationships

### Data Transformer Tests

- [ ] T108 [P] [US3] Create projectTransformer test in `tests/integration/transformers/projectTransformer.test.ts`: test API to domain transformation, domain to API transformation, field mapping
- [ ] T109 [P] [US3] Create taskTransformer test in `tests/integration/transformers/taskTransformer.test.ts`: test bidirectional transformation, date formatting, priority mapping

### Row Level Security (RLS) Policy Tests

- [ ] T110 [P] [US3] Create team-policies test in `tests/integration/rls/team-policies.test.ts`: test users can only see their teams, team members have correct access levels (owner/admin/member/viewer)
- [ ] T111 [P] [US3] Create project-policies test in `tests/integration/rls/project-policies.test.ts`: test users can only access projects through team membership, project CRUD respects team permissions
- [ ] T112 [P] [US3] Create resource-policies test in `tests/integration/rls/resource-policies.test.ts`: test resources scoped to team projects, users can't access other teams' resources

**Checkpoint**: All service layer tests pass with 100% CRUD coverage and RLS policies validated

---

## Phase 6: US4 - Important Workflow E2E Tests (Priority: P3)

**Goal**: E2E tests for important workflows beyond critical journeys (event planning, budget, resources) to maintain quality across the application.

**Independent Test**: Run `bun test:e2e tests/e2e/conventions tests/e2e/photoshoots tests/e2e/budget tests/e2e/characters tests/e2e/calendar` and verify all important workflow tests pass.

### Convention Planning Tests

- [ ] T113 [P] [US4] Create convention discovery test in `tests/e2e/conventions/discovery.spec.ts`: test searching conventions, filtering by location/date
- [ ] T114 [P] [US4] Create convention planning test in `tests/e2e/conventions/planning.spec.ts`: test adding convention to calendar, creating packing list, linking projects
- [ ] T115 [P] [US4] Create convention budget test in `tests/e2e/conventions/budget.spec.ts`: test budget tracking for artist alley, receipts

### Photoshoot Planning Tests

- [ ] T116 [P] [US4] Create photoshoot creation test in `tests/e2e/photoshoots/create.spec.ts`: test photoshoot form, date/location selection, project linking
- [ ] T117 [P] [US4] Create photoshoot crew test in `tests/e2e/photoshoots/crew.spec.ts`: test adding crew members, assigning roles (photographer, makeup, etc.)
- [ ] T118 [P] [US4] Create photoshoot equipment test in `tests/e2e/photoshoots/equipment.spec.ts`: test linking equipment (cameras, lights), availability tracking

### Budget Tracking Tests

- [ ] T119 [P] [US4] Create expense tracking test in `tests/e2e/budget/expenses.spec.ts`: test adding expenses, categorization, receipt upload
- [ ] T120 [P] [US4] Create budget alerts test in `tests/e2e/budget/alerts.spec.ts`: test over-budget warnings, approaching limit notifications

### Character & Moodboard Tests

- [ ] T121 [P] [US4] Create character creation test in `tests/e2e/characters/create.spec.ts`: test character form, reference images, series selection
- [ ] T122 [P] [US4] Create moodboard creation test in `tests/e2e/moodboards/create.spec.ts`: test adding images/videos, organizing layout, linking to project

### Calendar & Timeline Tests

- [ ] T123 [P] [US4] Create calendar view test in `tests/e2e/calendar/view.spec.ts`: test month/week views, event display, filtering by type
- [ ] T124 [P] [US4] Create timeline view test in `tests/e2e/timeline/view.spec.ts`: test gantt chart display, milestone markers, project deadlines

**Checkpoint**: All important workflows have passing E2E tests

---

## Phase 7: Visual Regression Tests (Priority: P2)

**Goal**: Visual regression tests for all 60+ components and critical pages to catch UI breakages.

**Independent Test**: Run `bun test:e2e tests/e2e/visual-regression` and verify all visual regression tests pass with 95%+ accuracy.

### Component Visual Regression

- [ ] T125 [US2] Create component visual regression test in `tests/e2e/visual-regression/components.spec.ts`: test all 60+ components in isolation (Button default/hover/disabled, Card variants, Input states, Select options, etc.) using Playwright `toHaveScreenshot()` with 0.05 threshold

### Page Visual Regression

- [ ] T126 [US1] Create page visual regression test in `tests/e2e/visual-regression/pages.spec.ts`: test critical pages (login, signup, dashboard, project list, project detail, task list) for visual changes

### Component Preview Route (Dev-Only)

- [ ] T127 [US2] Create component preview route in `src/routes/component-preview/[component]/+page.svelte`: render component in isolation with known props for visual regression testing (dev environment only)

**Checkpoint**: All components and critical pages have visual regression coverage

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple test types

### Coverage & Reporting

- [ ] T128 [P] Generate coverage report: Run `bun test:coverage` and verify 80%+ overall coverage, 100% for critical paths (auth, projects, teams)
- [ ] T129 [P] Validate E2E test performance: Ensure E2E suite completes in <10 minutes with parallel execution
- [ ] T130 [P] Validate unit test performance: Ensure unit suite completes in <30 seconds

### Documentation

- [ ] T131 [P] Update TESTING.md with all test types and examples
- [ ] T132 [P] Document flaky test quarantine process in `tests/quarantine/README.md`
- [ ] T133 [P] Add troubleshooting section to TESTING.md for common issues

### Cleanup & Maintenance

- [ ] T134 [P] Run orphaned schema cleanup: Execute `bun run test:cleanup` to remove old test schemas
- [ ] T135 [P] Validate test data isolation: Run tests in parallel and verify no interference
- [ ] T136 [P] Validate CI/CD integration: Trigger workflows and verify all tests run correctly

### Final Validation

- [ ] T137 Run quickstart.md validation: Follow quickstart guide and verify all commands work
- [ ] T138 Run full test suite: `bun test` and verify all tests pass
- [ ] T139 Deploy test environment: Verify staging environment is accessible and test database is configured
- [ ] T140 Submit PR: Create pull request and verify all CI/CD workflows pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2 - US5)**: Depends on Setup completion - **BLOCKS all test implementation (US1-US4)**
- **US1 Critical E2E Tests (Phase 3)**: Depends on Foundational (Phase 2) - Can start after infrastructure ready
- **US2 Component Unit Tests (Phase 4)**: Depends on Foundational (Phase 2) - Can start after infrastructure ready, **parallel with US1**
- **US3 Integration Tests (Phase 5)**: Depends on Foundational (Phase 2) AND Database Schema + Data Abstraction Layer (external blockers) - **BLOCKED until services exist**
- **US4 Important Workflow E2E Tests (Phase 6)**: Depends on Foundational (Phase 2) - Can start after infrastructure ready, **parallel with US1/US2**
- **Visual Regression (Phase 7)**: Depends on US2 (component tests) - Can start after component tests exist
- **Polish (Phase 8)**: Depends on all desired tests being complete

### User Story Dependencies

- **US5 (Infrastructure - P1)**: No dependencies on other stories - **MUST complete first (foundational)**
- **US1 (Critical E2E - P1)**: Depends on US5 - Can start immediately after infrastructure ready
- **US2 (Component Unit - P2)**: Depends on US5 - Can run **parallel with US1**
- **US3 (Integration - P2)**: Depends on US5 + Database Schema + Service Layer (external blockers) - **BLOCKED**
- **US4 (Important E2E - P3)**: Depends on US5 - Can run **parallel with US1/US2**

### External Blockers

**US3 (Integration Tests) is blocked by**:
- Critical Blocker #1: Database Schema Missing (from Project Status Review)
- Critical Blocker #2: Data Abstraction Layer Missing (from Project Status Review)

**Recommended approach**: Implement US1, US2, US4, US5 first. Once database schema and service layer exist, add US3.

### Within Each User Story

#### US5 (Infrastructure):
1. Configuration files (T008-T010) - parallel
2. SQL migrations (T011) - before database utilities (T012-T013)
3. Factories (T014-T020) - parallel
4. Fixtures & POMs (T021-T030) - parallel, after factories
5. Flaky detection (T031-T033) - parallel
6. Mocks (T034-T035) - parallel
7. CI/CD workflows (T036-T041) - parallel
8. Environment setup (T042-T045) - sequential (provision → migrate → configure → deploy)
9. Documentation (T046-T047) - parallel

#### US1 (Critical E2E):
- All auth tests (T048-T051) - parallel
- All project tests (T052-T055) - parallel
- All task tests (T056-T058) - parallel
- All team tests (T059-T060) - parallel
- All resource tests (T061-T063) - parallel
- **All test files can run in parallel**

#### US2 (Component Unit):
- All base UI component tests (T064-T083) - parallel
- All feature component tests (T084-T093) - parallel
- All store tests (T094-T099) - parallel
- All utility tests (T100-T101) - parallel
- **All test files can run in parallel**

#### US3 (Integration):
- All service tests (T102-T107) - parallel
- All transformer tests (T108-T109) - parallel
- All RLS tests (T110-T112) - parallel
- **All test files can run in parallel**

#### US4 (Important E2E):
- All convention tests (T113-T115) - parallel
- All photoshoot tests (T116-T118) - parallel
- All budget tests (T119-T120) - parallel
- All character/moodboard tests (T121-T122) - parallel
- All calendar/timeline tests (T123-T124) - parallel
- **All test files can run in parallel**

### Parallel Opportunities

- **Phase 1 (Setup)**: T001-T007 can all run in sequence (dependencies installed before scripts added)
- **Phase 2 (US5)**: Most tasks marked [P] can run in parallel (different files)
- **Phase 3-6 (US1, US2, US4)**: Once US5 completes, all three can start in parallel
- **Within each user story**: All [P] tasks (most test files) can run in parallel

---

## Parallel Example: US1 (Critical E2E Tests)

```bash
# After US5 (infrastructure) completes, launch all US1 tests in parallel:

# Authentication tests (parallel):
Task T048: "Create login test in tests/e2e/auth/login.spec.ts"
Task T049: "Create signup test in tests/e2e/auth/signup.spec.ts"
Task T050: "Create logout test in tests/e2e/auth/logout.spec.ts"
Task T051: "Create password reset test in tests/e2e/auth/password-reset.spec.ts"

# Project tests (parallel):
Task T052: "Create project creation test in tests/e2e/projects/create-project.spec.ts"
Task T053: "Create project view test in tests/e2e/projects/view-project.spec.ts"
Task T054: "Create project update test in tests/e2e/projects/update-project.spec.ts"
Task T055: "Create project archive test in tests/e2e/projects/archive-project.spec.ts"

# Task tests (parallel):
Task T056: "Create task creation test in tests/e2e/tasks/create-task.spec.ts"
Task T057: "Create task assignment test in tests/e2e/tasks/assign-task.spec.ts"
Task T058: "Create task completion test in tests/e2e/tasks/complete-task.spec.ts"

# Team tests (parallel):
Task T059: "Create personal team test in tests/e2e/teams/personal-team.spec.ts"
Task T060: "Create private team test in tests/e2e/teams/private-team.spec.ts"

# Resource tests (parallel):
Task T061: "Create props test in tests/e2e/resources/props.spec.ts"
Task T062: "Create materials test in tests/e2e/resources/materials.spec.ts"
Task T063: "Create outfits test in tests/e2e/resources/outfits.spec.ts"
```

**All 16 test files can be created in parallel** - no dependencies between them.

---

## Parallel Example: US2 (Component Unit Tests)

```bash
# After US5 completes, launch all US2 tests in parallel:

# Base UI component tests (parallel - first 10 examples):
Task T064: "Create Button test in tests/unit/components/ui/Button.test.ts"
Task T065: "Create Card test in tests/unit/components/ui/Card.test.ts"
Task T066: "Create Input test in tests/unit/components/ui/Input.test.ts"
Task T067: "Create Select test in tests/unit/components/ui/Select.test.ts"
Task T068: "Create Checkbox test in tests/unit/components/ui/Checkbox.test.ts"
Task T069: "Create Radio test in tests/unit/components/ui/Radio.test.ts"
Task T070: "Create Modal test in tests/unit/components/ui/Modal.test.ts"
Task T071: "Create Dropdown test in tests/unit/components/ui/Dropdown.test.ts"
Task T072: "Create Tabs test in tests/unit/components/ui/Tabs.test.ts"
Task T073: "Create Alert test in tests/unit/components/ui/Alert.test.ts"
# ... (T074-T083 all parallel)

# Feature component tests (parallel):
Task T084: "Create ProjectCard test in tests/unit/components/ProjectCard.test.ts"
Task T085: "Create CharacterCreationForm test in tests/unit/components/CharacterCreationForm.test.ts"
# ... (T086-T093 all parallel)

# Store tests (parallel):
Task T094: "Create projects store test in tests/unit/stores/projects.test.ts"
Task T095: "Create tasks store test in tests/unit/stores/tasks.test.ts"
# ... (T096-T099 all parallel)
```

**All 38 test files can be created in parallel** - no dependencies between them.

---

## Implementation Strategy

### MVP First (Infrastructure + Critical Tests)

1. Complete **Phase 1: Setup** (install dependencies, create structure)
2. Complete **Phase 2: US5 - Infrastructure** (CRITICAL - blocks everything)
3. Complete **Phase 3: US1 - Critical E2E Tests** (P1 - highest value)
4. **STOP and VALIDATE**: Run `bun test:e2e tests/e2e/auth tests/e2e/projects tests/e2e/tasks tests/e2e/teams tests/e2e/resources` and verify all critical journeys pass
5. Deploy infrastructure to staging and validate CI/CD integration

**At this point**: MVP has test-first capability for critical user journeys (constitutional requirement satisfied).

### Incremental Delivery

1. Setup + US5 (Infrastructure) → **Foundation ready for test-first development**
2. Add US1 (Critical E2E) → **Can validate MVP features as they're built**
3. Add US2 (Component Unit) → **Fast feedback during component development**
4. Add US4 (Important E2E) → **Extended coverage for secondary features**
5. Add US3 (Integration) → **Once database schema + services exist (external dependency)**
6. Each phase adds test coverage without breaking previous tests

### Parallel Team Strategy

With multiple developers:

1. Team completes **Setup (Phase 1)** together
2. Team completes **US5 (Infrastructure - Phase 2)** together - **MUST finish before splitting**
3. Once US5 is done, split work:
   - **Developer A**: US1 (Critical E2E Tests) - 16 test files
   - **Developer B**: US2 (Component Unit Tests) - 38 test files
   - **Developer C**: US4 (Important E2E Tests) - 12 test files
4. US3 (Integration Tests) can start once external dependencies (schema + services) are ready

**Estimated effort**:
- Phase 1 (Setup): 1-2 hours
- Phase 2 (US5 - Infrastructure): 2-3 days (1 developer) or 1-2 days (team)
- Phase 3 (US1 - Critical E2E): 3-5 days (1 developer)
- Phase 4 (US2 - Component Unit): 5-8 days (1 developer)
- Phase 5 (US3 - Integration): 3-5 days (1 developer) - **blocked by external dependencies**
- Phase 6 (US4 - Important E2E): 2-4 days (1 developer)
- Phase 7 (Visual Regression): 1-2 days (1 developer)
- Phase 8 (Polish): 1 day

**Total**: ~4-6 weeks (1 developer) or ~2-3 weeks (team of 3 working in parallel)

---

## Task Summary

### Total Tasks: 140

**By Phase**:
- Phase 1 (Setup): 7 tasks
- Phase 2 (US5 - Infrastructure): 40 tasks
- Phase 3 (US1 - Critical E2E): 16 tasks
- Phase 4 (US2 - Component Unit): 38 tasks
- Phase 5 (US3 - Integration): 11 tasks
- Phase 6 (US4 - Important E2E): 12 tasks
- Phase 7 (Visual Regression): 3 tasks
- Phase 8 (Polish): 13 tasks

**By Priority**:
- P1 (MVP): 63 tasks (Setup + US5 + US1 + partial US2)
- P2: 49 tasks (remaining US2 + US3 + Visual Regression)
- P3: 12 tasks (US4)
- Polish: 13 tasks

**Parallel Opportunities**: 115+ tasks marked [P] can run in parallel within their phase

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability
- **External blockers**: US3 (Integration Tests) blocked until database schema and service layer exist (Critical Blockers #1 and #2 from Project Status Review)
- **Test-first approach**: This infrastructure enables test-first development for all MVP features
- **Constitutional compliance**: Addresses Principle IV (Test-First Development) and Critical Blocker #3 (No E2E Tests)
- **Incremental value**: Each phase delivers testable value independently
- **Commit frequently**: Commit after completing each task or logical group
- **Stop at checkpoints**: Validate each phase independently before proceeding

