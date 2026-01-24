# T-015: Container Card Types & Drag-and-Drop Implementation

## Status: Partially Complete

### ✅ Completed Components

#### 1. Utility Functions (`src/lib/utils/moodboard/dragDrop.ts`)
- `canDropIntoContainer()` - Validates drop targets
- `encodeDragData()` / `decodeDragData()` - Serialization helpers
- Prevents dropping containers into themselves or nesting containers

#### 2. ContainerDropZone Component (`src/lib/components/moodboard/ContainerDropZone.svelte`)
- Drop zone that appears at top of canvas when dragging
- Visual feedback (highlights on drag over)
- Allows moving nodes back to parent level

#### 3. NodeCard Drag-and-Drop Support (`src/lib/components/moodboard/NodeCard.svelte`)
- Added `onMoveToContainer` prop
- Implemented drag handlers:
  - `handleDragStart()` - Sets drag data with node info
  - `handleDragOver()` - Highlights containers when dragged over
  - `handleDragLeave()` - Removes highlighting
  - `handleDrop()` - Processes the drop into container
- Gallery cards now have `draggable={true}` attribute
- Visual feedback: containers show blue border/ring when drag target
- State: `isDragOver` tracks hover state

#### 4. Moodboard Page Handlers (`src/routes/(auth)/moodboard/[id]/+page.svelte`)
- `handleMoveToContainer(nodeId, containerId)` - Moves node into container
- `handleMoveToParent(nodeId)` - Moves node to parent level
- Both handlers update database and reload moodboard

### 🔧 Remaining Implementation Steps

#### Step 1: Wire Up Gallery View Handler
**File:** `src/routes/(auth)/moodboard/[id]/+page.svelte` (line ~443)

**Current:**
```svelte
<NodeCard
    {node}
    variant="gallery"
    onDrillIn={drillInto}
    onEdit={openEditModal}
    onDelete={openDeleteConfirm}
/>
```

**Change to:**
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

#### Step 2: Add ContainerDropZone to Canvas View (Optional but Recommended)
**File:** `src/routes/(auth)/moodboard/[id]/+page.svelte` (line ~391)

**Add above the canvas:**
```svelte
{#if viewMode === "canvas"}
    <div class="h-full bg-gray-50 dark:bg-gray-900 relative">
        <ContainerDropZone 
            visible={parentId !== null}
            isDragging={isDragging}
            onDrop={() => handleMoveToParent(draggedNodeId)}
        />
        <MoodboardCanvas
            {nodes}
            onSelect={handleSelectNode}
            onEdit={openEditModal}
            onDelete={openDeleteConfirm}
            onDuplicate={handleDuplicateNode}
        />
    </div>
{:else if viewMode === "gallery"}
```

**Add state variables (after line ~56):**
```svelte
let isDragging = $state(false);
let draggedNodeId = $state<string | null>(null);
```

**Import ContainerDropZone (add to imports at top):**
```svelte
import ContainerDropZone from "$lib/components/moodboard/ContainerDropZone.svelte";
```

#### Step 3: Enhance Gallery View with Drop Zone (Optional)
Add a drop zone banner at the top of the gallery view when dragging within a container.

### 🎨 Container-Specific Enhancements (Future)

The NodeCard component already displays emoji icons for different container types via `getNodeEmoji()`:
- 👤 Character
- 🎭 Option/Variant  
- 🔧 Prop
- 📁 Group/Stack
- 📋 Moodboard Link

**Future enhancements:**
- Show child count on containers
- Display budget subtotal for containers
- Preview thumbnails of children
- Add "Open" indicator overlay on hover

### 🧪 Testing Checklist

- [ ] Can drag a reference card onto a character container
- [ ] Container highlights with blue border when dragging over it
- [ ] Dropped card moves into the container
- [ ] Can drill into container to see the moved card
- [ ] Cannot drag a container onto another container
- [ ] Drop zone appears when inside a container (not at root)
- [ ] Dropping on the drop zone moves card to parent level
- [ ] Changes persist after page reload

### 📝 Verification Commands

```bash
# Check for any TypeScript errors
npm run check

# Run the dev server and test manually
npm run dev
```

### 🐛 Known Issues to Address

1. **Dropdown binding error** in NodeCard.svelte (line 273)
   - Flowbite Svelte's Dropdown component may need different binding approach
   - Consider using `open={dropdownOpen}` and manual toggle instead of `bind:open`

2. **TypeScript errors** in NodeCard.svelte:
   - Line 218: `e.currentTarget.style` type issue (can be fixed with type assertion)
   - Line 266: Parameter 'e' needs type annotation

### 🎯 Next Tasks (T-016 onwards)

After completing T-015:
- **T-016**: Implement reference card types (Image, Social Media, Link, Note)
- **T-017**: Implement design card types (Color Palette, Measurements)
- **T-018**: Implement budget and contact card types
- **T-019**: Implement Fabric card type
- **T-020**: Create Add Card menu to organize all types

---

**Implementation Date:** 2026-01-22  
**Author:** Implementation following FEAT-006 spec v3.0
