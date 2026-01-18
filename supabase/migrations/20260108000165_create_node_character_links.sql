-- Feature: 006-brainstorming-moodboard
-- Migration: Create moodboard_node_character_links table

CREATE TABLE IF NOT EXISTS moodboard_node_character_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(node_id, character_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_node_character_links_node ON moodboard_node_character_links(node_id);
CREATE INDEX IF NOT EXISTS idx_node_character_links_character ON moodboard_node_character_links(character_name);
CREATE INDEX IF NOT EXISTS idx_node_character_links_idea ON moodboard_node_character_links(idea_id);

-- Enable RLS
ALTER TABLE moodboard_node_character_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS node_character_links_select_policy ON moodboard_node_character_links;
CREATE POLICY node_character_links_select_policy ON moodboard_node_character_links
FOR SELECT USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS node_character_links_insert_policy ON moodboard_node_character_links;
CREATE POLICY node_character_links_insert_policy ON moodboard_node_character_links
FOR INSERT WITH CHECK (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS node_character_links_update_policy ON moodboard_node_character_links;
CREATE POLICY node_character_links_update_policy ON moodboard_node_character_links
FOR UPDATE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS node_character_links_delete_policy ON moodboard_node_character_links;
CREATE POLICY node_character_links_delete_policy ON moodboard_node_character_links
FOR DELETE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);