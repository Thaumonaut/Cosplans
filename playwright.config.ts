import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Playwright Configuration for E2E Testing
 * 
 * Multi-browser support: Chromium, Firefox, WebKit
 * Visual regression testing with 95% similarity threshold
 * Auto-retry for flaky tests (up to 3 attempts)
 * Parallel execution with 4 workers
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Global setup: Create test user if needed before tests run
  globalSetup: './tests/e2e/global-setup.ts',

  // Maximum time one test can run (2 minutes)
  timeout: 120 * 1000,

  // Maximum time for assertions (10 seconds)
  expect: {
    timeout: 10 * 1000,
    // Visual regression threshold: 5% tolerance (95% similarity required)
    toHaveScreenshot: {
      maxDiffPixels: 0,
      threshold: 0.05,
    },
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests up to 3 times (flaky test detection)
  retries: process.env.CI ? 3 : 3,

  // Number of parallel workers (4 for optimal performance)
  workers: process.env.CI ? 4 : 4,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['list'], // Console output
    ['./tests/config/flaky-test-reporter.ts'], // Custom flaky test reporter
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',

    // Collect trace when retrying failed tests
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Browser viewport
    viewport: { width: 1280, height: 720 },
  },

  // Configure projects for major browsers and viewports
  projects: [
    // Desktop browsers (default viewport)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Responsive viewports for US2 testing
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
        isMobile: false,
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'large-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },

    // Mobile devices for responsive testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Offline simulation for US4 testing
    {
      name: 'offline-mobile',
      use: {
        ...devices['Pixel 5'],
        offline: true,
        viewport: { width: 375, height: 667 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'offline-desktop',
      use: {
        ...devices['Desktop Chrome'],
        offline: true,
        viewport: { width: 1024, height: 768 },
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    // Use bun in CI, pnpm locally (detected from packageManager in package.json)
    // For local: use pnpm exec which preserves PATH correctly
    command: process.env.CI ? 'bun run dev' : 'pnpm exec vite dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      // Spread existing env vars first (including .env.test loaded variables)
      ...process.env,
      // Ensure PATH includes node from nvm for spawned processes (override after spreading)
      PATH: process.env.PATH || '/home/jek/.nvm/versions/node/v22.20.0/bin:/usr/bin:/bin',
      // Ensure PUBLIC_ vars are present for SvelteKit build-time
      PUBLIC_SUPABASE_URL: process.env.SUPABASE_TEST_URL || process.env.PUBLIC_SUPABASE_URL || '',
      PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_TEST_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '',
    },
  },

  // Global setup and teardown
  // globalSetup: './tests/e2e/setup/global-setup.ts',
  // globalTeardown: './tests/e2e/setup/global-teardown.ts',

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Maximum time the entire test suite can run (10 minutes)
  globalTimeout: 10 * 60 * 1000,
});
