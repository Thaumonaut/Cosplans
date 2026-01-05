-- Migration: Create team ownership history table for audit trail
-- Feature: 004-bugfix-testing
-- Date: 2026-01-03

-- Create team_ownership_history table
CREATE TABLE IF NOT EXISTS team_ownership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  transferred_at TIMESTAMPTZ DEFAULT NOW(),
  transferred_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_ownership_history_team ON team_ownership_history(team_id);
CREATE INDEX IF NOT EXISTS idx_team_ownership_history_users ON team_ownership_history(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_team_ownership_history_date ON team_ownership_history(transferred_at DESC);

-- Enable RLS
ALTER TABLE team_ownership_history ENABLE ROW LEVEL SECURITY;

-- RLS policy: only team members can view ownership history
CREATE POLICY team_ownership_history_select ON team_ownership_history
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Only authenticated users can insert (via service layer)
CREATE POLICY team_ownership_history_insert ON team_ownership_history
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');



