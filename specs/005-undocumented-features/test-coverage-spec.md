# Test Coverage Specification: Comprehensive Testing for Undocumented Features

**Feature Branch**: `005-undocumented-features`  
**Created**: 2026-01-04  
**Status**: In Progress  
**Purpose**: Systematically add tests for all features not added with formal specs, ensuring each test passes before adding the next

**Constitution Alignment**: This specification aligns with Constitution Principle IV (MVP First, Test-Driven Development) by ensuring comprehensive test coverage for regression testing as new features are added.

## Overview

This specification documents the systematic approach to adding tests for:
1. Features documented in `005-undocumented-features` spec (Theme Builder, Events, Budget, Timeline, Status Routes)
2. API services without test coverage
3. Stores without test coverage  
4. Utility functions without test coverage
5. E2E tests for critical user journeys

## Test Coverage Goals

### Overall Targets
- **Unit Tests**: 80%+ coverage (statements, branches, functions, lines)
- **Integration Tests**: All service interactions tested
- **E2E Tests**: All critical user journeys covered
- **Zero Flaky Tests**: All tests must be reliable and deterministic

### Domain-Specific Targets
- **API Services**: 85% coverage (critical business logic)
- **Stores**: 80% coverage (state management)
- **Utilities**: 95% coverage (pure functions, easy to test)
- **UI Components**: 70% coverage (visual testing more important)

## Test Strategy

### Incremental Approach
1. **One test at a time**: Add a single test, ensure it passes, then move to the next
2. **Test-first for new features**: Write tests before implementing new functionality
3. **Fix before expand**: Fix failing tests before adding new ones
4. **Documentation**: Update this spec as tests are added

### Test Types

#### Unit Tests (Vitest)
- **Location**: `tests/unit/`
- **Scope**: Individual functions, components, stores, utilities
- **Speed**: Fast (< 5 seconds per test)
- **Isolation**: Fully isolated, no external dependencies

#### Integration Tests (Vitest)
- **Location**: `tests/integration/`
- **Scope**: Service interactions, API calls, database operations
- **Speed**: Moderate (< 30 seconds per test)
- **Isolation**: Uses test database, mocked external APIs

#### E2E Tests (Playwright)
- **Location**: `tests/e2e/`
- **Scope**: Complete user journeys, cross-browser testing
- **Speed**: Slow (< 2 minutes per test)
- **Isolation**: Full application stack, real browser

## Missing Test Coverage Audit

### API Services (src/lib/api/services/)

**Services with tests** ✅:
- `teamService.ts` - ✅ `tests/unit/api/services/team-service.test.ts`
- `ideaService.ts` - ✅ `tests/unit/api/services/idea-service.test.ts`
- `resourceService.ts` - ✅ `tests/unit/api/services/resource-service.test.ts`

**Services without tests** ❌:
- `taskService.ts` - ❌ Missing (CRITICAL - core functionality)
- `projectService.ts` - ❌ Missing (CRITICAL - core functionality)
- `photoshootService.ts` - ❌ Missing
- `subtaskService.ts` - ❌ Missing
- `taskStageService.ts` - ❌ Missing
- `taskCommentService.ts` - ❌ Missing
- `taskAttachmentService.ts` - ❌ Missing
- `taskNotificationService.ts` - ❌ Missing
- `taskStageDeadlineService.ts` - ❌ Missing
- `taskTemplateService.ts` - ❌ Missing
- `customFieldService.ts` - ❌ Missing
- `labelService.ts` - ❌ Missing
- `commentService.ts` - ❌ Missing
- `savedViewService.ts` - ❌ Missing
- `userService.ts` - ❌ Missing
- `userTaskStatsService.ts` - ❌ Missing
- `toolService.ts` - ❌ Missing
- `offlineService.ts` - ❌ Missing

### Stores (src/lib/stores/)

**Stores with tests** ✅:
- `teams.ts` - ✅ `tests/unit/stores/teams.test.ts`
- `ideas.ts` - ✅ `tests/unit/stores/ideas.test.ts`

**Stores without tests** ❌:
- `theme.ts` - ❌ Missing (Theme Builder feature)
- `projects.ts` - ❌ Missing (CRITICAL)
- `tasks.ts` - ❌ Missing (CRITICAL)
- `tasks-store.ts` - ❌ Missing
- `events.ts` - ❌ Missing (Events feature)
- `photoshoots.ts` - ❌ Missing
- `resources.ts` - ❌ Missing
- `tools.ts` - ❌ Missing
- `auth-store.ts` - ❌ Missing
- `celebration.ts` - ❌ Missing
- `comments.ts` - ❌ Missing
- `notifications.ts` - ❌ Missing
- `offlineStore.ts` - ❌ Missing (Offline sync feature)
- `page-header-store.ts` - ❌ Missing
- `persistence.ts` - ❌ Missing
- `settings.ts` - ❌ Missing
- `sidebar-store.svelte.ts` - ❌ Missing
- `task-view-store.ts` - ❌ Missing
- `taskFilters.ts` - ❌ Missing
- `taskViews.ts` - ❌ Missing
- `toast.ts` - ❌ Missing
- `user.ts` - ❌ Missing
- `init.ts` - ❌ Missing

### Utilities (src/lib/utils/)

**Utilities without tests** ❌:
- `apiAggregation.ts` - ❌ Missing (Character API deduplication)
- `offlineSync.ts` - ❌ Missing (Offline sync utilities)
- `task-filters.ts` - ❌ Missing
- `task-grouping.ts` - ❌ Missing
- `theme-builder.ts` - ❌ Missing (Theme Builder feature)
- `theme-variations.ts` - ❌ Missing (Theme Builder feature)
- `theme-variants.ts` - ❌ Missing
- `theme-variable-groups.ts` - ❌ Missing
- `theme-variable-usage.ts` - ❌ Missing
- `color-formats.ts` - ❌ Missing
- `date-utils.ts` - ❌ Missing (if exists)
- `budget-utils.ts` - ❌ Missing (Budget feature)
- `timeline-utils.ts` - ❌ Missing (Timeline feature)
- `format-utils.ts` - ❌ Missing
- `search.ts` - ❌ Missing
- `search-highlight.ts` - ❌ Missing
- `natural-language.ts` - ❌ Missing
- `mention-parser.ts` - ❌ Missing
- `mention-autocomplete.ts` - ❌ Missing
- `keyboard-shortcuts.ts` - ❌ Missing
- `performance.ts` - ❌ Missing
- `permissions.ts` - ❌ Missing
- `progress.ts` - ❌ Missing
- `responsive.ts` - ❌ Missing
- `storage.ts` - ❌ Missing
- `image.ts` - ❌ Missing
- `image-helpers.ts` - ❌ Missing
- `drag-and-drop.ts` - ❌ Missing
- `drag-drop.ts` - ❌ Missing
- `draggable.ts` - ❌ Missing
- `encouraging-messages.ts` - ❌ Missing
- `cn.ts` - ❌ Missing (may be trivial)
- `coloris.ts` - ❌ Missing
- `index.ts` - ❌ Missing (re-exports, may not need tests)

### E2E Tests (tests/e2e/)

**E2E Tests that exist** ✅:
- `auth-validation.spec.ts` - ✅ (needs verification)
- `dashboard.spec.ts` - ✅
- `forms.spec.ts` - ✅
- `navigation.spec.ts` - ✅
- `smoke.spec.ts` - ✅
- `tasks/task-deletion.spec.ts` - ✅
- `tasks/task-fields.spec.ts` - ✅
- `tasks/task-sync.spec.ts` - ✅
- `resources/resource-management.spec.ts` - ✅
- `theme-builder/theme-create.spec.ts` - ✅

**E2E Tests missing** ❌:
- Theme Builder:
  - `theme-builder/theme-persistence.spec.ts` - ❌ Missing
  - `theme-builder/theme-export.spec.ts` - ❌ Missing
  - `theme-builder/theme-undo.spec.ts` - ❌ Missing
- Events:
  - `events/events-upcoming.spec.ts` - ❌ Missing
  - `events/events-past.spec.ts` - ❌ Missing
  - `events/events-countdown.spec.ts` - ❌ Missing
- Budget:
  - `budget/budget-totals.spec.ts` - ❌ Missing
  - `budget/budget-projects.spec.ts` - ❌ Missing
  - `budget/budget-empty.spec.ts` - ❌ Missing
- Timeline:
  - `timeline/timeline-projects.spec.ts` - ❌ Missing
  - `timeline/timeline-navigation.spec.ts` - ❌ Missing
  - `timeline/timeline-events.spec.ts` - ❌ Missing
- Status Routes:
  - `status-routes/archived.spec.ts` - ❌ Missing
  - `status-routes/in-progress.spec.ts` - ❌ Missing
  - `status-routes/planning.spec.ts` - ❌ Missing
  - `status-routes/post-production.spec.ts` - ❌ Missing

## Priority Order

### Phase 1: Critical Services (P0)
1. `taskService.ts` - Core task management
2. `projectService.ts` - Core project management
3. `stores/tasks.ts` - Task state management
4. `stores/projects.ts` - Project state management

### Phase 2: Undocumented Features (P1)
5. Theme Builder tests (from `005-undocumented-features/tasks.md`)
6. Events tests
7. Budget tests
8. Timeline tests
9. Status Routes tests

### Phase 3: Supporting Services (P2)
10. Task-related services (subtasks, stages, comments, etc.)
11. Store tests for remaining stores
12. Utility function tests

### Phase 4: Edge Cases & Integration (P3)
13. Integration tests for service interactions
14. RLS policy tests
15. Offline sync tests
16. Performance tests

## Test Implementation Checklist

For each test file, ensure:
- [ ] Test file created in correct location
- [ ] All imports correct
- [ ] Test data/fixtures set up
- [ ] Mocks configured properly
- [ ] Test passes locally
- [ ] Test passes in CI
- [ ] Coverage increases as expected
- [ ] No flaky test behavior
- [ ] Documentation updated

## Success Criteria

- **SC-001**: All critical services (taskService, projectService) have unit tests with 80%+ coverage
- **SC-002**: All undocumented features have E2E tests covering acceptance scenarios
- **SC-003**: Overall test coverage reaches 80% (statements, branches, functions, lines)
- **SC-004**: Zero flaky tests in test suite
- **SC-005**: All tests pass consistently in CI environment
- **SC-006**: Test execution time remains under 5 minutes for full suite

## Next Steps

1. Start with Phase 1: Critical Services
2. Add one test at a time
3. Verify each test passes before proceeding
4. Update this document as tests are added
5. Track coverage improvements

