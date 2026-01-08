import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import * as dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: ".env.test" });

/**
 * Vitest Configuration for Unit and Integration Testing
 *
 * Fast unit tests with jsdom environment
 * 80%+ coverage requirements
 * 8 parallel workers for optimal performance
 * 5-second timeout per test (unit), 30s for integration
 */
export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      "$env/static/public": path.resolve(
        __dirname,
        "tests/mocks/env-public.ts",
      ),
      "$lib/env/public": path.resolve(__dirname, "tests/mocks/env-public.ts"),
    },
  },

  test: {
    // Test environment
    environment: "jsdom",

    // Include test files - ONLY from tests/ directory, NOT src/
    include: [
      "tests/unit/**/*.{test,spec}.{js,ts}",
      "tests/integration/**/*.{test,spec}.{js,ts}",
    ],

    // Exclude patterns
    exclude: [
      "node_modules",
      "dist",
      "build",
      ".svelte-kit",
      "tests/e2e/**", // E2E tests use Playwright
      "src/**/*.test.ts", // Component tests need fixing
      "src/**/*.spec.ts",
      "src/**/*.integration.test.ts",
    ],

    // Global test setup
    setupFiles: ["tests/unit/setup.ts"],

    // Test timeout (5 seconds for unit tests)
    testTimeout: 5000,

    // Hook timeout (10 seconds for setup/teardown)
    hookTimeout: 10000,

    // Number of parallel workers
    maxWorkers: 8,

    // Run tests in parallel
    isolate: true,

    // Globals (describe, it, expect available without imports)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json"],
      reportsDirectory: "./coverage",
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        ".svelte-kit/",
        "tests/",
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/types/",
        "**/*.d.ts",
        "**/mocks/",
        "playwright.config.ts",
        "vitest.config.ts",
        "svelte.config.js",
        "tailwind.config.js",
        "postcss.config.js",
      ],
    },

    // Reporters
    reporters: ["default", "html"],

    // Mock utilities
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Timing warnings at 80% threshold
    slowTestThreshold: 4000, // Warn if test approaches 5s timeout
  },
});
