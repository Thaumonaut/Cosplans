<script lang="ts">
	/**
	 * Task Delete Modal Component
	 * Feature: 004-bugfix-testing - User Story 1
	 * Shows confirmation dialog with dependency counts before deletion
	 */
	import { createEventDispatcher } from 'svelte';

	export let taskTitle: string;
	export let open = false;
	export let dependencyCount = 0;
	export let dependencyDetails: {
		subtasks?: number;
		resources?: number;
		projects?: number;
	} = {};

	const dispatch = createEventDispatcher<{
		confirm: void;
		cancel: void;
	}>();

	function handleConfirm() {
		dispatch('confirm');
		open = false;
	}

	function handleCancel() {
		dispatch('cancel');
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleCancel();
		} else if (e.key === 'Enter' && e.metaKey) {
			handleConfirm();
		}
	}

	$: hasDependencies = dependencyCount > 0;
	$: dependencyList = [
		dependencyDetails.subtasks && dependencyDetails.subtasks > 0
			? `${dependencyDetails.subtasks} subtask${dependencyDetails.subtasks > 1 ? 's' : ''}`
			: null,
		dependencyDetails.resources && dependencyDetails.resources > 0
			? `${dependencyDetails.resources} resource${dependencyDetails.resources > 1 ? 's' : ''}`
			: null,
		dependencyDetails.projects && dependencyDetails.projects > 0
			? `${dependencyDetails.projects} project${dependencyDetails.projects > 1 ? 's' : ''}`
			: null
	].filter(Boolean);
</script>

{#if open}
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-modal-title"
		tabindex="-1"
		on:keydown={handleKeydown}
	>
		<div class="modal-content">
			<!-- Header -->
			<div class="modal-header">
				<h2 id="delete-modal-title" class="modal-title">
					<span class="icon-warning">⚠️</span>
					Delete Task
				</h2>
				<button
					type="button"
					class="btn-close"
					aria-label="Close"
					on:click={handleCancel}
				>
					×
				</button>
			</div>

			<!-- Body -->
			<div class="modal-body">
				<p class="confirmation-text">
					Are you sure you want to delete <strong>"{taskTitle}"</strong>?
				</p>

				{#if hasDependencies}
					<div class="dependency-warning">
						<div class="dependency-count">
							<span class="count-badge" data-testid="dependency-count">
								{dependencyCount}
							</span>
							<span class="count-label">
								{dependencyCount === 1 ? 'dependency' : 'dependencies'}
							</span>
						</div>

						{#if dependencyList.length > 0}
							<ul class="dependency-list">
								{#each dependencyList as item}
									<li>{item}</li>
								{/each}
							</ul>
						{/if}

						<p class="warning-message">
							Deleting this task will also affect its dependencies. This action can be undone
							within 30 days.
						</p>
					</div>
				{:else}
					<div class="no-dependencies">
						<span class="count-badge success" data-testid="dependency-count">0</span>
						<span class="count-label">dependencies</span>
					</div>

					<p class="info-message">
						This task has no dependencies. You can safely delete it. This action can be undone
						within 30 days.
					</p>
				{/if}
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				<button
					type="button"
					class="btn btn-secondary"
					on:click={handleCancel}
					data-testid="cancel-button"
				>
					Cancel
				</button>
				<button
					type="button"
					class="btn btn-danger"
					on:click={handleConfirm}
					data-testid="confirm-delete-button"
				>
					{hasDependencies ? 'Delete Anyway' : 'Delete'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: var(--theme-background, var(--theme-card-bg, #ffffff));
		border-radius: 8px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border, var(--theme-border, #e5e7eb));
	}

	.modal-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text, var(--theme-foreground, #1c1917));
	}

	.icon-warning {
		font-size: 1.5rem;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 2rem;
		line-height: 1;
		color: var(--color-text-muted, var(--theme-text-muted, #78716c));
		cursor: pointer;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.btn-close:hover {
		background-color: var(--color-surface-hover, var(--theme-hover, #f5f5f4));
	}

	.modal-body {
		padding: 1.5rem;
	}

	.confirmation-text {
		margin-bottom: 1.5rem;
		color: var(--color-text, var(--theme-foreground, #1c1917));
		line-height: 1.5;
	}

	.dependency-warning {
		background-color: var(--color-warning-bg, #fef3c7);
		border: 1px solid var(--color-warning-border, #fbbf24);
		border-radius: 6px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.no-dependencies {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.dependency-count {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		padding: 0 0.5rem;
		background-color: var(--color-danger, #dc2626);
		color: white;
		border-radius: 9999px;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.count-badge.success {
		background-color: var(--color-success, #10b981);
	}

	.count-label {
		font-weight: 500;
		color: var(--color-text, var(--theme-foreground, #1c1917));
	}

	.dependency-list {
		list-style: disc;
		padding-left: 1.5rem;
		margin: 0.75rem 0;
		color: var(--color-text, var(--theme-foreground, #1c1917));
	}

	.dependency-list li {
		margin-bottom: 0.25rem;
	}

	.warning-message {
		margin-top: 0.75rem;
		margin-bottom: 0;
		font-size: 0.875rem;
		color: var(--color-text-muted, var(--theme-text-muted, #78716c));
		line-height: 1.5;
	}

	.info-message {
		margin-bottom: 0;
		font-size: 0.875rem;
		color: var(--color-text-muted, var(--theme-text-muted, #78716c));
		line-height: 1.5;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid var(--color-border, var(--theme-border, #e5e7eb));
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid transparent;
	}

	.btn-secondary {
		background-color: var(--color-surface-secondary, var(--theme-card-bg, #f9fafb));
		color: var(--color-text, var(--theme-foreground, #1c1917));
		border-color: var(--color-border, var(--theme-border, #e5e7eb));
	}

	.btn-secondary:hover {
		background-color: var(--color-surface-hover, var(--theme-hover, #f5f5f4));
	}

	.btn-danger {
		background-color: var(--color-danger, #dc2626);
		color: white;
	}

	.btn-danger:hover {
		background-color: var(--color-danger-hover, #b91c1c);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.modal-content {
			max-width: 100%;
			margin: 0;
			border-radius: 0;
		}

		.modal-header,
		.modal-body,
		.modal-footer {
			padding: 1rem;
		}
	}
</style>



