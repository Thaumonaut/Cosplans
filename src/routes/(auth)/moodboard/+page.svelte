<script lang="ts">
    /**
     * Personal Moodboard Page
     * Route: /moodboard
     * Task: T-005
     *
     * Displays the current user's personal moodboard.
     * Redirects to /moodboard/[id] once the personal moodboard ID is resolved.
     */
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { moodboardsService } from "$lib/api/services/moodboardsService";
    import Breadcrumbs from "$lib/components/base/Breadcrumbs.svelte";
    import { Spinner } from "flowbite-svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let loading = $state(true);
    let error = $state<string | null>(null);

    onMount(async () => {
        try {
            // Use user from page data (provided by layout server)
            const currentUser = data.user;
            if (!currentUser) {
                error = "Not authenticated";
                loading = false;
                return;
            }

            // Get or create personal moodboard
            let moodboard = await moodboardsService.getPersonalMoodboard(
                currentUser.id,
            );

            if (!moodboard) {
                // Create personal moodboard if it doesn't exist
                moodboard = await moodboardsService.createMoodboard({
                    ownerType: "user",
                    ownerId: currentUser.id,
                    title: "Personal Moodboard",
                });
            }

            // Redirect to the moodboard editor
            goto(`/moodboard/${moodboard.id}`, { replaceState: true });
        } catch (err) {
            console.error("Failed to load personal moodboard:", err);
            error =
                err instanceof Error ? err.message : "Failed to load moodboard";
            loading = false;
        }
    });
</script>

<svelte:head>
    <title>My Moodboard - Cosplans</title>
</svelte:head>

<div class="p-6">
    <Breadcrumbs items={[{ label: "Moodboard" }]} />

    {#if loading}
        <div class="flex items-center justify-center h-64">
            <Spinner size="8" />
            <span class="ml-3 text-gray-600 dark:text-gray-400"
                >Loading your moodboard...</span
            >
        </div>
    {:else if error}
        <div
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
            <p class="text-red-700 dark:text-red-400">{error}</p>
        </div>
    {/if}
</div>
