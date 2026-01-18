/**
 * Offline sync type definitions
 * Feature: 004-bugfix-testing - User Story 4
 */

export type SyncOperationType =
	| 'task_create'
	| 'task_update'
	| 'task_delete'
	| 'task_restore'
	| 'team_create'
	| 'team_update'
	| 'team_transfer'
	| 'comment_create'
	| 'attachment_upload';

export type SyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'conflict';

export interface SyncQueueItem {
	id: string;
	operation_type: SyncOperationType;
	entity_type: string;
	entity_id: string;
	payload: Record<string, unknown>;
	status: SyncStatus;
	attempt_count: number;
	max_attempts: number;
	created_at: string;
	last_attempt_at?: string;
	error_message?: string;
	user_id: string;
}

export interface SyncConflict {
	item_id: string;
	entity_type: string;
	entity_id: string;
	local_version: Record<string, unknown>;
	remote_version: Record<string, unknown>;
	conflict_fields: string[];
	detected_at: string;
}

export type ConflictResolutionStrategy = 'use_local' | 'use_remote' | 'merge' | 'user_prompt';

export interface ConflictResolution {
	conflict_id: string;
	strategy: ConflictResolutionStrategy;
	resolved_value?: Record<string, unknown>;
	resolved_at: string;
	resolved_by: string;
}

export interface SyncProgress {
	total_items: number;
	completed_items: number;
	failed_items: number;
	pending_items: number;
	in_progress_items: number;
	conflicts: number;
	last_sync_at?: string;
	is_syncing: boolean;
}

export interface NetworkStatus {
	is_online: boolean;
	last_check_at: string;
	connection_quality?: 'excellent' | 'good' | 'poor' | 'offline';
}

export interface OfflineCache {
	key: string;
	value: unknown;
	cached_at: string;
	expires_at?: string;
	size_bytes?: number;
}

export interface SyncConfig {
	auto_sync: boolean;
	sync_interval_ms: number;
	max_retry_attempts: number;
	retry_delay_ms: number;
	conflict_resolution_strategy: ConflictResolutionStrategy;
	enable_compression: boolean;
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
	auto_sync: true,
	sync_interval_ms: 30000, // 30 seconds
	max_retry_attempts: 3,
	retry_delay_ms: 2000,
	conflict_resolution_strategy: 'user_prompt',
	enable_compression: false
};

// IndexedDB schema types (used with Dexie)
export interface LocalTaskData {
	id: string;
	team_id: string;
	title: string;
	description?: string;
	status: string;
	priority?: string;
	due_date?: string;
	assigned_to?: string;
	created_by: string;
	created_at: string;
	updated_at: string;
	deleted_at?: string;
	is_dirty: boolean; // Has local changes
	sync_version: number;
	server_version?: number;
}

export interface LocalTeamData {
	id: string;
	name: string;
	owner_id: string;
	created_by: string;
	created_at: string;
	updated_at: string;
	is_dirty: boolean;
	sync_version: number;
	server_version?: number;
}



