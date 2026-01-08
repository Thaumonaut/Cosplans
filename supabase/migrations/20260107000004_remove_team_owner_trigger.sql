-- Migration: Remove team owner trigger that causes circular dependency
-- Problem: Trigger checks if owner is team member BEFORE INSERT, but member can't exist until AFTER team is created
-- Solution: Drop the trigger and rely on application/function logic to add owner as member
-- Date: 2026-01-07

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS team_owner_must_be_member_trigger ON teams;

-- Drop the trigger function
DROP FUNCTION IF EXISTS check_team_owner_is_member();

-- Since we're using created_by (not owner_id), sync owner_id with created_by for consistency
-- This allows existing code that references owner_id to still work
UPDATE teams
SET owner_id = created_by
WHERE owner_id IS NULL OR owner_id != created_by;

-- Create a trigger to keep owner_id in sync with created_by (non-blocking)
CREATE OR REPLACE FUNCTION sync_team_owner_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If owner_id is not set, copy from created_by
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := NEW.created_by;
  END IF;

  -- If created_by is changed, update owner_id to match
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    NEW.owner_id := NEW.created_by;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_team_owner_id_trigger ON teams;
CREATE TRIGGER sync_team_owner_id_trigger
  BEFORE INSERT OR UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION sync_team_owner_id();

-- Note: Application code and create_team_safe function will handle adding
-- the creator as a team member AFTER the team is created
