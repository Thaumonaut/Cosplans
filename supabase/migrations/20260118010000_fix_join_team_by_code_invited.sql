-- Fix join_team_by_code to activate existing invited memberships instead of throwing
-- Problem: users invited (status='invited') who use join links get "already a member" and remain invisible due to status

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
  existing_member RECORD;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT tjl.team_id, tjl.role INTO link_record
  FROM public.team_join_links tjl
  WHERE tjl.code = p_code
  AND tjl.is_active = true
  AND (tjl.expires_at IS NULL OR tjl.expires_at > NOW());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired join code';
  END IF;

  SELECT t.id, t.name INTO team_record
  FROM public.teams t
  WHERE t.id = link_record.team_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found';
  END IF;

  -- Check existing membership (if any)
  SELECT tm.id, tm.status INTO existing_member
  FROM public.team_members tm
  WHERE tm.team_id = link_record.team_id
  AND tm.user_id = current_user_id
  LIMIT 1;

  IF FOUND THEN
    -- If already active, do not re-join
    IF COALESCE(existing_member.status, 'active') = 'active' THEN
      RAISE EXCEPTION 'You are already a member of this team';
    END IF;

    -- If invited/inactive, activate membership
    UPDATE public.team_members
    SET status = 'active',
        role = link_record.role,
        joined_at = NOW()
    WHERE team_id = link_record.team_id
      AND user_id = current_user_id;
  ELSE
    -- Add user as team member with the specified role
    INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
    VALUES (
      link_record.team_id,
      current_user_id,
      link_record.role,
      'active',
      NOW()
    );
  END IF;

  RETURN QUERY
  SELECT
    team_record.id AS team_id,
    team_record.name AS team_name,
    link_record.role AS role;
END;
$$;
