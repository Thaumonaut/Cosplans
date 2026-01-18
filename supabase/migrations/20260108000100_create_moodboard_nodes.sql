-- Feature: 006-brainstorming-moodboard
-- Migration: Create moodboard_nodes table with RLS policies

-- Create moodboard_nodes table
CREATE TABLE IF NOT EXISTS moodboard_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  node_type VARCHAR(50) NOT NULL CHECK (node_type IN (
    'social_media', 'image', 'link', 'note', 'swatch', 'budget_item', 'contact', 'sketch', 'pile'
  )),
  content_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  short_comment TEXT,
  long_note TEXT,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  width INTEGER DEFAULT 300,
  height INTEGER,
  z_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  is_expanded BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_idea_id ON moodboard_nodes(idea_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_node_type ON moodboard_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_tags ON moodboard_nodes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_metadata ON moodboard_nodes USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_parent_id ON moodboard_nodes(parent_id);

-- Enable RLS
ALTER TABLE moodboard_nodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view nodes for their team's ideas
DROP POLICY IF EXISTS moodboard_nodes_select_policy ON moodboard_nodes;
CREATE POLICY moodboard_nodes_select_policy ON moodboard_nodes
FOR SELECT USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

-- RLS Policies: Users can insert nodes for their team's ideas
DROP POLICY IF EXISTS moodboard_nodes_insert_policy ON moodboard_nodes;
CREATE POLICY moodboard_nodes_insert_policy ON moodboard_nodes
FOR INSERT WITH CHECK (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

-- RLS Policies: Users can update nodes for their team's ideas
DROP POLICY IF EXISTS moodboard_nodes_update_policy ON moodboard_nodes;
CREATE POLICY moodboard_nodes_update_policy ON moodboard_nodes
FOR UPDATE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

-- RLS Policies: Users can delete nodes for their team's ideas
DROP POLICY IF EXISTS moodboard_nodes_delete_policy ON moodboard_nodes;
CREATE POLICY moodboard_nodes_delete_policy ON moodboard_nodes
FOR DELETE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_moodboard_nodes_updated_at ON moodboard_nodes;
CREATE TRIGGER update_moodboard_nodes_updated_at
BEFORE UPDATE ON moodboard_nodes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();