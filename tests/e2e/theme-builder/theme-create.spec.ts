import { test, expect } from '@playwright/test';
import { loginIfNeeded } from '../support/auth';

test.describe('Theme Builder - Creation & Preview', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to theme builder
        await page.goto('/theme-builder', { waitUntil: 'domcontentloaded' });

        // Ensure user is logged in
        await loginIfNeeded(page);

        // Wait for page to be ready
        await expect(page.getByRole('heading', { name: 'Theme Builder', level: 1 }).first()).toBeVisible();
    });

    test('should create a new theme and update preview', async ({ page }) => {
        // 1. Setup dialog handler
        page.on('dialog', async dialog => {
            console.log(`Dialog appeared: ${dialog.message()}`);
            await dialog.accept();
        });

        // 2. Click "New Theme" button
        await page.getByRole('button', { name: 'New Theme' }).click();

        // 3. Verify form reset
        const themeNameInput = page.locator('#theme-name');
        await expect(themeNameInput).toBeVisible();
        await expect(themeNameInput).toHaveValue('My Custom Theme');

        // 4. Modify Primary color variable
        const searchInput = page.getByPlaceholder('Search variables...');
        await expect(searchInput).toBeVisible();
        await searchInput.fill('--theme-primary');

        // Wait for list to filter down to 1 row (plus maybe related variations if they match)
        // The search is broad "includes", so --theme-primary-foreground might also show up.
        // But --theme-primary is definitely there.
        // Let's just wait for AT LEAST one row.
        const matchingRows = page.locator('.variable-editor-row');
        await expect(matchingRows.first()).toBeVisible();

        // Find the row that strictly contains "primary" code
        // We target the code element which displays the variable name stripped of prefix
        // code content: {varName.replace('--theme-', '')} -> 'primary'
        const primaryRow = matchingRows.filter({ has: page.locator('code', { hasText: /^primary$/ }) });

        await expect(primaryRow).toBeVisible();

        // Find the VISIBLE text input in that specific row
        const colorTextInput = primaryRow.locator('input[type="text"]:visible');

        // Type a specific color value
        const newColor = '#ff0000'; // Red
        await colorTextInput.fill(newColor);

        // 5. Verify value updated
        await expect(colorTextInput).toHaveValue(newColor);

        // 6. Save the theme
        await page.getByRole('button', { name: 'Save Theme' }).click();

        // 7. Verify persistence
        await page.reload();
        await expect(page.locator('#theme-name')).toHaveValue('My Custom Theme');
    });
});
