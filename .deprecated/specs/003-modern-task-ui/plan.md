# Implementation Plan: Modern Task Management UI

**Branch**: `003-modern-task-ui` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-modern-task-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Complete UI redesign of the task management system to provide a modern, beautiful, and functional interface comparable to Monday.com, Asana, Trello, and ClickUp. The redesign includes four view modes (List, Kanban Board, Calendar, Timeline), rich task details with subtasks/comments/attachments, ADHD-friendly features (task suggestions, celebration animations, streak tracking), custom fields for specialized workflows, and seamless integration across projects, resources, and photoshoots. Technical approach uses SvelteKit with Svelte 5 runes, Flowbite components, svelte-dnd-action for drag-and-drop, @melloware/coloris for color picking, and Supabase for backend persistence with RLS.

## Technical Context

**Language/Version**: TypeScript 5.9.2+ with strict mode, Svelte 5.39.5+ with runes  
**Primary Dependencies**: 
- SvelteKit 2.43.2+ (framework)
- Flowbite Svelte 1.19.0+ (UI components)
- svelte-dnd-action 0.9.67+ (drag-and-drop, replaces @shopify/draggable)
- @melloware/coloris 0.25.0+ (color picker)
- @tanstack/svelte-virtual 3.13.12+ (virtual scrolling)
- canvas-confetti 1.9.4+ (celebration animations)
- @supabase/supabase-js 2.76.1+ (backend)
- date-fns 4.1.0+ (date utilities)

**Storage**: 
- Supabase PostgreSQL (primary database)
- Cloudflare R2 (file attachments via Supabase Storage)
- LocalStorage (user preferences, view state)

**Testing**: 
- Playwright 1.56.1+ (E2E tests for critical user journeys)
- Vitest 4.0.3+ (unit/integration tests)
- @testing-library/svelte 5.2.8+ (component testing)

**Target Platform**: 
- Web application (SvelteKit SSR + client-side)
- Cloudflare Pages/Workers deployment
- Responsive design (mobile-first, works on phones/tablets/desktop)

**Project Type**: Web application (SvelteKit single-page app with SSR)

**Performance Goals**: 
- Task views load and become interactive within 2 seconds
- Drag-and-drop operations complete with visual feedback within 100ms
- Switching between views happens instantly (under 500ms) without reload
- Support 200+ tasks without perceivable slowdown
- Virtual scrolling for lists exceeding 100 visible tasks
- 60fps animations for drag operations

**Constraints**: 
- Must work with existing task_stages system (no schema changes to core tables)
- Must respect team boundaries via Supabase RLS
- Must maintain backward compatibility with existing task data
- Must support SSR (drag-and-drop libraries loaded client-side only)
- Must be accessible (keyboard navigation, screen readers, ARIA labels)
- Must respect prefers-reduced-motion for animations

**Scale/Scope**: 
- 50-500 tasks per team (typical), up to 1000+ tasks (extreme cases require optimization)
- 4 view modes (List, Board, Calendar, Timeline)
- 13 custom field types (short-text, text-field, number, number-range, currency, checkbox, select, custom-tags, date, date-range, crew-assignment, link-input, file-input)
- Maximum 20 custom fields per team
- Maximum 50 labels per team
- Maximum 50 subtasks per task (application-side limit)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Project-Centric**: Feature is associable with projects (or explain if project-agnostic utility)
  - Tasks can be project-scoped (linked to projects/resources) or team-scoped (standalone tasks for shopping lists, general management)
  - Standalone tasks are explicitly allowed for non-project work (shopping lists, team management)
  
- [x] **Team-Based**: Feature respects team ownership and membership boundaries
  - All tasks respect team boundaries via existing task_stages and team_id architecture
  - RLS policies enforce team isolation for all new entities (subtasks, comments, attachments, labels, custom fields)
  
- [x] **Feature Scope**: Feature is classified in Feature Scope Matrix (MVP Core, Phase 2, Phase 3, or Future)
  - Classified as **MVP Core** - Tasks are listed in Feature Scope Matrix under Tracking Domain as MVP Core feature
  
- [x] **Complete Workflow**: Feature supports a clear phase of the cosplay lifecycle (ideation → creation → event → post-production → archive)
  - Task management is critical throughout cosplay lifecycle (planning → creation → events → post-production)
  - Tasks integrate across Projects, Resources, Events domains
  
- [x] **MVP First**: Scope is minimal viable; complex features justified or deferred
  - Bulk operations deferred post-MVP (opinionated workflow encourages individual task progression)
  - Advanced features (time tracking, dependencies, recurring tasks) deferred post-MVP
  - Focus Mode deferred post-MVP (component created but disabled, needs redesign)
  
- [x] **Test-First**: Critical user journeys have tests written before implementation
  - E2E tests for critical journeys (task creation, view switching, drag-and-drop) planned
  - Test infrastructure already established (Playwright, Vitest)
  
- [x] **Modular**: Feature fits cleanly into one domain (Main/Tracking/Social/Events/Resources)
  - Fits into **Tracking Domain** (alongside Calendar, Timeline, Budget, Notes)
  - Task views integrate across domains but maintain independence
  
- [x] **Cost-Conscious**: No new paid services introduced without justification
  - All libraries are free/open-source (svelte-dnd-action, @melloware/coloris, canvas-confetti)
  - Uses existing Supabase and Cloudflare infrastructure (no new paid services)
  
- [x] **Future-Ready**: Data models accommodate planned enhancements without over-engineering
  - Custom fields designed for extensibility (13 types, can add more post-MVP)
  - Task breakdown patterns table supports future AI/ML upgrade (rule-based MVP, AI post-MVP)
  - Data abstraction layer protects frontend from backend changes
  
- [x] **Data Privacy**: Privacy levels and data ownership respected (Supabase RLS)
  - All new tables have RLS policies enforcing team boundaries
  - Task comments use soft delete to preserve conversation context
  - File attachments use Supabase Storage with signed URLs
  
- [x] **Tech Stack**: Uses SvelteKit, Bun, Flowbite, Tailwind, Supabase, Cloudflare (or justifies deviation)
  - ✅ SvelteKit 2.43.2+ with Svelte 5 runes
  - ✅ Flowbite Svelte 1.19.0+ (UI components)
  - ✅ Tailwind CSS (via Flowbite)
  - ✅ Supabase (database, auth, storage)
  - ✅ Cloudflare Pages/Workers (deployment)
  - ✅ Bun (development runtime)
  
- [x] **Navigation**: If adding routes, aligns with documented navigation structure
  - Tasks page exists at `/tasks` (already in navigation structure under Tracking domain)
  - No new top-level routes added (embedded views use existing routes)

**Feature Phase**: **MVP Core**

**Violations**: None

**Post-Design Re-evaluation**: All constitutional requirements met. Design artifacts (data-model.md, contracts/) confirm:
- Additive-only database changes (no breaking changes to existing tables)
- RLS policies enforce team isolation
- Data models support future enhancements (custom fields extensible, breakdown patterns support AI upgrade)
- All libraries are free/open-source
- Tech stack fully compliant

## Project Structure

### Documentation (this feature)

```text
specs/003-modern-task-ui/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-schema.yaml  # OpenAPI schema
│   └── types.ts         # TypeScript type definitions
├── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
├── STATUS.md            # Implementation status tracking
└── PHASE_0_DB_FIXES.md  # Database migration notes
```

### Source Code (repository root)

```text
src/
├── routes/
│   └── (auth)/
│       └── tasks/
│           ├── +page.svelte          # Main tasks page
│           └── [id]/
│               └── +page.svelte      # Task detail page (optional)
│
├── lib/
│   ├── components/
│   │   ├── tasks/                    # Task-specific components
│   │   │   ├── TaskListView.svelte   # List view component
│   │   │   ├── TaskBoardView.svelte   # Kanban board view
│   │   │   ├── TaskCalendarView.svelte # Calendar view
│   │   │   ├── TaskTimelineView.svelte # Timeline view
│   │   │   ├── TaskDetailPanel.svelte # Unified detail panel
│   │   │   ├── TaskCard.svelte        # Task card component
│   │   │   ├── TaskFilterPanel.svelte # Filter UI
│   │   │   ├── ViewModeSelector.svelte # View mode tabs
│   │   │   ├── QuickCreateOverlay.svelte # Quick create form
│   │   │   ├── EmbeddedTaskView.svelte # Reusable embedded view
│   │   │   └── detail/               # Detail panel sub-components
│   │   │       ├── DetailsTab.svelte
│   │   │       ├── CommentsTab.svelte
│   │   │       └── ActivityTab.svelte
│   │   │
│   │   ├── base/                     # Base inline editing components
│   │   │   ├── InlineTextEditor.svelte
│   │   │   ├── InlineSelect.svelte
│   │   │   ├── InlineDatePicker.svelte
│   │   │   └── InlineCheckbox.svelte
│   │   │
│   │   └── ui/                       # Flowbite UI components
│   │       ├── date-picker.svelte    # Date picker component
│   │       └── ...                    # Other Flowbite components
│   │
│   ├── api/
│   │   └── services/
│   │       ├── taskService.ts        # Task CRUD operations
│   │       ├── subtaskService.ts     # Subtask operations
│   │       ├── commentService.ts     # Comment operations
│   │       ├── attachmentService.ts  # File attachment operations
│   │       ├── labelService.ts       # Label management
│   │       ├── customFieldService.ts # Custom field operations
│   │       └── templateService.ts   # Task template operations
│   │
│   ├── stores/
│   │   ├── tasks.ts                  # Task state management
│   │   ├── filters.ts               # Filter state
│   │   └── views.ts                 # View preferences
│   │
│   ├── types/
│   │   ├── domain/
│   │   │   └── task.ts              # Domain task types
│   │   └── supabase.ts              # Generated Supabase types
│   │
│   ├── utils/
│   │   ├── task-filters.ts          # Filter logic
│   │   ├── task-grouping.ts        # Grouping logic
│   │   ├── task-suggestions.ts    # ADHD task suggestion algorithm
│   │   ├── task-breakdown.ts      # Breakdown pattern matching
│   │   └── draggable.ts            # Drag-and-drop utilities
│   │
│   └── transformers/
│       └── taskTransformer.ts      # API ↔ Domain transformations
│
├── hooks.server.ts                  # Server-side hooks
│
supabase/
└── migrations/
    ├── 20251103_create_subtasks.sql
    ├── 20251103_create_task_comments.sql
    ├── 20251103_create_task_attachments.sql
    ├── 20251103_create_task_notifications.sql
    ├── 20251103_create_task_templates.sql
    ├── 20251103_create_saved_task_views.sql
    ├── 20251103_create_task_labels.sql
    ├── 20251103_create_task_stage_deadlines.sql
    ├── 20251103_create_user_task_stats.sql
    ├── 20251103_create_task_breakdown_patterns.sql
    ├── 20251103_create_custom_field_definitions.sql
    └── 20251103_create_task_custom_field_values.sql

tests/
├── e2e/
│   └── tasks/                       # E2E tests for task UI
│       ├── task-views.spec.ts      # View mode switching tests
│       ├── task-creation.spec.ts   # Task creation tests
│       ├── task-drag-drop.spec.ts # Drag-and-drop tests
│       └── task-filters.spec.ts   # Filter tests
│
├── integration/
│   └── taskService.test.ts         # Service layer tests
│
└── unit/
    └── components/
        └── tasks/                  # Component unit tests
            ├── TaskCard.test.ts
            └── TaskFilterPanel.test.ts
```

**Structure Decision**: Web application (SvelteKit) with single codebase. Components organized by feature domain (`tasks/`), base components reusable across features (`base/`), and UI components from Flowbite (`ui/`). API services abstract backend operations. Stores manage reactive state. Utils contain pure functions for filtering, grouping, and algorithms. Database migrations in `supabase/migrations/` follow chronological naming convention.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification. All design decisions align with constitutional principles.
