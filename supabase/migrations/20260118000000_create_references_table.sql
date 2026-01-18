-- Feature: 006-brainstorming-moodboard
-- Migration: Create dedicated references tables and link to moodboard nodes

-- Create references table
CREATE TABLE IF NOT EXISTS public.references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  node_type VARCHAR(50) NOT NULL CHECK (node_type IN (
    'social_media', 'image', 'link', 'note', 'swatch', 'budget_item', 'contact', 'sketch', 'pile'
  )),
  content_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  short_comment TEXT,
  long_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_references_team_id ON public.references(team_id);
CREATE INDEX IF NOT EXISTS idx_references_node_type ON public.references(node_type);
CREATE INDEX IF NOT EXISTS idx_references_tags ON public.references USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_references_metadata ON public.references USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_references_content_url ON public.references(content_url);

ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS references_select_policy ON public.references;
CREATE POLICY references_select_policy ON public.references
FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS references_insert_policy ON public.references;
CREATE POLICY references_insert_policy ON public.references
FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS references_update_policy ON public.references;
CREATE POLICY references_update_policy ON public.references
FOR UPDATE USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS references_delete_policy ON public.references;
CREATE POLICY references_delete_policy ON public.references
FOR DELETE USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP TRIGGER IF EXISTS update_references_updated_at ON public.references;
CREATE TRIGGER update_references_updated_at
BEFORE UPDATE ON public.references
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create reference links table (attach references to ideas/projects)
CREATE TABLE IF NOT EXISTS public.reference_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id UUID NOT NULL REFERENCES public.references(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reference_links_target_required CHECK (
    idea_id IS NOT NULL OR project_id IS NOT NULL
  ),
  CONSTRAINT reference_links_unique UNIQUE (reference_id, idea_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_reference_links_reference_id ON public.reference_links(reference_id);
CREATE INDEX IF NOT EXISTS idx_reference_links_idea_id ON public.reference_links(idea_id);
CREATE INDEX IF NOT EXISTS idx_reference_links_project_id ON public.reference_links(project_id);

ALTER TABLE public.reference_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reference_links_select_policy ON public.reference_links;
CREATE POLICY reference_links_select_policy ON public.reference_links
FOR SELECT USING (
  reference_id IN (
    SELECT id FROM public.references
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  OR idea_id IN (
    SELECT id FROM public.ideas
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  OR project_id IN (
    SELECT id FROM public.projects
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS reference_links_insert_policy ON public.reference_links;
CREATE POLICY reference_links_insert_policy ON public.reference_links
FOR INSERT WITH CHECK (
  reference_id IN (
    SELECT id FROM public.references
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  OR idea_id IN (
    SELECT id FROM public.ideas
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  OR project_id IN (
    SELECT id FROM public.projects
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS reference_links_update_policy ON public.reference_links;
CREATE POLICY reference_links_update_policy ON public.reference_links
FOR UPDATE USING (
  reference_id IN (
    SELECT id FROM public.references
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  OR idea_id IN (
    SELECT id FROM public.ideas
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  OR project_id IN (
    SELECT id FROM public.projects
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS reference_links_delete_policy ON public.reference_links;
CREATE POLICY reference_links_delete_policy ON public.reference_links
FOR DELETE USING (
  reference_id IN (
    SELECT id FROM public.references
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  OR idea_id IN (
    SELECT id FROM public.ideas
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
  OR project_id IN (
    SELECT id FROM public.projects
    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);

DROP TRIGGER IF EXISTS update_reference_links_updated_at ON public.reference_links;
CREATE TRIGGER update_reference_links_updated_at
BEFORE UPDATE ON public.reference_links
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add reference_id column to moodboard_nodes
ALTER TABLE public.moodboard_nodes
  ADD COLUMN IF NOT EXISTS reference_id UUID REFERENCES public.references(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_reference_id ON public.moodboard_nodes(reference_id);

-- Backfill references for existing moodboard nodes (1:1 mapping by node id)
INSERT INTO public.references (
  id,
  team_id,
  node_type,
  content_url,
  thumbnail_url,
  metadata,
  tags,
  short_comment,
  long_note,
  created_at,
  updated_at
)
SELECT
  nodes.id,
  ideas.team_id,
  nodes.node_type,
  nodes.content_url,
  nodes.thumbnail_url,
  nodes.metadata,
  nodes.tags,
  nodes.short_comment,
  nodes.long_note,
  nodes.created_at,
  nodes.updated_at
FROM public.moodboard_nodes nodes
JOIN public.ideas ideas ON ideas.id = nodes.idea_id
WHERE nodes.reference_id IS NULL
ON CONFLICT (id) DO NOTHING;

UPDATE public.moodboard_nodes
SET reference_id = id
WHERE reference_id IS NULL;

-- Backfill reference links for ideas
INSERT INTO public.reference_links (
  reference_id,
  idea_id,
  created_at,
  updated_at
)
SELECT
  nodes.reference_id,
  nodes.idea_id,
  nodes.created_at,
  nodes.updated_at
FROM public.moodboard_nodes nodes
WHERE nodes.reference_id IS NOT NULL
ON CONFLICT (reference_id, idea_id, project_id) DO NOTHING;
