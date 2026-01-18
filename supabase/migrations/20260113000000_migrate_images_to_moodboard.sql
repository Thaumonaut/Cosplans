-- Feature: 006-brainstorming-moodboard
-- Migration: Convert idea.images[] to moodboard_nodes
-- Option B: Moodboard-Only Architecture

-- This migration converts all existing idea images to moodboard nodes
-- Keeps idea.images[] temporarily for safety (can be removed in future migration)

-- Function to migrate images for a single idea
CREATE OR REPLACE FUNCTION migrate_idea_images_to_nodes()
RETURNS TABLE (
  idea_id UUID,
  images_count INTEGER,
  nodes_created INTEGER,
  success BOOLEAN,
  error TEXT
) AS $$
DECLARE
  idea_record RECORD;
  image_url TEXT;
  image_index INTEGER;
  node_id UUID;
  grid_col INTEGER;
  grid_row INTEGER;
  pos_x FLOAT;
  pos_y FLOAT;
  nodes_count INTEGER;
BEGIN
  -- Iterate through all ideas that have images
  FOR idea_record IN
    SELECT id, images
    FROM ideas
    WHERE images IS NOT NULL
      AND array_length(images, 1) > 0
  LOOP
    nodes_count := 0;
    image_index := 0;

    -- Iterate through each image URL in the array
    FOREACH image_url IN ARRAY idea_record.images
    LOOP
      -- Calculate grid position (4 columns, 300px width, 400px height, 20px spacing)
      grid_col := image_index % 4;
      grid_row := image_index / 4;
      pos_x := 50 + (grid_col * 320); -- 300px width + 20px spacing
      pos_y := 50 + (grid_row * 420); -- 400px height + 20px spacing

      -- Check if node already exists for this image
      IF NOT EXISTS (
        SELECT 1 FROM moodboard_nodes
        WHERE idea_id = idea_record.id
          AND node_type = 'image'
          AND content_url = image_url
      ) THEN
        -- Create moodboard node
        INSERT INTO moodboard_nodes (
          idea_id,
          node_type,
          content_url,
          thumbnail_url,
          metadata,
          tags,
          position_x,
          position_y,
          width,
          height,
          z_index,
          is_expanded,
          created_at,
          updated_at
        ) VALUES (
          idea_record.id,
          'image',
          image_url,
          image_url, -- Use same URL as thumbnail
          jsonb_build_object(
            'migrated_from_idea_images', true,
            'original_index', image_index,
            'migration_date', NOW()
          ),
          ARRAY[]::TEXT[],
          pos_x,
          pos_y,
          300,
          NULL,
          0,
          true,
          NOW(),
          NOW()
        );

        nodes_count := nodes_count + 1;
      END IF;

      image_index := image_index + 1;
    END LOOP;

    -- Return result for this idea
    RETURN QUERY SELECT
      idea_record.id,
      array_length(idea_record.images, 1),
      nodes_count,
      true,
      NULL::TEXT;
  END LOOP;

  RETURN;

EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN QUERY SELECT
    idea_record.id,
    0,
    0,
    false,
    SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
-- Note: This is idempotent - running multiple times won't create duplicates
DO $$
DECLARE
  migration_results RECORD;
  total_ideas INTEGER := 0;
  total_images INTEGER := 0;
  total_nodes INTEGER := 0;
  failed_ideas INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting migration of idea.images to moodboard_nodes...';

  -- Run migration
  FOR migration_results IN
    SELECT * FROM migrate_idea_images_to_nodes()
  LOOP
    total_ideas := total_ideas + 1;
    total_images := total_images + migration_results.images_count;
    total_nodes := total_nodes + migration_results.nodes_created;

    IF NOT migration_results.success THEN
      failed_ideas := failed_ideas + 1;
      RAISE WARNING 'Failed to migrate idea %: %', migration_results.idea_id, migration_results.error;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE '  Ideas processed: %', total_ideas;
  RAISE NOTICE '  Total images: %', total_images;
  RAISE NOTICE '  Nodes created: %', total_nodes;
  RAISE NOTICE '  Failed ideas: %', failed_ideas;

  -- Update comment: Keep idea.images[] for now as backup
  -- Can remove in future migration after verifying everything works
  RAISE NOTICE 'Note: idea.images[] preserved as backup. Remove in future migration.';
END;
$$;

-- Drop the helper function (no longer needed)
DROP FUNCTION IF EXISTS migrate_idea_images_to_nodes();

-- Add comment to ideas table
COMMENT ON COLUMN ideas.images IS 'DEPRECATED: Images now stored in moodboard_nodes. Kept temporarily for rollback safety.';
