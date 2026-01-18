-- Migration: Add soft delete tracking and dependency count to tasks
-- Feature: 004-bugfix-testing
-- Date: 2026-01-03

-- Add new columns to tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS dependency_count INTEGER DEFAULT 0;

-- Create index for filtering non-deleted tasks (partial index for performance)
CREATE INDEX IF NOT EXISTS idx_tasks_not_deleted 
  ON tasks(team_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Create function to update dependency count
CREATE OR REPLACE FUNCTION update_task_dependency_count()
RETURNS TRIGGER AS $$
DECLARE
  v_resource_count INTEGER := 0;
  v_subtask_count INTEGER := 0;
BEGIN
  -- Count subtasks if table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subtasks') THEN
    EXECUTE format('SELECT COUNT(*) FROM subtasks WHERE task_id = $1')
    INTO v_subtask_count
    USING COALESCE(NEW.task_id, OLD.task_id);
  END IF;
  
  -- Count resources only if task_resources table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_resources') THEN
    EXECUTE format('SELECT COUNT(*) FROM task_resources WHERE task_id = $1')
    INTO v_resource_count
    USING COALESCE(NEW.task_id, OLD.task_id);
  END IF;
  
  -- Update dependency count for the affected task
  UPDATE tasks
  SET dependency_count = v_subtask_count + v_resource_count
  WHERE id = COALESCE(NEW.task_id, OLD.task_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update dependency count (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subtasks') THEN
    DROP TRIGGER IF EXISTS task_dependency_count_trigger ON subtasks;
    CREATE TRIGGER task_dependency_count_trigger
      AFTER INSERT OR UPDATE OR DELETE ON subtasks
      FOR EACH ROW EXECUTE FUNCTION update_task_dependency_count();
  END IF;
END $$;

-- Note: task_resources table trigger will be added if table exists
-- Check if task_resources table exists before creating trigger
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_resources') THEN
    DROP TRIGGER IF EXISTS task_resource_count_trigger ON task_resources;
    CREATE TRIGGER task_resource_count_trigger
      AFTER INSERT OR UPDATE OR DELETE ON task_resources
      FOR EACH ROW EXECUTE FUNCTION update_task_dependency_count();
  END IF;
END $$;

-- Backfill dependency counts for existing tasks
DO $$
DECLARE
  v_task RECORD;
  v_subtask_count INTEGER := 0;
  v_resource_count INTEGER := 0;
BEGIN
  FOR v_task IN SELECT id FROM tasks WHERE dependency_count = 0 OR dependency_count IS NULL
  LOOP
    -- Count subtasks if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subtasks') THEN
      EXECUTE format('SELECT COUNT(*) FROM subtasks WHERE task_id = $1')
      INTO v_subtask_count
      USING v_task.id;
    END IF;
    
    -- Count resources only if task_resources table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_resources') THEN
      EXECUTE format('SELECT COUNT(*) FROM task_resources WHERE task_id = $1')
      INTO v_resource_count
      USING v_task.id;
    END IF;
    
    -- Update dependency count
    UPDATE tasks
    SET dependency_count = v_subtask_count + v_resource_count
    WHERE id = v_task.id;
  END LOOP;
END $$;



