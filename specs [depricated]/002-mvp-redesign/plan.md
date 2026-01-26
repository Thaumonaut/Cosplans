# Implementation Plan: MVP Cosplay Tracker Redesign

**Branch**: `002-mvp-redesign` | **Date**: 2025-10-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-mvp-redesign/spec.md`

## Summary

Transform the current cosplay tracker from a sprawling 30+ feature application into a focused MVP delivering complete workflow coverage (idea → planning → execution → photoshoots → teams) through 8 core pages with modern UI/UX converted from React designs. The redesign implements:

- **Polymorphic entities** (resources/tools with category-based forms)
- **Single detail page pattern** (inline editing for create/edit/view)
- **Hybrid progress tracking** (tasks + resource status with resource-level tasks)
- **Team collaboration** with permissive permission model (Owner/Editor/Viewer with commenting)
- **Smart image processing** (3 versions: thumbnail/display/original)
- **Fuzzy search** with typo tolerance across all entity types

Technical approach prioritizes conversion of existing React UI components to Svelte 5 with runes, using Flowbite Svelte (constitutional requirement) customized to match React design aesthetic, and implementing on-blur auto-save with inline validation. This reduces scope from 30+ pages to 8 core pages while maintaining complete workflow coverage.

## Technical Context

**Language/Version**: TypeScript 5.x with Svelte 5.39+ (using runes)  
**Primary Dependencies**: 
- SvelteKit 2.x (framework)
- Supabase JS SDK 2.x (backend, auth, database)
- Tailwind CSS 3.x (styling)
- Flowbite Svelte 0.44+ (UI components - constitutional requirement)
- Fuse.js or PostgreSQL pg_trgm (fuzzy search)
- Sharp or browser Canvas API (image processing)

**Storage**: 
- PostgreSQL via Supabase (user data, projects, resources, tasks, teams)
- Supabase Storage (images with 3 versions per upload)
- Row Level Security (RLS) for team-based access control

**Testing**: 
- Vitest (unit/integration tests for components and stores)
- Playwright (E2E tests for user workflows)
- Existing test infrastructure from spec `001-comprehensive-testing`

**Target Platform**: Web (SvelteKit SSR + CSR), Mobile-responsive (375px+ width)

**Project Type**: Web application (monolithic SvelteKit structure with src/routes and src/lib)

**Performance Goals**:
- Initial dashboard load: <3s on broadband
- Auto-save on blur: <2s to persist
- Fuzzy search: <1s for 500+ items
- Image upload + processing: <10s for 10MB
- Grid view rendering: <2s for 50+ thumbnail images
- Progress calculation update: <2s after status change

**Constraints**:
- Max 10MB per image upload
- Fuzzy search supports up to 2-character typos
- Calendar displays 50+ items without degradation
- Supports 10 concurrent users per team
- Mobile-first responsive design (375px minimum)
- On-blur auto-save (no debounce delay)

**Scale/Scope**:
- 8 core pages (Ideas, Projects, Resources, Tools, Photoshoots, Teams, Calendar, Settings)
- 12 core entities (Idea, Project, Resource, Tool, Task, Photoshoot, Shot, Team, TeamMember, User, Comment, ProjectResource)
- 79 functional requirements across 8 user stories
- ~25-30 Svelte components (base + domain-specific)
- Typical usage: 50-100 projects per user/team, 2-10 team members

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Project-Centric**: All cosplay-related features (ideas, projects, resources, tools, photoshoots) are project-associable or project-scoped. Teams are user-scoped per constitution exemptions.
- [x] **Team-Based**: All projects, resources, tools, and photoshoots belong to teams. Team membership controls access via RLS. Personal teams auto-created on registration.
- [x] **Feature Scope**: Feature classified as **MVP Core** - delivers complete workflow from ideation through photoshoots with team collaboration. Aligns with constitution's MVP Core requirements for projects, resources, events, and tracking.
- [x] **Complete Workflow**: Supports full lifecycle - Ideas (ideation) → Projects (planning/creation) → Resources/Tools (execution) → Photoshoots (events) → Archive (completed state tracking via project status). Missing post-production phase (social media) and advanced archive features intentionally deferred per MVP scope.
- [x] **MVP First**: Focused on 8 essential pages. Deferred 17+ features to Phase 2 (marketplace, social features, tutorials, messages, conventions, advanced permissions, real-time collaboration, version history, export/import, advanced analytics, pattern generation, 3D preview).
- [x] **Test-First**: Leverages existing comprehensive testing infrastructure (spec 001). Critical journeys have acceptance scenarios defined: idea creation/conversion, project tracking with progress calculation, resource library management, team collaboration, photoshoot planning.
- [x] **Modular**: Features organized by domain - Main (Ideas, Projects), Resources (Resources, Tools), Events (Photoshoots), Tracking (Calendar, Tasks in projects), Social (Teams). Clear boundaries with minimal coupling.
- [x] **Cost-Conscious**: Uses existing free-tier infrastructure (Supabase, Cloudflare). Image processing via Sharp (server) or Canvas API (client) - no new paid services. Fuzzy search via Fuse.js (free JS library) or pg_trgm (PostgreSQL extension included with Supabase).
- [x] **Future-Ready**: Data model includes nullable fields for future features (e.g., project.client_id for future marketplace). Team roles designed with expansion in mind (Owner/Editor/Viewer can grow). Comment entity enables future enhanced collaboration. Resource status enum supports workflow expansion. Project status includes 'archived' for Phase 2 portfolio conversion.
- [x] **Data Privacy**: Supabase RLS enforced for all tables. Team membership validates all queries. Images via signed URLs. Comment entity respects team membership. User data ownership preserved. Privacy levels implicit through team membership (private teams = private data).
- [x] **Tech Stack**: Uses SvelteKit 2.x, Svelte 5 (runes), Bun (dev), Tailwind CSS, Flowbite Svelte (constitutional requirement), Supabase (backend), Cloudflare Pages (deployment), R2 Storage (images).
- [x] **Navigation**: Follows flat sidebar structure per constitution. 8 pages align with documented domains: Main (Ideas, Projects), Tracking (Calendar, Tasks), Events (Photoshoots), Resources (Resources, Tools), Social (Teams), Settings. No deep nesting.

**Feature Phase**: MVP Core

**Violations**: None

**Constitution Alignment Notes**:
- **Complete Workflow Gap**: Post-production (social media scheduling) and advanced archive (portfolio conversion) intentionally deferred to Phase 2 per constitution's "MVP delivers basic functionality for all phases" provision. MVP provides project completion tracking (archive status) as minimal viable post-production support.
- **Resource Architecture**: Implements simplified resource categories (prop, fabric, wig, pattern, costume-piece, accessory, material) vs. constitution's detailed sub-resource tables (Outfits, Accessories & Makeup, Props, Materials, Tools separated). This MVP simplification uses polymorphic metadata instead of separate tables - aligns with MVP First principle. Future migration path: split Resource table into separate tables per category in Phase 2.
- **Events Coverage**: Implements Photoshoots only. Constitution MVP Core includes Conventions (full feature set). Conventions intentionally deferred to Phase 2 to reduce scope. Rationale: Photoshoots are higher priority for complete workflow (immediate pre-cursor to post-production), conventions are event discovery/planning which can be handled outside app initially.
- **Team Types**: Implements Personal and Private teams. Public teams deferred to Phase 3 per constitution.

## Project Structure

### Documentation (this feature)

```text
specs/002-mvp-redesign/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── api-schema.yaml  # OpenAPI/REST contracts
│   └── types.ts         # Shared TypeScript types
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/                      # Data abstraction layer
│   │   ├── services/             # Service interfaces & implementations
│   │   │   ├── ideaService.ts
│   │   │   ├── projectService.ts
│   │   │   ├── resourceService.ts
│   │   │   ├── toolService.ts
│   │   │   ├── taskService.ts
│   │   │   ├── photoshootService.ts
│   │   │   ├── teamService.ts
│   │   │   ├── commentService.ts
│   │   │   └── imageService.ts
│   │   ├── supabase.ts           # Supabase client initialization
│   │   └── types.ts              # API-specific types
│   ├── types/
│   │   ├── domain/               # Domain models (UI-friendly)
│   │   │   ├── idea.ts
│   │   │   ├── project.ts
│   │   │   ├── resource.ts
│   │   │   ├── tool.ts
│   │   │   ├── task.ts
│   │   │   ├── photoshoot.ts
│   │   │   ├── team.ts
│   │   │   └── comment.ts
│   │   └── api/                  # API response types (backend shape)
│   ├── transformers/             # API ↔ Domain transformations
│   │   ├── ideaTransformer.ts
│   │   ├── projectTransformer.ts
│   │   ├── resourceTransformer.ts
│   │   └── ...
│   ├── schemas/                  # Polymorphic form schemas
│   │   ├── field-schemas.ts      # Category-based field definitions
│   │   └── validation.ts         # Validation rules
│   ├── utils/                    # Utility functions
│   │   ├── search.ts             # Fuzzy search implementation
│   │   ├── progress.ts           # Progress calculation logic
│   │   └── image.ts              # Image processing utilities
│   ├── stores/                   # Svelte stores (state management)
│   │   ├── ideas.ts
│   │   ├── projects.ts
│   │   ├── resources.ts
│   │   ├── tools.ts
│   │   ├── photoshoots.ts
│   │   ├── teams.ts
│   │   └── auth.ts
│   └── components/               # Svelte 5 components
│       ├── base/                 # Base/reusable components
│       │   ├── DetailPageBase.svelte
│       │   ├── PolymorphicForm.svelte
│       │   ├── InlineTextEditor.svelte
│       │   ├── InlineNumberEditor.svelte
│       │   ├── InlineSelect.svelte
│       │   ├── InlineCheckbox.svelte
│       │   ├── InlineDatePicker.svelte
│       │   └── InlineImageUpload.svelte
│       ├── cards/                # Entity cards
│       │   ├── IdeaCard.svelte
│       │   ├── ProjectCard.svelte
│       │   ├── ResourceCard.svelte
│       │   └── PhotoshootCard.svelte
│       ├── domain/               # Domain-specific components
│       │   ├── ProjectMeta.svelte
│       │   ├── ProgressTracker.svelte
│       │   ├── BudgetTracker.svelte
│       │   ├── ResourcesList.svelte
│       │   ├── TaskList.svelte
│       │   └── ShotListEditor.svelte
│       └── ui/                   # Flowbite Svelte components (from package)
│           ├── Button.svelte
│           ├── Card.svelte
│           ├── Badge.svelte
│           └── ...
├── routes/
│   ├── (auth)/                   # Authenticated routes
│   │   ├── ideas/
│   │   │   ├── +page.svelte      # Ideas board (grid view)
│   │   │   └── [id]/
│   │   │       └── +page.svelte  # Idea detail (inline edit)
│   │   ├── projects/
│   │   │   ├── +page.svelte      # Projects list
│   │   │   └── [id]/
│   │   │       └── +page.svelte  # Project detail (tabs)
│   │   ├── resources/
│   │   │   ├── +page.svelte      # Resource library
│   │   │   └── [id]/
│   │   │       └── +page.svelte  # Resource detail
│   │   ├── tools/
│   │   │   ├── +page.svelte      # Tools list
│   │   │   └── [id]/
│   │   │       └── +page.svelte  # Tool detail
│   │   ├── photoshoots/
│   │   │   ├── +page.svelte      # Photoshoots list
│   │   │   └── [id]/
│   │   │       └── +page.svelte  # Photoshoot detail
│   │   ├── calendar/
│   │   │   └── +page.svelte      # Calendar/timeline view
│   │   ├── teams/
│   │   │   └── +page.svelte      # Team management
│   │   └── settings/
│   │       └── +page.svelte      # User settings
│   ├── login/
│   │   └── +page.svelte          # Login page
│   ├── signup/
│   │   └── +page.svelte          # Signup page
│   └── +layout.svelte            # Root layout
└── app.html                      # HTML template

tests/
├── e2e/                          # Playwright E2E tests
│   ├── ideas.spec.ts
│   ├── projects.spec.ts
│   ├── resources.spec.ts
│   ├── photoshoots.spec.ts
│   ├── teams.spec.ts
│   └── support/
│       └── page-objects/         # From spec 001
├── integration/                  # Vitest integration tests
│   ├── services/
│   └── stores/
└── unit/                         # Vitest unit tests
    ├── components/
    └── utils/

supabase/
├── migrations/
│   ├── 20250000000000_initial_schema.sql
│   ├── 20250000000001_ideas_table.sql
│   ├── 20250000000002_projects_table.sql
│   ├── 20250000000003_resources_table.sql
│   ├── 20250000000004_tools_table.sql
│   ├── 20250000000005_tasks_table.sql
│   ├── 20250000000006_photoshoots_table.sql
│   ├── 20250000000007_teams_table.sql
│   ├── 20250000000008_comments_table.sql
│   └── 20250000000009_rls_policies.sql
└── seed.sql                      # Test data seeding
```

**Structure Decision**: Selected web application structure (SvelteKit monolithic). This is the existing project structure per Technical Standards (constitution). All features are served through the same SvelteKit app with route-based organization. The `src/lib/` directory provides shared utilities, components, stores, and services. The `src/routes/` directory provides page components following SvelteKit file-system routing conventions. This structure aligns with the constitution's "Modular Feature Organization" principle while maintaining a single deployable artifact.

**Key Architectural Patterns**:
1. **Data Abstraction Layer**: Service interfaces decouple UI from Supabase implementation, enabling future backend swaps
2. **Polymorphic Entities**: Resources and Tools use JSONB metadata fields with TypeScript discriminated unions for type safety
3. **Single Detail Page Pattern**: All entity detail pages extend `DetailPageBase.svelte` component
4. **Form-Field Switching**: `PolymorphicForm.svelte` uses switch statements to render category-specific fields
5. **Store-Based State**: Svelte stores manage global state (projects, resources, teams) with derived stores for filtered views
6. **Route-Based Code Splitting**: SvelteKit automatically splits code by route for optimal bundle sizes

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Resource categories as polymorphic metadata vs. separate tables (Constitution MVP Core specifies separate tables) | MVP simplification - single Resource table with JSONB `metadata` field based on category reduces migration count and initial DB complexity. Aligns with MVP First principle. | Separate tables per resource type (Outfits, Props, Materials, Tools, Equipment, Crew, Locations, Poses, Shots, Sets) would require 10+ tables with mostly duplicate columns (name, description, images, cost, tags, notes). JSONB allows same base columns with category-specific extras. Future migration: Phase 2 can split Resource table if query performance degrades or relationships become complex. |
| Conventions feature deferred (Constitution MVP Core includes Conventions full feature set) | MVP scope reduction to meet development timeline. Photoshoots provide sufficient event planning for complete workflow validation. Conventions are discovery/planning features that users can manage outside app initially (e.g., track in project notes). | Including Conventions would add: convention discovery/search, convention planning, schedule management, packing lists, convention budgets, receipt tracking, reminders system, project-to-convention linking. This is ~8 additional functional requirements and 2-3 major components. Deferring to Phase 2 maintains complete workflow through photoshoots while reducing scope. |

**Justification Summary**: Both simplifications align with MVP First principle (constitution IV). The polymorphic resource model reduces initial complexity while maintaining future migration path. Deferring conventions focuses MVP on validating core project management and photoshoot workflows - users can track convention attendance via project notes or calendar until Phase 2. Total complexity reduction: ~15 DB tables → ~12 tables, ~95 functional requirements → ~79 functional requirements.

