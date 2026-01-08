-- Migration: Add function to delete user account completely
-- This function deletes both the auth user and related data
-- Date: 2026-01-07

-- First, add DELETE policy for users table so users can delete their own profile
DROP POLICY IF EXISTS users_delete ON public.users;
CREATE POLICY users_delete ON public.users
  FOR DELETE
  USING (id = auth.uid());

-- Create a function to delete a user account
-- This uses SECURITY DEFINER to run with elevated privileges
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  team_record RECORD;
  other_member_id UUID;
  teams_with_others_count INT;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check for teams where user is the creator and there are other members
  SELECT COUNT(*) INTO teams_with_others_count
  FROM public.teams t
  WHERE t.created_by = current_user_id
  AND EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = t.id
    AND tm.user_id != current_user_id
    AND COALESCE(tm.status, 'active') = 'active'
  );

  -- If user owns teams with other members, prevent deletion
  IF teams_with_others_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete account while you own teams with other members. Please transfer ownership or remove members first.';
  END IF;

  -- Delete teams where user is the only member (or creator with no other members)
  DELETE FROM public.teams
  WHERE created_by = current_user_id;

  -- Delete from users table (this will cascade to related tables via foreign keys)
  DELETE FROM public.users WHERE id = current_user_id;

  -- Delete from auth.users (requires elevated privileges)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.delete_user_account() IS
  'Allows authenticated users to delete their own account completely from both public.users and auth.users';
