-- Add notes column to projects table to persist notes from idea phase
-- Feature: 004-bugfix-testing - User Story 4 (T038)
-- FR-018: System MUST persist idea phase notes when transitioning to planning phase

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for full-text search on notes (optional, for future optimization)
-- CREATE INDEX IF NOT EXISTS idx_projects_notes ON public.projects USING GIN(to_tsvector('english', notes));
