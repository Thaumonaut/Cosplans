-- Migration: Add explicit ownership tracking to teams
-- Feature: 004-bugfix-testing
-- Date: 2026-01-03

-- Add ownership tracking columns
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS previous_owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS ownership_transferred_at TIMESTAMPTZ;

-- Migrate existing data: set owner_id from team_members with role='owner'
-- Only update teams that don't have owner_id set
UPDATE teams t
SET owner_id = (
  SELECT user_id FROM team_members tm
  WHERE tm.team_id = t.id 
    AND tm.role = 'owner'
  LIMIT 1
)
WHERE owner_id IS NULL;

-- Make owner_id required (after data migration)
ALTER TABLE teams
  ALTER COLUMN owner_id SET NOT NULL;

-- Create index for owner queries
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);

-- Create function to check owner is team member (constraint)
CREATE OR REPLACE FUNCTION check_team_owner_is_member()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = NEW.id AND tm.user_id = NEW.owner_id
  ) THEN
    RAISE EXCEPTION 'Owner must be a team member';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce owner must be member
DROP TRIGGER IF EXISTS team_owner_must_be_member_trigger ON teams;
CREATE TRIGGER team_owner_must_be_member_trigger
  BEFORE INSERT OR UPDATE OF owner_id ON teams
  FOR EACH ROW EXECUTE FUNCTION check_team_owner_is_member();



