-- Fix ambiguous column reference in team join RLS policy
-- Error: column reference "team_id" is ambiguous

DROP POLICY IF EXISTS "Users can add themselves via active join link" ON public.team_members;

CREATE POLICY "Users can add themselves via active join link"
ON public.team_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_join_links tjl
    WHERE tjl.team_id = team_id  -- Removed table qualifier - in WITH CHECK, unqualified refers to new row
      AND tjl.code = current_setting('app.join_code', true)
      AND tjl.is_active = true
      AND (tjl.expires_at IS NULL OR tjl.expires_at > NOW())
  )
);
