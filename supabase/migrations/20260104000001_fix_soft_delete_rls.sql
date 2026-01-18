-- Migration: Fix RLS policy to allow soft delete
-- Feature: 004-bugfix-testing
-- Date: 2026-01-04

-- Update tasks UPDATE policy to allow soft delete
DROP POLICY IF EXISTS tasks_update ON public.tasks;

CREATE POLICY tasks_update ON public.tasks FOR UPDATE USING (
  -- User must be able to see the task (member of team)
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members
        WHERE user_id = (SELECT auth.uid())
        AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  (
    project_id IS NULL AND
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
) WITH CHECK (
  -- Allow soft delete (setting deleted_at) if user is owner/editor
  -- OR allow other updates if user is owner/editor
  (
    project_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE p.id = tasks.project_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'editor')
        AND COALESCE(tm.status, 'active') = 'active'
    )
  )
  OR
  (
    project_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = tasks.team_id
        AND user_id = (SELECT auth.uid())
        AND role IN ('owner', 'editor')
        AND COALESCE(status, 'active') = 'active'
    )
  )
);
