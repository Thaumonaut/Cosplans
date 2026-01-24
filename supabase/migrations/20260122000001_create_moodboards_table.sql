-- Feature: 006-brainstorming-moodboard
-- Migration: Create moodboards table as first-class entity (CAP-01)
-- Task: T-001

-- Create moodboards table
CREATE TABLE IF NOT EXISTS public.moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('user', 'team', 'idea', 'project')),
  owner_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for lookups
CREATE INDEX IF NOT EXISTS idx_moodboards_owner ON public.moodboards(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_moodboards_owner_id ON public.moodboards(owner_id);

-- Enable RLS
ALTER TABLE public.moodboards ENABLE ROW LEVEL SECURITY;

-- Helper function to check moodboard access
-- Returns true if user can access the moodboard based on owner type
CREATE OR REPLACE FUNCTION public.can_access_moodboard(moodboard_row public.moodboards)
RETURNS BOOLEAN AS $$
BEGIN
  CASE moodboard_row.owner_type
    -- Personal moodboards: only owner can access
    WHEN 'user' THEN
      RETURN moodboard_row.owner_id = auth.uid();

    -- Team moodboards: team members can access
    WHEN 'team' THEN
      RETURN EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_id = moodboard_row.owner_id
        AND user_id = auth.uid()
      );

    -- Idea moodboards: team members of the idea's team can access
    WHEN 'idea' THEN
      RETURN EXISTS (
        SELECT 1 FROM public.ideas i
        JOIN public.team_members tm ON tm.team_id = i.team_id
        WHERE i.id = moodboard_row.owner_id
        AND tm.user_id = auth.uid()
      );

    -- Project moodboards: team members of the project's team can access
    WHEN 'project' THEN
      RETURN EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.team_members tm ON tm.team_id = p.team_id
        WHERE p.id = moodboard_row.owner_id
        AND tm.user_id = auth.uid()
      );

    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies
DROP POLICY IF EXISTS moodboards_select_policy ON public.moodboards;
CREATE POLICY moodboards_select_policy ON public.moodboards
FOR SELECT USING (public.can_access_moodboard(moodboards));

DROP POLICY IF EXISTS moodboards_insert_policy ON public.moodboards;
CREATE POLICY moodboards_insert_policy ON public.moodboards
FOR INSERT WITH CHECK (public.can_access_moodboard(moodboards));

DROP POLICY IF EXISTS moodboards_update_policy ON public.moodboards;
CREATE POLICY moodboards_update_policy ON public.moodboards
FOR UPDATE USING (public.can_access_moodboard(moodboards));

DROP POLICY IF EXISTS moodboards_delete_policy ON public.moodboards;
CREATE POLICY moodboards_delete_policy ON public.moodboards
FOR DELETE USING (public.can_access_moodboard(moodboards));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_moodboards_updated_at ON public.moodboards;
CREATE TRIGGER update_moodboards_updated_at
BEFORE UPDATE ON public.moodboards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add moodboard_id to ideas table (ideas reference their moodboard)
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS moodboard_id UUID REFERENCES public.moodboards(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ideas_moodboard_id ON public.ideas(moodboard_id);

-- Add moodboard_id to projects table (projects can share or have own moodboard)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS moodboard_id UUID REFERENCES public.moodboards(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_moodboard_id ON public.projects(moodboard_id);
