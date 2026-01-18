-- Feature: 006-brainstorming-moodboard
-- Migration: Create idea_options table

CREATE TABLE IF NOT EXISTS idea_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_idea_options_idea_id ON idea_options(idea_id);

-- Enable RLS
ALTER TABLE idea_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS idea_options_select_policy ON idea_options;
CREATE POLICY idea_options_select_policy ON idea_options
FOR SELECT USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS idea_options_insert_policy ON idea_options;
CREATE POLICY idea_options_insert_policy ON idea_options
FOR INSERT WITH CHECK (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS idea_options_update_policy ON idea_options;
CREATE POLICY idea_options_update_policy ON idea_options
FOR UPDATE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS idea_options_delete_policy ON idea_options;
CREATE POLICY idea_options_delete_policy ON idea_options
FOR DELETE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_idea_options_updated_at ON idea_options;
CREATE TRIGGER update_idea_options_updated_at
BEFORE UPDATE ON idea_options
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();