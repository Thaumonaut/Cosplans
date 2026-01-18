-- Migration: Add soft delete RPC function
-- Feature: 004-bugfix-testing
-- Date: 2026-01-04

-- Create function to soft delete tasks (bypasses RLS for this specific operation)
CREATE OR REPLACE FUNCTION soft_delete_task(
  task_id UUID,
  user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Run with function creator's permissions
AS $$
BEGIN
  -- Verify user has permission (is member of task's team with owner/editor role)
  IF NOT EXISTS (
    SELECT 1
    FROM tasks t
    JOIN team_members tm ON t.team_id = tm.team_id
    WHERE t.id = task_id
      AND tm.user_id = user_id
      AND tm.role IN ('owner', 'editor')
      AND COALESCE(tm.status, 'active') = 'active'
  ) THEN
    RAISE EXCEPTION 'User does not have permission to delete this task';
  END IF;

  -- Perform soft delete
  UPDATE tasks
  SET
    deleted_at = NOW(),
    deleted_by = user_id
  WHERE id = task_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION soft_delete_task(UUID, UUID) TO authenticated;
