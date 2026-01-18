-- Add title field to ideas table
-- Title is REQUIRED and can be custom or auto-generated from character + series
-- Format: "{character} from {series} cosplay" or "{character} cosplay" or "{series} cosplay"

-- Add title column (will be made NOT NULL after migration)
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS title TEXT;

-- Generate titles for existing ideas that don't have one
UPDATE ideas
SET title = CASE
  WHEN character IS NOT NULL AND character != '' AND series IS NOT NULL AND series != '' THEN
    character || ' from ' || series || ' cosplay'
  WHEN character IS NOT NULL AND character != '' THEN
    character || ' cosplay'
  WHEN series IS NOT NULL AND series != '' THEN
    series || ' cosplay'
  ELSE
    'Untitled Idea'
END
WHERE title IS NULL OR title = '';

-- Now make title required
ALTER TABLE ideas
ALTER COLUMN title SET NOT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN ideas.title IS 'Required title for the idea. Can be custom or auto-generated from character + series in format "{character} from {series} cosplay".';

-- Make character field nullable (was required before)
-- Now that title is required, character and series can both be optional
ALTER TABLE ideas
ALTER COLUMN character DROP NOT NULL;

-- Make series field nullable too (if it wasn't already)
ALTER TABLE ideas
ALTER COLUMN series DROP NOT NULL;

-- Add index for title searches
CREATE INDEX IF NOT EXISTS idx_ideas_title ON ideas(title) WHERE title IS NOT NULL;

-- Title generation for existing ideas is handled above before making it NOT NULL

-- Title is now required (NOT NULL), so no need for check constraint
-- Title will always be present (either custom or auto-generated)
