/**
 * E2E Tests: Task Custom Fields Persistence
 * Feature: 004-bugfix-testing - User Story 1
 * Tests that custom fields persist across views and operations
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/LoginPage';
import { TaskPage } from '../support/page-objects/TaskPage';

test.describe('Task Custom Fields Persistence', () => {
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

	test('should persist custom text field', async ({ page }) => {
		// Create task with custom field
		const task = await taskPage.createTask({
			title: 'Task with Custom Field',
			description: 'Has custom text field'
		});

		// Add custom field
		await page.getByTestId(`task-${task.id}`).click();
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field type/i).selectOption('text');
		await page.getByLabel(/field name/i).fill('Custom Note');
		await page.getByLabel(/field value/i).fill('Important information');
		await page.getByRole('button', { name: /save/i }).click();

		// Close and reopen task
		await page.getByRole('button', { name: /close/i }).click();
		await page.getByTestId(`task-${task.id}`).click();

		// Verify field persists
		await expect(page.getByText('Custom Note')).toBeVisible();
		await expect(page.getByText('Important information')).toBeVisible();
	});

	test('should persist custom number field', async ({ page }) => {
		const task = await taskPage.createTask({
			title: 'Task with Number Field'
		});

		// Add custom number field
		await page.getByTestId(`task-${task.id}`).click();
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field type/i).selectOption('number');
		await page.getByLabel(/field name/i).fill('Estimated Hours');
		await page.getByLabel(/field value/i).fill('8.5');
		await page.getByRole('button', { name: /save/i }).click();

		// Refresh page
		await page.reload();
		await page.waitForLoadState('domcontentloaded');

		// Open task
		await page.getByTestId(`task-${task.id}`).click();

		// Verify field value
		await expect(page.getByLabel('Estimated Hours')).toHaveValue('8.5');
	});

	test('should persist custom date field', async ({ page }) => {
		const task = await taskPage.createTask({
			title: 'Task with Date Field'
		});

		// Add custom date field
		await page.getByTestId(`task-${task.id}`).click();
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field type/i).selectOption('date');
		await page.getByLabel(/field name/i).fill('Review Date');
		await page.getByLabel(/field value/i).fill('2026-06-15');
		await page.getByRole('button', { name: /save/i }).click();

		// Switch to kanban and back
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');
		await page.getByRole('button', { name: /list/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Open task
		await page.getByTestId(`task-${task.id}`).click();

		// Verify date persists
		await expect(page.getByLabel('Review Date')).toHaveValue('2026-06-15');
	});

	test('should persist custom select/dropdown field', async ({ page }) => {
		const task = await taskPage.createTask({
			title: 'Task with Select Field'
		});

		// Add custom select field
		await page.getByTestId(`task-${task.id}`).click();
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field type/i).selectOption('select');
		await page.getByLabel(/field name/i).fill('Complexity');
		await page.getByLabel(/options/i).fill('Low, Medium, High');
		await page.getByRole('button', { name: /save/i }).click();

		// Select a value
		await page.getByLabel('Complexity').selectOption('High');
		await page.getByRole('button', { name: /save/i }).click();

		// Close task
		await page.getByRole('button', { name: /close/i }).click();

		// Reopen
		await page.getByTestId(`task-${task.id}`).click();

		// Verify selection persists
		await expect(page.getByLabel('Complexity')).toHaveValue('High');
	});

	test('should persist multiple custom fields', async ({ page }) => {
		const task = await taskPage.createTask({
			title: 'Task with Multiple Fields'
		});

		// Add multiple custom fields
		await page.getByTestId(`task-${task.id}`).click();
		
		// Field 1: Text
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field type/i).selectOption('text');
		await page.getByLabel(/field name/i).fill('Notes');
		await page.getByLabel(/field value/i).fill('Test notes');
		await page.getByRole('button', { name: /save/i }).click();

		// Field 2: Number
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field type/i).selectOption('number');
		await page.getByLabel(/field name/i).fill('Points');
		await page.getByLabel(/field value/i).fill('13');
		await page.getByRole('button', { name: /save/i }).click();

		// Field 3: Checkbox
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field type/i).selectOption('checkbox');
		await page.getByLabel(/field name/i).fill('Reviewed');
		await page.getByLabel('Reviewed').check();
		await page.getByRole('button', { name: /save/i }).click();

		// Refresh entire app
		await page.goto('/tasks');
		await page.waitForLoadState('domcontentloaded');

		// Reopen task
		await page.getByTestId(`task-${task.id}`).click();

		// Verify all fields persist
		await expect(page.getByText('Test notes')).toBeVisible();
		await expect(page.getByLabel('Points')).toHaveValue('13');
		await expect(page.getByLabel('Reviewed')).toBeChecked();
	});

	test('should persist custom fields after task update', async ({ page }) => {
		const task = await taskPage.createTask({
			title: 'Original Title',
			description: 'Original description'
		});

		// Add custom field
		await page.getByTestId(`task-${task.id}`).click();
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field name/i).fill('Status Note');
		await page.getByLabel(/field value/i).fill('Waiting for review');
		await page.getByRole('button', { name: /save/i }).click();

		// Update task title and description
		await page.getByLabel(/title/i).clear();
		await page.getByLabel(/title/i).fill('Updated Title');
		await page.getByLabel(/description/i).clear();
		await page.getByLabel(/description/i).fill('Updated description');
		await page.getByRole('button', { name: /save/i }).click();

		// Close and reopen
		await page.getByRole('button', { name: /close/i }).click();
		await page.getByTestId(`task-${task.id}`).click();

		// Verify custom field still exists
		await expect(page.getByText('Status Note')).toBeVisible();
		await expect(page.getByText('Waiting for review')).toBeVisible();
	});

	test('should preserve custom fields when moving task between stages', async ({ page }) => {
		const task = await taskPage.createTask({
			title: 'Movable Task with Fields',
			stage: 'todo'
		});

		// Add custom field
		await page.getByTestId(`task-${task.id}`).click();
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field name/i).fill('Notes');
		await page.getByLabel(/field value/i).fill('Keep this');
		await page.getByRole('button', { name: /save/i }).click();

		// Move to in_progress
		await page.getByLabel(/stage/i).selectOption('in_progress');
		await page.getByRole('button', { name: /save/i }).click();

		// Verify field persists
		await expect(page.getByText('Keep this')).toBeVisible();

		// Move to done
		await page.getByLabel(/stage/i).selectOption('done');
		await page.getByRole('button', { name: /save/i }).click();

		// Verify field still persists
		await expect(page.getByText('Keep this')).toBeVisible();
	});

	test('should handle custom field deletion', async ({ page }) => {
		const task = await taskPage.createTask({
			title: 'Task with Deletable Field'
		});

		// Add custom field
		await page.getByTestId(`task-${task.id}`).click();
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field name/i).fill('Temporary');
		await page.getByLabel(/field value/i).fill('Delete me');
		await page.getByRole('button', { name: /save/i }).click();

		// Delete the field
		await page.getByTestId('field-temporary-delete').click();
		await page.getByRole('button', { name: /confirm/i }).click();

		// Close and reopen
		await page.getByRole('button', { name: /close/i }).click();
		await page.getByTestId(`task-${task.id}`).click();

		// Verify field is gone
		await expect(page.getByText('Temporary')).not.toBeVisible();
		await expect(page.getByText('Delete me')).not.toBeVisible();
	});

	test('should display custom fields in kanban view', async ({ page }) => {
		const task = await taskPage.createTask({
			title: 'Task with Visible Field'
		});

		// Add custom field
		await page.getByTestId(`task-${task.id}`).click();
		await page.getByRole('button', { name: /add field/i }).click();
		await page.getByLabel(/field name/i).fill('Priority Level');
		await page.getByLabel(/field value/i).fill('Critical');
		await page.getByRole('button', { name: /save/i }).click();

		// Switch to kanban
		await page.getByRole('button', { name: /kanban/i }).click();
		await page.waitForLoadState('domcontentloaded');

		// Open task card
		await page.getByText('Task with Visible Field').click();

		// Verify custom field is shown
		await expect(page.getByText('Priority Level')).toBeVisible();
		await expect(page.getByText('Critical')).toBeVisible();
	});
});

test.describe('Custom Field Edge Cases', () => {
	test('should handle empty custom field values', async ({ page }) => {
		// TODO: Implement edge case test
		test.skip();
	});

	test('should handle very long custom field values', async ({ page }) => {
		// TODO: Implement edge case test
		test.skip();
	});

	test('should handle special characters in field names', async ({ page }) => {
		// TODO: Implement edge case test
		test.skip();
	});
});



