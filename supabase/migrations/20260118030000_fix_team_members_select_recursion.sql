-- Fix RLS recursion on team_members SELECT policy
-- Problem: team_members SELECT policy referenced team_members, causing infinite recursion
-- Solution: Use SECURITY DEFINER helper that bypasses RLS for membership checks

-- Helper: check if user can view team (active or invited membership)
CREATE OR REPLACE FUNCTION public.user_can_view_team(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = p_team_id
      AND user_id = p_user_id
      AND COALESCE(status, 'active') IN ('active', 'invited')
  );
$$;

-- Replace recursive team_members SELECT policy
DROP POLICY IF EXISTS team_members_select ON public.team_members;
DROP POLICY IF EXISTS "Team members can view each other" ON public.team_members;

CREATE POLICY team_members_select ON public.team_members
  FOR SELECT
  USING (
    -- Team creator can see all members
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
    OR
    -- Team members (active or invited) can see their team roster
    public.user_can_view_team(team_id, auth.uid())
  );

-- Ensure teams visibility uses the non-recursive helper as well
DROP POLICY IF EXISTS teams_select ON public.teams;
DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;

CREATE POLICY teams_select ON public.teams
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR public.user_can_view_team(id, auth.uid())
  );
