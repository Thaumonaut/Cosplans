# Implementation Plan: Robust Task Management

**Branch**: `001-robust-tasks` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-robust-tasks/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix critical bugs in task management (completion not persisting, visibility not scoped to teams) and enhance with modern task card design, scrollable kanban columns, custom task stages, and improved dashboard display. Tasks can be project-scoped or standalone, with proper team-based RLS enforcement. Completion is stage-based (moving to completion stage marks task as done).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Svelte 5 (Runes)  
**Primary Dependencies**: SvelteKit, Supabase Client, Flowbite Svelte, Tailwind CSS, Lucide Svelte  
**Storage**: Supabase PostgreSQL (Postgres 15+) with Row Level Security (RLS)  
**Testing**: Playwright (E2E), TypeScript type checking (compilation-time)  
**Target Platform**: Web (responsive, mobile-first), deployed to Cloudflare Pages  
**Project Type**: Web application (SvelteKit monorepo)  
**Performance Goals**: Task creation/update < 2 seconds (including RLS checks), smooth drag-and-drop (60fps), kanban columns support 50+ tasks with independent scrolling  
**Constraints**: Must maintain backward compatibility with existing tasks, RLS policies must prevent cross-team data leaks, UI must handle 100+ tasks per team gracefully  
**Scale/Scope**: MVP supports teams of 1-20 members, 50-500 tasks per team, 10 custom stages per team

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Project-Centric**: Feature is associable with projects (or explain if project-agnostic utility)
  - Tasks can be project-scoped OR standalone (team-scoped). Standalone tasks are exempt from project requirement per constitution (user/team-scoped features).
- [x] **Team-Based**: Feature respects team ownership and membership boundaries
  - All tasks must be associated with a team (via project.team_id or tasks.team_id for standalone). RLS enforces team-based access control.
- [x] **Feature Scope**: Feature is classified in Feature Scope Matrix (MVP Core, Phase 2, Phase 3, or Future)
  - Task management is MVP Core (Tracking domain). Custom stages are enhancement within MVP scope.
- [x] **Complete Workflow**: Feature supports a clear phase of the cosplay lifecycle (ideation → creation → event → post-production → archive)
  - Tasks support "Active Creation" phase (task management, deadlines, assignment). Critical for project execution.
- [x] **MVP First**: Scope is minimal viable; complex features justified or deferred
  - P1 fixes (completion bug, visibility scoping) are essential. Custom stages (P2) provide workflow flexibility without over-engineering.
- [x] **Test-First**: Critical user journeys have tests written before implementation
  - E2E tests required for: task creation, stage changes, team visibility, completion persistence.
- [x] **Modular**: Feature fits cleanly into one domain (Main/Tracking/Social/Events/Resources)
  - Fits Tracking domain. Task cards and kanban view are UI enhancements within domain.
- [x] **Cost-Conscious**: No new paid services introduced without justification
  - No new services. Uses existing Supabase and Cloudflare infrastructure.
- [x] **Future-Ready**: Data models accommodate planned enhancements without over-engineering
  - Tasks table already has nullable project_id. Adding team_id and stage system (task_stages table) supports custom workflows without major refactoring.
- [x] **Data Privacy**: Privacy levels and data ownership respected (Supabase RLS)
  - RLS policies enforce team-based access. Tasks only visible to team members. Fixing visibility bug is privacy-critical.
- [x] **Tech Stack**: Uses SvelteKit, Bun, Flowbite, Tailwind, Supabase, Cloudflare (or justifies deviation)
  - Full compliance. Using existing stack components (SvelteKit, Flowbite, Supabase).
- [x] **Navigation**: If adding routes, aligns with documented navigation structure
  - No new routes. Enhancing existing `/tasks` page with kanban/list/table views.

**Feature Phase**: MVP Core (Task management is explicitly listed in MVP Core Tracking domain)

**Violations**: None

---

## Constitution Check (Post-Design)

*Re-evaluated after Phase 1 design completion.*

### Design Validation

- [x] **Data Model**: Supports project-scoped and standalone tasks (constitution-compliant)
  - Standalone tasks are team-scoped, exempt from project requirement per constitution
- [x] **RLS Policies**: All policies enforce team-based access control
  - Prevents cross-team data leaks (privacy requirement)
- [x] **Stage System**: Team-specific stages, backward compatible with default stages
  - No over-engineering, MVP-appropriate complexity
- [x] **API Design**: Follows existing service pattern (Supabase client)
  - Consistent with codebase architecture
- [x] **UI Components**: Uses Flowbite Svelte components where possible
  - Tech stack compliance maintained
- [x] **Testing Strategy**: E2E tests for critical user journeys
  - Test-first approach for bug fixes (P1)

**Design Compliance**: All design decisions align with constitution principles. No violations introduced during design phase.

**Notes**: 
- Stage-based completion model is flexible and future-ready (supports custom workflows)
- Team scoping via `team_id` column maintains backward compatibility
- `completed` boolean deprecated but retained for migration period

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   └── services/
│   │       ├── taskService.ts           # Task CRUD operations (update)
│   │       └── teamService.ts           # Team membership queries (existing)
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskDetail.svelte        # Task create/edit form (update)
│   │   │   └── TaskCard.svelte           # Modern task card component (new)
│   │   └── projects/
│   │       └── tabs/
│   │           └── TasksTab.svelte      # Project tasks view (update)
│   ├── stores/
│   │   ├── tasks-store.ts               # Task state management (update)
│   │   └── teams.ts                     # Current team context (existing)
│   └── types/
│       └── domain/
│           └── task.ts                  # Task type definitions (update)
│
├── routes/
│   └── (auth)/
│       ├── tasks/
│       │   └── +page.svelte             # Main tasks page with kanban (update)
│       └── dashboard/
│           └── +page.svelte             # Dashboard task widget (update)
│
supabase/
└── migrations/
    ├── YYYYMMDDHHMMSS_add_task_stages.sql       # Task stages table (new)
    ├── YYYYMMDDHHMMSS_add_task_team_id.sql      # Team scoping for standalone tasks (new)
    └── YYYYMMDDHHMMSS_fix_task_rls_policies.sql # Fix RLS visibility (new)

tests/
├── e2e/
│   └── tasks/
│       ├── task-completion.spec.ts      # Completion persistence tests (new)
│       ├── task-visibility.spec.ts      # Team scoping tests (new)
│       └── task-stages.spec.ts          # Custom stages tests (new)
└── integration/
    └── task-service.test.ts             # Task service API tests (update)
```

**Structure Decision**: SvelteKit web application structure. Task management features span multiple areas:
- **Frontend**: Routes, components, stores in `src/`
- **Backend**: Database migrations in `supabase/migrations/`
- **Tests**: E2E tests for critical user journeys, integration tests for service layer

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
