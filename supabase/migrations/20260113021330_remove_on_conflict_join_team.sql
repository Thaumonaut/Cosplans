-- Remove redundant ON CONFLICT from join_team_by_code (already checked by EXISTS) to fix ambiguity

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
AS $$
DECLARE
  current_user_id UUID;
  link_record RECORD;
  team_record RECORD;
BEGIN
  RAISE NOTICE 'Step 1: Starting join_team_by_code with code: %', p_code;

  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  RAISE NOTICE 'Step 2: Looking for link with code % for user %', p_code, current_user_id;

  SELECT * INTO link_record
  FROM public.team_join_links
  WHERE code = p_code
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired join code';
  END IF;

  RAISE NOTICE 'Step 3: Found link for team %', link_record.team_id;
  
  SELECT * INTO team_record
  FROM public.teams
  WHERE id = link_record.team_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found';
  END IF;

  RAISE NOTICE 'Step 4: Team % \"%\" found', team_record.id, team_record.name;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = link_record.team_id
    AND tm.user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this team';
  END IF;

  RAISE NOTICE 'Step 5: User not member, inserting into team_members';
  
  INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
  VALUES (
    link_record.team_id,
    current_user_id,
    link_record.role,
    'active',
    NOW()
  );
  
  RAISE NOTICE 'Step 6: Insert completed for team % role %', link_record.team_id, link_record.role;
  
  RETURN QUERY
  SELECT 
    team_record.id,
    team_record.name,
    link_record.role;
END;
$$;

-- Also fix RLS policy syntax (unqualified team_id)
DROP POLICY IF EXISTS "Users can add themselves via active join link" ON public.team_members;
CREATE POLICY "Users can add themselves via active join link" ON public.team_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_join_links tjl
    WHERE tjl.team_id = team_id
      AND tjl.code = current_setting('app.join_code', true)
      AND tjl.is_active = true
      AND (tjl.expires_at IS NULL OR tjl.expires_at > NOW())
  )
);