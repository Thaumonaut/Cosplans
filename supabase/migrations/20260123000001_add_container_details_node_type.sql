-- Add container_details to allowed node_type values
-- This fixes the constraint violation when creating detail nodes for containers

ALTER TABLE public.moodboard_nodes DROP CONSTRAINT IF EXISTS moodboard_nodes_node_type_check;
ALTER TABLE public.moodboard_nodes ADD CONSTRAINT moodboard_nodes_node_type_check
  CHECK (node_type IN (
    -- Containers
    'container',
    'moodboard_link',
    'container_details',  -- NEW: For storing container metadata and custom fields
    -- References (existing + new)
    'social_media',
    'image',
    'link',
    'note',
    -- Design
    'color_palette',
    'measurements',
    -- Materials
    'fabric',
    -- People & Money
    'budget_item',
    'contact',
    -- Legacy (keep for backwards compatibility)
    'swatch',
    'sketch',
    'pile'
  ));
