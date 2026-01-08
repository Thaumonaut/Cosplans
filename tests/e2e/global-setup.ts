/**
 * E2E Test Global Setup
 *
 * Ensures test user exists in Supabase before E2E tests run.
 * This avoids manual user creation and makes tests self-contained.
 */

import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const SUPABASE_URL =
  process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_TEST_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY;
const SUPABASE_ANON_KEY =
  process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_TEST_KEY;

// Test user credentials from env
const TEST_EMAIL = process.env.TEST_EMAIL || "test@example.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "testpassword123";

export default async function globalSetup() {
  console.log("[E2E Setup] Starting global setup...");

  if (!SUPABASE_URL) {
    console.warn("[E2E Setup] No Supabase URL found. Skipping user creation.");
    return;
  }

  // Try to use service role key for admin operations, fall back to anon key
  const authKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

  if (!authKey) {
    console.warn("[E2E Setup] No Supabase key found. Skipping user creation.");
    return;
  }

  const supabase = createClient(SUPABASE_URL, authKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // List of users to ensure exist
  const USERS_TO_CREATE = [
    {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      meta: { first_name: "Test", last_name: "User" },
    },
    // Detailed fixed users from factory
    {
      email: "alice@test.com",
      password: "AliceTest123!",
      meta: { first_name: "Alice", last_name: "Cosplayer" },
    },
    {
      email: "bob@test.com",
      password: "BobTest123!",
      meta: { first_name: "Bob", last_name: "Photographer" },
    },
    {
      email: "charlie@test.com",
      password: "CharlieTest123!",
      meta: { first_name: "Charlie", last_name: "Teamlead" },
    },
  ];

  console.log(
    `[E2E Setup] Ensuring ${USERS_TO_CREATE.length} test users exist...`,
  );

  for (const user of USERS_TO_CREATE) {
    console.log(`[E2E Setup] Processing user: ${user.email}`);

    // Check if user exists (try login)
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

    if (signInData?.user) {
      console.log(
        `[E2E Setup] User ${user.email} already exists with correct password.`,
      );
      continue;
    }

    // If user exists but password is wrong, update it
    if (SUPABASE_SERVICE_KEY) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users?.find((u) => u.email === user.email);
      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, {
          password: user.password,
        });
        console.log(
          `[E2E Setup] Updated password for existing user ${user.email}`,
        );
        continue;
      }
    }

    // Create user
    if (SUPABASE_SERVICE_KEY) {
      // Admin creation
      const { data: adminAuthData, error: createError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: user.meta,
        });

      if (createError) {
        if (
          createError.message?.includes("already been registered") ||
          createError.message?.includes("already exists")
        ) {
          // Update password if exists
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existingUser = listData?.users?.find(
            (u) => u.email === user.email,
          );
          if (existingUser) {
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: user.password,
            });
            console.log(`[E2E Setup] Updated password for ${user.email}`);
          }
        } else {
          console.error(
            `[E2E Setup] Failed to create ${user.email}:`,
            createError.message,
          );
        }
      } else {
        console.log(`[E2E Setup] Created ${user.email}`);
      }
    } else {
      // Public signup
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: { data: user.meta },
        });
      if (signUpError) {
        console.error(
          `[E2E Setup] Signup failed for ${user.email}:`,
          signUpError.message,
        );
      } else {
        console.log(`[E2E Setup] Signed up ${user.email}`);
      }
    }
  }

  console.log("[E2E Setup] Global setup complete.");
}
