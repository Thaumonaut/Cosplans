<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { authActions } from "$lib/stores/auth-store.js";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

  const { supabase, session } = data;

  // Initialize auth state in stores if we have session data
  $effect(() => {
    if (session?.user) {
      // session might be a full Session or just { user }
      const fullSession = 'access_token' in session ? session : null;
      authActions.initialize(session.user, fullSession);
    } else {
      authActions.clear();
    }
  });

  onMount(() => {
    // Only set up auth listener if supabase client is available and in browser
    if (typeof window === 'undefined') return;
    if (!supabase) {
      console.warn('Supabase client not available in layout');
      return;
    }

    // Set up Supabase auth state listener for the entire app
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const result = supabase.auth.onAuthStateChange((event, _session) => {
        const currentExpiresAt = session && 'expires_at' in session ? session.expires_at : null;
        const newExpiresAt = _session?.expires_at;
        if (newExpiresAt !== currentExpiresAt) {
          invalidate("supabase:auth");
        }
      });
      subscription = result.data.subscription;
    } catch (err) {
      console.error('Failed to set up auth state listener:', err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  });
</script>

<svelte:head>
  <title>Cosplans - Cosplay Project Tracker</title>
  <meta
    name="description"
    content="Track your cosplay projects from inspiration to completion"
  />
  <meta name="generator" content="SvelteKit" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#6366f1" />
</svelte:head>

<!-- Root layout - just renders the slot for public and protected routes -->
<div class="font-sans antialiased">
  {@render children()}
</div>
