/**
 * E2E Test Global Setup
 * 
 * Ensures test user exists in Supabase before E2E tests run.
 * This avoids manual user creation and makes tests self-contained.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_TEST_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY;
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_TEST_KEY;

// Test user credentials from env
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

export default async function globalSetup() {
    console.log('[E2E Setup] Starting global setup...');

    if (!SUPABASE_URL) {
        console.warn('[E2E Setup] No Supabase URL found. Skipping user creation.');
        return;
    }

    // Try to use service role key for admin operations, fall back to anon key
    const authKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

    if (!authKey) {
        console.warn('[E2E Setup] No Supabase key found. Skipping user creation.');
        return;
    }

    const supabase = createClient(SUPABASE_URL, authKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    console.log(`[E2E Setup] Checking if test user exists: ${TEST_EMAIL}`);

    // First, try to sign in with the test user to see if they exist
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    });

    if (signInData?.user) {
        console.log('[E2E Setup] Test user already exists and can sign in.');
        return;
    }

    // If sign in failed, check the error
    if (signInError?.message?.includes('Invalid login credentials')) {
        console.log('[E2E Setup] Test user may exist with different password. Attempting to create anyway...');
    }

    // Try to create the user using the admin auth API (requires service role key)
    if (SUPABASE_SERVICE_KEY) {
        console.log('[E2E Setup] Attempting to create test user with admin API...');

        // Use admin API to create user
        const { data: adminAuthData, error: createError } = await supabase.auth.admin.createUser({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true, // Auto-confirm email for tests
            user_metadata: {
                first_name: 'Test',
                last_name: 'User',
            },
        });

        if (createError) {
            if (createError.message?.includes('already been registered') ||
                createError.message?.includes('already exists')) {
                console.log('[E2E Setup] Test user already registered. Attempting password update...');

                // User exists but might have wrong password - try to update it
                const { data: listData } = await supabase.auth.admin.listUsers();
                const existingUser = listData?.users?.find(u => u.email === TEST_EMAIL);

                if (existingUser) {
                    const { error: updateError } = await supabase.auth.admin.updateUserById(
                        existingUser.id,
                        { password: TEST_PASSWORD }
                    );

                    if (updateError) {
                        console.error('[E2E Setup] Failed to update password:', updateError.message);
                    } else {
                        console.log('[E2E Setup] Updated test user password successfully.');
                    }
                }
            } else {
                console.error('[E2E Setup] Failed to create test user:', createError.message);
            }
        } else {
            console.log('[E2E Setup] Test user created successfully:', adminAuthData?.user?.email);
        }
    } else {
        // Without service role key, try to sign up normally
        console.log('[E2E Setup] No service role key. Attempting normal signup...');

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            options: {
                data: {
                    first_name: 'Test',
                    last_name: 'User',
                },
            },
        });

        if (signUpError) {
            if (signUpError.message?.includes('already been registered')) {
                console.log('[E2E Setup] Test user already exists (signup rejected).');
                console.warn('[E2E Setup] Cannot verify password without service role key.');
                console.warn('[E2E Setup] If tests fail at login, set SUPABASE_SERVICE_ROLE_KEY in .env.test');
            } else {
                console.error('[E2E Setup] Signup failed:', signUpError.message);
            }
        } else if (signUpData?.user) {
            console.log('[E2E Setup] Test user signed up:', signUpData.user.email);

            if (signUpData.user.confirmation_sent_at && !signUpData.user.email_confirmed_at) {
                console.warn('[E2E Setup] Email confirmation required. Tests may fail.');
                console.warn('[E2E Setup] Add SUPABASE_SERVICE_ROLE_KEY to auto-confirm users.');
            }
        }
    }

    console.log('[E2E Setup] Global setup complete.');
}
