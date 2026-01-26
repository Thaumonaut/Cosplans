/**
 * Page Object Model Interface Contract
 * 
 * All E2E page objects MUST implement these patterns for consistency
 * and maintainability across the test suite.
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Base interface for all page objects
 */
export interface BasePage {
  /**
   * The Playwright page instance
   */
  readonly page: Page;
  
  /**
   * Navigate to this page
   */
  goto(): Promise<void>;
  
  /**
   * Wait for page to be fully loaded
   */
  waitForLoad(): Promise<void>;
  
  /**
   * Verify we're on the correct page
   */
  isOnPage(): Promise<boolean>;
}

/**
 * Login Page Object Contract
 */
export interface ILoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly oauthButtons: {
    github: Locator;
    google: Locator;
  };
  
  // Actions
  login(email: string, password: string): Promise<void>;
  loginWithGithub(): Promise<void>;
  loginWithGoogle(): Promise<void>;
  clickSignup(): Promise<void>;
  clickForgotPassword(): Promise<void>;
  
  // Assertions
  getErrorMessage(): Promise<string>;
  isLoginSuccessful(): Promise<boolean>;
}

/**
 * Dashboard Page Object Contract
 */
export interface IDashboardPage extends BasePage {
  // Locators
  readonly createProjectButton: Locator;
  readonly projectList: Locator;
  readonly statsWidgets: Locator;
  readonly welcomeMessage: Locator;
  readonly sidebar: Locator;
  
  // Actions
  clickCreateProject(): Promise<void>;
  navigateToSection(section: string): Promise<void>;
  searchProjects(query: string): Promise<void>;
  
  // Assertions
  getProjectCount(): Promise<number>;
  isProjectVisible(projectTitle: string): Promise<boolean>;
  getWelcomeMessage(): Promise<string>;
}

/**
 * Project Page Object Contract
 */
export interface IProjectPage extends BasePage {
  // Locators
  readonly projectTitle: Locator;
  readonly projectStatus: Locator;
  readonly budgetDisplay: Locator;
  readonly progressBar: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly archiveButton: Locator;
  
  // Actions
  editProject(updates: Partial<ProjectFormData>): Promise<void>;
  deleteProject(): Promise<void>;
  archiveProject(): Promise<void>;
  updateStatus(status: ProjectStatus): Promise<void>;
  
  // Assertions
  getProjectTitle(): Promise<string>;
  getProjectStatus(): Promise<ProjectStatus>;
  getBudgetSpent(): Promise<number>;
  getBudgetTotal(): Promise<number>;
  getProgress(): Promise<number>;
}

/**
 * Project Creation Form Contract
 */
export interface IProjectCreationForm {
  // Locators
  readonly titleInput: Locator;
  readonly characterInput: Locator;
  readonly seriesInput: Locator;
  readonly imageInput: Locator;
  readonly budgetTotalInput: Locator;
  readonly deadlineInput: Locator;
  readonly statusSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  
  // Actions
  fillForm(data: ProjectFormData): Promise<void>;
  submit(): Promise<void>;
  cancel(): Promise<void>;
  
  // Validation
  getValidationErrors(): Promise<string[]>;
  isSubmitEnabled(): Promise<boolean>;
}

/**
 * Task Management Page Contract
 */
export interface ITaskPage extends BasePage {
  // Locators
  readonly taskList: Locator;
  readonly createTaskButton: Locator;
  readonly filterButtons: Locator;
  readonly sortDropdown: Locator;
  
  // Actions
  createTask(task: TaskFormData): Promise<void>;
  filterTasks(filter: 'all' | 'completed' | 'pending' | 'overdue'): Promise<void>;
  sortTasks(sortBy: 'priority' | 'dueDate' | 'title'): Promise<void>;
  completeTask(taskTitle: string): Promise<void>;
  deleteTask(taskTitle: string): Promise<void>;
  
  // Assertions
  getTaskCount(filter?: string): Promise<number>;
  isTaskVisible(taskTitle: string): Promise<boolean>;
  isTaskCompleted(taskTitle: string): Promise<boolean>;
}

/**
 * Team Management Page Contract
 */
export interface ITeamPage extends BasePage {
  // Locators
  readonly teamList: Locator;
  readonly createTeamButton: Locator;
  readonly personalTeam: Locator;
  
  // Actions
  createTeam(name: string, description?: string): Promise<void>;
  selectTeam(teamName: string): Promise<void>;
  inviteMember(email: string, role: TeamRole): Promise<void>;
  removeMember(email: string): Promise<void>;
  
  // Assertions
  getTeamCount(): Promise<number>;
  isTeamVisible(teamName: string): Promise<boolean>;
  getMemberCount(teamName: string): Promise<number>;
}

/**
 * Type definitions for form data
 */
export interface ProjectFormData {
  title: string;
  character: string;
  series: string;
  image?: string;
  budgetTotal: number;
  deadline?: string;
  status: ProjectStatus;
}

export interface TaskFormData {
  title: string;
  description?: string;
  projectId?: number;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export type ProjectStatus = 'idea' | 'planning' | 'in-progress' | 'completed' | 'archived';
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Helper utilities that all page objects can use
 */
export interface PageHelpers {
  /**
   * Fill a text input with retry logic
   */
  fillInput(locator: Locator, value: string): Promise<void>;
  
  /**
   * Click a button with retry logic
   */
  clickButton(locator: Locator): Promise<void>;
  
  /**
   * Select an option from a dropdown
   */
  selectOption(locator: Locator, value: string): Promise<void>;
  
  /**
   * Wait for navigation to complete
   */
  waitForNavigation(action: () => Promise<void>): Promise<void>;
  
  /**
   * Take a screenshot with automatic naming
   */
  screenshot(name: string): Promise<void>;
  
  /**
   * Wait for API call to complete
   */
  waitForApiCall(urlPattern: string): Promise<void>;
}


