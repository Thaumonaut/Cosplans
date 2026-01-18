/**
 * E2E Tests: Mobile Layout and Responsive Design
 * Feature: 004-bugfix-testing - User Story 2
 * Tests viewport coverage across mobile, tablet, desktop, and large desktop
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/LoginPage';

test.describe('Mobile Layout Tests', () => {
	let loginPage: LoginPage;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);

		// Login as test user
		await loginPage.goto();
		await loginPage.login(
			process.env.TEST_USER_EMAIL || 'test@example.com',
			process.env.TEST_USER_PASSWORD || 'testpassword123'
		);
	});

	test('should constrain content to viewport on 320px mobile', async ({ page, browserName }) => {
		// Use mobile project only
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		// Set to smallest mobile viewport (320px)
		await page.setViewportSize({ width: 320, height: 568 });

		// Navigate to various pages
		const pages = ['/dashboard', '/tasks', '/projects', '/teams', '/settings'];

		for (const path of pages) {
			await page.goto(path);
			await page.waitForLoadState('domcontentloaded');

			// Check for horizontal overflow
			const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
			const viewportWidth = await page.evaluate(() => window.innerWidth);

			expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1px tolerance for rounding
		}
	});

	test('should constrain content to viewport on 375px mobile', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		// iPhone SE/12 mini size
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Check no horizontal scrolling
		const hasHorizontalScroll = await page.evaluate(() => {
			return document.documentElement.scrollWidth > document.documentElement.clientWidth;
		});

		expect(hasHorizontalScroll).toBe(false);
	});

	test('should constrain content to viewport on 428px mobile (iPhone 13 Pro Max)', async ({
		page,
		browserName
	}) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 428, height: 926 });

		await page.goto('/dashboard');
		await page.waitForLoadState('domcontentloaded');

		// Verify no overflow
		const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
		const viewportWidth = await page.evaluate(() => window.innerWidth);

		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
	});

	test('should display mobile navigation menu', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/dashboard');

		// Mobile should show hamburger menu
		const hamburgerMenu = page.getByRole('button', { name: /menu|navigation/i });
		await expect(hamburgerMenu).toBeVisible();

		// Desktop navigation should be hidden
		const desktopNav = page.getByTestId('desktop-nav');
		if (await desktopNav.count()) {
			await expect(desktopNav).not.toBeVisible();
		}
	});

	test('should have touch-friendly tap targets on mobile', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/tasks');

		// Check all interactive elements have minimum 44x44 tap target
		const buttons = await page.locator('button, a[role="button"]').all();

		for (const button of buttons) {
			if (!(await button.isVisible())) continue;

			const box = await button.boundingBox();
			if (box) {
				// iOS HIG recommends 44x44 minimum
				expect(box.width).toBeGreaterThanOrEqual(40); // Allow 4px tolerance
				expect(box.height).toBeGreaterThanOrEqual(40);
			}
		}
	});

	test('should stack elements vertically on mobile', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Task list should be full-width on mobile
		const taskList = page.getByTestId('task-list');
		if (await taskList.count()) {
			const taskListBox = await taskList.boundingBox();
			const viewportWidth = await page.evaluate(() => window.innerWidth);

			if (taskListBox) {
				// Should take most of viewport width (allowing for padding)
				expect(taskListBox.width).toBeGreaterThan(viewportWidth * 0.9);
			}
		}
	});

	test('should hide non-essential UI elements on small mobile', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Mobile-specific test');

		await page.setViewportSize({ width: 320, height: 568 });
		await page.goto('/dashboard');

		// Secondary actions should be hidden or in overflow menu
		const secondaryActions = page.getByTestId('secondary-actions');
		if (await secondaryActions.count()) {
			const isVisible = await secondaryActions.isVisible();
			// Should either be hidden or very compact
			if (isVisible) {
				const box = await secondaryActions.boundingBox();
				if (box) {
					expect(box.width).toBeLessThan(100); // Compact representation
				}
			}
		}
	});
});

test.describe('Tablet Layout Tests', () => {
	test('should constrain content to viewport on 768px tablet', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Tablet-specific test');

		await page.setViewportSize({ width: 768, height: 1024 });

		// Login
		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// No horizontal scroll
		const hasHorizontalScroll = await page.evaluate(() => {
			return document.documentElement.scrollWidth > document.documentElement.clientWidth;
		});

		expect(hasHorizontalScroll).toBe(false);
	});

	test('should constrain content to viewport on 1024px tablet', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Tablet-specific test');

		await page.setViewportSize({ width: 1024, height: 768 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/dashboard');
		await page.waitForLoadState('domcontentloaded');

		const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
		const viewportWidth = await page.evaluate(() => window.innerWidth);

		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
	});

	test('should show hybrid navigation on tablet', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Tablet-specific test');

		await page.setViewportSize({ width: 768, height: 1024 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/dashboard');

		// Tablet may show sidebar or hamburger depending on design
		const sidebar = page.getByTestId('sidebar');
		const hamburger = page.getByRole('button', { name: /menu|navigation/i });

		// At least one navigation method should be visible
		const sidebarVisible = (await sidebar.count()) > 0 && (await sidebar.isVisible());
		const hamburgerVisible = (await hamburger.count()) > 0 && (await hamburger.isVisible());

		expect(sidebarVisible || hamburgerVisible).toBe(true);
	});
});

test.describe('Desktop Layout Tests', () => {
	test('should constrain content to viewport on 1025px desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1025, height: 768 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const hasHorizontalScroll = await page.evaluate(() => {
			return document.documentElement.scrollWidth > document.documentElement.clientWidth;
		});

		expect(hasHorizontalScroll).toBe(false);
	});

	test('should constrain content to viewport on 1920px desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/dashboard');
		await page.waitForLoadState('domcontentloaded');

		const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
		const viewportWidth = await page.evaluate(() => window.innerWidth);

		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
	});

	test('should show persistent sidebar on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/dashboard');

		// Desktop should show sidebar
		const sidebar = page.getByTestId('sidebar');
		await expect(sidebar).toBeVisible();
	});
});

test.describe('Large Desktop Layout Tests', () => {
	test('should constrain content to viewport on 2560px+ large desktop', async ({ page }) => {
		await page.setViewportSize({ width: 2560, height: 1440 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		const hasHorizontalScroll = await page.evaluate(() => {
			return document.documentElement.scrollWidth > document.documentElement.clientWidth;
		});

		expect(hasHorizontalScroll).toBe(false);
	});

	test('should have max-width container on very large screens', async ({ page }) => {
		await page.setViewportSize({ width: 3440, height: 1440 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/dashboard');
		await page.waitForLoadState('domcontentloaded');

		// Main content should have max-width to prevent excessive line length
		const mainContent = page.getByRole('main');
		if (await mainContent.count()) {
			const contentBox = await mainContent.boundingBox();
			if (contentBox) {
				// Content should not stretch to full ultra-wide width
				expect(contentBox.width).toBeLessThan(2000); // Reasonable max-width
			}
		}
	});
});

test.describe('Extreme Viewport Tests', () => {
	test('should handle 320x568 (smallest mobile)', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Extreme viewport test');

		await page.setViewportSize({ width: 320, height: 568 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/tasks');

		// Should still be usable (no layout breakage)
		const addButton = page.getByRole('button', { name: /add task/i });
		await expect(addButton).toBeVisible();
	});

	test('should handle 4K resolution (3840x2160)', async ({ page }) => {
		await page.setViewportSize({ width: 3840, height: 2160 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/dashboard');
		await page.waitForLoadState('domcontentloaded');

		// No horizontal overflow
		const hasHorizontalScroll = await page.evaluate(() => {
			return document.documentElement.scrollWidth > document.documentElement.clientWidth;
		});

		expect(hasHorizontalScroll).toBe(false);
	});

	test('should handle portrait orientation on tablet', async ({ page, browserName }) => {
		test.skip(browserName !== 'chromium', 'Orientation test');

		// iPad Pro portrait
		await page.setViewportSize({ width: 1024, height: 1366 });

		await page.goto('/login');
		await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
		await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
		await page.getByRole('button', { name: /log in/i }).click();

		await page.goto('/tasks');

		// Content should adapt to portrait layout
		const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
		const viewportWidth = await page.evaluate(() => window.innerWidth);

		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
	});
});
