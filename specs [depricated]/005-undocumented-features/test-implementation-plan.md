# Test Implementation Plan: Incremental Test Addition

**Feature Branch**: `005-undocumented-features`  
**Created**: 2026-01-04  
**Status**: Active  
**Purpose**: Systematic, incremental plan to add tests ensuring each passes before adding the next

## Principles

1. **One test at a time**: Add a single test, verify it passes, then move to next
2. **Fix before expand**: Fix any failing tests before adding new ones
3. **Documentation**: Update progress as tests are completed
4. **Coverage tracking**: Monitor coverage improvements after each test

## Implementation Order

### Phase 1: Critical Services (P0) - START HERE

#### Task 1.1: taskService Unit Tests
**File**: `tests/unit/api/services/task-service.test.ts`  
**Priority**: P0 - CRITICAL  
**Status**: ⏳ Not Started

**Test Cases**:
- [ ] `listAll()` - returns all tasks for current team
- [ ] `listAll()` - filters by completed status
- [ ] `listAll()` - filters by priority
- [ ] `list()` - returns tasks for a project
- [ ] `list()` - returns standalone tasks when projectId is null
- [ ] `get()` - returns single task by ID
- [ ] `get()` - returns null for non-existent task
- [ ] `create()` - creates new task
- [ ] `create()` - validates required fields
- [ ] `update()` - updates existing task
- [ ] `update()` - handles partial updates
- [ ] `delete()` - soft deletes task
- [ ] `delete()` - prevents deletion of task with dependencies
- [ ] `listWithFilters()` - filters by multiple criteria
- [ ] `listWithFilters()` - handles date range filters
- [ ] `listWithFilters()` - handles search query

**Acceptance Criteria**:
- All tests pass
- Coverage for taskService.ts reaches 80%+
- No flaky tests

---

#### Task 1.2: projectService Unit Tests
**File**: `tests/unit/api/services/project-service.test.ts`  
**Priority**: P0 - CRITICAL  
**Status**: ⏳ Not Started  
**Blocked by**: Task 1.1 (complete first)

**Test Cases**:
- [ ] `list()` - returns all projects for current team
- [ ] `list()` - filters by status
- [ ] `get()` - returns single project by ID
- [ ] `get()` - returns null for non-existent project
- [ ] `create()` - creates new project
- [ ] `create()` - validates required fields
- [ ] `update()` - updates existing project
- [ ] `delete()` - soft deletes project
- [ ] `calculateProgress()` - calculates project progress correctly
- [ ] `calculateProgress()` - handles projects with no tasks
- [ ] `getLinkedResources()` - returns linked resources

**Acceptance Criteria**:
- All tests pass
- Coverage for projectService.ts reaches 80%+
- No flaky tests

---

#### Task 1.3: tasks Store Tests
**File**: `tests/unit/stores/tasks.test.ts`  
**Priority**: P0 - CRITICAL  
**Status**: ⏳ Not Started  
**Blocked by**: Task 1.1 (complete first)

**Test Cases**:
- [ ] Store initialization
- [ ] `loadTasks()` - loads tasks from API
- [ ] `addTask()` - adds task to store
- [ ] `addTaskLocal()` - adds task optimistically
- [ ] `updateTask()` - updates task in store
- [ ] `deleteTask()` - removes task from store
- [ ] `toggleTaskCompletion()` - toggles completion status
- [ ] `completedTasks` - computed store returns completed tasks
- [ ] `pendingTasks` - computed store returns pending tasks
- [ ] `overdueTasks` - computed store returns overdue tasks
- [ ] `tasksByPriority` - computed store groups by priority
- [ ] `taskStats` - computed store calculates statistics

**Acceptance Criteria**:
- All tests pass
- Coverage for stores/tasks.ts reaches 80%+
- No flaky tests

---

#### Task 1.4: projects Store Tests
**File**: `tests/unit/stores/projects.test.ts`  
**Priority**: P0 - CRITICAL  
**Status**: ⏳ Not Started  
**Blocked by**: Task 1.2 (complete first)

**Test Cases**:
- [ ] Store initialization
- [ ] `load()` - loads projects from API
- [ ] `add()` - adds project to store
- [ ] `update()` - updates project in store
- [ ] `delete()` - removes project from store
- [ ] `activeProjects` - computed store returns active projects
- [ ] `completedProjects` - computed store returns completed projects
- [ ] `archivedProjects` - computed store returns archived projects
- [ ] `planningProjects` - computed store returns planning projects
- [ ] `projectStats` - computed store calculates statistics

**Acceptance Criteria**:
- All tests pass
- Coverage for stores/projects.ts reaches 80%+
- No flaky tests

---

### Phase 2: Undocumented Features (P1)

#### Task 2.1: Theme Builder - Theme Store Tests
**File**: `tests/unit/stores/theme.test.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Phase 1 complete

**Test Cases**:
- [ ] Store initialization
- [ ] `saveTheme()` - saves theme to localStorage
- [ ] `loadTheme()` - loads theme from localStorage
- [ ] `deleteTheme()` - removes theme
- [ ] `duplicateTheme()` - creates theme copy
- [ ] `exportTheme()` - exports theme as JSON
- [ ] `importTheme()` - imports theme from JSON
- [ ] `importTheme()` - handles invalid JSON gracefully

**Acceptance Criteria**:
- All tests pass
- Coverage for stores/theme.ts reaches 80%+
- No flaky tests

---

#### Task 2.2: Theme Builder - Theme Variations Utility Tests
**File**: `tests/unit/utils/theme-variations.test.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Task 2.1

**Test Cases**:
- [ ] `generateHoverVariation()` - generates hover color
- [ ] `generateActiveVariation()` - generates active color
- [ ] `generateVariations()` - generates all variations
- [ ] Handles invalid color values
- [ ] Handles hex colors
- [ ] Handles rgb colors
- [ ] Handles hsl colors

**Acceptance Criteria**:
- All tests pass
- Coverage for utils/theme-variations.ts reaches 95%+
- No flaky tests

---

#### Task 2.3: Theme Builder - E2E Persistence Test
**File**: `tests/e2e/theme-builder/theme-persistence.spec.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Task 2.1, Task 2.2

**Test Cases**:
- [ ] Theme saves to localStorage
- [ ] Theme persists across page reloads
- [ ] Multiple themes can be saved
- [ ] Theme can be deleted
- [ ] Default theme loads if no saved theme

**Acceptance Criteria**:
- All E2E tests pass
- Test runs in < 30 seconds
- No flaky tests

---

#### Task 2.4: Events - Days Until Utility Test
**File**: `tests/unit/utils/date-utils.test.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Phase 1 complete

**Test Cases**:
- [ ] `getDaysUntil()` - calculates days until future date
- [ ] `getDaysUntil()` - returns 0 for today
- [ ] `getDaysUntil()` - returns negative for past dates
- [ ] Handles timezone correctly
- [ ] Handles null/undefined dates

**Acceptance Criteria**:
- All tests pass
- Coverage for date-utils.ts reaches 95%+
- No flaky tests

---

#### Task 2.5: Events - E2E Upcoming Events Test
**File**: `tests/e2e/events/events-upcoming.spec.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Task 2.4

**Test Cases**:
- [ ] Upcoming events display correctly
- [ ] Events sorted by date
- [ ] Days until calculated correctly
- [ ] Empty state shows when no events
- [ ] Events respect team scope

**Acceptance Criteria**:
- All E2E tests pass
- Test runs in < 30 seconds
- No flaky tests

---

#### Task 2.6: Budget - Budget Calculations Utility Test
**File**: `tests/unit/utils/budget-utils.test.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Phase 1 complete

**Test Cases**:
- [ ] `calculateTotalBudget()` - sums all project budgets
- [ ] `calculateTotalSpent()` - sums all spent amounts
- [ ] `calculateRemaining()` - calculates remaining budget
- [ ] `calculateProgress()` - calculates progress percentage
- [ ] Handles zero budgets
- [ ] Handles null/undefined values
- [ ] Handles negative values (if allowed)

**Acceptance Criteria**:
- All tests pass
- Coverage for budget-utils.ts reaches 95%+
- No flaky tests

---

#### Task 2.7: Budget - Currency Formatting Utility Test
**File**: `tests/unit/utils/format-utils.test.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Task 2.6

**Test Cases**:
- [ ] `formatCurrency()` - formats USD correctly
- [ ] `formatCurrency()` - formats other currencies
- [ ] `formatCurrency()` - handles locale
- [ ] `formatCurrency()` - handles zero values
- [ ] `formatCurrency()` - handles negative values

**Acceptance Criteria**:
- All tests pass
- Coverage for format-utils.ts reaches 95%+
- No flaky tests

---

#### Task 2.8: Budget - E2E Budget Totals Test
**File**: `tests/e2e/budget/budget-totals.spec.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Task 2.6, Task 2.7

**Test Cases**:
- [ ] Total budget displays correctly
- [ ] Total spent displays correctly
- [ ] Remaining budget displays correctly
- [ ] Progress bars render correctly
- [ ] Currency formatting correct
- [ ] Empty state shows when no budgets

**Acceptance Criteria**:
- All E2E tests pass
- Test runs in < 30 seconds
- No flaky tests

---

#### Task 2.9: Timeline - Timeline Utilities Test
**File**: `tests/unit/utils/timeline-utils.test.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Phase 1 complete

**Test Cases**:
- [ ] `calculateBarPosition()` - calculates bar start position
- [ ] `calculateBarWidth()` - calculates bar width
- [ ] `calculateBarPosition()` - handles projects without dates
- [ ] `getMonthRange()` - gets correct month range
- [ ] `getVisibleProjects()` - filters projects in view

**Acceptance Criteria**:
- All tests pass
- Coverage for timeline-utils.ts reaches 95%+
- No flaky tests

---

#### Task 2.10: Timeline - E2E Timeline Projects Test
**File**: `tests/e2e/timeline/timeline-projects.spec.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Task 2.9

**Test Cases**:
- [ ] Projects render as bars
- [ ] Bar positions correct based on dates
- [ ] Bar widths correct based on duration
- [ ] Progress visible in bars
- [ ] Projects without dates handled gracefully

**Acceptance Criteria**:
- All E2E tests pass
- Test runs in < 30 seconds
- No flaky tests

---

#### Task 2.11: Status Routes - E2E Archived Test
**File**: `tests/e2e/status-routes/archived.spec.ts`  
**Priority**: P1  
**Status**: ⏳ Not Started  
**Blocked by**: Phase 1 complete

**Test Cases**:
- [ ] Only archived projects display
- [ ] Non-archived projects hidden
- [ ] Empty state shows when no archived projects
- [ ] Projects respect team scope

**Acceptance Criteria**:
- All E2E tests pass
- Test runs in < 30 seconds
- No flaky tests

---

## Progress Tracking

### Completed Tests
- None yet - starting with Task 1.1

### Current Test
- **Task 1.1**: taskService Unit Tests - ⏳ Not Started

### Next Test
- **Task 1.2**: projectService Unit Tests (after 1.1 passes)

## Coverage Tracking

### Current Coverage
- Run `bun test:coverage` to get baseline
- Track improvements after each test

### Target Coverage
- Overall: 80%+
- Services: 85%+
- Utilities: 95%+
- Stores: 80%+

## Notes

- Each test should be independent and isolated
- Use test fixtures for consistent data
- Mock external dependencies (Supabase, localStorage, etc.)
- Ensure tests are deterministic (no random data, fixed dates)
- Clean up test data after each test

