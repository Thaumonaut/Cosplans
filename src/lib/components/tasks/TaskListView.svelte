<script lang="ts">
	/**
	 * TaskListView Component
	 *
	 * Renders tasks grouped by status in accordions with flexbox layout.
	 * Cards flow naturally with proper spacing using flexbox gap.
	 *
	 * Feature: 004-bugfix-testing T040 - Supports separate subtask viewing
	 */
	import { createEventDispatcher } from 'svelte';
	import { ChevronDown, ChevronRight, Check } from 'lucide-svelte';
	import TaskCard from './TaskCard.svelte';
	import { SubtaskService } from '$lib/services/subtask-service';
	import type { Subtask } from '$lib/types/tasks';

	interface Task {
		id: string;
		title: string;
		description?: string | null;
		status_id: string;
		priority: 'low' | 'medium' | 'high';
		due_date?: string | null;
		assigned_to?: string | null;
		labels?: Array<{ id: string; name: string; color: string }>;
		subtask_completion_percentage?: number;
		total_subtasks?: number;
		completed_subtasks?: number;
		assignee?: any;
	}

	interface Props {
		tasks: Task[];
		statusOptions?: Array<{ value: string; label: string; color?: string }>;
		selectable?: boolean;
		selectedIds?: Set<string>;
		showSubtaskToggle?: boolean; // Feature: 004-bugfix-testing T040
	}

	let {
		tasks,
		statusOptions = [],
		selectable = false,
		selectedIds = $bindable(new Set()),
		showSubtaskToggle = false // Feature: 004-bugfix-testing T040
	}: Props = $props();

	// Feature: 004-bugfix-testing T040 - Subtask aggregation control
	type SubtaskViewMode = 'together' | 'separate';
	let subtaskViewMode = $state<SubtaskViewMode>('together');
	let taskSubtasksMap = $state<Map<string, Subtask[]>>(new Map());
	let isLoadingSubtasks = $state(false);
	const subtaskService = new SubtaskService();

	// Fetch subtasks when switching to separate mode
	$effect(() => {
		if (subtaskViewMode === 'separate' && showSubtaskToggle) {
			loadSubtasksForTasks();
		}
	});

	async function loadSubtasksForTasks() {
		const tasksWithSubtasks = tasks.filter(t => (t.total_subtasks ?? 0) > 0);
		if (tasksWithSubtasks.length === 0) return;

		isLoadingSubtasks = true;
		try {
			const newMap = new Map<string, Subtask[]>();
			await Promise.all(
				tasksWithSubtasks.map(async (task) => {
					const response = await subtaskService.getSubtasks(task.id);
					if (response.data) {
						newMap.set(task.id, response.data);
					}
				})
			);
			taskSubtasksMap = newMap;
		} catch (err) {
			console.error('Failed to load subtasks:', err);
		} finally {
			isLoadingSubtasks = false;
		}
	}

	const dispatch = createEventDispatcher<{
		taskClick: { id: string };
		taskSelect: { id: string; selected: boolean };
		statusChange: { id: string; status_id: string };
		priorityChange: { id: string; priority: string };
		dueDateChange: { id: string; due_date: string | null };
		delete: { id: string };
	}>();

	// Group tasks by status
	const tasksByStatus = $derived.by(() => {
		const grouped: Record<string, Task[]> = {};
		
		tasks.forEach(task => {
			if (!grouped[task.status_id]) {
				grouped[task.status_id] = [];
			}
			grouped[task.status_id].push(task);
		});
		
		return grouped;
	});

	// Get status order based on statusOptions order, then add any missing statuses
	const statusOrder = $derived.by(() => {
		const ordered: string[] = [];
		
		// Add statuses in the order they appear in statusOptions
		statusOptions.forEach(opt => {
			if (tasksByStatus[opt.value]) {
				ordered.push(opt.value);
			}
		});
		
		// Add any statuses that aren't in statusOptions
		Object.keys(tasksByStatus).forEach(statusId => {
			if (!ordered.includes(statusId)) {
				ordered.push(statusId);
			}
		});
		
		return ordered;
	});

	// Track which status accordions are expanded (default: all expanded)
	let expandedStatuses = $state<Set<string>>(new Set());
	let initializedStatuses = $state<Set<string>>(new Set());

	// Initialize all statuses as expanded once when statusOrder is available
	$effect(() => {
		if (statusOrder.length > 0) {
			// Only add statuses that we haven't seen before (new statuses that appear)
			const newExpandedSet = new Set(expandedStatuses);
			const newInitializedSet = new Set(initializedStatuses);
			let changed = false;
			
			statusOrder.forEach(statusId => {
				// If this is a brand new status we've never initialized, add it as expanded
				if (!newInitializedSet.has(statusId)) {
					newExpandedSet.add(statusId);
					newInitializedSet.add(statusId);
					changed = true;
				}
			});
			
			if (changed) {
				expandedStatuses = newExpandedSet;
				initializedStatuses = newInitializedSet;
			}
		}
	});

	function toggleStatus(statusId: string) {
		console.log('Toggling status:', statusId, 'Current expanded:', Array.from(expandedStatuses));
		const newSet = new Set(expandedStatuses);
		if (newSet.has(statusId)) {
			newSet.delete(statusId);
			console.log('Closing status:', statusId);
		} else {
			newSet.add(statusId);
			console.log('Opening status:', statusId);
		}
		expandedStatuses = newSet;
		console.log('New expanded:', Array.from(expandedStatuses));
	}

	function getStatusLabel(statusId: string): string {
		return statusOptions.find(opt => opt.value === statusId)?.label || statusId;
	}

	function getStatusColor(statusId: string): string | undefined {
		return statusOptions.find(opt => opt.value === statusId)?.color;
	}

	function handleTaskClick(event: CustomEvent<{ id: string }>) {
		dispatch('taskClick', event.detail);
	}

	function handleTaskSelect(event: CustomEvent<{ id: string; selected: boolean }>) {
		if (event.detail.selected) {
			selectedIds.add(event.detail.id);
		} else {
			selectedIds.delete(event.detail.id);
		}
		selectedIds = selectedIds; // Trigger reactivity
		dispatch('taskSelect', event.detail);
	}

	function handleStatusChange(event: CustomEvent<{ id: string; status_id: string }>) {
		dispatch('statusChange', event.detail);
	}

	function handlePriorityChange(event: CustomEvent<{ id: string; priority: string }>) {
		dispatch('priorityChange', event.detail);
	}

	function handleDueDateChange(event: CustomEvent<{ id: string; due_date: string | null }>) {
		dispatch('dueDateChange', event.detail);
	}
</script>

<div
	class="task-list-container overflow-auto h-full"
	style="background-color: var(--theme-section-bg);"
>
	<!-- Feature: 004-bugfix-testing T040 - Subtask aggregation controls -->
	{#if showSubtaskToggle && tasks.length > 0}
		<div class="flex items-center justify-end px-4 py-2 border-b" style="border-color: var(--theme-border); background-color: var(--theme-card-bg);">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium" style="color: var(--theme-text-muted);">Subtasks:</span>
				<div class="inline-flex rounded-md border" style="border-color: var(--theme-border);" role="group">
					<button
						type="button"
						onclick={() => subtaskViewMode = 'together'}
						class="px-3 py-1 text-xs font-medium transition-colors {subtaskViewMode === 'together' ? '' : 'hover:bg-gray-50'}"
						style={subtaskViewMode === 'together'
							? 'background-color: var(--theme-primary); color: white;'
							: 'background-color: transparent; color: var(--theme-text-muted);'}
					>
						Together
					</button>
					<button
						type="button"
						onclick={() => subtaskViewMode = 'separate'}
						class="px-3 py-1 text-xs font-medium border-l transition-colors {subtaskViewMode === 'separate' ? '' : 'hover:bg-gray-50'}"
						style={subtaskViewMode === 'separate'
							? 'background-color: var(--theme-primary); color: white; border-left-color: rgba(255,255,255,0.3);'
							: 'background-color: transparent; color: var(--theme-text-muted); border-left-color: var(--theme-border);'}
					>
						Separate
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if tasks.length === 0}
		<!-- Empty State -->
		<div class="flex flex-col items-center justify-center h-full p-8 text-center">
			<svg
				class="w-16 h-16 mb-4"
				style="color: var(--theme-text-muted);"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
				/>
			</svg>
			<h3 class="text-lg font-semibold mb-2" style="color: var(--theme-foreground);">No tasks found</h3>
			<p class="text-sm" style="color: var(--theme-text-muted);">
				Try adjusting your filters or create a new task to get started.
			</p>
		</div>
	{:else}
		<!-- Tasks grouped by status in accordions -->
		<div class="flex flex-col gap-4 p-4">
			{#each statusOrder as statusId}
				{@const statusTasks = tasksByStatus[statusId] || []}
				{@const isExpanded = expandedStatuses.has(statusId)}
				{@const statusColor = getStatusColor(statusId)}
				{@const statusLabel = getStatusLabel(statusId)}
				
				{#if statusTasks.length > 0}
					<div class="flex flex-col gap-2">
						<!-- Accordion Header -->
						<button
							type="button"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								toggleStatus(statusId);
							}}
							class="flex items-center justify-between w-full px-4 py-3 rounded-lg border transition-colors hover:opacity-90"
							style="
								background-color: var(--theme-card-bg);
								border-color: var(--theme-border);
								color: var(--theme-foreground);
							"
						>
							<div class="flex items-center gap-3">
								{#if isExpanded}
									<ChevronDown class="w-4 h-4" style="color: var(--theme-text-muted);" />
								{:else}
									<ChevronRight class="w-4 h-4" style="color: var(--theme-text-muted);" />
								{/if}
								{#if statusColor}
									<span
										class="w-3 h-3 rounded-full"
										style="background-color: {statusColor}"
									></span>
								{/if}
								<span class="font-semibold text-sm">{statusLabel}</span>
								<span class="text-xs px-2 py-0.5 rounded-full" style="background-color: var(--theme-section-bg); color: var(--theme-text-muted);">
									{statusTasks.length}
								</span>
							</div>
						</button>

						<!-- Accordion Content -->
						{#if isExpanded}
							<div class="flex flex-col gap-3 px-4">
								{#each statusTasks as task (task.id)}
									<TaskCard
										{...task}
										{statusOptions}
										{selectable}
										selected={selectedIds.has(task.id)}
										viewMode="list"
										on:click={handleTaskClick}
										on:select={handleTaskSelect}
										on:statusChange={handleStatusChange}
										on:priorityChange={handlePriorityChange}
										on:dueDateChange={handleDueDateChange}
										on:delete
									/>

									<!-- Feature: 004-bugfix-testing T040 - Show subtasks as separate entries when in "separate" mode -->
									{#if subtaskViewMode === 'separate' && taskSubtasksMap.has(task.id)}
										{@const subtasks = taskSubtasksMap.get(task.id) || []}
										{#each subtasks as subtask (subtask.id)}
											<div
												class="ml-8 flex items-center gap-3 rounded-md border px-4 py-2.5 transition-colors hover:bg-gray-50"
												style="border-color: var(--theme-border); background-color: var(--theme-card-bg);"
											>
												<div class="flex h-5 w-5 items-center justify-center rounded border flex-shrink-0"
													style={subtask.completed
														? 'background-color: var(--theme-primary); border-color: var(--theme-primary);'
														: 'border-color: var(--theme-border);'}
												>
													{#if subtask.completed}
														<Check class="h-3 w-3 text-white" />
													{/if}
												</div>
												<span class="text-sm flex-1"
													style={subtask.completed
														? 'color: var(--theme-text-muted); text-decoration: line-through;'
														: 'color: var(--theme-foreground);'}
												>
													{subtask.title}
												</span>
												<span class="text-xs px-2 py-0.5 rounded" style="background-color: var(--theme-section-bg); color: var(--theme-text-muted);">
													Subtask
												</span>
											</div>
										{/each}
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.task-list-container {
		will-change: scroll-position;
	}
</style>
