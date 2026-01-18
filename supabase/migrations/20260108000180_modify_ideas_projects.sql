-- Feature: 006-brainstorming-moodboard
-- Migration: Modify ideas and projects tables

-- Add new columns to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS character_db_id TEXT;

-- Create indexes for ideas
CREATE INDEX IF NOT EXISTS idx_ideas_character_db_id ON ideas(character_db_id);

-- Add new columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_option_id UUID REFERENCES idea_options(id) ON DELETE SET NULL;

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_source_idea_id ON projects(source_idea_id);
CREATE INDEX IF NOT EXISTS idx_projects_source_option_id ON projects(source_option_id);