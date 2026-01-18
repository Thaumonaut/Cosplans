-- Migration: Simplify team_members RLS policies to avoid circular dependencies
-- Problem: team_members policies checking team_members causes infinite recursion
-- Solution: Use simple creator-based policies via teams.created_by
-- Date: 2026-01-07

-- Drop all existing team_members policies
DROP POLICY IF EXISTS team_members_select ON public.team_members;
DROP POLICY IF EXISTS team_members_insert ON public.team_members;
DROP POLICY IF EXISTS team_members_update ON public.team_members;
DROP POLICY IF EXISTS team_members_delete ON public.team_members;
DROP POLICY IF EXISTS "Team members can view each other" ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.team_members;
DROP POLICY IF EXISTS "Users can add themselves via active join link" ON public.team_members;

-- Simple, non-circular policies for team_members

-- SELECT: Users can see team members if:
-- 1. They created the team (via teams.created_by), OR
-- 2. It's their own membership record
CREATE POLICY team_members_select ON public.team_members
  FOR SELECT
  USING (
    -- User created the team
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
    OR
    -- User's own membership record
    user_id = auth.uid()
  );

-- INSERT: Team creators can add members
-- Also allow any authenticated user to insert themselves (for self-service join links)
CREATE POLICY team_members_insert ON public.team_members
  FOR INSERT
  WITH CHECK (
    -- User created the team
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
    OR
    -- User is adding themselves
    user_id = auth.uid()
  );

-- UPDATE: Team creators can update members
CREATE POLICY team_members_update ON public.team_members
  FOR UPDATE
  USING (
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  )
  WITH CHECK (
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  );

-- DELETE: Team creators can remove members
CREATE POLICY team_members_delete ON public.team_members
  FOR DELETE
  USING (
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  );
