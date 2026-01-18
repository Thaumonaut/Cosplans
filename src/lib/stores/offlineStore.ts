/**
 * Offline sync store
 * Feature: 004-bugfix-testing - User Story 4
 * Manages offline sync state, queue, and conflict resolution
 */

import { writable, derived, get } from 'svelte/store';
import type {
	SyncProgress,
	SyncQueueItem,
	SyncConflict,
	NetworkStatus,
	SyncConfig,
	ConflictResolution,
	ConflictResolutionStrategy
} from '$lib/types/offline';
import {
	getOfflineDB,
	getNetworkMonitor,
	SyncQueueManager,
	type CosplansOfflineDB
} from '$lib/utils/offlineSync';

/**
 * Network status store
 */
function createNetworkStore() {
	const { subscribe, set } = writable<NetworkStatus>({
		is_online: typeof navigator !== 'undefined' ? navigator.onLine : true,
		last_check_at: new Date().toISOString()
	});

	let unsubscribe: (() => void) | null = null;

	// Initialize network monitor
	if (typeof window !== 'undefined') {
		const monitor = getNetworkMonitor();
		unsubscribe = monitor.subscribe((status) => {
			set(status);
		});
	}

	return {
		subscribe,
		destroy: () => {
			if (unsubscribe) {
				unsubscribe();
			}
		}
	};
}

export const networkStatus = createNetworkStore();

/**
 * Sync progress store
 */
function createSyncProgressStore() {
	const { subscribe, set, update } = writable<SyncProgress>({
		total_items: 0,
		completed_items: 0,
		failed_items: 0,
		pending_items: 0,
		in_progress_items: 0,
		conflicts: 0,
		is_syncing: false
	});

	let syncManager: SyncQueueManager | null = null;

	async function refresh() {
		if (!syncManager) {
			syncManager = new SyncQueueManager();
		}
		const progress = await syncManager.getProgress();
		set(progress);
	}

	return {
		subscribe,
		refresh,
		markSyncing: (isSyncing: boolean) => {
			update((state) => ({ ...state, is_syncing: isSyncing }));
		}
	};
}

export const syncProgress = createSyncProgressStore();

/**
 * Sync queue store
 */
function createSyncQueueStore() {
	const { subscribe, set } = writable<SyncQueueItem[]>([]);
	const db = getOfflineDB();

	async function load() {
		const items = await db.syncQueue.toArray();
		set(items);
	}

	async function enqueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'attempt_count' | 'created_at'>) {
		const manager = new SyncQueueManager();
		await manager.enqueue(item);
		await load();
		await syncProgress.refresh();
	}

	async function clearCompleted() {
		const manager = new SyncQueueManager();
		await manager.clearCompleted();
		await load();
		await syncProgress.refresh();
	}

	async function retryItem(itemId: string) {
		const manager = new SyncQueueManager();
		await manager.retryItem(itemId);
		await load();
		await syncProgress.refresh();
	}

	return {
		subscribe,
		load,
		enqueue,
		clearCompleted,
		retryItem
	};
}

export const syncQueue = createSyncQueueStore();

/**
 * Conflicts store
 */
function createConflictsStore() {
	const { subscribe, set, update } = writable<SyncConflict[]>([]);
	const db = getOfflineDB();

	async function load() {
		const conflicts = await db.conflicts.toArray();
		set(conflicts);
	}

	async function resolveConflict(
		itemId: string,
		strategy: ConflictResolutionStrategy,
		resolvedValue?: Record<string, unknown>
	) {
		const conflicts = get({ subscribe });
		const conflict = conflicts.find((c) => c.item_id === itemId);
		if (!conflict) return;

		// Apply resolution
		let finalValue: Record<string, unknown>;
		switch (strategy) {
			case 'use_local':
				finalValue = conflict.local_version;
				break;
			case 'use_remote':
				finalValue = conflict.remote_version;
				break;
			case 'merge':
				// Simple merge: remote overrides local except for specified fields
				finalValue = { ...conflict.remote_version, ...conflict.local_version };
				break;
			case 'user_prompt':
				if (!resolvedValue) {
					throw new Error('Resolved value required for user_prompt strategy');
				}
				finalValue = resolvedValue;
				break;
		}

		// Store resolution (in a real app, this would update the entity)
		const resolution: ConflictResolution = {
			conflict_id: itemId,
			strategy,
			resolved_value: finalValue,
			resolved_at: new Date().toISOString(),
			resolved_by: 'current_user' // TODO: Get from auth store
		};

		// Remove from conflicts
		await db.conflicts.delete(itemId);
		await load();
		await syncProgress.refresh();

		return resolution;
	}

	return {
		subscribe,
		load,
		resolveConflict
	};
}

export const conflicts = createConflictsStore();

/**
 * Derived store: is online
 */
export const isOnline = derived(networkStatus, ($networkStatus) => $networkStatus.is_online);

/**
 * Derived store: has pending items
 */
export const hasPendingSync = derived(
	syncProgress,
	($syncProgress) => $syncProgress.pending_items > 0 || $syncProgress.failed_items > 0
);

/**
 * Derived store: has conflicts
 */
export const hasConflicts = derived(syncProgress, ($syncProgress) => $syncProgress.conflicts > 0);

/**
 * Sync configuration store
 */
export const syncConfig = writable<SyncConfig>({
	auto_sync: true,
	sync_interval_ms: 30000,
	max_retry_attempts: 3,
	retry_delay_ms: 2000,
	conflict_resolution_strategy: 'user_prompt',
	enable_compression: false
});

/**
 * Auto-sync controller
 */
let autoSyncInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoSync(processFn: (item: SyncQueueItem) => Promise<void>) {
	const config = get(syncConfig);
	if (!config.auto_sync) return;

	// Clear existing interval
	if (autoSyncInterval) {
		clearInterval(autoSyncInterval);
	}

	// Start new interval
	autoSyncInterval = setInterval(async () => {
		const online = get(isOnline);
		const hasPending = get(hasPendingSync);

		if (online && hasPending) {
			await processSync(processFn);
		}
	}, config.sync_interval_ms);
}

export function stopAutoSync() {
	if (autoSyncInterval) {
		clearInterval(autoSyncInterval);
		autoSyncInterval = null;
	}
}

/**
 * Process sync queue
 */
export async function processSync(processFn: (item: SyncQueueItem) => Promise<void>) {
	syncProgress.markSyncing(true);
	try {
		const manager = new SyncQueueManager(get(syncConfig));
		await manager.processPendingItems(processFn);
		await syncQueue.load();
		await syncProgress.refresh();
	} finally {
		syncProgress.markSyncing(false);
	}
}

/**
 * Initialize offline store
 */
export async function initOfflineStore() {
	// Load initial data
	await Promise.all([
		syncQueue.load(),
		syncProgress.refresh(),
		conflicts.load()
	]);

	// Subscribe to network changes
	networkStatus.subscribe((status) => {
		if (status.is_online) {
			// Trigger sync when coming online
			syncProgress.refresh();
		}
	});
}

/**
 * Cleanup function
 */
export function destroyOfflineStore() {
	stopAutoSync();
	networkStatus.destroy();
}



