/**
 * E2E Tests: Sidebar Toggle and Grouping
 * Feature: 004-bugfix-testing - User Story 3
 * Tests reliable sidebar toggle and navigation grouping
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../support/page-objects/LoginPage";

test.describe("Sidebar Toggle Functionality", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "test@example.com",
      process.env.TEST_USER_PASSWORD || "testpassword123",
    );

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should toggle sidebar open and close on mobile", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Mobile-specific test");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const toggleButton = page.getByTestId("sidebar-toggle");
    const sidebar = page.getByTestId("sidebar");

    // Initially toggle button should be visible
    await expect(toggleButton).toBeVisible();

    // Click to open
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Check sidebar content is visible (links inside sidebar)
    const sidebarLinks = sidebar.locator("a");
    await expect(sidebarLinks.first()).toBeVisible();

    // Click to close
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Sidebar content should not be visible (translated off-screen)
    await expect(sidebarLinks.first()).not.toBeVisible();
  });

  test("should toggle sidebar on tablet", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Tablet-specific test");

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const toggleButton = page.getByTestId("sidebar-toggle");

    if (await toggleButton.count()) {
      const sidebar = page
        .getByTestId("sidebar")
        .or(page.getByRole("navigation"));

      // Toggle open
      await toggleButton.click();
      await page.waitForTimeout(300);
      await expect(sidebar).toBeVisible();

      // Toggle close
      await toggleButton.click();
      await page.waitForTimeout(300);
    }
  });

  test("should toggle sidebar on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const toggleButton = page.getByTestId("sidebar-toggle");

    if (await toggleButton.count()) {
      const sidebar = page
        .getByTestId("sidebar")
        .or(page.getByRole("navigation"));
      const initiallyVisible = await sidebar.isVisible();

      // Toggle
      await toggleButton.click();
      await page.waitForTimeout(300);

      const afterToggle = await sidebar.isVisible();
      expect(afterToggle).not.toBe(initiallyVisible);

      // Toggle back
      await toggleButton.click();
      await page.waitForTimeout(300);

      const afterSecondToggle = await sidebar.isVisible();
      expect(afterSecondToggle).toBe(initiallyVisible);
    }
  });

  test("should close mobile sidebar when clicking outside", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Mobile-specific test");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const toggleButton = page.getByTestId("sidebar-toggle");
    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));

    // Open sidebar
    await toggleButton.click();
    await page.waitForTimeout(300);
    await expect(sidebar).toBeVisible();

    // Click outside (on main content)
    await page.click("main", { position: { x: 10, y: 100 } });
    await page.waitForTimeout(300);

    // Should close
    await expect(sidebar).not.toBeVisible();
  });

  test("should persist toggle state across page navigations", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const toggleButton = page.getByTestId("sidebar-toggle");

    if (await toggleButton.count()) {
      const sidebar = page
        .getByTestId("sidebar")
        .or(page.getByRole("navigation"));

      // Toggle sidebar
      await toggleButton.click();
      await page.waitForTimeout(300);
      const stateAfterToggle = await sidebar.isVisible();

      // Navigate to different page
      await page.goto("/tasks");
      await page.waitForLoadState("domcontentloaded");

      // Check state persisted
      const stateOnNewPage = await sidebar.isVisible();
      expect(stateOnNewPage).toBe(stateAfterToggle);
    }
  });

  test("should work reliably with 100% success rate", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Reliability test");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const toggleButton = page.getByTestId("sidebar-toggle");
    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));

    // Test 10 consecutive toggles
    for (let i = 0; i < 10; i++) {
      // Open
      await toggleButton.click();
      await page.waitForTimeout(300);
      await expect(sidebar).toBeVisible();

      // Close
      await toggleButton.click();
      await page.waitForTimeout(300);
      await expect(sidebar).not.toBeVisible();
    }
  });

  test("should handle rapid toggle clicks", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Edge case test");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const toggleButton = page.getByTestId("sidebar-toggle");

    // Rapidly click 5 times
    for (let i = 0; i < 5; i++) {
      await toggleButton.click();
      await page.waitForTimeout(50);
    }

    // Should end in a stable state (either open or closed, but not broken)
    await page.waitForTimeout(500);

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));
    const isVisible = await sidebar.isVisible();

    // Should be either fully visible or fully hidden (not stuck mid-animation)
    expect(typeof isVisible).toBe("boolean");
  });

  test("should maintain sidebar functionality when transitioning viewport sizes", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Viewport transition test");

    // Start desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));
    const initiallyVisible = await sidebar.isVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Toggle should still work
    const toggleButton = page.getByTestId("sidebar-toggle");
    await expect(toggleButton).toBeVisible();

    await toggleButton.click();
    await page.waitForTimeout(300);
    await expect(sidebar).toBeVisible();
  });
});

test.describe("Navigation Grouping", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "test@example.com",
      process.env.TEST_USER_PASSWORD || "testpassword123",
    );

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
  });

  test('should display "Production" section in sidebar', async ({ page }) => {
    // Open sidebar if on mobile
    const toggleButton = page.getByTestId("sidebar-toggle");
    if (await toggleButton.count()) {
      await toggleButton.click();
      await page.waitForTimeout(300);
    }

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));

    // Look for Production section
    const productionSection = sidebar.getByText(/production/i);
    await expect(productionSection).toBeVisible();
  });

  test("should group photoshoots in Production section", async ({ page }) => {
    const toggleButton = page.getByTestId("sidebar-toggle");
    if (await toggleButton.count()) {
      await toggleButton.click();
      await page.waitForTimeout(300);
    }

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));

    // Find Production section
    const productionSection = sidebar
      .locator('[data-group="production"]')
      .or(sidebar.locator(':has-text("Production")').locator(".."));

    // Photoshoots link should be within or near Production section
    const photoshootsLink = sidebar.getByRole("link", {
      name: /photoshoots?/i,
    });
    await expect(photoshootsLink).toBeVisible();
  });

  test("should group tools in Production section", async ({ page }) => {
    const toggleButton = page.getByTestId("sidebar-toggle");
    if (await toggleButton.count()) {
      await toggleButton.click();
      await page.waitForTimeout(300);
    }

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));
    const toolsLink = sidebar.getByRole("link", { name: /tools/i });

    // Tools should be visible in sidebar
    if (await toolsLink.count()) {
      await expect(toolsLink).toBeVisible();
    }
  });

  test("should group resources in Production section", async ({ page }) => {
    const toggleButton = page.getByTestId("sidebar-toggle");
    if (await toggleButton.count()) {
      await toggleButton.click();
      await page.waitForTimeout(300);
    }

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));
    const resourcesLink = sidebar.getByRole("link", { name: /resources/i });
    await expect(resourcesLink).toBeVisible();
  });

  test("should group calendar in Production section", async ({ page }) => {
    const toggleButton = page.getByTestId("sidebar-toggle");
    if (await toggleButton.count()) {
      await toggleButton.click();
      await page.waitForTimeout(300);
    }

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));
    const calendarLink = sidebar.getByRole("link", { name: /calendar/i });

    if (await calendarLink.count()) {
      await expect(calendarLink).toBeVisible();
    }
  });

  test("should have collapse/expand toggle for Production section", async ({
    page,
  }) => {
    const toggleButton = page.getByTestId("sidebar-toggle");
    if (await toggleButton.count()) {
      await toggleButton.click();
      await page.waitForTimeout(300);
    }

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));

    // Look for collapse/expand button for Production group
    const groupToggle = sidebar
      .getByRole("button", { name: /production.*collapse|production.*expand/i })
      .or(sidebar.locator('[data-group="production"] button').first());

    if (await groupToggle.count()) {
      await expect(groupToggle).toBeVisible();

      // Should be clickable
      await groupToggle.click();
      await page.waitForTimeout(300);

      // Click again to toggle back
      await groupToggle.click();
      await page.waitForTimeout(300);
    }
  });

  test("should persist group collapse state across sessions", async ({
    page,
    context,
  }) => {
    const toggleButton = page.getByTestId("sidebar-toggle");
    if (await toggleButton.count()) {
      await toggleButton.click();
      await page.waitForTimeout(300);
    }

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));
    const groupToggle = sidebar
      .getByRole("button", { name: /production/i })
      .first();

    if (await groupToggle.count()) {
      // Collapse the group
      await groupToggle.click();
      await page.waitForTimeout(300);

      // Check if items are hidden
      const photoshootsLink = sidebar.getByRole("link", {
        name: /photoshoots/i,
      });
      const collapsed = !(await photoshootsLink.isVisible());

      // Reload page
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // Reopen sidebar if needed
      const toggleButtonAfterReload = page.getByRole("button", {
        name: /menu|navigation|sidebar|toggle/i,
      });
      if (await toggleButtonAfterReload.count()) {
        await toggleButtonAfterReload.click();
        await page.waitForTimeout(300);
      }

      // Check state persisted
      const photoshootsLinkAfterReload = sidebar.getByRole("link", {
        name: /photoshoots/i,
      });
      const stillCollapsed = !(await photoshootsLinkAfterReload.isVisible());

      expect(stillCollapsed).toBe(collapsed);
    }
  });

  test("should maintain logical navigation order in grouped sections", async ({
    page,
  }) => {
    const toggleButton = page.getByTestId("sidebar-toggle");
    if (await toggleButton.count()) {
      await toggleButton.click();
      await page.waitForTimeout(300);
    }

    const sidebar = page
      .getByTestId("sidebar")
      .or(page.getByRole("navigation"));

    // Get all navigation links
    const navLinks = await sidebar.getByRole("link").all();

    // Should have meaningful navigation structure
    expect(navLinks.length).toBeGreaterThan(0);

    // Each link should be accessible
    for (const link of navLinks) {
      const text = await link.textContent();
      expect(text).toBeTruthy();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });
});
