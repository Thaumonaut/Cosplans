# Research: Robust Task Management

**Feature**: Robust Task Management  
**Date**: 2025-11-02  
**Purpose**: Document research findings for implementing robust task management with custom stages, proper team scoping, and modern UI

## Technical Decisions

### 1. Task Completion Model (Stage-Based)

**Decision**: Completion is determined by the task's current stage. Tasks in completion stages (e.g., "Done", "Completed") are considered done. No separate `completed` boolean field needed once custom stages are implemented.

**Rationale**:
- Aligns with modern task management tools (Linear, Asana, Notion)
- Simplifies UI: single stage field instead of stage + completion checkbox
- Prevents inconsistent state (task in "In Progress" but marked completed)
- Custom stages allow teams to define their own completion workflows

**Alternatives Considered**:
- **Option A**: Separate `completed` boolean + `stage` field
  - Rejected: Creates dual state (could be in "Todo" but marked completed)
- **Option B**: Completion stage + `completed` boolean
  - Rejected: Redundant. If in completion stage, task is done.
- **Option C**: Stage-based only (chosen)
  - Selected: Single source of truth, flexible workflows

**Implementation Notes**:
- Migration strategy: Keep `completed` boolean during transition, derive from stage for new tasks
- Backward compatibility: Tasks without stages use `completed` boolean (fallback to default stages)
- Validation: At least one completion stage must exist per team configuration

---

### 2. Team-Based Task Scoping

**Decision**: All tasks must be associated with a team. Standalone tasks (no project) use `tasks.team_id`. Project-scoped tasks inherit team via `projects.team_id`. RLS policies filter by team membership.

**Rationale**:
- Prevents cross-team data leaks (critical security/privacy requirement)
- Consistent with team-based architecture (constitution principle)
- Enables proper access control via Supabase RLS
- Supports multi-team users (tasks filtered by active team context)

**Alternatives Considered**:
- **Option A**: User-scoped tasks only
  - Rejected: Violates team-based architecture, doesn't support collaboration
- **Option B**: Global tasks visible to all users
  - Rejected: Privacy violation, no access control
- **Option C**: Team-scoped tasks (chosen)
  - Selected: Aligns with constitution, enables proper RLS enforcement

**Implementation Notes**:
- Migration: Add `team_id` column to `tasks` table
- For project-scoped tasks: Inherit `team_id` from `projects.team_id` (no direct column needed, query via JOIN)
- For standalone tasks: Populate `tasks.team_id` from current active team (with option to change)
- RLS policies: Check team membership via `team_members` table or team ownership

---

### 3. Custom Task Stages Architecture

**Decision**: Team-specific stage configurations stored in `task_stages` table. Each stage has: name, display_order, is_completion_stage flag. Kanban board renders stages as columns. Default stages (todo/in-progress/done) used as fallback.

**Rationale**:
- Teams have different workflows (design teams vs. production teams)
- Flexible without over-engineering (simple table, no complex state machines)
- Backward compatible: Default stages work if no custom config exists
- Scalable: Easy to add/remove/reorder stages per team

**Alternatives Considered**:
- **Option A**: Hardcoded stages (todo/in-progress/done only)
  - Rejected: Too rigid, doesn't support team-specific workflows
- **Option B**: Global stage definitions
  - Rejected: Can't customize per team
- **Option C**: Team-specific stage configuration (chosen)
  - Selected: Flexible, team-scoped, MVP-appropriate complexity

**Implementation Notes**:
- Table: `task_stages` (id, team_id, name, display_order, is_completion_stage, created_at)
- Default stages: Created automatically for new teams (todo, in-progress, done; done is completion)
- Stage management: Owners/editors can configure, viewers see but can't modify
- Task assignment: When creating task, default to first non-completion stage
- Migration: Existing tasks without stage reference default stages or NULL (handle gracefully)

---

### 4. RLS Policy Pattern for Team-Scoped Tasks

**Decision**: Use Supabase RLS with team membership checks. Policies verify user has active membership in task's team (via project.team_id or tasks.team_id). Use SECURITY DEFINER functions to break circular dependencies if needed.

**Rationale**:
- Database-level enforcement (cannot be bypassed by client)
- Consistent with existing RLS patterns in codebase
- Prevents data leaks between teams
- Supports efficient queries (Supabase optimizes RLS checks)

**Alternatives Considered**:
- **Option A**: Application-level filtering only
  - Rejected: Security risk, can be bypassed, violates defense-in-depth
- **Option B**: API middleware filtering
  - Rejected: Extra layer, still requires DB queries, more complex
- **Option C**: Supabase RLS (chosen)
  - Selected: Standard approach, already used for projects/resources, database-enforced

**Implementation Notes**:
- SELECT policy: `task.team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')`
- INSERT policy: User must be owner/editor of target team
- UPDATE/DELETE policy: User must be owner/editor of task's team
- Avoid circular dependencies: Use direct column checks or SECURITY DEFINER functions
- Performance: Index `team_members(team_id, user_id, status)` for fast lookups

---

### 5. Kanban Board Drag-and-Drop Implementation

**Decision**: Use native HTML5 Drag-and-Drop API with visual feedback. Columns are independently scrollable via CSS `overflow-y: auto` with fixed headers. Drop handler updates task stage and triggers API call.

**Rationale**:
- Native browser API (no external libraries needed)
- Good browser support (all modern browsers)
- Lightweight, performant
- Works well with Svelte reactivity

**Alternatives Considered**:
- **Option A**: External drag-and-drop library (dnd-kit, react-beautiful-dnd)
  - Rejected: Adds dependency, SvelteKit doesn't need it, native API sufficient
- **Option B**: Custom mouse event handlers
  - Rejected: More complex, less accessible, duplicates browser functionality
- **Option C**: Native HTML5 Drag-and-Drop (chosen)
  - Selected: Standard, accessible, no dependencies

**Implementation Notes**:
- Drag events: `ondragstart`, `ondragend`, `ondragover`, `ondrop`
- Visual feedback: `draggedTask` state for opacity changes, `dragOverStatus` for drop zone highlighting
- Scrollable columns: `CardContent` with `overflow-y-auto max-h-[600px]`
- Fixed headers: Column headers stay visible during scroll (CSS `sticky`)
- Auto-scroll on drop: If dropping in scrolled column, scroll to show dropped task

---

### 6. Modern Task Card Design Pattern

**Decision**: Card-based design with clear information hierarchy: title (bold), description preview (2-3 lines max), priority badge (colored), due date (icon + formatted), assigned user (avatar/initials), project link (bottom section). Placeholder text for missing fields. Hover states for interactivity.

**Rationale**:
- Scannable: Users can quickly identify key info without clicking
- Consistent: Aligns with Linear, Asana, Trello card patterns
- Accessible: Clear labels, icons, color-coding
- Modern: Follows design system best practices

**Alternatives Considered**:
- **Option A**: Table/list view only
  - Rejected: Less visual, harder to scan, doesn't match modern UX patterns
- **Option B**: Minimal cards (title only)
  - Rejected: Missing critical info, requires clicking to see details
- **Option C**: Rich cards with all info (chosen)
  - Selected: Informative, scannable, modern UX

**Implementation Notes**:
- Layout: Title at top, description below, metadata (priority/date/assignment) in middle, project at bottom
- Spacing: Consistent padding (`p-5`), gap between elements (`gap-3`)
- Typography: Title `text-base font-semibold`, description `text-sm line-clamp-3`, metadata `text-xs`
- Colors: Priority badges use theme colors, status badges use muted colors
- Placeholders: Italic gray text for missing fields (e.g., "No description provided")

---

### 7. Scrollable Kanban Columns Pattern

**Decision**: Each kanban column has independent scrolling via CSS `overflow-y: auto` with `max-height: 600px`. Column headers remain fixed via `position: sticky`. Drag-and-drop works within scrolled columns.

**Rationale**:
- Handles large task lists gracefully (50+ tasks per stage)
- Maintains visual consistency (columns same height, headers visible)
- Standard kanban pattern (Trello, Linear, Asana all use this)
- Simple CSS solution (no JavaScript needed for scrolling)

**Alternatives Considered**:
- **Option A**: Page-level scrolling only
  - Rejected: Columns become too tall, headers scroll away, poor UX
- **Option B**: Virtual scrolling (render only visible tasks)
  - Rejected: Over-engineering for MVP, adds complexity, not needed for 50-100 tasks
- **Option C**: Independent column scrolling (chosen)
  - Selected: Simple, standard pattern, handles scale appropriately

**Implementation Notes**:
- Column container: `CardContent` with `flex-1 overflow-y-auto max-h-[600px]`
- Header: `CardHeader` with `position: sticky top-0 z-10 bg-card`
- Task list: `space-y-3` for spacing between cards
- Auto-scroll on drop: `element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })`

---

## Best Practices & Patterns

### Task Management UI/UX Best Practices

1. **Information Density**: Show key info at a glance (title, priority, due date, assignee) without overwhelming
2. **Visual Hierarchy**: Title most prominent, metadata secondary, description tertiary
3. **Status Indicators**: Color-coded badges for priority and status (high priority = red, done = green)
4. **Placeholder Content**: Show "No description" rather than blank space (better UX)
5. **Drag Feedback**: Visual indication when dragging (opacity, cursor change, drop zone highlight)
6. **Responsive Design**: Cards stack on mobile, maintain readability

### RLS Policy Best Practices

1. **Team Membership Checks**: Always verify via `team_members` table (status = 'active')
2. **Circular Dependency Prevention**: Use direct column checks or SECURITY DEFINER functions
3. **Performance**: Index foreign keys and frequently queried columns
4. **Defense in Depth**: RLS + application-level checks (RLS primary, app secondary)
5. **Testing**: Verify policies prevent unauthorized access (different teams cannot see each other's tasks)

### Drag-and-Drop Best Practices

1. **Visual Feedback**: Show drag state (opacity, cursor), drop zone (highlight), and dragged element
2. **Accessibility**: Support keyboard navigation (Enter/Space to move, arrow keys to navigate)
3. **Error Handling**: Revert UI if API call fails, show error message
4. **Performance**: Debounce rapid drag events if needed (not required for MVP)
5. **Touch Support**: Works on mobile devices (native drag-and-drop supports touch)

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [HTML5 Drag-and-Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Linear Task Management UI Patterns](https://linear.app/)
- [Asana Kanban Best Practices](https://asana.com/guide/examples/kanban)
- [Trello Card Design Patterns](https://trello.com/)


