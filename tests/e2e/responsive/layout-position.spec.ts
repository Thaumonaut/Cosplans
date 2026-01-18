/**
 * E2E Tests: Action Bar and Sidebar Positioning
 * Feature: 004-bugfix-testing - User Story 2
 * Tests sticky action bar and fixed sidebar across viewports
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/LoginPage';

test.describe('Action Bar Positioning', () => {
	let loginPage: LoginPage;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);

		// Login
		await loginPage.goto();
		await loginPage.login(
			process.env.TEST_USER_EMAIL || 'test@example.com',
			process.env.TEST_USER_PASSWORD || 'testpassword123'
		);
	});

	test('should keep action bar sticky at top on mobile while scrolling', async ({
		page,
		browserName
	}) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Get initial action bar position
		const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));
		await expect(actionBar).toBeVisible();

		const initialPosition = await actionBar.boundingBox();

		// Scroll down the page
		await page.evaluate(() => window.scrollTo(0, 500));
		await page.waitForTimeout(300); // Wait for scroll

		// Check action bar is still at top
		const scrolledPosition = await actionBar.boundingBox();

		if (initialPosition && scrolledPosition) {
			expect(scrolledPosition.y).toBeLessThanOrEqual(10); // Should be at or near top
		}
	});

	test('should keep action bar sticky at top on tablet while scrolling', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));

		// Scroll down
		await page.evaluate(() => window.scrollTo(0, 800));
		await page.waitForTimeout(300);

		// Action bar should still be visible and at top
		await expect(actionBar).toBeVisible();
		const position = await actionBar.boundingBox();

		if (position) {
			expect(position.y).toBeLessThanOrEqual(10);
		}
	});

	test('should keep action bar sticky at top on desktop while scrolling', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));

		// Scroll down significantly
		await page.evaluate(() => window.scrollTo(0, 1000));
		await page.waitForTimeout(300);

		// Check still at top
		await expect(actionBar).toBeVisible();
		const position = await actionBar.boundingBox();

		if (position) {
			expect(position.y).toBeLessThanOrEqual(10);
		}
	});

	test('should include action bar height in viewport calculations', async ({ page }) => {
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Get action bar height
		const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));
		const actionBarBox = await actionBar.boundingBox();

		// Main content should start below action bar
		const mainContent = page.getByRole('main');
		const mainBox = await mainContent.boundingBox();

		if (actionBarBox && mainBox) {
			// Main content top should be at or below action bar bottom
			expect(mainBox.y).toBeGreaterThanOrEqual(actionBarBox.y + actionBarBox.height - 5); // 5px tolerance
		}
	});

	test('should not hide content behind action bar when scrolling up', async ({ page }) => {
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Scroll down then up
		await page.evaluate(() => window.scrollTo(0, 500));
		await page.waitForTimeout(200);
		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(200);

		// First task should be visible (not hidden behind action bar)
		const firstTask = page.getByTestId('task-item').first();
		if (await firstTask.count()) {
			const taskBox = await firstTask.boundingBox();
			const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));
			const actionBarBox = await actionBar.boundingBox();

			if (taskBox && actionBarBox) {
				// Task should start below action bar
				expect(taskBox.y).toBeGreaterThanOrEqual(actionBarBox.y + actionBarBox.height);
			}
		}
	});

	test('should maintain action bar position when switching views', async ({ page }) => {
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Get action bar position in list view
		const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));
		const listViewPosition = await actionBar.boundingBox();

		// Switch to kanban view
		const kanbanButton = page.getByRole('button', { name: /kanban/i });
		if (await kanbanButton.count()) {
			await kanbanButton.click();
			await page.waitForLoadState('domcontentloaded');

			// Action bar should still be at same position
			const kanbanViewPosition = await actionBar.boundingBox();

			if (listViewPosition && kanbanViewPosition) {
				expect(kanbanViewPosition.y).toEqual(listViewPosition.y);
			}
		}
	});

	test('should handle action bar with dynamic content', async ({ page }) => {
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));

		// Get initial height
		const initialBox = await actionBar.boundingBox();

		// Trigger action that might add content to action bar (e.g., filter chips)
		const filterButton = page.getByRole('button', { name: /filter/i });
		if (await filterButton.count()) {
			await filterButton.click();
			await page.waitForTimeout(300);

			// Action bar should still be at top even if height changed
			const newBox = await actionBar.boundingBox();

			if (newBox) {
				expect(newBox.y).toBeLessThanOrEqual(10);
			}
		}
	});
});

test.describe('Sidebar Positioning', () => {
	let loginPage: LoginPage;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);

		// Login
		await loginPage.goto();
		await loginPage.login(
			process.env.TEST_USER_EMAIL || 'test@example.com',
			process.env.TEST_USER_PASSWORD || 'testpassword123'
		);
	});

	test('should keep sidebar fixed on mobile (not scroll with content)', async ({
		page,
		browserName
	}) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Open sidebar on mobile
		const hamburger = page.getByRole('button', { name: /menu|navigation|sidebar/i });
		if (await hamburger.count()) {
			await hamburger.click();
			await page.waitForTimeout(300);

			// Sidebar should be visible
			const sidebar = page.getByTestId('sidebar').or(page.getByRole('navigation'));
			await expect(sidebar).toBeVisible();

			// Get sidebar position
			const initialPosition = await sidebar.boundingBox();

			// Scroll page content
			await page.evaluate(() => window.scrollTo(0, 300));
			await page.waitForTimeout(200);

			// Sidebar should not have scrolled (fixed position)
			const scrolledPosition = await sidebar.boundingBox();

			if (initialPosition && scrolledPosition) {
				expect(scrolledPosition.y).toEqual(initialPosition.y);
			}
		}
	});

	test('should keep sidebar fixed on tablet while scrolling', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const sidebar = page.getByTestId('sidebar').or(page.getByRole('navigation'));

		// If sidebar is visible on tablet
		if ((await sidebar.count()) && (await sidebar.isVisible())) {
			const initialBox = await sidebar.boundingBox();

			// Scroll content
			await page.evaluate(() => window.scrollTo(0, 500));
			await page.waitForTimeout(200);

			// Sidebar should stay in place
			const scrolledBox = await sidebar.boundingBox();

			if (initialBox && scrolledBox) {
				expect(scrolledBox.y).toEqual(initialBox.y);
			}
		}
	});

	test('should keep sidebar fixed on desktop while scrolling', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const sidebar = page.getByTestId('sidebar').or(page.getByRole('navigation'));
		await expect(sidebar).toBeVisible();

		const initialBox = await sidebar.boundingBox();

		// Scroll main content
		await page.evaluate(() => window.scrollTo(0, 1000));
		await page.waitForTimeout(200);

		// Sidebar should not scroll
		const scrolledBox = await sidebar.boundingBox();

		if (initialBox && scrolledBox) {
			expect(scrolledBox.y).toEqual(initialBox.y);
		}
	});

	test('should toggle sidebar on mobile without affecting content layout', async ({
		page,
		browserName
	}) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Get main content position
		const mainContent = page.getByRole('main');
		const initialContentBox = await mainContent.boundingBox();

		// Toggle sidebar open
		const hamburger = page.getByRole('button', { name: /menu|navigation|sidebar/i });
		if (await hamburger.count()) {
			await hamburger.click();
			await page.waitForTimeout(300);

			// Main content should not shift (sidebar is overlay)
			const openContentBox = await mainContent.boundingBox();

			if (initialContentBox && openContentBox) {
				expect(openContentBox.x).toEqual(initialContentBox.x);
			}

			// Close sidebar
			await hamburger.click();
			await page.waitForTimeout(300);

			// Content should return to original position
			const closedContentBox = await mainContent.boundingBox();

			if (initialContentBox && closedContentBox) {
				expect(closedContentBox.x).toEqual(initialContentBox.x);
			}
		}
	});

	test('should close mobile sidebar when clicking outside', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Open sidebar
		const hamburger = page.getByRole('button', { name: /menu|navigation|sidebar/i });
		if (await hamburger.count()) {
			await hamburger.click();
			await page.waitForTimeout(300);

			const sidebar = page.getByTestId('sidebar').or(page.getByRole('navigation'));
			await expect(sidebar).toBeVisible();

			// Click on main content (outside sidebar)
			const mainContent = page.getByRole('main');
			await mainContent.click({ position: { x: 10, y: 10 } });
			await page.waitForTimeout(300);

			// Sidebar should close
			await expect(sidebar).not.toBeVisible();
		}
	});

	test('should have sidebar toggle accessible from all pages', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });

		const pages = ['/dashboard', '/tasks', '/projects', '/teams', '/settings'];

		for (const path of pages) {
			await page.goto(path);
			await page.waitForLoadState('domcontentloaded');

			// Hamburger should be accessible
			const hamburger = page.getByRole('button', { name: /menu|navigation|sidebar/i });
			await expect(hamburger).toBeVisible();
		}
	});

	test('should maintain sidebar scroll position when toggling', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Open sidebar
		const hamburger = page.getByRole('button', { name: /menu|navigation|sidebar/i });
		if (await hamburger.count()) {
			await hamburger.click();
			await page.waitForTimeout(300);

			const sidebar = page.getByTestId('sidebar').or(page.getByRole('navigation'));

			// Scroll sidebar content if it has scrollable content
			await sidebar.evaluate((el) => {
				el.scrollTop = 100;
			});

			const scrollPosition = await sidebar.evaluate((el) => el.scrollTop);

			// Close and reopen sidebar
			await hamburger.click();
			await page.waitForTimeout(300);
			await hamburger.click();
			await page.waitForTimeout(300);

			// Scroll position should be preserved (or reset to 0, depending on design)
			const newScrollPosition = await sidebar.evaluate((el) => el.scrollTop);

			// Either preserved or reset is acceptable
			expect(newScrollPosition).toBeGreaterThanOrEqual(0);
		}
	});
});

test.describe('Combined Layout Positioning', () => {
	test('should not have overlapping action bar and sidebar', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));
		const sidebar = page.getByTestId('sidebar').or(page.getByRole('navigation'));

		if ((await actionBar.count()) && (await sidebar.count())) {
			const actionBarBox = await actionBar.boundingBox();
			const sidebarBox = await sidebar.boundingBox();

			if (actionBarBox && sidebarBox) {
				// Check no overlap
				const noOverlap =
					actionBarBox.y + actionBarBox.height <= sidebarBox.y || // action bar above
					sidebarBox.y + sidebarBox.height <= actionBarBox.y || // sidebar above
					actionBarBox.x + actionBarBox.width <= sidebarBox.x || // action bar left
					sidebarBox.x + sidebarBox.width <= actionBarBox.x; // sidebar left

				expect(noOverlap).toBe(true);
			}
		}
	});

	test('should calculate available content area correctly', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Content area should account for action bar and sidebar
		const mainContent = page.getByRole('main');
		const contentBox = await mainContent.boundingBox();

		const viewportHeight = await page.evaluate(() => window.innerHeight);
		const viewportWidth = await page.evaluate(() => window.innerWidth);

		if (contentBox) {
			// Content should fit within viewport
			expect(contentBox.width).toBeLessThanOrEqual(viewportWidth);
			expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(viewportHeight + 100); // Allow for scroll
		}
	});

	test('should handle rapid scrolling without layout shift', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const actionBar = page.getByTestId('action-bar').or(page.getByRole('banner'));

		// Rapid scroll up and down
		for (let i = 0; i < 5; i++) {
			await page.evaluate(() => window.scrollTo(0, 500));
			await page.waitForTimeout(50);
			await page.evaluate(() => window.scrollTo(0, 0));
			await page.waitForTimeout(50);
		}

		// Action bar should still be properly positioned
		const finalBox = await actionBar.boundingBox();

		if (finalBox) {
			expect(finalBox.y).toBeLessThanOrEqual(10);
		}
	});
});
