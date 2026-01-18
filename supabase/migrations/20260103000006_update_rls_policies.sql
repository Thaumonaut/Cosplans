-- Migration: Update RLS policies for soft delete and ownership
-- Feature: 004-bugfix-testing
-- Date: 2026-01-03

-- Update tasks RLS policy to exclude deleted tasks
DROP POLICY IF EXISTS tasks_select ON tasks;
CREATE POLICY tasks_select ON tasks
  FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    AND (deleted_at IS NULL)
  );

-- Update teams delete policy to check owner
DROP POLICY IF EXISTS teams_delete ON teams;
CREATE POLICY teams_delete ON teams
  FOR DELETE
  USING (owner_id = auth.uid());

-- Ensure teams update policy checks membership
DROP POLICY IF EXISTS teams_update ON teams;
CREATE POLICY teams_update ON teams
  FOR UPDATE
  USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Add policy for team ownership transfers (owner only)
DROP POLICY IF EXISTS teams_transfer_ownership ON teams;
CREATE POLICY teams_transfer_ownership ON teams
  FOR UPDATE
  USING (owner_id = auth.uid());

