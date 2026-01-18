/**
 * Offline Service
 * Feature: 004-bugfix-testing T041 - Offline queue processing and conflict resolution
 *
 * Handles queuing operations when offline and syncing when back online.
 */

import { get } from "svelte/store";
import { getOfflineDB, SyncQueueManager } from "$lib/utils/offlineSync";
import { networkStatus } from "$lib/stores/offlineStore";
import type {
  SyncQueueItem,
  SyncConflict,
  ConflictResolution,
  ConflictResolutionStrategy,
  SyncOperationType,
} from "$lib/types/offline";

/**
 * Conflict resolution callback type
 * Called when a conflict is detected and requires user input
 */
export type ConflictResolutionCallback = (
  conflict: SyncConflict,
) => Promise<ConflictResolution | null>;

export class OfflineService {
  private db = getOfflineDB();
  private queueManager = new SyncQueueManager();
  private conflictCallback: ConflictResolutionCallback | null = null;
  private syncInProgress = false;

  /**
   * Set the callback for conflict resolution
   */
  setConflictResolutionCallback(callback: ConflictResolutionCallback) {
    this.conflictCallback = callback;
  }

  /**
   * Queue an operation for offline sync
   */
  async queueOperation(
    operationType: SyncOperationType,
    entityType: string,
    entityId: string,
    payload: Record<string, unknown>,
    userId: string,
  ): Promise<string> {
    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      operation_type: operationType,
      entity_type: entityType,
      entity_id: entityId,
      payload,
      status: "pending",
      attempt_count: 0,
      max_attempts: 3,
      created_at: new Date().toISOString(),
      user_id: userId,
    };

    await this.db.syncQueue.add(item);
    return item.id;
  }

  /**
   * Process the sync queue
   * Attempts to sync all pending operations
   */
  async processQueue(): Promise<{
    successful: number;
    failed: number;
    conflicts: number;
  }> {
    const status = get(networkStatus);
    if (!status.is_online) {
      console.log("[OfflineService] Cannot process queue while offline");
      return { successful: 0, failed: 0, conflicts: 0 };
    }

    if (this.syncInProgress) {
      console.log("[OfflineService] Sync already in progress");
      return { successful: 0, failed: 0, conflicts: 0 };
    }

    this.syncInProgress = true;
    let successful = 0;
    let failed = 0;
    let conflicts = 0;

    try {
      const pendingItems = await this.db.syncQueue
        .where("status")
        .equals("pending")
        .toArray();

      console.log(
        `[OfflineService] Processing ${pendingItems.length} pending items`,
      );

      for (const item of pendingItems) {
        try {
          // Update status to in_progress
          await this.db.syncQueue.update(item.id, {
            status: "in_progress",
            last_attempt_at: new Date().toISOString(),
          });

          // Process the item
          const result = await this.processSyncItem(item);

          if (result.success) {
            // Mark as completed and remove from queue
            await this.db.syncQueue.delete(item.id);
            successful++;
          } else if (result.conflict) {
            // Mark as conflict
            await this.db.syncQueue.update(item.id, {
              status: "conflict",
            });
            conflicts++;

            // Store conflict for resolution
            await this.db.conflicts.put(result.conflict);

            // Attempt to resolve if callback is set
            if (this.conflictCallback) {
              const resolution = await this.conflictCallback(result.conflict);
              if (resolution) {
                await this.resolveConflict(result.conflict, resolution);
              }
            }
          } else {
            // Mark as failed
            const newAttemptCount = item.attempt_count + 1;
            if (newAttemptCount >= item.max_attempts) {
              await this.db.syncQueue.update(item.id, {
                status: "failed",
                attempt_count: newAttemptCount,
                error_message: result.error,
              });
              failed++;
            } else {
              // Retry later
              await this.db.syncQueue.update(item.id, {
                status: "pending",
                attempt_count: newAttemptCount,
                error_message: result.error,
              });
            }
          }
        } catch (err) {
          console.error(
            `[OfflineService] Error processing item ${item.id}:`,
            err,
          );
          failed++;
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    console.log(
      `[OfflineService] Queue processed: ${successful} successful, ${failed} failed, ${conflicts} conflicts`,
    );

    return { successful, failed, conflicts };
  }

  /**
   * Process a single sync item
   */
  private async processSyncItem(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    try {
      // For MVP: Simulate processing with basic conflict detection
      // In production, this would make actual API calls to sync the operation

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // For demo purposes, randomly simulate conflicts (5% chance)
      if (Math.random() < 0.05) {
        const conflict: SyncConflict = {
          item_id: item.id,
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          local_version: item.payload,
          remote_version: {
            ...item.payload,
            updated_at: new Date().toISOString(),
          },
          conflict_fields: ["updated_at"],
          detected_at: new Date().toISOString(),
        };

        return { success: false, conflict };
      }

      // Success
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(
    conflict: SyncConflict,
    resolution: ConflictResolution,
  ): Promise<void> {
    // Apply the resolution
    const item = await this.db.syncQueue.get(conflict.item_id);
    if (!item) {
      console.error(
        "[OfflineService] Queue item not found for conflict resolution",
      );
      return;
    }

    let resolvedPayload: Record<string, unknown>;

    switch (resolution.strategy) {
      case "use_local":
        resolvedPayload = conflict.local_version;
        break;
      case "use_remote":
        resolvedPayload = conflict.remote_version;
        break;
      case "merge":
        // Simple merge: remote wins for conflicts, keep local for non-conflicting fields
        resolvedPayload = {
          ...conflict.local_version,
          ...conflict.remote_version,
        };
        break;
      case "user_prompt":
        resolvedPayload = resolution.resolved_value || conflict.local_version;
        break;
      default:
        resolvedPayload = conflict.local_version;
    }

    // Update the queue item with resolved data and retry
    await this.db.syncQueue.update(conflict.item_id, {
      payload: resolvedPayload,
      status: "pending",
      attempt_count: 0,
    });

    // Remove from conflicts table
    await this.db.conflicts.delete(conflict.item_id);

    console.log(`[OfflineService] Conflict resolved for ${conflict.entity_id}`);
  }

  /**
   * Get all pending conflicts that need user resolution
   */
  async getPendingConflicts(): Promise<SyncConflict[]> {
    return await this.db.conflicts.toArray();
  }

  /**
   * Get sync queue status
   */
  async getQueueStatus(): Promise<{
    pending: number;
    in_progress: number;
    failed: number;
    conflicts: number;
  }> {
    const [pending, in_progress, failed, conflicts] = await Promise.all([
      this.db.syncQueue.where("status").equals("pending").count(),
      this.db.syncQueue.where("status").equals("in_progress").count(),
      this.db.syncQueue.where("status").equals("failed").count(),
      this.db.syncQueue.where("status").equals("conflict").count(),
    ]);

    return { pending, in_progress, failed, conflicts };
  }

  /**
   * Clear completed and failed items from queue
   */
  async clearQueue(): Promise<void> {
    await this.db.syncQueue
      .where("status")
      .anyOf(["completed", "failed"])
      .delete();
  }
}

// Singleton instance
let offlineServiceInstance: OfflineService | null = null;

export function getOfflineService(): OfflineService {
  if (!offlineServiceInstance) {
    offlineServiceInstance = new OfflineService();
  }
  return offlineServiceInstance;
}
