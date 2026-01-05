<script lang="ts">
	/**
	 * TaskCard Component
	 *
	 * Displays informative task summary in list/board views.
	 * Shows title, description, priority, assignee, labels, due date, subtasks, and other relevant info.
	 * Always shows placeholders for missing data to encourage completion.
	 * Supports drag-and-drop, inline editing, and navigation to detail view.
	 * Uses ClickableCard base component for consistent behavior.
	 */
import { createEventDispatcher } from 'svelte';
	import ClickableCard from '$lib/components/ui/clickable-card.svelte';
	import PrioritySelector from '$lib/components/base/PrioritySelector.svelte';
	import { DatePicker, DropdownMenu } from '$lib/components/ui';
	import { MoreVertical, Trash2 } from 'lucide-svelte';

	interface Props {
		// Task data
		id: string;
		title: string;
		description?: string | null;
		status_id: string;
		priority?: 'low' | 'medium' | 'high';
		due_date?: string | null;
		assigned_to?: string | null;
		labels?: Array<{ id: string; name: string; color: string }>;
		subtask_completion_percentage?: number;
		total_subtasks?: number;
		completed_subtasks?: number;
		// Options for inline editing
		statusOptions?: Array<{ value: string; label: string; color?: string }>;
		// Assignee info
		assignee?: { id: string; email: string; first_name?: string; last_name?: string; avatar_url?: string } | null;
		// View mode
		viewMode?: 'list' | 'board';
		// Interaction flags
		draggable?: boolean;
		selectable?: boolean;
		selected?: boolean;
	}

	let {
		id,
		title,
		description = null,
		status_id,
		priority = 'medium',
		due_date = null,
		assigned_to = null,
		labels = [],
		subtask_completion_percentage = undefined,
		total_subtasks = 0,
		completed_subtasks = 0,
		statusOptions = [],
		assignee = null,
		viewMode = 'list',
		draggable: isDraggable = true,
		selectable = false,
		selected = $bindable(false)
	}: Props = $props();
	
	const dispatch = createEventDispatcher<{
		click: { id: string };
		select: { id: string; selected: boolean };
		statusChange: { id: string; status_id: string };
		priorityChange: { id: string; priority: string };
		dueDateChange: { id: string; due_date: string | null };
		delete: { id: string };
	}>();

	let dateValue = $state(due_date || '');
	let dropdownOpen = $state(false);

	// Sync dateValue when due_date prop changes
	$effect(() => {
		dateValue = due_date || '';
	});

	function handleCardClick() {
		dispatch('click', { id });
	}

	function handleSelectChange(event: Event) {
		event.stopPropagation();
		const checked = (event.target as HTMLInputElement).checked;
		selected = checked;
		dispatch('select', { id, selected: checked });
	}

	function handleStatusChange(event: CustomEvent<string>) {
		event.stopPropagation?.();
		dispatch('statusChange', { id, status_id: event.detail });
	}

	async function handlePriorityChange(newPriority: 'low' | 'medium' | 'high') {
		dispatch('priorityChange', { id, priority: newPriority });
	}

	function handleDueDateChange(newValue: string | null) {
		dateValue = newValue || '';
		dispatch('dueDateChange', { id, due_date: newValue });
	}

	function handleDelete(event: Event) {
		event.stopPropagation();
		dropdownOpen = false; // Close dropdown before opening modal
		dispatch('delete', { id });
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Not set';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
	}

	// Helper to safely parse date
	function parseDateSafe(dateString: string | null): Date | null {
		if (!dateString) return null;
		const date = new Date(dateString);
		return isNaN(date.getTime()) ? null : date;
	}

	const dueDate = $derived(parseDateSafe(due_date));
	const isOverdue = dueDate && dueDate < new Date();
	const isDueSoon = dueDate && !isOverdue && (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 3;

	// Format description for display (truncate if too long)
	const displayDescription = $derived(
		description 
			? (description.length > 100 ? description.substring(0, 100) + '...' : description)
			: null
	);
</script>

<ClickableCard
	onclick={handleCardClick}
	{selected}
	draggable={false}
	dragData={null}
	class="task-card rounded-lg p-4 hover:shadow-lg transition-all border-[var(--theme-border)] {viewMode === 'board' ? 'mb-5 min-h-[200px]' : 'mb-5'} {isDraggable && viewMode === 'board' ? 'cursor-grab' : ''} relative"
>

	<!-- Header Row: Checkbox, Title, Actions -->
	<div class="flex items-start gap-3 mb-2">
		<!-- Checkbox (if selectable) -->
		{#if selectable}
			<input
				type="checkbox"
				checked={selected}
				onchange={(e) => {
					e.stopPropagation();
					handleSelectChange(e);
				}}
				onclick={(e) => e.stopPropagation()}
				style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); color: var(--theme-primary, #8b5cf6); --tw-ring-color: var(--theme-primary, #8b5cf6);"
				class="no-click-propagation mt-1.5 rounded border-2 focus:ring-2"
			/>
		{/if}

		<!-- Title -->
		<h3 class="flex-1 text-base font-semibold line-clamp-2 leading-tight" style="color: var(--theme-foreground, #1c1917);">
			{title}
		</h3>

		<!-- Actions Menu -->
		<div class="shrink-0" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="none">
			<DropdownMenu bind:open={dropdownOpen}>
				{#snippet trigger()}
					<button
						data-testid="task-{id}-actions"
						class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						aria-label="Task actions"
					>
						<MoreVertical class="w-4 h-4" style="color: var(--theme-text-muted, #78716c);" />
					</button>
				{/snippet}
				{#snippet children()}
					<button
						onclick={handleDelete}
						class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
					>
						<Trash2 class="w-4 h-4" />
						<span>Delete</span>
					</button>
				{/snippet}
			</DropdownMenu>
		</div>
	</div>

	<!-- Priority Tag (under title) -->
	<div class="mb-3 tag-selector" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="none">
		<PrioritySelector
			currentPriority={priority}
			editable={true}
			onPriorityChange={handlePriorityChange}
		/>
	</div>

	<!-- Description -->
	{#if displayDescription}
		<p class="text-sm mb-3 line-clamp-2" style="color: var(--theme-text-muted, #78716c);">
			{displayDescription}
		</p>
	{:else}
		<p class="text-xs italic mb-3" style="color: var(--theme-text-muted, #78716c);">
			No description — click to add one
		</p>
	{/if}

	<!-- Metadata Grid: Due Date, Assignee, Subtasks -->
	<div class="grid grid-cols-1 gap-2 mb-3">
		<!-- Due Date (always shown) -->
		<div class="flex items-center gap-2 text-sm" style="color: var(--theme-foreground, #1c1917);">
			<svg class="w-4 h-4 shrink-0" style="color: var(--theme-text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
			</svg>
			<div class="flex items-center gap-2 flex-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="none">
				<span class="shrink-0" style="color: var(--theme-text-muted);">Due Date:</span>
				<div class="inline-flex items-center gap-1 min-w-0">
					<DatePicker
						value={dateValue}
						placeholder="Not set"
						onchange={handleDueDateChange}
						class="text-sm min-w-[100px] text-[var(--theme-text-muted)]!"
					/>
				</div>
				{#if dueDate}
					{#if isOverdue}
						<span class="text-xs font-medium shrink-0" style="color: var(--theme-error, #ef4444);">Overdue</span>
					{:else if isDueSoon}
						<span class="text-xs font-medium shrink-0" style="color: var(--theme-warning, #f59e0b);">Due soon</span>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Assignee (always shown with placeholder) -->
		<div class="flex items-center gap-2">
			{#if assignee}
				<div class="flex items-center gap-2">
					{#if assignee.avatar_url}
						<img
							src={assignee.avatar_url}
							alt={assignee.first_name || assignee.email || ''}
							class="w-6 h-6 rounded-full"
						/>
					{:else}
						<div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style="background-color: var(--theme-primary); color: var(--theme-card-bg);">
							{(assignee.first_name?.[0] || assignee.email?.[0] || '?').toUpperCase()}
						</div>
					{/if}
					<span class="text-sm" style="color: var(--theme-foreground, #1c1917);">
						{assignee.first_name || (assignee.email ? assignee.email.split('@')[0] : 'Unknown')}
					</span>
				</div>
			{:else}
				<div class="flex items-center gap-2 text-xs italic" style="color: var(--theme-text-muted, #78716c);">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
					<span>Unassigned — click to assign</span>
				</div>
			{/if}
		</div>

		<!-- Subtasks (always shown) -->
		<div class="flex items-center gap-2">
			<svg class="w-4 h-4" style="color: var(--theme-text-muted, #78716c);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
			<span class="text-sm" style="color: var(--theme-text-muted, #78716c);">
				{completed_subtasks || 0}/{total_subtasks || 0} subtasks
			</span>
			{#if total_subtasks > 0}
				<span class="text-xs" style="color: var(--theme-text-muted, #78716c);">
					({subtask_completion_percentage || 0}% complete)
				</span>
			{:else}
				<span class="text-xs italic" style="color: var(--theme-text-muted, #78716c);">
					— click to break down
				</span>
			{/if}
		</div>
	</div>

	<!-- Subtask Progress Bar (only when subtasks exist) -->
	{#if total_subtasks > 0}
		<div class="mb-3">
			<div class="w-full rounded-full h-2" style="background-color: var(--theme-border-subtle, rgba(120, 113, 108, 0.1));">
				<div
					class="h-2 rounded-full transition-all duration-300"
					style="width: {subtask_completion_percentage || 0}%; background-color: var(--theme-primary, #8b5cf6);"
				></div>
			</div>
		</div>
	{/if}

	<!-- Labels and Additional Tags -->
	<div class="flex flex-wrap gap-1.5 items-center mb-3">
		{#if labels.length > 0}
			{#each labels.slice(0, 3) as label}
				<span
					class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
					style="background-color: {label.color}20; color: {label.color}; border: 1px solid {label.color}40"
				>
					{label.name}
				</span>
			{/each}
			{#if labels.length > 3}
				<span class="inline-flex items-center px-2 py-0.5 text-xs" style="color: var(--theme-text-muted, #78716c);">
					+{labels.length - 3} more
				</span>
			{/if}
		{/if}
		<!-- Spot for additional tags -->
		<span class="inline-flex items-center px-2 py-0.5 text-xs italic border border-dashed rounded-full" style="color: var(--theme-text-muted, #78716c); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			+ Add tag
		</span>
	</div>

	<!-- Status (only in list view, hidden in board view since column shows it) -->
	{#if viewMode === 'list'}
		<div class="pt-3 border-t flex items-center gap-2" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			<span class="text-xs font-medium" style="color: var(--theme-text-muted, #78716c);">Status:</span>
			{#if statusOptions && statusOptions.length > 0}
				{@const currentStatus = statusOptions.find(opt => opt.value === status_id)}
				<div class="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border" 
					style="background-color: var(--theme-card-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
					role="none"
				>
					{#if currentStatus?.color}
						<span
							class="w-2 h-2 rounded-full"
							style="background-color: {currentStatus.color}"
						></span>
					{/if}
					<span>{currentStatus?.label || status_id}</span>
				</div>
			{:else}
				<span class="text-xs" style="color: var(--theme-text-muted, #78716c);">{status_id}</span>
			{/if}
		</div>
	{/if}
</ClickableCard>


<style>
	.task-card:global(.dragging) {
		opacity: 0.5;
		transform: rotate(2deg);
		cursor: grabbing;
	}

	.task-card.cursor-grab:active {
		cursor: grabbing;
	}

	/* Prevent transitions on drag preview - fixes disappearing elements during drag */
	:global(.dnd-zone-item--dragging) .task-card,
	:global(.dnd-zone-item--dragging) .task-card *,
	:global(.dnd-zone-item--dragging) .task-card-wrapper,
	:global(.dnd-zone-item--dragging) .task-card-wrapper * {
		transition: none !important;
		animation: none !important;
		/* Force all properties to immediate change */
		transition-property: none !important;
		transition-duration: 0s !important;
		transition-delay: 0s !important;
		transition-timing-function: none !important;
		/* Ensure visibility */
		opacity: 1 !important;
		visibility: visible !important;
		display: revert !important;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

</style>
