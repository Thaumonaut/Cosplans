import { supabase } from "$lib/supabase";
import type {
  AuthenticationService,
  LoginCredentials,
  SignupData,
  AuthResult,
  OAuthProvider,
} from "$lib/types/auth";

class SupabaseAuthService implements AuthenticationService {
  async signIn(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      };
    }
  }

  async signUp(data: SignupData): Promise<AuthResult> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      // Setup new user (create profile and personal team)
      if (authData.user) {
        try {
          const { error: setupError } = await supabase.rpc("setup_new_user", {
            p_user_id: authData.user.id,
          });

          if (setupError) {
            console.error("Failed to setup new user:", setupError);
            // Don't fail signup if team creation fails - user can create team later
          }
        } catch (setupErr) {
          console.error("Error calling setup_new_user:", setupErr);
          // Don't fail signup if team creation fails
        }
      }

      return {
        user: authData.user,
        session: authData.session,
        error: null,
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      };
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return {
        error: error ? error.message : null,
      };
    } catch (err) {
      return {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      };
    }
  }

  async signInWithOAuth(
    provider: OAuthProvider,
    redirectTo?: string,
  ): Promise<AuthResult> {
    try {
      // Store the redirect destination in localStorage before OAuth redirect
      // OAuth providers may strip query parameters, so we need a reliable way to preserve this
      const destination = redirectTo || "/dashboard";
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("oauth_redirect_to", destination);
        } catch (e) {
          console.warn("Failed to store OAuth redirect destination:", e);
        }
      }

      // Build callback URL using current origin (works for localhost, staging, production)
      // CRITICAL: This URL must EXACTLY match an entry in Supabase Redirect URLs list
      // - Must include the protocol (http:// or https://)
      // - Must match the exact path (/auth/callback)
      // - No trailing slashes
      const origin = window.location.origin;
      const callbackUrl = `${origin}/auth/callback`;

      // Add query params for the final destination (where to redirect after auth)
      const finalCallbackUrl = new URL(callbackUrl);
      if (redirectTo) {
        finalCallbackUrl.searchParams.set("next", redirectTo);
      }

      console.log("[OAuth] Initiating OAuth flow:", {
        provider,
        currentOrigin: origin,
        callbackUrl: callbackUrl, // Without query params (for Supabase validation)
        finalCallbackUrl: finalCallbackUrl.toString(), // With query params
        destination: destination,
        warning:
          "Make sure callbackUrl EXACTLY matches Supabase Redirect URLs list",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // CRITICAL: Use the exact callback URL (without query params for Supabase validation)
          // This must match EXACTLY one of the URLs in Supabase dashboard Redirect URLs
          // Supabase will append the code and other params itself
          redirectTo: callbackUrl, // Use base URL without query params - Supabase validates this
          // Pass the final destination as a query param that Supabase will preserve
          queryParams: {
            ...(redirectTo && { next: redirectTo }),
          },
        },
      });

      if (error) {
        console.error("[OAuth] Supabase OAuth error:", {
          error: error.message,
          provider,
          callbackUrl,
          hint: "Verify callbackUrl exactly matches a URL in Supabase Redirect URLs list",
        });
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      console.log(
        "[OAuth] OAuth flow initiated successfully, redirecting to provider...",
      );

      // OAuth redirects, so we won't have immediate user/session data
      return {
        user: null,
        session: null,
        error: null,
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      };
    }
  }

  async getSession() {
    // Use getUser() instead of getSession() for security (validates JWT)
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return null;
    }

    // Return a minimal session with validated user
    return { user: userData.user };
  }

  async refreshSession() {
    const {
      data: { session },
    } = await supabase.auth.refreshSession();
    return session;
  }
}

// Export singleton instance
export const authService = new SupabaseAuthService();
