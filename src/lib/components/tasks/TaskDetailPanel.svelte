<script lang="ts">
	import { onMount } from 'svelte';
	import type { Task, Subtask, TaskComment, TaskAttachment } from '$lib/types/tasks';
	import { TaskService } from '$lib/services/task-service';
	import { SubtaskService } from '$lib/services/subtask-service';
	import { CommentService } from '$lib/services/comment-service';
	import { AttachmentService } from '$lib/services/attachment-service';
	import { currentTeam } from '$lib/stores/teams';
	import { taskStageService } from '$lib/api/services/taskStageService';
	import type { TaskStage } from '$lib/types/domain/task';
	import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte';
	import InlineUserSelector from '$lib/components/base/InlineUserSelector.svelte';
	import InlineProjectSelector from '$lib/components/base/InlineProjectSelector.svelte';
	import InlineResourceSelector from '$lib/components/base/InlineResourceSelector.svelte';
	import StageSelector from '$lib/components/base/StageSelector.svelte';
	import PrioritySelector from '$lib/components/base/PrioritySelector.svelte';
	import { DatePicker } from '$lib/components/ui';
	import SubtaskList from './SubtaskList.svelte';
	import CommentThread from './CommentThread.svelte';
	import AttachmentList from './AttachmentList.svelte';
	import ActivityLog from './ActivityLog.svelte';
	import CustomFieldsSection from './detail/CustomFieldsSection.svelte';
	import { Button } from '$lib/components/ui';
	import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte';
	import { Loader2, Trash2 } from 'lucide-svelte';
	import { get } from 'svelte/store';
	
	// Service instances
	const taskService = new TaskService();
	const subtaskService = new SubtaskService();
	const commentService = new CommentService();
	const attachmentService = new AttachmentService();

	// Props
	let {
		open = $bindable(false),
		taskId = $bindable<string | null>(null),
		onClose = () => {},
		onSave = (task: Task) => {},
		onStartWorking = (taskId: string) => {},
		onDelete = (taskId: string) => {},
		initialData = null as Task | null
	}: {
		open?: boolean;
		taskId?: string | null;
		onClose?: () => void;
		onSave?: (task: Task) => void;
		onStartWorking?: (taskId: string) => void;
		onDelete?: (taskId: string) => void;
		initialData?: Task | null;
	} = $props();

	// Derived state
	const mode: 'create' | 'edit' | 'view' = $derived.by(() => {
		if (!taskId) return 'create';
		return 'edit'; // Could add view-only mode later
	});

	// Title for the flyout
	const title = $derived(mode === 'create' ? 'New Task' : 'Task Details');

	// Handle open state changes
	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			onClose();
		}
	}

	// Initialize empty task for create mode
	function getInitialTask(): Task | null {
		if (initialData) return initialData;
		if (!taskId) {
			const team = get(currentTeam);
			return {
				id: '',
				title: '',
				description: '',
				status_id: '', // Will be set to backlog stage when stages load
				team_id: team?.id || '',
				priority: 'medium',
				due_date: null,
				assigned_to: null,
				project_id: null,
				resource_id: null,
				photoshoot_id: null,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			} as Task;
		}
		return null;
	}

	// Local state
	let task = $state<Task | null>(getInitialTask());
	let subtasks = $state<Subtask[]>([]);
	let comments = $state<TaskComment[]>([]);
	let attachments = $state<TaskAttachment[]>([]);
	let stages = $state<TaskStage[]>([]);
	let isLoading = $state(false);
	let isSaving = $state(false);
	let error = $state<string | null>(null);
	let activeTab = $state<'details' | 'comments' | 'activity'>('details');

	const isEditMode = $derived(mode === 'edit' || mode === 'create');

	// Priority options
	const priorityOptions = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' }
	];

	// Load stages when team is available and set default stage for create mode
	$effect(() => {
		const team = get(currentTeam);
		if (team?.id && stages.length === 0) {
			taskStageService.list(team.id).then((loadedStages) => {
				stages = loadedStages;
				
				// Set default stage to "backlog" (or first non-completion stage) for create mode
				if (mode === 'create' && task && !task.status_id) {
					// Try to find "backlog" stage first
					const backlogStage = loadedStages.find(s => 
						s.name.toLowerCase() === 'backlog' || 
						s.name.toLowerCase() === 'todo' ||
						s.name.toLowerCase() === 'to do'
					);
					
					if (backlogStage) {
						task.status_id = backlogStage.id;
					} else {
						// Fallback to first non-completion stage
						const firstStage = loadedStages.find(s => !s.isCompletionStage);
						if (firstStage) {
							task.status_id = firstStage.id;
						}
					}
				}
			}).catch((err) => {
				console.error('Failed to load stages:', err);
			});
		}
	});

	// Load task data when taskId changes
	$effect(() => {
		if (taskId && !initialData) {
			loadTaskData();
		} else if (!taskId) {
			// Reset to create mode
			task = getInitialTask();
			subtasks = [];
			comments = [];
			attachments = [];
			isLoading = false;
			error = null;
		}
	});

	async function loadTaskData() {
		if (!taskId) return;

		isLoading = true;
		error = null;

		try {
			// Load task with all relations
			const taskResponse = await taskService.getTaskDetail(taskId);
			if (taskResponse.error) {
				throw new Error(taskResponse.error.message || 'Failed to load task');
			}
			
			if (taskResponse.data) {
				task = taskResponse.data as Task;
				// Extract related data from the detail response
				subtasks = (taskResponse.data as any).subtasks || [];
				comments = (taskResponse.data as any).comments || [];
				attachments = (taskResponse.data as any).attachments || [];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load task';
			console.error('Error loading task:', err);
		} finally {
			isLoading = false;
		}
	}

	// Create new task
	async function createTask(): Promise<void> {
		if (!task || !task.title?.trim()) {
			error = 'Task title is required';
			return;
		}

		isSaving = true;
		error = null;

		try {
			const { CreateTaskRequest } = await import('$lib/types/tasks');
			const taskData: CreateTaskRequest = {
				team_id: task.team_id || '',
				title: task.title.trim(),
				description: task.description || undefined,
				status_id: task.status_id || undefined,
				priority: task.priority || 'medium',
				due_date: task.due_date || undefined,
				assigned_to: task.assigned_to || undefined,
				project_id: task.project_id || undefined,
				resource_id: task.resource_id || undefined,
				photoshoot_id: task.photoshoot_id || undefined,
			};

			const response = await taskService.createTask(taskData);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to create task');
			}
			if (response.data) {
				task = response.data as Task;
				onSave(response.data as Task);
				onClose(); // Close panel after successful creation
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create task';
			console.error('Error creating task:', err);
		} finally {
			isSaving = false;
		}
	}

	// Update task field (optimistic update with rollback)
	async function updateField<K extends keyof Task>(
		field: K,
		value: Task[K]
	): Promise<void> {
		if (!task || !taskId) return;

		const previousValue = task[field];
		task[field] = value; // Optimistic update

		isSaving = true;
		error = null;

		try {
			const response = await taskService.updateTask(taskId, { [field]: value } as any);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to update task');
			}
			if (response.data) {
				task = response.data as Task;
				onSave(response.data as Task);
			}
		} catch (err) {
			// Rollback on error
			task[field] = previousValue;
			error = err instanceof Error ? err.message : 'Failed to update task';
			console.error('Error updating task:', err);
		} finally {
			isSaving = false;
		}
	}

	// Calculate subtask completion percentage
	const subtaskCompletion = $derived.by(() => {
		if (subtasks.length === 0) return 0;
		const completed = subtasks.filter((s) => s.completed).length;
		return Math.round((completed / subtasks.length) * 100);
	});

	// Handle subtask changes
	function handleSubtasksChange(updatedSubtasks: Subtask[]) {
		subtasks = updatedSubtasks;
		// Update task with new subtask counts for parent to sync
		if (task && taskId) {
			const completedCount = updatedSubtasks.filter(s => s.completed).length;
			const totalCount = updatedSubtasks.length;
			const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
			
			// Update task object to reflect new subtask counts
			task = {
				...task,
				completed_subtasks: completedCount,
				total_subtasks: totalCount,
				subtask_completion_percentage: completionPercentage
			} as any;
			
			// Notify parent of the change
			onSave(task);
		}
	}

	// Handle comment added
	function handleCommentAdded(comment: TaskComment) {
		comments = [comment, ...comments];
	}

	// Handle attachment added
	function handleAttachmentAdded(attachment: TaskAttachment) {
		attachments = [attachment, ...attachments];
	}

	// Handle attachment deleted
	function handleAttachmentDeleted(attachmentId: string) {
		attachments = attachments.filter((a) => a.id !== attachmentId);
	}

	// Handle delete
	function handleDelete() {
		if (taskId) {
			onDelete(taskId);
		}
	}
</script>

<!-- Task Detail Panel -->
<CreationFlyout 
	bind:open
	onOpenChange={handleOpenChange}
	{title}
>
	<!-- Error Banner -->
	{#if error}
		<div class="mb-4 rounded-md p-4" style="background-color: var(--theme-error-bg, rgba(239, 68, 68, 0.1));">
			<p class="text-sm" style="color: var(--theme-error, #ef4444);">{error}</p>
		</div>
	{/if}

	{#if isSaving}
		<div class="mb-4 flex items-center gap-2 text-sm" style="color: var(--theme-text-muted, #78716c);">
			<Loader2 class="h-4 w-4 animate-spin" />
			<span>Saving...</span>
		</div>
	{/if}

	<!-- Loading State -->
	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin" style="color: var(--theme-text-muted, #78716c);" />
		</div>
	{:else if task}
		<!-- Tabs (only show for edit/view mode) -->
		{#if mode !== 'create'}
			<div class="border-b">
				<div class="flex space-x-6 px-6">
					<button
						class="border-b-2 py-3 text-sm font-medium transition-colors {activeTab === 'details'
							? ''
							: 'border-transparent'}"
						style={activeTab === 'details' 
							? 'border-bottom-color: var(--theme-primary); color: var(--theme-primary);'
							: 'color: var(--theme-text-muted, #78716c);'}
						onclick={() => (activeTab = 'details')}
					>
						Details
						{#if subtasks.length > 0}
							<span class="ml-2 text-xs" style="color: var(--theme-text-muted, #78716c);">
								{subtaskCompletion}%
							</span>
						{/if}
					</button>
					<button
						class="border-b-2 py-3 text-sm font-medium transition-colors {activeTab === 'comments'
							? ''
							: 'border-transparent'}"
						style={activeTab === 'comments' 
							? 'border-bottom-color: var(--theme-primary); color: var(--theme-primary);'
							: 'color: var(--theme-text-muted, #78716c);'}
						onclick={() => (activeTab = 'comments')}
					>
						Comments
						{#if comments.length > 0}
							<span class="ml-2 text-xs" style="color: var(--theme-text-muted, #78716c);">
								{comments.length}
							</span>
						{/if}
					</button>
					<button
						class="border-b-2 py-3 text-sm font-medium transition-colors {activeTab === 'activity'
							? ''
							: 'border-transparent'}"
						style={activeTab === 'activity' 
							? 'border-bottom-color: var(--theme-primary); color: var(--theme-primary);'
							: 'color: var(--theme-text-muted, #78716c);'}
						onclick={() => (activeTab = 'activity')}
					>
						Activity
					</button>
				</div>
			</div>
		{/if}

		<!-- Content -->
		<div class="overflow-y-auto" style="max-height: calc(100vh - 160px);">
			{#if activeTab === 'details' && task}
				<!-- Details Tab -->
				<div class="space-y-6 p-6">
					<!-- Title -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<label class="block text-sm font-medium" style="color: var(--theme-foreground);">Title</label>
							<!-- Focus Mode "Start Working" button disabled - Post-MVP feature -->
							<!-- {#if mode === 'edit' && taskId}
								<Button
									variant="default"
									size="sm"
									onclick={() => onStartWorking(taskId)}
									class="flex items-center gap-2"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
									Start Working
								</Button>
							{/if} -->
						</div>
						<InlineTextEditor
							bind:value={task.title}
							variant="title"
							placeholder="Task title..."
							editable={isEditMode}
							onSave={(value) => mode === 'create' ? (task.title = value) : updateField('title', value)}
						/>
					</div>

					<!-- Properties Grid -->
					<div class="grid grid-cols-2 gap-4">
						<!-- Stage -->
						<div>
							<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground);">Stage</label>
							{#if stages.length > 0}
								<StageSelector
									stages={stages}
									currentStageId={task.status_id || ''}
									editable={isEditMode}
									onStageChange={async (stageId) => {
										if (mode === 'create') {
											task.status_id = stageId;
										} else {
											await updateField('status_id', stageId);
										}
									}}
								/>
							{:else}
								<div class="text-sm" style="color: var(--theme-text-muted, #78716c);">
									Loading stages...
								</div>
							{/if}
						</div>

						<!-- Priority -->
						<div>
							<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground);">Priority</label>
							{#if isEditMode}
								<PrioritySelector
									currentPriority={task.priority || 'medium'}
									editable={true}
									onPriorityChange={async (newPriority) => {
										if (mode === 'create') {
											task.priority = newPriority;
										} else {
											await updateField('priority', newPriority);
										}
									}}
								/>
							{:else}
								<PrioritySelector
									currentPriority={task.priority || 'medium'}
									editable={false}
									onPriorityChange={() => {}}
								/>
							{/if}
						</div>

						<!-- Due Date -->
						<div>
							<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground);">Due Date</label>
							{#if isEditMode}
								<DatePicker
									bind:value={task.due_date}
									placeholder="Select date"
									onchange={(value) => {
										if (mode === 'create') {
											task.due_date = value;
										} else {
											updateField('due_date', value);
										}
									}}
								/>
							{:else}
								<div class="text-sm" style="color: var(--theme-text-muted, #78716c);">
									{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
								</div>
							{/if}
						</div>

						<!-- Assigned To -->
						<div>
							<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground);">Assigned To</label>
							<InlineUserSelector
								bind:value={task.assigned_to}
								teamId={task.team_id}
								editable={isEditMode}
								onSave={(value) => mode === 'create' ? (task.assigned_to = value) : updateField('assigned_to', value)}
							/>
						</div>

						<!-- Project Link -->
						<div>
							<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground);">Project</label>
							<InlineProjectSelector
								bind:value={task.project_id}
								editable={isEditMode}
								onSave={(value) => mode === 'create' ? (task.project_id = value) : updateField('project_id', value)}
							/>
						</div>

						<!-- Resource Link -->
						<div>
							<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground);">Resource</label>
							<InlineResourceSelector
								bind:value={task.resource_id}
								editable={isEditMode}
								onSave={(value) => mode === 'create' ? (task.resource_id = value) : updateField('resource_id', value)}
							/>
						</div>
					</div>

					<!-- Description -->
					<div>
						<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground);">Description</label>
						<InlineTextEditor
							bind:value={task.description}
							variant="textarea"
							placeholder="Add a description..."
							editable={isEditMode}
							onSave={(value) => mode === 'create' ? (task.description = value) : updateField('description', value)}
						/>
					</div>

					<!-- Custom Fields -->
					{#if taskId}
						<div>
							<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground, #1c1917);">
								Custom Fields
							</label>
							<CustomFieldsSection
								{taskId}
								editable={isEditMode}
							/>
						</div>
					{/if}

					<!-- Create Task Button (only in create mode) -->
					{#if mode === 'create'}
						<div class="flex justify-end gap-3 pt-4 border-t">
							<Button
								variant="outline"
								onclick={onClose}
								disabled={isSaving}
							>
								Cancel
							</Button>
							<Button
								onclick={createTask}
								disabled={isSaving || !task?.title?.trim()}
							>
								{#if isSaving}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								Create Task
							</Button>
						</div>
					{/if}

					<!-- Subtasks -->
					{#if taskId}
						<div>
							<div class="mb-2 flex items-center justify-between">
								<label class="text-sm font-medium" style="color: var(--theme-foreground, #1c1917);">
									Subtasks
									{#if subtasks.length > 0}
										<span class="ml-2 text-xs" style="color: var(--theme-text-muted, #78716c);">
											{subtasks.filter((s) => s.completed).length}/{subtasks.length} complete
										</span>
									{/if}
								</label>
							</div>
							<SubtaskList
								{taskId}
								{subtasks}
								onChange={handleSubtasksChange}
							/>
						</div>

						<!-- Attachments -->
						<div>
							<label class="mb-2 block text-sm font-medium" style="color: var(--theme-foreground, #1c1917);">
								Attachments
								{#if attachments.length > 0}
									<span class="ml-2 text-xs" style="color: var(--theme-text-muted, #78716c);">
										{attachments.length}
									</span>
								{/if}
							</label>
							<AttachmentList
								{taskId}
								{attachments}
								onAdd={handleAttachmentAdded}
								onDelete={handleAttachmentDeleted}
							/>
						</div>

						<!-- Danger Zone -->
						<div class="pt-6 mt-6 border-t" style="border-color: var(--theme-border, #e7e5e4);">
							<label class="mb-2 block text-sm font-medium" style="color: var(--color-danger, #dc2626);">
								Danger Zone
							</label>
							<p class="text-xs mb-3" style="color: var(--theme-text-muted, #78716c);">
								Once you delete a task, it will be hidden from all views. You can restore it within 30 days.
							</p>
							<button
								type="button"
								class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors"
								style="
									background-color: transparent;
									border-color: var(--color-danger, #dc2626);
									color: var(--color-danger, #dc2626);
								"
								onclick={handleDelete}
								data-testid="detail-panel-delete-button"
							>
								<Trash2 class="w-4 h-4" />
								Delete Task
							</button>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'comments'}
				<!-- Comments Tab -->
				<div class="p-6">
					{#if taskId}
						<CommentThread
							{taskId}
							{comments}
							onCommentAdded={handleCommentAdded}
						/>
					{/if}
				</div>
			{:else if activeTab === 'activity'}
				<!-- Activity Tab -->
				<div class="p-6">
					{#if taskId}
						<ActivityLog {taskId} />
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</CreationFlyout>

