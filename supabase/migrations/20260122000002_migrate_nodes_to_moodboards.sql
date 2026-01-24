-- Feature: 006-brainstorming-moodboard
-- Migration: Add moodboard_id to nodes and update schema for hierarchy (CAP-02)
-- Task: T-002

-- Step 1: Add new columns to moodboard_nodes
ALTER TABLE public.moodboard_nodes
  ADD COLUMN IF NOT EXISTS moodboard_id UUID REFERENCES public.moodboards(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS container_type TEXT CHECK (container_type IN ('group', 'character', 'option', 'prop', NULL)),
  ADD COLUMN IF NOT EXISTS linked_moodboard_id UUID REFERENCES public.moodboards(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Update node_type constraint to include new container and leaf types
ALTER TABLE public.moodboard_nodes DROP CONSTRAINT IF EXISTS moodboard_nodes_node_type_check;
ALTER TABLE public.moodboard_nodes ADD CONSTRAINT moodboard_nodes_node_type_check
  CHECK (node_type IN (
    -- Containers
    'container',
    'moodboard_link',
    -- References (existing + new)
    'social_media',
    'image',
    'link',
    'note',
    -- Design
    'color_palette',
    'measurements',
    -- Materials
    'fabric',
    -- People & Money
    'budget_item',
    'contact',
    -- Legacy (keep for backwards compatibility)
    'swatch',
    'sketch',
    'pile'
  ));

-- Create index for moodboard_id lookups
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_moodboard_id ON public.moodboard_nodes(moodboard_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_moodboard_parent ON public.moodboard_nodes(moodboard_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_container_type ON public.moodboard_nodes(container_type) WHERE container_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_linked_moodboard ON public.moodboard_nodes(linked_moodboard_id) WHERE linked_moodboard_id IS NOT NULL;

-- Step 2: Create moodboards for existing ideas and link nodes
-- This creates a moodboard for each idea that has nodes
DO $$
DECLARE
  idea_record RECORD;
  new_moodboard_id UUID;
BEGIN
  -- For each idea that has moodboard nodes
  FOR idea_record IN
    SELECT DISTINCT i.id, i.title, i.team_id
    FROM public.ideas i
    WHERE EXISTS (
      SELECT 1 FROM public.moodboard_nodes mn WHERE mn.idea_id = i.id
    )
    AND i.moodboard_id IS NULL
  LOOP
    -- Create a moodboard for this idea
    INSERT INTO public.moodboards (owner_type, owner_id, title)
    VALUES ('idea', idea_record.id, idea_record.title)
    RETURNING id INTO new_moodboard_id;

    -- Update the idea to reference this moodboard
    UPDATE public.ideas
    SET moodboard_id = new_moodboard_id
    WHERE id = idea_record.id;

    -- Update all nodes for this idea to reference the moodboard
    UPDATE public.moodboard_nodes
    SET moodboard_id = new_moodboard_id
    WHERE idea_id = idea_record.id;
  END LOOP;
END $$;

-- Step 3: Update RLS policies to use moodboard_id instead of idea_id
-- Keep idea_id policies for backward compatibility during transition

-- Add RLS policy for moodboard-based access
DROP POLICY IF EXISTS moodboard_nodes_select_by_moodboard_policy ON public.moodboard_nodes;
CREATE POLICY moodboard_nodes_select_by_moodboard_policy ON public.moodboard_nodes
FOR SELECT USING (
  -- Allow if user can access via idea_id (legacy)
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  -- Or if user can access via moodboard_id (new)
  OR moodboard_id IN (
    SELECT m.id FROM public.moodboards m
    WHERE public.can_access_moodboard(m)
  )
);

DROP POLICY IF EXISTS moodboard_nodes_insert_by_moodboard_policy ON public.moodboard_nodes;
CREATE POLICY moodboard_nodes_insert_by_moodboard_policy ON public.moodboard_nodes
FOR INSERT WITH CHECK (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  OR moodboard_id IN (
    SELECT m.id FROM public.moodboards m
    WHERE public.can_access_moodboard(m)
  )
);

DROP POLICY IF EXISTS moodboard_nodes_update_by_moodboard_policy ON public.moodboard_nodes;
CREATE POLICY moodboard_nodes_update_by_moodboard_policy ON public.moodboard_nodes
FOR UPDATE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  OR moodboard_id IN (
    SELECT m.id FROM public.moodboards m
    WHERE public.can_access_moodboard(m)
  )
);

DROP POLICY IF EXISTS moodboard_nodes_delete_by_moodboard_policy ON public.moodboard_nodes;
CREATE POLICY moodboard_nodes_delete_by_moodboard_policy ON public.moodboard_nodes
FOR DELETE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  OR moodboard_id IN (
    SELECT m.id FROM public.moodboards m
    WHERE public.can_access_moodboard(m)
  )
);

-- Drop the old policies (they will be replaced by the new ones above)
DROP POLICY IF EXISTS moodboard_nodes_select_policy ON public.moodboard_nodes;
DROP POLICY IF EXISTS moodboard_nodes_insert_policy ON public.moodboard_nodes;
DROP POLICY IF EXISTS moodboard_nodes_update_policy ON public.moodboard_nodes;
DROP POLICY IF EXISTS moodboard_nodes_delete_policy ON public.moodboard_nodes;

-- Step 4: Update moodboard_edges to use moodboard_id
ALTER TABLE public.moodboard_edges
  ADD COLUMN IF NOT EXISTS moodboard_id UUID REFERENCES public.moodboards(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_moodboard_edges_moodboard_id ON public.moodboard_edges(moodboard_id);

-- Migrate edges to use moodboard_id
UPDATE public.moodboard_edges e
SET moodboard_id = (
  SELECT moodboard_id FROM public.ideas i WHERE i.id = e.idea_id
)
WHERE e.moodboard_id IS NULL AND e.idea_id IS NOT NULL;

-- Step 5: Update moodboard_shares to use moodboard_id
ALTER TABLE public.moodboard_shares
  ADD COLUMN IF NOT EXISTS moodboard_id UUID REFERENCES public.moodboards(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_moodboard_shares_moodboard_id ON public.moodboard_shares(moodboard_id);

-- Migrate shares to use moodboard_id
UPDATE public.moodboard_shares s
SET moodboard_id = (
  SELECT moodboard_id FROM public.ideas i WHERE i.id = s.idea_id
)
WHERE s.moodboard_id IS NULL AND s.idea_id IS NOT NULL;
