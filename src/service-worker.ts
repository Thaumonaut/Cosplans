/**
 * Service Worker for Cosplans PWA
 * Feature: 006-brainstorming-moodboard
 *
 * Provides:
 * - Asset caching for offline support
 * - Network-first strategy with cache fallback
 * - Share target handling (via POST to /share-target)
 */

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Unique cache name for this version
const CACHE_NAME = `cosplans-cache-${version}`;

// Assets to cache (SvelteKit provides build files and static files)
const ASSETS_TO_CACHE = [
  ...build, // SvelteKit build artifacts
  ...files, // Static files from /static
].filter(Boolean); // Filter out any null/undefined values

// ============================================================================
// Install Event - Cache Assets
// ============================================================================
sw.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Installed successfully');
        // Skip waiting to activate immediately
        return sw.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// ============================================================================
// Activate Event - Clean Up Old Caches
// ============================================================================
sw.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // Delete old caches
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name.startsWith('cosplans-cache-'))
            .map((name) => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated successfully');
        // Take control of all clients immediately
        return sw.clients.claim();
      })
      .catch((error) => {
        console.error('[Service Worker] Activation failed:', error);
      })
  );
});

// ============================================================================
// Fetch Event - Network First with Cache Fallback
// ============================================================================
sw.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (POST, PUT, DELETE, etc.)
  // This includes /share-target POST which should go directly to the server
  if (request.method !== 'GET') {
    console.log('[Service Worker] Ignoring non-GET request:', request.method, url.pathname);
    return;
  }

  // Ignore cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Ignore certain paths that should always be fresh
  const ignorePaths = ['/api/', '/auth/', '/supabase/', '/rest/v1/rpc/setup_new_user'];
  if (ignorePaths.some((path) => url.pathname.startsWith(path))) {
    console.log('[Service Worker] Ignoring API/auth request:', url.pathname);
    return;
  }

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', url.pathname);
            return cachedResponse;
          }

          // If not in cache, return offline page or error
          console.log('[Service Worker] No cache available for:', url.pathname);
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// ============================================================================
// Message Event - Handle Messages from Clients
// ============================================================================
sw.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});

// ============================================================================
// Background Sync (Future Enhancement)
// ============================================================================
// sw.addEventListener('sync', (event) => {
//   if (event.tag === 'sync-moodboard-nodes') {
//     event.waitUntil(syncMoodboardNodes());
//   }
// });

console.log('[Service Worker] Loaded and ready');
