# Design Revisions - Feature 006

**Created**: 2026-01-08  
**Status**: Iterating based on user feedback  
**Purpose**: Revise components that need modifications from initial design review

---

## Components to Revise

1. **Node Creation** - Bottom toolbar with tap-and-hold
2. **Canvas Controls** - Auto-hide with hotkey hints
3. **List View** - Nested cards + compact mode
4. **Option Tabs** - Base character node linking
5. **Comments System** - Inline comments with overview

---

## 1. Node Creation (Revised)

### Original Recommendation
Approach D: Multi-Modal (Context menu + FAB + Toolbar)

### User Feedback
> "I dont like the fab idea but something like obsidian mobile with a bottom toolbar that sits above the keyboard and tap and hold for quick menu to add new nodes."

### Revised Approach: Mobile-First Bottom Toolbar ✅

#### Desktop Experience
```
Canvas area:
┌────────────────────────────────────────────┐
│                                            │
│   [Moodboard canvas]                       │
│                                            │
│   Right-click → Context menu               │
│   Keyboard: 'n' → Quick add menu           │
│                                            │
└────────────────────────────────────────────┘

Left sidebar (collapsible):
┌─────────────┐
│ + Add Node  │
│             │
│ [🖼️] Image  │
│ [🔗] Link   │
│ [📝] Note   │
│ [💰] Budget │
│ [👤] Char   │
└─────────────┘
```

#### Mobile Experience (Key Innovation)
```
┌────────────────────────────────────────────┐
│                                            │
│   [Moodboard canvas]                       │
│   (Tap to add at position)                 │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│ [🖼️] [🔗] [📝] [💰] [👤] [+More]          │ ← Bottom toolbar
└────────────────────────────────────────────┘
     ↑ Tap = add at center
     ↑ Long-press = show quick menu with options
```

**Long-Press Interaction** (Mobile):
```
User long-presses the [🖼️] icon:

┌────────────────────────────────────────────┐
│                                            │
│   [Canvas content]                         │
│                                            │
│      ╭─────────────────────╮               │
│      │ Add Image           │               │
│      ├─────────────────────┤               │
│      │ 📷 Take Photo       │               │
│      │ 🖼️  Choose from Lib  │               │
│      │ 📋 Paste from Clip  │               │
│      │ 🔗 Image URL        │               │
│      ╰─────────────────────╯               │
│                                            │
├────────────────────────────────────────────┤
│ [🖼️] [🔗] [📝] [💰] [👤] [+More]          │
└────────────────────────────────────────────┘
     ↑ Still long-pressing
```

**Tap vs Long-Press**:
- **Tap**: Quick add with default (image from gallery, paste URL, blank note, etc.)
- **Long-press**: Show submenu with advanced options

**Bottom Toolbar Items**:
- `[🖼️]` Image - Most common on moodboards
- `[🔗]` Link - Social media/web links
- `[📝]` Note - Text notes
- `[💰]` Budget - Budget item
- `[👤]` Character - Character lookup
- `[+More]` - Overflow menu (connection lines, groups, etc.)

**Keyboard above Toolbar** (Mobile):
When typing in a text note, toolbar stays above keyboard:
```
┌────────────────────────────────────────────┐
│ [Note being edited]                        │
│ "Remember to check fabric stores..."       │
│ [Cursor here]                              │
├────────────────────────────────────────────┤
│ [🖼️] [🔗] [📝] [💰] [👤] [+More]          │ ← Always visible
├────────────────────────────────────────────┤
│ [q][w][e][r][t][y][u][i][o][p]            │
│  [a][s][d][f][g][h][j][k][l]              │ ← System keyboard
│   [z][x][c][v][b][n][m]                   │
│      [    space    ] [return]             │
└────────────────────────────────────────────┘
```

**Desktop Keyboard Shortcuts**:
- `n` - Quick add menu (at cursor or viewport center)
- `i` - Add image
- `l` - Add link
- `t` - Add text note
- `b` - Add budget item
- `c` - Character lookup
- `Right-click` - Context menu

**Toolbar Behavior**:
- **Mobile**: Always visible at bottom (sticky)
- **Desktop**: Collapsible sidebar (left) OR top toolbar (user choice)
- **Tablet**: Bottom toolbar (portrait), sidebar (landscape)

### Implementation Details

**Mobile Toolbar Component**:
```typescript
interface ToolbarItem {
  id: string;
  icon: string;
  label: string;
  quickAction: () => void;  // Tap
  longPressMenu?: MenuItem[]; // Long-press
}

const toolbarItems: ToolbarItem[] = [
  {
    id: 'image',
    icon: '🖼️',
    label: 'Image',
    quickAction: () => openImagePicker(),
    longPressMenu: [
      { label: 'Take Photo', action: openCamera },
      { label: 'Choose from Library', action: openGallery },
      { label: 'Paste from Clipboard', action: pasteImage },
      { label: 'Image URL', action: promptImageUrl },
    ]
  },
  // ... more items
];
```

**Long-Press Detection**:
- Touch start → 500ms timer → show menu
- Touch move (>10px) → cancel long-press
- Touch end (before 500ms) → tap action
- Touch end (after 500ms + menu shown) → menu action

**Obsidian-Inspired Features**:
1. **Quick switcher**: `Cmd/Ctrl + O` to search and add nodes
2. **Command palette**: `Cmd/Ctrl + P` for all actions
3. **Slash commands**: Type `/` in text note → insert menu

### References Needed:
- [ ] Obsidian Mobile: Bottom toolbar and long-press menus
- [ ] Notion Mobile: Bottom toolbar behavior
- [ ] Apple Notes: Bottom toolbar with keyboard
- [ ] Discord Mobile: Message toolbar above keyboard
- [ ] Figma Mobile: Toolbar interaction patterns

---

## 2. Canvas Controls (Revised)

### Original Recommendation
Approach A: Floating Panel (always visible)

### User Feedback
> "I want an easy way to navigate but also options for people who want visual buttons to push so if the mouse moves or the canvas is dragged it will show controls and then after a short time they hide again. controls should also show the hotkey for natural learning."

### Revised Approach: Contextual Auto-Hide with Hotkey Hints ✅

#### Interaction States

**State 1: Hidden** (default, clean canvas)
```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│          [Clean canvas]                    │
│          [No UI visible]                   │
│                                            │
│                                            │
└────────────────────────────────────────────┘
```

**State 2: Visible** (on interaction)
```
┌────────────────────────────────────────────┐
│                                            │
│          [Canvas content]                  │
│                                            │
│                                            │
│                 ┌─────────────────────┐    │
│                 │ [-] 100% [+]  Space │    │ ← Controls appear
│                 │  ↓    ↓    ↓    ↓   │    │
│                 │ -100% Zoom +Alt+0    │    │ ← Hotkey hints
│                 └─────────────────────┘    │
└────────────────────────────────────────────┘

Triggers for showing controls:
• Mouse movement
• Canvas drag/pan
• Zoom (scroll wheel)
• Keyboard shortcut (Space = show/hide toggle)
```

**State 3: Pinned** (always visible)
```
User clicks 📌 pin icon:

Controls stay visible permanently
(Until user unpins)
```

#### Control Panel Design

**Full Controls (visible state)**:
```
┌─────────────────────────────────────────────┐
│ [-] 100% [+]  [↻] [⊡] [📌]   [Space] [?]   │
│  ↓   ↓   ↓    ↓   ↓   ↓       ↓      ↓     │
│ Zoom In  Out Reset Fit Pin  Toggle Help    │
│  -    100%  + Alt+0 F   📌    Space   ?     │
└─────────────────────────────────────────────┘
     ↑ Hotkey hints appear on hover
```

**Compact Mode** (tablet/small screens):
```
┌──────────────────────┐
│ [−][◯][+][↻][⊡][📌] │
└──────────────────────┘
```

**Tooltip on Hover** (desktop):
```
Hover over [+] button:

┌─────────────────┐
│ Zoom In         │
│ Hotkey: +       │
│ or Ctrl+Scroll  │
└─────────────────┘
```

#### Auto-Hide Behavior

**Timing**:
- **Show immediately**: On any interaction (mouse move, drag, zoom)
- **Hide after 2 seconds**: Of no interaction
- **Stay visible if**: Mouse hovering over controls
- **Stay visible if**: User is actively zooming/panning (debounced)

**Fade Animation**:
```css
.canvas-controls {
  transition: opacity 300ms ease-in-out;
  opacity: 0; /* Hidden by default */
}

.canvas-controls.visible {
  opacity: 1;
}

.canvas-controls.pinned {
  opacity: 1;
  /* Pin icon highlighted */
}
```

#### Hotkey Display Strategy

**Progressive Learning**:
1. **First 5 uses**: Always show hotkey hints below buttons
2. **After 5 uses**: Show hints only on hover
3. **After 20 uses**: Assume learned, hide hints (still in tooltips)

**Hotkey Cheat Sheet** (press `?`):
```
┌──────────────────────────────────────────┐
│ Keyboard Shortcuts                 [✕]   │
├──────────────────────────────────────────┤
│ Navigation:                              │
│ • Space+Drag      Pan canvas             │
│ • Scroll          Zoom in/out            │
│ • Alt+0           Reset zoom to 100%     │
│ • F               Fit all items          │
│                                          │
│ Selection:                               │
│ • Click           Select node            │
│ • Cmd+A           Select all             │
│ • Escape          Deselect               │
│                                          │
│ Adding Nodes:                            │
│ • N               Quick add menu         │
│ • I               Add image              │
│ • L               Add link               │
│ • T               Add text note          │
│                                          │
│ Controls:                                │
│ • Space           Show/hide controls     │
│ • ?               This help              │
│                                          │
│ [Print] [Close]                          │
└──────────────────────────────────────────┘
```

#### Mobile Adaptation

On mobile (touch-only):
```
┌────────────────────────────────────────────┐
│                                            │
│   [Canvas]                                 │
│                                            │
│                    ┌────────────┐          │
│                    │ [-][◯][+] │          │ ← Floating
│                    └────────────┘          │
│                         ↑                  │
│                    (Tap to show            │
│                     full controls)         │
└────────────────────────────────────────────┘

• Pinch to zoom (no hotkeys)
• Two-finger pan
• Tap floating button → expand full controls
```

### Implementation Details

**Auto-Hide Logic**:
```typescript
let hideTimeout: NodeJS.Timeout;
let isHovering = false;

function showControls() {
  controlsVisible = true;
  clearTimeout(hideTimeout);
  
  if (!isPinned && !isHovering) {
    hideTimeout = setTimeout(() => {
      controlsVisible = false;
    }, 2000);
  }
}

// Triggers
canvas.addEventListener('mousemove', showControls);
canvas.addEventListener('wheel', showControls);
canvas.addEventListener('drag', showControls);

controlsPanel.addEventListener('mouseenter', () => {
  isHovering = true;
  clearTimeout(hideTimeout);
});

controlsPanel.addEventListener('mouseleave', () => {
  isHovering = false;
  if (!isPinned) {
    hideTimeout = setTimeout(() => {
      controlsVisible = false;
    }, 2000);
  }
});
```

**Hotkey Hint Component**:
```svelte
<button 
  class="zoom-in"
  on:click={zoomIn}
  on:mouseenter={() => showTooltip('Zoom In', '+')}
>
  [+]
  {#if showHints}
    <span class="hotkey">+</span>
  {/if}
</button>
```

### References Needed:
- [ ] Figma: Auto-hide UI on canvas
- [ ] Framer: Contextual controls appearance
- [ ] Miro: Canvas navigation controls
- [ ] Photopea: Auto-hide toolbar behavior
- [ ] VS Code: Command palette and hotkey hints

---

## 3. List View (Revised)

### Original Recommendation
Approach B: Card List (balanced density)

### User Feedback
> "It would be nice to have nested cards for more details or a compact and mobile option so you can view it like c or like b."

### Revised Approach: Adaptive List with Density Toggle ✅

#### View Density Options

**Density Selector** (toolbar):
```
List View  [Compact ▼] [☰] [Filter ▼]
             ↓
     ┌─────────────┐
     │ ● Comfortable │ ← Default (Approach B)
     │ ○ Compact     │ ← New (Approach C-style)
     │ ○ Detailed    │ ← New (Expanded)
     └─────────────┘
```

#### Mode 1: Comfortable (Default)
```
┌──────────────────────────────────────────────┐
│ ┌────────────────────────────────────────┐   │
│ │ [img]  Red wig inspiration             │   │
│ │        Tags: wig, red, asuka           │   │
│ │        Instagram • @cosplayer          │   │
│ │        Added 2 hours ago               │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ [img]  Fabric shopping guide           │   │
│ │        Tags: fabric, tutorial          │   │
│ │        TikTok • @sewing_tips           │   │
│ │        Added 1 day ago                 │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘

Row height: ~100px
Thumbnails: 80x80px
Good balance of info and density
```

#### Mode 2: Compact (High Density)
```
┌──────────────────────────────────────────────┐
│ [○] 🖼️  Red wig inspiration • wig, red    │ │
│ [○] 🔗  Fabric shopping • fabric, tutorial │ │
│ [○] 📝  Budget note • budget, planning     │ │
│ [○] 🖼️  Makeup tutorial • makeup, eyes    │ │
│ [○] 🔗  Shoe reference • shoes, brown      │ │
│ [○] 📝  Timeline notes • planning          │ │
│ [○] 🖼️  Pose reference • pose, standing   │ │
└──────────────────────────────────────────────┘

Row height: ~40px
No thumbnails (just icons)
Max items visible on screen
Good for scanning many items
```

#### Mode 3: Detailed (Expandable/Nested)
```
┌──────────────────────────────────────────────┐
│ ▼ Red wig inspiration                        │
│ ├─────────────────────────────────────────┐  │
│ │ [Large thumbnail - 200x200]             │  │
│ │                                         │  │
│ │ Tags: wig, red, asuka                   │  │
│ │ Source: Instagram • @cosplayer_name     │  │
│ │ Added: March 15, 2026 at 2:30 PM       │  │
│ │ Modified: March 15, 2026 at 3:45 PM    │  │
│ │                                         │  │
│ │ Notes:                                  │  │
│ │ "Perfect shade of red! Check if they   │  │
│ │  have in stock before ordering."        │  │
│ │                                         │  │
│ │ Connected to:                           │  │
│ │ • [🖼️ Character ref: Asuka]             │  │
│ │ • [💰 Budget: Wig - $40]                │  │
│ │                                         │  │
│ │ [View in Canvas] [Edit] [Delete]       │  │
│ └─────────────────────────────────────────┘  │
│                                              │
│ ▶ Fabric shopping guide                     │ ← Collapsed
│                                              │
│ ▼ Budget note                                │ ← Expanded
│ ├─────────────────────────────────────────┐  │
│ │ 📝 Text Note                            │  │
│ │                                         │  │
│ │ "Budget estimate: $150-200 total       │  │
│ │  - Fabric: $50                          │  │
│ │  - Wig: $40                             │  │
│ │  - Props: $30                           │  │
│ │  - Shoes: $45"                          │  │
│ │                                         │  │
│ │ [View in Canvas] [Edit] [Delete]       │  │
│ └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘

Click ▶/▼ to expand/collapse
Shows full details, connections, notes
Good for reviewing individual items
```

#### Nested Organization (Hierarchical Mode)

**Optional: Group by Tag** (toggle):
```
┌──────────────────────────────────────────────┐
│ List View [Comfortable ▼] [Group: Tags ▼]   │
├──────────────────────────────────────────────┤
│                                              │
│ ▼ Wig (3 items)                              │
│   ├─ [img] Red bob wig - Amazon             │
│   ├─ [img] Styling reference - TikTok       │
│   └─ [link] Tutorial video - YouTube        │
│                                              │
│ ▼ Fabric (4 items)                           │
│   ├─ [img] Red satin sample - Fabric.com    │
│   ├─ [img] Pattern reference - Pinterest    │
│   ├─ [link] Fabric store link              │
│   └─ [note] Pricing notes                   │
│                                              │
│ ▶ Accessories (5 items)                      │
│                                              │
│ ▶ Shoes (2 items)                            │
│                                              │
│ Untagged (1 item)                            │
│   └─ [note] Random idea                      │
└──────────────────────────────────────────────┘

Group by options:
• None (flat list)
• Tags (as shown)
• Type (images, links, notes)
• Date (today, yesterday, this week, older)
• Option (for multi-option ideas)
```

#### Mobile Optimization

**Compact mode** (default on mobile):
```
┌───────────────────────────┐
│ 🖼️  Red wig              │
│    wig, red              │
├───────────────────────────┤
│ 🔗  Fabric guide         │
│    fabric, tutorial      │
├───────────────────────────┤
│ 📝  Budget note          │
│    budget                │
└───────────────────────────┘

Small screen = automatic compact
Tap item = open detail drawer
```

**Comfortable mode** (tablet landscape):
```
┌────────────────────────────────┐
│ [img] Red wig inspiration      │
│       Tags: wig, red           │
│       Instagram • 2h ago       │
└────────────────────────────────┘
```

### Implementation Details

**Density Storage**:
```typescript
// Store per-view preference
localStorage.setItem('list-view-density', 'comfortable');

// Options
type Density = 'compact' | 'comfortable' | 'detailed';

const densityConfig = {
  compact: {
    rowHeight: 40,
    showThumbnails: false,
    showMetadata: false,
    expandable: false
  },
  comfortable: {
    rowHeight: 100,
    showThumbnails: true,
    showMetadata: true,
    expandable: false
  },
  detailed: {
    rowHeight: 'auto',
    showThumbnails: true,
    showMetadata: true,
    expandable: true
  }
};
```

**Expandable Card Component**:
```svelte
<script>
  let expanded = false;
</script>

<div class="list-item" class:expanded>
  <button class="expand-toggle" on:click={() => expanded = !expanded}>
    {expanded ? '▼' : '▶'}
  </button>
  
  <div class="item-preview">
    <!-- Always visible -->
  </div>
  
  {#if expanded}
    <div class="item-details" transition:slide>
      <!-- Full details -->
    </div>
  {/if}
</div>
```

### References Needed:
- [ ] Notion: List view with density options
- [ ] Airtable: Compact vs comfortable row heights
- [ ] Apple Mail: List view density settings
- [ ] Slack: Message density (compact/comfortable)
- [ ] Linear: Issue list with expandable details

---

## 4. Option Tabs (Revised)

### Original Recommendation
Hybrid: Tabs for ≤4 options, Dropdown for 5+ options

### User Feedback (Initial)
> "When i think of groups i think you could just have a base character node that links to other nodes so variations would be linked to all resources with slight differences where different characters are more like silos where they have their own set of resources."

### User Feedback (Clarification)
> "The first layer is the character or characters and shared resources. Then you click into a character node to view its resource canvas and the tabs show variations. I prefer the tabbed idea overall but i think we can just expand the idea for increased flexibility in organization and nesting."

### Revised Approach: Two-Layer Nested Canvas with Tabs ✅

**Clear Hierarchy**:
1. **Layer 1** (Main Canvas): Character nodes + general shared resources
2. **Layer 2** (Character Canvas): Tabs for variations within that character

This is cleaner and more intuitive than the original design.

#### Tab-Based Navigation System

**Top-Level Tabs** (main navigation across the top):

```
[All] [Tanjiro] [Inosuke] [Zenitsu] [+]
 ↑       ↑         ↑         ↑       ↑
Home   Char 1    Char 2    Char 3   Add new character
```

**Tab Levels Explained**:

1. **"All" Tab** (Home/Overview) - Layer 1
   - The main canvas / working table
   - See all characters at once
   - Piles, loose notes, shared resources
   - Overview of the entire project

2. **Character Tabs** (e.g., "Tanjiro") - Layer 2
   - Dedicated workspace for that character
   - Has **sub-tabs or dropdown** for variations/iterations
   - Character-specific planning

**Navigation Flow**:
```
Start at: [All] tab
          ↓ Click "Tanjiro" tab
          
Enter: Tanjiro's workspace
       Sub-tabs: [All Shared] [Default Outfit] [Final Form]
                      ↓ Select via tabs or dropdown
                      
       Working in: "Default Outfit" variation
```

**"All" Tab: The Home Canvas**

This is the **working table / overview** where you:
- See **all characters** at once (as piles or grouped sections)
- Manage **shared resources** (black fabric, wooden swords)
- Keep **loose notes** and quick captures
- Organize **piles** before moving to character workspaces
- Get **bird's eye view** of the project

```
Main Canvas - "Evangelion Group Cosplay" Idea

┌────────────────────────────────────────────┐
│                                            │
│  ┌────────────────┐   ┌────────────────┐  │
│  │ 👤 Character:  │   │ 👤 Character:  │  │
│  │ Asuka Langley  │   │ Rei Ayanami    │  │
│  │                │   │                │  │
│  │ 3 variations   │   │ 1 variation    │  │
│  │ 24 items       │   │ 8 items        │  │
│  │                │   │                │  │
│  │ [Click to open]│   │ [Click to open]│  │
│  └────────────────┘   └────────────────┘  │
│                                            │
│  📋 General Resources:                     │
│  ┌──────┐ ┌──────┐ ┌──────┐              │
│  │Event │ │Group │ │Budget│              │
│  │ info │ │photo │ │ plan │              │
│  └──────┘ └──────┘ └──────┘              │
│                                            │
└────────────────────────────────────────────┘
```

**Character Tabs: Dedicated Workspaces**

Click a character tab (e.g., "Tanjiro") → Opens that character's dedicated canvas.

**Sub-Navigation within Character Tab**:

**Option A: Dropdown Selector** (compact)
```
Character: Tanjiro [All Shared ▼]
                       ↓
            ┌─────────────────┐
            │ All Shared   ✓  │
            │ Default Outfit  │
            │ Final Form      │
            │ + New Variation │
            └─────────────────┘
```

**Option B: Sub-Tabs** (always visible)
```
Tanjiro > [All Shared] [Default Outfit] [Final Form] [+]
```

**Recommendation**: **Dropdown for >2 variations, Sub-tabs for ≤2 variations**

**Variations/Iterations can represent**:
1. **Costume Variations** - Different designs (EVA Plugsuit, School Uniform)
2. **Progress Tracking** - Iterations (First Try, Second Try, Final)
3. **Versions** - Refinements (v1, v2, v3)
4. **Stages** - Timeline (Planning, WIP, Complete)
5. **Hybrid** - Mix and match

```
Click "Asuka Langley" character node:

Example 1: Variation-based tabs
┌────────────────────────────────────────────┐
│ ← Back to Main | 👤 Asuka Langley          │
├────────────────────────────────────────────┤
│ [All Shared] [EVA Plugsuit*] [School] [Casual] [+] │
├────────────────────────────────────────────┤
│  Canvas showing "EVA Plugsuit" variation   │
│  [Resources specific to this design]       │
└────────────────────────────────────────────┘

Example 2: Progress tracking tabs
┌────────────────────────────────────────────┐
│ ← Back to Main | 👤 Asuka Langley          │
├────────────────────────────────────────────┤
│ [All Shared] [First Try*] [Second Try] [Final] [+] │
├────────────────────────────────────────────┤
│  Canvas showing "First Try" iteration:     │
│                                            │
│  📝 "Used cheap fabric, didn't work"       │
│  📸 [Photo of first attempt]               │
│  ❌ Issues: Fabric too thin, wrong color   │
│                                            │
│  💡 Improvements for next try:             │
│  - Use thicker red fabric                  │
│  - Add interfacing for structure           │
└────────────────────────────────────────────┘

Example 3: Hybrid (variation + progress)
┌────────────────────────────────────────────┐
│ ← Back to Main | 👤 Asuka Langley          │
├────────────────────────────────────────────┤
│ [All] [EVA v1*] [EVA v2] [School Draft] [+] │
├────────────────────────────────────────────┤
│  Flexible naming for your workflow         │
└────────────────────────────────────────────┘
```

#### Visual Hierarchy Diagram

```
Idea: "Evangelion Group Cosplay"
│
├─ Main Canvas (Layer 1)
│  │
│  ├─ Character Node: Asuka
│  │  └─ [Click to open] → Character Canvas (Layer 2)
│  │                       │
│  │                       ├─ Tab: "All Shared" (resources for all Asuka variations)
│  │                       ├─ Tab: "EVA Plugsuit" (variation-specific)
│  │                       ├─ Tab: "School Uniform" (variation-specific)
│  │                       └─ Tab: "Casual Outfit" (variation-specific)
│  │
│  ├─ Character Node: Rei
│  │  └─ [Click to open] → Character Canvas (Layer 2)
│  │                       │
│  │                       ├─ Tab: "All Shared"
│  │                       └─ Tab: "Plugsuit"
│  │
│  └─ General Resources (always on main canvas)
│     ├─ Event information
│     ├─ Group coordination notes
│     └─ Overall budget summary
│
└─ [End of structure]
```

#### Detailed UI Flows

**Flow 1: "All" Tab - Home/Overview (Main Canvas)**

```
┌────────────────────────────────────────────┐
│ "Demon Slayer Group Cosplay" Idea          │
│ [+ Add] [📦 New Pile] [Share] [⋮]          │
├────────────────────────────────────────────┤
│ Tabs: [All*] [Tanjiro] [Inosuke] [Zenitsu] [+] │
├────────────────────────────────────────────┤
│ "All" Tab - Home/Overview Canvas           │
│                                            │
│  Character Sections (grouped piles):       │
│                                            │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                │
│    👤 Tanjiro Section    ← Grouped area    │
│  │ ┌──────┐ ┌──────┐   │                  │
│    │ img  │ │ img  │                      │
│  │ └──────┘ └──────┘   │                  │
│    ┌──────┐ ┌──────┐                      │
│  │ │ link │ │budget│   │                  │
│    └──────┘ └──────┘                      │
│  │ (4 items)            │                  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘                │
│                                            │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                │
│    👤 Inosuke Section                      │
│  │ ┌──────┐ ┌──────┐   │                  │
│    │ img  │ │ img  │                      │
│  │ └──────┘ └──────┘   │                  │
│    ┌──────┐                                │
│  │ │ note │            │                  │
│    └──────┘                                │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘                │
│                                            │
│  💰 Shared Resources (multi-character):    │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Black Fabric │  │ Wooden Swords│       │
│  │ 👤 Tanjiro   │  │ 👤 👤 👤 All  │       │
│  │ 👤 Inosuke   │  │              │       │
│  └──────────────┘  └──────────────┘       │
│       ↑ Connection lines to characters     │
│                                            │
│  📝 Loose Notes (ungrouped):               │
│  [img]  [note]  [link]  [budget]           │
│                                            │
│  📦 Piles (optional organization):         │
│  ┌────────────────┐  ┌────────────────┐   │
│  │ "Still Deciding"│  │ "Fabric Research"│ │
│  │ (3 items)      │  │ (5 items)        │ │
│  └────────────────┘  └────────────────┘   │
│                                            │
└────────────────────────────────────────────┘

Navigation:
• Click [Tanjiro] tab → dive into Tanjiro's workspace
• Character sections are visual groups (not clickable)
• Shared resources show connection lines
• Drag items between sections
```

**Pile/Group Interaction**:
```
Double-click a pile → Expands in place:

┌────────────────────────────────┐
│ 📦 "Fabric Research" (expanded) │
├────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │Red   │ │Blue  │ │Pattern│   │
│ │satin │ │cotton│ │ref    │   │
│ └──────┘ └──────┘ └──────┘    │
│                                │
│ ┌──────┐                       │
│ │Price │                       │
│ │notes │                       │
│ └──────┘                       │
│                                │
│ [Collapse] [Move to...] [Link]│
└────────────────────────────────┘

Options:
• Collapse back to pile
• Move entire pile to character canvas
• Link pile items to character(s)
• Drag individual items out
```

**Drag-and-Drop Flow**:
```
Scenario: Moving items from pile to character

Main Canvas:
📦 "Fabric Research" pile
    ↓ [Drag red fabric image]
    │
    ▼
┌──────────────┐
│ 👤 Asuka     │ ← Drop on character node
└──────────────┘
    │
    ├─ Option 1: Add to "All Shared"
    ├─ Option 2: Add to specific tab (prompt)
    └─ Option 3: Link from main (stays visible on both)

User chooses → Item appears in character canvas
```

**Flow 2: Character Tab (e.g., "Tanjiro")**

```
Click [Tanjiro] tab:

┌────────────────────────────────────────────┐
│ "Demon Slayer Group Cosplay" Idea          │
│ [+ Add] [Share] [⋮]                        │
├────────────────────────────────────────────┤
│ Tabs: [All] [Tanjiro*] [Inosuke] [Zenitsu] [+] │
├────────────────────────────────────────────┤
│ Tanjiro > [All Shared ▼]                   │
│           or: [All Shared*] [Default] [Final] │
├────────────────────────────────────────────┤
│                                            │
│  Resources shared across ALL Asuka         │
│  variations:                               │
│                                            │
│  ┌──────────────┐  ┌──────────────┐      │
│  │ Character    │  │ Reference    │      │
│  │ Sheet Image  │  │ Poses        │      │
│  └──────────────┘  └──────────────┘      │
│                                            │
│  ┌──────────────┐  ┌──────────────┐      │
│  │ Wig Styling  │  │ Makeup       │      │
│  │ Tutorial     │  │ Reference    │      │
│  └──────────────┘  └──────────────┘      │
│                                            │
│  💡 These items appear in all variations   │
│                                            │
└────────────────────────────────────────────┘
```

**Flow 3: Character Variation (via dropdown or sub-tab)**

```
Still in [Tanjiro] tab, select "Default Outfit":

┌────────────────────────────────────────────┐
│ "Demon Slayer Group Cosplay" Idea          │
├────────────────────────────────────────────┤
│ Tabs: [All] [Tanjiro*] [Inosuke] [Zenitsu] │
├────────────────────────────────────────────┤
│ Tanjiro > [Default Outfit ▼]               │
│           or: [All Shared] [Default*] [Final] │
├────────────────────────────────────────────┤
│                                            │
│  EVA Plugsuit Variation:                   │
│  (Resources specific to this costume)      │
│                                            │
│  ┌────────┐  ───→  ┌──────────┐          │
│  │Red     │        │Plugsuit  │          │
│  │fabric  │        │pattern   │          │
│  └────────┘        └──────────┘          │
│       │                 │                  │
│       └────────┬────────┘                 │
│                ↓                           │
│         ┌──────────────┐                  │
│         │ Budget Item: │                  │
│         │ Fabric $80   │                  │
│         └──────────────┘                  │
│                                            │
│  ┌────────┐  ───→  ┌──────────┐          │
│  │Orange  │        │Contact:  │          │
│  │accents │        │Foam shop │          │
│  └────────┘        └──────────┘          │
│                                            │
└────────────────────────────────────────────┘
```

**Navigation Pattern**:
```
[All] tab
  └─ Home canvas (overview of everything)
  
[Tanjiro] tab
  ├─ All Shared (character-wide resources)
  ├─ Default Outfit (variation/iteration 1)
  └─ Final Form (variation/iteration 2)
  
[Inosuke] tab
  └─ Boar Outfit (single variation)

Navigation:
• Top-level tabs = switch characters or return to "All"
• Sub-tabs/dropdown = switch variations within character
• Always visible where you are (active tab + active sub-tab)
```

**URL Structure**:
```
/ideas/123/moodboard                    (All tab)
/ideas/123/moodboard/tanjiro            (Tanjiro, All Shared)
/ideas/123/moodboard/tanjiro/default    (Tanjiro, Default Outfit)
/ideas/123/moodboard/inosuke            (Inosuke, All Shared)
```

#### Resource Linking System

Resources can be **linked to multiple characters** using a tagging/linking system. This allows flexible sharing:

**Linking Levels**:
1. **General** - Not linked to any character (main canvas only)
2. **Multi-Character** - Linked to 2+ characters (shared resource)
3. **Single Character** - Linked to one character
   - **All variations** - Appears in "All Shared" tab
   - **Specific variation** - Appears only in that variation tab

**Example (Demon Slayer Group Cosplay)**:
```
Resources:
├─ Black fabric (pants) → Linked to: Tanjiro, Inosuke
├─ Checkered haori fabric → Linked to: Tanjiro only
├─ Boar mask materials → Linked to: Inosuke only
├─ Wooden swords → Linked to: Tanjiro, Inosuke, Zenitsu
└─ Convention info → Not linked (general)
```

**Where They Appear**:
```
Main Canvas:
├─ Black fabric (shows: 👤 Tanjiro, Inosuke)
├─ Checkered haori (shows: 👤 Tanjiro)
├─ Boar mask (shows: 👤 Inosuke)
├─ Wooden swords (shows: 👤 Tanjiro, Inosuke, Zenitsu)
└─ Convention info (no character tags)

Tanjiro's Canvas:
├─ Black fabric (linked from main)
├─ Checkered haori (linked from main)
└─ Wooden swords (linked from main)

Inosuke's Canvas:
├─ Black fabric (linked from main)
├─ Boar mask (linked from main)
└─ Wooden swords (linked from main)
```

**Adding Items with Character Links**:

```
Add Image on Main Canvas:

┌────────────────────────────────────────────┐
│ Add Budget Item: Black Fabric             │
├────────────────────────────────────────────┤
│ [Details: $30 for 3 yards...]              │
│                                            │
│ Link to characters:                        │
│ ☑ Tanjiro                                  │
│ ☑ Inosuke                                  │
│ ☐ Zenitsu                                  │
│ ☐ None (general resource)                  │
│                                            │
│ 💡 This resource will appear in linked     │
│    characters' canvases                    │
│                                            │
│ [Cancel] [Add]                             │
└────────────────────────────────────────────┘
```

**Adding Items Inside Character Canvas**:

```
Add Image while in "Tanjiro > Default Outfit" tab:

┌────────────────────────────────────────────┐
│ Add Image                                  │
├────────────────────────────────────────────┤
│ [Select image...]                          │
│                                            │
│ Scope:                                     │
│ ● This variation only (Default Outfit)     │
│ ○ All Tanjiro variations (shared)          │
│ ○ Add to main canvas                       │
│                                            │
│ If adding to main canvas:                  │
│ Link to other characters?                  │
│ ☑ Tanjiro (auto-checked)                   │
│ ☐ Inosuke                                  │
│ ☐ Zenitsu                                  │
│                                            │
│ [Cancel] [Add]                             │
└────────────────────────────────────────────┘
```

**Visual Indicators on Main Canvas**:

Resources on main canvas show which characters they're linked to:

```
Main Canvas view:

┌──────────────────────────┐
│ 💰 Black Fabric - $30    │
│                          │
│ For pants/hakama         │
│                          │
│ Linked to:               │
│ 👤 Tanjiro 👤 Inosuke   │ ← Character badges
│                          │
│ [Click to view details]  │
└──────────────────────────┘

┌──────────────────────────┐
│ 🎨 Convention Flyer      │
│                          │
│ June 15-17, 2026         │
│                          │
│ 🌐 General               │ ← Not character-specific
│                          │
│ [Click to view]          │
└──────────────────────────┘

┌──────────────────────────┐
│ 🪵 Wooden Swords         │
│                          │
│ $45 from prop shop       │
│                          │
│ Linked to:               │
│ 👤 All 3 characters      │ ← When linked to many
│                          │
│ [Click to view]          │
└──────────────────────────┘
```

**Editing Character Links**:

Right-click any resource on main canvas:
```
┌────────────────────────────────┐
│ Edit                           │
│ Delete                         │
│ ─────────────────────────────  │
│ Manage Character Links...      │ ← Opens dialog
└────────────────────────────────┘

Dialog:
┌────────────────────────────────────────────┐
│ Character Links: Black Fabric              │
├────────────────────────────────────────────┤
│ This resource is currently linked to:      │
│                                            │
│ ☑ Tanjiro Kamado                           │
│ ☑ Inosuke Hashibira                        │
│ ☐ Zenitsu Agatsuma                         │
│                                            │
│ ☐ No characters (general resource)         │
│                                            │
│ 💡 Linked resources appear in character    │
│    canvases automatically                  │
│                                            │
│ [Cancel] [Save]                            │
└────────────────────────────────────────────┘
```

**Character Canvas View (Linked Resources)**:

Inside Tanjiro's character canvas:
```
┌────────────────────────────────────────────┐
│ ← Back | 👤 Tanjiro Kamado                 │
├────────────────────────────────────────────┤
│ [All Shared] [Default Outfit*] [Final] [+] │
├────────────────────────────────────────────┤
│                                            │
│ Resources for Default Outfit:              │
│                                            │
│ Linked from Main Canvas:                   │
│ ┌──────────────┐  ┌──────────────┐       │
│ │ Black Fabric │  │ Wooden Sword │       │
│ │ 🔗 Shared    │  │ 🔗 Shared    │       │
│ └──────────────┘  └──────────────┘       │
│       ↑                  ↑                 │
│    Badge shows        Badge shows         │
│  it's linked from   it's linked from      │
│   main canvas        main canvas          │
│                                            │
│ Variation-Specific:                        │
│ ┌──────────────┐                          │
│ │ Checkered    │  ← Only in Tanjiro       │
│ │ Haori        │                          │
│ └──────────────┘                          │
│                                            │
└────────────────────────────────────────────┘
```

**Visual Scope Indicators**:

Items have visual indicators showing their scope and linkage:

```
In Character Canvas:

┌─────────────────┐
│ [Image]         │ ← Blue border
│ Plugsuit pattern│ (Variation-specific: EVA Plugsuit only)
└─────────────────┘

┌─────────────────┐
│ [Image]         │ ← Purple border
│ Character ref   │ (Character-wide: All Asuka variations)
│ 🔗 All variants │
└─────────────────┘

┌─────────────────┐
│ [Budget]        │ ← Orange border + badge
│ Black Fabric    │ (Linked from Main Canvas)
│ 🔗 Main + 2 👤  │
└─────────────────┘

On Main Canvas:

┌─────────────────┐
│ [Budget]        │ ← Orange border + character badges
│ Black Fabric    │ (Multi-character resource)
│ 👤 Tanjiro      │
│ 👤 Inosuke      │
└─────────────────┘

┌─────────────────┐
│ [Image]         │ ← Gray/default border
│ Event flyer     │ (General: Not character-specific)
│ 🌐 General      │
└─────────────────┘
```

**Badge System**:
- `🔗 Shared` = Shared across character variations (within one character)
- `🔗 Main` = Linked from main canvas (appears in character canvases)
- `👤 Name` = Character badge (shows which characters it's linked to)
- `🌐 General` = General/main canvas resource (not linked to characters)
- `👤 2` or `👤 All` = Linked to multiple characters (compact view)

#### Data Model (with Multi-Character Linking)

**Updated Schema**:

```sql
-- Character nodes (Layer 1)
CREATE TABLE character_nodes (
  id UUID PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id),
  character_id UUID REFERENCES characters(id),
  name VARCHAR(255),  -- "Tanjiro Kamado"
  canvas_x FLOAT,  -- Position on main canvas
  canvas_y FLOAT,
  created_at TIMESTAMPTZ
);

-- Variations (tabs within character canvas) (Layer 2)
CREATE TABLE idea_options (
  id UUID PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id),
  character_node_id UUID REFERENCES character_nodes(id),
  name VARCHAR(255),  -- "Default Outfit", "Final Form"
  option_order INT,
  created_at TIMESTAMPTZ
);

-- Moodboard items
ALTER TABLE moodboard_nodes
  ADD COLUMN scope VARCHAR(50) DEFAULT 'variation',
  ADD COLUMN character_node_id UUID REFERENCES character_nodes(id);

-- scope values:
-- 'main': On main canvas (can be linked to characters)
-- 'character_shared': In character's "All Shared" tab (all variations)
-- 'variation': In specific variation tab

-- NEW: Character links (many-to-many relationship)
CREATE TABLE moodboard_node_character_links (
  id UUID PRIMARY KEY,
  moodboard_node_id UUID REFERENCES moodboard_nodes(id),
  character_node_id UUID REFERENCES character_nodes(id),
  created_at TIMESTAMPTZ,
  UNIQUE(moodboard_node_id, character_node_id)
);

-- Example data:

-- Characters
character_nodes:
  - id: TANJIRO, idea_id: IDEA123, name: "Tanjiro Kamado"
  - id: INOSUKE, idea_id: IDEA123, name: "Inosuke Hashibira"
  - id: ZENITSU, idea_id: IDEA123, name: "Zenitsu Agatsuma"

-- Variations
idea_options:
  - id: OPT1, character_node_id: TANJIRO, name: "Default Outfit"
  - id: OPT2, character_node_id: INOSUKE, name: "Boar Outfit"

-- Moodboard items:
moodboard_nodes:
  -- Main canvas: Black fabric (linked to Tanjiro & Inosuke)
  - node_id: NODE1, scope: 'main', type: 'budget'
    data: { name: "Black Fabric", amount: 30 }
  
  -- Main canvas: Convention info (not linked to any character)
  - node_id: NODE2, scope: 'main', type: 'note'
    data: { text: "Convention June 15-17" }
  
  -- Main canvas: Wooden swords (linked to all 3 characters)
  - node_id: NODE3, scope: 'main', type: 'budget'
    data: { name: "Wooden Swords", amount: 45 }
  
  -- Tanjiro's "All Shared" (all variations)
  - node_id: NODE4, scope: 'character_shared', 
    character_node_id: TANJIRO, type: 'image'
  
  -- Tanjiro's "Default Outfit" specific
  - node_id: NODE5, scope: 'variation',
    idea_option_id: OPT1, type: 'image'

-- Character links:
moodboard_node_character_links:
  - node_id: NODE1, character_node_id: TANJIRO
  - node_id: NODE1, character_node_id: INOSUKE
  - node_id: NODE3, character_node_id: TANJIRO
  - node_id: NODE3, character_node_id: INOSUKE
  - node_id: NODE3, character_node_id: ZENITSU
  -- NODE2 has no links (general resource)
```

**Queries**:

```sql
-- Get all items for main canvas
SELECT n.*, 
       array_agg(cn.name) as linked_characters
FROM moodboard_nodes n
LEFT JOIN moodboard_node_character_links l ON n.id = l.moodboard_node_id
LEFT JOIN character_nodes cn ON l.character_node_id = cn.id
WHERE n.idea_id = ? AND n.scope = 'main'
GROUP BY n.id;

-- Get all items visible in Tanjiro's "Default Outfit" variation
-- (includes: variation-specific + character-shared + linked from main)
SELECT * FROM moodboard_nodes 
WHERE 
  -- Variation-specific items
  (idea_option_id = 'OPT1' AND scope = 'variation')
  OR 
  -- Character-wide shared items
  (character_node_id = 'TANJIRO' AND scope = 'character_shared')
  OR
  -- Main canvas items linked to this character
  (id IN (
    SELECT moodboard_node_id 
    FROM moodboard_node_character_links 
    WHERE character_node_id = 'TANJIRO'
  ));

-- Get characters linked to a specific resource
SELECT cn.* 
FROM character_nodes cn
JOIN moodboard_node_character_links l ON cn.id = l.character_node_id
WHERE l.moodboard_node_id = 'NODE1';

-- Check if a resource is shared across multiple characters
SELECT 
  n.id,
  n.data->>'name' as name,
  COUNT(l.character_node_id) as character_count,
  array_agg(cn.name) as character_names
FROM moodboard_nodes n
LEFT JOIN moodboard_node_character_links l ON n.id = l.moodboard_node_id
LEFT JOIN character_nodes cn ON l.character_node_id = cn.id
WHERE n.scope = 'main'
GROUP BY n.id
HAVING COUNT(l.character_node_id) > 1;  -- Multi-character resources
```

#### Key Benefits

1. **Clean Separation**: Main canvas stays uncluttered (just character nodes + shared resources)
2. **Clear Hierarchy**: Two layers only (Main → Character with tabs)
3. **Familiar Pattern**: Tabs are intuitive, no need to learn new interaction
4. **Flexible Sharing**: Resources can be linked to any combination of characters
5. **Reduces Duplication**: Share budget items (black fabric) across multiple characters
6. **Multiple Characters**: Each character has its own isolated workspace
7. **Shared Resources**: "All Shared" tab makes it obvious what's common across variations
8. **Scalable**: Works for single character (one node) or group cosplays (multiple nodes)
9. **Visual Clarity**: Color coding and badges show relationship levels at a glance

#### Piles/Groups on Main Canvas

**What are Piles?**
- Visual groupings of related items
- Like "folders" but visible and spatially organized
- Can collapse/expand
- Can drag items in/out
- Can move entire pile to character canvas

**Creating a Pile**:
```
1. Select multiple items on canvas
2. Right-click → "Create Pile" or press 'G'
3. Name the pile: "Fabric Research"
4. Items stack visually as a pile

OR

1. Click [📦 New Pile] button
2. Drag items onto the pile area
```

**Pile Interactions**:
```
Collapsed Pile:
┌────────────────┐
│ 📦 Fabric      │
│ Research       │
│ (4 items)      │
│ [Click]        │
└────────────────┘

Expanded Pile:
┌────────────────────────────┐
│ 📦 Fabric Research    [−]  │
├────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐│
│ │Item 1│ │Item 2│ │Item 3││
│ └──────┘ └──────┘ └──────┘│
│ ┌──────┐                  │
│ │Item 4│                  │
│ └──────┘                  │
└────────────────────────────┘
```

**Pile Actions**:
- **Collapse/Expand**: Click pile header
- **Move all to character**: Drag pile onto character node
- **Link to character(s)**: Right-click → "Link to..."
- **Explode pile**: Right-click → "Ungroup" (items return to loose state)
- **Color code**: Assign color to pile for visual organization

#### Progress Tracking with Tabs

**Use Case**: Track costume iterations over time

```
Character: Asuka - EVA Plugsuit
├─ Tab: "All Shared" (reference materials)
├─ Tab: "First Try" ❌
│  ├─ Photos of first attempt
│  ├─ Notes: "Fabric too thin"
│  ├─ Cost: $120
│  └─ Lessons learned
│
├─ Tab: "Second Try" ⚠️
│  ├─ Photos of second attempt  
│  ├─ Notes: "Better fabric, wrong color"
│  ├─ Cost: $150
│  └─ Improvements needed
│
└─ Tab: "Final Version" ✅
   ├─ Photos of final costume
   ├─ Notes: "Perfect!"
   ├─ Total cost: $180
   └─ Convention photos
```

**Tab Naming is Flexible**:
- "v1", "v2", "v3" (version numbers)
- "Draft", "Prototype", "Final" (stage names)
- "Attempt 1", "Attempt 2" (iteration tracking)
- "Concept A", "Concept B" (design variations)
- **User defines the workflow that fits their process**

**Progress Indicators** (optional):
```
Tabs with status:
[All] [First Try ❌] [Second Try ⚠️] [Final ✅] [+]

Or with dates:
[All] [March 1] [March 15] [April 2 - Final] [+]

Or with budget:
[All] [Cheap $50] [Better $120] [Pro $200] [+]
```

#### Use Cases

**Use Case 1: Single Character, Multiple Variations**:
```
Main Canvas:
├─ Character: Asuka
│  ├─ All Shared (character references, wigs)
│  ├─ EVA Plugsuit
│  ├─ School Uniform
│  └─ Casual Outfit
└─ General Resources (event info, budget overview)
```

```
Main Canvas (overview):
├─ 📦 "Shared Materials" pile
│  ├─ Black Fabric → 👤 Tanjiro, Inosuke
│  └─ Wooden Swords → 👤 All 3
│
├─ 📦 "Individual Items" pile
│  ├─ Checkered Haori → 👤 Tanjiro
│  └─ Boar Mask → 👤 Inosuke
│
├─ 🌐 Convention Info (general)
│
├─ Character: Tanjiro
│  └─ Default Outfit tab
│
├─ Character: Inosuke
│  └─ Boar Outfit tab
│
└─ Character: Zenitsu
   └─ Default Outfit tab

Workflow:
1. Organize shared materials in piles
2. Link to relevant characters
3. Each character dives into their specific planning
4. Main canvas shows overview of who needs what
```

**Use Case 4: Brainstorming Mode (Loose Organization)**:
```
Main Canvas (messy working table):
├─ [Random inspiration images scattered]
├─ [Links from Instagram/TikTok]
├─ [Quick notes and ideas]
├─ 📦 Small pile forming: "Red Fabric Ideas"
└─ 📦 Small pile forming: "Wig Tutorials"

No characters yet, just collecting and organizing

Later: Create character nodes and move items in
```

**Use Case 5: Simple Idea (No Character Organization)**:
```
Main Canvas:
├─ 📦 Piles for organization (optional)
├─ 📝 Loose notes and images
└─ No character nodes needed
   
Simple cosplays don't need the nested structure
Everything stays on main canvas with optional piles
```

**Use Case 6: Mixed Workflow (Flexible)**:
```
Main Canvas:
├─ 📦 "Still Deciding" pile (items being evaluated)
├─ 📦 "Shared Budget" pile → linked to multiple chars
├─ 📝 Loose quick captures
│
├─ Character: Asuka (using variations)
│  ├─ EVA Plugsuit
│  └─ School Uniform
│
└─ Character: Rei (using progress tracking)
   ├─ First Try
   └─ Second Try

Different characters can use tabs differently!
```

**Real-World Example (Demon Slayer Group)**:
```
Main Canvas:
├─ 💰 Black fabric for pants - $30
│  👤 Tanjiro 👤 Inosuke (both need)
│
├─ 💰 Wooden training swords - $45
│  👤 All 3 characters (everyone needs)
│
├─ 🎨 Checkered haori fabric - $25
│  👤 Tanjiro (unique to him)
│
├─ 🐗 Boar mask materials - $35
│  👤 Inosuke (unique to him)
│
└─ 📋 Convention booth reservation
   🌐 General (not character-specific)

Benefits:
✅ Black fabric budget shared (not duplicated)
✅ Each character's unique items clearly marked
✅ General resources stay separate
✅ Easy to see what's shared vs. unique
```

### Implementation Details

**Navigation State**:
```typescript
type CanvasView = 
  | { layer: 'main' }
  | { 
      layer: 'character', 
      characterNodeId: string,
      activeTab: 'shared' | string  // 'shared' or option_id
    };

// Store navigation state
let currentView: CanvasView = { layer: 'main' };

// Navigate to character canvas
function openCharacterCanvas(characterNodeId: string) {
  currentView = {
    layer: 'character',
    characterNodeId,
    activeTab: 'shared'  // Default to "All Shared" tab
  };
  
  // Update URL
  router.push(`/ideas/${ideaId}/moodboard/character/${characterNodeId}`);
  
  renderCanvas();
}

// Switch tabs within character canvas
function switchTab(tabId: 'shared' | string) {
  if (currentView.layer === 'character') {
    currentView.activeTab = tabId;
    renderCanvas();
  }
}

// Navigate back to main canvas
function backToMain() {
  currentView = { layer: 'main' };
  router.push(`/ideas/${ideaId}/moodboard`);
  renderCanvas();
}
```

**Rendering Logic**:
```typescript
async function renderCanvas() {
  if (currentView.layer === 'main') {
    // Show main canvas
    const nodes = await getMainCanvasNodes();  // scope = 'main'
    const characterNodes = await getCharacterNodes();
    renderMainCanvas(nodes, characterNodes);
    
  } else if (currentView.layer === 'character') {
    const { characterNodeId, activeTab } = currentView;
    
    if (activeTab === 'shared') {
      // Show "All Shared" tab
      const sharedNodes = await getSharedNodes(characterNodeId);
      renderCharacterCanvas(sharedNodes, characterNodeId);
      
    } else {
      // Show specific variation tab
      const variationNodes = await getVariationNodes(activeTab);
      const sharedNodes = await getSharedNodes(characterNodeId);
      renderCharacterCanvas([...sharedNodes, ...variationNodes], characterNodeId);
    }
    
    // Render tab bar
    const tabs = await getCharacterTabs(characterNodeId);
    renderTabBar(tabs, activeTab);
  }
}
```

**Character Node Component**:
```svelte
<script>
  export let characterNode;
  
  async function handleClick() {
    await openCharacterCanvas(characterNode.id);
  }
</script>

<div 
  class="character-node"
  style="transform: translate({characterNode.canvas_x}px, {characterNode.canvas_y}px)"
  on:click={handleClick}
>
  <div class="icon">👤</div>
  <div class="name">{characterNode.name}</div>
  <div class="stats">
    {characterNode.variationCount} variations
    {characterNode.itemCount} items
  </div>
  <div class="action">Click to open →</div>
</div>
```

**Tab Bar Component**:
```svelte
<script>
  export let characterNodeId;
  export let activeTab;
  
  let tabs = [];
  
  onMount(async () => {
    tabs = [
      { id: 'shared', name: 'All Shared', icon: '🔗' },
      ...(await getVariationTabs(characterNodeId))
    ];
  });
</script>

<div class="tab-bar">
  {#each tabs as tab}
    <button
      class="tab"
      class:active={activeTab === tab.id}
      on:click={() => switchTab(tab.id)}
    >
      {#if tab.icon}{tab.icon}{/if}
      {tab.name}
    </button>
  {/each}
  
  <button class="new-tab" on:click={createNewVariation}>
    + New
  </button>
</div>
```

#### Automatic Connection Lines (via Character Links)

Character links can **automatically create visual connections** on the canvas, eliminating the need for manual edge drawing.

**Visual Connections on Main Canvas**:
```
Main Canvas view with connections:

┌────────────────────────────────────────────┐
│                                            │
│  ┌──────────────┐                          │
│  │ 👤 Tanjiro   │                          │
│  │              │                          │
│  └──────────────┘                          │
│         │ ╲                                │
│         │   ╲                              │
│         │     ╲                            │
│         ▼       ▼                          │
│  ┌──────────┐  ┌──────────┐              │
│  │ Black    │  │Checkered │              │
│  │ Fabric   │  │ Haori    │              │
│  └──────────┘  └──────────┘              │
│         │                                  │
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │ 👤 Inosuke   │                          │
│  │              │                          │
│  └──────────────┘                          │
│                                            │
└────────────────────────────────────────────┘

Connections show:
• Tanjiro → Black Fabric (linked)
• Tanjiro → Checkered Haori (linked)
• Inosuke → Black Fabric (linked)
```

**Two Ways to Connect**:

**Method 1: Drag Connection (Manual)**
```
Traditional approach:
1. Click character node
2. Drag from connection handle
3. Drop on resource
4. Creates link automatically
```

**Method 2: Edit Resource (Menu-driven)**
```
Right-click resource → "Manage Character Links"
☑ Tanjiro
☑ Inosuke
☐ Zenitsu

Connections appear automatically
```

**Connection Types**:

```
┌────────────────────────────────────┐
│ Connection Types (visual styles): │
├────────────────────────────────────┤
│                                    │
│ Character → Resource:              │
│ ────────▶  (Solid line)            │
│                                    │
│ Character → Character:             │
│ ─ ─ ─ ─ ▶  (Dashed line)           │
│ (Optional: for coordination)       │
│                                    │
│ Resource → Resource:               │
│ ········▶  (Dotted line)           │
│ (Manual connections)               │
│                                    │
└────────────────────────────────────┘
```

**Smart Connection Features**:

**Auto-Layout** (optional):
```
Toggle: [⚡ Smart Layout]

When enabled:
• Character nodes cluster together
• Shared resources positioned between linked characters
• Connections optimize to avoid crossing
• User can still manually adjust positions
```

**Connection Highlighting**:
```
Hover over character node:
• Highlights all linked resources
• Dims unrelated items
• Shows connection lines

Hover over resource:
• Highlights all linked characters
• Shows "Used by: Tanjiro, Inosuke"
```

**Filter by Connections**:
```
Toolbar: [Show: All ▼]

Options:
• All items
• Connected to Tanjiro
• Connected to Inosuke
• Shared resources (2+ characters)
• Unconnected items
• General resources
```

**Connection Panel** (optional sidebar):
```
┌────────────────────────────┐
│ Connections                │
├────────────────────────────┤
│ 👤 Tanjiro (3 resources)   │
│ ├─ Black Fabric            │
│ ├─ Checkered Haori         │
│ └─ Wooden Swords           │
│                            │
│ 👤 Inosuke (2 resources)   │
│ ├─ Black Fabric            │
│ └─ Wooden Swords           │
│                            │
│ 🌐 General (2 items)       │
│ ├─ Convention Info         │
│ └─ Budget Overview         │
│                            │
│ ⚠️ Unconnected (1 item)    │
│ └─ Random note             │
└────────────────────────────┘

Click any item → jumps to it on canvas
```

**Benefits Over Manual Edges**:

1. **Semantic Meaning**: Connections represent actual relationships (this resource is FOR this character)
2. **Automatic**: No need to manually draw lines
3. **Persistent**: Connections stay even when moving nodes around
4. **Queryable**: Can filter/search by connections
5. **Less Clutter**: Only show connections when needed (hover, filter, etc.)
6. **Bidirectional**: Easy to see "what needs this?" and "what does this need?"

**Mixed Approach** (recommended):

Users can use **both** systems:
- **Character links**: For functional relationships (this resource belongs to this character)
- **Manual edges**: For visual organization (this goes with that, workflow arrows, notes)

```
Example:
Character Link: Tanjiro → Black Fabric (solid line, auto-managed)
Manual Edge: Black Fabric → Pattern Tutorial (dotted line, user draws)
```

### References Needed:
- [ ] Unreal Engine Blueprints: Nested graph navigation + node connections
- [ ] Houdini: Node networks with sub-networks
- [ ] Blender: Node groups and sub-graphs + shader connections
- [ ] Notion: Nested pages and databases + relations
- [ ] Figma: Frames and components hierarchy + constraints
- [ ] Obsidian: Graph view with automatic connections from links

---

## 5. Comments System (Revised)

### Original Recommendation
Approach B: General Comments (blog-style)

### User Feedback
> "This is better ux and easier to keep converstions contained but a lot of all conversations could be useful to review all comments."

### Revised Approach: Inline Comments + Overview Panel ✅

#### Inline Comments (Primary UX)

**On Canvas** (comment on specific nodes):
```
┌────────────────────────────────────────────┐
│                                            │
│  ┌──────────────────┐                      │
│  │ [Image]          │  💬 2                │ ← Comment badge
│  │                  │                      │
│  │ Red wig ref      │                      │
│  └──────────────────┘                      │
│                                            │
│  ┌──────────────────┐                      │
│  │ [Link]           │  💬 1                │
│  │                  │                      │
│  │ Fabric tutorial  │                      │
│  └──────────────────┘                      │
│                                            │
└────────────────────────────────────────────┘

Click 💬 badge or node:
```

**Comment Thread (Drawer)**:
```
┌────────────────────────────────────────────┐
│ Comments on "Red wig reference"      [✕]   │
├────────────────────────────────────────────┤
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [Avatar] @friend_1          3h ago     │ │
│ │                                        │ │
│ │ This shade looks perfect! Where did    │ │
│ │ you find it?                           │ │
│ │                                        │ │
│ │ [👍 2]  [Reply]                        │ │
│ │                                        │ │
│ │   ┌──────────────────────────────────┐ │ │
│ │   │ [Avatar] @you         2h ago     │ │ │
│ │   │                                  │ │ │
│ │   │ Found it on Amazon! Link:        │ │ │
│ │   │ [amazon.com/...]                 │ │ │
│ │   │                                  │ │ │
│ │   │ [👍 1]                           │ │ │
│ │   └──────────────────────────────────┘ │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [Avatar] @friend_2          1h ago     │ │
│ │                                        │ │
│ │ Have you considered a darker red? It   │ │
│ │ might match the plugsuit better.       │ │
│ │                                        │ │
│ │ [👍]  [Reply]                          │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ──────────────────────────────────────────│
│                                            │
│ [Sign in with Google to reply]            │
│                                            │
└────────────────────────────────────────────┘
```

#### Overview Panel (Secondary UX)

**Global Comment View** (see all conversations):
```
Toolbar button: [💬 5]  ← Click to open overview
                 ↑
              Total comment count

Overview Panel (drawer from right):

┌────────────────────────────────────────────┐
│ All Comments                          [✕]  │
├────────────────────────────────────────────┤
│ [By Node ▼] [Newest First ▼]              │
├────────────────────────────────────────────┤
│                                            │
│ 💬 Red wig reference (2 comments)          │
│ ├─ @friend_1: "This shade looks..."       │
│ │  └─ @you: "Found it on Amazon..."       │
│ └─ @friend_2: "Have you considered..."    │
│    [View conversation →]                   │
│                                            │
│ 💬 Fabric tutorial (1 comment)             │
│ └─ @friend_1: "Great find! This..."       │
│    [View conversation →]                   │
│                                            │
│ 💬 General (3 comments)                    │
│ ├─ @friend_2: "Loving the progress..."    │
│ ├─ @friend_1: "Can't wait to see..."      │
│ └─ @you: "Thanks everyone!"               │
│    [View conversation →]                   │
│                                            │
└────────────────────────────────────────────┘
```

**Filter/Sort Options**:
```
Sort by:
• Newest first
• Oldest first
• Most active
• Your comments
• Unread (for owner)

Group by:
• Node (as shown)
• Commenter
• Date
• No grouping (flat list)
```

#### Adding Comments

**On Canvas** (add comment to node):
```
Right-click node → "Add comment"

OR

Click node → Comment icon in node toolbar

┌────────────────────────────────────────────┐
│ [Image]                                    │
│ Red wig reference                          │
│ ────────────────────────────────────────   │
│ [💬 Add Comment] [🔗 Copy Link] [✏️ Edit]  │
└────────────────────────────────────────────┘
     ↑ Click to open comment drawer
```

**General Comments** (not tied to node):
```
Bottom of moodboard:

──────────────────────────────────────────────
💬 General Comments (3)

┌────────────────────────────────────────────┐
│ @friend_2: "Loving the overall direction!" │
│ 2 hours ago                                │
│ [👍 1] [Reply]                             │
└────────────────────────────────────────────┘

[Add general comment...]
```

#### Comment Notifications

**For Moodboard Owner**:
```
Notification badge:

[💬 5] → [💬 5 🔴]
          ↑ Red dot = unread

Hover:
┌─────────────────────┐
│ 3 new comments      │
│ • @friend_1 (2)     │
│ • @friend_2 (1)     │
└─────────────────────┘
```

**Email Digest** (optional, for owner):
```
Subject: 3 new comments on "Asuka Cosplay"

New comments on your moodboard:

1. @friend_1 on "Red wig reference":
   "This shade looks perfect! Where did you find it?"
   
2. @friend_1 on "Fabric tutorial":
   "Great find! This will be helpful."

3. @friend_2 (general):
   "Loving the progress! Keep it up!"

[View all comments]
```

#### Mobile Experience

**On Mobile Canvas**:
```
┌────────────────────────────────┐
│ [Image]         💬 2           │ ← Comment count visible
│                                │
│ Red wig ref                    │
└────────────────────────────────┘
     ↑ Tap to open full-screen comment view
```

**Mobile Comment View** (full-screen):
```
┌────────────────────────────────┐
│ ← Back    Comments (2)         │
├────────────────────────────────┤
│ On: Red wig reference          │
│                                │
│ @friend_1  3h ago              │
│ This shade looks perfect!      │
│ Where did you find it?         │
│ [Reply] [👍 2]                 │
│                                │
│   └─ @you  2h ago              │
│      Found it on Amazon!       │
│      [amazon.com/...]          │
│      [👍 1]                    │
│                                │
│ @friend_2  1h ago              │
│ Have you considered a          │
│ darker red?                    │
│ [Reply] [👍]                   │
│                                │
│ [Add your reply...]            │
└────────────────────────────────┘
```

#### Visual Indicators

**Node with Comments**:
```
Canvas node with comments has subtle glow:

┌──────────────────┐
│ [Image]          │ ← Blue glow/border
│                  │
│ Red wig ref  💬 2│
└──────────────────┘
    ↑ Badge shows count
```

**Unread Comments** (for owner):
```
┌──────────────────┐
│ [Image]          │ ← Orange glow (unread)
│                  │
│ Red wig ref  💬 2│ ← Badge is orange
└──────────────────┘   (new comments)
```

### Implementation Details

**Comment Data Model**:
```typescript
interface Comment {
  id: string;
  moodboard_share_id: string;
  node_id: string | null;  // null = general comment
  user_id: string;  // OAuth user
  user_name: string;
  user_avatar: string;
  content: string;
  parent_comment_id: string | null;  // for replies
  created_at: Date;
  updated_at: Date;
  reactions: {
    thumbsup: string[];  // array of user IDs who reacted
  };
}

// Query: Get all comments for a moodboard
const comments = await db.moodboard_comments
  .where({ moodboard_share_id })
  .orderBy('created_at', 'desc');

// Query: Get comments for specific node
const nodeComments = await db.moodboard_comments
  .where({ moodboard_share_id, node_id })
  .orderBy('created_at', 'asc');  // Chronological for threads
```

**Real-time Updates**:
```typescript
// Supabase real-time subscription
const commentsSubscription = supabase
  .channel('moodboard_comments')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'moodboard_comments',
      filter: `moodboard_share_id=eq.${shareId}`
    }, 
    (payload) => {
      // Add new comment to UI
      addCommentToUI(payload.new);
      
      // Show notification if not from current user
      if (payload.new.user_id !== currentUserId) {
        showNotification('New comment');
      }
    }
  )
  .subscribe();
```

**Comment Threading** (1 level only):
```svelte
{#each comments as comment}
  <Comment 
    data={comment}
    on:reply={(e) => handleReply(comment.id, e.detail)}
  >
    {#if comment.replies?.length > 0}
      <div class="replies">
        {#each comment.replies as reply}
          <Comment data={reply} isReply={true} />
        {/each}
      </div>
    {/if}
  </Comment>
{/each}
```

### References Needed:
- [ ] Google Docs: Inline comments and suggestions
- [ ] Figma: Comment threads on specific elements
- [ ] Notion: Page comments vs inline comments
- [ ] GitHub: PR comments on specific lines
- [ ] Medium: Article highlights and comments

---

## Summary of Revisions

All 5 components have been redesigned based on your feedback:

1. ✅ **Node Creation**: Obsidian-style bottom toolbar with tap-and-hold menus
2. ✅ **Canvas Controls**: Auto-hide contextual controls with hotkey hints
3. ✅ **List View**: Adaptive density (compact/comfortable/detailed) with nested cards
4. ✅ **Option Tabs**: Character nodes as hubs with sub-canvas navigation
5. ✅ **Comments System**: Inline comments per node + overview panel

## Next Steps

1. **Review these revisions** - Do they match your vision?
2. **Collect references** - Screenshots of Obsidian, Unreal blueprints, etc.
3. **Update tasks.md** - Break down implementation tasks
4. **Begin prototyping** - Start with core canvas + bottom toolbar

Would you like me to:
- **Further refine any of these designs?**
- **Create detailed component specs for implementation?**
- **Start collecting UI references for these patterns?**
- **Update the tasks.md file with these new designs?**


---

## 🎯 Progressive Disclosure: Simple by Default

**CRITICAL INSIGHT**: Most users will have simple needs!
- Single cosplay for one event
- Quick inspiration capture  
- Basic planning

**The system must NOT overwhelm simple use cases!**

### Simple Use Case: Single Cosplay

**What the user sees**:
```
[All] tab only
  └─ Just their canvas with inspiration items
  └─ No character tabs visible
  └─ No nested complexity
  └─ Just drag, drop, organize
```

**When they DON'T need characters**:
- Skip character tabs entirely
- Everything stays on "All" tab
- Piles for organization (optional)
- Direct, simple workflow

### Progressive Complexity Levels

**User adds complexity incrementally as needed**:

**Level 1: Single simple cosplay**
```
[All] tab only
- Items on canvas (images, links, notes, sketches)
- No nesting required
- Quick and simple
```

**Level 2: Multiple ideas for one event (deciding which to do)**
```
[All] tab
  ├─ 📦 Pile: "Idea 1: Asuka"
  ├─ 📦 Pile: "Idea 2: Rei"  
  └─ 📦 Pile: "Idea 3: Misato"
  
Still on one canvas
Use piles to separate options
No character tabs yet
Decide later which to pursue
```

**Level 3: Decided on one, exploring variations**
```
[All] [Asuka] tabs appear
  
Asuka tab has:
  [All Shared] [Plugsuit] [School]
  
Character tabs + variations
```

**Level 4: Group cosplay (full complexity)**
```
[All] [Asuka] [Rei] [Misato] tabs
  
Each character has variations
Shared resources on All tab
Full power when needed
```

### Quick Capture: Inspiration Moments

**Users need to capture ideas INSTANTLY**:

**⚡ Quick Add Button** (always visible, prominent):
```
Click [⚡ Quick Add]

Opens quick menu:
┌──────────────────────┐
│ 📸 Take Photo        │ ← Camera (mobile)
│ 🖼️  Choose Image      │ ← Gallery
│ 🔗 Paste Link        │ ← Instagram/TikTok URL
│ ✏️  Quick Sketch      │ ← NEW: Drawing canvas
│ 📝 Quick Note        │ ← Text note
│ 🎙️  Voice Note (β)   │ ← Audio (mobile, future)
└──────────────────────┘

One tap/click → immediate capture
Organize later
```

### NEW Node Type: Sketch ✏️

**Quick hand-drawn inspiration**:

```
Sketch Node on canvas:
┌─────────────────────┐
│ ✏️  Sketch          │
│ ─────────────────   │
│ [Hand-drawn image]  │
│                     │
│                     │
│ "Jacket back detail"│
└─────────────────────┘

Click to open drawing interface
```

**Drawing Interface**:
```
┌────────────────────────────────────┐
│ Drawing Canvas                [✕]  │
├────────────────────────────────────┤
│ Tools:                             │
│ [✏️ Pen] [🖍️ Marker] [⬜ Eraser]  │
│ [⟲ Undo] [⟳ Redo] [🗑️ Clear]     │
│                                    │
│ Colors:                            │
│ ⚫ ⚪ 🔴 🟠 🟡 🟢 🔵 🟣 🟤         │
│                                    │
│ Thickness: [═══●═════]             │
│                                    │
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ │   [Drawing area]               │ │
│ │                                │ │
│ │                                │ │
│ │                                │ │
│ │                                │ │
│ └────────────────────────────────┘ │
│                                    │
│ Templates: [Blank] [Figure] [Grid] │
│                                    │
│ [Cancel]  [Save Sketch]            │
└────────────────────────────────────┘
```

**Sketch Features**:
- **Simple tools**: Pen, marker, eraser
- **Basic colors**: Common palette
- **Undo/redo**: Essential for drawing
- **Templates**: 
  - Blank canvas
  - Human figure outline (for costume design)
  - Grid paper (for patterns)
- **Mobile optimized**: Touch drawing, finger or stylus
- **Pressure sensitivity**: If device supports (iPad, stylus)
- **Export**: Save as PNG

**Sketch Use Cases**:
- ✅ Quick costume idea while brainstorming
- ✅ Sketch pattern pieces
- ✅ Draw construction details
- ✅ Annotate poses
- ✅ Note alterations/modifications
- ✅ Capture inspiration on-the-go

**Image Annotation** (future enhancement):
```
Open existing image → Add markup layer
- Draw arrows, circles, highlights
- Add text annotations
- Mark measurements
```

### Mobile-First Quick Capture Flow

**Real scenario**: User at convention, sees amazing cosplay

```
Mobile Flow:
1. Pull out phone
2. Open Cosplans app (PWA)
3. Tap [⚡ Quick Add]
4. Choose "Take Photo" or "Quick Sketch"
5. Capture inspiration
6. Auto-saves to "All" tab
7. Organize later at home

Total time: < 10 seconds
```

**Voice Notes** (future feature):
```
🎙️  "Remember to check fabric store for red satin in stock"
→ Transcribed to text note automatically
→ Appears on canvas
→ Can be converted to budget item later
```

### Progressive Feature Discovery

**Features reveal themselves when needed**:

1. **Start**: Just "All" tab + quick add button (minimal)
2. **3+ items**: "Create Pile" suggestion appears
3. **Organizing by person**: "Convert to Character Tab" option
4. **In character tab**: "Add Variation" button appears
5. **Budget item + characters**: "Link to Characters" appears

**Smart Defaults**:
- New users see simple interface
- Features unlock progressively
- Never force complexity upfront
- Tooltips explain new features
- "Learn more" links for advanced features

### Onboarding for Different User Types

**First-time user**:
```
Welcome screen:
"What are you planning?"
○ Single cosplay for an event
○ Multiple character ideas (deciding)
○ Group cosplay project

Based on selection, show appropriate UI complexity
```

**Single cosplay** → Start with just "All" tab
**Multiple ideas** → Show how to use piles
**Group project** → Show character tabs

### Examples by Complexity Level

**Example 1: Simple (Sarah - First cosplay)**
```
Sarah's "Sailor Moon" idea:

[All] tab
├─ Photo of Sailor Moon
├─ Sketch of bow design
├─ Link to wig tutorial
├─ Budget note: "$80"
└─ Fabric swatch image

No tabs, no nesting, just inspiration
Perfect for her needs
```

**Example 2: Medium (Alex - Deciding between characters)**
```
Alex's "Anime Expo 2026" idea:

[All] tab
├─ 📦 Pile: "Asuka option" (5 items)
├─ 📦 Pile: "Rei option" (3 items)
├─ 📦 Pile: "Misato option" (4 items)
└─ Budget comparison spreadsheet

Using piles to organize options
Still on one tab
Will decide which to pursue
```

**Example 3: Complex (Team - Group cosplay)**
```
Team's "Demon Slayer Group" idea:

[All] [Tanjiro] [Inosuke] [Zenitsu] tabs

All tab:
├─ Shared materials (black fabric, swords)
├─ Convention planning notes
└─ Group photo refs

Each character tab:
├─ Character-specific items
└─ Variations if needed

Full feature set for complex coordination
```

### Quick Capture Priority

**Speed is critical for inspiration capture**:

**Desktop**: `Cmd/Ctrl + K` → Quick add menu
**Mobile**: ⚡ button always visible in bottom toolbar
**PWA**: Share from Instagram → Quick capture flow

**Friction = Lost inspiration**
- Every extra click = more chance user abandons capture
- Must be faster than taking a screenshot
- Must work offline (PWA)

---

## Implementation Priority (Updated)

Based on progressive disclosure principle:

**Phase 1 - Simple Core** (MVP):
1. "All" tab canvas (infinite, pan/zoom)
2. Quick add button (image, link, note, sketch)
3. Piles (create, organize, collapse/expand)
4. Basic connections (drag-and-drop linking)

**Phase 2 - Scaling Up**:
1. Character tabs (when needed)
2. Multi-character resource linking
3. PWA share target
4. Mobile bottom toolbar

**Phase 3 - Advanced**:
1. Variation tabs (sub-navigation)
2. Progress tracking
3. Voice notes
4. Advanced drawing tools
5. Image annotation

**Philosophy**: Start simple, earn complexity
