<script lang="ts">
  import '../../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { preloadData, invalidate, goto } from '$app/navigation';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import PageHeader from '$lib/components/page-header.svelte';
  import KeyboardShortcutsHandler from '$lib/components/base/KeyboardShortcutsHandler.svelte';

  import { initializeStores } from '$lib/stores/init.js';
  import { CRITICAL_ROUTES, CRITICAL_RESOURCES } from '$lib/config/preload.js';
  import { preloadRoute } from '$lib/utils/performance.js';
  import { authActions } from '$lib/stores/auth-store.js';
  import { teams } from '$lib/stores/teams.js';
  import { user } from '$lib/stores/auth-store.js';
  import { get } from 'svelte/store';
  import Toast from '$lib/components/ui/toast.svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

  const { supabase, session } = data;
  
  // Initialize auth state in stores using $effect
  $effect(() => {
    if (session?.user) {
      // session might be a full Session or just { user }
      const fullSession = 'access_token' in session ? session : null;
      authActions.initialize(session.user, fullSession);
    }
  });

  // Load teams when user is available - with retry logic
  $effect(() => {
    const currentUser = $user;
    if (currentUser && session) {
      // Only load if not already loaded
      const teamState = teams.get();
      if (!teamState.loading && teamState.items.length === 0) {
        teams.load(currentUser.id).catch((err) => {
          console.error('Failed to load teams:', err);
          // Retry once after a short delay
          setTimeout(() => {
            const retryState = teams.get();
            if (!retryState.loading && retryState.items.length === 0) {
              teams.load(currentUser.id).catch((retryErr) => {
                console.error('Failed to load teams on retry:', retryErr);
              });
            }
          }, 1000);
        });
      }
    }
  });

  // Client-side redirect to login if no session using $effect
  $effect(() => {
    if (typeof window !== 'undefined' && !session) {
      goto('/login');
    }
  });
  
  // Initialize all stores on app startup
  onMount(() => {
    initializeStores();
    
    // Set up Supabase auth state listener
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
        if (event === 'SIGNED_OUT') {
          // User signed out, redirect to login
          goto('/login');
        } else {
          const currentExpiresAt = session && 'access_token' in session ? session.expires_at : null;
          const newExpiresAt = _session?.expires_at;
          if (newExpiresAt !== currentExpiresAt) {
            // Session changed, invalidate and reload
            invalidate('supabase:auth');
          }
        }
      });
      
      // Preload critical routes for better navigation performance
      CRITICAL_ROUTES.forEach(route => {
        if (route !== $page.route.id) {
          preloadRoute(route);
          // Use SvelteKit's preloadData for even better performance
          preloadData(route).catch(() => {
            // Silently fail if preloading fails
          });
        }
      });
      
      // Preload critical resources
      CRITICAL_RESOURCES.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = resource.endsWith('.svg') ? 'image' : 'image';
        link.href = resource;
        document.head.appendChild(link);
      });

      return () => subscription.unsubscribe();
    }
  });
</script>

<svelte:head>
  <title>Cosplans - Cosplay Project Tracker</title>
  <meta name="description" content="Track your cosplay projects from inspiration to completion" />
  <meta name="generator" content="SvelteKit" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
</svelte:head>

<!-- Authenticated app layout with sidebar and header -->
<KeyboardShortcutsHandler />
<div class="font-sans antialiased">
  <div class="flex min-h-screen w-full" style="min-height: 100vh; min-height: 100dvh;">
    <AppSidebar />
    <main class="max-w-full flex-1 overflow-x-hidden flex flex-col">
      <PageHeader />
      <div class="flex-1 overflow-y-auto">
        {@render children()}
      </div>
    </main>
  </div>
  <Toast />
</div>