# Tasks: Modern Task Management UI

**Input**: Design documents from `/specs/003-modern-task-ui/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Constitution Compliance**: Tasks implement features per `.specify/memory/constitution.md` principles (Project-Centric, MVP First, Modular organization by domain)

**Tests**: Manual testing acceptable for MVP phase per constitution. Automated E2E tests deferred to post-MVP.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions

- SvelteKit web app: `src/lib/`, `src/routes/`, `supabase/migrations/`
- Database: `supabase/migrations/[timestamp]_[name].sql`
- Components: `src/lib/components/tasks/[Component].svelte`
- Services: `src/lib/api/services/[service].ts`
- Types: `src/lib/types/domain/task.ts`
- Stores: `src/lib/stores/[store].ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency configuration

- [x] T001 [P] Install @tanstack/svelte-virtual for virtual scrolling: `pnpm add @tanstack/svelte-virtual`
- [x] T002 [P] Install canvas-confetti for celebration animations: `pnpm add canvas-confetti @types/canvas-confetti`
- [x] T003 [P] Install svelte-dnd-action for drag-and-drop: `pnpm add svelte-dnd-action`
- [x] T004 [P] Verify @melloware/coloris is installed for color picker: `pnpm list @melloware/coloris`
- [x] T005 [P] Install date-fns for date utilities: `pnpm add date-fns`
- [x] T006 [P] Install svelte-multiselect for multi-select fields: `pnpm add svelte-multiselect`
- [x] T007 [P] Install sveltekit-superforms + formsnap for form handling: `pnpm add sveltekit-superforms formsnap`
- [x] T008 [P] Install @formkit/auto-animate for list animations: `pnpm add @formkit/auto-animate`
- [x] T009 [P] Install @number-flow/svelte for number animations: `pnpm add @number-flow/svelte`
- [x] T010 [P] Install svelte-teleport for portal/positioning: `pnpm add svelte-teleport`
- [x] T011 Create directory structure: `src/lib/components/tasks/`, `src/lib/components/base/`, `src/lib/api/services/`, `src/lib/stores/`, `src/lib/utils/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema, types, and infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Migrations (13 tables)

- [x] T012 Create subtasks table migration: `supabase/migrations/20251103150000_create_subtasks.sql`
- [x] T013 Create task_comments table migration: `supabase/migrations/20251103150001_create_task_comments.sql`
- [x] T014 Create task_attachments table migration: `supabase/migrations/20251103150002_create_task_attachments.sql`
- [x] T015 Create task_notifications table migration: `supabase/migrations/20251103150003_create_task_notifications.sql`
- [x] T016 Create task_templates table migration: `supabase/migrations/20251103150004_create_task_templates.sql`
- [x] T017 Create saved_task_views table migration: `supabase/migrations/20251103150005_create_saved_task_views.sql`
- [x] T018 Create task_labels table migration: `supabase/migrations/20251103150008_create_task_labels.sql`
- [x] T019 Create task_label_assignments table migration: `supabase/migrations/20251103150009_create_task_label_assignments.sql`
- [x] T020 Create task_stage_deadlines table migration: `supabase/migrations/20251103150010_create_task_stage_deadlines.sql`
- [x] T021 Create user_task_stats table migration: `supabase/migrations/20251103150011_create_user_task_stats.sql`
- [x] T022 Create task_breakdown_patterns table migration: `supabase/migrations/20251103150012_create_task_breakdown_patterns.sql`
- [x] T023 Create custom_field_definitions table migration: `supabase/migrations/20251103150006_create_custom_field_definitions.sql`
- [x] T024 Create task_custom_field_values table migration: `supabase/migrations/20251103150007_create_task_custom_field_values.sql`
- [x] T025 Run all migrations and verify schema in Supabase dashboard

### TypeScript Type Definitions

- [x] T026 [P] Define core task types in `src/lib/types/domain/task.ts` (Task, TaskDetail, TaskCreateInput, TaskUpdateInput)
- [x] T027 [P] Define subtask types in `src/lib/types/domain/task.ts` (Subtask, SubtaskCreateInput, SubtaskUpdateInput)
- [x] T028 [P] Define comment types in `src/lib/types/domain/task.ts` (TaskComment, TaskCommentCreateInput)
- [x] T029 [P] Define attachment types in `src/lib/types/domain/task.ts` (TaskAttachment)
- [x] T030 [P] Define notification types in `src/lib/types/domain/task.ts` (TaskNotification, NotificationEventType)
- [x] T031 [P] Define template types in `src/lib/types/domain/task.ts` (TaskTemplate, SavedTaskView)
- [x] T032 [P] Define label types in `src/lib/types/domain/task.ts` (TaskLabel, TaskLabelAssignment)
- [x] T033 [P] Define ADHD feature types in `src/lib/types/domain/task.ts` (TaskStageDeadline, UserTaskStats, TaskBreakdownPattern)
- [x] T034 [P] Define custom field types in `src/lib/types/domain/task.ts` (CustomFieldDefinition, TaskCustomFieldValue, CustomFieldType)
- [x] T035 [P] Define view mode types in `src/lib/types/domain/task.ts` (ViewMode, GroupingOption, TaskFilters)
- [x] T036 Create Zod validation schemas in `src/lib/schemas/tasks.ts` for runtime validation

### Service Layer Foundation

- [x] T037 [P] Implement SubtaskService in `src/lib/api/services/subtaskService.ts` (CRUD operations, RLS)
- [x] T038 [P] Implement CommentService in `src/lib/api/services/commentService.ts` (CRUD, @mentions parsing)
- [x] T039 [P] Implement AttachmentService in `src/lib/api/services/attachmentService.ts` (upload to Supabase Storage, signed URLs)
- [x] T040 [P] Implement NotificationService in `src/lib/api/services/notificationService.ts` (create, mark read, subscribe)
- [x] T041 [P] Implement LabelService in `src/lib/api/services/labelService.ts` (CRUD for labels and assignments)
- [x] T042 [P] Implement CustomFieldService in `src/lib/api/services/customFieldService.ts` (CRUD for definitions and values)
- [x] T043 [P] Implement TemplateService in `src/lib/api/services/templateService.ts` (CRUD for templates)
- [x] T044 [P] Implement SavedViewService in `src/lib/api/services/savedViewService.ts` (CRUD for saved views)
- [x] T045 Extend TaskService in `src/lib/api/services/taskService.ts` (add relations loading, detail fetching)

### Base Components

- [x] T046 [P] Create InlineTextEditor component in `src/lib/components/base/InlineTextEditor.svelte` (for living document editing)
- [x] T047 [P] Create InlineSelect component in `src/lib/components/base/InlineSelect.svelte`
- [x] T048 [P] Create InlineDatePicker component in `src/lib/components/base/InlineDatePicker.svelte`
- [x] T049 [P] Create InlineCheckbox component in `src/lib/components/base/InlineCheckbox.svelte`
- [x] T050 [P] Create StageSelector component in `src/lib/components/base/StageSelector.svelte` (for stage selection)

### Store Foundation

- [x] T051 Create tasks store in `src/lib/stores/tasks.ts` (writable store for task list)
- [x] T052 Create filters store in `src/lib/stores/filters.ts` (writable store for active filters)
- [x] T053 Create views store in `src/lib/stores/views.ts` (writable store for view preferences)

### Utility Functions

- [x] T054 [P] Create task filter utilities in `src/lib/utils/task-filters.ts` (filter matching logic)
- [x] T055 [P] Create task grouping utilities in `src/lib/utils/task-grouping.ts` (grouping logic)
- [x] T056 [P] Create drag-and-drop utilities in `src/lib/utils/draggable.ts` (svelte-dnd-action helpers)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Task Overview and Management (Priority: P1) 🎯 MVP

**Goal**: Users can view all tasks across projects in multiple visual formats (List, Board, Calendar, Timeline) with basic filtering

**Independent Test**: Create multiple tasks across different projects and stages, switch between list, kanban, and calendar views to verify all tasks display correctly with proper filtering.

### Implementation for User Story 1

- [x] T057 [US1] Create TasksPage route component in `src/routes/(auth)/tasks/+page.svelte`
- [x] T058 [US1] Create ViewModeSelector component in `src/lib/components/tasks/ViewModeSelector.svelte` (tabs for List/Board/Calendar/Timeline)
- [x] T059 [US1] Create TaskListView component in `src/lib/components/tasks/TaskListView.svelte` (list view with virtual scrolling)
- [x] T060 [US1] Create TaskCard component in `src/lib/components/tasks/TaskCard.svelte` (reusable task card for all views)
- [x] T061 [US1] Create TaskBoardView component in `src/lib/components/tasks/TaskBoardView.svelte` (kanban board with columns by stage)
- [x] T062 [US1] Create TaskCalendarView component in `src/lib/components/tasks/TaskCalendarView.svelte` (calendar grid with tasks on due dates)
- [x] T063 [US1] Create TaskTimelineView component in `src/lib/components/tasks/TaskTimelineView.svelte` (horizontal timeline with task bars)
- [x] T064 [US1] Create TaskFilterPanel component in `src/lib/components/tasks/TaskFilterPanel.svelte` (filter UI with Stage, Priority, Assignee, Project options)
- [x] T065 [US1] Implement filter logic in `src/lib/utils/task-filters.ts` (apply filters to task list)
- [x] T066 [US1] Implement virtual scrolling in TaskListView using @tanstack/svelte-virtual for lists >100 tasks
- [x] T067 [US1] Load tasks from TaskService in TasksPage and populate stores
- [x] T068 [US1] Implement view mode persistence in localStorage via views store
- [x] T069 [US1] Add search input to TaskFilterPanel for title/description filtering
- [x] T070 [US1] Display task properties on cards: status badge, priority indicator, assignee avatar, due date, project tag

**Checkpoint**: At this point, User Story 1 should be fully functional - users can view tasks in all 4 view modes with basic filtering

---

## Phase 4: User Story 2 - Rich Task Details and Context (Priority: P1)

**Goal**: Users can view comprehensive task details including description, subtasks, comments, attachments, and activity history

**Independent Test**: Create a task, open its detail panel, add description, create 2 subtasks, add a comment, upload an attachment, change status - verify all information persists and displays correctly.

### Implementation for User Story 2

- [x] T071 [US2] Create TaskDetailPanel component in `src/lib/components/tasks/TaskDetailPanel.svelte` (unified create/edit/view panel)
- [x] T072 [US2] Create DetailsTab component in `src/lib/components/tasks/detail/DetailsTab.svelte` (task properties editing)
- [x] T073 [US2] Create CommentsTab component in `src/lib/components/tasks/detail/CommentsTab.svelte` (comments list and input)
- [x] T074 [US2] Create ActivityTab component in `src/lib/components/tasks/detail/ActivityTab.svelte` (activity log display)
- [x] T075 [US2] Implement subtask CRUD in DetailsTab using SubtaskService
- [x] T076 [US2] Calculate and display subtask completion percentage in TaskCard and DetailsTab
- [x] T077 [US2] Implement comment creation in CommentsTab using CommentService
- [x] T078 [US2] Parse @mentions in comments and create notifications
- [x] T079 [US2] Implement file attachment upload in DetailsTab using AttachmentService
- [x] T080 [US2] Display attachments list with file names, sizes, and download links
- [x] T081 [US2] Implement image preview for image attachments
- [x] T082 [US2] Generate activity log from task changes (status, assignee, field updates)
- [x] T083 [US2] Integrate TaskDetailPanel with TasksPage (open on task click, close button)
- [x] T084 [US2] Implement inline editing for task title, description, priority, assignee, due date using base components

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view tasks and see rich details

---

## Phase 5: User Story 3 - Contextual Task Integration (Priority: P1)

**Goal**: Tasks appear in context of their parent entities (projects, photoshoots, resources) with embedded views

**Independent Test**: Navigate to a Project detail page, verify only that project's tasks appear in an embedded task view. Create a new task from within the project context and verify it auto-links to the project.

### Implementation for User Story 3

- [x] T085 [US3] Create EmbeddedTaskView component in `src/lib/components/tasks/EmbeddedTaskView.svelte` (reusable embedded view)
- [x] T086 [US3] Add task section to Project detail page using EmbeddedTaskView
- [x] T087 [US3] Filter tasks by project_id in EmbeddedTaskView when project context provided
- [x] T088 [US3] Add task section to Photoshoot detail page using EmbeddedTaskView
- [x] T089 [US3] Add task section to Resource detail page using EmbeddedTaskView
- [x] T090 [US3] Implement quick-create form in EmbeddedTaskView that auto-links to parent entity
- [x] T091 [US3] Add "View All Tasks" link in EmbeddedTaskView that navigates to main Tasks page with filter pre-applied
- [x] T092 [US3] Support list and board view modes in EmbeddedTaskView
- [x] T093 [US3] Ensure tasks created in context appear in main Tasks page with project association visible

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - tasks integrate across the app

---

## Phase 6: User Story 9 - ADHD-Friendly Task Management (Priority: P1)

**Goal**: Users get task suggestions, celebration animations, streak tracking, and progress visibility to support ADHD-friendly workflow

**Independent Test**: Create 10 tasks with various due dates and priorities. Click "What should I do now?" and verify algorithm suggests appropriate task. Complete task and verify celebration animation plays. Check streak counter updates.

### Implementation for User Story 9

- [x] T094 [US9] Create task suggestion algorithm in `src/lib/utils/task-suggestions.ts` (prioritize by due date, priority, dependencies)
- [x] T095 [US9] Create "What should I do now?" button component in `src/lib/components/tasks/TaskSuggestionButton.svelte`
- [x] T096 [US9] Display suggested tasks with reasoning in suggestion UI
- [x] T097 [US9] Implement celebration animation using canvas-confetti in `src/lib/utils/celebration.ts`
- [x] T098 [US9] Trigger celebration on task completion with encouraging message
- [x] T099 [US9] Respect prefers-reduced-motion for animations (show static message if disabled)
- [x] T100 [US9] Implement streak tracking logic in UserTaskStatsService (update on task completion)
- [x] T101 [US9] Display streak counter in TasksPage header with flame emoji
- [x] T102 [US9] Implement forgiving streak logic (1 grace day pause, breaks after 2 consecutive days)
- [x] T103 [US9] Display today's completion progress in TasksPage header ("X/Y tasks complete today")
- [x] T104 [US9] Create progress bar component for completion progress
- [x] T105 [US9] Implement stage-level deadline CRUD using TaskStageDeadlineService
- [ ] T106 [US9] Prompt for stage deadlines when creating task with due date >7 days away
- [ ] T107 [US9] Display upcoming stage deadline on task cards with color-coded urgency
- [ ] T108 [US9] Show encouragement message when stage completed before deadline
- [ ] T109 [US9] Implement gentle prompt for evening check (client-side, if no tasks completed today)
- [x] T110 [US9] Create UserTaskStatsService in `src/lib/api/services/userTaskStatsService.ts` (CRUD for stats)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 9 should all work independently - ADHD-friendly features enhance task management

---

## Phase 7: User Story 11 - Custom Task Fields (Priority: P1 - MVP Core)

**Goal**: Team admins can define custom fields (13 types) and all members can use them on tasks for specialized workflows

**Independent Test**: Navigate to team settings, create custom fields: "Material Cost" (currency type), "Hair Fiber Type" (select type), "Photoshoot Dates" (date-range type), "Crew Members" (crew-assignment type). Create a task, verify all custom fields appear in task detail panel. Enter values, save, verify data persists.

### Implementation for User Story 11

- [x] T111 [US11] Create custom field management UI in team settings (list existing fields, add/edit/delete)
- [x] T112 [US11] Create custom field definition form with field type selector (13 types)
- [x] T113 [US11] Implement field type-specific options (select choices, currency code, tag library, etc.)
- [x] T114 [US11] Create custom field value input widgets for all 13 types in `src/lib/components/tasks/custom-fields/`
- [x] T115 [US11] Create CustomFieldsSection component in `src/lib/components/tasks/detail/CustomFieldsSection.svelte`
- [x] T116 [US11] Integrate CustomFieldsSection into DetailsTab
- [x] T117 [US11] Implement custom field value CRUD using CustomFieldService
- [ ] T118 [US11] Implement field visibility configuration (show on cards, show in table, show in list, hidden)
- [ ] T119 [US11] Display custom fields on task cards when visibility configured
- [ ] T120 [US11] Format custom field values appropriately (currency symbols, date formats, tag badges, file icons)
- [ ] T121 [US11] Implement basic filtering by custom field values in TaskFilterPanel
- [x] T122 [US11] Enforce maximum 20 custom fields per team
- [ ] T123 [US11] Implement field ordering/reordering in team settings
- [ ] T124 [US11] Handle required field validation (enforce on save, not on existing tasks)
- [ ] T125 [US11] Preserve existing values when select/tag options are removed (show warning badge)

**Checkpoint**: At this point, User Stories 1, 2, 3, 9, AND 11 should all work independently - custom fields enable specialized workflows

---

## Phase 8: User Story 4 - Intuitive Task Manipulation (Priority: P2)

**Goal**: Users can drag tasks between stages, change properties inline, and perform quick edits without opening detail panel

**Independent Test**: Drag 3 tasks from "Todo" to "In Progress" column in board view, verify all update correctly. Click status badge directly, verify stage selector appears. Click due date, verify date picker appears inline.

### Implementation for User Story 4

- [x] T126 [US4] Implement drag-and-drop in TaskBoardView using svelte-dnd-action (Note: Currently using @shopify/draggable, may need migration)
- [x] T127 [US4] Add drag handles (`.task-drag-handle`) to task cards to prevent click conflicts
- [x] T128 [US4] Implement visual feedback during drag (ghost card, column highlighting, auto-scroll)
- [x] T129 [US4] Update task stage optimistically on drop, revert on error
- [x] T130 [US4] Handle lost drag control with error recovery (timeout detection, restore position)
- [x] T131 [US4] Auto-expand collapsed columns when dragging tasks over them
- [ ] T132 [US4] Implement inline stage selector on status badge click in TaskCard
- [ ] T133 [US4] Implement inline date picker on due date click in TaskCard (Note: DatePicker already exists, needs inline integration)
- [ ] T134 [US4] Implement inline priority selector on priority indicator click in TaskCard (Note: PrioritySelector already exists, needs inline integration)
- [ ] T135 [US4] Implement inline assignee selector on avatar click in TaskCard

**Note**: Bulk operations (multi-select, bulk actions) are intentionally deferred post-MVP per spec.md to maintain an opinionated workflow that encourages users to properly move tasks individually through stages.

**Checkpoint**: At this point, User Stories 1-4, 9, 11 should all work independently - task manipulation is fluid and intuitive

---

## Phase 9: User Story 5 - Standalone Task Management (Priority: P2)

**Goal**: Users can create tasks not tied to projects (shopping lists, general planning) and filter them separately

**Independent Test**: Create a task with no project association, tag it as "Shopping", verify it appears in main task views and can be filtered separately from project tasks.

### Implementation for User Story 5

- [ ] T136 [US5] Update TaskCreateInput to allow null projectId (standalone tasks)
- [ ] T137 [US5] Update TaskService.createTask to handle standalone tasks (require teamId if projectId null)
- [ ] T138 [US5] Add "Standalone Tasks" filter option to TaskFilterPanel
- [ ] T139 [US5] Add "Only Project Tasks" filter option to TaskFilterPanel
- [ ] T140 [US5] Implement filter logic for standalone vs project tasks
- [ ] T141 [US5] Add "Type" grouping option (Standalone vs Project) in grouping utilities
- [ ] T142 [US5] Allow converting standalone task to project task by assigning project (update projectId)
- [ ] T143 [US5] Ensure standalone tasks display correctly in all view modes

**Checkpoint**: At this point, User Stories 1-5, 9, 11 should all work independently - standalone tasks enable flexible tracking

---

## Phase 10: User Story 6 - Advanced Filtering and Grouping (Priority: P2)

**Goal**: Power users can filter by multiple criteria and group tasks by different dimensions for workload analysis

**Independent Test**: Apply multiple filters (Priority: High AND Project: Cosplay X AND Assigned to: Me), verify only matching tasks display. Change grouping from "Stage" to "Priority", verify tasks reorganize correctly.

### Implementation for User Story 6

- [ ] T144 [US6] Expand TaskFilterPanel with all filter options (Stage, Priority, Assignee, Project, Date Range, Labels, Completion Status, Include Archived)
- [ ] T145 [US6] Implement multi-filter AND logic in filter utilities
- [ ] T146 [US6] Add grouping selector to TasksPage (Stage, Priority, Project, Assignee, Due Date)
- [ ] T147 [US6] Implement grouping logic in `src/lib/utils/task-grouping.ts` for all grouping options
- [ ] T148 [US6] Display grouped tasks in collapsible sections with group headers showing count
- [ ] T149 [US6] Make group sections collapsible/expandable
- [ ] T150 [US6] Implement saved views CRUD using SavedViewService
- [ ] T151 [US6] Add "Save as View" button to TaskFilterPanel
- [ ] T152 [US6] Add saved views dropdown to TasksPage
- [ ] T153 [US6] Restore filters and grouping from saved view on selection
- [ ] T154 [US6] Persist grouping preference per view mode in views store
- [ ] T155 [US6] Implement "Include Archived" filter toggle (hide archived project tasks by default)
- [ ] T156 [US6] Display "Archived Project" badge on tasks from archived projects when filter enabled

**Checkpoint**: At this point, User Stories 1-6, 9, 11 should all work independently - advanced filtering enables power user workflows

---

## Phase 11: User Story 8 - Task Organization with Labels (Priority: P2)

**Goal**: Users can create custom labels with colors and apply multiple labels to tasks for flexible visual organization

**Independent Test**: Create labels "Urgent", "Fabric Work", "Needs Review" with different colors. Apply multiple labels to tasks. Filter tasks by label. Verify labels appear as colored badges on task cards.

### Implementation for User Story 8

- [ ] T157 [US8] Create label management UI in `src/lib/components/tasks/LabelManager.svelte` (list, create, edit, delete labels)
- [ ] T158 [US8] Add "Manage Labels" button to TasksPage
- [ ] T159 [US8] Implement label color picker using @melloware/coloris with preset colors
- [ ] T160 [US8] Enforce maximum 50 labels per team
- [ ] T161 [US8] Create label assignment UI in TaskDetailPanel (tag-style picker)
- [ ] T162 [US8] Implement label assignment CRUD using LabelService
- [ ] T163 [US8] Display labels as colored badges on TaskCard (up to 3 visible, "+N more" indicator)
- [ ] T164 [US8] Add label filter option to TaskFilterPanel (multi-select with OR logic)
- [ ] T165 [US8] Implement label filter logic (tasks matching ANY selected label)
- [ ] T166 [US8] Include label filter state in saved views
- [ ] T167 [US8] Show confirmation warning when deleting label (removes from all tasks)
- [ ] T168 [US8] Implement label reordering in LabelManager

**Checkpoint**: At this point, User Stories 1-6, 8, 9, 11 should all work independently - labels enable flexible organization

---

## Phase 12: User Story 10 - Task Breakdown Assistance (Priority: P2)

**Goal**: System suggests subtask breakdowns for large tasks using rule-based pattern matching

**Independent Test**: Create task "Build Iron Man Armor". System prompts for breakdown. Accept suggestion. Verify subtasks like "Research reference images", "Cut foam pieces", "Paint and weather" are created automatically.

### Implementation for User Story 10

- [ ] T169 [US10] Create task breakdown pattern matching algorithm in `src/lib/utils/task-breakdown.ts` (keyword detection, pattern matching)
- [ ] T170 [US10] Implement keyword extraction and normalization (lowercase, stemming)
- [ ] T171 [US10] Query task_breakdown_patterns table for fuzzy matches
- [ ] T172 [US10] Rank patterns by success rate (times_accepted / times_offered)
- [ ] T173 [US10] Create breakdown suggestion UI in TaskDetailPanel ("Suggest Subtasks" button)
- [ ] T174 [US10] Display suggested subtasks with edit/delete/reorder capabilities
- [ ] T175 [US10] Prompt for breakdown when creating task with no subtasks
- [ ] T176 [US10] Show gentle prompt for tasks with no subtasks and due date >7 days away
- [ ] T177 [US10] Offer "Use previous breakdown structure?" if similar task exists
- [ ] T178 [US10] Match task titles to templates and offer template application
- [ ] T179 [US10] Increment pattern usage counters when user accepts breakdown
- [ ] T180 [US10] Track user-specific dismissals to avoid repeated unwanted prompts
- [ ] T181 [US10] Create TaskBreakdownPatternService in `src/lib/api/services/taskBreakdownPatternService.ts` (CRUD for patterns)
- [ ] T182 [US10] Mark low-quality patterns (<20% acceptance after 10+ offers) for deprioritization

**Checkpoint**: At this point, User Stories 1-6, 8-11 should all work independently - breakdown assistance helps users get started

---

## Phase 13: User Story 7 - Quick Task Creation and Templates (Priority: P3)

**Goal**: Users can quickly create tasks with keyboard shortcuts and reuse templates for common patterns

**Independent Test**: Press keyboard shortcut 'N', quick-create form appears, type task title, press Enter, task creates with defaults. Apply "Photoshoot Prep" template, verify 10 standard subtasks create automatically.

### Implementation for User Story 7

- [ ] T183 [US7] Create QuickCreateOverlay component in `src/lib/components/tasks/QuickCreateOverlay.svelte`
- [ ] T184 [US7] Implement keyboard shortcut 'N' to open QuickCreateOverlay globally
- [ ] T185 [US7] Create minimal quick-create form (title input, Enter to submit)
- [ ] T186 [US7] Implement natural language parsing for project mentions, dates, priorities
- [ ] T187 [US7] Auto-link task to mentioned project in quick create
- [ ] T188 [US7] Create template selection UI in TaskDetailPanel ("Add from Template" button)
- [ ] T189 [US7] Apply template to create task with predefined subtasks and properties
- [ ] T190 [US7] Create "Save as Template" functionality in TaskDetailPanel
- [ ] T191 [US7] Implement template CRUD using TemplateService
- [ ] T192 [US7] Create "Duplicate Task" functionality in TaskDetailPanel (copy all properties except dates/completion)
- [ ] T193 [US7] Suggest matching templates when creating new tasks based on title keywords

**Checkpoint**: At this point, all user stories should work independently - quick creation and templates reduce friction

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T194 [P] Implement error handling and retry logic for all API operations
- [ ] T195 [P] Add loading states and skeletons for all async operations
- [ ] T196 [P] Implement optimistic UI updates with error recovery for all mutations
- [ ] T197 [P] Add keyboard navigation support (arrow keys, Enter, Escape)
- [ ] T198 [P] Implement responsive design for mobile devices (stacked layout, full-screen detail panel)
- [ ] T199 [P] Add swipe gestures for mobile (swipe to mark complete, swipe to delete)
- [ ] T200 [P] Implement accessibility features (ARIA labels, keyboard navigation, screen reader support)
- [ ] T201 [P] Add performance optimizations (memoization, lazy loading, code splitting)
- [ ] T202 [P] Implement notification center UI in app header (unread count badge, dropdown)
- [ ] T203 [P] Create email notification templates for task events
- [ ] T204 [P] Implement notification preferences in user settings
- [ ] T205 [P] Add activity log generation from task changes (status, assignee, field updates)
- [ ] T206 [P] Implement real-time updates using Supabase Realtime subscriptions
- [ ] T207 [P] Add error boundaries and fallback UI for component errors
- [ ] T208 [P] Implement URL state sync for filters and view mode (shareable links)
- [ ] T209 [P] Add analytics tracking for task operations (optional, if analytics system exists)
- [ ] T210 [P] Run quickstart.md validation checklist
- [ ] T211 [P] Code cleanup and refactoring
- [ ] T212 [P] Performance testing with 200+ tasks
- [ ] T213 [P] Mobile testing on real devices
- [ ] T214 [P] Accessibility audit and fixes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-13)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 14)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for TaskCard component
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for EmbeddedTaskView
- **User Story 9 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for TasksPage, US2 for task completion
- **User Story 11 (P1)**: Can start after Foundational (Phase 2) - Depends on US2 for CustomFieldsSection integration
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for TaskBoardView
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for filtering, US6 for filter options
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for TaskFilterPanel
- **User Story 8 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for TaskCard, US2 for TaskDetailPanel
- **User Story 10 (P2)**: Can start after Foundational (Phase 2) - Depends on US2 for subtasks, US7 for templates
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for QuickCreateOverlay, US2 for templates

### Within Each User Story

- Models before services
- Services before components
- Base components before feature components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Type definitions within a phase marked [P] can run in parallel
- Service implementations within a phase marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all type definitions together:
Task: "Define core task types in src/lib/types/domain/task.ts"
Task: "Define view mode types in src/lib/types/domain/task.ts"

# Launch all view components together:
Task: "Create TaskListView component in src/lib/components/tasks/TaskListView.svelte"
Task: "Create TaskBoardView component in src/lib/components/tasks/TaskBoardView.svelte"
Task: "Create TaskCalendarView component in src/lib/components/tasks/TaskCalendarView.svelte"
Task: "Create TaskTimelineView component in src/lib/components/tasks/TaskTimelineView.svelte"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3, 9, 11 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Quick Task Overview)
4. Complete Phase 4: User Story 2 (Rich Task Details)
5. Complete Phase 5: User Story 3 (Contextual Integration)
6. Complete Phase 6: User Story 9 (ADHD-Friendly Features)
7. Complete Phase 7: User Story 11 (Custom Fields)
8. **STOP and VALIDATE**: Test all P1 stories independently
9. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 9 → Test independently → Deploy/Demo
6. Add User Story 11 → Test independently → Deploy/Demo (Full MVP!)
7. Add P2 stories incrementally → Test independently → Deploy/Demo
8. Add P3 stories → Test independently → Deploy/Demo
9. Polish phase → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Quick Overview)
   - Developer B: User Story 2 (Rich Details)
   - Developer C: User Story 3 (Contextual Integration)
3. After P1 stories complete:
   - Developer A: User Story 9 (ADHD Features)
   - Developer B: User Story 11 (Custom Fields)
   - Developer C: User Story 4 (Task Manipulation)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing acceptable for MVP phase per constitution
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Focus Mode (US9) is deferred post-MVP - component created but disabled per spec

---

## Summary

**Total Tasks**: 214 tasks across 14 phases

**Task Count by Phase**:
- Phase 1 (Setup): 11 tasks
- Phase 2 (Foundational): 45 tasks
- Phase 3 (US1): 14 tasks
- Phase 4 (US2): 14 tasks
- Phase 5 (US3): 9 tasks
- Phase 6 (US9): 17 tasks
- Phase 7 (US11): 15 tasks
- Phase 8 (US4): 10 tasks
- Phase 9 (US5): 8 tasks
- Phase 10 (US6): 13 tasks
- Phase 11 (US8): 12 tasks
- Phase 12 (US10): 14 tasks
- Phase 13 (US7): 11 tasks
- Phase 14 (Polish): 21 tasks

**MVP Scope (P1 Stories Only)**: Phases 1-7 = 119 tasks
- Setup: 11 tasks
- Foundational: 45 tasks
- US1: 14 tasks
- US2: 14 tasks
- US3: 9 tasks
- US9: 17 tasks
- US11: 15 tasks

**Parallel Opportunities**: 
- 45+ tasks marked [P] can run in parallel
- All user stories can be worked on in parallel after Foundational phase
- Type definitions, services, and components within phases can be parallelized

**Independent Test Criteria**: Each user story has clear independent test criteria defined in spec.md
