import { supabase } from "$lib/supabase";
import { get } from "svelte/store";
import { currentTeam } from "$lib/stores/teams";
import { taskStageService } from "./taskStageService";
import { subtaskService } from "./subtaskService";
import { taskCommentService } from "./taskCommentService";
import { taskAttachmentService } from "./taskAttachmentService";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskDetail,
} from "$lib/types/domain/task";

export const taskService = {
  /**
   * List all tasks for the current team (across all projects)
   * RLS policies automatically filter by team membership
   * Tasks are joined with task_stages to get stage information
   *
   * Note: RLS policies ensure users can only see tasks from teams they are active members of:
   * - Project-scoped tasks: visible if user is member of project's team
   * - Standalone tasks: visible if user is member of task's team_id
   */
  async listAll(filters?: {
    completed?: boolean;
    priority?: string;
  }): Promise<Task[]> {
    // Join with task_stages to get stage info and derive completion status
    // RLS policies automatically filter by team membership (no explicit team filter needed)
    // Use LEFT JOIN (!left) to include tasks without stages (shouldn't happen after migration, but handle gracefully)
    let query = (
      supabase.from("tasks").select(`
        *,
        task_stages(
          id,
          name,
          display_order,
          is_completion_stage
        )
      `) as any
    )
      .is("deleted_at", null) // Filter out soft-deleted tasks
      .order("created_at", { ascending: false });

    // Note: We can't filter on joined table fields with OR in PostgREST
    // So we fetch all and filter in application layer
    // The completed filter will be applied after fetch if provided
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map the data first
    let tasks = (data || []).map(mapTaskFromDbWithStage);

    // Apply completed filter in application layer (can't do it in PostgREST on joined fields)
    if (filters?.completed !== undefined) {
      tasks = tasks.filter((task) => task.completed === filters.completed);
    }

    // RLS policies ensure only tasks from user's teams are returned
    return tasks;
  },

  /**
   * List tasks for a project (optionally filter by resource)
   * If projectId is not provided, lists all standalone tasks for current team
   * Tasks are joined with task_stages to get stage information
   *
   * Note: RLS policies ensure tasks are filtered by team membership
   * - If projectId is provided: returns tasks for that project (must be in user's team)
   * - If projectId is null: returns standalone tasks where team_id is in user's teams
   */
  async list(filters?: {
    projectId?: string | null;
    resourceId?: string;
    stageId?: string;
  }): Promise<Task[]> {
    // Join with task_stages to get stage info
    // Use LEFT JOIN to include tasks without stages (shouldn't happen after migration, but handle gracefully)
    let query = (
      supabase.from("tasks").select(`
        *,
        task_stages(
          id,
          name,
          display_order,
          is_completion_stage
        )
      `) as any
    )
      .is("deleted_at", null) // Filter out soft-deleted tasks
      .order("created_at", { ascending: false });

    if (filters?.projectId !== undefined) {
      if (filters.projectId === null) {
        // List standalone tasks (no project)
        query = query.is("project_id", null);
      } else {
        // List tasks for a specific project
        query = query.eq("project_id", filters.projectId);
      }
    }

    if (filters?.resourceId !== undefined) {
      // If resourceId is provided (including null), filter by it
      query =
        filters.resourceId === null
          ? query.is("resource_id", null) // Project-level tasks
          : query.eq("resource_id", filters.resourceId); // Resource-specific tasks
    }

    if (filters?.stageId !== undefined) {
      query = query.eq("stage_id", filters.stageId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapTaskFromDbWithStage);
  },

  /**
   * Get a single task by ID
   * Joined with task_stages to get stage information
   */
  async get(id: string): Promise<Task | null> {
    const { data, error } = await (
      supabase.from("tasks").select(`
        *,
        task_stages(
          id,
          name,
          display_order,
          is_completion_stage
        )
      `) as any
    )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return mapTaskFromDbWithStage(data);
  },

  /**
   * Get task detail with all relations loaded (subtasks, comments, attachments)
   * Calculates subtask completion percentage
   */
  async getDetail(id: string): Promise<TaskDetail | null> {
    // Get base task
    const task = await this.get(id);
    if (!task) return null;

    // Load relations in parallel
    const [subtasks, comments, attachments] = await Promise.all([
      subtaskService.list(id).catch(() => []),
      taskCommentService.list(id).catch(() => []),
      taskAttachmentService.list(id).catch(() => []),
    ]);

    // Calculate subtask completion
    const total = subtasks.length;
    const completed = subtasks.filter((s) => s.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...task,
      subtasks,
      comments,
      attachments,
      subtaskCompletion: {
        completed,
        total,
        percentage,
      },
    };
  },

  /**
   * Create a new task
   */
  async create(task: TaskCreate): Promise<Task> {
    // Get current team for team_id and stage assignment
    const team = get(currentTeam);
    if (!team) {
      throw new Error("No active team selected");
    }

    // Determine team_id: use provided teamId or current active team
    let teamId = task.teamId || team.id;

    // For project-scoped tasks, derive team_id from project if not provided
    if (task.projectId && !teamId) {
      const { data: project } = await supabase
        .from("projects")
        .select("team_id")
        .eq("id", task.projectId)
        .single();
      if (project && "team_id" in project) {
        teamId = (project as any).team_id;
      }
    }

    if (!teamId) {
      throw new Error("Team ID is required for task creation");
    }

    // Determine stage_id: use provided or default to first non-completion stage
    let stageId = task.stageId;
    if (!stageId) {
      const stages = await taskStageService.list(teamId);
      const firstNonCompletion = stages.find((s) => !s.isCompletionStage);
      if (!firstNonCompletion) {
        // If no stages exist, this means the team was created before stages were auto-created
        // In this case, create defaults (but this should be rare)
        await taskStageService.ensureDefaults(teamId);
        const defaults = await taskStageService.list(teamId);
        stageId =
          defaults.find((s) => !s.isCompletionStage)?.id || defaults[0]?.id;
      } else {
        stageId = firstNonCompletion.id;
      }
    }

    if (!stageId) {
      throw new Error("Stage ID is required for task creation");
    }

    // Map camelCase to snake_case for database
    const insertData: Record<string, unknown> = {
      title: task.title,
      description: task.description || null,
      priority: task.priority || "medium",
      stage_id: stageId,
      team_id: teamId,
    };

    // Only include project_id if provided
    if (task.projectId !== undefined && task.projectId !== null) {
      insertData.project_id = task.projectId;
    }
    // Only include optional fields if they have values
    if (task.resourceId !== undefined && task.resourceId !== null) {
      insertData.resource_id = task.resourceId;
    }
    if (task.dueDate !== undefined && task.dueDate !== null) {
      insertData.due_date = task.dueDate;
    }
    if (task.assignedTo !== undefined && task.assignedTo !== null) {
      insertData.assigned_to = task.assignedTo;
    }

    const { data, error } = await (
      supabase.from("tasks").insert(insertData as any).select(`
            *,
            task_stages(
              id,
              name,
              display_order,
              is_completion_stage
            )
          `) as any
    ).single();

    if (error) {
      // Provide helpful error message for schema cache issues
      if (
        error.message?.includes("schema cache") ||
        error.code === "PGRST204" ||
        error.code === "PGRST205"
      ) {
        throw new Error(
          `Failed to create task: ${error.message}. ` +
            `This is a PostgREST schema cache issue. Please try refreshing the page and creating the task again.`,
        );
      }
      throw error;
    }

    return mapTaskFromDbWithStage(data);
  },

  /**
   * Update an existing task
   */
  async update(id: string, updates: TaskUpdate): Promise<Task> {
    // Map camelCase to snake_case for database
    const updateData: Record<string, unknown> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined)
      updateData.description = updates.description || null;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.assignedTo !== undefined)
      updateData.assigned_to = updates.assignedTo;

    // Handle stageId changes (for drag-and-drop kanban moves)
    if (updates.stageId !== undefined) {
      updateData.stage_id = updates.stageId;
    }

    // Handle projectId changes (moving task to different project)
    if (updates.projectId !== undefined) {
      updateData.project_id = updates.projectId || null;
      // If moving to a project, derive team_id from project
      if (updates.projectId) {
        const { data: project } = await supabase
          .from("projects")
          .select("team_id")
          .eq("id", updates.projectId)
          .single();
        if (project && "team_id" in project) {
          updateData.team_id = (project as any).team_id;
        }
      }
    }

    // Handle resourceId changes
    if (updates.resourceId !== undefined) {
      updateData.resource_id = updates.resourceId || null;
    }

    // DEPRECATED: Handle completed boolean (for backward compatibility)
    // Note: This should be replaced with stageId changes, but kept for transition period
    if (updates.completed !== undefined) {
      // Get current task to find appropriate stage
      const currentTask = await this.get(id);
      if (currentTask) {
        const team = get(currentTeam) || { id: currentTask.teamId };
        const stages = await taskStageService.list(team.id);
        const completionStage = stages.find((s) => s.isCompletionStage);
        const nonCompletionStage = stages.find((s) => !s.isCompletionStage);

        if (updates.completed && completionStage) {
          updateData.stage_id = completionStage.id;
        } else if (!updates.completed && nonCompletionStage) {
          updateData.stage_id = nonCompletionStage.id;
        }
      }
    }

    const { data, error } = await (supabase.from("tasks") as any)
      .update(updateData as any)
      .eq("id", id)
      .select(
        `
            *,
            task_stages(
              id,
              name,
              display_order,
              is_completion_stage
            )
          `,
      )
      .single();

    if (error) {
      // Provide helpful error message for schema cache issues
      if (
        error.message?.includes("schema cache") ||
        error.code === "PGRST204" ||
        error.code === "PGRST205"
      ) {
        throw new Error(
          `Failed to update task: ${error.message}. ` +
            `This is a PostgREST schema cache issue. Please try refreshing the page and updating the task again.`,
        );
      }
      throw error;
    }

    return mapTaskFromDbWithStage(data);
  },

  /**
   * Get task dependency counts
   * Returns counts of subtasks, resources, and projects linked to this task
   */
  async getDependencyCounts(id: string): Promise<{
    total: number;
    subtasks: number;
    resources: number;
    projects: number;
  }> {
    // Get dependency_count from task (auto-updated by triggers)
    const { data: task } = await supabase
      .from("tasks")
      .select("dependency_count")
      .eq("id", id)
      .single();

    // Get detailed counts
    const [subtasksCount, resourcesCount] = await Promise.all([
      // Count non-deleted subtasks
      supabase
        .from("subtasks")
        .select("id", { count: "exact", head: true })
        .eq("task_id", id)
        .is("deleted_at", null),
      // Count task resources if table exists
      supabase
        .rpc("count_task_resources", { task_id_param: id })
        .then(({ data }) => data || 0)
        .catch(() => 0),
    ]);

    const subtasks = subtasksCount.count || 0;
    const resources = resourcesCount || 0;
    const projects = 0; // Tasks don't have project dependencies in current schema

    return {
      total: task?.dependency_count || subtasks + resources + projects,
      subtasks,
      resources,
      projects,
    };
  },

  /**
   * Soft delete a task
   * Sets deleted_at and deleted_by fields instead of removing from database
   * Uses RPC function to bypass RLS restrictions
   */
  async softDelete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc("soft_delete_task", {
      task_id: id,
      user_id: userId,
    });

    if (error) throw error;
  },

  /**
   * Restore a soft-deleted task
   */
  async restore(id: string): Promise<Task> {
    const { data, error } = await (
      supabase
        .from("tasks")
        .update({
          deleted_at: null,
          deleted_by: null,
        })
        .eq("id", id).select(`
        *,
        task_stages(
          id,
          name,
          display_order,
          is_completion_stage
        )
      `) as any
    ).single();

    if (error) throw error;
    return mapTaskFromDbWithStage(data);
  },

  /**
   * Delete a task (hard delete - use with caution)
   * @deprecated Use softDelete instead
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Toggle task completion
   * DEPRECATED: Use moveToStage instead. Kept for backward compatibility.
   */
  async toggleComplete(id: string): Promise<Task> {
    // Get current state
    const task = await this.get(id);
    if (!task) throw new Error("Task not found");

    // Toggle completion via stage changes
    const team = get(currentTeam) || { id: task.teamId };
    const stages = await taskStageService.list(team.id);
    const completionStage = stages.find((s) => s.isCompletionStage);
    const nonCompletionStage = stages.find((s) => !s.isCompletionStage);

    if (task.completed && nonCompletionStage) {
      return await this.moveToStage(id, nonCompletionStage.id);
    } else if (!task.completed && completionStage) {
      return await this.moveToStage(id, completionStage.id);
    }

    // Fallback to old method if stages not found
    return await this.update(id, { completed: !task.completed });
  },

  /**
   * Move task to a different stage (for kanban drag-and-drop)
   */
  async moveToStage(taskId: string, stageId: string): Promise<Task> {
    return await this.update(taskId, { stageId });
  },
};

/**
 * Map database row (snake_case) to Task type (camelCase)
 * Includes stage information from joined task_stages table
 */
function mapTaskFromDbWithStage(row: any): Task {
  // Handle both joined format (row.task_stages can be an object or array) and flat format (row.stage_id)
  // PostgREST returns joined relations as arrays when using LEFT JOIN, as single object with INNER JOIN
  const stage = Array.isArray(row.task_stages)
    ? row.task_stages[0] || null
    : row.task_stages || (row.stage_id ? { id: row.stage_id } : null);
  const teamId = row.team_id || row.teamId || null;

  // Derive completed from stage.is_completion_stage, fallback to row.completed for backward compatibility
  const completed = stage?.is_completion_stage ?? row.completed ?? false;

  return {
    id: row.id,
    projectId: row.project_id ?? null,
    resourceId: row.resource_id ?? null,
    teamId: teamId || "", // Required field, empty string as fallback (should not happen after migration)
    stageId: row.stage_id || stage?.id || "", // Required field, empty string as fallback (should not happen after migration)
    title: row.title,
    description: row.description ?? undefined,
    completed, // DEPRECATED: Derived from stage
    dueDate: row.due_date ?? undefined,
    priority: row.priority || "medium",
    assignedTo: row.assigned_to ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Map database row (snake_case) to Task type (camelCase)
 * DEPRECATED: Use mapTaskFromDbWithStage instead. Kept for backward compatibility.
 */
function mapTaskFromDb(row: any): Task {
  return mapTaskFromDbWithStage(row);
}

// ========== ENHANCED METHODS FOR MODERN TASK UI ==========

/**
 * Extended task filtering with multiple criteria
 * Supports all new filter options from modern task UI
 */
export async function listWithFilters(filters: {
  teamId?: string;
  projectId?: string | null;
  stageIds?: string[];
  priorities?: string[];
  assignees?: string[];
  dateRange?: { start: string; end: string };
  search?: string;
  includeArchived?: boolean;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Task[]> {
  let query = (
    supabase.from("tasks").select(`
      *,
      task_stages(
        id,
        name,
        display_order,
        is_completion_stage
      )
    `) as any
  ).order("created_at", { ascending: false });

  // Filter out soft-deleted tasks unless explicitly included
  if (!filters.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  // Team filter
  if (filters.teamId) {
    query = query.eq("team_id", filters.teamId);
  }

  // Project filter (including null for standalone tasks)
  if (filters.projectId !== undefined) {
    if (filters.projectId === null) {
      query = query.is("project_id", null);
    } else {
      query = query.eq("project_id", filters.projectId);
    }
  }

  // Stage IDs filter (multiple stages)
  if (filters.stageIds && filters.stageIds.length > 0) {
    query = query.in("stage_id", filters.stageIds);
  }

  // Priorities filter (multiple priorities)
  if (filters.priorities && filters.priorities.length > 0) {
    query = query.in("priority", filters.priorities);
  }

  // Assignees filter (multiple assignees)
  if (filters.assignees && filters.assignees.length > 0) {
    query = query.in("assigned_to", filters.assignees);
  }

  // Date range filter (due date)
  if (filters.dateRange) {
    query = query.gte("due_date", filters.dateRange.start);
    query = query.lte("due_date", filters.dateRange.end);
  }

  // Search filter (title and description)
  if (filters.search && filters.search.trim()) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );
  }

  // Archived projects filter
  // Note: This requires joining with projects table to check archived status
  // For now, we'll handle this in application layer after fetching
  // TODO: Optimize with proper join once project archived field is confirmed

  // Pagination
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 50) - 1,
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []).map(mapTaskFromDbWithStage);
}

/**
 * Bulk update multiple tasks
 * Updates specified fields for all task IDs provided
 */
export async function bulkUpdate(
  taskIds: string[],
  updates: {
    stageId?: string;
    priority?: string;
    assignedTo?: string | null;
    dueDate?: string | null;
  },
): Promise<{ updated: number; failed: string[] }> {
  if (taskIds.length === 0) {
    return { updated: 0, failed: [] };
  }

  const dbUpdates: any = {};
  if (updates.stageId !== undefined) dbUpdates.stage_id = updates.stageId;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.assignedTo !== undefined)
    dbUpdates.assigned_to = updates.assignedTo;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(dbUpdates)
      .in("id", taskIds)
      .select();

    if (error) throw error;

    return {
      updated: data?.length || 0,
      failed: [],
    };
  } catch (error) {
    console.error("Bulk update failed:", error);
    return {
      updated: 0,
      failed: taskIds,
    };
  }
}

/**
 * Bulk delete multiple tasks
 */
export async function bulkDelete(
  taskIds: string[],
): Promise<{ deleted: number; failed: string[] }> {
  if (taskIds.length === 0) {
    return { deleted: 0, failed: [] };
  }

  try {
    const { error } = await supabase.from("tasks").delete().in("id", taskIds);

    if (error) throw error;

    return {
      deleted: taskIds.length,
      failed: [],
    };
  } catch (error) {
    console.error("Bulk delete failed:", error);
    return {
      deleted: 0,
      failed: taskIds,
    };
  }
}

// Add enhanced methods to taskService export
taskService.listWithFilters = listWithFilters;
taskService.bulkUpdate = bulkUpdate;
taskService.bulkDelete = bulkDelete;
