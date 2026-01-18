/**
 * Task Service
 * 
 * Core task management service that extends existing task functionality
 * with rich relations (subtasks, comments, attachments, notifications, custom fields, labels).
 */

import { BaseService, type ServiceResponse } from './supabase';
import type { TaskDetail, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '$lib/types/tasks';
import { CreateTaskRequestSchema, UpdateTaskRequestSchema } from '$lib/schemas/tasks';
import { SubtaskService } from './subtask-service';
import { NotificationService } from './notification-service';

export class TaskService extends BaseService {
	private subtaskService: SubtaskService;
	private notificationService: NotificationService;

	constructor(client?: any) {
		super(client);
		this.subtaskService = new SubtaskService(client);
		this.notificationService = new NotificationService(client);
	}

	/**
	 * Transform task data from DB format (stage_id) to API format (status_id)
	 */
	private transformTaskFromDb(task: any): any {
		if (!task) return task;
		const transformed = { ...task };
		if ('stage_id' in transformed) {
			transformed.status_id = transformed.stage_id;
			delete transformed.stage_id;
		}
		return transformed;
	}

	/**
	 * Get task with all relations (full TaskDetail)
	 */
	async getTaskDetail(taskId: string): Promise<ServiceResponse<TaskDetail>> {
		return this.execute(async () => {
			// Fetch task with relations (without user joins - they reference auth.users)
			const { data: task, error } = await this.client
				.from('tasks')
				.select(`
					*,
					subtasks(*),
					comments:task_comments(*),
					attachments:task_attachments(*),
					customFieldValues:task_custom_field_values(
						*,
						field_definition:custom_field_definitions(*)
					),
					labels:task_label_assignments(
						*,
						label:task_labels(*)
					),
					stageDeadlines:task_stage_deadlines(
						*,
						stage:task_stages(id, name)
					)
				`)
				.eq('id', taskId)
				.single();

			if (error) return { data: null, error };

			// Fetch users separately (task_comments.user_id and task_attachments.uploaded_by reference auth.users,
			// but we can look them up in public.users since IDs match)
			const userIds = new Set<string>();
			if (task.comments) {
				task.comments.forEach((c: any) => {
					if (c.user_id) userIds.add(c.user_id);
				});
			}
			if (task.attachments) {
				task.attachments.forEach((a: any) => {
					if (a.uploaded_by) userIds.add(a.uploaded_by);
				});
			}

			// Fetch users from public.users
			let usersMap: Record<string, any> = {};
			if (userIds.size > 0) {
				const { data: users } = await this.client
					.from('users')
					.select('id, email, name, avatar_url')
					.in('id', Array.from(userIds));

				if (users) {
					users.forEach((u: any) => {
						usersMap[u.id] = {
							id: u.id,
							email: u.email,
							first_name: u.name?.split(' ')[0] || null,
							last_name: u.name?.split(' ').slice(1).join(' ') || null,
							avatar_url: u.avatar_url
						};
					});
				}
			}

			// Attach user data to comments and attachments
			if (task.comments) {
				task.comments = task.comments.map((c: any) => ({
					...c,
					user: usersMap[c.user_id] || null
				}));
			}
			if (task.attachments) {
				task.attachments = task.attachments.map((a: any) => ({
					...a,
					uploader: usersMap[a.uploaded_by] || null
				}));
			}

			// Calculate subtask completion percentage
			const subtasks = task.subtasks || [];
			const completed = subtasks.filter((s: any) => s.completed).length;
			const total = subtasks.length;
			const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

			return {
				data: {
					...this.transformTaskFromDb(task),
					subtask_completion_percentage: percentage,
					total_subtasks: total,
					completed_subtasks: completed,
				},
				error: null,
			};
		});
	}

	/**
	 * Get tasks with basic relations (for list views)
	 */
	async getTasks(filters?: TaskFilters): Promise<ServiceResponse<any[]>> {
		return this.execute(async () => {
			let query = this.client
				.from('tasks')
				.select(`
					*,
					subtasks(id, completed),
					labels:task_label_assignments(
						label:task_labels(id, name, color)
					)
				`)
				// Filter out soft-deleted tasks by default
				.is('deleted_at', null);

			// Apply filters
			if (filters?.status_ids?.length) {
				query = query.in('stage_id', filters.status_ids);
			}
			if (filters?.priorities?.length) {
				query = query.in('priority', filters.priorities);
			}
			if (filters?.assigned_to?.length) {
				query = query.in('assigned_to', filters.assigned_to);
			}
			if (filters?.project_ids?.length) {
				query = query.in('project_id', filters.project_ids);
			}
			if (filters?.label_ids?.length) {
				// Filter by labels requires a subquery
				query = query.in('id', 
					this.client
						.from('task_label_assignments')
						.select('task_id')
						.in('label_id', filters.label_ids)
				);
			}
			if (filters?.due_date_from) {
				query = query.gte('due_date', filters.due_date_from);
			}
			if (filters?.due_date_to) {
				query = query.lte('due_date', filters.due_date_to);
			}
			if (filters?.is_standalone !== undefined) {
				if (filters.is_standalone) {
					query = query
						.is('project_id', null)
						.is('resource_id', null);
					// Note: photoshoot_id doesn't exist in tasks table - tasks link to photoshoots via projects
				} else {
					query = query.or('project_id.not.is.null,resource_id.not.is.null');
				}
			}
			if (filters?.search_query) {
				query = query.ilike('title', `%${filters.search_query}%`);
			}

			const { data, error } = await query.order('created_at', { ascending: false });

			if (error) return { data: null, error };

			// Add subtask completion percentage to each task and transform stage_id to status_id
			const tasksWithMeta = data.map((task: any) => {
				const subtasks = task.subtasks || [];
				const completed = subtasks.filter((s: any) => s.completed).length;
				const total = subtasks.length;
				const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

				return {
					...this.transformTaskFromDb(task),
					subtask_completion_percentage: percentage,
					total_subtasks: total,
					completed_subtasks: completed,
				};
			});

			return { data: tasksWithMeta, error: null };
		});
	}

	/**
	 * Create a new task with optional subtasks
	 */
	async createTask(data: CreateTaskRequest): Promise<ServiceResponse<TaskDetail>> {
		const validated = CreateTaskRequestSchema.parse(data);
		const userId = await this.getCurrentUserId();

		return this.execute(async () => {
			// Create task
			const { data: task, error: taskError } = await this.client
				.from('tasks')
				.insert({
					team_id: validated.team_id,
					title: validated.title,
					description: validated.description,
					stage_id: validated.status_id, // Map status_id (API) to stage_id (DB column)
					priority: validated.priority || 'medium',
					due_date: validated.due_date,
					assigned_to: validated.assigned_to,
					project_id: validated.project_id,
					// Note: photoshoot_id doesn't exist - tasks link to photoshoots via projects (photoshoot_projects join table)
					resource_id: validated.resource_id,
					// Note: created_by column doesn't exist in tasks table
				})
				.select()
				.single();

			if (taskError) return { data: null, error: taskError };

			// Create subtasks if provided
			if (validated.subtasks && validated.subtasks.length > 0) {
				await this.subtaskService.createSubtasks(
					validated.subtasks.map((s, index) => ({
						task_id: task.id,
						title: s.title,
						completed: false,
						display_order: s.display_order ?? index,
					}))
				);
			}

			// Send notification if task is assigned
			if (validated.assigned_to && userId) {
				await this.notificationService.notifyTaskAssigned(
					task.id,
					validated.assigned_to,
					userId
				);
			}

			// Return full task detail
			return await this.getTaskDetail(task.id);
		});
	}

	/**
	 * Update a task
	 */
	async updateTask(taskId: string, data: UpdateTaskRequest): Promise<ServiceResponse<TaskDetail>> {
		const validated = UpdateTaskRequestSchema.parse(data);
		const userId = await this.getCurrentUserId();

		return this.execute(async () => {
			// Get current task for comparison
			const { data: currentTask } = await this.client
				.from('tasks')
				.select('*')
				.eq('id', taskId)
				.single();

			// Map status_id (API) to stage_id (DB column) for update
			const updatePayload: any = { ...validated };
			if ('status_id' in updatePayload) {
				updatePayload.stage_id = updatePayload.status_id;
				delete updatePayload.status_id;
			}

			// Update task
			const { data: task, error: updateError } = await this.client
				.from('tasks')
				.update({
					...updatePayload,
					updated_at: new Date().toISOString(),
				})
				.eq('id', taskId)
				.select()
				.single();

			if (updateError) return { data: null, error: updateError };

			// Send notifications for changes (only if user is authenticated)
			if (currentTask && userId) {
				// Notify if assignee changed
				if (
					data.assigned_to &&
					data.assigned_to !== currentTask.assigned_to &&
					taskId &&
					userId
				) {
					try {
						await this.notificationService.notifyTaskAssigned(
							taskId,
							data.assigned_to,
							userId
						);
					} catch (notificationError) {
						// Log notification error but don't fail the task update
						console.error('Failed to send assignment notification:', notificationError);
					}
				}

				// Notify if status changed (map stage_id from DB to status_id for comparison)
				const currentStatusId = currentTask.stage_id;
				const newStatusId = validated.status_id;
				// Only notify if:
				// 1. Status actually changed
				// 2. Task has an assignee (so we know who to notify)
				// 3. All required UUIDs are valid
				if (
					newStatusId &&
					newStatusId !== currentStatusId &&
					currentTask.assigned_to &&
					userId &&
					taskId
				) {
					try {
						await this.notificationService.notifyStatusChanged(
							taskId,
							currentTask.assigned_to,
							userId,
							currentStatusId || 'unknown',
							newStatusId
						);
					} catch (notificationError) {
						// Log notification error but don't fail the task update
						console.error('Failed to send status change notification:', notificationError);
					}
				}
			}

			// Return full task detail
			return await this.getTaskDetail(taskId);
		});
	}

	/**
	 * Delete a task
	 */
	async deleteTask(taskId: string): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			const { error } = await this.client
				.from('tasks')
				.delete()
				.eq('id', taskId);

			return { data: null, error };
		});
	}

	/**
	 * Bulk update tasks (for bulk actions)
	 */
	async bulkUpdateTasks(
		taskIds: string[],
		updates: Partial<UpdateTaskRequest>
	): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			// Map status_id (API) to stage_id (DB column) for update
			const updatePayload: any = { ...updates };
			if ('status_id' in updatePayload) {
				updatePayload.stage_id = updatePayload.status_id;
				delete updatePayload.status_id;
			}

			const { error } = await this.client
				.from('tasks')
				.update({
					...updatePayload,
					updated_at: new Date().toISOString(),
				})
				.in('id', taskIds);

			return { data: null, error };
		});
	}

	/**
	 * Get tasks for a project
	 */
	async getProjectTasks(projectId: string): Promise<ServiceResponse<any[]>> {
		return this.getTasks({ project_ids: [projectId] });
	}

	/**
	 * Get tasks for a photoshoot
	 */
	async getPhotoshootTasks(photoshootId: string): Promise<ServiceResponse<any[]>> {
		return this.getTasks({ photoshoot_ids: [photoshootId] });
	}

	/**
	 * Get standalone tasks (not linked to any project/photoshoot/resource)
	 */
	async getStandaloneTasks(teamId: string): Promise<ServiceResponse<any[]>> {
		return this.getTasks({ is_standalone: true });
	}
}

