# Feature Specification: Robust Task Management

**Feature Branch**: `001-robust-tasks`  
**Created**: 2025-11-02  
**Status**: Draft  
**Input**: User description: "I want to update the tasks to be more robust. currently they have a few issues. I want to makke sure that the task cards look good and are consistent with modern task management designs. There is also a bug with the current implimentation where if you create a task, all accounts can see it. So the tasks are not being scoped to the user properly. The kabana view also should be scrollable and tasks should be able to have custom stages they can progress through. I also want to update how the tasks are presented on the dashboaard to look a little nicer. There is another bug where tasks cannot be completed because when you press the completion button it just resets and nothing changes."

**Constitution Alignment**: Feature aligns with Project-Centric principle (tasks are project-scoped or team-scoped), MVP First (focusing on core improvements), and Complete Workflow (task management is central to project execution).

## Clarifications

### Session 2025-11-02

- Q: How should custom stages relate to task completion? Should completion be separate from stages (a task can be completed in any stage), or should "completed" be a stage itself? → A: Completion is a stage - "Done" or "Completed" must be one of the custom stages. A task in any other stage cannot be marked as completed.
- Q: When a user belongs to multiple teams, should the task list show tasks from all teams combined, or should tasks be filtered by the currently selected/active team context? → A: Filter by current team by default, with option to show all teams combined
- Q: When creating a standalone task, should the team be automatically assigned to the user's current active team, or should users explicitly select which team the task belongs to? → A: Auto-assign to current active team with option to change - Default to current active team, but provide a team selector that users can modify before saving

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Task Completion Bug (Priority: P1)

As a user, I want to be able to move tasks to the "Done" or "Completed" stage, so that I can track my progress and see what work is finished.

**Why this priority**: Critical functionality bug that prevents users from completing tasks. Core feature is broken and must be fixed before other improvements. Completion is achieved by moving tasks to a completion stage (e.g., "Done" or "Completed").

**Independent Test**: Create a task, drag it to the "Done" stage (or use completion action), verify the task stays in the completed stage after the update. Test in both kanban and detail views.

**Acceptance Scenarios**:

1. **Given** I view a task, **When** I move it to the "Done" or "Completed" stage, **Then** the task's stage updates and persists after page refresh
2. **Given** I move a task to a completion stage, **When** the update completes, **Then** the UI reflects the completed state (task appears in the completion stage column) without resetting
3. **Given** I move a task between stages multiple times, **When** each stage change completes, **Then** the state persists correctly each time
4. **Given** an error occurs while changing stage, **When** the update fails, **Then** the UI shows an error message and reverts to the previous stage

---

### User Story 2 - Secure Task Visibility (Priority: P1)

As a user, I want my tasks to only be visible to me and my team members, so that my work and personal tasks remain private and secure.

**Why this priority**: Critical security/privacy bug that affects data isolation between users. This must be fixed before other improvements.

**Independent Test**: Create a task as User A, verify User B (different team) cannot see it, verify User C (same team) can see it. Test both project-scoped and standalone tasks.

**Acceptance Scenarios**:

1. **Given** I am User A in Team 1, **When** I create a task (project-scoped or standalone), **Then** only members of Team 1 can see that task
2. **Given** I am User B in Team 2, **When** I view tasks, **Then** I cannot see any tasks created by Team 1 members
3. **Given** I am User A in Team 1, **When** I create a standalone task, **Then** it defaults to Team 1 but I can select a different team before saving, and the task is only visible to members of the selected team
4. **Given** I am a member of multiple teams, **When** I view tasks, **Then** tasks are filtered by my currently active team by default
5. **Given** I am a member of multiple teams, **When** I toggle "Show all teams" view, **Then** I see tasks from all my active teams combined, with team indicators

---

### User Story 3 - Modern Task Card Design (Priority: P1)

As a user, I want task cards that follow modern task management design patterns, so that I can quickly scan and understand task information at a glance.

**Why this priority**: Essential UX improvement that makes the core task management interface professional and usable. Works with Story 1.

**Independent Test**: View tasks in kanban/list view, verify cards display all information clearly with modern styling, proper spacing, and visual hierarchy. Compare with industry-standard task management tools (Linear, Asana, Trello).

**Acceptance Scenarios**:

1. **Given** I view tasks in kanban view, **Then** each task card displays title, description preview, priority badge, due date, assigned user, and project link in a clean, scannable layout
2. **Given** I view task cards, **Then** cards use consistent typography, spacing, and color scheme aligned with modern design systems
3. **Given** a task has missing information, **Then** placeholder text or icons indicate missing fields rather than empty space
4. **Given** I interact with task cards, **Then** hover states, selection states, and transitions provide clear visual feedback

---

### User Story 4 - Scrollable Kanban Board (Priority: P2)

As a user, I want the kanban board columns to be independently scrollable, so that I can manage many tasks without layout issues.

**Why this priority**: Improves usability when teams have many tasks. Enhances the existing kanban functionality.

**Independent Test**: Add 20+ tasks to a kanban stage, verify columns scroll independently without affecting other columns or the page layout. Verify smooth scrolling and preserved drag-and-drop functionality.

**Acceptance Scenarios**:

1. **Given** a kanban column has many tasks, **When** I scroll within that column, **Then** only that column scrolls while other columns remain fixed
2. **Given** I scroll a kanban column, **Then** the column header remains visible at the top
3. **Given** I drag a task to a scrolled column, **When** I drop it, **Then** the column auto-scrolls if needed to show the dropped task
4. **Given** the kanban board loads, **Then** columns have appropriate min/max heights to prevent excessive scrolling

---

### User Story 5 - Custom Task Stages (Priority: P2)

As a user, I want to define custom stages for tasks beyond the default "todo/in-progress/done", so that tasks can follow my team's specific workflow. Completion is achieved by moving tasks to a completion stage (e.g., "Done" or "Completed").

**Why this priority**: Provides flexibility for different team workflows while maintaining simplicity. Can start with predefined stages and add customization later. Completion is handled via stages, not a separate boolean.

**Acceptance Scenarios**:

1. **Given** I am an owner or editor, **When** I configure task stages for my team, **Then** I can add, remove, and reorder custom stages (e.g., "Backlog", "In Design", "Review", "Testing", "Done") - with at least one stage designated as the completion stage
2. **Given** custom stages are configured, **When** I view the kanban board, **Then** columns match the configured stages instead of default stages
3. **Given** a task is in a custom stage, **When** I drag it to another stage, **Then** the task updates to reflect the new stage
4. **Given** I am a viewer, **When** I view tasks, **Then** I see the team's configured stages but cannot modify them
5. **Given** a task is moved to a completion stage (e.g., "Done"), **Then** the task is considered completed and cannot be marked as incomplete via a separate completion checkbox

---

### User Story 6 - Enhanced Dashboard Task Display (Priority: P3)

As a user, I want tasks on the dashboard to be presented in a visually appealing way, so that I can quickly understand my workload and priorities.

**Why this priority**: Improves dashboard UX but is lower priority than core functionality fixes. Enhances existing dashboard.

**Acceptance Scenarios**:

1. **Given** I view the dashboard, **Then** tasks are displayed with improved visual hierarchy, spacing, and typography
2. **Given** I view dashboard tasks, **Then** task cards show key information (title, priority, due date, assigned user) in a compact, scannable format
3. **Given** I interact with dashboard tasks, **Then** hover and click interactions provide clear feedback
4. **Given** I have many tasks, **Then** the dashboard task widget handles overflow gracefully (scroll or "view all" link)

---

### Edge Cases

- What happens when a task's assigned user leaves the team?
- How does the system handle tasks when a team is deleted or archived?
- What if a user belongs to multiple teams - how are tasks filtered by current team context?
- How are tasks handled when a project is deleted but tasks remain (standalone)?
- What happens when custom stages are deleted but tasks still reference them?
- How does the system handle very long task titles or descriptions in cards?
- What if a user creates a task without being in a team context?
- What happens when a task's stage is deleted - should it default to first stage or remain orphaned?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST properly persist task stage changes when moved - stage changes must save to database and persist in UI without resetting (completion is achieved by moving to a completion stage)
- **FR-002**: System MUST scope task visibility to team membership - users can only see tasks from teams they are active members of
- **FR-019**: Task list MUST filter tasks by the currently active team by default
- **FR-020**: Task list MUST provide an option to view tasks from all teams combined, with clear team indicators on each task
- **FR-003**: System MUST default standalone tasks to the user's currently active team when created, with an option to select a different team before saving
- **FR-021**: Standalone task creation form MUST display a team selector that defaults to current active team but allows users to choose a different team
- **FR-004**: System MUST enforce RLS policies that filter tasks by team membership for all CRUD operations
- **FR-005**: Task cards MUST display all key information (title, description, priority, due date, assigned user, project) in a modern, scannable layout
- **FR-006**: Task cards MUST use consistent styling, spacing, and visual hierarchy aligned with modern design patterns
- **FR-007**: Task cards MUST display placeholder content or indicators when optional fields are missing (description, due date, assigned user, project)
- **FR-008**: Kanban board columns MUST be independently scrollable when they contain many tasks
- **FR-009**: Kanban column headers MUST remain visible when scrolling column content
- **FR-010**: Drag-and-drop MUST work correctly with scrollable columns, including auto-scroll on drop
- **FR-011**: System MUST allow team owners and editors to configure custom task stages (beyond default todo/in-progress/done), with at least one stage designated as the completion/done stage
- **FR-012**: System MUST support adding, removing, and reordering custom stages per team, ensuring at least one completion stage exists
- **FR-013**: Kanban board MUST display configured custom stages as columns
- **FR-014**: System MUST prevent deletion of stages that have active tasks
- **FR-015**: System MUST designate at least one stage as the completion stage per team - tasks in completion stages are considered done/completed
- **FR-016**: Dashboard task widget MUST display tasks with improved visual design and information hierarchy
- **FR-017**: Dashboard task cards MUST be compact yet informative, showing title, priority, due date, and assigned user
- **FR-018**: System MUST handle task overflow gracefully on dashboard (scroll or navigation to full task view)

### Key Entities *(include if feature involves data)*

- **Task**: Represents a work item with title, description, priority, due date, assignment, and stage. Completion is determined by the task's current stage (tasks in completion stages are done). Can be project-scoped or standalone. Must be associated with a team for proper scoping.
- **TaskStage**: Represents a workflow stage (e.g., "Todo", "In Progress", "Review", "Done"). Team-specific configuration. Has display order, optional default assignment rules, and a flag indicating if it's a completion stage (tasks in completion stages are considered done).
- **TeamTaskConfiguration**: Team-level configuration for task management, including custom stages and workflow settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Task stage changes work reliably - 100% of stage changes (including moves to completion stages) persist correctly without UI reset
- **SC-002**: Users can only see tasks from their active teams - zero task visibility leaks between different teams (100% isolation)
- **SC-003**: Task cards display all key information clearly - 95% of users can identify task priority, due date, and assignment at a glance without clicking
- **SC-004**: Kanban columns support at least 50 tasks per column with smooth, independent scrolling
- **SC-005**: Teams can configure up to 10 custom stages that work seamlessly with drag-and-drop (configurable in under 2 minutes)
- **SC-006**: Dashboard task display improves visual appeal and scanability - tasks are readable and actionable in under 3 seconds per task
- **SC-007**: Task creation and modification operations complete in under 2 seconds (including RLS policy checks)
- **SC-008**: Custom stage changes apply immediately to all team members viewing the kanban board
- **SC-009**: RLS policy verification prevents unauthorized task access - zero false positives (users seeing tasks they shouldn't) or false negatives (users not seeing tasks they should)

## Assumptions

- Tasks will use team_id for scoping standalone tasks (requires database migration to add team_id column)
- Custom stages are team-specific, not global (each team can have different workflows)
- Default stages (todo/in-progress/done) will remain available as a fallback for teams that don't configure custom stages
- Task card design should align with modern task management tools (Linear, Asana, Trello, Notion) for familiar UX
- Dashboard task widget should remain compact to avoid overwhelming the dashboard while improving visual quality
- Drag-and-drop between stages should work the same for custom stages as default stages
- Team owners and editors can manage custom stages; viewers see them but cannot modify
- Task completion is achieved by moving tasks to a designated completion stage (e.g., "Done" or "Completed") - there is no separate completion boolean field, only stage-based completion

## Dependencies

- Requires team membership system to be functioning correctly for RLS policy enforcement
- Requires tasks table migration to add team_id column for standalone task scoping
- Existing kanban drag-and-drop implementation should be preserved and enhanced
- Task service API must be updated to handle custom stages
- Dashboard task loading and display logic needs refactoring

## Open Questions / Clarifications Needed

None - all requirements have reasonable defaults based on industry standards and existing codebase patterns.
