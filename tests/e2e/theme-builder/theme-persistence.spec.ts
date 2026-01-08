import { test, expect } from '@playwright/test';
import { loginIfNeeded } from '../support/auth';

test.describe.configure({ mode: 'serial' });

test.describe('Theme Builder - Persistence', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/theme-builder', { waitUntil: 'domcontentloaded' });
        await loginIfNeeded(page);

        // Ensure we are on Theme Builder (login might have redirected elsewhere)
        if (!page.url().includes('/theme-builder')) {
            await page.goto('/theme-builder', { waitUntil: 'domcontentloaded' });
        }

        await expect(page.getByRole('heading', { name: 'Theme Builder', level: 1 }).first()).toBeVisible();
    });

    test('should save and persist theme across reloads', async ({ page }) => {
        // Handle "unsaved changes" dialogs if they appear
        page.on('dialog', async dialog => {
            console.log(`Dialog appeared: ${dialog.message()}`);
            await dialog.accept();
        });

        // 1. Set Theme Name
        const themeNameInput = page.locator('#theme-name');
        await expect(themeNameInput).toBeVisible();
        const testName = `Persist Test ${Date.now()}`;
        await themeNameInput.fill(testName);

        // 2. Modify a variable (e.g. Primary Color)
        const searchInput = page.getByPlaceholder('Search variables...');
        await searchInput.fill('--theme-primary');

        // Wait for search results
        const primaryRow = page.locator('.variable-editor-row').filter({ has: page.locator('code', { hasText: /^primary$/ }) });
        await expect(primaryRow).toBeVisible();

        // Check initial value to ensure we are changing it
        const colorInput = primaryRow.locator('input[type="text"]:visible');
        await expect(colorInput).toBeVisible();
        const newColor = '#123456';
        await colorInput.fill(newColor);

        // 3. Save Theme
        await page.getByRole('button', { name: 'Save Theme' }).click();

        // 4. Reload Page
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Theme Builder', level: 1 }).first()).toBeVisible();

        // 5. Verify Persistence
        await expect(themeNameInput).toHaveValue(testName);

        // Re-search to verify value
        await searchInput.fill('--theme-primary');
        await expect(primaryRow).toBeVisible();
        await expect(colorInput).toHaveValue(newColor);
    });

    test('should delete a saved theme', async ({ page }) => {
        page.on('dialog', async dialog => {
            console.log(`Dialog appeared: ${dialog.message()}`);
            await dialog.accept();
        });

        // 1. Create and Save a theme to delete
        const themeNameInput = page.locator('#theme-name');
        const testName = `Delete Test ${Date.now()}`;
        await themeNameInput.fill(testName);
        await page.getByRole('button', { name: 'Save Theme' }).click();

        // 2. Verify Delete button appears
        const deleteBtn = page.getByRole('button', { name: 'Delete' });
        await expect(deleteBtn).toBeVisible();

        // 3. Click Delete
        await deleteBtn.click();

        // 4. Verify reset
        // After delete, it initializes default theme. Name should not be the old name.
        await expect(themeNameInput).not.toHaveValue(testName);
        // Default name is "My Custom Theme"
        await expect(themeNameInput).toHaveValue('My Custom Theme');

        // Delete button should be hidden (new unsaved theme)
        await expect(deleteBtn).toBeHidden();
    });
});
