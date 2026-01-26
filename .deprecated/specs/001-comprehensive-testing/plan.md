# Implementation Plan: Comprehensive Testing Infrastructure

**Branch**: `001-comprehensive-testing` | **Date**: 2025-10-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-comprehensive-testing/spec.md`

## Summary

Establish comprehensive testing infrastructure to support Constitution Principle IV (Test-First Development - NON-NEGOTIABLE). This feature implements E2E tests for 5 critical user journeys, unit tests for 60+ UI components, integration tests for the data abstraction layer, and CI/CD automation. The testing framework uses tiered timeouts (Unit: 5s, Integration: 30s, E2E: 2min), separate database schemas per test run for isolation, auto-retry with quarantine for flaky tests, and visual regression testing for all components. Tests will run automatically on every commit with results within 15 minutes, targeting 80%+ code coverage and 100% critical journey coverage.

## Technical Context

**Language/Version**: TypeScript 5.9.2+ with strict mode  
**Primary Dependencies**: 
- Playwright 1.56.1+ (E2E testing)
- Vitest 4.0.3+ (unit testing)
- @testing-library/svelte 5.2.8+ (component testing)
- @supabase/supabase-js 2.76.1+ (test database access)

**Storage**: 
- Dedicated test Supabase project with separate database schemas/namespaces per test run
- Persistent shared staging environment for E2E tests
- Test fixtures and seed data in version control

**Testing**: 
- E2E: Playwright with Page Object Models (POMs), visual regression, multi-browser (Chromium, Firefox, WebKit)
- Unit: Vitest with component testing, mocking utilities
- Integration: Vitest with real Supabase test database

**Target Platform**: 
- Web application (SvelteKit)
- CI/CD: GitHub Actions (or equivalent)
- Test execution: Local development + CI/CD pipeline

**Project Type**: Web application testing infrastructure (cross-cutting)

**Performance Goals**: 
- E2E test suite: <10 minutes total execution on CI/CD
- Unit test suite: <30 seconds total execution
- Individual test timeouts: Unit 5s, Integration 30s, E2E 2min per test
- Parallel execution reduces total time by 50%+
- Tests complete within 15 minutes including setup

**Constraints**: 
- Tiered timeouts with 80% warning thresholds
- Persistent staging environment (not ephemeral per-run)
- Free tier CI/CD resources (GitHub Actions free minutes)
- Visual regression for 60+ components requires snapshot maintenance
- Test data must be isolated per run using database schemas

**Scale/Scope**: 
- 60+ UI components to test
- 5 critical user journeys (authentication, projects, tasks, teams, resources)
- 49 functional requirements
- 50+ database tables with RLS policies to validate
- 3 test types (unit, integration, E2E) running in parallel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Project-Centric**: N/A - Test infrastructure is cross-cutting utility that validates project-centric features but doesn't create projects itself
- [x] **Team-Based**: Tests validate team-based architecture (team creation, membership, RLS policies)
- [x] **Feature Scope**: MVP Core - Addresses Critical Blocker #3 from Project Status Review
- [x] **Complete Workflow**: Tests validate all workflow phases (ideation → creation → event → post-production → archive)
- [x] **MVP First**: Yes - Test-first approach is constitutional requirement (Principle IV)
- [x] **Test-First**: This IS the test-first feature - enables constitutional compliance
- [x] **Modular**: Cross-cutting infrastructure but organized by test type (unit/integration/E2E) and mirrors application domains
- [x] **Cost-Conscious**: Uses existing free tier services (GitHub Actions, staging environment reuse)
- [x] **Future-Ready**: Extensible test framework supports adding Phase 2/3 feature tests
- [x] **Data Privacy**: Tests validate RLS policies, privacy levels, data ownership
- [x] **Tech Stack**: Playwright + Vitest constitutionally mandated; aligns with SvelteKit + Supabase stack
- [x] **Navigation**: N/A - No routes added by test infrastructure

**Feature Phase**: MVP Core (P1: Critical journeys + CI/CD, P2: Unit + Integration tests, P3: Important workflows)

**Violations**: None

## Project Structure

### Documentation (this feature)

```text
specs/001-comprehensive-testing/
├── plan.md              # This file (implementation plan)
├── spec.md              # Feature specification
├── research.md          # Phase 0: Test framework research and decisions
├── data-model.md        # Phase 1: Test data models and fixtures
├── quickstart.md        # Phase 1: Developer quickstart for running tests
├── contracts/           # Phase 1: Test configuration contracts
│   └── test-config.yaml # Test runner configuration schema
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
tests/                           # All test files
├── e2e/                        # Playwright E2E tests
│   ├── auth/                   # Authentication flow tests
│   │   ├── login.spec.ts
│   │   ├── signup.spec.ts
│   │   ├── logout.spec.ts
│   │   └── password-reset.spec.ts
│   ├── projects/               # Project lifecycle tests
│   │   ├── create-project.spec.ts
│   │   ├── view-project.spec.ts
│   │   ├── update-project.spec.ts
│   │   └── archive-project.spec.ts
│   ├── tasks/                  # Task management tests
│   │   ├── create-task.spec.ts
│   │   ├── assign-task.spec.ts
│   │   └── complete-task.spec.ts
│   ├── teams/                  # Team creation tests
│   │   ├── personal-team.spec.ts
│   │   └── private-team.spec.ts
│   ├── resources/              # Resource management tests
│   │   ├── props.spec.ts
│   │   ├── materials.spec.ts
│   │   └── outfits.spec.ts
│   ├── visual-regression/      # Visual regression tests
│   │   ├── components.spec.ts  # All 60+ components
│   │   └── pages.spec.ts       # Critical pages
│   ├── fixtures/               # E2E test fixtures
│   │   ├── test-users.ts
│   │   ├── test-projects.ts
│   │   └── test-data.ts
│   └── support/                # E2E helpers
│       ├── page-objects/       # Page Object Models
│       │   ├── LoginPage.ts
│       │   ├── DashboardPage.ts
│       │   ├── ProjectPage.ts
│       │   └── TaskPage.ts
│       └── helpers.ts          # Shared E2E utilities
│
├── integration/                # Integration tests
│   ├── services/               # Service layer tests
│   │   ├── projectService.test.ts
│   │   ├── taskService.test.ts
│   │   ├── teamService.test.ts
│   │   ├── budgetService.test.ts
│   │   ├── eventService.test.ts
│   │   └── resourceService.test.ts
│   ├── transformers/           # Data transformer tests
│   │   ├── projectTransformer.test.ts
│   │   └── taskTransformer.test.ts
│   ├── rls/                    # Row Level Security tests
│   │   ├── team-policies.test.ts
│   │   ├── project-policies.test.ts
│   │   └── resource-policies.test.ts
│   ├── fixtures/               # Integration test fixtures
│   │   ├── test-schema.ts      # Schema setup per test run
│   │   └── seed-data.ts        # Test data seeding
│   └── setup.ts                # Integration test setup
│
├── unit/                       # Unit tests (Vitest)
│   ├── components/             # Component tests
│   │   ├── ui/                 # Base UI component tests
│   │   │   ├── Button.test.ts
│   │   │   ├── Card.test.ts
│   │   │   ├── Input.test.ts
│   │   │   ├── Select.test.ts
│   │   │   └── [55+ more components]
│   │   └── feature/            # Feature component tests
│   │       ├── ProjectCard.test.ts
│   │       ├── CharacterCreationForm.test.ts
│   │       ├── TeamSelector.test.ts
│   │       └── [more feature components]
│   ├── stores/                 # Store tests
│   │   ├── projects.test.ts
│   │   ├── tasks.test.ts
│   │   ├── events.test.ts
│   │   ├── auth-store.test.ts
│   │   ├── settings.test.ts
│   │   └── theme.test.ts
│   ├── utils/                  # Utility function tests
│   │   └── [utility tests]
│   └── mocks/                  # Mock utilities
│       ├── supabase.ts         # Mock Supabase client
│       └── api.ts              # Mock API client
│
├── quarantine/                 # Quarantine suite for flaky tests
│   └── README.md              # Quarantine process documentation
│
├── config/                     # Test configuration
│   ├── playwright.config.ts   # Playwright configuration
│   ├── vitest.config.ts       # Vitest configuration
│   ├── test-env.ts            # Test environment variables
│   └── timeouts.ts            # Tiered timeout configuration
│
└── utils/                      # Shared test utilities
    ├── test-database.ts       # Schema isolation utilities
    ├── factory.ts             # Test data factories
    ├── cleanup.ts             # Test data cleanup
    └── setup-global.ts        # Global test setup

.github/workflows/              # CI/CD configuration
├── test-unit.yml              # Run unit tests on every commit
├── test-e2e.yml               # Run E2E tests on PRs
├── test-integration.yml       # Run integration tests
└── test-coverage.yml          # Generate coverage reports
```

**Structure Decision**: This structure mirrors the application's domain organization while maintaining clear separation of test types. E2E tests are organized by user journey (matching the 5 critical journeys from the spec). Integration tests focus on the data abstraction layer (services, transformers, RLS policies). Unit tests mirror the source code structure (components, stores, utils). The quarantine directory provides a home for flaky tests being investigated. CI/CD workflows run different test suites based on trigger (commit vs PR).

## Complexity Tracking

> **No violations** - All constitutional checks passed. Test infrastructure is cross-cutting but necessary for MVP compliance.

---

## Phase 0: Research (COMPLETE)

See [research.md](./research.md) for detailed research findings on:
- Test framework selection (Playwright vs Cypress, Vitest vs Jest)
- Database schema isolation strategies
- Visual regression testing approaches
- Flaky test detection and quarantine patterns
- CI/CD optimization techniques
- Test data management best practices

---

## Phase 1: Design (IN PROGRESS)

### Design Artifacts

- **Data Model**: [data-model.md](./data-model.md) - Test fixtures, factories, and data structures
- **API Contracts**: [contracts/](./contracts/) - Test configuration schemas
- **Developer Guide**: [quickstart.md](./quickstart.md) - How to run tests locally and in CI/CD

### Implementation Notes

**Test Data Isolation Strategy**:
- Each test run creates a unique database schema/namespace
- Schema name format: `test_${timestamp}_${randomId}`
- All test queries scoped to the test-specific schema
- Cleanup removes schema after test completion
- Enables true parallel execution without interference

**Flaky Test Management**:
- Auto-retry up to 3 times on failure
- Tests passing on retry flagged with `@flaky` tag
- Flagged tests moved to quarantine suite
- Quarantine tests run separately, don't block CI/CD
- Weekly review process to fix or remove quarantined tests

**Visual Regression**:
- Snapshot all 60+ components in isolation
- Snapshot critical pages in E2E tests
- Snapshots stored in `tests/e2e/visual-regression/__screenshots__/`
- Playwright visual comparison with 95% similarity threshold
- Manual review workflow for intentional UI changes

**CI/CD Optimization**:
- Unit tests run on every commit (fast feedback)
- E2E tests run on PRs only (slower but thorough)
- Integration tests run on PRs to main/develop
- Parallel execution: 4 workers for E2E, 8 workers for unit
- Dependency caching (node_modules, Playwright browsers)
- Conditional test execution based on changed files

---

## Phase 2: Tasks (PENDING)

Use `/speckit.tasks 001-comprehensive-testing` to generate the task breakdown.

**Expected Task Categories**:
1. **Phase 1 Foundation** (Week 1-2): Test infrastructure setup, CI/CD, schema isolation, fixtures
2. **Phase 2 Critical Tests** (Week 3-6): E2E tests for 5 critical journeys (P1)
3. **Phase 3 Component Tests** (Week 3-8): Unit tests for 60+ components (P2)
4. **Phase 4 Integration Tests** (Week 5-10): Service layer and RLS policy tests (P2)
5. **Phase 5 Important Workflows** (Week 7-12): Extended E2E coverage (P3)
6. **Phase 6 Maintenance** (Ongoing): Update tests as features evolve

---

## Dependencies

1. **Database Schema** (Critical Blocker #1): Complete schema needed for integration tests - BLOCKED
2. **Data Abstraction Layer** (Critical Blocker #2): Service interfaces needed for integration tests - BLOCKED
3. **MVP Features**: Features must exist to test them (test-first: write test → fail → implement)
4. **Test Environment**: Persistent staging environment + test Supabase project - NEEDS SETUP
5. **CI/CD Platform**: GitHub Actions configuration - EXISTS (needs test workflow additions)

**Unblocking Strategy**:
- Phase 1 Foundation can start immediately (infrastructure, fixtures, config)
- Unit tests for existing 60+ components can start immediately
- E2E/Integration tests blocked until schema + services exist
- Run `/speckit.plan` for database schema and data abstraction layer features first

---

## Success Criteria Validation

From spec.md Success Criteria, this implementation plan enables:

- ✅ SC-001: 100% E2E coverage for 5 critical journeys (auth, projects, tasks, teams, resources)
- ✅ SC-002: 80%+ unit test coverage (60+ components + stores + utils)
- ✅ SC-003: E2E suite <10 min (parallel execution with 4 workers)
- ✅ SC-004: Unit suite <30s (fast feedback with Vitest)
- ✅ SC-005: Zero flaky tests (quarantine system removes flakes from main suite)
- ✅ SC-006: 100% integration test coverage for service layer
- ✅ SC-007: Auto-run on every commit, results <15 min (CI/CD workflows)
- ✅ SC-008: Visual regression 95%+ accuracy (60+ components + critical pages)
- ✅ SC-009: Parallel execution 50%+ time reduction (4-8 workers)
- ✅ SC-010: <5% test failure rate (reliable tests with retries)
- ✅ SC-011: Local test run <15 min (developers can run full suite)
- ✅ SC-012: Actionable error messages (screenshots, videos, logs)
- ✅ SC-013: 100% cleanup success (schema isolation + cleanup utilities)
- ✅ SC-014: RLS tests for 50+ tables (integration test suite)

---

## Next Steps

1. ✅ **Complete research.md** - Document test framework decisions
2. ✅ **Complete data-model.md** - Define test fixtures and factories
3. ✅ **Complete contracts/** - Define test configuration schemas
4. ✅ **Complete quickstart.md** - Developer guide for running tests
5. ⏭️ **Run `/speckit.tasks`** - Generate detailed task breakdown
6. ⏭️ **Set up test environment** - Configure staging + test Supabase
7. ⏭️ **Implement Phase 1 Foundation** - Infrastructure before writing tests
8. ⏭️ **Write E2E tests for critical journeys** - Test-first for MVP features
