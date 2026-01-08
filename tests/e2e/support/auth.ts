import { Page, expect } from '@playwright/test';

/**
 * Login if needed for E2E tests
 * 
 * Checks if user is authenticated, and if not, performs login using environment variables
 * from `.env.test` (configured in playwright.config.ts).
 * 
 * Looks for email/password in any of these variable names:
 * - TEST_EMAIL / TEST_PASSWORD
 * - EMAIL / PASSWORD
 * - TEST_USER_EMAIL / TEST_USER_PASSWORD
 * - E2E_EMAIL / E2E_PASSWORD
 */
export async function loginIfNeeded(page: Page): Promise<boolean> {
  // Try multiple common variable name patterns (whatever exists in .env.test)
  const email =
    process.env.TEST_EMAIL ||
    process.env.EMAIL ||
    process.env.TEST_USER_EMAIL ||
    process.env.E2E_EMAIL;

  const password =
    process.env.TEST_PASSWORD ||
    process.env.PASSWORD ||
    process.env.TEST_USER_PASSWORD ||
    process.env.E2E_PASSWORD;

  // Log which variables were found (for debugging/validation)
  const foundVars = [];
  if (process.env.TEST_EMAIL) foundVars.push('TEST_EMAIL');
  else if (process.env.EMAIL) foundVars.push('EMAIL');
  else if (process.env.TEST_USER_EMAIL) foundVars.push('TEST_USER_EMAIL');
  else if (process.env.E2E_EMAIL) foundVars.push('E2E_EMAIL');

  if (email && password) {
    console.log(`[loginIfNeeded] Using credentials from: ${foundVars.join(' / ')}`);
    console.log(`[loginIfNeeded] Email: ${email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`); // Mask email but show first 2 chars
  }

  // If no creds provided, skip login (tests may work without auth)
  if (!email || !password) {
    console.warn('[loginIfNeeded] No E2E credentials found. Checked: TEST_EMAIL, EMAIL, TEST_USER_EMAIL, E2E_EMAIL');
    console.warn('[loginIfNeeded] Skipping login - tests may fail if authentication is required');
    return false;
  }

  // Wait for page to settle - use domcontentloaded instead of networkidle for reliability
  await page.waitForLoadState('domcontentloaded');
  const currentUrl = page.url();

  // Check if we're already authenticated by looking for authenticated indicators
  // If we're not on login and page has loaded, assume we're authenticated
  if (!currentUrl.includes('/login') && currentUrl !== 'about:blank') {
    // Wait a bit to see if we get redirected to login
    try {
      await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 2000 });
      // Not redirected to login, assume authenticated
      return false;
    } catch {
      // Was redirected to login, continue with login flow
    }
  }

  // Navigate to login page if not already there
  if (!currentUrl.includes('/login')) {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
  }

  // Wait for login form to be ready
  await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#password', { state: 'visible', timeout: 10000 });

  // Fill in credentials
  await page.fill('#email', email);
  await page.fill('#password', password);

  // Submit form and wait for navigation away from login
  await Promise.all([
    page.waitForURL(/^(?!.*\/login).*$/, { timeout: 15000 }).catch(() => {
      throw new Error('Login did not redirect away from login page');
    }),
    page.click('button[type="submit"]')
  ]);

  // Check for error message if still on login page
  if (page.url().includes('/login')) {
    const errorMsg = await page.locator('.text-red-800').textContent().catch(() => null);
    if (errorMsg) {
      console.error(`[loginIfNeeded] Login failed with error: ${errorMsg}`);
      throw new Error(`Login failed: ${errorMsg}`);
    }
  }

  // Verify we're not on login page anymore
  await expect(page).not.toHaveURL(/\/login/);

  // Wait for main content to be visible (more reliable than networkidle)
  await page.waitForSelector('main', { state: 'visible', timeout: 10000 }).catch(() => {
    // Main element might not exist, that's ok
    console.log('[loginIfNeeded] main element not found, continuing');
  });

  return true;
}


