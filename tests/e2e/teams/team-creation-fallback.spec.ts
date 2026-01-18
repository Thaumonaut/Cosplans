import { test, expect } from "@playwright/test";
import { LoginPage } from "../support/page-objects/LoginPage";

test.describe("Team Creation Fallback", () => {
  let loginPage: LoginPage;

  test("New user automatically gets a personal team", async ({ page }) => {
    // Signup flow
    await page.goto("/signup");

    const email = `test.new.user.${Date.now()}@example.com`;
    const password = "Password123!";

    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email Address").fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.getByRole("button", { name: /create account/i }).click();

    // Wait a moment for page to process signup
    await page.waitForTimeout(1000);

    // Check if we're redirected or if email verification is required
    const currentUrl = page.url();
    if (currentUrl.includes("dashboard") || currentUrl.includes("onboarding")) {
      // Successfully redirected, no email verification needed
    } else {
      // Still on signup page - check for verification message or login
      const verificationMessage = page.getByText(
        /check your email|verify|verification/i,
      );
      const hasVerificationMessage = await verificationMessage
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (hasVerificationMessage || currentUrl.includes("signup")) {
        // Email verification required - manually log in the user
        loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(email, password);
        await expect(page).toHaveURL(/.*(dashboard|onboarding|teams)/);
      }
    }

    // Check for Personal Team
    await page.goto("/teams");
    // Using loose text matching for "User's Team" or "Personal Team"
    await expect(page.getByText(/Team/)).toBeVisible();

    // Verify it is "Personal" type
    await expect(page.getByText("Personal")).toBeVisible();
  });
});
