-- Feature: 006-brainstorming-moodboard
-- Migration: Create RPC functions for tree queries (CAP-02)
-- Task: T-003

-- Function to get the path from a node to the root (breadcrumb)
-- Returns nodes ordered from root to target node
CREATE OR REPLACE FUNCTION public.get_moodboard_node_path(p_node_id UUID)
RETURNS SETOF public.moodboard_nodes AS $$
DECLARE
  node_row public.moodboard_nodes;
  path_ids UUID[];
  current_id UUID;
BEGIN
  -- Build array of IDs from target to root
  current_id := p_node_id;
  WHILE current_id IS NOT NULL LOOP
    path_ids := array_append(path_ids, current_id);
    SELECT parent_id INTO current_id
    FROM public.moodboard_nodes
    WHERE id = current_id;
  END LOOP;

  -- Return nodes in reverse order (root first)
  FOR i IN REVERSE array_length(path_ids, 1)..1 LOOP
    SELECT * INTO node_row
    FROM public.moodboard_nodes
    WHERE id = path_ids[i];
    RETURN NEXT node_row;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get all descendants of a node
CREATE OR REPLACE FUNCTION public.get_moodboard_node_descendants(p_node_id UUID)
RETURNS SETOF public.moodboard_nodes AS $$
DECLARE
  node_row public.moodboard_nodes;
BEGIN
  FOR node_row IN
    WITH RECURSIVE descendants AS (
      SELECT mn.id, mn.created_at, 0 as depth
      FROM public.moodboard_nodes mn
      WHERE mn.parent_id = p_node_id

      UNION ALL

      SELECT n.id, n.created_at, d.depth + 1
      FROM public.moodboard_nodes n
      JOIN descendants d ON n.parent_id = d.id
      WHERE d.depth < 20
    )
    SELECT mn.*
    FROM descendants d
    JOIN public.moodboard_nodes mn ON mn.id = d.id
    ORDER BY d.depth, d.created_at
  LOOP
    RETURN NEXT node_row;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get child count for multiple nodes at once
CREATE OR REPLACE FUNCTION public.get_moodboard_child_counts(p_node_ids UUID[])
RETURNS TABLE(node_id UUID, child_count BIGINT) AS $$
  SELECT parent_id as node_id, COUNT(*) as child_count
  FROM public.moodboard_nodes
  WHERE parent_id = ANY(p_node_ids)
  GROUP BY parent_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to get budget subtotals for container nodes
CREATE OR REPLACE FUNCTION public.get_container_budget_subtotals(p_node_ids UUID[])
RETURNS TABLE(node_id UUID, subtotal NUMERIC) AS $$
  WITH RECURSIVE descendants AS (
    SELECT id, parent_id, node_type, metadata
    FROM public.moodboard_nodes
    WHERE parent_id = ANY(p_node_ids)

    UNION ALL

    SELECT n.id, n.parent_id, n.node_type, n.metadata
    FROM public.moodboard_nodes n
    JOIN descendants d ON n.parent_id = d.id
  ),
  budget_items AS (
    SELECT
      unnest(p_node_ids) as container_id,
      d.id,
      d.metadata
    FROM descendants d
    WHERE d.node_type = 'budget_item'
  )
  SELECT
    container_id as node_id,
    COALESCE(SUM((metadata->>'estimated_cost')::NUMERIC), 0) as subtotal
  FROM budget_items
  GROUP BY container_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_moodboard_node_path(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_moodboard_node_descendants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_moodboard_child_counts(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_container_budget_subtotals(UUID[]) TO authenticated;
