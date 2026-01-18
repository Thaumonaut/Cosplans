-- Migration: Create characters table for multi-API aggregation
-- Feature: 004-bugfix-testing
-- Date: 2026-01-03

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For fuzzy text search

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  series TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  source_apis TEXT[] NOT NULL DEFAULT '{}',
  external_ids JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_characters_series ON characters(series);
CREATE INDEX IF NOT EXISTS idx_characters_source_apis ON characters USING gin(source_apis);
CREATE INDEX IF NOT EXISTS idx_characters_external_ids ON characters USING gin(external_ids);

-- Enable RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- All authenticated users can read characters (shared resource)
CREATE POLICY characters_select ON characters
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only system/service can create characters (via service layer)
-- For now, allow authenticated users to create (can be restricted later)
CREATE POLICY characters_insert ON characters
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only system/service can update characters
CREATE POLICY characters_update ON characters
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS characters_updated_at_trigger ON characters;
CREATE TRIGGER characters_updated_at_trigger
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



