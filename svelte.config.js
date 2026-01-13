import cloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use Cloudflare adapter to target Cloudflare Workers/Pages
		adapter: cloudflare(),

		// Path aliases for cleaner imports
		alias: {
			'@': './src',
			'@/*': './src/*',
			'$lib': './src/lib',
			'$lib/*': './src/lib/*',
			'$components': './src/lib/components',
			'$components/*': './src/lib/components/*',
			'$stores': './src/lib/stores',
			'$stores/*': './src/lib/stores/*',
			'$types': './src/lib/types',
			'$types/*': './src/lib/types/*'
		},

		// CSRF configuration
		// Disable origin checking to allow PWA share target to work
		// The share-target endpoint validates authentication before processing
		csrf: {
			checkOrigin: false
		},

		// Service worker configuration
		serviceWorker: {
			register: true // Enabled for PWA and offline support
		},
		
		// CSP configuration for security
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self', 'unsafe-hashes', 'unsafe-inline', 'unsafe-eval'],
				'script-src-attr': ['unsafe-hashes', 'unsafe-inline'], // Allow inline event handlers
				'img-src': ['self', 'data:', 'blob:', 'https:', 'http:', 'http://localhost:5173'],
				'media-src': ['self', 'data:', 'blob:', 'https:', 'http:', 'http://localhost:5173'],
				'connect-src': ['self', 'https:', 'wss:', 'ws:'],
				'style-src': ['self', 'unsafe-inline', 'https://cdn.svar.dev'],
				'style-src-elem': ['self', 'unsafe-inline', 'https://cdn.svar.dev'],
				'font-src': ['self', 'data:', 'https://cdn.svar.dev']
			}
		}
	}
};

export default config;
