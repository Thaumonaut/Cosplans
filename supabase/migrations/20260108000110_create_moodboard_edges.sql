-- Feature: 006-brainstorming-moodboard
-- Migration: Create moodboard_edges table

CREATE TABLE IF NOT EXISTS moodboard_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  edge_type VARCHAR(50) NOT NULL CHECK (edge_type IN (
    'connection', 'reference', 'alternative', 'shared_resource', 'supplier_option'
  )),
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT chk_no_self_loops CHECK (source_node_id != target_node_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moodboard_edges_idea_id ON moodboard_edges(idea_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_edges_source ON moodboard_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_edges_target ON moodboard_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_edges_type ON moodboard_edges(edge_type);

-- Enable RLS
ALTER TABLE moodboard_edges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can manage edges for their team's ideas
DROP POLICY IF EXISTS moodboard_edges_select_policy ON moodboard_edges;
CREATE POLICY moodboard_edges_select_policy ON moodboard_edges
FOR SELECT USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS moodboard_edges_insert_policy ON moodboard_edges;
CREATE POLICY moodboard_edges_insert_policy ON moodboard_edges
FOR INSERT WITH CHECK (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS moodboard_edges_update_policy ON moodboard_edges;
CREATE POLICY moodboard_edges_update_policy ON moodboard_edges
FOR UPDATE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS moodboard_edges_delete_policy ON moodboard_edges;
CREATE POLICY moodboard_edges_delete_policy ON moodboard_edges
FOR DELETE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);