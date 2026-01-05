/**
 * Responsive design utilities and breakpoints
 * Feature: 004-bugfix-testing - User Story 2
 * Provides standard breakpoints and utilities for responsive layouts
 */

/**
 * Standard breakpoints following mobile-first approach
 */
export const BREAKPOINTS = {
	mobile: 0,
	tablet: 768,
	desktop: 1024,
	'large-desktop': 1440
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Get media query string for a breakpoint
 */
export function getMediaQuery(breakpoint: Breakpoint, type: 'min' | 'max' = 'min'): string {
	const value = BREAKPOINTS[breakpoint];
	if (type === 'min') {
		return `(min-width: ${value}px)`;
	} else {
		// For max-width, use value - 1 to avoid overlap
		return `(max-width: ${value - 1}px)`;
	}
}

/**
 * Check if current viewport matches a breakpoint
 */
export function matchesBreakpoint(breakpoint: Breakpoint, type: 'min' | 'max' = 'min'): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia(getMediaQuery(breakpoint, type)).matches;
}

/**
 * Get current breakpoint name
 */
export function getCurrentBreakpoint(): Breakpoint {
	if (typeof window === 'undefined') return 'desktop';

	const width = window.innerWidth;

	if (width >= BREAKPOINTS['large-desktop']) return 'large-desktop';
	if (width >= BREAKPOINTS.desktop) return 'desktop';
	if (width >= BREAKPOINTS.tablet) return 'tablet';
	return 'mobile';
}

/**
 * Check if current viewport is mobile
 */
export function isMobile(): boolean {
	return getCurrentBreakpoint() === 'mobile';
}

/**
 * Check if current viewport is tablet or smaller
 */
export function isTabletOrSmaller(): boolean {
	const bp = getCurrentBreakpoint();
	return bp === 'mobile' || bp === 'tablet';
}

/**
 * Check if current viewport is desktop or larger
 */
export function isDesktopOrLarger(): boolean {
	const bp = getCurrentBreakpoint();
	return bp === 'desktop' || bp === 'large-desktop';
}

/**
 * Responsive value selector
 * Returns different values based on current breakpoint
 */
export function responsive<T>(values: {
	mobile?: T;
	tablet?: T;
	desktop?: T;
	'large-desktop'?: T;
	default: T;
}): T {
	const breakpoint = getCurrentBreakpoint();
	return values[breakpoint] ?? values.default;
}

/**
 * Media query change listener
 * Subscribe to breakpoint changes
 */
export class BreakpointObserver {
	private listeners: Map<Breakpoint, Set<(matches: boolean) => void>> = new Map();
	private mediaQueries: Map<Breakpoint, MediaQueryList> = new Map();

	constructor() {
		if (typeof window === 'undefined') return;

		// Set up media queries for each breakpoint
		Object.keys(BREAKPOINTS).forEach((bp) => {
			const breakpoint = bp as Breakpoint;
			const mq = window.matchMedia(getMediaQuery(breakpoint, 'min'));
			this.mediaQueries.set(breakpoint, mq);

			// Add listener for changes
			mq.addEventListener('change', (e) => {
				this.notifyListeners(breakpoint, e.matches);
			});
		});
	}

	private notifyListeners(breakpoint: Breakpoint, matches: boolean) {
		const listeners = this.listeners.get(breakpoint);
		if (listeners) {
			listeners.forEach((listener) => listener(matches));
		}
	}

	/**
	 * Subscribe to breakpoint changes
	 */
	public subscribe(
		breakpoint: Breakpoint,
		listener: (matches: boolean) => void
	): () => void {
		if (!this.listeners.has(breakpoint)) {
			this.listeners.set(breakpoint, new Set());
		}
		this.listeners.get(breakpoint)!.add(listener);

		// Immediately notify with current state
		const mq = this.mediaQueries.get(breakpoint);
		if (mq) {
			listener(mq.matches);
		}

		// Return unsubscribe function
		return () => {
			this.listeners.get(breakpoint)?.delete(listener);
		};
	}

	/**
	 * Subscribe to current breakpoint changes
	 */
	public subscribeToBreakpoint(listener: (breakpoint: Breakpoint) => void): () => void {
		const unsubscribers: Array<() => void> = [];

		// Subscribe to all breakpoints
		Object.keys(BREAKPOINTS).forEach((bp) => {
			const breakpoint = bp as Breakpoint;
			const unsubscribe = this.subscribe(breakpoint, () => {
				listener(getCurrentBreakpoint());
			});
			unsubscribers.push(unsubscribe);
		});

		// Immediately notify with current breakpoint
		listener(getCurrentBreakpoint());

		// Return function to unsubscribe from all
		return () => {
			unsubscribers.forEach((unsub) => unsub());
		};
	}

	public destroy() {
		this.listeners.clear();
		this.mediaQueries.forEach((mq) => {
			// Remove all listeners (MediaQueryList doesn't track them individually)
			// This is a limitation of the API, but we're clearing our internal refs
		});
		this.mediaQueries.clear();
	}
}

// Singleton breakpoint observer
let breakpointObserverInstance: BreakpointObserver | null = null;

export function getBreakpointObserver(): BreakpointObserver {
	if (!breakpointObserverInstance) {
		breakpointObserverInstance = new BreakpointObserver();
	}
	return breakpointObserverInstance;
}

/**
 * Svelte action for responsive behavior
 * Usage: <div use:responsive={{ tablet: doSomething }}>
 */
export function responsiveAction(
	node: HTMLElement,
	config: Partial<Record<Breakpoint, (node: HTMLElement) => void>>
) {
	const observer = getBreakpointObserver();
	const unsubscribers: Array<() => void> = [];

	Object.entries(config).forEach(([bp, callback]) => {
		const breakpoint = bp as Breakpoint;
		if (callback) {
			const unsubscribe = observer.subscribe(breakpoint, (matches) => {
				if (matches) {
					callback(node);
				}
			});
			unsubscribers.push(unsubscribe);
		}
	});

	return {
		destroy() {
			unsubscribers.forEach((unsub) => unsub());
		}
	};
}

/**
 * CSS-in-JS helper for responsive styles
 */
export function responsiveStyles(styles: Partial<Record<Breakpoint, string>>): string {
	return Object.entries(styles)
		.map(([bp, style]) => {
			const breakpoint = bp as Breakpoint;
			if (BREAKPOINTS[breakpoint] === 0) {
				// Base styles (mobile)
				return style;
			}
			return `@media ${getMediaQuery(breakpoint)} { ${style} }`;
		})
		.join('\n');
}

/**
 * Calculate responsive column count
 */
export function getResponsiveColumns(
	config: {
		mobile?: number;
		tablet?: number;
		desktop?: number;
		'large-desktop'?: number;
	} = {}
): number {
	return responsive({
		mobile: config.mobile,
		tablet: config.tablet,
		desktop: config.desktop,
		'large-desktop': config['large-desktop'],
		default: 1
	});
}

/**
 * Get touch-friendly size adjustments
 */
export function getTouchFriendlySize(baseSize: number): number {
	// On mobile, increase interactive element sizes by 25%
	if (isMobile()) {
		return Math.round(baseSize * 1.25);
	}
	return baseSize;
}

/**
 * Check if device has touch capability
 */
export function hasTouchCapability(): boolean {
	if (typeof window === 'undefined') return false;
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get optimal font size for current viewport
 */
export function getResponsiveFontSize(config: {
	mobile?: string;
	tablet?: string;
	desktop?: string;
	'large-desktop'?: string;
	default: string;
}): string {
	return responsive(config);
}

/**
 * Debounced window resize handler
 */
export function onResize(callback: () => void, delay: number = 150): () => void {
	if (typeof window === 'undefined') return () => {};

	let timeoutId: ReturnType<typeof setTimeout>;

	const handler = () => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(callback, delay);
	};

	window.addEventListener('resize', handler);

	return () => {
		clearTimeout(timeoutId);
		window.removeEventListener('resize', handler);
	};
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
	if (typeof window === 'undefined') {
		return { width: 1024, height: 768 };
	}
	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
	if (typeof window === 'undefined') return false;

	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= window.innerHeight &&
		rect.right <= window.innerWidth
	);
}



