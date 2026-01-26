# Research: Comprehensive Testing Infrastructure

**Date**: 2025-10-26  
**Feature**: 001-comprehensive-testing  
**Phase**: 0 (Research & Technology Decisions)

## Summary

This document captures research findings and technology decisions for implementing comprehensive testing infrastructure. All decisions align with the project's technology stack (SvelteKit, Supabase) and constitutional requirements (cost-conscious, future-ready, test-first development).

---

## Research Areas

### 1. E2E Test Framework Selection

**Question**: Which E2E testing framework best suits SvelteKit + Supabase applications?

**Options Evaluated**:
- Playwright (Microsoft)
- Cypress
- Puppeteer
- Selenium WebDriver

**Decision**: **Playwright 1.56.1+**

**Rationale**:
- **Multi-browser support**: Chromium, Firefox, WebKit (Safari) out of the box - ensures cross-browser compatibility
- **Built-in visual regression**: `page.screenshot()` with pixel-perfect comparison APIs
- **Network interception**: Mock Supabase API responses for faster tests
- **Auto-waiting**: Smart waiting for elements eliminates flaky tests from race conditions
- **Video/screenshot on failure**: Automatic debugging artifacts
- **Parallel execution**: Native worker support for faster CI/CD
- **SvelteKit compatibility**: Works seamlessly with SvelteKit's SSR + client-side routing
- **Page Object Model support**: Clean abstraction for maintainable tests
- **Active development**: Microsoft-backed with frequent updates
- **Free**: Open source, no licensing costs

**Alternatives Rejected**:
- **Cypress**: No multi-browser support (Chromium only), slower execution, harder to mock network in SvelteKit
- **Puppeteer**: Chrome-only, no built-in visual regression, requires more boilerplate
- **Selenium**: Outdated API, slow, flaky, requires external drivers

**Implementation Notes**:
- Install: `bun add -D playwright @playwright/test`
- Configuration: `playwright.config.ts` with 3 browsers (Chromium, Firefox, WebKit)
- Browsers: Download via `bunx playwright install`

---

### 2. Unit Test Framework Selection

**Question**: Which unit testing framework is best for Svelte 5 component testing?

**Options Evaluated**:
- Vitest
- Jest
- uvu
- Ava

**Decision**: **Vitest 4.0.3+**

**Rationale**:
- **Vite integration**: SvelteKit uses Vite, Vitest shares same config (zero extra setup)
- **Svelte 5 support**: First-class support via `@testing-library/svelte` 5.2.8+
- **Lightning fast**: Native ESM support, instant re-runs, parallel execution
- **Jest API compatibility**: Drop-in replacement for Jest (same `describe`, `it`, `expect` syntax)
- **Component testing**: Built-in support for testing Svelte components with real DOM
- **TypeScript**: Native TypeScript support without transforms
- **Coverage**: Built-in c8 coverage (Istanbul replacement)
- **Watch mode**: Intelligent re-runs based on changed files
- **Free**: Open source, no licensing costs

**Alternatives Rejected**:
- **Jest**: Requires complex Svelte transforms, slower than Vitest, outdated ESM support
- **uvu**: Minimal API, no component testing support, small ecosystem
- **Ava**: Good for Node.js, poor browser/component testing support

**Implementation Notes**:
- Install: `bun add -D vitest @testing-library/svelte @testing-library/jest-dom jsdom`
- Configuration: `vitest.config.ts` extending existing `vite.config.ts`
- Environment: jsdom for DOM simulation

---

### 3. Database Schema Isolation Strategy

**Question**: How do we isolate test data to enable parallel test execution without interference?

**Options Evaluated**:
- Transaction rollback (wrap each test in transaction, rollback after)
- Separate databases per test run
- Separate schemas/namespaces per test run
- Truncate tables after each test

**Decision**: **Separate schemas per test run**

**Rationale**:
- **True isolation**: Each test run gets own namespace, zero interference
- **Parallel execution**: Multiple test runs can execute simultaneously
- **Supabase compatibility**: PostgreSQL schemas fully supported
- **Performance**: Schema creation faster than full database provisioning
- **Cleanup**: Drop schema after tests complete (simpler than selective deletion)
- **RLS testing**: Can test Row Level Security policies in isolated environment
- **Realistic**: Tests run against real database structure, not in-memory mocks

**Implementation**:
```typescript
// tests/utils/test-database.ts
export async function createTestSchema(): Promise<string> {
  const schemaName = `test_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  
  // Create schema
  await supabase.rpc('create_test_schema', { schema_name: schemaName });
  
  // Copy all tables from public schema
  await supabase.rpc('clone_schema', { 
    source: 'public', 
    target: schemaName 
  });
  
  return schemaName;
}

export async function cleanupTestSchema(schemaName: string): Promise<void> {
  await supabase.rpc('drop_test_schema', { schema_name: schemaName });
}
```

**Alternatives Rejected**:
- **Transaction rollback**: Doesn't work with multi-connection tests (E2E), breaks RLS testing
- **Separate databases**: Too slow to provision, expensive at scale
- **Truncate tables**: Not parallel-safe, complex foreign key handling, can't test RLS

**Implementation Notes**:
- Requires Supabase database functions for schema management (SQL migrations)
- Each test file creates schema in `beforeAll()`, cleans up in `afterAll()`
- Schema name stored in test context for scoped queries

---

### 4. Flaky Test Detection & Quarantine

**Question**: How do we handle flaky tests that intermittently fail?

**Options Evaluated**:
- Ignore failures (retry infinitely until pass)
- Flag and quarantine (retry + move to separate suite)
- Fail immediately (zero tolerance for flakes)
- Probabilistic retry (retry based on failure rate)

**Decision**: **Auto-retry with flagging and quarantine**

**Rationale**:
- **Retry up to 3 times**: Handles transient network issues, race conditions
- **Flag flaky tests**: Tests passing on retry get `@flaky` tag in report
- **Quarantine suite**: Flaky tests moved to separate suite after 2nd occurrence
- **Don't block CI/CD**: Quarantined tests run separately, failures don't fail builds
- **Weekly review**: Team reviews quarantined tests to fix or remove
- **Metrics tracking**: Track flake rate, identify systemic issues
- **Developer experience**: Fast feedback (flakes don't block), stable main suite

**Implementation**:
```typescript
// playwright.config.ts
export default defineConfig({
  retries: 3, // Auto-retry up to 3 times
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }], // For flake detection
    ['./flaky-test-reporter.ts'] // Custom reporter to flag flakes
  ]
});

// flaky-test-reporter.ts
class FlakyTestReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed' && result.retry > 0) {
      // Test passed on retry - FLAG AS FLAKY
      logFlakyTest(test.title, result.retry);
      moveToQuarantine(test.location.file);
    }
  }
}
```

**Alternatives Rejected**:
- **Ignore failures**: Hides real issues, unreliable test suite
- **Fail immediately**: Developer friction, blocks CI/CD for transient issues
- **Probabilistic retry**: Overcomplicated, hard to tune thresholds

**Implementation Notes**:
- Quarantine directory: `tests/quarantine/`
- Quarantine tests run in separate CI/CD job (failures don't block)
- Weekly team review process documented in `tests/quarantine/README.md`

---

### 5. Test Environment Deployment Strategy

**Question**: Should we use ephemeral environments (create/destroy per test run) or a persistent staging environment?

**Options Evaluated**:
- Ephemeral environments (create on PR, destroy after)
- Persistent shared staging environment
- Persistent per-branch environments
- Hybrid (staging + ephemeral for PRs)

**Decision**: **Persistent shared staging environment**

**Rationale**:
- **Cost-effective**: Single environment vs. N ephemeral environments (aligns with cost-conscious principle)
- **Fast test startup**: No environment provisioning delay (5-10 min saved per run)
- **Predictable**: Same environment every time, easier to debug failures
- **Database seeding**: Pre-seeded with test data, faster test setup
- **Supabase compatibility**: Persistent Supabase test project with stable connection strings
- **Schema isolation**: Parallel tests still isolated via schema namespaces (see #3)
- **Simple**: No orchestration complexity for spinning up/down environments

**Implementation**:
- Staging Supabase project: `cosplay-tracker-test` (separate from production)
- Environment variables: `.env.test` with staging credentials
- Database migrations: Applied to staging on each deploy to main
- Test data: Persistent seed data + test-specific schema per run

**Alternatives Rejected**:
- **Ephemeral environments**: Expensive (multiple Supabase projects), slow (provisioning time), complex orchestration
- **Per-branch environments**: Expensive at scale, hard to manage
- **Hybrid**: Overcomplicated, double the maintenance

**Implementation Notes**:
- Staging URL: `https://cosplay-tracker-staging.pages.dev` (Cloudflare Pages)
- Test Supabase: `https://xyz-test.supabase.co` (free tier)
- CI/CD secret: `SUPABASE_TEST_URL`, `SUPABASE_TEST_KEY`

---

### 6. Test Timeout Strategy

**Question**: How should we configure test timeouts to balance stability and fast feedback?

**Options Evaluated**:
- Fixed timeout (same for all tests)
- Tiered timeouts (by test type: unit/integration/E2E)
- No timeouts (let tests run forever)
- Adaptive timeouts (increase on retry)

**Decision**: **Tiered timeouts with warnings at 80% threshold**

**Rationale**:
- **Unit tests: 5s**: Fast unit tests should complete in <1s typically, 5s catches infinite loops
- **Integration tests: 30s**: Database queries + network latency, 30s reasonable
- **E2E tests: 2 min per test**: Browser startup, navigation, complex interactions
- **Warning at 80%**: Tests approaching timeout get warning logged (helps identify slow tests before failure)
- **Total suite timeout**: Unit 30s, Integration 5min, E2E 10min (parallel execution)
- **Fast feedback**: Developers know immediately if tests hang
- **CI/CD efficiency**: No wasted CI minutes on hung tests

**Implementation**:
```typescript
// vitest.config.ts (unit + integration)
export default defineConfig({
  test: {
    testTimeout: 5000, // 5s for unit tests
    hookTimeout: 10000, // 10s for setup/teardown
    onTestFailed: (test) => {
      if (test.duration > test.timeout * 0.8) {
        console.warn(`⚠️ Test approaching timeout: ${test.name} (${test.duration}ms)`);
      }
    }
  }
});

// playwright.config.ts (E2E)
export default defineConfig({
  timeout: 120000, // 2 min per test
  expect: {
    timeout: 10000 // 10s for assertions
  },
  globalTimeout: 600000 // 10 min total suite
});
```

**Alternatives Rejected**:
- **Fixed timeout**: Unit tests don't need 2 min, E2E tests can't finish in 5s
- **No timeouts**: Hung tests block CI/CD indefinitely, waste resources
- **Adaptive timeouts**: Overcomplicated, hides slow test issues

**Implementation Notes**:
- Timeout configuration in `tests/config/timeouts.ts`
- Warning threshold: 80% (configurable)
- CI/CD: Kills jobs after global timeout to prevent runaway processes

---

### 7. Visual Regression Testing Approach

**Question**: Which pages and components should we test for visual regressions in MVP?

**Options Evaluated**:
- All 60+ components individually
- Critical user journey pages only
- Dashboard and key landing pages only
- No visual regression for MVP

**Decision**: **All 60+ components individually**

**Rationale**:
- **Comprehensive coverage**: Catch UI breakages across entire component library
- **Component isolation**: Test each component in known state (easier to debug than full pages)
- **Reusable snapshots**: Component snapshots used across multiple pages
- **Fast feedback**: Developers see UI changes in PR reviews (screenshot diffs)
- **Regression prevention**: Prevent accidental style changes (CSS conflicts, theme issues)
- **Playwright support**: Built-in `toHaveScreenshot()` matcher with 95% similarity threshold
- **Maintenance**: Initial snapshot creation effort, but updates are fast (approve new baseline)

**Implementation**:
```typescript
// tests/e2e/visual-regression/components.spec.ts
test('Button component - default state', async ({ page }) => {
  await page.goto('/component-preview/button');
  await expect(page.locator('[data-testid="button-default"]')).toHaveScreenshot('button-default.png', {
    threshold: 0.05 // 95% similarity required
  });
});

test('Button component - hover state', async ({ page }) => {
  await page.goto('/component-preview/button');
  await page.locator('[data-testid="button-default"]').hover();
  await expect(page.locator('[data-testid="button-default"]')).toHaveScreenshot('button-hover.png');
});
```

**Component Preview Page**:
- Create `/src/routes/component-preview/[component]/+page.svelte` (dev-only route)
- Renders component in isolation with known props
- Accessible only in test environment

**Alternatives Rejected**:
- **Critical pages only**: Misses component-level regressions, harder to identify which component broke
- **Dashboard only**: Insufficient coverage, many components not on dashboard
- **No visual regression**: High risk of UI breakages slipping to production

**Implementation Notes**:
- Snapshots stored in `tests/e2e/visual-regression/__screenshots__/`
- Update baseline: `bunx playwright test --update-snapshots`
- CI/CD: Fails on visual diffs, requires manual approval to update baseline
- Review process: PR reviewers see screenshot diffs in GitHub

---

### 8. CI/CD Test Orchestration

**Question**: How should we organize test execution in CI/CD for speed and cost efficiency?

**Options Evaluated**:
- Run all tests on every commit
- Run unit tests on commit, E2E on PR only
- Run tests only on PR to main
- Manual trigger only

**Decision**: **Tiered execution based on event type**

**Rationale**:
- **Every commit**: Unit tests only (fast <30s feedback)
- **Pull request**: Unit + E2E + Integration (full validation before merge)
- **Merge to main**: Full suite + coverage report + visual regression update
- **Nightly**: Extended test suite (performance, stress tests)
- **Cost-conscious**: Unit tests cheap (<1 min CI time), E2E expensive (10 min)
- **Fast feedback**: Developers get immediate unit test results
- **Thorough validation**: PRs fully tested before merge

**Implementation**:
```yaml
# .github/workflows/test-unit.yml
name: Unit Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test:unit

# .github/workflows/test-e2e.yml
name: E2E Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx playwright install --with-deps
      - run: bun test:e2e
```

**Parallel Execution**:
- Unit tests: 8 workers (CPU cores)
- E2E tests: 4 workers (browser instances)
- Integration tests: 4 workers (database connections)
- Reduces total execution time by 50%+

**Alternatives Rejected**:
- **All tests on every commit**: Wastes CI minutes, slow feedback (10+ min)
- **Tests only on PR**: No immediate feedback for broken unit tests
- **Manual trigger**: Developers forget to run tests, breaks slip through

**Implementation Notes**:
- GitHub Actions free tier: 2,000 minutes/month (sufficient for MVP)
- Cache dependencies: `node_modules` and Playwright browsers (saves ~2 min per run)
- Conditional execution: Only run affected tests based on changed files (future optimization)

---

### 9. Test Data Factories & Fixtures

**Question**: How should we generate test data that's realistic but maintainable?

**Options Evaluated**:
- Hard-coded fixtures (JSON files)
- Faker.js (random data generation)
- Factory pattern (programmatic test data)
- Copy production data (anonymized)

**Decision**: **Factory pattern with Faker.js for realistic data**

**Rationale**:
- **Programmatic**: Generate test data on-demand with known properties
- **Realistic**: Faker.js generates realistic names, emails, dates, addresses
- **Type-safe**: TypeScript factories ensure data matches schema
- **Maintainable**: Single source of truth for test data structure
- **Flexible**: Customize specific fields while defaulting others
- **Repeatable**: Seed Faker with fixed seed for deterministic tests

**Implementation**:
```typescript
// tests/utils/factory.ts
import { faker } from '@faker-js/faker';

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    avatar_url: faker.image.avatar(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

export function createTestProject(overrides: Partial<Project> = {}): Project {
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    character: faker.person.fullName(),
    series: faker.lorem.words(3),
    team_id: faker.string.uuid(),
    status: 'in-progress',
    budget_spent: faker.number.int({ min: 0, max: 1000 }),
    budget_total: faker.number.int({ min: 1000, max: 5000 }),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}
```

**Fixture Files**:
- Minimal hand-crafted fixtures for specific edge cases
- Store in `tests/e2e/fixtures/` and `tests/integration/fixtures/`
- Use factories as default, fixtures for special scenarios

**Alternatives Rejected**:
- **Hard-coded fixtures**: Brittle, hard to maintain, not flexible
- **Faker.js only**: No control over specific values needed for tests
- **Copy production data**: GDPR issues, too complex, exposes real user data

**Implementation Notes**:
- Install: `bun add -D @faker-js/faker`
- Seed control: `faker.seed(123)` for deterministic tests
- Cleanup: Factories don't touch database, only used with schema isolation

---

### 10. Test Coverage Strategy

**Question**: What level of code coverage should we target and how do we measure it?

**Options Evaluated**:
- 100% coverage (strict)
- 80% coverage (industry standard)
- No coverage target (best effort)
- Critical paths only (50%+ coverage)

**Decision**: **80% coverage target with critical path 100% requirement**

**Rationale**:
- **80% overall**: Industry best practice, balances thoroughness with pragmatism
- **100% critical paths**: Authentication, project CRUD, team creation, RLS policies MUST be 100% covered
- **Constitutional requirement**: Test-first development principle requires high coverage
- **Maintainable**: 100% coverage too costly (diminishing returns on edge cases)
- **Measured automatically**: Vitest + c8 coverage, Playwright coverage plugin
- **CI/CD enforcement**: PR fails if coverage drops below threshold

**Coverage Requirements**:
- **Critical paths**: 100% (auth, projects, teams, RLS)
- **UI components**: 80% (all 60+ components)
- **Service layer**: 90% (data abstraction layer)
- **Utils/helpers**: 70% (edge cases less critical)
- **Overall**: 80% minimum

**Implementation**:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html', 'lcov'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
      exclude: [
        'tests/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/node_modules/**'
      ],
      thresholds: {
        'src/lib/services/**': { statements: 90 }, // Service layer
        'src/lib/auth/**': { statements: 100 },     // Auth critical
        'src/routes/(auth)/**': { statements: 100 } // Auth routes
      }
    }
  }
});
```

**Alternatives Rejected**:
- **100% coverage**: Too costly, tests become brittle, diminishing returns
- **No target**: No enforcement, coverage decays over time
- **50% coverage**: Insufficient for test-first development principle

**Implementation Notes**:
- Coverage reports generated on every PR
- Uploaded to Codecov (free for open source) or similar
- PR comment shows coverage diff
- Blocked merge if coverage drops below threshold

---

## Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| E2E Testing | Playwright | 1.56.1+ | Multi-browser, visual regression, auto-waiting |
| Unit Testing | Vitest | 4.0.3+ | Vite integration, fast, Svelte 5 support |
| Component Testing | @testing-library/svelte | 5.2.8+ | Industry standard, accessible testing |
| Test Data | @faker-js/faker | 8.4.1+ | Realistic test data generation |
| Database Isolation | PostgreSQL Schemas | Native | Parallel execution, true isolation |
| Visual Regression | Playwright Screenshots | Built-in | 95% similarity, automatic diffs |
| Coverage | c8 | Built-in | Native Vitest coverage provider |
| CI/CD | GitHub Actions | Native | Free tier, native GitHub integration |
| Flaky Detection | Custom Reporter | Custom | Auto-retry, quarantine, metrics |

---

## Open Questions / Future Research

1. **Performance testing**: How to measure and enforce performance budgets (page load time, API response time)?
   - **Future**: Add Lighthouse CI for performance regression testing
   
2. **Accessibility testing**: How to automatically validate WCAG compliance?
   - **Future**: Add axe-core to E2E tests for a11y validation
   
3. **Load testing**: How to test application behavior under high user load?
   - **Future**: Add k6 or Artillery for load testing (post-MVP)
   
4. **Mobile testing**: How to test mobile responsiveness and touch interactions?
   - **Current**: Playwright mobile emulation (iPhone, Android)
   - **Future**: Real device testing with BrowserStack or LambdaTest (if needed)
   
5. **Test data cleanup**: What happens if test schemas aren't cleaned up (failures, interruptions)?
   - **Current**: Manual cleanup script `bun run test:cleanup`
   - **Future**: Automated orphaned schema detection and removal (cron job)

---

## Next Steps

1. ✅ **Complete data-model.md** - Define test data structures and fixtures
2. ✅ **Complete contracts/** - Create test configuration schemas
3. ✅ **Complete quickstart.md** - Write developer guide for running tests
4. ⏭️ **Run `/speckit.tasks`** - Generate implementation task breakdown
5. ⏭️ **Set up test infrastructure** - Install dependencies, configure CI/CD
6. ⏭️ **Write first E2E test** - Validate infrastructure with simple test
7. ⏭️ **Implement Phase 1 Foundation** - Schema isolation, factories, fixtures


