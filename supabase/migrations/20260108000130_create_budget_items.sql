-- Feature: 006-brainstorming-moodboard
-- Migration: Create budget_items table

CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  option_id UUID REFERENCES idea_options(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  actual_cost DECIMAL(10, 2),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  contact_id UUID,  -- FK will be added in contacts migration
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('need', 'want', 'nice_to_have')),
  is_shared BOOLEAN DEFAULT FALSE,
  notes TEXT,
  linked_node_id UUID REFERENCES moodboard_nodes(id) ON DELETE SET NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT chk_budget_item_context CHECK (
    (idea_id IS NOT NULL AND project_id IS NULL) OR
    (idea_id IS NULL AND project_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budget_items_idea_id ON budget_items(idea_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_option_id ON budget_items(option_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_project_id ON budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_contact_id ON budget_items(contact_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_linked_node_id ON budget_items(linked_node_id);

-- Enable RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS budget_items_select_policy ON budget_items;
CREATE POLICY budget_items_select_policy ON budget_items
FOR SELECT USING (
  (idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())))
  OR
  (project_id IN (SELECT id FROM projects WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())))
);

DROP POLICY IF EXISTS budget_items_insert_policy ON budget_items;
CREATE POLICY budget_items_insert_policy ON budget_items
FOR INSERT WITH CHECK (
  (idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())))
  OR
  (project_id IN (SELECT id FROM projects WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())))
);

DROP POLICY IF EXISTS budget_items_update_policy ON budget_items;
CREATE POLICY budget_items_update_policy ON budget_items
FOR UPDATE USING (
  (idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())))
  OR
  (project_id IN (SELECT id FROM projects WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())))
);

DROP POLICY IF EXISTS budget_items_delete_policy ON budget_items;
CREATE POLICY budget_items_delete_policy ON budget_items
FOR DELETE USING (
  (idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())))
  OR
  (project_id IN (SELECT id FROM projects WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())))
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_budget_items_updated_at ON budget_items;
CREATE TRIGGER update_budget_items_updated_at
BEFORE UPDATE ON budget_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sync budget item with canvas node
CREATE OR REPLACE FUNCTION sync_budget_item_to_canvas()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.linked_node_id IS NOT NULL THEN
    UPDATE moodboard_nodes
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{budget_item_id}',
      to_jsonb(NEW.id::text)
    ),
    updated_at = NOW()
    WHERE id = NEW.linked_node_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_budget_item_after_insert ON budget_items;
CREATE TRIGGER sync_budget_item_after_insert
AFTER INSERT ON budget_items
FOR EACH ROW EXECUTE FUNCTION sync_budget_item_to_canvas();

DROP TRIGGER IF EXISTS sync_budget_item_after_update ON budget_items;
CREATE TRIGGER sync_budget_item_after_update
AFTER UPDATE ON budget_items
FOR EACH ROW EXECUTE FUNCTION sync_budget_item_to_canvas();