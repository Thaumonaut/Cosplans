-- Feature: 006-brainstorming-moodboard
-- Migration: Create contacts table

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'commissioner', 'supplier', 'venue', 'photographer', 'other'
  )),
  email TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_team_id ON contacts(team_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_is_favorite ON contacts(is_favorite);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS contacts_select_policy ON contacts;
CREATE POLICY contacts_select_policy ON contacts
FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS contacts_insert_policy ON contacts;
CREATE POLICY contacts_insert_policy ON contacts
FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS contacts_update_policy ON contacts;
CREATE POLICY contacts_update_policy ON contacts
FOR UPDATE USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS contacts_delete_policy ON contacts;
CREATE POLICY contacts_delete_policy ON contacts
FOR DELETE USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint to budget_items now that contacts table exists
ALTER TABLE budget_items DROP CONSTRAINT IF EXISTS fk_budget_items_contact;
ALTER TABLE budget_items
ADD CONSTRAINT fk_budget_items_contact
FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;