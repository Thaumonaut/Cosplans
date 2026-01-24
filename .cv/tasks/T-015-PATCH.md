# Quick Patch: Final Wiring for Drag-and-Drop

## File: src/routes/(auth)/moodboard/[id]/+page.svelte

### Change 1: Add import at top (around line 23)
**After the existing imports, add:**
```svelte
import ContainerDropZone from "$lib/components/moodboard/ContainerDropZone.svelte";
```

### Change 2: Add onMoveToContainer to gallery NodeCards (around line 443)
**Find:**
```svelte
<NodeCard
    {node}
    variant="gallery"
    onDrillIn={drillInto}
    onEdit={openEditModal}
    onDelete={openDeleteConfirm}
/>
```

**Replace with:**
```svelte
<NodeCard
    {node}
    variant="gallery"
    onDrillIn={drillInto}
    onEdit={openEditModal}
    onDelete={openDeleteConfirm}
    onMoveToContainer={handleMoveToContainer}
/>
```

### Change 3 (Optional): Add ContainerDropZone to canvas view (around line 420)
**Find:**
```svelte
{#if viewMode === "canvas"}
    <div class="h-full bg-gray-50 dark:bg-gray-900">
        <MoodboardCanvas
```

**Replace with:**
```svelte
{#if viewMode === "canvas"}
    <div class="h-full bg-gray-50 dark:bg-gray-900 relative">
        {#if parentId}
            <ContainerDropZone 
                visible={true}
                isDragging={false}
                onDrop={() => {
                    // TODO: Track dragged node and call handleMoveToParent
                }}
            />
        {/if}
        <MoodboardCanvas
```

---

## Testing the Feature

After applying these patches:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to a moodboard:**
   - Go to `/moodboard` 
   - Switch to Gallery view
   - Create a container (via Add button, select "container" type)
   - Create some reference items (images, notes, etc.)

3. **Test drag-and-drop:**
   - Drag a reference card
   - Hover over a container → should highlight with blue border
   - Drop on container → card should move inside
   - Click container to drill in → should see the moved card
   - Try dragging the card back out (needs drop zone implementation)

4. **Verify:**
   - Changes persist after page reload
   - Cannot drag containers onto other containers
   - Visual feedback is clear and immediate

---

## Files Created/Modified

### New Files:
- ✅ `src/lib/utils/moodboard/dragDrop.ts` - Utility functions
- ✅ `src/lib/components/moodboard/ContainerDropZone.svelte` - Drop zone UI
- ✅ `.cv/tasks/T-015-container-dnd-implementation.md` - Implementation guide

### Modified Files:
- ✅ `src/lib/components/moodboard/NodeCard.svelte` - Added drag handlers
- ✅ `src/routes/(auth)/moodboard/[id]/+page.svelte` - Added move handlers
- ⚠️ `src/routes/(auth)/moodboard/[id]/+page.svelte` - Needs final wiring (see above)

---

**Next Steps:**
1. Apply the patches above
2. Test the feature
3. Move to T-016 (reference card types) or address any issues found
