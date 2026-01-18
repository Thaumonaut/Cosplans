-- Feature: 006-brainstorming-moodboard
-- Migration: Create moodboard_shares table

CREATE TABLE IF NOT EXISTS moodboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT chk_revoked_inactive CHECK (
    (is_active = FALSE AND revoked_at IS NOT NULL) OR
    (is_active = TRUE AND revoked_at IS NULL)
  )
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_moodboard_shares_token ON moodboard_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_moodboard_shares_idea_id ON moodboard_shares(idea_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_shares_active ON moodboard_shares(is_active);

-- Enable RLS
ALTER TABLE moodboard_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can view active shares (for public sharing)
DROP POLICY IF EXISTS moodboard_shares_select_policy ON moodboard_shares;
CREATE POLICY moodboard_shares_select_policy ON moodboard_shares
FOR SELECT USING (is_active = TRUE);

-- RLS Policies: Only idea owner can create/manage shares
DROP POLICY IF EXISTS moodboard_shares_manage_policy ON moodboard_shares;
CREATE POLICY moodboard_shares_manage_policy ON moodboard_shares
FOR ALL USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);