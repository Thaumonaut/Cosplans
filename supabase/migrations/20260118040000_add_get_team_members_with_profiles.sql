-- Add RPC to fetch team members with profile details
-- This bypasses users RLS while respecting team membership

CREATE OR REPLACE FUNCTION public.get_team_members_with_profiles(p_team_id UUID)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  user_id UUID,
  role TEXT,
  status TEXT,
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  user_email TEXT,
  user_name TEXT,
  avatar_url TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.status,
    tm.invited_by,
    tm.invited_at,
    tm.joined_at,
    tm.created_at,
    u.email AS user_email,
    u.name AS user_name,
    u.avatar_url
  FROM public.team_members tm
  LEFT JOIN public.users u ON u.id = tm.user_id
  WHERE tm.team_id = p_team_id
    AND (
      public.user_can_view_team(p_team_id, auth.uid())
      OR p_team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
    )
  ORDER BY tm.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_team_members_with_profiles(UUID) TO authenticated;
