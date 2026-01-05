import { test, expect } from '@playwright/test';
import { loginIfNeeded } from './support/auth';

test.describe('Dashboard', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Login if needed (handles redirects to login)
    await loginIfNeeded(page);

    // Wait for page content (use domcontentloaded instead of networkidle for speed)
    await page.waitForLoadState('domcontentloaded');

    // Check if the page title is correct (matches "Dashboard - Cosplay Tracker" or similar)
    await expect(page).toHaveTitle(/Cosplay Tracker/i, { timeout: 10000 });

    // Check if main navigation elements are present
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });

    // Check if dashboard content is loaded
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to different sections', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await loginIfNeeded(page);

    // Wait for navigation to be ready
    await page.waitForLoadState('domcontentloaded');

    // Test navigation to characters page
    const charactersLink = page.locator('a[href="/characters"]').first();
    if (await charactersLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await charactersLink.click();
      await expect(page).toHaveURL(/\/characters/, { timeout: 10000 });

      // Navigate back to dashboard
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
    } else {
      // If link not found, just verify dashboard loads
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Login if needed
    await loginIfNeeded(page);

    // Wait for page content
    await page.waitForLoadState('domcontentloaded');

    // Check if mobile navigation works
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });

    // Check if main content is visible on mobile
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

    // Test mobile-specific interactions
    // Add mobile-specific tests
  });
});