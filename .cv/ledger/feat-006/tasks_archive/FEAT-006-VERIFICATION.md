# FEAT-006 Functional Verification Checklist

**Purpose:** Verify what's actually working vs what just exists in code  
**Date:** 2026-01-24  
**How to use:** Open the app and test each item systematically

---

## How to Start Testing

1. **Open the app:** `npm run dev`
2. **Navigate to:** `/moodboard/[some-id]` (replace with actual moodboard ID)
3. **Check browser console** for any errors

---

## Checkpoint 1: Foundation (Database & Services)

### T-001 & T-002: Database Tables
**Test:** Check if moodboard page loads without database errors

- [x] Navigate to `/moodboard/[id]` - page loads?
- [x] Browser console - no database connection errors?
- [x] Check Network tab - API calls to moodboards endpoint succeed?

**Expected:** Page should load, even if empty

---

### T-003: MoodboardsService
**Test:** Check if service functions work

**Check in browser console:**
```javascript
// This should work if service is functional
// (Open dev tools, paste this)
```

- [ ] Can you see moodboard data loading?
- [ ] Do nodes appear (even if empty state)?

---

### T-004: Auto-create moodboards
**Test:** Create a new character/costume project

- [ ] Create new project/character
- [ ] Check if moodboard tab appears
- [ ] Does it auto-navigate to moodboard?

---

### T-005: Moodboard Routes
**Test:** Route accessibility

- [x] Can access `/moodboard/[id]` directly?
- [x] URL changes correctly when switching views/containers?
- [x] Back button works?

---

### T-006: Basic CRUD Operations
**Test:** Create, read, update, delete nodes

- [x] Click "Add Card" or "Add Node" button - does modal open?
- [x] Try to create a new node - does it appear?
- [x] Click on a node - can you edit it?
- [x] Delete a node - does it disappear?
- [x] Refresh page - do changes persist?

**If any fail, T-006 is not fully functional**

---

## Checkpoint 2: Canvas Editor

### T-007: Svelte Flow Integration
**Test:** Canvas interactions

- [x] Canvas view visible (switch to "Canvas" view)?
- [x] Can zoom in/out (mouse wheel or pinch)?
- [ ] Can pan canvas (drag background)? [can drag but only when right clicking, should be with left click]
- [x] Nodes render on canvas?

**Console check:** Look for Svelte Flow errors

---

### T-008: Base MoodboardNode Component
**Test:** Node rendering and interactions

- [x] Do nodes appear as cards on canvas?
- [x] Can you click/select a node?
- [x] Right-click - does context menu appear?
- [x] Can you drag nodes around on canvas?

---

### T-009: Drill-in Navigation
**Test:** Container navigation

**Prerequisites:** Create a container node first (Character, Group, etc.)

- [x] Container node has "Open" or drill-in affordance?
- [x] Click to drill into container?
- [x] View updates to show container's children?
- [x] Can you navigate back to parent?
- [x] Breadcrumb or "back" button visible?

**This is critical - if drill-in doesn't work, containers are non-functional**

---

### T-010: Position Persistence
**Test:** Node position saves

- [x] Drag a node to new position on canvas
- [x] Wait 2 seconds (for debounce)
- [x] Refresh page
- [x] Node appears at same position?

---

### T-011: ViewSwitcher
**Test:** View mode switching

- [x] View switcher visible (Canvas/Gallery/List buttons)?
- [x] Click "Gallery" - view changes to grid?
- [x] Click "List" - view changes to tree?
- [x] Click "Canvas" - back to canvas view?
- [x] View preference persists on refresh?

---

## Checkpoint 3: Gallery & List Views

### T-012: Gallery View
**Test:** Grid card layout

Switch to Gallery view:
- [x] Nodes appear as cards in grid?
- [x] Cards show thumbnails/icons?
- [x] Cards show title and metadata?
- [x] Can scroll through cards?
- [x] Responsive (resizes on window resize)?

---

### T-013: List View
**Test:** Tree structure

Switch to List view:
- [x] Nodes appear in hierarchical tree?
- [x] Can expand/collapse containers?
- [ ] Indentation shows hierarchy?
- [x] Icons indicate node types?

---

### T-014: View Integration
**Test:** Seamless view switching

- [x] Switch between views - data stays consistent?
- [x] Selection persists across view switches?
- [x] No flash/reload when switching views?

---

## Checkpoint 4: Card Types & Drag-and-Drop

### T-015: Container Drag-and-Drop
**Test:** Moving nodes into/out of containers

**Prerequisites:** Need at least one container and one regular node

#### Part 1: Drag into container (Gallery view)
- [x] Switch to Gallery view
- [x] Start dragging a regular node (image, note, etc.)
- [x] Hover over a container node
- [x] Container shows visual feedback (blue ring/highlight)?
- [x] Drop node onto container
- [x] Node disappears from current view?

#### Part 2: Verify node moved
- [x] Click/open the container node
- [x] Drilled into container view?
- [x] Dropped node appears inside?

#### Part 3: Drag out of container
- [ ] While inside container, drag a node
- [ ] **ContainerDropZone** appears at top?
- [ ] Drop node on the drop zone
- [ ] Navigate back to parent
- [ ] Node appears at parent level?

**Critical test - if this fails, T-015 is not complete**

---

### T-016: Platform Badges
**Test:** Social media detection

**Prerequisites:** Create social media nodes with Instagram/TikTok URLs

- [x] Create node with Instagram URL
- [x] Card shows Instagram badge (📷 pink)?
- [x] Create node with TikTok URL  
- [x] Card shows TikTok badge (🎵 black)?
- [x] Badges show in gallery view?

---

### T-017: Design Cards
**Test:** Color palettes and measurements

#### Color Palette
**Prerequisites:** Create color_palette node (if possible via AddCardMenu)

- [ ] Color palette card shows swatches?
- [ ] Click color swatch
- [ ] Hex code copied to clipboard?
- [ ] Paste somewhere - correct hex code?

#### Measurements
**Prerequisites:** Create measurements node

- [ ] Measurements card shows values with units?
- [ ] Shows measurement type (Body/Garment/Prop)?
- [ ] Shows all measurement entries?

---

### T-018: Budget & Contact Cards
**Test:** Basic placeholder displays

- [ ] Budget item node shows 💰 emoji?
- [ ] Contact node shows 👤 emoji?
- [ ] Both show titles if present?

---

### T-019: Fabric Cards
**Test:** Fabric swatch display

**Prerequisites:** Create fabric node with metadata

- [ ] Fabric card shows 🧵 emoji?
- [ ] Shows material type?
- [ ] Shows color if set?
- [ ] Shows stretch indicator (↔️) if applicable?
- [ ] Shows price per yard if set?

---

### T-020: Add Card Menu
**Test:** Card creation menu

- [x] "Add Card" button exists?
- [x] Click button - modal opens?
- [x] Modal shows categories (Quick Add, Containers, etc.)?
- [ ] Search box works to filter types?
- [ ] Click card type - modal closes and creates node?

**Alternative:** May be "Add Node" button instead

---

## Inspector Panel & UI Components

### InspectorPanel (T-038 in tasks-v2)
**Test:** Node details panel

- [x] Select/click a node
- [x] Inspector panel appears (right side on desktop)?
- [x] Shows node type badge?
- [ ] Shows editable fields (title, tags, etc.)?
- [ ] Can edit inline?
- [ ] Changes save?
- [ ] Pin button works (keeps panel open)?
- [ ] Close button works?

**Mobile:**
- [ ] Resize to mobile width
- [ ] Panel becomes bottom sheet?
- [ ] Slides up from bottom?

---

## Critical Integration Points

### Data Persistence Flow
**Test end-to-end:**

1. [x] Create node → Appears immediately
2. [x] Edit node → Changes visible
3. [x] Refresh page → Node still there with edits
4. [x] Delete node → Disappears
5. [x] Refresh → Node stays deleted

**If this flows works, database integration is functional**

---

### Drag-and-Drop Full Flow
**Test complete scenario:**

1. [x] Create container (Character)
2. [x] Create image node
3. [x] Drag image onto character
4. [x] Open character container
5. [x] Image appears inside
6. [ ] Drag image to drop zone
7. [ ] Navigate back
8. [ ] Image back at parent level
9. [ ] Refresh page
10. [ ] Hierarchy preserved

**This is the most critical test - it validates T-015, T-009, T-006, and database persistence**

---

## What Likely DOESN'T Work

Based on code review, these are probably not functional yet:

### ❌ Ghost Nodes
- Cross-container visibility
- Not implemented (v1.1 feature)

### ❌ Calendar/Event Nodes
- Calendar sync
- Not implemented (v1.2 feature)

### ❌ ContextBar
- Breadcrumb with parent context
- Component doesn't exist

### ❌ URL State for Containers
- `?container=X` in URL
- Not verified in code

### ❌ Grid Snapping
- 20px snap on canvas
- Not verified

### ❌ Keyboard Shortcuts
- Not implemented (CP-07)

### ❌ Undo/Redo
- Not implemented (CP-07)

---

## Testing Checklist Summary

**Run through in order:**

1. ✅ Database & routes - Page loads?
2. ✅ CRUD operations - Can create/edit/delete?
3. ✅ Canvas - Renders and interactive?
4. ✅ Views - Can switch between Canvas/Gallery/List?
5. ✅ Drill-in - Can navigate into containers?
6. ✅ Drag-and-drop - Can move nodes into/out of containers?
7. ✅ Card types - All display correctly?
8. ✅ Inspector - Can view/edit node details?

**Report back what fails so we can update status accurately!**

---

## How to Report Issues

For each failed test, note:
- Which checklist item failed
- What you expected to happen
- What actually happened
- Any console errors
- Screenshots if helpful

This will help us determine what's truly complete vs what needs work.
