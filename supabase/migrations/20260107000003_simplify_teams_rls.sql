-- Migration: Simplify teams RLS policies to avoid circular dependencies
-- Problem: Checking team_members during team creation causes infinite recursion
-- Solution: Use simple creator-based policies for teams table
-- Date: 2026-01-07

-- Drop all existing teams policies
DROP POLICY IF EXISTS teams_select ON public.teams;
DROP POLICY IF EXISTS teams_insert ON public.teams;
DROP POLICY IF EXISTS teams_update ON public.teams;
DROP POLICY IF EXISTS teams_delete ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Owners can update their teams" ON public.teams;
DROP POLICY IF EXISTS "Owners can delete their teams" ON public.teams;
DROP POLICY IF EXISTS teams_transfer_ownership ON public.teams;

-- Simple, non-circular policies for teams

-- SELECT: Users can see teams where they are the creator OR they are a member
CREATE POLICY teams_select ON public.teams
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND COALESCE(team_members.status, 'active') = 'active'
    )
  );

-- INSERT: Any authenticated user can create a team (they must be the creator)
CREATE POLICY teams_insert ON public.teams
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- UPDATE: Only the creator can update their team
CREATE POLICY teams_update ON public.teams
  FOR UPDATE
  USING (
    created_by = auth.uid()
  )
  WITH CHECK (
    created_by = auth.uid()
  );

-- DELETE: Only the creator can delete their team
CREATE POLICY teams_delete ON public.teams
  FOR DELETE
  USING (
    created_by = auth.uid()
  );
