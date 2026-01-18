# Feature Specification: Previously Undocumented Features

**Feature Branch**: `005-undocumented-features`
**Created**: 2026-01-04
**Status**: Draft
**Input**: Features identified during codebase audit that exist without formal specifications or tests

**Constitution Alignment**: This feature aligns with principles of comprehensive testing and documentation to ensure robust, reliable workflows.

## Clarifications

### Session 2026-01-04

- Q: Should theme customizations persist across devices via cloud sync? → A: No, themes persist in localStorage only (current implementation). Cloud sync is out of scope.
- Q: Should the Events page support creating new events directly? → A: No, events are derived from photoshoots. Direct event creation is out of scope.
- Q: Should the Budget page support adding individual transactions? → A: Deferred - requires `budget_items` table. Current scope is read-only budget display.
- Q: Should the Timeline support drag-and-drop to adjust dates? → A: Out of scope for this spec. Current implementation is view-only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Custom Theme Creation (Priority: P2)

Users need to create and customize visual themes to personalize their application experience, including choosing colors, previewing changes, and saving/exporting themes.

**Why this priority**: Theme customization is a power-user feature that enhances personalization but is not critical for core functionality.

**Independent Test**: Can be fully tested by navigating to theme builder, modifying colors, saving, and verifying theme applies correctly.

**Acceptance Scenarios**:

1. **Given** a user accesses the theme builder, **When** they modify a color variable, **Then** the preview must update in real-time
2. **Given** a user creates a theme, **When** they click Save, **Then** the theme must be stored and available in theme selection
3. **Given** a user has saved themes, **When** they export a theme, **Then** a valid JSON file must be downloaded
4. **Given** a user has a theme JSON file, **When** they import it, **Then** the theme must be loaded into the builder
5. **Given** a user makes changes, **When** they press Ctrl+Z, **Then** the previous state must be restored

---

### User Story 2 - Event Overview (Priority: P2)

Users need to see an aggregated view of upcoming and past events (photoshoots) with countdown information to plan their cosplay schedule.

**Why this priority**: Events help users manage their schedule but are derived from existing photoshoot data.

**Independent Test**: Can be tested by creating photoshoots with dates and verifying they appear correctly in the Events page.

**Acceptance Scenarios**:

1. **Given** a user has upcoming photoshoots, **When** they view the Events page, **Then** they must see them in the Upcoming tab
2. **Given** an event has a date, **When** the user views it, **Then** they must see days until the event
3. **Given** a photoshoot date has passed, **When** the user views Events, **Then** it must appear in the Past tab
4. **Given** no photoshoots exist, **When** the user views Events, **Then** an appropriate empty state must display

---

### User Story 3 - Budget Overview (Priority: P2)

Users need to see a summary of their cosplay spending including total budget, amounts spent, and per-project breakdowns.

**Why this priority**: Budget tracking helps users manage costs but requires existing project budget data.

**Independent Test**: Can be tested by creating projects with budgets and verifying totals display correctly.

**Acceptance Scenarios**:

1. **Given** projects have budget values, **When** a user views the Budget page, **Then** they must see total budget and spent amounts
2. **Given** multiple projects exist, **When** a user views budgets, **Then** per-project breakdowns must display
3. **Given** projects have progress bars, **When** a user views Budget, **Then** spending progress must be visualized
4. **Given** no projects have budgets, **When** a user views Budget, **Then** an appropriate empty state must display

---

### User Story 4 - Timeline Visualization (Priority: P3)

Users need to see their projects and events on a Gantt-style timeline to understand their cosplay schedule at a glance.

**Why this priority**: Timeline is a visualization enhancement, not required for core planning functionality.

**Independent Test**: Can be tested by creating projects with deadlines and verifying they render as bars on the timeline.

**Acceptance Scenarios**:

1. **Given** projects exist with dates, **When** a user views Timeline, **Then** horizontal bars must render for each project
2. **Given** the timeline shows a month, **When** a user clicks Previous/Next, **Then** the view must navigate to adjacent months
3. **Given** photoshoots exist with dates, **When** a user views Timeline, **Then** event markers must display
4. **Given** a project has progress, **When** the user views Timeline, **Then** the progress must be visible within the bar

---

### User Story 5 - Status-Filtered Views (Priority: P3)

Users need quick access to projects filtered by status (archived, in-progress, planning, post-production) via dedicated routes.

**Why this priority**: These are convenience features that enhance navigation but are not critical.

**Independent Test**: Can be tested by navigating to status routes and verifying only matching projects display.

**Acceptance Scenarios**:

1. **Given** archived projects exist, **When** a user navigates to /archived, **Then** only archived projects must display
2. **Given** in-progress projects exist, **When** a user navigates to /in-progress, **Then** only in-progress projects must display
3. **Given** no projects match a status, **When** a user navigates to that status route, **Then** an empty state must display

---

### Edge Cases

- **Theme with invalid CSS values**: When a user enters an invalid CSS color value, the system must reject it with a validation error rather than applying broken styles
- **Theme import with missing variables**: When importing a theme JSON with missing required variables, the system must fill missing values with defaults
- **Empty budget calculations**: When all projects have $0 budget, the system must display 0 values without division errors
- **Timeline with no dates**: When projects have no start/end dates, the system must either hide them or use reasonable defaults
- **Events with null dates**: When photoshoots have no dates set, they must not appear in the Events page

## Requirements *(mandatory)*

### Functional Requirements

#### Theme Builder

- **FR-001**: System MUST display real-time preview when CSS variables are modified
- **FR-002**: System MUST save custom themes to localStorage
- **FR-003**: System MUST load saved themes on application startup
- **FR-004**: System MUST export themes as valid JSON files
- **FR-005**: System MUST import and validate theme JSON files
- **FR-006**: System MUST support undo/redo with keyboard shortcuts (Ctrl+Z/Y)
- **FR-007**: System MUST limit undo history to 50 entries to prevent memory issues
- **FR-008**: System MUST allow deleting custom themes
- **FR-009**: System MUST allow duplicating existing themes
- **FR-010**: System MUST auto-generate hover/active color variations

#### Events Page

- **FR-011**: System MUST display upcoming events derived from photoshoots
- **FR-012**: System MUST display past events in a separate tab
- **FR-013**: System MUST calculate and display days until each upcoming event
- **FR-014**: System MUST show event location when available
- **FR-015**: System MUST respect team scope (show only current team's events)

#### Budget Page

- **FR-016**: System MUST calculate total budget across all team projects
- **FR-017**: System MUST calculate total spent across all team projects
- **FR-018**: System MUST display per-project budget breakdowns
- **FR-019**: System MUST show budget progress as visual bars
- **FR-020**: System MUST format currency using user locale

#### Timeline Page

- **FR-021**: System MUST render projects as horizontal Gantt bars
- **FR-022**: System MUST allow month-by-month navigation
- **FR-023**: System MUST display project progress within bars
- **FR-024**: System MUST show event markers on the timeline
- **FR-025**: System MUST support expanding projects to show tasks

#### Status Routes

- **FR-026**: System MUST filter /archived route to show only archived projects
- **FR-027**: System MUST filter /in-progress route to show only in-progress projects
- **FR-028**: System MUST filter /planning route to show only planning projects
- **FR-029**: System MUST filter /post-production route to show only post-production projects

### Key Entities

- **Theme**: Custom color configuration with CSS variables, metadata, and preview colors
- **Event**: Derived view combining photoshoots with calculated properties (days until, etc.)
- **Budget Summary**: Aggregated financial data from project budget fields
- **Timeline Entry**: Visual representation of project/event on Gantt chart

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Theme changes preview in under 100ms of input
- **SC-002**: Saved themes persist across browser sessions with 100% reliability
- **SC-003**: Theme export produces valid JSON parseable by import
- **SC-004**: Undo/redo restores exact previous state with 100% accuracy
- **SC-005**: Events page loads within 2 seconds with up to 50 events
- **SC-006**: Budget calculations match manual sum of project budgets with 100% accuracy
- **SC-007**: Timeline renders projects with correct positioning based on dates
- **SC-008**: Status routes show only projects matching that status with 100% accuracy
- **SC-009**: All features respect team scope (no cross-team data leakage)
- **SC-010**: Empty states display appropriately when no data exists

## Assumptions

1. **Browser Support**: localStorage is available in all target browsers
2. **Existing Data**: Project budget fields are already populated by users
3. **Photoshoot Dates**: Events derive from photoshoots that have date fields set
4. **Team Context**: Users always have a team context active for data scoping
5. **No Backend Changes**: These features work with existing database schema

## Dependencies

1. **Existing Services**: projectService, photoshootService, taskService
2. **Stores**: theme store, teams store
3. **UI Components**: Card, Badge, Progress, Button, Input

## Out of Scope

1. **Cloud Theme Sync**: Themes are local only, not synced to server
2. **Event Creation**: Events are read-only, derived from photoshoots
3. **Transaction Recording**: Budget is read-only, no new transactions
4. **Timeline Editing**: Timeline is view-only, no drag-and-drop
5. **Advanced Filtering**: Status routes use simple status matching only
