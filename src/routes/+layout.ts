import { createSupabaseLoadClient } from "$lib/auth/supabase-client";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch, data, depends, url }) => {
  depends("supabase:auth");

  // Skip Supabase initialization for public routes to avoid errors
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/auth"];
  const isPublicRoute = publicRoutes.some((route) =>
    url.pathname.startsWith(route),
  );

  // For public routes, return minimal data
  if (isPublicRoute) {
    try {
      const supabase = createSupabaseLoadClient(fetch);
      // Silently check for session on public routes - don't log errors if missing
      const {
        data: { session },
      } = await supabase.auth
        .getSession()
        .catch(() => ({ data: { session: null } }));

      return {
        supabase,
        session: session || null,
        user: data.user || session?.user || null,
        title: "Cosplans - Cosplay Project Tracker",
        description:
          "Track your cosplay projects from inspiration to completion",
      };
    } catch (err) {
      // If Supabase fails on public routes, still allow page to render
      // Only log if it's not an expected auth error
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        !errMsg.includes("Auth session missing") &&
        !errMsg.includes("session")
      ) {
        console.warn("Supabase initialization failed on public route:", err);
      }
      return {
        supabase: null,
        session: null,
        user: data.user || null,
        title: "Cosplans - Cosplay Project Tracker",
        description:
          "Track your cosplay projects from inspiration to completion",
      };
    }
  }

  try {
    const supabase = createSupabaseLoadClient(fetch);

    // Try to get session - silently handle missing sessions (expected when not logged in)
    let session = null;
    try {
      const {
        data: { session: sessionData },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (!sessionError && sessionData) {
        session = sessionData;
      }
    } catch (err) {
      // Silently ignore session errors - missing session is normal when not logged in
    }

    // If no session, try getUser() as fallback (validates JWT from cookies)
    if (!session) {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        // Only create session from user if we successfully got a user
        if (!userError && user) {
          // Create minimal session object from validated user
          session = { user };
        }
      } catch (err) {
        // Silently ignore - no session means user isn't logged in
      }
    }

    return {
      supabase,
      session: session || null,
      user: data.user || session?.user || null,
      title: "Cosplans - Cosplay Project Tracker",
      description: "Track your cosplay projects from inspiration to completion",
    };
  } catch (err) {
    // Fallback if Supabase client creation fails
    console.error("Failed to create Supabase client in layout:", err);
    return {
      supabase: null,
      session: null,
      user: data.user || null,
      title: "Cosplans - Cosplay Project Tracker",
      description: "Track your cosplay projects from inspiration to completion",
    };
  }
};
