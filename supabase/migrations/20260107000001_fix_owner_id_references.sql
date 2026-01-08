-- Migration: Fix owner_id/created_by synchronization and RLS policies
-- Problem: Migration 20260103000002 adds owner_id but it may not be synced with created_by
-- Date: 2026-01-07

-- Ensure owner_id column exists and is synchronized with created_by
DO $$
BEGIN
  -- Add owner_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'teams' AND column_name = 'owner_id') THEN
    ALTER TABLE teams ADD COLUMN owner_id UUID REFERENCES auth.users(id);

    -- Sync owner_id from created_by for existing rows
    UPDATE teams SET owner_id = created_by WHERE owner_id IS NULL;

    -- Make owner_id NOT NULL
    ALTER TABLE teams ALTER COLUMN owner_id SET NOT NULL;

    -- Create index
    CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
  ELSE
    -- owner_id exists, ensure it's synced with created_by where NULL
    UPDATE teams SET owner_id = created_by WHERE owner_id IS NULL;
  END IF;
END $$;

-- Keep both columns in sync with trigger
CREATE OR REPLACE FUNCTION sync_team_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- If owner_id changes, update created_by (for consistency)
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    NEW.created_by := NEW.owner_id;
  END IF;
  -- If created_by changes (shouldn't happen but defensive), update owner_id
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    NEW.owner_id := NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_team_ownership_trigger ON teams;
CREATE TRIGGER sync_team_ownership_trigger
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION sync_team_ownership();

-- Fix RLS policies to use owner_id (now that it exists and is synced)
DROP POLICY IF EXISTS teams_delete ON teams;
CREATE POLICY teams_delete ON teams
  FOR DELETE
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS teams_transfer_ownership ON teams;
CREATE POLICY teams_transfer_ownership ON teams
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
