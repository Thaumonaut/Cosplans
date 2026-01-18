# Tasks: Previously Undocumented Features

**Input**: Design documents from `/specs/005-undocumented-features/`  
**Prerequisites**: spec.md  
**Constitution Compliance**: Project-centric, modular by domain  
**Tests**: Included for all user stories (test-first approach)

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Ensure test environment and dependencies are ready.

- [x] T001 Verify Playwright E2E configuration supports theme-builder, events, budget, timeline routes
- [x] T002 Create test fixtures for projects with budget data in `tests/e2e/fixtures/budget-projects.ts`
- [x] T003 Create test fixtures for photoshoots with dates in `tests/e2e/fixtures/events-photoshoots.ts`

---

## Phase 2: User Story 1 - Custom Theme Creation (Priority: P2)
**Goal**: Test and verify theme builder functionality.
**Independent Test**: Create theme, modify colors, save, export, import, undo/redo.

### Tests for User Story 1
- [x] T004 [P] [US1] Add E2E for theme creation and preview in `tests/e2e/theme-builder/theme-create.spec.ts`
- [ ] T005 [P] [US1] Add E2E for theme save/load persistence in `tests/e2e/theme-builder/theme-persistence.spec.ts`
- [ ] T006 [P] [US1] Add E2E for theme export/import in `tests/e2e/theme-builder/theme-export.spec.ts`
- [ ] T007 [US1] Add E2E for undo/redo functionality in `tests/e2e/theme-builder/theme-undo.spec.ts`

### Unit Tests for User Story 1
- [ ] T008 [US1] Add unit tests for theme store CRUD operations in `tests/unit/stores/theme.test.ts`
- [ ] T009 [US1] Add unit tests for color variation generation in `tests/unit/utils/theme-variations.test.ts`

---

## Phase 3: User Story 2 - Event Overview (Priority: P2)
**Goal**: Test and verify events page functionality.
**Independent Test**: Create photoshoots with dates, verify events display correctly.

### Tests for User Story 2
- [ ] T010 [P] [US2] Add E2E for upcoming events display in `tests/e2e/events/events-upcoming.spec.ts`
- [ ] T011 [P] [US2] Add E2E for past events display in `tests/e2e/events/events-past.spec.ts`
- [ ] T012 [US2] Add E2E for days-until calculation in `tests/e2e/events/events-countdown.spec.ts`

### Unit Tests for User Story 2
- [ ] T013 [US2] Add unit tests for getDaysUntil function in `tests/unit/utils/date-utils.test.ts`

---

## Phase 4: User Story 3 - Budget Overview (Priority: P2)
**Goal**: Test and verify budget page calculations.
**Independent Test**: Create projects with budgets, verify totals and breakdowns.

### Tests for User Story 3
- [ ] T014 [P] [US3] Add E2E for budget totals display in `tests/e2e/budget/budget-totals.spec.ts`
- [ ] T015 [P] [US3] Add E2E for per-project breakdown in `tests/e2e/budget/budget-projects.spec.ts`
- [ ] T016 [US3] Add E2E for empty budget state in `tests/e2e/budget/budget-empty.spec.ts`

### Unit Tests for User Story 3
- [ ] T017 [US3] Add unit tests for budget calculations in `tests/unit/utils/budget-utils.test.ts`
- [ ] T018 [US3] Add unit tests for currency formatting in `tests/unit/utils/format-utils.test.ts`

---

## Phase 5: User Story 4 - Timeline Visualization (Priority: P3)
**Goal**: Test and verify timeline page rendering.
**Independent Test**: Create projects with dates, verify Gantt bars render correctly.

### Tests for User Story 4
- [ ] T019 [P] [US4] Add E2E for timeline project bars in `tests/e2e/timeline/timeline-projects.spec.ts`
- [ ] T020 [P] [US4] Add E2E for month navigation in `tests/e2e/timeline/timeline-navigation.spec.ts`
- [ ] T021 [US4] Add E2E for event markers in `tests/e2e/timeline/timeline-events.spec.ts`

### Unit Tests for User Story 4
- [ ] T022 [US4] Add unit tests for bar position calculations in `tests/unit/utils/timeline-utils.test.ts`

---

## Phase 6: User Story 5 - Status-Filtered Views (Priority: P3)
**Goal**: Test and verify status filter routes.
**Independent Test**: Create projects with various statuses, verify filtering.

### Tests for User Story 5
- [ ] T023 [P] [US5] Add E2E for /archived route in `tests/e2e/status-routes/archived.spec.ts`
- [ ] T024 [P] [US5] Add E2E for /in-progress route in `tests/e2e/status-routes/in-progress.spec.ts`
- [ ] T025 [US5] Add E2E for /planning route in `tests/e2e/status-routes/planning.spec.ts`
- [ ] T026 [US5] Add E2E for /post-production route in `tests/e2e/status-routes/post-production.spec.ts`

---

## Summary

| Phase | User Story | Tests | Status |
|-------|-----------|-------|--------|
| 1 | Setup | 3 | Not Started |
| 2 | Theme Builder | 6 | Not Started |
| 3 | Events | 4 | Not Started |
| 4 | Budget | 5 | Not Started |
| 5 | Timeline | 4 | Not Started |
| 6 | Status Routes | 4 | Not Started |
| **Total** | | **26** | |
