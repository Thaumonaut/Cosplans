<script lang="ts">
  /**
   * Offline Indicator Component
   * Feature: 004-bugfix-testing T042
   *
   * Displays network status and offline queue information
   */
  import { onMount } from 'svelte';
  import { WifiOff, Wifi, Cloud, CloudOff, AlertCircle } from 'lucide-svelte';
  import { networkStatus } from '$lib/stores/offlineStore';
  import { getOfflineService } from '$lib/api/services/offlineService';

  interface Props {
    showDetails?: boolean; // Show detailed status (queue count, conflicts)
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
    className?: string;
  }

  let {
    showDetails = false,
    position = 'top-right',
    className = ''
  }: Props = $props();

  const offlineService = getOfflineService();
  let queueStatus = $state({
    pending: 0,
    in_progress: 0,
    failed: 0,
    conflicts: 0
  });
  let isRefreshing = $state(false);

  // Refresh queue status every 5 seconds
  let refreshInterval: number | null = null;

  async function refreshStatus() {
    if (isRefreshing) return;
    isRefreshing = true;
    try {
      queueStatus = await offlineService.getQueueStatus();
    } catch (err) {
      console.error('[OfflineIndicator] Failed to refresh status:', err);
    } finally {
      isRefreshing = false;
    }
  }

  onMount(() => {
    refreshStatus();
    refreshInterval = window.setInterval(refreshStatus, 5000);

    return () => {
      if (refreshInterval !== null) {
        clearInterval(refreshInterval);
      }
    };
  });

  // Position classes
  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'inline': ''
  };

  // Derived state
  const isOnline = $derived($networkStatus.is_online);
  const hasPendingItems = $derived(queueStatus.pending > 0 || queueStatus.in_progress > 0);
  const hasConflicts = $derived(queueStatus.conflicts > 0);
  const hasFailed = $derived(queueStatus.failed > 0);
</script>

{#if !isOnline || hasPendingItems || hasConflicts || hasFailed}
  <div
    class={`${positionClasses[position]} ${className}`}
    data-testid="offline-indicator"
  >
    <!-- Compact Indicator -->
    {#if !showDetails}
      <div
        class="flex items-center gap-2 rounded-full px-3 py-1.5 shadow-lg backdrop-blur-sm"
        style={!isOnline
          ? 'background-color: rgba(239, 68, 68, 0.9); color: white;'
          : hasConflicts || hasFailed
            ? 'background-color: rgba(245, 158, 11, 0.9); color: white;'
            : 'background-color: rgba(59, 130, 246, 0.9); color: white;'}
      >
        {#if !isOnline}
          <WifiOff class="h-4 w-4" />
          <span class="text-sm font-medium">Offline</span>
        {:else if hasConflicts}
          <AlertCircle class="h-4 w-4" />
          <span class="text-sm font-medium">{queueStatus.conflicts} Conflicts</span>
        {:else if hasPendingItems}
          <Cloud class="h-4 w-4 animate-pulse" />
          <span class="text-sm font-medium">Syncing {queueStatus.pending + queueStatus.in_progress}</span>
        {:else if hasFailed}
          <CloudOff class="h-4 w-4" />
          <span class="text-sm font-medium">{queueStatus.failed} Failed</span>
        {/if}
      </div>
    {:else}
      <!-- Detailed Indicator -->
      <div
        class="rounded-lg border shadow-lg backdrop-blur-sm p-3 min-w-[200px]"
        style="background-color: var(--theme-card-bg); border-color: var(--theme-border);"
      >
        <!-- Status Header -->
        <div class="flex items-center gap-2 mb-2">
          {#if !isOnline}
            <div class="flex items-center gap-2 text-red-600">
              <WifiOff class="h-5 w-5" />
              <span class="font-semibold text-sm">Offline Mode</span>
            </div>
          {:else}
            <div class="flex items-center gap-2 text-green-600">
              <Wifi class="h-5 w-5" />
              <span class="font-semibold text-sm">Online</span>
            </div>
          {/if}
        </div>

        <!-- Queue Status -->
        <div class="space-y-1 text-xs" style="color: var(--theme-text-muted);">
          {#if queueStatus.pending > 0}
            <div class="flex justify-between">
              <span>Pending:</span>
              <span class="font-medium">{queueStatus.pending}</span>
            </div>
          {/if}
          {#if queueStatus.in_progress > 0}
            <div class="flex justify-between">
              <span>Syncing:</span>
              <span class="font-medium animate-pulse">{queueStatus.in_progress}</span>
            </div>
          {/if}
          {#if queueStatus.conflicts > 0}
            <div class="flex justify-between text-amber-600">
              <span>Conflicts:</span>
              <span class="font-medium">{queueStatus.conflicts}</span>
            </div>
          {/if}
          {#if queueStatus.failed > 0}
            <div class="flex justify-between text-red-600">
              <span>Failed:</span>
              <span class="font-medium">{queueStatus.failed}</span>
            </div>
          {/if}
        </div>

        {#if !isOnline}
          <div class="mt-2 pt-2 border-t text-xs" style="border-color: var(--theme-border); color: var(--theme-text-muted);">
            Changes will sync when you're back online.
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}
