/**
 * Offline sync utilities using IndexedDB (Dexie.js)
 * Feature: 004-bugfix-testing - User Story 4
 */

import Dexie, { type Table } from 'dexie';
import type {
	SyncQueueItem,
	SyncConflict,
	OfflineCache,
	LocalTaskData,
	LocalTeamData,
	NetworkStatus,
	SyncProgress,
	SyncConfig,
	DEFAULT_SYNC_CONFIG
} from '$lib/types/offline';

/**
 * Dexie database schema for offline storage
 */
export class CosplansOfflineDB extends Dexie {
	// Tables
	syncQueue!: Table<SyncQueueItem, string>;
	conflicts!: Table<SyncConflict, string>;
	cache!: Table<OfflineCache, string>;
	tasks!: Table<LocalTaskData, string>;
	teams!: Table<LocalTeamData, string>;

	constructor() {
		super('CosplansOfflineDB');

		// Define schema
		this.version(1).stores({
			syncQueue: 'id, status, operation_type, created_at, user_id',
			conflicts: 'item_id, entity_type, entity_id, detected_at',
			cache: 'key, cached_at, expires_at',
			tasks: 'id, team_id, is_dirty, sync_version, updated_at',
			teams: 'id, owner_id, is_dirty, sync_version, updated_at'
		});
	}

	/**
	 * Clear all expired cache entries
	 */
	async clearExpiredCache(): Promise<number> {
		const now = new Date().toISOString();
		const expired = await this.cache.where('expires_at').below(now).toArray();
		await this.cache.bulkDelete(expired.map((item) => item.key));
		return expired.length;
	}

	/**
	 * Get cache item if not expired
	 */
	async getCacheItem<T = unknown>(key: string): Promise<T | null> {
		const item = await this.cache.get(key);
		if (!item) return null;

		if (item.expires_at && new Date(item.expires_at) < new Date()) {
			await this.cache.delete(key);
			return null;
		}

		return item.value as T;
	}

	/**
	 * Set cache item with optional expiration
	 */
	async setCacheItem(key: string, value: unknown, expiresInMs?: number): Promise<void> {
		const cached_at = new Date().toISOString();
		const expires_at = expiresInMs
			? new Date(Date.now() + expiresInMs).toISOString()
			: undefined;

		await this.cache.put({
			key,
			value,
			cached_at,
			expires_at
		});
	}
}

// Singleton instance
let dbInstance: CosplansOfflineDB | null = null;

export function getOfflineDB(): CosplansOfflineDB {
	if (!dbInstance) {
		dbInstance = new CosplansOfflineDB();
	}
	return dbInstance;
}

/**
 * Network status detection
 */
export class NetworkMonitor {
	private listeners: Set<(status: NetworkStatus) => void> = new Set();
	private currentStatus: NetworkStatus = {
		is_online: navigator.onLine,
		last_check_at: new Date().toISOString()
	};

	constructor() {
		if (typeof window !== 'undefined') {
			window.addEventListener('online', this.handleOnline);
			window.addEventListener('offline', this.handleOffline);
		}
	}

	private handleOnline = () => {
		this.updateStatus(true);
	};

	private handleOffline = () => {
		this.updateStatus(false);
	};

	private updateStatus(is_online: boolean) {
		this.currentStatus = {
			is_online,
			last_check_at: new Date().toISOString(),
			connection_quality: is_online ? this.checkConnectionQuality() : 'offline'
		};
		this.notifyListeners();
	}

	private checkConnectionQuality(): 'excellent' | 'good' | 'poor' {
		// Check connection quality using navigator.connection if available
		if ('connection' in navigator) {
			const conn = (navigator as any).connection;
			if (conn.effectiveType === '4g') return 'excellent';
			if (conn.effectiveType === '3g') return 'good';
			return 'poor';
		}
		return 'good'; // Default assumption
	}

	private notifyListeners() {
		this.listeners.forEach((listener) => listener(this.currentStatus));
	}

	public subscribe(listener: (status: NetworkStatus) => void): () => void {
		this.listeners.add(listener);
		// Immediately notify with current status
		listener(this.currentStatus);
		// Return unsubscribe function
		return () => {
			this.listeners.delete(listener);
		};
	}

	public getStatus(): NetworkStatus {
		return this.currentStatus;
	}

	public destroy() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('online', this.handleOnline);
			window.removeEventListener('offline', this.handleOffline);
		}
		this.listeners.clear();
	}
}

// Singleton network monitor
let networkMonitorInstance: NetworkMonitor | null = null;

export function getNetworkMonitor(): NetworkMonitor {
	if (!networkMonitorInstance) {
		networkMonitorInstance = new NetworkMonitor();
	}
	return networkMonitorInstance;
}

/**
 * Sync queue manager
 */
export class SyncQueueManager {
	private db: CosplansOfflineDB;
	private config: SyncConfig;
	private isProcessing = false;

	constructor(config: Partial<SyncConfig> = {}) {
		this.db = getOfflineDB();
		this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
	}

	/**
	 * Add item to sync queue
	 */
	async enqueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'attempt_count' | 'created_at'>): Promise<string> {
		const queueItem: SyncQueueItem = {
			...item,
			id: crypto.randomUUID(),
			status: 'pending',
			attempt_count: 0,
			created_at: new Date().toISOString()
		};

		await this.db.syncQueue.add(queueItem);
		return queueItem.id;
	}

	/**
	 * Get sync progress
	 */
	async getProgress(): Promise<SyncProgress> {
		const items = await this.db.syncQueue.toArray();
		const conflicts = await this.db.conflicts.count();

		return {
			total_items: items.length,
			completed_items: items.filter((i) => i.status === 'completed').length,
			failed_items: items.filter((i) => i.status === 'failed').length,
			pending_items: items.filter((i) => i.status === 'pending').length,
			in_progress_items: items.filter((i) => i.status === 'in_progress').length,
			conflicts,
			is_syncing: this.isProcessing
		};
	}

	/**
	 * Process pending queue items
	 */
	async processPendingItems(
		processFn: (item: SyncQueueItem) => Promise<void>
	): Promise<{ success: number; failed: number }> {
		if (this.isProcessing) {
			return { success: 0, failed: 0 };
		}

		this.isProcessing = true;
		let success = 0;
		let failed = 0;

		try {
			const pending = await this.db.syncQueue
				.where('status')
				.equals('pending')
				.or('status')
				.equals('failed')
				.filter((item) => item.attempt_count < item.max_attempts)
				.toArray();

			for (const item of pending) {
				try {
					// Update status to in_progress
					await this.db.syncQueue.update(item.id, {
						status: 'in_progress',
						last_attempt_at: new Date().toISOString()
					});

					// Process the item
					await processFn(item);

					// Mark as completed
					await this.db.syncQueue.update(item.id, {
						status: 'completed'
					});

					success++;
				} catch (error) {
					const attempt_count = item.attempt_count + 1;
					const status = attempt_count >= item.max_attempts ? 'failed' : 'pending';

					await this.db.syncQueue.update(item.id, {
						status,
						attempt_count,
						error_message: error instanceof Error ? error.message : 'Unknown error'
					});

					failed++;
				}
			}
		} finally {
			this.isProcessing = false;
		}

		return { success, failed };
	}

	/**
	 * Clear completed items
	 */
	async clearCompleted(): Promise<number> {
		const completed = await this.db.syncQueue.where('status').equals('completed').toArray();
		await this.db.syncQueue.bulkDelete(completed.map((item) => item.id));
		return completed.length;
	}

	/**
	 * Get failed items
	 */
	async getFailedItems(): Promise<SyncQueueItem[]> {
		return await this.db.syncQueue.where('status').equals('failed').toArray();
	}

	/**
	 * Retry failed item
	 */
	async retryItem(itemId: string): Promise<void> {
		await this.db.syncQueue.update(itemId, {
			status: 'pending',
			attempt_count: 0,
			error_message: undefined
		});
	}
}

/**
 * Utility to mark entities as dirty (needs sync)
 */
export async function markTaskAsDirty(taskId: string): Promise<void> {
	const db = getOfflineDB();
	await db.tasks.update(taskId, {
		is_dirty: true,
		sync_version: (await db.tasks.get(taskId))?.sync_version ?? 0 + 1,
		updated_at: new Date().toISOString()
	});
}

export async function markTeamAsDirty(teamId: string): Promise<void> {
	const db = getOfflineDB();
	await db.teams.update(teamId, {
		is_dirty: true,
		sync_version: (await db.teams.get(teamId))?.sync_version ?? 0 + 1,
		updated_at: new Date().toISOString()
	});
}

/**
 * Get all dirty entities that need syncing
 */
export async function getDirtyTasks(): Promise<LocalTaskData[]> {
	const db = getOfflineDB();
	return await db.tasks.where('is_dirty').equals(1).toArray();
}

export async function getDirtyTeams(): Promise<LocalTeamData[]> {
	const db = getOfflineDB();
	return await db.teams.where('is_dirty').equals(1).toArray();
}



