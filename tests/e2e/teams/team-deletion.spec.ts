import { test, expect } from "@playwright/test";
import {
  getTestUserCredentials,
  FIXED_TEST_USERS,
} from "../fixtures/test-users";
import { LoginPage } from "../support/page-objects/LoginPage";
import { DashboardPage } from "../support/page-objects/DashboardPage";

test.describe("Team Deletion & Ownership Transfer", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // Login as Charlie (Owner of Shared Team)
    const creds = getTestUserCredentials("charlie");
    await loginPage.goto();
    await loginPage.login(creds.email, creds.password);
  });

  test("Owner cannot delete team with active members without transfer", async ({
    page,
  }) => {
    // 1. Create a dedicated team for this test
    await page.goto("/teams");
    await page.getByRole("button", { name: /new team/i }).click();
    await page.getByPlaceholder("Team name").fill("Termination Test Team");
    await page.getByRole("button", { name: /create/i, exact: true }).click();

    // Wait for team to be selected and members loaded
    await expect(page.getByText("Termination Test Team")).toBeVisible();
    await expect(page.getByText("Members")).toBeVisible();

    // 2. Invite "Bob" (bob@test.com) - ensures members count > 0
    const inviteButton = page.getByRole("button", { name: /invite/i });
    await expect(inviteButton).toBeVisible();
    await inviteButton.click();

    await page.getByPlaceholder("Email address").fill("bob@test.com");
    // Select role (default is editor, which is fine)
    await page.getByRole("button", { name: /invite/i, exact: true }).click();

    // 3. Verify member appears (invited)
    await expect(page.getByText("bob@test.com")).toBeVisible();

    // 4. Try to Delete Team
    const deleteButton = page.getByRole("button", { name: /delete team/i });
    await expect(deleteButton).toBeEnabled();
    await deleteButton.click();

    // Expect prevention warning
    await expect(page.getByText(/cannot delete/i)).toBeVisible();

    // 5. Transfer Ownership
    const transferButton = page.getByRole("button", {
      name: /transfer ownership/i,
    });
    await expect(transferButton).toBeVisible();
    await transferButton.click();

    // Dialog should open
    await expect(
      page.getByRole("dialog", { name: /transfer team ownership/i }),
    ).toBeVisible();

    // Select Bob
    // The Select component usually acts as a combobox or has a trigger
    // We look for the Select trigger
    const selectTrigger = page
      .locator('button[role="combobox"]')
      .or(page.locator("[data-state]")); // Generic fallback
    // Or better: Use the label "New Owner"
    await page.getByLabel("New Owner").click();

    // Select the option for Bob
    await page.getByRole("option").filter({ hasText: /bob/i }).click();

    // Confirm Transfer
    await page.getByRole("button", { name: /confirm transfer/i }).click();

    // 6. Verify success
    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // "Danger Zone" should disappear or Delete button gone
    await expect(deleteButton).not.toBeVisible();

    // Verify we are no longer owner - check roles or UI
    // Reload to be sure
    await page.reload();
    await expect(deleteButton).not.toBeVisible();
  });
});
