-- Feature: 006-brainstorming-moodboard
-- Migration: Create moodboard_comments table

CREATE TABLE IF NOT EXISTS moodboard_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  node_id UUID REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  oauth_provider VARCHAR(50) NOT NULL CHECK (oauth_provider IN (
    'google', 'github', 'facebook', 'microsoft'
  )),
  oauth_user_id TEXT NOT NULL,
  commenter_name TEXT NOT NULL,
  commenter_avatar TEXT,
  commenter_email TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT chk_comment_text_not_empty CHECK (LENGTH(TRIM(comment_text)) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moodboard_comments_idea_id ON moodboard_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_comments_node_id ON moodboard_comments(node_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_comments_oauth_user ON moodboard_comments(oauth_provider, oauth_user_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_comments_created_at ON moodboard_comments(created_at DESC);

-- Enable RLS
ALTER TABLE moodboard_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can view comments on shared moodboards
DROP POLICY IF EXISTS moodboard_comments_select_policy ON moodboard_comments;
CREATE POLICY moodboard_comments_select_policy ON moodboard_comments
FOR SELECT USING (
  idea_id IN (
    SELECT idea_id FROM moodboard_shares WHERE is_active = TRUE
  ) OR
  idea_id IN (
    SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);

-- RLS Policies: Authenticated OAuth users can insert comments on shared boards
DROP POLICY IF EXISTS moodboard_comments_insert_policy ON moodboard_comments;
CREATE POLICY moodboard_comments_insert_policy ON moodboard_comments
FOR INSERT WITH CHECK (
  idea_id IN (SELECT idea_id FROM moodboard_shares WHERE is_active = TRUE)
);

-- RLS Policies: Users can update/delete their own comments
DROP POLICY IF EXISTS moodboard_comments_update_policy ON moodboard_comments;
CREATE POLICY moodboard_comments_update_policy ON moodboard_comments
FOR UPDATE USING (
  oauth_user_id = (SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS moodboard_comments_delete_policy ON moodboard_comments;
CREATE POLICY moodboard_comments_delete_policy ON moodboard_comments
FOR DELETE USING (
  oauth_user_id = (SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_moodboard_comments_updated_at ON moodboard_comments;
CREATE TRIGGER update_moodboard_comments_updated_at
BEFORE UPDATE ON moodboard_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();