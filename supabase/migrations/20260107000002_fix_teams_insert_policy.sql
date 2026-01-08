-- Migration: Fix teams INSERT policy to allow team creation
-- Problem: INSERT policy checks team membership, but creator can't be a member until AFTER team is created
-- Solution: Allow any authenticated user to create teams (they'll be added as owner in team_members)
-- Date: 2026-01-07

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
DROP POLICY IF EXISTS teams_insert ON public.teams;

-- Allow authenticated users to create teams
-- The created_by must match the authenticated user
-- The team_members table will be populated by the create_team_safe function or application code
CREATE POLICY teams_insert ON public.teams
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

-- Ensure SELECT policy allows creators to see their own teams
-- This is needed because team might not have team_members entry yet during creation
DROP POLICY IF EXISTS teams_select ON public.teams;
CREATE POLICY teams_select ON public.teams
  FOR SELECT
  USING (
    -- Creator can always see their team
    created_by = auth.uid()
    OR
    -- Member can see teams they belong to
    id IN (
      SELECT team_id
      FROM public.team_members
      WHERE user_id = auth.uid()
      AND COALESCE(status, 'active') = 'active'
    )
  );
