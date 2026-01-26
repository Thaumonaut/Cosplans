// ============================================================================
// Task Management API Contracts
// ============================================================================
// Type definitions for robust task management feature
// These types define the contract between frontend and Supabase backend

export type TaskPriority = 'low' | 'medium' | 'high'

// ============================================================================
// Tasks
// ============================================================================

/**
 * Task entity with stage-based completion
 */
export interface Task {
  id: string
  projectId?: string | null // null = standalone task, set = project task
  resourceId?: string | null // null = project-level task, set = resource-level task
  teamId: string // Required: either from project.team_id or tasks.team_id
  stageId: string // Required: current workflow stage (determines completion)
  title: string
  description?: string
  dueDate?: string | null // ISO date string (YYYY-MM-DD)
  priority: TaskPriority
  assignedTo?: string | null // user ID
  completed: boolean // DEPRECATED: Derived from stage.is_completion_stage. Kept for backward compatibility.
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

/**
 * Input for creating a new task
 */
export interface TaskCreate {
  projectId?: string | null // null = standalone task, set = project task
  resourceId?: string // Optional: resource-level task
  teamId?: string // Required if projectId is null (standalone task). Defaults to current active team.
  stageId?: string // Optional: defaults to first non-completion stage of team
  title: string
  description?: string
  dueDate?: string // ISO date string (YYYY-MM-DD)
  priority?: TaskPriority // Defaults to 'medium'
  assignedTo?: string // user ID
}

/**
 * Input for updating an existing task
 */
export interface TaskUpdate {
  stageId?: string // Change stage (for drag-and-drop kanban moves)
  title?: string
  description?: string
  dueDate?: string | null
  priority?: TaskPriority
  assignedTo?: string | null
  projectId?: string | null // Move to different project
  resourceId?: string | null // Move to different resource
}

/**
 * Filters for listing tasks
 */
export interface TaskFilters {
  projectId?: string | null // null = standalone tasks only, undefined = all tasks
  resourceId?: string // Filter by resource
  stageId?: string // Filter by stage
  teamId?: string // Filter by team (for multi-team view)
  priority?: TaskPriority
  assignedTo?: string | null // null = unassigned, undefined = all
  completed?: boolean // DEPRECATED: Use stageId filter instead
  dueBefore?: string // ISO date string - tasks due before this date
  dueAfter?: string // ISO date string - tasks due after this date
}

/**
 * Task list response with metadata
 */
export interface TaskListResponse {
  tasks: Task[]
  total: number
  filters: TaskFilters
}

// ============================================================================
// Task Stages
// ============================================================================

/**
 * Task stage entity (workflow stage)
 */
export interface TaskStage {
  id: string
  teamId: string
  name: string
  displayOrder: number
  isCompletionStage: boolean
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

/**
 * Input for creating a new task stage
 */
export interface TaskStageCreate {
  teamId: string
  name: string
  displayOrder: number
  isCompletionStage?: boolean // Defaults to false
}

/**
 * Input for updating a task stage
 */
export interface TaskStageUpdate {
  name?: string
  displayOrder?: number
  isCompletionStage?: boolean
}

// ============================================================================
// Service Interfaces (TypeScript)
// ============================================================================
// These interfaces define the contract for task service implementations

/**
 * Task Service - Handles all task-related operations
 */
export interface TaskService {
  /**
   * List tasks with optional filters
   * Defaults to current active team if no filters provided
   */
  list(filters?: TaskFilters): Promise<Task[]>

  /**
   * Get a single task by ID
   */
  get(id: string): Promise<Task | null>

  /**
   * Create a new task
   */
  create(task: TaskCreate): Promise<Task>

  /**
   * Update an existing task
   */
  update(id: string, updates: TaskUpdate): Promise<Task>

  /**
   * Delete a task
   */
  delete(id: string): Promise<void>

  /**
   * Move task to a different stage (for kanban drag-and-drop)
   */
  moveToStage(taskId: string, stageId: string): Promise<Task>

  /**
   * Toggle task completion (DEPRECATED: Use moveToStage instead)
   * Kept for backward compatibility
   */
  toggleComplete(id: string): Promise<Task>
}

/**
 * Task Stage Service - Handles stage configuration
 */
export interface TaskStageService {
  /**
   * List all stages for a team (ordered by displayOrder)
   */
  list(teamId: string): Promise<TaskStage[]>

  /**
   * Get a single stage by ID
   */
  get(id: string): Promise<TaskStage | null>

  /**
   * Create a new stage
   */
  create(stage: TaskStageCreate): Promise<TaskStage>

  /**
   * Update an existing stage
   */
  update(id: string, updates: TaskStageUpdate): Promise<TaskStage>

  /**
   * Delete a stage (fails if tasks reference it)
   */
  delete(id: string): Promise<void>

  /**
   * Reorder stages (update displayOrder for multiple stages)
   */
  reorder(teamId: string, stageIds: string[]): Promise<TaskStage[]>

  /**
   * Get default stages for a team (creates if they don't exist)
   */
  ensureDefaults(teamId: string): Promise<TaskStage[]>
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Task-related errors
 */
export class TaskError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'TaskError'
  }
}

/**
 * Task stage-related errors
 */
export class TaskStageError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'TaskStageError'
  }
}

// Error codes
export const TaskErrorCodes = {
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  TASK_UNAUTHORIZED: 'TASK_UNAUTHORIZED',
  INVALID_STAGE: 'INVALID_STAGE',
  INVALID_TEAM: 'INVALID_TEAM',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  STAGE_DELETION_BLOCKED: 'STAGE_DELETION_BLOCKED',
  NO_COMPLETION_STAGE: 'NO_COMPLETION_STAGE',
} as const


