/**
 * Task Page Object Model
 * Extended for 004-bugfix-testing E2E tests
 */

import type { Page, Locator } from "@playwright/test";
import { clickButton, fillInput, selectOption } from "../helpers";

export class TaskPage {
  readonly page: Page;
  readonly taskList: Locator;
  readonly createTaskButton: Locator;
  readonly filterButtons: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.taskList = page.locator('[data-testid="task-list"]');
    this.createTaskButton = page.locator("button", {
      hasText: /create task|new task|add task/i,
    });
    this.filterButtons = page.locator('[data-testid="filter-buttons"]');
    this.sortDropdown = page.locator("#sort");
  }

  async goto(): Promise<void> {
    await this.page.goto("/tasks");
  }

  /**
   * Create a new task
   */
  async createTask(task: {
    title: string;
    description?: string;
    priority?: string;
    stage?: string;
    due_date?: string;
  }): Promise<{ id: string; title: string }> {
    // Click create button with timeout
    try {
      await this.createTaskButton.waitFor({ state: "visible", timeout: 5000 });
      await clickButton(this.createTaskButton);
    } catch (error) {
      throw new Error(`Failed to find create task button: ${error}`);
    }

    // Fill form fields
    await fillInput(
      this.page.locator("#title").or(this.page.getByLabel(/title/i)),
      task.title,
    );

    if (task.description) {
      await fillInput(
        this.page
          .locator("#description")
          .or(this.page.getByLabel(/description/i)),
        task.description,
      );
    }
    if (task.priority) {
      await selectOption(
        this.page.locator("#priority").or(this.page.getByLabel(/priority/i)),
        task.priority,
      );
    }
    if (task.stage) {
      await selectOption(
        this.page.locator("#stage").or(this.page.getByLabel(/stage/i)),
        task.stage,
      );
    }
    if (task.due_date) {
      await fillInput(
        this.page.locator("#due_date").or(this.page.getByLabel(/due date/i)),
        task.due_date,
      );
    }

    // Submit form
    await clickButton(
      this.page
        .locator('button[type="submit"]')
        .or(this.page.getByRole("button", { name: /create|save/i })),
    );

    // Wait for success indication (multiple strategies)
    try {
      // Strategy 1: Wait for success toast
      await this.page
        .getByText(/created|success|saved/i)
        .waitFor({ state: "visible", timeout: 3000 });
    } catch {
      // Strategy 2: Wait for dom content loaded
      await this.page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    }

    // Get task ID (multiple strategies)
    let taskId = "unknown";

    // Strategy 1: Check if URL contains task ID
    const url = this.page.url();
    const urlMatch = url.match(/tasks\/([a-f0-9-]+)/);
    if (urlMatch) {
      taskId = urlMatch[1];
    } else {
      // Strategy 2: Find task element by title and get ID attribute
      try {
        const taskElement = this.page
          .getByText(task.title, { exact: false })
          .first();
        await taskElement.waitFor({ state: "visible", timeout: 3000 });

        // Try data-task-id attribute
        const taskIdAttr = await taskElement.getAttribute("data-task-id");
        if (taskIdAttr) {
          taskId = taskIdAttr;
        } else {
          // Try finding parent with data-testid
          const parent = taskElement
            .locator("xpath=ancestor::*[@data-testid]")
            .first();
          const testId = await parent
            .getAttribute("data-testid")
            .catch(() => null);
          if (testId) {
            const idMatch = testId.match(/task-([a-f0-9-]+)/);
            if (idMatch) {
              taskId = idMatch[1];
            }
          }
        }
      } catch (error) {
        console.warn(
          `Could not determine task ID for "${task.title}". Tests will use title-based selectors.`,
        );
      }
    }

    return { id: taskId, title: task.title };
  }

  /**
   * Filter tasks
   */
  async filterTasks(
    filter: "all" | "completed" | "pending" | "overdue",
  ): Promise<void> {
    await clickButton(
      this.filterButtons.locator(`button`, {
        hasText: new RegExp(filter, "i"),
      }),
    );
  }

  /**
   * Sort tasks
   */
  async sortTasks(sortBy: "priority" | "dueDate" | "title"): Promise<void> {
    await selectOption(this.sortDropdown, sortBy);
  }

  /**
   * Complete a task
   */
  async completeTask(taskTitle: string): Promise<void> {
    const task = this.taskList.locator(`text=${taskTitle}`);
    const checkbox = task.locator("..").locator('input[type="checkbox"]');
    await checkbox.check();
  }

  /**
   * Delete a task (new method with confirmation support)
   */
  async deleteTask(
    taskId: string,
    options?: { confirm?: boolean },
  ): Promise<void> {
    // Try multiple strategies to find delete button
    let deleteBtn;

    try {
      // Strategy 1: Direct delete button
      deleteBtn = this.page.getByTestId(`task-${taskId}-delete`);
      await deleteBtn.waitFor({ state: "visible", timeout: 2000 });
    } catch {
      try {
        // Strategy 2: Actions menu with delete option
        const actionsBtn = this.page.getByTestId(`task-${taskId}-actions`);
        await actionsBtn.waitFor({ state: "visible", timeout: 2000 });
        await actionsBtn.click();
        await this.page.waitForTimeout(300); // Wait for menu to open
        deleteBtn = this.page.getByRole("button", { name: /delete/i });
        await deleteBtn.waitFor({ state: "visible", timeout: 2000 });
      } catch {
        // Strategy 3: Fallback error
        throw new Error(
          `Could not find delete button for task ${taskId}. Ensure task has data-testid="task-${taskId}-delete" or data-testid="task-${taskId}-actions"`,
        );
      }
    }

    await clickButton(deleteBtn);

    if (options?.confirm !== undefined) {
      // Wait for confirmation modal with timeout
      try {
        const dialog = this.page.getByRole("dialog");
        await dialog.waitFor({ state: "visible", timeout: 3000 });

        if (options.confirm) {
          // Confirm deletion
          const confirmBtn = this.page.getByRole("button", {
            name: /confirm|delete/i,
          });
          await confirmBtn.waitFor({ state: "visible", timeout: 2000 });
          await clickButton(confirmBtn);
        } else {
          // Cancel deletion
          const cancelBtn = this.page.getByRole("button", { name: /cancel/i });
          await cancelBtn.waitFor({ state: "visible", timeout: 2000 });
          await clickButton(cancelBtn);
        }
      } catch (error) {
        throw new Error(`Delete confirmation dialog did not appear: ${error}`);
      }
    }
  }

  /**
   * Delete task by title (legacy method)
   */
  async deleteTaskByTitle(taskTitle: string): Promise<void> {
    const task = this.taskList.locator(`text=${taskTitle}`);
    const deleteBtn = task
      .locator("..")
      .locator("button", { hasText: /delete/i });
    await clickButton(deleteBtn);
  }

  /**
   * Add a subtask to a task
   */
  async addSubtask(
    taskId: string,
    subtask: { title: string },
  ): Promise<{ id: string }> {
    // Open task detail
    await this.page.getByTestId(`task-${taskId}`).click();

    // Add subtask
    await clickButton(this.page.getByRole("button", { name: /add subtask/i }));
    await fillInput(this.page.getByLabel(/subtask title/i), subtask.title);
    await this.page.keyboard.press("Enter");

    // Get subtask ID
    await this.page.waitForTimeout(500); // Wait for subtask to be created
    const subtaskElement = this.page.getByText(subtask.title).first();
    const subtaskId =
      (await subtaskElement.getAttribute("data-subtask-id")) || "unknown";

    return { id: subtaskId };
  }

  /**
   * Attach a resource to a task
   */
  async attachResource(
    taskId: string,
    resource: { name: string },
  ): Promise<void> {
    // Open task detail
    await this.page.getByTestId(`task-${taskId}`).click();

    // Attach resource
    await clickButton(
      this.page.getByRole("button", { name: /attach resource/i }),
    );
    await this.page.getByText(resource.name).click();
    await clickButton(this.page.getByRole("button", { name: /attach/i }));
  }

  /**
   * Get task count
   */
  async getTaskCount(): Promise<number> {
    return await this.taskList.locator('[data-testid="task-item"]').count();
  }

  /**
   * Check if task is visible
   */
  async isTaskVisible(taskTitle: string): Promise<boolean> {
    try {
      await this.taskList
        .locator(`text=${taskTitle}`)
        .waitFor({ state: "visible", timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if task is completed
   */
  async isTaskCompleted(taskTitle: string): Promise<boolean> {
    const task = this.taskList.locator(`text=${taskTitle}`);
    const checkbox = task.locator("..").locator('input[type="checkbox"]');
    return await checkbox.isChecked();
  }
}
