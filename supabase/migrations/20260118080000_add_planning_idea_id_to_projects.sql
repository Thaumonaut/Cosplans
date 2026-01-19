-- Add planning_idea_id to projects for idea-to-project conversion

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS planning_idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_planning_idea_id
  ON public.projects(planning_idea_id);
