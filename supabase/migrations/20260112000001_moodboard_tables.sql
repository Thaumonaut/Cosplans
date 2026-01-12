-- Migration: Feature 006 - Enhanced Brainstorming & Moodboarding
-- Creates moodboard_nodes and moodboard_edges tables for visual canvas
-- Part of PWA share target feature for collecting references from social media

-- ============================================================================
-- 1. Create moodboard_nodes table
-- ============================================================================
CREATE TABLE IF NOT EXISTS moodboard_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Add comment explaining the table purpose
COMMENT ON TABLE moodboard_nodes IS 'Stores all canvas nodes (images, social media embeds, notes, etc.) for moodboard feature';
COMMENT ON COLUMN moodboard_nodes.node_type IS 'Type of node: social_media (Instagram/TikTok), image (uploaded), link (URL), note (text), swatch (color), budget_item, contact, sketch, pile (group)';
COMMENT ON COLUMN moodboard_nodes.metadata IS 'Platform-specific data stored as JSONB. Structure varies by node_type. Example for social_media: {platform, post_id, author, caption}';
COMMENT ON COLUMN moodboard_nodes.position_x IS 'Canvas X coordinate for grid layout (pixels)';
COMMENT ON COLUMN moodboard_nodes.position_y IS 'Canvas Y coordinate for grid layout (pixels)';
COMMENT ON COLUMN moodboard_nodes.parent_id IS 'For items inside piles/groups. NULL = top-level node';

-- ============================================================================
-- 2. Create indexes for moodboard_nodes
-- ============================================================================
CREATE INDEX idx_moodboard_nodes_idea_id ON moodboard_nodes(idea_id);
CREATE INDEX idx_moodboard_nodes_node_type ON moodboard_nodes(node_type);
CREATE INDEX idx_moodboard_nodes_tags ON moodboard_nodes USING GIN(tags);
CREATE INDEX idx_moodboard_nodes_metadata ON moodboard_nodes USING GIN(metadata);
CREATE INDEX idx_moodboard_nodes_parent_id ON moodboard_nodes(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_moodboard_nodes_created_at ON moodboard_nodes(created_at DESC);

-- ============================================================================
-- 3. Create moodboard_edges table (connections between nodes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS moodboard_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Add comment explaining edge types
COMMENT ON TABLE moodboard_edges IS 'Stores connections between moodboard nodes (visual relationships on canvas)';
COMMENT ON COLUMN moodboard_edges.edge_type IS 'Semantic relationship: connection (generic), reference (references inspiration), alternative (different approach), shared_resource (shared across options), supplier_option (vendor link)';

-- ============================================================================
-- 4. Create indexes for moodboard_edges
-- ============================================================================
CREATE INDEX idx_moodboard_edges_idea_id ON moodboard_edges(idea_id);
CREATE INDEX idx_moodboard_edges_source ON moodboard_edges(source_node_id);
CREATE INDEX idx_moodboard_edges_target ON moodboard_edges(target_node_id);
CREATE INDEX idx_moodboard_edges_type ON moodboard_edges(edge_type);

-- ============================================================================
-- 5. Create trigger for auto-updating updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_moodboard_nodes_updated_at
  BEFORE UPDATE ON moodboard_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on moodboard_nodes
ALTER TABLE moodboard_nodes ENABLE ROW LEVEL SECURITY;

-- Users can view nodes for their team's ideas
CREATE POLICY moodboard_nodes_select_policy ON moodboard_nodes
  FOR SELECT
  USING (
    idea_id IN (
      SELECT id FROM ideas
      WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can insert nodes for their team's ideas
CREATE POLICY moodboard_nodes_insert_policy ON moodboard_nodes
  FOR INSERT
  WITH CHECK (
    idea_id IN (
      SELECT id FROM ideas
      WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can update nodes for their team's ideas
CREATE POLICY moodboard_nodes_update_policy ON moodboard_nodes
  FOR UPDATE
  USING (
    idea_id IN (
      SELECT id FROM ideas
      WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can delete nodes for their team's ideas
CREATE POLICY moodboard_nodes_delete_policy ON moodboard_nodes
  FOR DELETE
  USING (
    idea_id IN (
      SELECT id FROM ideas
      WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Enable RLS on moodboard_edges
ALTER TABLE moodboard_edges ENABLE ROW LEVEL SECURITY;

-- Users can view edges for their team's ideas
CREATE POLICY moodboard_edges_select_policy ON moodboard_edges
  FOR SELECT
  USING (
    idea_id IN (
      SELECT id FROM ideas
      WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can insert edges for their team's ideas
CREATE POLICY moodboard_edges_insert_policy ON moodboard_edges
  FOR INSERT
  WITH CHECK (
    idea_id IN (
      SELECT id FROM ideas
      WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Users can delete edges for their team's ideas
CREATE POLICY moodboard_edges_delete_policy ON moodboard_edges
  FOR DELETE
  USING (
    idea_id IN (
      SELECT id FROM ideas
      WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 7. Create Supabase Storage bucket for moodboard media
-- ============================================================================
-- Note: This uses Supabase's storage.buckets table
-- The bucket will store thumbnails, uploaded images, and cached social media content

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'moodboard-media',
  'moodboard-media',
  false, -- private bucket, requires authentication
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for moodboard-media bucket
CREATE POLICY "Team members can upload moodboard media" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'moodboard-media' AND
    auth.uid() IN (
      SELECT user_id FROM team_members
    )
  );

CREATE POLICY "Team members can view their team's moodboard media" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'moodboard-media' AND
    auth.uid() IN (
      SELECT user_id FROM team_members
    )
  );

CREATE POLICY "Team members can delete their team's moodboard media" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'moodboard-media' AND
    auth.uid() IN (
      SELECT user_id FROM team_members
    )
  );

-- ============================================================================
-- Migration complete
-- ============================================================================
-- This migration creates the foundation for the moodboard feature.
-- Tables: moodboard_nodes, moodboard_edges
-- RLS: Team-based access control
-- Storage: moodboard-media bucket for uploads
-- Next steps: Create TypeScript types, services, and UI components
