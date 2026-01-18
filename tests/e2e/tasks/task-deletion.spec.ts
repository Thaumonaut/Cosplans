/**
 * E2E Tests: Task Deletion with Dependency Confirmation
 * Feature: 004-bugfix-testing - User Story 1
 * Tests soft delete with dependency counts and confirmation modal
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../support/page-objects/LoginPage";
import { TaskPage } from "../support/page-objects/TaskPage";

test.describe("Task Deletion with Dependencies", () => {
  let loginPage: LoginPage;
  let taskPage: TaskPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    taskPage = new TaskPage(page);

    // Login as test user
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || "test@example.com",
      process.env.TEST_USER_PASSWORD || "testpassword",
    );

    // Navigate to tasks
    await page.goto("/tasks");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should show confirmation modal when deleting task without dependencies", async ({
    page,
  }) => {
    // Create a simple task
    await taskPage.createTask({
      title: "Test Task for Deletion",
      description: "This task will be deleted",
    });

    // Find and click delete button
    await page.getByTestId("task-actions").click();
    await page.getByRole("button", { name: /delete/i }).click();

    // Check confirmation modal appears
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/are you sure/i)).toBeVisible();

    // Dependency count should be 0
    await expect(page.getByText(/0 dependencies/i)).toBeVisible();
  });

  test.skip("should show dependency count in confirmation modal", async ({
    page,
  }) => {
    // TODO: Enable this test once subtask creation UI is implemented
    // Create a task with subtasks (dependencies)
    const parentTask = await taskPage.createTask({
      title: "Parent Task with Dependencies",
      description: "This task has subtasks",
    });

    // Add 2 subtasks
    await taskPage.addSubtask(parentTask.id, { title: "Subtask 1" });
    await taskPage.addSubtask(parentTask.id, { title: "Subtask 2" });

    // Try to delete parent task
    await page.getByTestId(`task-${parentTask.id}-actions`).click();
    await page.getByRole("button", { name: /delete/i }).click();

    // Check confirmation modal shows dependency count
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/2 dependencies/i)).toBeVisible();
    await expect(page.getByText(/subtasks/i)).toBeVisible();
  });

  test("should cancel deletion and keep task", async ({ page }) => {
    // Create a task
    const task = await taskPage.createTask({
      title: "Task to Keep",
      description: "This task will not be deleted",
    });

    // Open delete modal
    await page.getByTestId(`task-${task.id}-actions`).click();
    await page.getByRole("button", { name: /delete/i }).click();

    // Cancel deletion
    await page.getByRole("button", { name: /cancel/i }).click();

    // Verify task still exists
    await expect(page.getByText("Task to Keep")).toBeVisible();
  });

  test("should soft delete task when confirmed", async ({ page }) => {
    // Create a task
    const task = await taskPage.createTask({
      title: "Task to Delete",
      description: "This task will be soft deleted",
    });

    // Delete task
    await page.getByTestId(`task-${task.id}-actions`).click();
    await page.getByRole("button", { name: /delete/i }).click();
    await page.getByRole("button", { name: /confirm|delete/i }).click();

    // Wait for deletion to complete
    await page.waitForLoadState("domcontentloaded");

    // Verify task is no longer visible in list
    await expect(page.getByText("Task to Delete")).not.toBeVisible();

    // Verify success toast
    await expect(page.getByText(/deleted successfully/i)).toBeVisible();
  });

  test("should not show deleted tasks in default view", async ({ page }) => {
    // Create and delete a task
    const task = await taskPage.createTask({
      title: "Task to Hide",
      description: "This should not appear after deletion",
    });

    await taskPage.deleteTask(task.id, { confirm: true });

    // Refresh page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Verify task is not in list
    await expect(page.getByText("Task to Hide")).not.toBeVisible();
  });

  test("should prevent deletion of task with resources", async ({ page }) => {
    // Create a task and add resource
    const task = await taskPage.createTask({
      title: "Task with Resource",
      description: "Has an attached resource",
    });

    await taskPage.attachResource(task.id, { name: "Test Resource" });

    // Try to delete
    await page.getByTestId(`task-${task.id}-actions`).click();
    await page.getByRole("button", { name: /delete/i }).click();

    // Should show dependency warning
    await expect(page.getByText(/1 dependency/i)).toBeVisible();
    await expect(page.getByText(/resource/i)).toBeVisible();
  });

  test("should update dependency count after removing subtask", async ({
    page,
  }) => {
    // Create task with 2 subtasks
    const parentTask = await taskPage.createTask({
      title: "Parent Task",
      description: "Has subtasks",
    });

    const subtask1 = await taskPage.addSubtask(parentTask.id, {
      title: "Subtask 1",
    });
    await taskPage.addSubtask(parentTask.id, { title: "Subtask 2" });

    // Delete one subtask
    await taskPage.deleteTask(subtask1.id, { confirm: true });

    // Try to delete parent - should show 1 dependency now
    await page.getByTestId(`task-${parentTask.id}-actions`).click();
    await page.getByRole("button", { name: /delete/i }).click();

    await expect(page.getByText(/1 dependency/i)).toBeVisible();
  });

  test("should preserve deleted_by user ID", async ({ page }) => {
    // Create task
    const task = await taskPage.createTask({
      title: "Task to Track Deletion",
      description: "Track who deleted this",
    });

    // Delete task
    await taskPage.deleteTask(task.id, { confirm: true });

    // Verify via API that deleted_by is set (admin check)
    const response = await page.request.get(
      `/api/tasks/${task.id}?include_deleted=true`,
    );
    const data = await response.json();

    expect(data.deleted_at).toBeTruthy();
    expect(data.deleted_by).toBeTruthy();
  });
});

test.describe("Task Deletion Permissions", () => {
  test("should only allow task creator or admin to delete", async ({
    page,
  }) => {
    // TODO: Implement after auth/permission system is finalized
    test.skip();
  });

  test("should hide delete button for non-owners", async ({ page }) => {
    // TODO: Implement after auth/permission system is finalized
    test.skip();
  });
});
