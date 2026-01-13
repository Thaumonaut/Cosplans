-- Comprehensive fix for team join ambiguous column error
-- This fixes the RLS policy and ensures the function works correctly

-- First, drop the problematic RLS policy completely
DROP POLICY IF EXISTS "Users can add themselves via active join link" ON public.team_members;

-- The policy isn't actually needed because:
-- 1. The join_team_by_code function is SECURITY DEFINER (bypasses RLS)
-- 2. Direct user inserts to team_members should go through proper channels (invites, join codes via function)
-- 3. Other RLS policies already protect the team_members table

-- If we DO want this policy for extra security, here's the correct version:
-- In an INSERT WITH CHECK, unqualified column names refer to the NEW row
-- So we use unqualified team_id to refer to the row being inserted
CREATE POLICY "Users can add themselves via active join link"
ON public.team_members
FOR INSERT
WITH CHECK (
  -- This policy allows INSERT if there's an active join link for the team being inserted
  -- user_id must match auth.uid() (the inserting user)
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.team_join_links tjl
    WHERE tjl.team_id = public.team_members.team_id  -- Explicitly qualify to avoid ambiguity
      AND tjl.code = current_setting('app.join_code', true)
      AND tjl.is_active = true
      AND (tjl.expires_at IS NULL OR tjl.expires_at > NOW())
  )
);

-- Also recreate the join_team_by_code function to be extra safe
-- Make it explicitly disable RLS for the INSERT operation
CREATE OR REPLACE FUNCTION public.join_team_by_code(
  p_code TEXT
)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  link_record RECORD;
  team_record RECORD;
BEGIN
  -- Get current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find the join link
  SELECT tjl.team_id, tjl.role INTO link_record
  FROM public.team_join_links tjl
  WHERE tjl.code = p_code
  AND tjl.is_active = true
  AND (tjl.expires_at IS NULL OR tjl.expires_at > NOW());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired join code';
  END IF;

  -- Get team info
  SELECT t.id, t.name INTO team_record
  FROM public.teams t
  WHERE t.id = link_record.team_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found';
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = link_record.team_id
    AND tm.user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this team';
  END IF;

  -- Add user as team member with the specified role
  -- SECURITY DEFINER bypasses RLS, but we'll set the session variable just in case
  PERFORM set_config('app.join_code', p_code, true);

  INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
  VALUES (
    link_record.team_id,
    current_user_id,
    link_record.role,
    'active',
    NOW()
  )
  ON CONFLICT (team_id, user_id) DO UPDATE SET
    status = 'active',
    role = EXCLUDED.role,
    joined_at = NOW();

  -- Return team info
  RETURN QUERY
  SELECT
    team_record.id AS team_id,
    team_record.name AS team_name,
    link_record.role AS role;
END;
$$;
