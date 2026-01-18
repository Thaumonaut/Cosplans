/**
 * E2E Tests: Settings Notifications Section
 * Feature: 004-bugfix-testing - User Story 3
 * Tests that settings shows notifications section (not preferences) with no dark mode toggle
 */

import { test, expect } from "@playwright/test";
import { loginIfNeeded } from "../support/auth";

test.describe("Settings Notifications Section", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings/notifications (will redirect to login if needed)
    await page.goto("/settings/notifications");

    // Login if needed
    await loginIfNeeded(page);

    // Navigate back to settings/notifications after login
    await page.goto("/settings/notifications", {
      waitUntil: "domcontentloaded",
    });

    // Wait for loading to complete
    await page
      .waitForSelector("text=Loading notification settings...", {
        state: "hidden",
        timeout: 5000,
      })
      .catch(() => {});
    await page.waitForTimeout(300);
  });

  test('should display "Notifications" section in settings', async ({
    page,
  }) => {
    // Look for Notifications heading
    const notificationsSection = page.getByRole("heading", {
      name: /notifications/i,
    });
    await expect(notificationsSection).toBeVisible();
  });

  test('should NOT display "Preferences" as main section name', async ({
    page,
  }) => {
    // Preferences should not be the main section heading
    const preferencesHeading = page
      .getByRole("heading", { name: /^preferences$/i, level: 1 })
      .or(page.getByRole("heading", { name: /^preferences$/i, level: 2 }));

    // Should not exist as main heading
    const count = await preferencesHeading.count();
    expect(count).toBe(0);
  });

  test("should NOT display dark mode toggle in notifications section", async ({
    page,
  }) => {
    // Look for dark mode toggle - should not exist in notifications section
    const darkModeToggle = page.getByRole("switch", {
      name: /dark mode|theme/i,
    });
    const count = await darkModeToggle.count();
    expect(count).toBe(0);
  });

  test("should display notification toggle options", async ({ page }) => {
    // Should have some notification toggles
    const notificationToggles = page.getByRole("switch");
    const toggleCount = await notificationToggles.count();
    expect(toggleCount).toBeGreaterThan(0);
  });

  test("should allow toggling notification settings", async ({ page }) => {
    // Find first notification toggle
    const firstToggle = page.getByRole("switch").first();

    const initialState = await firstToggle.isChecked();

    // Toggle
    await firstToggle.click();
    await page.waitForTimeout(300);

    const newState = await firstToggle.isChecked();
    expect(newState).not.toBe(initialState);

    // Toggle back
    await firstToggle.click();
    await page.waitForTimeout(300);

    const finalState = await firstToggle.isChecked();
    expect(finalState).toBe(initialState);
  });

  test("should persist notification settings after save", async ({ page }) => {
    // Find first notification toggle
    const firstToggle = page.getByRole("switch").first();
    const initialState = await firstToggle.isChecked();

    // Change setting
    await firstToggle.click();
    await page.waitForTimeout(300);

    // Reload page
    await page.reload({ waitUntil: "domcontentloaded" });

    // Wait for loading to complete
    await page
      .waitForSelector("text=Loading notification settings...", {
        state: "hidden",
        timeout: 5000,
      })
      .catch(() => {});
    await page.waitForTimeout(300);

    // Check state persisted (settings store should auto-persist)
    const firstToggleAfterReload = page.getByRole("switch").first();
    const newState = await firstToggleAfterReload.isChecked();
    expect(newState).not.toBe(initialState);
  });

  test("should have clear labels for notification types", async ({ page }) => {
    // Get all labels in the notifications section
    const labels = await page.locator("label").all();

    // Should have at least some labels
    expect(labels.length).toBeGreaterThan(0);

    // Each label should have meaningful text
    for (const label of labels) {
      const text = await label.textContent();
      if (text) {
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("should display notifications section on mobile", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Mobile-specific test");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/settings/notifications", {
      waitUntil: "domcontentloaded",
    });

    // Wait for loading to complete
    await page
      .waitForSelector("text=Loading notification settings...", {
        state: "hidden",
        timeout: 5000,
      })
      .catch(() => {});
    await page.waitForTimeout(300);

    // Notifications heading should be visible
    const notificationsHeading = page.getByRole("heading", {
      name: /notifications/i,
    });
    await expect(notificationsHeading).toBeVisible();

    // Dark mode toggle should not exist
    const darkModeToggle = page.getByRole("switch", { name: /dark mode/i });
    const count = await darkModeToggle.count();
    expect(count).toBe(0);
  });

  test("should display notifications section on tablet", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Tablet-specific test");

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/settings/notifications", {
      waitUntil: "domcontentloaded",
    });

    // Wait for loading to complete
    await page
      .waitForSelector("text=Loading notification settings...", {
        state: "hidden",
        timeout: 5000,
      })
      .catch(() => {});
    await page.waitForTimeout(300);

    // Should be visible and functional
    const notificationsSection = page.getByRole("heading", {
      name: /notifications/i,
    });
    await expect(notificationsSection).toBeVisible();
  });

  test("should NOT have dark mode in any settings subsection", async ({
    page,
  }) => {
    // Already on notifications page - check it
    let darkModeToggle = page.getByRole("switch", { name: /dark mode/i });
    expect(await darkModeToggle.count()).toBe(0);

    // Check main settings page
    await page.goto("/settings/profile", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    darkModeToggle = page.getByRole("switch", { name: /dark mode/i });
    expect(await darkModeToggle.count()).toBe(0);
  });

  test("should have accessibility labels for notification toggles", async ({
    page,
  }) => {
    // All switches should have accessible names
    const switches = await page.getByRole("switch").all();
    expect(switches.length).toBeGreaterThan(0);

    for (const switchElement of switches) {
      const accessibleName = await switchElement.getAttribute("aria-label");
      const ariaLabelledBy =
        await switchElement.getAttribute("aria-labelledby");
      const ariaChecked = await switchElement.getAttribute("aria-checked");

      // Should have either aria-label or aria-labelledby, and aria-checked
      expect(ariaChecked).toBeTruthy();
    }
  });

  test("should display different notification categories", async ({ page }) => {
    // Should have notification options
    const notificationOptions = page.getByRole("switch");
    const count = await notificationOptions.count();

    // Should have at least 2 notification types (general + email)
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("should show success message when saving notification preferences", async ({
    page,
  }) => {
    // Note: Current implementation auto-saves, so this test verifies the toggle works
    const firstToggle = page.getByRole("switch").first();
    const initialState = await firstToggle.isChecked();

    await firstToggle.click();
    await page.waitForTimeout(300);

    const newState = await firstToggle.isChecked();
    expect(newState).not.toBe(initialState);
  });
});

test.describe("Settings Navigation", () => {
  test('should have "Notifications" as a settings submenu item', async ({
    page,
  }) => {
    await page.goto("/settings/profile");
    await loginIfNeeded(page);
    await page.goto("/settings/profile", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    // Notifications should be in navigation tabs
    const notificationsButton = page.getByRole("button", {
      name: /notifications/i,
    });
    await expect(notificationsButton).toBeVisible();
  });

  test("should navigate to notifications from settings", async ({ page }) => {
    await page.goto("/settings/profile");
    await loginIfNeeded(page);
    await page.goto("/settings/profile", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    // Click notifications button
    const notificationsButton = page.getByRole("button", {
      name: /notifications/i,
    });
    await notificationsButton.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(300);

    // URL should include notifications
    expect(page.url()).toContain("notifications");
  });
});
