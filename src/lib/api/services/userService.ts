import { supabase } from "$lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
}

export const userService = {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<UserProfile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Get profile from users table
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // User doesn't have a profile record yet, create one
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email || "",
            name:
              user.user_metadata?.first_name ||
              user.user_metadata?.name ||
              null,
            avatar_url: user.user_metadata?.avatar_url || null,
          } as any)
          .select()
          .single();

        if (createError) throw createError;

        return {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name || undefined,
          firstName: user.user_metadata?.first_name || undefined,
          lastName: user.user_metadata?.last_name || undefined,
          avatarUrl: newProfile.avatar_url || undefined,
          bio: newProfile.bio || undefined,
          createdAt: newProfile.created_at,
          updatedAt: newProfile.updated_at,
        };
      }
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      firstName: user.user_metadata?.first_name || undefined,
      lastName: user.user_metadata?.last_name || undefined,
      avatarUrl: data.avatar_url || undefined,
      bio: data.bio || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Update current user's profile
   */
  async updateProfile(updates: UserProfileUpdate): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Update users table
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.avatarUrl !== undefined)
      updateData.avatar_url = updates.avatarUrl;
    if (updates.bio !== undefined) updateData.bio = updates.bio;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      // If profile doesn't exist, create it
      if (error.code === "PGRST116" || error.code === "23503") {
        const { data: newData, error: createError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email || "",
            name: updates.name || null,
            avatar_url: updates.avatarUrl || null,
            bio: updates.bio || null,
          } as any)
          .select()
          .single();

        if (createError) throw createError;

        // Update auth metadata if firstName/lastName provided
        if (updates.firstName !== undefined || updates.lastName !== undefined) {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            const metadata = { ...authUser.user_metadata };
            if (updates.firstName !== undefined)
              metadata.first_name = updates.firstName;
            if (updates.lastName !== undefined)
              metadata.last_name = updates.lastName;
            await supabase.auth.updateUser({ data: metadata });
          }
        }

        return {
          id: newData.id,
          email: newData.email,
          name: newData.name || undefined,
          firstName: updates.firstName,
          lastName: updates.lastName,
          avatarUrl: newData.avatar_url || undefined,
          bio: newData.bio || undefined,
          createdAt: newData.created_at,
          updatedAt: newData.updated_at,
        };
      }
      throw error;
    }

    // Update auth metadata if firstName/lastName provided
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const metadata = { ...authUser.user_metadata };
        if (updates.firstName !== undefined)
          metadata.first_name = updates.firstName;
        if (updates.lastName !== undefined)
          metadata.last_name = updates.lastName;
        await supabase.auth.updateUser({ data: metadata });
      }
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      firstName: updates.firstName,
      lastName: updates.lastName,
      avatarUrl: data.avatar_url || undefined,
      bio: data.bio || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Delete current user's account completely
   * This calls a database function that deletes both the profile and auth user
   */
  async deleteAccount(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Call the database function to delete the account
    // This function has SECURITY DEFINER so it can delete from auth.users
    const { error: rpcError } = await supabase.rpc("delete_user_account");

    if (rpcError) throw rpcError;

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) throw signOutError;
  },
};
