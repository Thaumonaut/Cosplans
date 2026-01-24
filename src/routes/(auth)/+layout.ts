import type { LayoutLoad } from "./$types";
import { teams } from "$lib/stores/teams";
import { get } from "svelte/store";

/**
 * Auth layout load function
 * Ensures teams are loaded before child pages try to access them
 */
export const load: LayoutLoad = async ({ parent, depends }) => {
  depends("supabase:auth");

  // Get session/user from parent layout (server provides both)
  const { session, user } = await parent();

  // If we have a user, ensure teams are loaded
  if (session?.user) {
    const teamState = teams.get();

    // Only load if not already loaded or loading
    if (!teamState.loading && teamState.items.length === 0) {
      try {
        await teams.load(session.user.id);
      } catch (error) {
        console.error("Failed to load teams in layout:", error);
        // Continue anyway - pages can handle missing teams
      }
    }
  }

  // Pass through both session and user to child pages
  return {
    session,
    user,
  };
};
