# Moodboard Interaction Patterns Catalog

**Purpose**: Comprehensive list of all user interactions needed for moodboard functionality  
**Status**: Draft - Council Review Pending  
**Date**: 2026-01-23

---

## Canvas-Level Interactions

### Context Menu (Right-Click / Long-Press on Empty Canvas)
- **Trigger**: Right-click empty canvas (desktop) or long-press empty canvas (mobile)
- **Actions**:
  - Add Node → submenu:
    - Image (upload)
    - Social Media Link (paste URL)
    - Note (text)
    - Sketch (drawing canvas)
    - Budget Item
    - Contact/Supplier
    - Container (character/prop/group)
    - Color Swatch
  - Paste (if clipboard has content)
  - View Mode → submenu (Canvas/Gallery/Table/Timeline/List/Graph)
  - Canvas Settings → submenu:
    - Toggle Grid
    - Toggle Minimap
    - Background Color
    - Snap to Grid
  - Select All
  - Deselect All
  - Zoom → submenu:
    - Zoom In (Cmd/Ctrl + +)
    - Zoom Out (Cmd/Ctrl + -)
    - Fit to Screen (Cmd/Ctrl + 0)
    - Reset Zoom (100%)
  - Export → submenu:
    - Export as Image (PNG/JPG)
    - Export as PDF
    - Export Selection

### Canvas Pan/Zoom
- **Mouse**: 
  - Wheel scroll = zoom in/out
  - Middle mouse drag = pan
  - Space + drag = pan
  - Ctrl/Cmd + wheel = zoom
- **Trackpad**:
  - Pinch = zoom
  - Two-finger drag = pan
- **Touch**:
  - Pinch = zoom
  - Two-finger drag = pan
  - Single drag on empty space = pan

### Multi-Select
- **Desktop**:
  - Click + drag = selection box (lasso select multiple nodes)
  - Shift + click = add to selection
  - Ctrl/Cmd + click = toggle selection
  - Ctrl/Cmd + A = select all
- **Mobile**:
  - Long-press + drag = selection box
  - Tap checkbox on nodes to multi-select

### Bulk Actions (After Multi-Select)
- **Context menu on selection**:
  - Tag (add tags to all selected)
  - Delete (delete all selected)
  - Move to Container (move selection into container)
  - Create Container from Selection (wrap in new container)
  - Export Selection
  - Duplicate Selection
  - Align → submenu (Left/Right/Top/Bottom/Center)
  - Distribute → submenu (Horizontally/Vertically)

---

## Node-Level Interactions

### Node Context Menu (Right-Click / Long-Press on Node)
- **Common actions** (all node types):
  - Edit (opens inspector panel)
  - Duplicate
  - Delete
  - Add Connection → (select target node)
  - Move to Container → submenu (list of containers)
  - Add Tags
  - Copy Link (shareable URL to this node)
  - Bring to Front / Send to Back (z-index)
- **Type-specific actions**:
  - **Image/Social Media**: 
    - Open in Lightbox
    - Download Original
    - Set as Container Thumbnail
  - **Container**: 
    - Open Container (drill into)
    - Edit Details (inspector)
    - Set Thumbnail
  - **Budget Item**: 
    - Mark as Purchased
    - Link to Reference
    - Add to Shopping List

### Node Drag & Drop
- **Single node drag**:
  - Click + drag = move node
  - Hover over container = highlight drop zone
  - Drop on container = move into container
  - Drop on canvas = position at cursor
- **Multi-node drag**:
  - Select multiple → drag any selected node = move all together
  - Relative positions preserved

### Node Resize
- **Resize handles**: Corners and edges (when node selected)
- **Aspect ratio**: 
  - Default: Free resize
  - Shift + drag = maintain aspect ratio
  - Image/video nodes: Lock aspect ratio by default
- **Min/max size**: 
  - Min: 100x100px
  - Max: 1000x1000px (or unlimited?)

### Node Hover (Desktop Only)
- **Visual feedback**:
  - Subtle shadow lift
  - Border highlight
  - Show action buttons (edit, delete, expand, connect)
- **Tooltip** (after 500ms):
  - Show full title if truncated
  - Show key metadata
  - Show tag count ("+3 more tags")

### Node Double-Click / Double-Tap
- **Default action by type**:
  - **Image/Social Media**: Open lightbox/viewer
  - **Container**: Drill into container moodboard
  - **Note**: Edit mode (inline text editing)
  - **Budget Item**: Open detailed budget form
  - **Contact**: Open contact details
  - **Sketch**: Open sketch editor

### Node Single-Click / Tap
- **Default**: Select node (shows selection border, inspector panel updates)
- **With modifier**:
  - Shift + click = add to selection
  - Ctrl/Cmd + click = toggle selection

---

## Edge/Connection Interactions

### Creating Connections
- **Method 1: Drag from node**:
  - Hover node → show connection handle (small circle on edge)
  - Drag handle → draws line to cursor
  - Drop on target node → creates connection
  - Esc = cancel
- **Method 2: Context menu**:
  - Right-click node → "Add Connection"
  - Click target node
  - (Optional) Choose connection type (reference/alternative/shared/supplier)
- **Method 3: Multi-select shortcut**:
  - Select 2+ nodes
  - Press "C" key or click "Connect" button
  - Creates connections between all selected nodes

### Edge Context Menu (Right-Click Edge)
- **Actions**:
  - Edit Label (inline text input)
  - Change Type (reference/alternative/shared/supplier/custom)
  - Reverse Direction (if directed edge)
  - Delete Connection
  - Add Waypoints (curve the line)

### Edge Styling
- **Line type**:
  - Solid (default)
  - Dashed (for optional/tentative connections)
  - Dotted (for weak connections)
- **Arrow type**:
  - None (undirected)
  - Single arrow (directed)
  - Double arrow (bidirectional)
- **Color**: Based on connection type or custom

---

## Container-Specific Interactions

### Entering/Exiting Containers
- **Enter**:
  - Double-click container card
  - Context menu → "Open Container"
  - Click container → Inspector → "Open" button
- **Exit**:
  - Context bar → Click breadcrumb (e.g., "All")
  - Back button (browser or app)
  - Keyboard: Esc key

### Container Drop Zones
- **Visual feedback**:
  - Hover with node → container highlights (blue border glow)
  - Drop indicator: "Drop here to add to [Container Name]"
- **Drop behavior**:
  - Node becomes child of container
  - Node removed from parent canvas
  - Option: "Copy" (Ctrl/Cmd + drop) keeps node on parent canvas

### Container Thumbnail
- **Default**: First image/social media node inside container
- **Custom**: Right-click container → "Set Thumbnail" → upload or select from children
- **Fallback**: Container type icon (🎭 character, 📦 prop, 📁 group)

---

## Inspector Panel Interactions

### Opening Inspector
- **Auto-open**: When node selected (if user preference enabled)
- **Manual open**: 
  - Click "Edit" button on node
  - Context menu → "Edit"
  - Keyboard: "I" key (Inspector)
  - Context bar → "Edit" button

### Closing Inspector
- **Desktop**:
  - Click X button
  - Click outside panel (on canvas)
  - Press Esc key
  - Select different node = switch to that node's inspector
- **Mobile**:
  - Swipe down on drawer handle
  - Tap outside drawer (dimmed background)
  - Press back button

### Editing Fields
- **Text fields**: Click to edit, auto-save on blur
- **Dropdowns**: Click to expand options
- **Multi-select** (tags): Click to add/remove chips
- **Rich text** (notes): Inline WYSIWYG editor (bold, italic, links, lists)
- **File upload**: Click + button or drag-drop into field
- **Custom fields**: "Add field" button → name, type (text/number/date/dropdown), value

### Linking Nodes
- **Budget item → Reference**:
  - Inspector → "Linked References" section → "+ Add"
  - Modal: Browse/search nodes → select → creates edge
- **Budget item → Supplier**:
  - Inspector → "Supplier Options" section → "+ Add"
  - Modal: Browse contacts or "Create new contact"
  - Creates supplier_option edge

---

## Context Bar Interactions

### Breadcrumb Navigation
- **Click breadcrumb level**: Navigate to that level
  - "All" → Root moodboard
  - "Character: Link" → That container's moodboard
- **Dropdown** (if deeply nested):
  - Click dropdown arrow → show full path
  - Click any level to jump

### Quick Actions
- **Edit**: Opens inspector panel for current container
- **Add Content**: Quick add menu (same as canvas context menu)
- **View Mode**: Dropdown to switch between Canvas/Gallery/Table/Timeline/List/Graph
- **More** (...): 
  - Share Moodboard
  - Export Current View
  - Container Settings
  - Help/Tutorial

### Collapse/Expand
- **Pin/Unpin button**: Toggle between full context bar and icon-only mode
- **Auto-collapse** (optional setting): After 10 seconds of inactivity
- **Hover to expand** (when collapsed): Show full breadcrumb temporarily

---

## View Mode Switching

### View Switcher Control
- **Location**: Toolbar (top) or Context bar
- **Options**: Canvas | Gallery | Table | Timeline | List | Graph
- **Keyboard shortcuts**:
  - 1 = Canvas
  - 2 = Gallery
  - 3 = Table
  - 4 = Timeline
  - 5 = List
  - 6 = Graph

### View-Specific Interactions

#### Gallery View
- **Hover card**: Show expand button, tags, quick actions
- **Click card**: Select (shows inspector)
- **Double-click card**: Open lightbox or drill into container
- **Drag card**: Reorder (if manual sort enabled)
- **Grid controls**: 
  - Slider: Adjust card size (small/medium/large)
  - Sort: Date, Name, Type, Tags
  - Filter: By tags, type, date range

#### Table View
- **Click row**: Select (shows inspector)
- **Double-click row**: Open detail view or drill into container
- **Inline edit**: Click cell → edit (for simple fields like title, tags)
- **Sort**: Click column header
- **Filter**: Click filter icon in column header
- **Resize columns**: Drag column divider
- **Reorder columns**: Drag column header

#### Timeline View
- **Orientation toggle**: Vertical ↔ Horizontal (button in toolbar)
- **Zoom timeline**: 
  - Day view
  - Week view
  - Month view
  - Year view
- **Group by**: Day/Week/Month/Year
- **Scroll**: Navigate through time
- **Click item**: Select (shows inspector)
- **Drag item**: Change date (if user has permission)

#### List View
- **Compact rows**: Title, thumbnail, tags, date
- **Click row**: Select (shows inspector)
- **Expand row**: Arrow button → shows full metadata inline
- **Sort**: Dropdown (Date, Name, Type)
- **Filter**: Tag filter sidebar

#### Graph View
- **Show**: Nodes + edges only (no content preview)
- **Hover node**: Highlight connected nodes
- **Click node**: Select (shows inspector in minimal mode)
- **Drag node**: Reposition (physics-based layout adjusts)
- **Zoom/pan**: Same as canvas
- **Filter**: 
  - By node type
  - By connection type
  - Hide isolated nodes

---

## Quick Add Interactions

### Quick Add Button
- **Location**: 
  - Floating button (bottom-right, desktop)
  - Bottom toolbar (mobile)
  - Context bar (when inside container)
- **Icon**: ⚡ or + (lightning bolt or plus)
- **Always visible**: Yes (sticky position)

### Quick Add Menu
- **Trigger**: Click/tap Quick Add button
- **Menu options**:
  1. 📸 Photo (camera or upload)
  2. 🖼️ Image (upload from files)
  3. 🔗 Link (paste URL)
  4. ✏️ Sketch (drawing canvas)
  5. 📝 Note (text editor)
  6. 💰 Budget Item (form)
  7. 👤 Contact (form)
  8. 📦 Container (choose type: character/prop/group)
- **Keyboard shortcuts**: Each option has letter shortcut (P, I, L, S, N, B, C, X)

### Add Flow Examples

#### Adding Social Media Link
1. Click Quick Add → Link
2. Modal: "Paste URL" input field
3. User pastes Instagram/TikTok/YouTube URL
4. Loading spinner while fetching metadata
5. Preview: Shows thumbnail, title, author
6. "Add to Moodboard" button
7. Node appears at center of current view or cursor position

#### Adding Image
1. Click Quick Add → Image
2. File picker opens
3. User selects image(s) (multi-select allowed)
4. Upload progress bar
5. Images appear on canvas at center or in grid layout

#### Adding Note
1. Click Quick Add → Note
2. Inline text editor appears at cursor or center
3. User types (supports markdown or rich text)
4. Click outside or press Cmd+Enter to save
5. Note node appears

---

## Tagging Interactions

### Adding Tags to Node
- **Method 1**: Inspector panel → Tags field → type tag name → Enter
- **Method 2**: Context menu → "Add Tags" → tag picker modal
- **Method 3**: Drag node onto tag in tag sidebar (if visible)

### Tag Autocomplete
- **Behavior**: 
  - As user types, show matching existing tags
  - Click suggestion to add
  - Press Enter to create new tag
  - Tags are case-insensitive (normalized to lowercase)

### Tag Filtering
- **Tag sidebar** (left side, collapsible):
  - Shows all tags with count: "costume (12)" "wig (8)" "fabric (5)"
  - Click tag → filter to show only nodes with that tag
  - Multi-select tags → AND filter (nodes with ALL selected tags)
  - Right-click tag → options (Rename, Merge, Delete)

### Tag Management
- **Tag manager** (modal):
  - List all tags with usage count
  - Rename tag (applies to all nodes)
  - Merge tags (combine two tags into one)
  - Delete tag (removes from all nodes)
  - Change tag color

---

## Sharing Interactions

### Creating Share Link
- **Trigger**: 
  - Context bar → Share button
  - Canvas context menu → Share
  - Main menu → Share Moodboard
- **Modal**:
  - "Copy Link" button (generates share_token if not exists)
  - Toggle: "Allow viewing" (on/off) - enables/disables share
  - Toggle: "Allow commenting" (on/off)
  - "Revoke Link" button (disables existing share_token)
- **Link format**: `https://app.cosplans.com/share/moodboard/{share_token}`

### Viewing Shared Moodboard (Public)
- **No login required**: Anyone with link can view
- **Read-only**: Cannot edit, move, delete nodes
- **Can comment**: Must authenticate via OAuth (Google, GitHub, etc.)
- **View mode**: Default to Gallery view (easiest for visitors)
- **Navigation**: Can switch view modes, zoom, pan, view nodes in inspector (read-only)

### Commenting on Shared Moodboard
- **Comment button**: On each node (speech bubble icon)
- **Click comment button**:
  - If not authenticated → "Sign in to comment" button (OAuth options)
  - If authenticated → Inline comment form appears
- **Comment form**:
  - Text area (supports markdown)
  - "Post comment" button
  - User's avatar + name from OAuth (auto-filled)
- **View comments**: 
  - Comment count badge on node
  - Click to expand comment thread
  - Sorted by date (newest first)

---

## Keyboard Shortcuts

### Canvas Navigation
- `Space + Drag` = Pan canvas
- `Cmd/Ctrl + Plus/Minus` = Zoom in/out
- `Cmd/Ctrl + 0` = Fit to screen
- `Cmd/Ctrl + 1` = Reset zoom to 100%

### Selection
- `Cmd/Ctrl + A` = Select all
- `Cmd/Ctrl + D` = Deselect all
- `Shift + Click` = Add to selection
- `Esc` = Deselect / Cancel action / Close panel

### Editing
- `Delete` / `Backspace` = Delete selected
- `Cmd/Ctrl + C` = Copy selected
- `Cmd/Ctrl + V` = Paste
- `Cmd/Ctrl + X` = Cut selected
- `Cmd/Ctrl + Z` = Undo
- `Cmd/Ctrl + Shift + Z` = Redo
- `Cmd/Ctrl + D` = Duplicate selected

### View Switching
- `1` = Canvas view
- `2` = Gallery view
- `3` = Table view
- `4` = Timeline view
- `5` = List view
- `6` = Graph view

### Quick Actions
- `I` = Toggle Inspector panel
- `N` = New note (quick add)
- `L` = Add link (quick add)
- `C` = Connect selected nodes
- `T` = Add tags to selected
- `/` = Search/command palette

### Container Navigation
- `Esc` = Exit container (go to parent)
- `Cmd/Ctrl + B` = Toggle breadcrumb/context bar

---

## Mobile-Specific Gestures

### Touch Gestures
- **Single tap**: Select node
- **Double tap**: Open node (lightbox/drill-in)
- **Long press**: Context menu (node or canvas)
- **Two-finger pinch**: Zoom in/out
- **Two-finger drag**: Pan canvas
- **Swipe right** (from left edge): Open tag/filter sidebar
- **Swipe left** (from right edge): Open inspector panel
- **Swipe down** (on drawer): Close inspector/modal

### Mobile Bottom Toolbar
- **Always visible**: Yes (sticky position at bottom)
- **Actions** (5 buttons):
  1. ⚡ Quick Add (primary action)
  2. 👁️ View Mode (dropdown)
  3. 🏷️ Tags/Filter (opens sidebar)
  4. 📤 Share
  5. ⋮ More (overflow menu)

---

## Accessibility Interactions

### Keyboard Navigation
- `Tab` = Focus next interactive element
- `Shift + Tab` = Focus previous element
- `Enter` = Activate focused element
- `Space` = Select focused node
- `Arrow keys` = Navigate between nodes (in canvas)

### Screen Reader Support
- **ARIA labels**: All interactive elements have descriptive labels
- **Focus indicators**: Clear visual focus states
- **Announcements**: 
  - "Node selected: [Title]"
  - "Entering container: [Name]"
  - "Inspector panel opened"
  - "View changed to Gallery"

### High Contrast Mode
- **Detect system preference**: `prefers-contrast: high`
- **Adjustments**:
  - Higher contrast borders
  - Bolder text
  - No subtle shadows
  - Clear focus indicators

---

## Undo/Redo System

### Undo/Redo Stack
- **Actions that are undoable**:
  - Create node
  - Delete node
  - Move node
  - Resize node
  - Edit node properties
  - Create connection
  - Delete connection
  - Add tags
  - Remove tags
  - Move into/out of container
- **Actions that are NOT undoable**:
  - View mode changes
  - Zoom/pan
  - Inspector panel open/close
  - Filter changes

### Undo/Redo UI
- **Toolbar buttons**: Undo/Redo icons (grayed out when stack empty)
- **Keyboard**: Cmd/Ctrl + Z (undo), Cmd/Ctrl + Shift + Z (redo)
- **Undo limit**: Last 50 actions (configurable)

---

## Search & Filter

### Search Bar
- **Location**: Top toolbar (always visible)
- **Search scope**: 
  - Node titles
  - Node content (text notes)
  - Tags
  - Metadata fields (character names, series, etc.)
- **Real-time results**: As user types, matching nodes highlighted/filtered

### Advanced Filters
- **Filter panel** (left sidebar):
  - **By Type**: Checkboxes (Image, Social Media, Note, Budget Item, Container, etc.)
  - **By Tags**: Multi-select tag chips
  - **By Date**: Date range picker (created, updated)
  - **By Container**: Dropdown (show only items in specific container)
  - **By Connection**: Show only connected nodes, or isolated nodes
- **Active filters**: Shown as chips above canvas (click X to remove)
- **Clear all filters**: Button at top of filter panel

---

## Copy/Paste/Duplicate

### Copy
- **Single node**: Select → Cmd/Ctrl + C
- **Multiple nodes**: Multi-select → Cmd/Ctrl + C
- **What's copied**: 
  - Node type, content, metadata, tags
  - NOT copied: Position (pasted at cursor or center)
  - NOT copied: Connections (would be confusing)

### Paste
- **Cmd/Ctrl + V**: Paste at cursor position or canvas center
- **Option**: "Paste and Connect" (right-click after paste) → connects pasted nodes to original

### Duplicate
- **Context menu → Duplicate** OR **Cmd/Ctrl + D**
- **Behavior**: Creates copy offset slightly from original (50px right, 50px down)
- **Preserves**: All properties, tags, content
- **Does NOT preserve**: Connections (duplicates are isolated)

---

## Export Interactions

### Export Canvas/Selection
- **Trigger**:
  - Context menu → Export
  - Main menu → Export Moodboard
- **Options**:
  - **Export format**: PNG, JPG, PDF, SVG
  - **Export scope**: 
    - Entire canvas
    - Current view (visible area)
    - Selected nodes only
  - **Resolution**: 1x, 2x (retina), 4x (print quality)
  - **Background**: Transparent, White, Canvas color

### Export Data
- **Trigger**: Main menu → Export Data
- **Options**:
  - **CSV**: Table view export (rows = nodes, columns = properties)
  - **JSON**: Full data export (nodes, edges, metadata)
  - **Markdown**: Text-based export (hierarchical list with links)

---

## Missing Interactions? (Questions for Council)

### Potential Gaps
1. **Bulk editing**: Can users select 10 images and change all their tags at once? How?
2. **Template nodes**: Can users save a "template" (e.g., character container with pre-filled fields) for reuse?
3. **Sorting/arranging**: Auto-arrange nodes (align to grid, distribute evenly)? Or always manual?
4. **Collaboration cursors**: If real-time collab added later, how do we show other users' cursors?
5. **Version history**: Can users see past versions of the moodboard? Restore?
6. **Node locking**: Can users "lock" a node to prevent accidental edits/moves?
7. **Layers/z-index**: Do we need explicit layer controls? Or just "Bring to Front / Send to Back"?
8. **Minimap interactions**: Can users click minimap to jump to that area? Drag viewport box?
9. **Node animations**: Fade in when created? Bounce when dropped? Or instant?
10. **Conflict resolution**: If two users edit same node simultaneously, how do we handle?

### Questions for Different Personas
- **Cosplayers**: Do you need to compare two moodboards side-by-side? (Split screen?)
- **Photographers**: Do you need to annotate images with markers/arrows/text?
- **Wig makers**: Do you need to link multiple reference images to a single output photo?
- **Prop makers**: Do you need progress photos to "attach" to specific nodes?
- **Event planners**: Do you need a calendar overlay on the moodboard?

---

**Status**: Ready for Council Review  
**Next Step**: Role-play council session with personas to validate interactions
