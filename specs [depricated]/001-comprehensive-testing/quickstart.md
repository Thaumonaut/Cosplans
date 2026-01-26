# Quickstart: Running Tests

**Last Updated**: 2025-10-26  
**Feature**: 001-comprehensive-testing

This guide explains how to run tests locally and in CI/CD for the Cosplay Tracker application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running Tests Locally](#running-tests-locally)
4. [Test Types](#test-types)
5. [Writing Tests](#writing-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Prerequisites

Before running tests, ensure you have:

- **Bun** 1.0.0+ installed ([installation guide](https://bun.sh))
- **Node.js** 18+ (for Playwright)
- **Test Supabase Project** configured (see [Environment Setup](#environment-setup))
- **Git** installed (for pre-commit hooks)

---

## Installation

### 1. Install Dependencies

```bash
# Install all dependencies including test frameworks
bun install
```

This installs:
- `playwright` - E2E testing framework
- `@playwright/test` - Playwright test runner
- `vitest` - Unit/integration testing framework
- `@testing-library/svelte` - Svelte component testing utilities
- `@faker-js/faker` - Test data generation

### 2. Install Playwright Browsers

```bash
# Download Chromium, Firefox, and WebKit browsers
bunx playwright install --with-deps
```

This downloads browser binaries needed for E2E tests (~500MB total).

### 3. Environment Setup

Create a `.env.test` file in the project root:

```bash
# .env.test
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_KEY=your-test-anon-key
TEST_BASE_URL=http://localhost:5173
```

**Where to get these values**:
1. Create a test Supabase project at [supabase.com](https://supabase.com)
2. Copy Project URL and anon key from Settings → API
3. Run database migrations on test project: `bun run db:migrate:test`

### 4. Database Setup

Run SQL migrations on your test Supabase project to create the schema isolation functions:

```bash
# Apply test-specific migrations (schema functions)
bun run db:migrate:test
```

This creates the following database functions:
- `create_test_schema(schema_name)` - Create isolated test schema
- `clone_schema_structure(source, target)` - Copy table structure
- `drop_test_schema(schema_name)` - Cleanup test schema
- `list_test_schemas()` - List all test schemas

---

## Running Tests Locally

### Quick Commands

```bash
# Run all tests (unit + integration + E2E)
bun test

# Run unit tests only (fastest - <30s)
bun test:unit

# Run integration tests only (~2 min)
bun test:integration

# Run E2E tests only (~10 min)
bun test:e2e

# Run tests in watch mode (auto-rerun on file changes)
bun test:watch

# Run tests with coverage report
bun test:coverage

# Run specific test file
bun test tests/unit/components/Button.test.ts

# Run tests matching a pattern
bun test --grep "login"
```

### Detailed Test Commands

#### Unit Tests

```bash
# Run all unit tests
bun test:unit

# Run specific component test
bun test tests/unit/components/ui/Button.test.ts

# Run tests in watch mode (auto-rerun on changes)
bun test:unit --watch

# Run with coverage
bun test:unit --coverage

# Run with UI (browser-based test runner)
bun test:unit --ui
```

#### Integration Tests

```bash
# Run all integration tests
bun test:integration

# Run specific service tests
bun test tests/integration/services/projectService.test.ts

# Run RLS policy tests
bun test tests/integration/rls/

# Skip cleanup (for debugging)
TEST_SKIP_CLEANUP=1 bun test:integration
```

#### E2E Tests

```bash
# Run all E2E tests (all browsers)
bun test:e2e

# Run E2E tests in headed mode (see browser)
bun test:e2e --headed

# Run E2E tests in debug mode (step through)
bun test:e2e --debug

# Run specific browser only
bun test:e2e --project=chromium
bun test:e2e --project=firefox
bun test:e2e --project=webkit

# Run specific test file
bun test:e2e tests/e2e/auth/login.spec.ts

# Run with visual regression update (update baseline screenshots)
bun test:e2e --update-snapshots
```

### Test Output

#### Unit Tests (Vitest)

```
✓ tests/unit/components/Button.test.ts (4)
  ✓ Button component (4)
    ✓ renders with default props
    ✓ handles click events
    ✓ applies variant styles
    ✓ shows loading state

Test Files  1 passed (1)
Tests  4 passed (4)
Duration  234ms
```

#### E2E Tests (Playwright)

```
Running 12 tests using 4 workers

  ✓ [chromium] › auth/login.spec.ts:5:1 › user can login (2.3s)
  ✓ [firefox] › auth/login.spec.ts:5:1 › user can login (2.5s)
  ✓ [webkit] › auth/login.spec.ts:5:1 › user can login (2.8s)
  ✓ [chromium] › projects/create-project.spec.ts:8:1 › user can create project (3.1s)

12 passed (45s)
```

---

## Test Types

### 1. Unit Tests (`tests/unit/`)

**Purpose**: Test individual components, functions, and stores in isolation.

**Characteristics**:
- Fast (<30s for full suite)
- No database interaction
- No network requests
- Uses mocks for external dependencies

**Example**: Testing a Button component

```typescript
// tests/unit/components/ui/Button.test.ts
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from '$lib/components/ui/Button.svelte';

describe('Button component', () => {
  it('renders with text', () => {
    const { getByText } = render(Button, { props: { label: 'Click me' } });
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    let clicked = false;
    const { getByRole } = render(Button, { 
      props: { 
        label: 'Click',
        onclick: () => { clicked = true; }
      }
    });
    
    await fireEvent.click(getByRole('button'));
    expect(clicked).toBe(true);
  });
});
```

### 2. Integration Tests (`tests/integration/`)

**Purpose**: Test service layer, database interactions, and RLS policies.

**Characteristics**:
- Medium speed (~2 min for full suite)
- Real database interaction (test Supabase)
- Schema isolation per test file
- Tests data transformers and service layer

**Example**: Testing ProjectService

```typescript
// tests/integration/services/projectService.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestSchema } from '../fixtures/test-schema';
import { projectService } from '$lib/api/services/projectService';
import { createTestProject } from '../../utils/factory';

describe('ProjectService', () => {
  let context;

  beforeAll(async () => {
    context = await setupTestSchema();
  });

  afterAll(async () => {
    await context.cleanup();
  });

  it('creates a project', async () => {
    const projectData = createTestProject();
    const project = await projectService.create(projectData, context.schemaName);
    
    expect(project).toBeDefined();
    expect(project.title).toBe(projectData.title);
    expect(project.id).toBeDefined();
  });

  it('enforces RLS policies', async () => {
    // Test that user can only see their own team's projects
    const user1Project = await projectService.create(
      createTestProject({ /* team_id: context.teams[0].id */ }),
      context.schemaName
    );
    
    // Attempt to fetch with different user context
    const projects = await projectService.getAll({ userId: context.users[1].id }, context.schemaName);
    
    expect(projects).not.toContainEqual(expect.objectContaining({ id: user1Project.id }));
  });
});
```

### 3. E2E Tests (`tests/e2e/`)

**Purpose**: Test complete user journeys from UI to database.

**Characteristics**:
- Slowest (~10 min for full suite)
- Real browser interaction
- Tests entire stack (UI + API + DB)
- Multi-browser testing (Chromium, Firefox, WebKit)
- Visual regression testing

**Example**: Testing login flow

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/LoginPage';
import { DashboardPage } from '../support/page-objects/DashboardPage';
import { FIXED_TEST_USERS } from '../fixtures/test-users';

test.describe('Authentication', () => {
  test('user can login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      FIXED_TEST_USERS.alice.email,
      FIXED_TEST_USERS.alice.password
    );
    
    // Verify redirect to dashboard
    const dashboardPage = new DashboardPage(page);
    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.welcomeMessage).toContainText('Welcome, Alice');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });
});
```

---

## Writing Tests

### Unit Test Template

```typescript
// tests/unit/components/YourComponent.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import YourComponent from '$lib/components/YourComponent.svelte';

describe('YourComponent', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(YourComponent, { 
      props: { /* your props */ } 
    });
    
    expect(getByTestId('your-element')).toBeInTheDocument();
  });
});
```

### Integration Test Template

```typescript
// tests/integration/services/yourService.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestSchema } from '../fixtures/test-schema';

describe('YourService', () => {
  let context;

  beforeAll(async () => {
    context = await setupTestSchema();
  });

  afterAll(async () => {
    await context.cleanup();
  });

  it('does something', async () => {
    // Your test here
  });
});
```

### E2E Test Template

```typescript
// tests/e2e/your-feature/your-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Your Feature', () => {
  test('does something', async ({ page }) => {
    await page.goto('/your-page');
    // Your test here
  });
});
```

### Page Object Template

```typescript
// tests/e2e/support/page-objects/YourPage.ts
import type { Page, Locator } from '@playwright/test';

export class YourPage {
  readonly page: Page;
  readonly yourElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.yourElement = page.locator('[data-testid="your-element"]');
  }

  async goto() {
    await this.page.goto('/your-page');
  }

  async yourAction() {
    await this.yourElement.click();
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflows

Tests run automatically on GitHub Actions:

#### On Every Commit (Push)

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
      - run: bun test:coverage
```

**Triggered by**: Every commit to any branch  
**Duration**: ~1-2 minutes  
**Cost**: Free (GitHub Actions free tier)

#### On Pull Requests

```yaml
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
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

**Triggered by**: Pull requests to main/develop  
**Duration**: ~10-15 minutes  
**Cost**: Free (GitHub Actions free tier)

### Viewing Test Results

#### Locally

- **Unit tests**: Terminal output
- **Unit tests (UI)**: `bun test:unit --ui` opens browser UI at http://localhost:51204
- **E2E tests**: HTML report at `playwright-report/index.html`
- **Coverage**: HTML report at `coverage/index.html`

#### CI/CD

- **GitHub Actions**: View logs in "Actions" tab
- **Coverage**: Uploaded to Codecov (if configured)
- **E2E artifacts**: Download from Actions → Artifacts (screenshots, videos)

---

## Troubleshooting

### Common Issues

#### 1. Playwright browsers not found

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**:
```bash
bunx playwright install --with-deps
```

#### 2. Test database connection fails

**Error**: `Failed to connect to Supabase`

**Solution**: Check `.env.test` file:
```bash
# Verify environment variables
cat .env.test

# Test connection manually
bun run test:connection
```

#### 3. Test schemas not cleaned up

**Error**: `schema "test_..." already exists`

**Solution**: Run manual cleanup:
```bash
bun run test:cleanup
```

This removes orphaned test schemas older than 1 hour.

#### 4. Tests timeout

**Error**: `Test timeout of 5000ms exceeded`

**Solution**: Increase timeout for slow tests:
```typescript
// For a specific test
test('slow operation', async () => {
  // Your test
}, { timeout: 10000 }); // 10 seconds

// For all tests in a file
test.setTimeout(10000);
```

#### 5. Visual regression failures

**Error**: `Screenshot comparison failed`

**Solution**: Review screenshots and update baselines if intentional:
```bash
# View diff in HTML report
open playwright-report/index.html

# Update baselines if change is intentional
bun test:e2e --update-snapshots
```

### Debug Mode

#### Unit Tests

```bash
# Run with verbose output
bun test:unit --reporter=verbose

# Run with debug logging
DEBUG=* bun test:unit
```

#### E2E Tests

```bash
# Run in headed mode (see browser)
bun test:e2e --headed

# Run in debug mode (pause at each step)
bun test:e2e --debug

# Run with Playwright Inspector
PWDEBUG=1 bun test:e2e

# Generate trace for debugging
bun test:e2e --trace on
```

### Getting Help

1. **Check logs**: Review test output for error messages
2. **Check artifacts**: View screenshots/videos in `playwright-report/`
3. **Run in debug mode**: Use `--debug` flag for step-by-step execution
4. **Check environment**: Verify `.env.test` configuration
5. **Cleanup state**: Run `bun run test:cleanup` to clear old data

---

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good: Descriptive test names
test('user can create a project with valid data', async () => {});

// ❌ Bad: Vague test names
test('test1', async () => {});
```

### 2. Test Independence

```typescript
// ✅ Good: Each test is self-contained
test('creates project', async () => {
  const project = createTestProject();
  // Test uses its own data
});

// ❌ Bad: Tests depend on each other
let sharedProject;
test('creates project', async () => {
  sharedProject = createTestProject();
});
test('updates project', async () => {
  // Depends on previous test
});
```

### 3. Use Page Objects (E2E)

```typescript
// ✅ Good: Use page objects
const loginPage = new LoginPage(page);
await loginPage.login(email, password);

// ❌ Bad: Direct selectors
await page.fill('#email', email);
await page.fill('#password', password);
await page.click('button[type="submit"]');
```

### 4. Use Factories for Test Data

```typescript
// ✅ Good: Use factories
const project = createTestProject({ title: 'Custom Title' });

// ❌ Bad: Hardcoded data
const project = {
  id: 123,
  title: 'Custom Title',
  character: 'Character',
  series: 'Series',
  // ... many more fields
};
```

### 5. Clean Up Resources

```typescript
// ✅ Good: Always clean up
afterAll(async () => {
  await context.cleanup();
});

// ❌ Bad: No cleanup (leaks test data)
```

### 6. Use Meaningful Assertions

```typescript
// ✅ Good: Clear assertion
expect(project.title).toBe('Expected Title');

// ❌ Bad: Vague assertion
expect(project).toBeTruthy();
```

### 7. Test Error Cases

```typescript
// ✅ Good: Test both success and failure
test('creates project with valid data', async () => {});
test('shows error for invalid data', async () => {});

// ❌ Bad: Only test happy path
test('creates project', async () => {});
```

---

## Performance Tips

### 1. Run Tests in Parallel

Unit and integration tests run in parallel by default. Adjust worker count:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    maxWorkers: 8, // Adjust based on CPU cores
  }
});
```

### 2. Use Test Filters

Run only affected tests during development:

```bash
# Run tests for specific feature
bun test --grep "project"

# Run tests in specific directory
bun test tests/unit/components/

# Run single test file
bun test tests/unit/components/Button.test.ts
```

### 3. Skip Slow Tests During Development

```typescript
// Skip E2E tests during rapid iteration
test.skip('slow E2E test', async () => {});

// Run only specific tests
test.only('test I'm working on', async () => {});
```

### 4. Cache Dependencies in CI/CD

GitHub Actions caches are configured automatically in workflows.

---

## Next Steps

1. ✅ Read this quickstart guide
2. ✅ Set up test environment (`.env.test`)
3. ✅ Run `bun test:unit` to verify setup
4. ✅ Run `bun test:e2e --headed` to see E2E tests in action
5. ⏭️ Write your first test (see [Writing Tests](#writing-tests))
6. ⏭️ Review test coverage: `bun test:coverage`
7. ⏭️ Create a PR and watch tests run in CI/CD

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Project Constitution](.specify/memory/constitution.md) - Test-first development principle
- [Feature Spec](./spec.md) - Comprehensive testing requirements
- [Data Model](./data-model.md) - Test fixtures and factories
- [Test Configuration Contract](./contracts/test-config.yaml) - Configuration reference


