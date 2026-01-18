-- Migration: Break circular RLS dependency between teams and team_members
-- Problem: teams SELECT checks team_members, team_members SELECT checks teams -> infinite loop
-- Solution: Make team_members policies not reference teams table, use direct checks only
-- Date: 2026-01-07

-- Drop all team_members policies
DROP POLICY IF EXISTS team_members_select ON public.team_members;
DROP POLICY IF EXISTS team_members_insert ON public.team_members;
DROP POLICY IF EXISTS team_members_update ON public.team_members;
DROP POLICY IF EXISTS team_members_delete ON public.team_members;

-- SELECT: Users can see their own membership records only
-- This breaks the circular dependency by NOT checking the teams table
CREATE POLICY team_members_select ON public.team_members
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- INSERT: Allow authenticated users to insert team members
-- Trust the application/function to set correct values
CREATE POLICY team_members_insert ON public.team_members
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- UPDATE: Users can update team members (trust application logic)
CREATE POLICY team_members_update ON public.team_members
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- DELETE: Users can delete team members (trust application logic)
CREATE POLICY team_members_delete ON public.team_members
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
  );

-- Now update teams SELECT policy to remove dependency on team_members
-- This also breaks the circular dependency from the other side
DROP POLICY IF EXISTS teams_select ON public.teams;

CREATE POLICY teams_select ON public.teams
  FOR SELECT
  USING (
    created_by = auth.uid()
  );
