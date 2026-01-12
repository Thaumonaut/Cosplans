/**
 * Unit Test Setup
 *
 * Global setup for Vitest unit tests.
 * Loaded automatically before all tests via vitest.config.ts setupFiles.
 */

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables for tests
process.env.PUBLIC_SUPABASE_URL =
  process.env.SUPABASE_TEST_URL || "https://test.supabase.co";
process.env.PUBLIC_SUPABASE_ANON_KEY =
  process.env.SUPABASE_TEST_KEY || "test-key";

// Mock window.matchMedia for responsive component tests
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver for lazy loading tests
// @ts-ignore - attach to global for tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

console.log("✓ Unit test setup complete");
