-- Feature: 006-brainstorming-moodboard
-- Bugfix: Allow moodboard nodes without an idea_id for non-idea moodboards

ALTER TABLE public.moodboard_nodes
  ALTER COLUMN idea_id DROP NOT NULL;
