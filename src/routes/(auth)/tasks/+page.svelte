<script lang="ts">
	/**
	 * Tasks Page
	 * 
	 * Main task management page with multiple views (list, board, calendar, timeline).
	 * Supports filtering, sorting, grouping, and all task operations.
	 */
	import { onMount, onDestroy } from 'svelte';
	import { taskViewStore, activeFilterCount, filterSummary } from '$lib/stores/task-view-store';
	import TaskListView from '$lib/components/tasks/TaskListView.svelte';
	import TaskBoardView from '$lib/components/tasks/TaskBoardView.svelte';
	import TaskTableView from '$lib/components/tasks/TaskTableView.svelte';
	import TaskCalendarView from '$lib/components/tasks/TaskCalendarView.svelte';
	import TaskTimelineView from '$lib/components/tasks/TaskTimelineView.svelte';
	import ViewModeSelector from '$lib/components/tasks/ViewModeSelector.svelte';
	import TaskFilterPanel from '$lib/components/tasks/TaskFilterPanel.svelte';
	import TaskDetailPanel from '$lib/components/tasks/TaskDetailPanel.svelte';
	import TaskDeleteModal from '$lib/components/tasks/TaskDeleteModal.svelte';
	import WhatToDoNow from '$lib/components/tasks/WhatToDoNow.svelte';
	// FocusMode disabled - Post-MVP feature
	// import FocusMode from '$lib/components/tasks/FocusMode.svelte';
	import CelebrationAnimation from '$lib/components/tasks/CelebrationAnimation.svelte';
	import ErrorToast from '$lib/components/base/ErrorToast.svelte';
	import { Button, DropdownMenu } from '$lib/components/ui';
	import { TaskService } from '$lib/services/task-service';
	import { applyFilters, applySort } from '$lib/services/task-filter-service';
	import { keyboardShortcuts } from '$lib/utils/keyboard-shortcuts';
	import { celebration } from '$lib/stores/celebration';
	import { taskStageService } from '$lib/api/services/taskStageService';
	import { taskService as taskApiService } from '$lib/api/services/taskService';
	import { UserTaskStatsService } from '$lib/services/user-task-stats-service';
	import StreakDisplay from '$lib/components/tasks/StreakDisplay.svelte';
	import DailyProgressBar from '$lib/components/tasks/DailyProgressBar.svelte';
	import { currentTeam } from '$lib/stores/teams';
	import { user } from '$lib/stores/auth-store';
	import { get } from 'svelte/store';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// State
	let tasks = $state(data.tasks || []);
	let statusOptions = $state(data.statusOptions || []);
	let projectOptions = $state(data.projectOptions || []);
	let assigneeOptions = $state(data.assigneeOptions || []);
	let labelOptions = $state(data.labelOptions || []);
	let completionStageIds = $state(data.completionStageIds || []);
	let customFields = $state(data.customFields || []);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let filterPanelOpen = $state(false);
	let selectedTaskIds = $state(new Set<string>());
	let detailPanelTaskId = $state<string | null>(null);
	let detailPanelInitialData = $state<any | null>(null);
	let isDetailPanelOpen = $state(false);
	let showWhatToDoNow = $state(false);
	// FocusMode disabled - Post-MVP feature
	// let focusModeTaskId = $state<string | null>(null);
	// let isFocusModeActive = $state(false);
	const isFocusModeActive = false; // Disabled - Post-MVP
	let celebrationEnabled = $state(true); // Check localStorage for user preference
	let celebrationTrigger = $state(false);
	let celebrationMessage = $state('');

	// Delete modal state
	let deleteModalOpen = $state(false);
	let taskToDelete = $state<{ id: string; title: string } | null>(null);
	let deleteDependencyCount = $state(0);

	// Services
	const taskService = new TaskService();
	const statsService = new UserTaskStatsService();
	
	// Streak display ref
	let streakDisplayRef: StreakDisplay | null = $state(null);

	// Reactive filtered and sorted tasks
	const filteredTasks = $derived(
		applyFilters(tasks, $taskViewStore.filters)
	);

	const sortedTasks = $derived(
		applySort(filteredTasks, $taskViewStore.sortBy)
	);

	// Calculate daily progress (completed vs total tasks)
	const completionStageSet = $derived(new Set(completionStageIds));
	const completedTasksCount = $derived(
		tasks.filter(task => completionStageSet.has(task.status_id)).length
	);
	const totalTasksCount = $derived(tasks.length);

	// View mode
	let viewMode = $derived($taskViewStore.viewMode);

	// Load celebration preference from localStorage
	onMount(() => {
		// FocusMode disabled - Post-MVP feature
		// Clean up any saved focus mode state
		if (typeof window !== 'undefined') {
			localStorage.removeItem('focusModeTaskId');
			document.body.classList.remove('focus-mode-active');

			// Load celebration preference (default to true if not set)
			const savedCelebrationPref = localStorage.getItem('celebrationEnabled');
			celebrationEnabled = savedCelebrationPref !== 'false';

			// Focus Mode F key shortcut disabled - Post-MVP
			// keyboardShortcuts.register({
			// 	key: 'f',
			// 	callback: () => {
			// 		if (detailPanelTaskId && !isFocusModeActive) {
			// 			enterFocusMode(detailPanelTaskId);
			// 		}
			// 	},
			// 	description: 'Enter Focus Mode for current task'
			// });

			// Subscribe to celebration store
			const unsubscribe = celebration.subscribe((state) => {
				if (state.trigger && celebrationEnabled) {
					celebrationTrigger = true;
					celebrationMessage = state.message;
					// Reset trigger after animation completes
					setTimeout(() => {
						celebrationTrigger = false;
					}, 3500);
				}
			});

			return () => {
				unsubscribe();
			};
		}
	});

	// FocusMode disabled - Post-MVP feature
	// $effect(() => {
	// 	if (isFocusModeActive && isDetailPanelOpen) {
	// 		isDetailPanelOpen = false;
	// 		detailPanelTaskId = null;
	// 	}
	// });

	onDestroy(() => {
		// Cleanup
		if (typeof window !== 'undefined') {
			// FocusMode disabled - Post-MVP
			// keyboardShortcuts.unregister({
			// 	key: 'f',
			// 	callback: () => {}
			// });
			document.body.classList.remove('focus-mode-active');
		}
	});

	// Handlers
	function handleTaskClick(event: CustomEvent<{ id: string }>) {
		detailPanelTaskId = event.detail.id;
		isDetailPanelOpen = true;
	}

	function handleDetailPanelClose() {
		isDetailPanelOpen = false;
		detailPanelTaskId = null;
		detailPanelInitialData = null;
	}

	function handleAddTaskToStage(event: CustomEvent<{ stageId: string }>) {
		const team = get(currentTeam);
		if (!team) return;
		
		// Create initial task data with the stage set
		const initialTask = {
			id: '',
			title: '',
			description: '',
			status_id: event.detail.stageId,
			team_id: team.id,
			priority: 'medium' as const,
			due_date: null,
			assigned_to: null,
			project_id: null,
			resource_id: null,
			photoshoot_id: null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		} as any;
		
		detailPanelTaskId = null; // null = create mode
		detailPanelInitialData = initialTask;
		isDetailPanelOpen = true;
	}

	function handleTaskSave(updatedTask: any) {
		// If task doesn't exist (new task), add it to the list
		const existingIndex = tasks.findIndex(t => t.id === updatedTask.id);
		if (existingIndex >= 0) {
			// Update existing task
			tasks = tasks.map((task) => 
				task.id === updatedTask.id ? { ...task, ...updatedTask } : task
			);
		} else {
			// Add new task to the beginning of the list
			tasks = [updatedTask, ...tasks];
		}
	}

	// Track last processed status change to prevent duplicate updates
	let lastStatusChange: { taskId: string; statusId: string; timestamp: number } | null = null;

	async function handleStatusChange(event: CustomEvent<{ id: string; status_id: string }>) {
		try {
			loading = true;
			error = null;

			// CRITICAL: Validate required values before proceeding
			if (!event.detail.id || !event.detail.status_id) {
				console.error('[handleStatusChange] Missing required values:', {
					id: event.detail.id,
					status_id: event.detail.status_id
				});
				throw new Error('Missing task ID or status ID');
			}

			// Prevent duplicate processing of the same status change
			const now = Date.now();
			if (
				lastStatusChange &&
				lastStatusChange.taskId === event.detail.id &&
				lastStatusChange.statusId === event.detail.status_id &&
				now - lastStatusChange.timestamp < 500 // Within 500ms
			) {
				console.log('[handleStatusChange] Duplicate status change detected, skipping:', {
					taskId: event.detail.id,
					statusId: event.detail.status_id,
					timeSinceLast: now - lastStatusChange.timestamp
				});
				return;
			}

			// Get current task to check if it's moving to a completion stage
			const currentTask = tasks.find(t => t.id === event.detail.id);
			if (!currentTask) {
				console.error('[handleStatusChange] Task not found:', event.detail.id);
				throw new Error('Task not found');
			}
			
			const previousStatusId = currentTask.status_id;

			// Don't update if status hasn't actually changed
			if (previousStatusId === event.detail.status_id) {
				console.log('[handleStatusChange] Status unchanged, skipping update');
				return;
			}

			// Mark this status change as processed
			lastStatusChange = {
				taskId: event.detail.id,
				statusId: event.detail.status_id,
				timestamp: now
			};

			// CRITICAL: Optimistically update local state IMMEDIATELY to prevent visual duplicates
			// This ensures Svelte re-renders and removes the task from the old column
			// before Shopify Draggable's DOM manipulation can create duplicates
			tasks = tasks.map((task) =>
				task.id === event.detail.id ? { ...task, status_id: event.detail.status_id } : task
			);

			const result = await taskService.updateTask(event.detail.id, {
				status_id: event.detail.status_id,
			});

			if (result.error) {
				// CRITICAL: Revert the optimistic update if the backend call failed
				// Restore the task to its previous status_id to prevent duplicates
				console.error('[handleStatusChange] Backend update failed, reverting optimistic update:', {
					taskId: event.detail.id,
					previousStatusId,
					newStatusId: event.detail.status_id,
					error: result.error
				});
				
				// Create a new array to ensure reactivity
				tasks = tasks.map((task) => {
					if (task.id === event.detail.id) {
						// Restore previous status_id, or keep current if previous was null
						return { ...task, status_id: previousStatusId || task.status_id };
					}
					return task;
				});
				
				throw new Error(result.error.message || 'Failed to update task status');
			}

			// Check if task moved to a completion stage
			if (previousStatusId !== event.detail.status_id) {
				const team = get(currentTeam);
				if (team) {
					try {
						const stages = await taskStageService.list(team.id);
						const newStage = stages.find(s => s.id === event.detail.status_id);
						
						if (newStage?.isCompletionStage) {
							// Task was completed! Trigger celebration and update stats
							celebration.celebrate(currentTask?.title);
							
							// Update streak stats
							const currentUser = get(user);
							if (currentUser) {
								try {
									await statsService.incrementTaskCompletion(currentUser.id, team.id);
									// Refresh streak display
									streakDisplayRef?.refresh();
								} catch (err) {
									console.error('Failed to update task stats:', err);
								}
							}
						}
					} catch (err) {
						console.error('Failed to check stage completion status:', err);
					}
				}
			}
		} catch (err: any) {
			error = err.message || 'Failed to update task status';
			console.error('[handleStatusChange] Error updating task status:', err);
			
			// The optimistic update should already be reverted in the error handler above
			// But if we get here, it means the error was thrown before the revert
			// So we need to ensure the task is in the correct state
			const currentTask = tasks.find(t => t.id === event.detail.id);
			if (currentTask) {
				// If we still have the task, reload from the server to ensure consistency
				try {
					const taskResult = await taskService.getTaskDetail(event.detail.id);
					if (taskResult.data) {
						// Update the task in the array with the server state
						tasks = tasks.map((task) =>
							task.id === event.detail.id ? { ...task, ...taskResult.data } : task
						);
					}
				} catch (reloadError) {
					console.error('[handleStatusChange] Failed to reload task after error:', reloadError);
				}
			}
		} finally {
			loading = false;
		}
	}

	async function handlePriorityChange(event: CustomEvent<{ id: string; priority: string }>) {
		try {
			loading = true;
			error = null;

			const result = await taskService.updateTask(event.detail.id, {
				priority: event.detail.priority as 'low' | 'medium' | 'high',
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			// Update local state
			tasks = tasks.map((task) =>
				task.id === event.detail.id
					? { ...task, priority: event.detail.priority as 'low' | 'medium' | 'high' }
					: task
			);
		} catch (err: any) {
			error = err.message || 'Failed to update task priority';
		} finally {
			loading = false;
		}
	}

	async function handleDueDateChange(event: CustomEvent<{ id: string; due_date: string | null }>) {
		try {
			loading = true;
			error = null;

			const result = await taskService.updateTask(event.detail.id, {
				due_date: event.detail.due_date,
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			// Update local state
			tasks = tasks.map((task) =>
				task.id === event.detail.id ? { ...task, due_date: event.detail.due_date } : task
			);
		} catch (err: any) {
			error = err.message || 'Failed to update task due date';
		} finally {
			loading = false;
		}
	}

	function handleTaskDrop(event: CustomEvent<{ taskId: string; newStatusId: string }>) {
		// Map taskDrop event structure to statusChange event structure
		handleStatusChange({
			...event,
			detail: {
				id: event.detail.taskId,
				status_id: event.detail.newStatusId
			}
		} as any);
	}

	function handleTaskSelect(event: CustomEvent<{ id: string; selected: boolean }>) {
		if (event.detail.selected) {
			selectedTaskIds.add(event.detail.id);
		} else {
			selectedTaskIds.delete(event.detail.id);
		}
		selectedTaskIds = selectedTaskIds;
	}

	function handleFilterChange(event: CustomEvent) {
		taskViewStore.setFilters(event.detail);
		filterPanelOpen = false;
	}

	function handleFilterClear() {
		taskViewStore.clearFilters();
	}

	function handleFilterSave() {
		// TODO: Implement saved view creation (Phase 9 - US6)
		console.log('Save view functionality coming in Phase 9');
	}

	function toggleFilterPanel() {
		filterPanelOpen = !filterPanelOpen;
	}

	function handleNewTaskClick() {
		detailPanelTaskId = null; // null = create mode
		isDetailPanelOpen = true;
	}

	function handleWhatToDoNowClick() {
		showWhatToDoNow = !showWhatToDoNow;
	}

	function handleWhatToDoNowTaskSelect(taskId: string) {
		detailPanelTaskId = taskId;
		isDetailPanelOpen = true;
		showWhatToDoNow = false; // Close suggestions when task is selected
	}

	// FocusMode disabled - Post-MVP feature
	// function enterFocusMode(taskId: string) {
	// 	// Close detail panel first
	// 	isDetailPanelOpen = false;
	// 	detailPanelTaskId = null;
	// 	
	// 	// Activate focus mode (drawer will be hidden via display: none)
	// 	focusModeTaskId = taskId;
	// 	isFocusModeActive = true;
	// 	
	// 	// Save to localStorage
	// 	if (typeof window !== 'undefined') {
	// 		localStorage.setItem('focusModeTaskId', taskId);
	// 		document.body.classList.add('focus-mode-active');
	// 	}
	// }

	// function exitFocusMode() {
	// 	focusModeTaskId = null;
	// 	isFocusModeActive = false;
	// 	// Remove from localStorage
	// 	if (typeof window !== 'undefined') {
	// 		localStorage.removeItem('focusModeTaskId');
	// 		document.body.classList.remove('focus-mode-active');
	// 	}
	// }

	// function handleStartWorking(taskId: string) {
	// 	enterFocusMode(taskId);
	// }
	
	// Placeholder function to prevent errors
	function handleStartWorking(_taskId: string) {
		// FocusMode disabled - Post-MVP
		console.log('Focus Mode is disabled - Post-MVP feature');
	}

	// Delete handlers
	async function handleTaskDelete(event: CustomEvent<{ id: string }>) {
		const task = tasks.find(t => t.id === event.detail.id);
		if (!task) return;

		// Get dependency count from task
		const dependencyCount = (task as any).dependency_count || 0;

		taskToDelete = { id: task.id, title: task.title };
		deleteDependencyCount = dependencyCount;
		deleteModalOpen = true;
	}

	// Handle delete from detail panel (receives taskId directly, not as event)
	function handleTaskDeleteFromPanel(taskId: string) {
		const task = tasks.find(t => t.id === taskId);
		if (!task) return;

		// Get dependency count from task
		const dependencyCount = (task as any).dependency_count || 0;

		taskToDelete = { id: task.id, title: task.title };
		deleteDependencyCount = dependencyCount;
		deleteModalOpen = true;

		// Close detail panel
		handleDetailPanelClose();
	}

	async function confirmDelete() {
		if (!taskToDelete) return;

		try {
			loading = true;
			error = null;

			const currentUser = get(user);
			if (!currentUser?.id) {
				throw new Error('User not authenticated');
			}

			// Perform soft delete
			await taskApiService.softDelete(taskToDelete.id, currentUser.id);

			// Remove from local state
			tasks = tasks.filter(t => t.id !== taskToDelete.id);

			// Show success message
			celebrationMessage = `Task "${taskToDelete.title}" deleted successfully`;
			celebrationTrigger = true;

			// Close modal
			deleteModalOpen = false;
			taskToDelete = null;
		} catch (err) {
			console.error('Failed to delete task:', err);
			error = err instanceof Error ? err.message : 'Failed to delete task';
		} finally {
			loading = false;
		}
	}

	function cancelDelete() {
		deleteModalOpen = false;
		taskToDelete = null;
	}
</script>

<svelte:head>
	<title>Tasks - Cosplay Tracker</title>
</svelte:head>

<div class="tasks-page flex flex-col h-full">
	<!-- Page Header -->
	<div class="flex-shrink-0 border-b p-4" style="background-color: var(--theme-section-bg, rgba(255, 255, 255, 0.9)); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
		<div class="max-w-7xl mx-auto">
			<!-- Top Row -->
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-4">
					<div>
						<h1 class="text-2xl font-bold" style="color: var(--theme-foreground, #1c1917);">Tasks</h1>
						<p class="text-sm mt-1" style="color: var(--theme-text-muted, #78716c);">
							{sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
							{#if $activeFilterCount > 0}
								<span style="color: var(--theme-primary, #8b5cf6);">
									({$activeFilterCount} {$activeFilterCount === 1 ? 'filter' : 'filters'} active)
								</span>
							{/if}
						</p>
					</div>

					<!-- Daily Progress Bar -->
					{#if totalTasksCount > 0}
						<DailyProgressBar
							completedTasks={completedTasksCount}
							totalTasks={totalTasksCount}
						/>
					{/if}

					<!-- Streak Display -->
					<StreakDisplay
						bind:this={streakDisplayRef}
						onStreakBreak={(longestStreak) => {
							// Show encouragement when streak breaks
							if (longestStreak > 0) {
								celebration.celebrate(
									undefined,
									`Your best streak was ${longestStreak} days! You're doing great - keep going!`
								);
							}
						}}
					/>
				</div>

				<div class="flex items-center gap-3">
					<!-- Filter Button with Popover -->
					<DropdownMenu bind:open={filterPanelOpen} placement="bottom-end">
						{#snippet trigger()}
							<Button
								variant="outline"
								class={$activeFilterCount > 0 ? 'ring-2' : ''}
								style={$activeFilterCount > 0 ? '--tw-ring-color: var(--theme-primary, #8b5cf6);' : ''}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
									/>
								</svg>
								Filters
								{#if $activeFilterCount > 0}
									<span class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full" style="background-color: var(--theme-primary, #8b5cf6);">
										{$activeFilterCount}
									</span>
								{/if}
							</Button>
						{/snippet}
						
						{#snippet children()}
							<div class="w-[600px] max-h-[80vh] overflow-y-auto p-6">
								<TaskFilterPanel
									open={true}
									filters={$taskViewStore.filters}
									{statusOptions}
									{projectOptions}
									{assigneeOptions}
									{labelOptions}
									on:change={handleFilterChange}
									on:clear={handleFilterClear}
									on:save={handleFilterSave}
								/>
							</div>
						{/snippet}
					</DropdownMenu>

					<!-- New Task Button -->
					<Button
						onclick={()=>handleNewTaskClick()}
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						New Task
					</Button>
				</div>
			</div>

			<!-- Second Row: What Should I Do Now -->
			<div class="flex items-center justify-end mb-4">
				<Button
					variant="outline"
					onclick={handleWhatToDoNowClick}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors {showWhatToDoNow ? 'ring-2 ring-primary' : ''}"
					style="color: var(--theme-primary, #8b5cf6); background-color: color-mix(in srgb, var(--theme-primary, #8b5cf6) 10%, transparent); border-color: color-mix(in srgb, var(--theme-primary, #8b5cf6) 30%, transparent);"
					onmouseenter={(e) => {
						e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary, #8b5cf6) 20%, transparent)';
					}}
					onmouseleave={(e) => {
						e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-primary, #8b5cf6) 10%, transparent)';
					}}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
					What should I do now?
				</Button>
			</div>

			<!-- View Controls Row -->
			<div class="flex items-center justify-between">
				<ViewModeSelector
					value={$taskViewStore.viewMode}
					on:change={(e) => taskViewStore.setViewMode(e.detail)}
				/>

				<!-- Quick Actions -->
				{#if selectedTaskIds.size > 0}
					<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<span>{selectedTaskIds.size} selected</span>
						<Button variant="link" size="sm">
							Bulk Edit
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Filter Panel is now a popover - removed inline panel -->

	<!-- What To Do Now Panel (Collapsible) -->
	{#if showWhatToDoNow}
		<div class="flex-shrink-0 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
			<div class="max-w-7xl mx-auto">
				<WhatToDoNow onTaskSelect={handleWhatToDoNowTaskSelect} />
			</div>
		</div>
	{/if}

	<!-- Task Views -->
	<div class="flex-1 overflow-hidden">
		{#if viewMode === 'list'}
			<TaskListView
				tasks={sortedTasks as any}
				{statusOptions}
				selectable={true}
				bind:selectedIds={selectedTaskIds}
				on:taskClick={handleTaskClick}
				on:taskSelect={handleTaskSelect}
				on:statusChange={handleStatusChange}
				on:priorityChange={handlePriorityChange}
				on:dueDateChange={handleDueDateChange}
				on:delete={handleTaskDelete}
			/>
		{:else if viewMode === 'board'}
			{#if statusOptions.length > 0}
				<TaskBoardView
					tasks={sortedTasks as any}
					stages={statusOptions.map(opt => ({
						id: opt.value || '',
						name: opt.label || '',
						color: opt.color || undefined
					}))}
					{statusOptions}
					on:taskClick={handleTaskClick}
					on:statusChange={handleStatusChange}
					on:priorityChange={handlePriorityChange}
					on:dueDateChange={handleDueDateChange}
					on:delete={handleTaskDelete}
					on:addTask={handleAddTaskToStage}
					on:stageReorder={async (e) => {
						// Reload stages to get updated order
						const team = get(currentTeam);
						if (team) {
							const stages = await taskStageService.list(team.id);
							statusOptions = stages.map(s => ({
								value: s.id,
								label: s.name,
								color: s.color || undefined
							}));
						}
					}}
					on:stageColorChange={async (e) => {
						// Update the color in statusOptions
						const { stageId, color } = e.detail;
						statusOptions = statusOptions.map(opt => 
							opt.value === stageId 
								? { ...opt, color: color || undefined }
								: opt
						);
					}}
				/>
			{:else}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<p class="text-sm text-gray-500">No task stages available. Please configure task stages first.</p>
				</div>
			{/if}
		{:else if viewMode === 'table'}
			<TaskTableView
				tasks={sortedTasks as any}
				{statusOptions}
				{customFields}
				teamId={get(currentTeam)?.id}
				on:taskClick={handleTaskClick}
				on:statusChange={handleStatusChange}
				on:priorityChange={handlePriorityChange}
				on:dueDateChange={handleDueDateChange}
				on:titleChange={async (e) => {
					const { id, title } = e.detail;
					try {
						loading = true;
						const result = await taskService.updateTask(id, { title });
						if (result.error) throw result.error;
						tasks = tasks.map(t => t.id === id ? { ...t, title } : t);
					} catch (err: any) {
						error = err.message || 'Failed to update task title';
					} finally {
						loading = false;
					}
				}}
				on:delete={handleTaskDelete}
			/>
		{:else if viewMode === 'calendar'}
			<TaskCalendarView
				tasks={sortedTasks as any}
				on:taskClick={handleTaskClick}
			/>
		{:else if viewMode === 'timeline'}
			<TaskTimelineView
				tasks={sortedTasks as any}
				{statusOptions}
				on:taskClick={handleTaskClick}
			/>
		{/if}
	</div>
</div>

<!-- Focus Mode - Disabled (Post-MVP feature) -->
<!-- {#if isFocusModeActive && focusModeTaskId}
	<FocusMode
		taskId={focusModeTaskId}
		onExit={exitFocusMode}
	/>
{/if} -->

<!-- Task Detail Panel -->
<TaskDetailPanel
	bind:open={isDetailPanelOpen}
	taskId={detailPanelTaskId}
	initialData={detailPanelInitialData}
	onClose={handleDetailPanelClose}
	onSave={handleTaskSave}
	onStartWorking={handleStartWorking}
	onDelete={handleTaskDeleteFromPanel}
/>

<!-- Task Delete Modal -->
<TaskDeleteModal
	bind:open={deleteModalOpen}
	taskTitle={taskToDelete?.title || ''}
	dependencyCount={deleteDependencyCount}
	on:confirm={confirmDelete}
	on:cancel={cancelDelete}
/>

<!-- Celebration Animation -->
<CelebrationAnimation
	trigger={celebrationTrigger}
	message={celebrationMessage}
	enabled={celebrationEnabled}
	onComplete={() => {
		celebrationTrigger = false;
	}}
/>

<!-- Error Toast -->
{#if error}
	<ErrorToast
		message={error}
		title="Error"
		type="error"
		showRetry={true}
		on:dismiss={() => (error = null)}
		on:retry={() => (error = null)}
	/>
{/if}

<style>
	.tasks-page {
		height: calc(100vh - 64px); /* Adjust based on your header height */
	}
</style>

