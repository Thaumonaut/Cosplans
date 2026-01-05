-- Migration: Fix ambiguous column reference in soft_delete_task
-- Feature: 004-bugfix-testing
-- Date: 2026-01-04

-- Drop and recreate function with qualified column names
DROP FUNCTION IF EXISTS soft_delete_task(UUID, UUID);

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
      AND tm.user_id = soft_delete_task.user_id  -- Qualify with function name
      AND tm.role IN ('owner', 'editor')
      AND COALESCE(tm.status, 'active') = 'active'
  ) THEN
    RAISE EXCEPTION 'User does not have permission to delete this task';
  END IF;

  -- Perform soft delete
  UPDATE tasks
  SET
    deleted_at = NOW(),
    deleted_by = soft_delete_task.user_id  -- Qualify with function name
  WHERE id = task_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION soft_delete_task(UUID, UUID) TO authenticated;
