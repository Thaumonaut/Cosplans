# CAP-006: Pile-to-Container Conversion

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-001 (Foundation & Core Nodes)

## Intent

Allow users to promote a pile into a full container when organization needs grow beyond single-layer grouping, mimicking real-world workflow of converting a loose stack into a dedicated folder/box.

## Functional Requirements

1. **Conversion Trigger**
   - Right-click pile → "Convert to Container"
   - Inspector panel: "Convert to Container" button (when pile selected)
   - Keyboard: Select pile, press `Ctrl+Shift+C`

2. **Conversion Dialog**
   - Modal asks: "Convert this pile to a container?"
   - Select container type: Character, Prop, or Group (default: Group)
   - Option: "Keep items at root level" vs "Move items inside container" (default: move)
   - Preview shows before/after state
   - Confirm/Cancel buttons

3. **Conversion Process**
   - Create new container node at pile's position
   - Copy pile metadata (name, description, color)
   - If "Move items inside":
     - Update all pile items' parent_id to new container
     - Edges remain connected (no orphaned edges)
   - If "Keep at root":
     - Items remain at root, edges to container created
   - Delete original pile node
   - Transaction: All-or-nothing (rollback on error)

4. **Post-Conversion**
   - Select new container (show in inspector)
   - Toast notification: "Pile converted to [type] container"
   - Undo available for 30 seconds (soft delete pile, restore on undo)

5. **Validation**
   - Minimum 1 item in pile (cannot convert empty pile)
   - Maximum 200 items (warn if performance risk)
   - Check permissions (user can create containers)

## Data Model

### Database Transaction
```sql
BEGIN;

-- 1. Create container node
INSERT INTO moodboard_nodes (id, moodboard_id, node_type, parent_id, ...)
VALUES (uuid_generate_v4(), :moodboard_id, :container_type, :parent_id, ...);

-- 2. Update pile items (if "Move items inside")
UPDATE moodboard_nodes
SET parent_id = :new_container_id
WHERE id = ANY(:pile_item_ids);

-- 3. Create edges (if "Keep at root")
INSERT INTO moodboard_edges (source, target, ...)
SELECT :new_container_id, id, ...
FROM unnest(:pile_item_ids) AS id;

-- 4. Soft delete pile
UPDATE moodboard_nodes
SET deleted_at = NOW()
WHERE id = :pile_id;

COMMIT;
```

### Type Definitions
```typescript
interface ConversionOptions {
  containerType: 'character' | 'prop' | 'group';
  moveItemsInside: boolean;
}

interface ConversionResult {
  success: boolean;
  newContainerId: string;
  movedItemCount: number;
  error?: string;
}
```

## UI/UX Requirements

1. **Conversion Dialog Design**
   - Title: "Convert Pile to Container"
   - Subtitle: Shows pile name and item count
   - Radio buttons: Container type (icons + labels)
   - Checkbox: "Move items inside container" (default checked)
   - Preview section:
     - Before: Pile icon with stacked items
     - Arrow
     - After: Container icon with items inside/linked
   - Buttons: "Convert" (primary), "Cancel" (secondary)

2. **Preview Visualization**
   - Simple diagram showing node transformation
   - "Move inside": Items shown inside container boundary
   - "Keep at root": Items shown connected with edges

3. **Loading State**
   - Disable buttons during conversion
   - Spinner on "Convert" button
   - Progress for large piles (>50 items): "Converting... X/Y items"

4. **Success State**
   - Dialog closes automatically
   - Toast: "✓ Converted to [type] container"
   - Canvas updates immediately (optimistic)
   - Undo toast action available (30s)

5. **Error State**
   - Toast: "✗ Conversion failed: [reason]"
   - Dialog remains open, allow retry

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Conversion dialog
- `ui/button.svelte` - Action buttons
- `ui/radio-group.svelte` - Container type selector
- `ui/checkbox.svelte` - "Move items" option
- `base/ConfirmDialog.svelte` - Confirmation if large pile

### New Components Required
- `moodboard/ConversionDialog.svelte` - Main conversion dialog
- `moodboard/ConversionPreview.svelte` - Before/after visualization

## Edge Cases

1. **Empty Pile**: Disable conversion (show tooltip "Cannot convert empty pile")
2. **Large Pile (>200 items)**: Show warning "This may take a moment"
3. **Concurrent Edit**: If pile modified during conversion, abort and show error
4. **Network Error**: Rollback transaction, show retry option
5. **Undo After Edit**: If container edited after conversion, undo only restores pile structure (warn user)
6. **Nested in Container**: Conversion works same way (new container remains at same depth)
7. **Edges to Pile**: Edges re-target to new container node

## Performance Considerations

- Transaction timeout: 10s (abort if conversion takes longer)
- Batch update pile items (single SQL query, not loop)
- Optimistic UI: Update canvas immediately, rollback on error
- Undo window: 30s (cleanup soft-deleted pile after)
- Large pile warning threshold: 200 items

## Testing Strategy

**Unit Tests:**
- Conversion transaction logic (all-or-nothing)
- Item parent_id updates for "move inside"
- Edge creation for "keep at root"
- Validation rules (min 1 item, max 200)

**Integration Tests:**
- Convert pile (5 items) to group container → items moved inside
- Convert pile (10 items) to character, keep at root → edges created
- Undo conversion within 30s → pile restored
- Concurrent edit during conversion → abort with error

**E2E Tests:**
- User right-clicks pile, selects "Convert to Container"
- User chooses "Character", checks "Move items inside", clicks Convert
- Canvas updates, items now inside container
- User drills into container → sees all items
- User clicks undo → pile restored

## Success Metrics

- Conversion completes in < 1s for piles up to 50 items
- Conversion completes in < 3s for piles up to 200 items
- Transaction success rate > 99%
- Undo rate < 10% (indicates users satisfied with conversion)

## Dependencies

- **Requires:** CAP-001 (Pile Nodes), CAP-002 (Container Nodes)
- **Required By:** None (optional workflow)
- **Related:** CAP-013 (Batch operations may enable bulk conversions)

## Open Questions

None - design approved in Council Decision 3 (user said "yes to both" for conversion feature).

## References

- Council Decision 3: "i like the idea of pile to container conversion since its exactly how we would handle it in real life"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Pile interactions)
