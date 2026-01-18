-- Fix team member visibility for non-owners and add invite metadata columns
-- Root issue: team_members SELECT policy only allowed creators or self, causing member counts of 1
-- Also: invited_by / invited_at missing from schema so invite metadata is not persisted

-- 1) Ensure invite metadata columns exist
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

-- 2) Backfill invited_at for existing invited members if missing
UPDATE public.team_members
SET invited_at = COALESCE(invited_at, created_at)
WHERE COALESCE(status, 'active') = 'invited'
  AND invited_at IS NULL;

-- 3) Strengthen SELECT policy to allow members of a team to see each other
DROP POLICY IF EXISTS team_members_select ON public.team_members;
CREATE POLICY team_members_select ON public.team_members
  FOR SELECT
  USING (
    -- Team creator can see all members
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
    OR
    -- Members can see other members in the same team (active only)
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
      AND COALESCE(status, 'active') = 'active'
    )
  );

-- 4) Ensure teams visibility for active (or invited) members
DROP POLICY IF EXISTS teams_select ON public.teams;
CREATE POLICY teams_select ON public.teams
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND COALESCE(team_members.status, 'active') IN ('active', 'invited')
    )
  );

-- Note: INSERT/UPDATE/DELETE policies remain managed by existing migrations.
