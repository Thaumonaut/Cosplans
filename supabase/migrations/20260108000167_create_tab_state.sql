-- Feature: 006-brainstorming-moodboard
-- Migration: Create moodboard_tab_state table

CREATE TABLE IF NOT EXISTS moodboard_tab_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_character_tab TEXT,
  active_variation_tab TEXT,
  tab_order JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(idea_id, user_id)
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_tab_state_idea_user ON moodboard_tab_state(idea_id, user_id);

-- Enable RLS
ALTER TABLE moodboard_tab_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own tab state
DROP POLICY IF EXISTS tab_state_select_policy ON moodboard_tab_state;
CREATE POLICY tab_state_select_policy ON moodboard_tab_state
FOR SELECT USING (
  user_id = auth.uid()
);

DROP POLICY IF EXISTS tab_state_insert_policy ON moodboard_tab_state;
CREATE POLICY tab_state_insert_policy ON moodboard_tab_state
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

DROP POLICY IF EXISTS tab_state_update_policy ON moodboard_tab_state;
CREATE POLICY tab_state_update_policy ON moodboard_tab_state
FOR UPDATE USING (
  user_id = auth.uid()
);

DROP POLICY IF EXISTS tab_state_delete_policy ON moodboard_tab_state;
CREATE POLICY tab_state_delete_policy ON moodboard_tab_state
FOR DELETE USING (
  user_id = auth.uid()
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_tab_state_updated_at ON moodboard_tab_state;
CREATE TRIGGER update_tab_state_updated_at
BEFORE UPDATE ON moodboard_tab_state
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();