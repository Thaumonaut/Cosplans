-- Feature: 006-brainstorming-moodboard
-- Migration: Create tutorials table

CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  technique_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutorials_team_id ON tutorials(team_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_tags ON tutorials USING GIN(technique_tags);
CREATE INDEX IF NOT EXISTS idx_tutorials_rating ON tutorials(rating DESC NULLS LAST);

-- Enable RLS
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS tutorials_select_policy ON tutorials;
CREATE POLICY tutorials_select_policy ON tutorials
FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS tutorials_insert_policy ON tutorials;
CREATE POLICY tutorials_insert_policy ON tutorials
FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS tutorials_update_policy ON tutorials;
CREATE POLICY tutorials_update_policy ON tutorials
FOR UPDATE USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS tutorials_delete_policy ON tutorials;
CREATE POLICY tutorials_delete_policy ON tutorials
FOR DELETE USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_tutorials_updated_at ON tutorials;
CREATE TRIGGER update_tutorials_updated_at
BEFORE UPDATE ON tutorials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();