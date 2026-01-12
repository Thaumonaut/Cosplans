<script lang="ts" >
	/**
	 * TaskBoardView Component
	 * 
	 * Renders tasks as a kanban board with columns by stage.
	 * Supports drag-and-drop between columns.
	 */
import { browser } from '$app/environment';
import { createEventDispatcher } from 'svelte';
import { tick } from 'svelte';
import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
import type { DndEvent } from 'svelte-dnd-action';
import TaskCard from './TaskCard.svelte';
import ColorPicker from '$lib/components/ui/color-picker.svelte';
import { taskStageService } from '$lib/api/services/taskStageService';
import { currentTeam, currentUserRole } from '$lib/stores/teams';
import { get } from 'svelte/store';
import { toast } from '$lib/stores/toast';
import { GripVertical } from 'lucide-svelte';
import { debounce } from '$lib/utils/performance';

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
	[SHADOW_ITEM_MARKER_PROPERTY_NAME]?: boolean;
	}

	interface Stage {
		id: string;
		name: string;
	color?: string | null;
	[SHADOW_ITEM_MARKER_PROPERTY_NAME]?: boolean;
	}

const STAGE_COLOR_CACHE_PREFIX = 'task-stage-colors-';
let stageColorCache: Record<string, string | null> | null = null;
let stageColorCacheTeamId: string | null = null;

function getActiveTeamId(): string | null {
	const team = get(currentTeam);
	return team?.id ?? null;
}

function getColorCacheKey(teamId: string | null) {
	return `${STAGE_COLOR_CACHE_PREFIX}${teamId ?? 'global'}`;
}

function loadStageColorCache(): Record<string, string | null> {
	if (!browser) return {};
	const teamId = getActiveTeamId();
	if (stageColorCache && stageColorCacheTeamId === teamId) {
		return stageColorCache;
	}
	stageColorCacheTeamId = teamId;
	if (!teamId) {
		stageColorCache = {};
		return stageColorCache;
	}
	try {
		const raw = window.localStorage.getItem(getColorCacheKey(teamId));
		stageColorCache = raw ? (JSON.parse(raw) as Record<string, string | null>) ?? {} : {};
	} catch (err) {
		// Failed to read cache, continue without it
		stageColorCache = {};
	}
	return stageColorCache ?? {};
}

function persistStageColorCache(cache: Record<string, string | null>) {
	if (!browser) return;
	const teamId = stageColorCacheTeamId;
	if (!teamId) return;
	try {
		window.localStorage.setItem(getColorCacheKey(teamId), JSON.stringify(cache));
	} catch (err) {
		// Failed to persist cache, continue without it
	}
}

function mergeColorsFromCache(stages: Stage[]): Stage[] {
	if (!browser || stages.length === 0) return stages;
	const cache = loadStageColorCache();
	let updated = false;

	const merged = stages.map((stage) => {
		const color = stage.color;
		const cached = cache[stage.id];
		if ((color === undefined || color === null || color === '') && cached !== undefined) {
			updated = true;
			return { ...stage, color: cached };
		}
		return stage;
	});

	return updated ? merged : stages;
}

function recordStageColors(stages: Stage[]): void {
	if (!browser || stages.length === 0) return;
	const cache = loadStageColorCache();
	let mutated = false;

	for (const stage of stages) {
		if (stage.color !== undefined) {
			const normalized = stage.color ?? null;
			if (cache[stage.id] !== normalized) {
				cache[stage.id] = normalized;
				mutated = true;
			}
		}
	}

	if (mutated) {
		persistStageColorCache(cache);
	}
}

function applyStageColors(source: Stage[]): Stage[] {
	const cloned = source.map((stage) => ({ ...stage }));
	const merged = mergeColorsFromCache(cloned);
	recordStageColors(merged);
	return merged;
}

function applyStageColorsInPlace(stages: Stage[]): Stage[] {
	if (stages.length === 0) {
		return stages;
	}

	if (browser) {
		const cache = loadStageColorCache();
		for (const stage of stages) {
			const cached = cache[stage.id];
			if (
				(stage.color === undefined || stage.color === null || stage.color === '') &&
				cached !== undefined
			) {
				stage.color = cached;
			}
		}
	}

	recordStageColors(stages);
	return stages;
	}

	interface Props {
		tasks: Task[];
		stages: Stage[];
		statusOptions?: Array<{ value: string; label: string; color?: string }>;
	}

	let { tasks, stages: stagesProp, statusOptions = [] }: Props = $props();

	const dispatch = createEventDispatcher<{
		taskClick: { id: string };
		statusChange: { id: string; status_id: string };
		priorityChange: { id: string; priority: string };
		dueDateChange: { id: string; due_date: string | null };
		delete: { id: string };
		taskDrop: { taskId: string; newStatusId: string };
		addTask: { stageId: string };
		stageReorder: { stageIds: string[] };
		stageColorChange: { stageId: string; color: string | null };
	}>();

// Task drag state (declared early for use in column drag handlers)
let boardContainer: HTMLElement | null = $state(null);
let isDragging = $state(false); // Track if a drag is currently in progress
let collapsedColumns = $state(new Set<string>()); // Track which columns are collapsed
let autoExpandedColumnId: string | null = $state(null); // Track single auto-expanded column during drag
let draggedSourceStage: string | null = $state(null);
let lastHoveredStageId: string | null = null;
let currentDragItemId: string | null = $state(null);
let finalizedZones = $state(new Set<string>()); // Track which zones have finalized

// Column drag state for svelte-dnd-action (declared early for use in handlers)
let isHoveringColumnHandle = $state(false);
let columnDragStartElement: HTMLElement | null = $state(null);
let isDraggingColumn = $state(false);
let originalColumnStages: Stage[] | null = $state(null);
// Counter to force dndzone re-initialization after column drag
let taskZoneRefreshKey = $state(0);

// Reactive stages array for column reordering
// Initialize from prop and sync when prop changes (including colors)
const initialStageState = applyStageColors(stagesProp);
let stages = $state<Stage[]>(initialStageState.map((stage) => ({ ...stage })));
let columnStages = $state<Stage[]>(initialStageState);

// Create a map of stage IDs to their latest data (for color lookups)
const stageMap = $derived.by(() => {
	const source = columnStages.length > 0 ? columnStages : stages;
	return new Map(source.map((stage) => [stage.id, stage]));
});


// Initialize columnStages on mount
// IMPORTANT: Apply cache only for stages missing colors from Supabase
$effect(() => {
	if (columnStages.length === 0 && stagesProp.length > 0) {
		// First pass: use colors from props (Supabase) if available
		const withPropColors = stagesProp.map(s => ({ ...s }));
		// Second pass: fill in missing colors from cache
		const initialStages = applyStageColors(withPropColors);
		columnStages = initialStages;
		stages = initialStages.map((stage) => ({ ...stage }));
	}
});

// Sync stages when prop changes (including colors), preserving local reordering during drag
$effect(() => {
	// Track stagesProp to ensure reactivity - access the array and colors
	const propStages = stagesProp;
	
		
		// Only sync if we're not currently dragging a column
		if (!isDraggingColumn) {
			// Store current state before reading to avoid loop
			const currentColumnStages = columnStages;
			const currentStages = stages;
			
			// Update columnStages - merge prop data into existing order to preserve reordering
			// IMPORTANT: Always prefer prop color if it exists (from Supabase), only use local/cached if prop is null/undefined
			let newColumnStages = currentColumnStages.length > 0 
				? currentColumnStages.map(colStage => {
					const propStage = propStages.find(s => s.id === colStage.id);
					if (!propStage) return colStage;
					return {
						...propStage,
						// Prefer prop color (from Supabase) if it exists, otherwise use local/cached
						color: propStage.color !== undefined && propStage.color !== null 
							? propStage.color 
							: (colStage.color !== undefined ? colStage.color : propStage.color),
						name: colStage.name ?? propStage.name,
						description: (colStage as any).description ?? (propStage as any).description
					};
				})
				: [...propStages];

			// Apply cache only for stages that don't have colors from Supabase
			newColumnStages = applyStageColors(newColumnStages);
			
			// Check if any colors or data changed
			const dataChanged = newColumnStages.length !== currentColumnStages.length || 
				newColumnStages.some((s, i) => {
					const old = currentColumnStages[i];
					return !old || old.id !== s.id || old.color !== s.color || old.name !== s.name;
				});
			
			// Only update if something actually changed to prevent loops
			if (dataChanged) {
				columnStages = newColumnStages;
			}
			
			// Update stages array (used for other logic) - don't read from stages inside
			// IMPORTANT: Always prefer prop color if it exists (from Supabase), only use local/cached if prop is null/undefined
			let newStages = propStages.map(propStage => {
				const existing = currentStages.find(s => s.id === propStage.id);
				if (!existing) return propStage;
				return {
					...propStage,
					// Prefer prop color (from Supabase) if it exists, otherwise use local/cached
					color: propStage.color !== undefined && propStage.color !== null
						? propStage.color
						: (existing.color !== undefined ? existing.color : propStage.color),
					name: existing.name ?? propStage.name
				};
			});

			// Apply cache only for stages that don't have colors from Supabase
			newStages = applyStageColors(newStages);
			
			// Only update if changed
			const stagesChanged = newStages.length !== currentStages.length || 
				newStages.some((s, i) => {
					const old = currentStages[i];
					return !old || old.id !== s.id || old.color !== s.color || old.name !== s.name;
				});
			
			if (stagesChanged) {
				stages = newStages;
			}
		}
	});

	// Check if user can edit (owner or editor)
	const canEdit = $derived(() => {
		const role = get(currentUserRole);
		return role === 'owner' || role === 'editor';
	});


// Create reactive arrays for each stage's tasks
let stageTasks: Record<string, Task[]> = $state(
	stages.reduce((acc, stage) => {
		acc[stage.id] = tasks.filter((task) => task.status_id === stage.id);
		return acc;
	}, {} as Record<string, Task[]>)
);

	// Use stageTasks state for reactive task arrays
	const tasksByStage = $derived(stageTasks);

	// Calculate subtask counts per stage
	const stageSubtaskCounts = $derived(
		stages.reduce((acc, stage) => {
			const tasksForStage = tasksByStage[stage.id] || [];
			const totalSubtasks = tasksForStage.reduce((sum, task) => sum + (task.total_subtasks || 0), 0);
			const completedSubtasks = tasksForStage.reduce((sum, task) => sum + (task.completed_subtasks || 0), 0);
			acc[stage.id] = {
				total: totalSubtasks,
				completed: completedSubtasks
			};
			return acc;
		}, {} as Record<string, { total: number; completed: number }>)
	);

	function toggleColumnCollapse(stageId: string) {
		if (collapsedColumns.has(stageId)) {
			collapsedColumns.delete(stageId);
		} else {
			collapsedColumns.add(stageId);
		}
		collapsedColumns = new Set(collapsedColumns); // Trigger reactivity
	}

const debouncedColorUpdate = debounce(
	async (stageId: string, color: string | null, previousColor: string | null | undefined) => {
		if (!canEdit()) return;

		try {
			await taskStageService.update(stageId, { color: color ?? null });
			dispatch('stageColorChange', { stageId, color });
			toast.success('Color updated', 'Stage color has been changed');
		} catch (err: any) {
			toast.error('Failed to update color', err.message || 'Unknown error');
			console.error('Failed to update stage color:', err);

			// Revert to the previous color if the update fails
			const fallbackColor = previousColor ?? undefined;
			stages = stages.map((s) => (s.id === stageId ? { ...s, color: fallbackColor } : s));
			columnStages = columnStages.map((s) =>
				s.id === stageId ? { ...s, color: fallbackColor } : s
			);
			recordStageColors(columnStages);
		}
	},
	300
);

// Handle stage color change
function handleStageColorChange(stageId: string, color: string | null) {
	if (!canEdit()) return;

	const normalizedColor = color ?? null;
	const previousColor = stageMap.get(stageId)?.color;

	// Optimistically update local state for immediate visual feedback
	stages = stages.map((s) =>
		s.id === stageId ? { ...s, color: normalizedColor } : s
	);
	columnStages = columnStages.map((s) =>
		s.id === stageId ? { ...s, color: normalizedColor } : s
	);

	recordStageColors(columnStages);

	debouncedColorUpdate(stageId, normalizedColor, previousColor);
}

// Handle column reordering with svelte-dnd-action
function handleColumnConsider(e: CustomEvent) {
	const { items, info } = e.detail;

	if (info?.trigger === 'dragStarted') {
		originalColumnStages = columnStages.slice();
	}

	// CRITICAL: Always update items so svelte-dnd-action can manage placeholders
	// Pass items through as-is during drag - svelte-dnd-action needs the exact structure
	// We'll clean IDs only in finalize to avoid breaking internal tracking
	columnStages = items as Stage[];

	if (!info) {
		return;
	}

	// When drag starts, confirm it originated from the handle
	if (info.trigger === 'dragStarted') {
		const isValidStart = !!columnDragStartElement && canEdit() && !isDragging;
		isDraggingColumn = isValidStart;

		if (!isValidStart) {
			originalColumnStages = null;
			// Immediately revert to the canonical order to avoid visual glitches
			columnDragStartElement = null;
			isHoveringColumnHandle = false;
			isDraggingColumn = false; // Ensure it's reset
			columnStages = applyStageColors(stages);
		}
	}
}

async function handleColumnFinalize(e: CustomEvent) {
	const { items, info } = e.detail;
	const wasValidDrag = !!info && canEdit() && !!columnDragStartElement && isDraggingColumn;

	if (!wasValidDrag) {
		isDraggingColumn = false;
		isHoveringColumnHandle = false;
		columnDragStartElement = null;
		// Reset to prop order if drag was cancelled
		columnStages = applyStageColors(stages);
		return;
	}

	try {
		const team = get(currentTeam);
		if (!team) {
			toast.error('No team', 'Cannot reorder stages without an active team');
			const resetStages = applyStageColors(stagesProp);
			columnStages = resetStages;
			stages = resetStages.map((stage) => ({ ...stage }));
			// Reset drag state before returning
			isDraggingColumn = false;
			isHoveringColumnHandle = false;
			columnDragStartElement = null;
			return;
		}

		// Determine new order based on items emitted by svelte-dnd-action
		const orderedStageIds = (items as Stage[])
			.filter((item) => item && !(item as any)[SHADOW_ITEM_MARKER_PROPERTY_NAME])
			.map((item) => String(item.id ?? '').replace(/:dnd-shadow-placeholder.*$/, ''))
			.filter((id) => id && id.length > 0);

		const uniqueStageIds: string[] = [];
		const seen = new Set<string>();

		for (const id of orderedStageIds) {
			if (!seen.has(id)) {
				seen.add(id);
				uniqueStageIds.push(id);
			}
		}

		// Append any stages that might be missing (safety for edge cases)
		const currentOrder = (columnStages.length > 0 ? columnStages : stages)
			.map((s) => s.id)
			.filter((id): id is string => typeof id === 'string' && id.length > 0);
		for (const id of currentOrder) {
			if (!seen.has(id)) {
				seen.add(id);
				uniqueStageIds.push(id);
			}
		}

		const lookupSource =
			originalColumnStages && originalColumnStages.length > 0
				? originalColumnStages
				: columnStages.length > 0
				? columnStages
				: stages;
		const originalMap = new Map(
			lookupSource
				.filter((stage) => stage.id)
				.map((stage) => [stage.id, stage] as [string, Stage])
		);

		const reorderedStages = uniqueStageIds
			.map((id) => originalMap.get(id) ?? stages.find((s) => s.id === id) ?? stagesProp.find((s) => s.id === id))
			.filter((stage): stage is Stage => !!stage)
			.map((stage, index) => {
				const target = stage;
				if ('displayOrder' in target) {
					target.displayOrder = index;
				}
				if ((target as any)[SHADOW_ITEM_MARKER_PROPERTY_NAME]) {
					delete (target as any)[SHADOW_ITEM_MARKER_PROPERTY_NAME];
				}
				return target;
			});

		applyStageColorsInPlace(reorderedStages);

		columnStages = [...reorderedStages];
		stages = reorderedStages.map((stage) => ({ ...stage }));
		const stageIds = uniqueStageIds;

		// Column drag is complete at this point; re-enable task dragging immediately
		isDraggingColumn = false;
		isHoveringColumnHandle = false;
		columnDragStartElement = null;
		originalColumnStages = null;

		// Wait for DOM to update so dndzone can properly re-enable
		await tick();

		// Force task zones to re-initialize by incrementing refresh key
		// This ensures the {#key} block changes and recreates the dndzone action
		taskZoneRefreshKey += 1;

		// Also refresh task arrays to ensure reactivity
		const refreshedStageTasks: Record<string, Task[]> = {};
		for (const stageId of Object.keys(stageTasks)) {
			refreshedStageTasks[stageId] = [...stageTasks[stageId]];
		}
		stageTasks = refreshedStageTasks;

		// Save new order to backend
		await taskStageService.reorder(team.id, stageIds);

		dispatch('stageReorder', { stageIds });
		toast.success('Columns reordered', 'Stage order has been updated');
	} catch (err: any) {
		toast.error('Failed to reorder', err.message || 'Unknown error');
		console.error('Failed to reorder columns:', err);
		// Reload stages to reset
		const team = get(currentTeam);
		if (team) {
			const reloaded = await taskStageService.list(team.id);
			const sorted = reloaded.sort((a, b) => a.displayOrder - b.displayOrder);
			const applied = applyStageColors(sorted);
			columnStages = applied;
			stages = applied.map((stage) => ({ ...stage }));
		}
	} finally {
		isDraggingColumn = false;
		isHoveringColumnHandle = false;
		columnDragStartElement = null;
		originalColumnStages = null;
	}
}

// Track when drag starts from handle
function handleColumnHandlePointerDown(event: PointerEvent) {
	if (!canEdit() || isDragging) return;

	const handle = event.currentTarget as HTMLElement | null;
	if (handle) {
		columnDragStartElement = handle;
		isHoveringColumnHandle = true;
	}
}

function handleColumnHandlePointerUp() {
	// Only clear if we're not actively dragging (pointer up without drag start)
	if (!isDraggingColumn) {
		columnDragStartElement = null;
		isHoveringColumnHandle = false;
	}
}

function handleColumnHandlePointerCancel() {
	// Cancel always clears drag state
	isDraggingColumn = false;
	columnDragStartElement = null;
	isHoveringColumnHandle = false;
}

// Check if mouse is over any column handle (for visual feedback)
function checkHandleHover(e: MouseEvent) {
	if (!canEdit() || isDragging || isDraggingColumn) {
		return;
	}
	
	const target = e.target as HTMLElement;
	const isOverHandle = target.closest('.column-drag-handle') !== null;
	isHoveringColumnHandle = isOverHandle;
	}

	function handleTaskClick(event: CustomEvent<{ id: string }>) {
		dispatch('taskClick', event.detail);
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

	// Create reactive arrays for each stage's tasks
	function shallowEqualTask(a: Task, b: Task) {
		if (a === b) return true;
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		if (keysA.length !== keysB.length) return false;
		for (const key of keysA) {
			const typedKey = key as keyof Task;
			if (a[typedKey] !== b[typedKey]) {
				return false;
			}
		}
		return true;
	}

	// Update stage tasks when tasks prop changes
	// Skip update during drag to prevent interference with drag preview
	$effect(() => {
		// Don't update during drag - svelte-dnd-action manages the DOM during drag
		if (isDragging) {
			return;
		}

		// Build next snapshot from the incoming tasks prop
		const nextStageTasks = stages.reduce((acc, stage) => {
			acc[stage.id] = tasks.filter((task) => task.status_id === stage.id);
			return acc;
		}, {} as Record<string, Task[]>);

		let mergedStageTasks: Record<string, Task[]> = { ...stageTasks };
		let shouldUpdate = false;

		for (const stage of stages) {
			const stageId = stage.id;
			const currentItems = stageTasks[stageId] || [];
			const nextItems = nextStageTasks[stageId] || [];

			const currentIds = new Set(currentItems.map((task) => task.id));
			const nextIds = new Set(nextItems.map((task) => task.id));

			const idsChanged =
				currentIds.size !== nextIds.size ||
				[...currentIds].some((id) => !nextIds.has(id)) ||
				[...nextIds].some((id) => !currentIds.has(id));

			if (idsChanged) {
				// Items were added/removed/moved between stages – accept incoming order
				mergedStageTasks[stageId] = nextItems;
				shouldUpdate = true;
			} else {
				// Same set of items – preserve current order but update task data
				const nextItemMap = new Map(nextItems.map((task) => [task.id, task]));
				let dataMutated = false;
				for (let i = 0; i < currentItems.length; i += 1) {
					const currentTask = currentItems[i];
					const nextTask = nextItemMap.get(currentTask.id);
					if (nextTask && !shallowEqualTask(currentTask, nextTask)) {
						Object.assign(currentTask, nextTask);
						dataMutated = true;
					}
				}
				if (dataMutated) {
					mergedStageTasks = { ...mergedStageTasks, [stageId]: [...currentItems] };
					shouldUpdate = true;
				}
			}
		}

		if (shouldUpdate) {
			stageTasks = mergedStageTasks;
		}
	});

	// Auto-scroll when dragging near horizontal edges
	function handleAutoScroll(event: MouseEvent | TouchEvent) {
		if (!boardContainer) return;

		const clientX = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
		if (clientX === undefined) return;

		const containerRect = boardContainer.getBoundingClientRect();
		const scrollThreshold = 100; // Distance from edge to trigger scroll (in pixels)
		const scrollSpeed = 10; // Pixels to scroll per frame
		
		const distanceFromLeft = clientX - containerRect.left;
		const distanceFromRight = containerRect.right - clientX;

		// Scroll left if near left edge
		if (distanceFromLeft < scrollThreshold && boardContainer.scrollLeft > 0) {
			const scrollAmount = Math.min(scrollSpeed, boardContainer.scrollLeft);
			boardContainer.scrollBy({ left: -scrollAmount, behavior: 'auto' });
		}
		
		// Scroll right if near right edge
		if (distanceFromRight < scrollThreshold) {
			const maxScroll = boardContainer.scrollWidth - boardContainer.clientWidth;
			if (boardContainer.scrollLeft < maxScroll) {
				const scrollAmount = Math.min(scrollSpeed, maxScroll - boardContainer.scrollLeft);
				boardContainer.scrollBy({ left: scrollAmount, behavior: 'auto' });
			}
		}
	}

	// Function to check which column is being hovered based on mouse position
	// This works for both expanded and collapsed columns
	function getHoveredColumnId(mouseX: number, mouseY: number): string | null {
		if (!boardContainer) return null;
		
		// Check all board columns - this includes collapsed columns
		const boardColumns = boardContainer.querySelectorAll('.board-column');
		for (const column of boardColumns) {
			const rect = column.getBoundingClientRect();
			// Check if mouse is within column bounds (even if collapsed)
			if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
				// Get stage ID directly from board-column (most reliable)
				const stageId = (column as HTMLElement).getAttribute('data-stage-id');
				if (stageId) return stageId;
			}
		}
		
		return null;
	}

	function handleDragMove(e: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		const mouseX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
		const mouseY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
		if (mouseX !== null && mouseY !== null) {
			handleAutoScroll(e);
			const hoveredStageId = getHoveredColumnId(mouseX, mouseY);
		if (hoveredStageId !== lastHoveredStageId) {
			lastHoveredStageId = hoveredStageId ?? null;
		}
			if (hoveredStageId && collapsedColumns.has(hoveredStageId)) {
			if (autoExpandedColumnId !== hoveredStageId) {
				autoExpandedColumnId = hoveredStageId;
			}
			} else if (autoExpandedColumnId !== null) {
				autoExpandedColumnId = null;
			}
		}
	}

function handleConsider(e: CustomEvent<DndEvent<Task>>, stageId: string) {
		const { items, info } = e.detail;
	const typedItems = items as Task[];
		
		// CRITICAL: Always update items - this includes the insertion placeholder when dragging
		// The library manages the items array and includes placeholders during drag
		// Per svelte-dnd-action docs: each zone should independently update its items array
	stageTasks = { ...stageTasks, [stageId]: typedItems };

		if (!info) {
			return;
		}

		const { trigger, id } = info;
		currentDragItemId = id ?? currentDragItemId;

		if (!isDragging && trigger === 'dragStarted') {
			// Clear column drag state when task drag starts
			columnDragStartElement = null;
			isHoveringColumnHandle = false;
			
			isDragging = true;
			draggedSourceStage = stageId;
			finalizedZones = new Set(); // Reset finalized zones tracking
			document.addEventListener('mousemove', handleDragMove, { passive: true });
			document.addEventListener('touchmove', handleDragMove, { passive: true });
		}

		if (isDragging && trigger === 'draggedEntered' && collapsedColumns.has(stageId)) {
			autoExpandedColumnId = stageId;
		}
	}

function handleFinalize(e: CustomEvent<DndEvent<Task>>, stageId: string) {
		const { items, info } = e.detail;
		const typedItems = items as Task[];
		
		// CRITICAL: Per svelte-dnd-action docs, each zone should independently update its items array
		// The library handles cross-zone moves automatically - when an item is moved between zones,
		// BOTH zones get finalize calls: source zone gets items without the moved item,
		// target zone gets items with the moved item added
		stageTasks = { ...stageTasks, [stageId]: typedItems };
		
		// Track that this zone has finalized (create new Set for reactivity)
		finalizedZones = new Set([...finalizedZones, stageId]);

		// Dispatch status change event for parent to update backend
		// Only dispatch if this is the target zone (where the item was dropped)
		// Check if item was moved between columns by comparing draggedSourceStage
		if (info && draggedSourceStage && draggedSourceStage !== stageId) {
			const detail = info as any;
			const dragInfo = {
				id: (detail as any)?.id as string | undefined,
				activeIndex: (detail as any)?.activeIndex as number | undefined,
				dragged: (detail as any)?.dragged,
				draggedContext: (detail as any)?.draggedContext
			};
			const draggedItemId =
				dragInfo.id ??
				(dragInfo.dragged as any)?.id ??
				(dragInfo.draggedContext as any)?.id ??
				currentDragItemId ??
				(dragInfo.activeIndex !== undefined && dragInfo.activeIndex !== null
					? typedItems[dragInfo.activeIndex]?.id
					: null);
			const draggedItem = draggedItemId
				? typedItems.find((task) => task.id === draggedItemId)
				: undefined;
			if (!draggedItem && dragInfo.activeIndex !== undefined && dragInfo.activeIndex !== null) {
				// Fallback: use the item at the reported index if available
				const fallbackItem = typedItems[dragInfo.activeIndex];
				if (fallbackItem) {
					currentDragItemId = fallbackItem.id;
					dispatch('statusChange', { id: fallbackItem.id, status_id: stageId });
				}
			} else if (draggedItem) {
				currentDragItemId = draggedItem.id;
				dispatch('statusChange', { id: draggedItem.id, status_id: stageId });
			}
		}

		// Clean up drag state AFTER both zones have finalized (for cross-column moves)
		// or immediately (for same-column moves)
		const sourceStageId = draggedSourceStage;
		const isCrossColumnMove = !!info && !!sourceStageId && sourceStageId !== stageId;
		const bothZonesFinalized = isCrossColumnMove && 
			sourceStageId !== null &&
			finalizedZones.has(sourceStageId) && 
			finalizedZones.has(stageId);
		
		if (bothZonesFinalized || !isCrossColumnMove) {
			// Both zones have finalized OR it's not a cross-column move - clean up
			// Use tick() to wait for parent's synchronous optimistic update to complete
			// This ensures the $effect doesn't overwrite our stageTasks updates
			if (isCrossColumnMove) {
				tick().then(() => {
					isDragging = false;
				});
			} else {
				isDragging = false;
			}
			
			// Clean up drag state
			autoExpandedColumnId = null;
			draggedSourceStage = null;
			currentDragItemId = null;
			lastHoveredStageId = null;
			finalizedZones = new Set();
			document.removeEventListener('mousemove', handleDragMove);
			document.removeEventListener('touchmove', handleDragMove);
		}
	}
</script>

<div 
	class="task-board-container flex gap-4 overflow-x-auto h-full p-4"
	bind:this={boardContainer}
	role="group"
	aria-label="Task board columns"
	onmousemove={checkHandleHover}
	onpointerup={handleColumnHandlePointerUp}
	onpointercancel={handleColumnHandlePointerCancel}
	use:dndzone={{
		items: columnStages,
		type: 'column',
		flipDurationMs: 150,
		dragDisabled: !canEdit() || isDragging || (!isHoveringColumnHandle && !isDraggingColumn)
	}}
	onconsider={handleColumnConsider}
	onfinalize={handleColumnFinalize}
>
	{#each columnStages as stage (stage.id || `stage-${columnStages.indexOf(stage)}`)}
		{@const stageId = String(stage.id || '').replace(/:dnd-shadow-placeholder.*$/, '')}
		{@const latestStage = stageMap.get(stageId) || stage}
		{@const stageColor = latestStage.color || stage.color}
		{@const tasksForStage = tasksByStage[stageId] || []}
		{@const isCollapsed = collapsedColumns.has(stageId)}
		{@const isVisuallyExpanded = autoExpandedColumnId === stageId}
		{@const subtaskCounts = stageSubtaskCounts[stageId] || { total: 0, completed: 0 }}
		{@const effectiveWidth = (isCollapsed && !isVisuallyExpanded) ? '80px' : '320px'}
		{@const effectivePadding = (isCollapsed && !isVisuallyExpanded) ? '0.75rem' : '1rem'}
		{@const columnBgColor = stageColor ? `color-mix(in srgb, ${stageColor} 10%, var(--theme-section-bg))` : 'var(--theme-section-bg)'}
		{@const columnBorderColor = stageColor ? `color-mix(in srgb, ${stageColor} 30%, transparent)` : 'var(--theme-border)'}
		<div
			class="board-column flex-shrink-0 rounded-lg flex flex-col transition-all duration-300"
			style="background-color: {columnBgColor}; border: 1px solid {columnBorderColor}; width: {effectiveWidth}; padding: {effectivePadding};"
			data-stage-id={stageId}
			data-is-dnd-shadow-item-hint={stage[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
		>
			<!-- Always render the full structure - use CSS to hide/show content -->
			<!-- Column Header - Expanded View -->
			<div 
				class="flex items-center justify-between mb-4 transition-opacity duration-300"
				style="opacity: {(isCollapsed && !isVisuallyExpanded) ? '0' : '1'}; pointer-events: {(isCollapsed && !isVisuallyExpanded) ? 'none' : 'auto'}; position: {(isCollapsed && !isVisuallyExpanded) ? 'absolute' : 'relative'}; width: {(isCollapsed && !isVisuallyExpanded) ? '0' : 'auto'}; overflow: hidden;"
			>
				<div class="flex items-center gap-2 flex-1">
					<!-- Drag Handle for Column Reordering -->
					{#if canEdit()}
						<button
							type="button"
							class="column-drag-handle w-4 h-4 cursor-grab active:cursor-grabbing flex items-center justify-center"
							title="Drag to reorder columns"
							aria-label={`Drag ${stage.name} column`}
							style="color: var(--theme-text-muted); background: none; border: none; padding: 0;"
							onpointerdown={handleColumnHandlePointerDown}
							onpointerup={handleColumnHandlePointerUp}
							onpointercancel={handleColumnHandlePointerCancel}
							onmouseenter={(e) => {
								if (e.currentTarget instanceof HTMLElement) {
									e.currentTarget.style.color = 'var(--theme-foreground)';
									isHoveringColumnHandle = true;
								}
							}}
							onmouseleave={(e) => {
								if (e.currentTarget instanceof HTMLElement) {
									e.currentTarget.style.color = 'var(--theme-text-muted)';
									// Only clear if not dragging
									if (!isDraggingColumn) {
										isHoveringColumnHandle = false;
									}
								}
							}}
						>
							<GripVertical class="w-4 h-4" />
						</button>
					{/if}
					<button
						type="button"
						class="inline-flex items-center justify-center rounded-md p-1 text-sm transition-colors hover:bg-muted"
						aria-label="Collapse {stage.name} column"
						style="color: var(--theme-text-muted);"
						onclick={() => toggleColumnCollapse(stage.id)}
						onmouseenter={(e: MouseEvent) => {
							if (e.currentTarget instanceof HTMLElement) {
								e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)';
							}
						}}
						onmouseleave={(e: MouseEvent) => {
							if (e.currentTarget instanceof HTMLElement) {
								e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)';
							}
						}}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>
					<!-- Color Picker for Stage Color -->
					{#if canEdit()}
						<ColorPicker
							id={`board-stage-color-${stageId}`}
							value={stageColor ?? ''}
							dataStageId={stageId}
							onchange={(color) => handleStageColorChange(stageId, color)}
						/>
					{:else if stageColor}
						<div class="w-3 h-3 rounded-full" style="background-color: {stageColor}"></div>
					{/if}
					<h3 class="text-sm font-semibold" style="color: var(--theme-foreground);">
						{stage.name}
					</h3>
					<span class="text-xs" style="color: var(--theme-text-muted);">
						{tasksForStage.length}
					</span>
				</div>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted"
					aria-label="Add task to {stage.name}"
					style="color: var(--theme-text-muted, #78716c);"
					onclick={() => dispatch('addTask', { stageId: stage.id })}
					onmouseenter={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)';
						}
					}}
					onmouseleave={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)';
						}
					}}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</button>
			</div>

			<!-- Column Header - Collapsed View -->
			<div 
				class="flex flex-col items-center gap-2 transition-opacity duration-300"
				style="opacity: {(isCollapsed && !isVisuallyExpanded) ? '1' : '0'}; pointer-events: {(isCollapsed && !isVisuallyExpanded) ? 'auto' : 'none'}; position: {(isCollapsed && !isVisuallyExpanded) ? 'relative' : 'absolute'}; width: {(isCollapsed && !isVisuallyExpanded) ? 'auto' : '0'}; overflow: hidden;"
			>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-md p-1 text-sm transition-colors hover:bg-muted w-full"
					aria-label="Expand {stage.name} column"
					style="color: var(--theme-text-muted, #78716c);"
					onclick={() => toggleColumnCollapse(stage.id)}
					onmouseenter={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)';
						}
					}}
					onmouseleave={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)';
						}
					}}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
				{#if stage.color}
					<div class="w-3 h-3 rounded-full" style="background-color: {stage.color}"></div>
				{/if}
				<div class="flex flex-col items-center gap-1">
					<h3 
						class="text-xs font-semibold text-center" 
						style="color: var(--theme-foreground); writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);"
					>
						{stage.name}
					</h3>
					<div class="text-xs text-center" style="color: var(--theme-text-muted);">
						<div>{tasksForStage.length}</div>
						{#if subtaskCounts.total > 0}
							<div class="text-[10px] mt-0.5">{subtaskCounts.completed}/{subtaskCounts.total}</div>
						{/if}
					</div>
				</div>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium transition-colors hover:bg-muted w-full mt-auto"
					aria-label="Add task to {stage.name}"
					style="color: var(--theme-text-muted, #78716c);"
					onclick={() => dispatch('addTask', { stageId: stage.id })}
					onmouseenter={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)';
						}
					}}
					onmouseleave={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)';
						}
					}}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</button>
			</div>

			<!-- Tasks in Column - Always render, hide with CSS when collapsed -->
			<!-- CRITICAL: Keep pointer-events enabled even when collapsed so drag can trigger auto-expand -->
			{#key `${stage.id}-${taskZoneRefreshKey}`}
			<div 
				class="{tasksForStage.length === 0 && isDragging ? 'task-column' : 'space-y-3 overflow-y-auto task-column flex-1 min-h-0'}" 
				style="max-height: calc(100vh - 250px); {tasksForStage.length === 0 && isDragging ? 'min-height: 0 !important; height: 0 !important; padding: 0 !important; margin: 0 !important; overflow: visible;' : 'min-height: 400px;'} opacity: {(isCollapsed && !isVisuallyExpanded) ? '0' : '1'}; pointer-events: auto; position: relative;"
				data-stage-id={stage.id}
				data-dnd-enabled={!isDraggingColumn}
				use:dndzone={{
					items: tasksForStage,
					type: 'task',
					flipDurationMs: 150,
					dragDisabled: isDraggingColumn
				}}
				onconsider={(e) => handleConsider(e, stage.id)}
				onfinalize={(e) => handleFinalize(e, stage.id)}
			>
				{#if tasksForStage.length === 0 && !isDragging}
					<div
						class="border-2 border-dashed rounded-lg p-8 text-center flex-1 flex items-center justify-center"
						style="border-color: var(--theme-border); min-height: 400px;"
					>
						<p class="text-sm" style="color: var(--theme-text-muted);">
							Drop tasks here or click + to add
						</p>
					</div>
				{:else if tasksForStage.length === 0 && isDragging}
					<!-- Empty column when dragging - completely empty, container collapsed to zero height -->
					<!-- This ensures ghost appears at the top of the column container -->
				{:else}
					<!-- 
						Custom shadow element support:
						- SHADOW_ITEM_MARKER_PROPERTY_NAME identifies placeholder items added during drag
						- Include it in the key to ensure proper reactivity (per svelte-dnd-action docs)
						- data-is-dnd-shadow-item-hint helps prevent unnecessary work in nested zones
						- shadow-placeholder class provides custom styling that ensures visibility
					-->
					{#each tasksForStage as task (`${task.id}${task[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? "_" + task[SHADOW_ITEM_MARKER_PROPERTY_NAME] : ""}`)}
						<div 
							class="task-card-wrapper {task[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? 'shadow-placeholder' : ''}" 
							data-task-id={task.id}
							data-is-dnd-shadow-item-hint={task[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
						>
						<TaskCard
							{...task}
							{statusOptions}
							viewMode="board"
							draggable={true}
							on:click={handleTaskClick}
							on:statusChange={handleStatusChange}
							on:priorityChange={handlePriorityChange}
							on:dueDateChange={handleDueDateChange}
							on:delete
						/>
						</div>
					{/each}
				{/if}
			</div>
			{/key}
		</div>
	{/each}
</div>

<style>
	.task-board-container {
		contain: layout;
	}

	.board-column {
		min-height: 400px;
		/* Ensure the column takes full available height */
		height: 100%;
	}

	.task-column {
		min-height: 400px;
		/* Ensure the task column takes full height of board-column */
		flex: 1 1 auto;
		/* Add padding to bottom to ensure drops work at the bottom of the column */
		padding-bottom: 1rem;
	}

	/* Prevent text selection during drag attempts - allows drag to initiate properly */
	.task-card-wrapper {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	/* Re-enable text selection for interactive elements inside cards */
	.task-card-wrapper input,
	.task-card-wrapper textarea,
	.task-card-wrapper [contenteditable] {
		user-select: text;
		-webkit-user-select: text;
		-moz-user-select: text;
		-ms-user-select: text;
	}

	/* Prevent transitions from affecting drag preview - fixes disappearing elements */
	:global(.dnd-zone-item--dragging *),
	:global(.dnd-zone-item--dragging .task-card-wrapper),
	:global(.dnd-zone-item--dragging .task-card-wrapper *),
	:global(.dnd-zone-item--dragging .task-card),
	:global(.dnd-zone-item--dragging .task-card *) {
		transition: none !important;
		animation: none !important;
		/* Ensure visibility but don't override parent opacity */
		visibility: visible !important;
		display: revert !important;
	}

	/* Style the dragged item - keep it visible */
	:global(.dnd-zone-item--dragging) {
		opacity: 0.8 !important;
		will-change: transform;
		z-index: 9999 !important;
		pointer-events: none !important;
		/* Let library handle positioning */
		visibility: visible !important;
		display: block !important;
	}

	/* Ensure insertion placeholder is visible */
	:global(.dnd-zone-item--inserted),
	:global(.dnd-zone-item--inserted *) {
		transition: none !important;
		animation: none !important;
		opacity: 0.5 !important;
		visibility: visible !important;
		display: block !important;
		pointer-events: none !important;
		border: 2px dashed var(--theme-border) !important;
	}

	/* Custom shadow placeholder styling - ensures it never disappears */
	.shadow-placeholder,
	.shadow-placeholder * {
		opacity: 0.6 !important;
		visibility: visible !important;
		display: block !important;
		pointer-events: none !important;
		transition: none !important;
		animation: none !important;
		/* Add visual distinction for the placeholder */
		border: 2px dashed var(--theme-border) !important;
		background-color: var(--theme-section-bg) !important;
		position: relative !important;
	}

	/* Ensure shadow placeholder has proper height */
	.shadow-placeholder .task-card {
		min-height: 200px !important;
		opacity: 0.6 !important;
	}

	/* Additional styling for shadow items identified by data attribute */
	:global([data-is-dnd-shadow-item-hint]) {
		opacity: 0.6 !important;
		visibility: visible !important;
		display: block !important;
		pointer-events: none !important;
	}
</style>

