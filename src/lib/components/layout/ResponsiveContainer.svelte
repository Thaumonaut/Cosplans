<script lang="ts">
	/**
	 * ResponsiveContainer Component
	 * Feature: 004-bugfix-testing - User Story 2
	 * Adaptive container that adjusts layout based on viewport size
	 */
	import { onMount, onDestroy } from 'svelte';
	import { getBreakpointObserver, type Breakpoint } from '$lib/utils/responsive';

	interface Props {
		children?: any;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();

	let currentBreakpoint = $state<Breakpoint>('desktop');
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		const observer = getBreakpointObserver();
		unsubscribe = observer.subscribeToBreakpoint((breakpoint) => {
			currentBreakpoint = breakpoint;
		});
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	// Reactive class based on breakpoint
	const breakpointClass = $derived(`breakpoint-${currentBreakpoint}`);
</script>

<div class="responsive-container {breakpointClass} {className}" data-breakpoint={currentBreakpoint}>
	{@render children?.()}
</div>

<style>
	.responsive-container {
		width: 100%;
		height: 100%;
	}

	/* Mobile (0-767px) */
	.responsive-container.breakpoint-mobile {
		--container-padding: 1rem;
		--container-max-width: 100%;
	}

	/* Tablet (768-1023px) */
	.responsive-container.breakpoint-tablet {
		--container-padding: 1.5rem;
		--container-max-width: 100%;
	}

	/* Desktop (1024-1439px) */
	.responsive-container.breakpoint-desktop {
		--container-padding: 2rem;
		--container-max-width: 1280px;
	}

	/* Large Desktop (1440px+) */
	.responsive-container.breakpoint-large-desktop {
		--container-padding: 2.5rem;
		--container-max-width: 1536px;
	}
</style>
