/**
 * E2E Tests: Kanban Sync After Task Creation
 * Feature: 004-bugfix-testing - User Story 1
 * Tests that tasks appear immediately in kanban view after creation
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/LoginPage';
import { TaskPage } from '../support/page-objects/TaskPage';

test.describe('Kanban Sync After Task Creation', () => {
	let loginPage: LoginPage;
	let taskPage: TaskPage;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);
		taskPage = new TaskPage(page);

		// Login
		await loginPage.goto();
		await loginPage.login(
			process.env.TEST_USER_EMAIL || 'test@example.com',
			process.env.TEST_USER_PASSWORD || 'testpassword123'
		);

		// Navigate to tasks
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');
	});

	test('should show new task in kanban immediately after creation from list view', async ({ page }) => {
		// Create task in list view
		await page.getByRole('button', { name: /add task/i }).click();
		await page.getByLabel(/title/i).fill('New Task for Kanban');
		await page.getByLabel(/description/i).fill('Should appear in kanban');
		await page.getByRole('button', { name: /create/i }).click();

		// Wait for creation
		await expect(page.getByText(/created successfully/i)).toBeVisible();

		// Switch to kanban view
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Verify task appears in kanban
		await expect(page.getByText('New Task for Kanban')).toBeVisible();
	});

	test('should show task in correct stage column', async ({ page }) => {
		// Create task with specific stage
		await taskPage.createTask({
			title: 'Task in Progress',
			description: 'Should appear in progress column',
			stage: 'in_progress'
		});

		// Switch to kanban
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Find the "In Progress" column
		const inProgressColumn = page.getByTestId('stage-column-in_progress');
		await expect(inProgressColumn).toBeVisible();

		// Verify task is in correct column
		await expect(inProgressColumn.getByText('Task in Progress')).toBeVisible();
	});

	test('should update kanban when task created from quick add', async ({ page }) => {
		// Switch to kanban first
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Use quick add in kanban
		const todoColumn = page.getByTestId('stage-column-todo');
		await todoColumn.getByRole('button', { name: /add/i }).click();
		await page.getByLabel(/title/i).fill('Quick Add Task');
		await page.keyboard.press('Enter');

		// Wait briefly for creation
		await page.waitForTimeout(500);

		// Verify task appears immediately
		await expect(todoColumn.getByText('Quick Add Task')).toBeVisible();
	});

	test('should sync kanban when task moved between stages', async ({ page }) => {
		// Create task in TODO
		const task = await taskPage.createTask({
			title: 'Movable Task',
			stage: 'todo'
		});

		// Switch to kanban
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Drag task to In Progress column
		const taskCard = page.getByTestId(`task-card-${task.id}`);
		const inProgressColumn = page.getByTestId('stage-column-in_progress');

		await taskCard.dragTo(inProgressColumn);

		// Wait for update
		await page.waitForTimeout(500);

		// Verify task moved
		await expect(inProgressColumn.getByText('Movable Task')).toBeVisible();

		// Verify it's not in TODO anymore
		const todoColumn = page.getByTestId('stage-column-todo');
		await expect(todoColumn.getByText('Movable Task')).not.toBeVisible();
	});

	test('should maintain task count across views', async ({ page }) => {
		// Create 3 tasks
		await taskPage.createTask({ title: 'Task 1', stage: 'todo' });
		await taskPage.createTask({ title: 'Task 2', stage: 'in_progress' });
		await taskPage.createTask({ title: 'Task 3', stage: 'done' });

		// Get count in list view
		const listCount = await page.getByTestId('task-count').textContent();

		// Switch to kanban
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Count tasks in all columns
		const todoCount = await page.getByTestId('stage-column-todo').getByTestId('task-card').count();
		const inProgressCount = await page.getByTestId('stage-column-in_progress').getByTestId('task-card').count();
		const doneCount = await page.getByTestId('stage-column-done').getByTestId('task-card').count();
		const totalKanbanCount = todoCount + inProgressCount + doneCount;

		// Verify counts match
		expect(totalKanbanCount).toBe(3);
	});

	test('should show task updates in real-time in kanban', async ({ page, context }) => {
		// Open two tabs
		const page2 = await context.newPage();
		await page2.goto('/tasks');
		await page2.waitForLoadState('domcontentloaded');

		// Put page 1 in kanban view
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Create task in page 2 (list view)
		await page2.getByRole('button', { name: /add task/i }).click();
		await page2.getByLabel(/title/i).fill('Real-time Task');
		await page2.getByRole('button', { name: /create/i }).click();

		// Wait for websocket/polling update
		await page.waitForTimeout(2000);

		// Verify task appears in page 1 kanban without refresh
		await expect(page.getByText('Real-time Task')).toBeVisible();

		await page2.close();
	});

	test('should preserve task data when switching between views', async ({ page }) => {
		// Create task with detailed info
		await taskPage.createTask({
			title: 'Detailed Task',
			description: 'With lots of details',
			priority: 'high',
			due_date: '2026-12-31'
		});

		// Switch to kanban
		await page.getByRole('button', { name: /kanban/i }).click();

		// Open task in kanban
		await page.getByText('Detailed Task').click();

		// Verify all details are present
		await expect(page.getByText('With lots of details')).toBeVisible();
		await expect(page.getByText(/high/i)).toBeVisible();
		await expect(page.getByText(/2026-12-31/i)).toBeVisible();
	});

	test('should handle rapid task creation in kanban', async ({ page }) => {
		// Switch to kanban
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Create multiple tasks rapidly
		const todoColumn = page.getByTestId('stage-column-todo');
		
		for (let i = 1; i <= 5; i++) {
			await todoColumn.getByRole('button', { name: /add/i }).click();
			await page.getByLabel(/title/i).fill(`Rapid Task ${i}`);
			await page.keyboard.press('Enter');
			await page.waitForTimeout(200);
		}

		// Wait for all to sync
		await page.waitForTimeout(1000);

		// Verify all 5 tasks appear
		for (let i = 1; i <= 5; i++) {
			await expect(todoColumn.getByText(`Rapid Task ${i}`)).toBeVisible();
		}
	});
});

test.describe('Kanban Performance', () => {
	test('should load kanban with 100+ tasks efficiently', async ({ page }) => {
		// TODO: Implement performance test with large dataset
		test.skip();
	});
});



