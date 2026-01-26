# Canvas Node Design System

**Context:** Freeform 2D canvas (Svelte Flow)  
**Philosophy:** Compact, scannable, distinct by content type  
**Date:** 2026-01-24

---

## Key Differences: Canvas Nodes vs Gallery Cards

| Aspect | Gallery Cards | Canvas Nodes |
|--------|--------------|--------------|
| **Layout** | Grid-based, responsive | Freeform positioning |
| **Size Control** | User resizes within grid | Fixed sizes per type |
| **Information** | More detailed, expandable | Essential info only |
| **Interaction** | Click to open, hover for actions | Drag to move, click to select |
| **Visual Weight** | Varies (S/M/W/T/L) | Consistent, compact |
| **Purpose** | Browse/explore content | Organize/connect ideas |
| **Density** | Lower (more space) | Higher (more nodes visible) |

---

## Canvas Node Design Principles

### 1. **Compact & Scannable**
- Show only essential information
- User should understand node type at a glance
- Minimize text, maximize icons/visual cues

### 2. **Content-Type Distinction**
- Each type has unique shape/aspect ratio
- Color coding only where necessary (platform badges)
- Consistent design language across all types

### 3. **Touch-Friendly**
- Minimum 48x48px touch target (mobile)
- Clear grab areas for dragging
- Adequate spacing for connections (future)

### 4. **Performance-Optimized**
- Simple DOM structure
- Minimal images/media on canvas
- Lazy load content when zoomed in

---

## Fixed Node Sizes by Content Type

Unlike gallery cards, canvas nodes have **fixed sizes** optimized for canvas density:

### Visual Content Nodes

#### Image Node
**Size:** 120w × 160h (portrait)  
**Shows:**
- Thumbnail image (full bleed)
- Small title overlay (bottom)
- Type indicator (top-left corner)

```
┌──────────────┐
│ [img]    [📷]│ ← Type icon
│              │
│   [IMAGE]    │ ← Thumbnail
│              │
│              │
│──────────────│
│ Title        │ ← Title overlay
└──────────────┘
```

---

#### Instagram/TikTok Post Node
**Size:** 140w × 200h (tall portrait)  
**Shows:**
- Platform badge (top)
- Preview image
- Creator handle
- Title/caption (truncated)

```
┌──────────────┐
│ [@] Username │ ← Platform + handle
├──────────────┤
│              │
│   [PREVIEW]  │ ← Post image/video
│              │
│              │
├──────────────┤
│ Caption text │ ← Truncated
│ truncated... │
└──────────────┘
```

**Badge Colors:**
- Instagram: Pink gradient (#E1306C → #FD1D1D)
- TikTok: Black with cyan accent
- YouTube: Red (#FF0000)

---

#### YouTube Video Node
**Size:** 200w × 120h (landscape)  
**Shows:**
- Video thumbnail
- Play button overlay
- Title (1 line)
- Duration badge

```
┌────────────────────────┐
│                     [▶]│ ← Play button
│   [VIDEO THUMBNAIL]    │
│                        │
│            [3:45] ←────┤ Duration
├────────────────────────┤
│ Video Title Here       │
└────────────────────────┘
```

---

### Organizational Nodes

#### Container Node (Character, Group, etc.)
**Size:** 160w × 120h (landscape)  
**Shows:**
- Container icon (left)
- Title
- Child count
- Preview thumbnails (3 max)

```
┌────────────────────────┐
│ [👤]  Character Name   │ ← Icon + title
│                        │
│ 8 items                │ ← Count
│ [🖼][🎨][📝]           │ ← Preview thumbs
└────────────────────────┘
```

**Container Types:**
- Character: 👤 icon
- Group: 📁 icon  
- Option: 🔀 icon
- Prop: 📦 icon
- Moodboard Link: 🔗 icon

---

### Data-Rich Nodes

#### Color Palette Node
**Size:** 180w × 80h (landscape strip)  
**Shows:**
- 5-6 color swatches (horizontal)
- Hex codes on hover
- Palette name

```
┌────────────────────────┐
│ [■][■][■][■][■][■]     │ ← Swatches
│ Palette Name           │
└────────────────────────┘
```

**Interaction:** Click swatch → copy hex to clipboard

---

#### Measurements Node
**Size:** 100w × 140h (compact portrait)  
**Shows:**
- Body/garment icon
- 3-4 key measurements
- Type indicator

```
┌──────────┐
│   [👕]   │ ← Icon (body/garment)
├──────────┤
│ Bust: 34"│
│ Waist:28"│
│ Hips: 36"│
│ +2 more  │
└──────────┘
```

---

#### Fabric Swatch Node
**Size:** 120w × 120h (square)  
**Shows:**
- Fabric texture preview
- Material name
- Price/yard

```
┌────────────┐
│            │
│ [TEXTURE]  │ ← Fabric image
│            │
├────────────┤
│ Silk       │
│ $25/yd     │
└────────────┘
```

---

### Simple Nodes

#### Note Node
**Size:** 100w × 100h (square sticky note)  
**Shows:**
- Note text (truncated)
- Subtle color tint (yellow/blue/pink)

```
┌──────────┐
│ ✏️       │ ← Icon
│          │
│ Note     │ ← Text
│ content  │   (3-4 lines)
│ here...  │
└──────────┘
```

**Color Tints:**
- Default: Soft yellow (#FFF8DC)
- Important: Soft red (#FFE4E1)
- Info: Soft blue (#E6F3FF)

---

#### Budget Item Node
**Size:** 100w × 80h (compact horizontal)  
**Shows:**
- 💰 icon
- Item name
- Cost

```
┌────────────┐
│ 💰 $45.99  │ ← Cost prominent
│ Wig        │ ← Item name
└────────────┘
```

---

#### Contact Node
**Size:** 100w × 100h (square)  
**Shows:**
- Avatar/photo (or placeholder)
- Name
- Role badge

```
┌──────────┐
│   [👤]   │ ← Avatar
├──────────┤
│ John Doe │
│ Vendor   │ ← Role
└──────────┘
```

---

## Node States & Interactions

### Selection State
```css
.node.selected {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.15);
}
```

### Hover State
```css
.node:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 10;
}
```

### Dragging State
```css
.node.dragging {
  opacity: 0.7;
  cursor: grabbing;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}
```

### Connection Points (Future)
```
┌──────────────┐
◯              ◯  ← 4 connection points
│              │    (top, right, bottom, left)
│     NODE     │
│              │
◯              ◯
└──────────────┘
```

---

## Node Expansion Behavior

### Collapsed (Default)
All nodes start in **collapsed** state showing essential info only.

### Expanded (On Click/Double-Click)
```
Collapsed (120x160)  →  Expanded (240x320)
┌──────────┐            ┌────────────────────┐
│          │            │                    │
│ [IMAGE]  │    →       │   [LARGER IMAGE]   │
│          │            │                    │
│ Title    │            │ Full Title         │
└──────────┘            │ Description        │
                        │ Tags: #tag #tag    │
                        │ [View Details] →   │
                        └────────────────────┘
```

**Expansion Rules:**
- **Single-click:** Select node
- **Double-click:** Expand node (2x size)
- **Click background:** Collapse all
- **Escape key:** Collapse selected

**Exception:** Notes can expand dynamically based on content length

---

## Performance Optimizations

### Virtual Canvas
When zoomed out:
- Show simplified node versions (icons only)
- Lazy load images
- Reduce shadow quality

When zoomed in:
- Show full node details
- Load high-res images
- Enhanced shadows/effects

### Rendering Strategy
```javascript
// Pseudo-code
if (zoom < 50%) {
  renderSimplifiedNodes(); // Icons + title
} else if (zoom < 100%) {
  renderStandardNodes(); // Current design
} else {
  renderDetailedNodes(); // Extra metadata
}
```

---

## Mobile Canvas Adaptations

### Touch Targets
- Minimum node size: 100x100px
- Minimum spacing: 32px between nodes
- Large drag handles (16x16px)

### Gestures
- **Tap:** Select node
- **Double-tap:** Expand node
- **Long-press:** Show context menu
- **Pan:** Move canvas
- **Pinch:** Zoom canvas
- **Drag:** Move node

---

## Node Size Matrix

| Node Type | Width (px) | Height (px) | Aspect Ratio | Expandable |
|-----------|-----------|-------------|--------------|------------|
| Image | 120 | 160 | 3:4 (portrait) | Yes (2x) |
| Instagram/TikTok | 140 | 200 | ~7:10 (tall) | Yes (2x) |
| YouTube | 200 | 120 | 5:3 (landscape) | Yes (2x) |
| Container | 160 | 120 | 4:3 (landscape) | Yes (opens modal) |
| Color Palette | 180 | 80 | ~9:4 (wide strip) | No |
| Measurements | 100 | 140 | ~5:7 (portrait) | Yes (2x) |
| Fabric | 120 | 120 | 1:1 (square) | Yes (1.5x) |
| Note | 100 | 100 | 1:1 (square) | Yes (dynamic) |
| Budget | 100 | 80 | 5:4 (compact) | No |
| Contact | 100 | 100 | 1:1 (square) | Yes (shows details) |

---

## Visual Styling

### Base Node Styles
```css
.canvas-node {
  background: var(--node-bg);
  border: 1px solid var(--node-border);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: absolute;
}

/* Dark theme */
:root[data-theme="dark"] {
  --node-bg: #2A2A2A;
  --node-border: #404040;
}

/* Light theme */
:root[data-theme="light"] {
  --node-bg: #FFFFFF;
  --node-border: #E0E0E0;
}
```

### Type-Specific Accents
```css
/* Content nodes - blue accent */
.node.image,
.node.social-media {
  border-top: 3px solid #3B82F6;
}

/* Container nodes - purple accent */
.node.container {
  border-top: 3px solid #8B5CF6;
}

/* Data nodes - green accent */
.node.measurements,
.node.fabric,
.node.budget {
  border-top: 3px solid #10B981;
}

/* Notes - yellow accent */
.node.note {
  border-top: 3px solid #F59E0B;
  background: #FFFBEB; /* Slight yellow tint */
}
```

---

## Implementation Priority

### Phase 1: Core Nodes
1. Image node
2. Container node  
3. Note node
4. Social media nodes (Instagram, TikTok, YouTube)

### Phase 2: Data Nodes
5. Color palette
6. Measurements
7. Fabric swatch

### Phase 3: Utility Nodes
8. Budget items
9. Contacts
10. Links

### Phase 4: Advanced Features
- Node expansion
- Connection lines (if needed)
- Grouping/clustering
- Mini-map for navigation

---

## Comparison: Canvas vs Gallery

**When to use Canvas View:**
- Organizing thoughts spatially
- Creating mood/inspiration boards
- Connecting related items
- Brainstorming layouts

**When to use Gallery View:**
- Browsing all content
- Filtered searches
- Detailed card interactions
- Resizing/reorganizing cards

**Both views work with the same nodes** - just different presentations!

---

## Next Steps

1. Create Svelte components for each node type
2. Implement base canvas node wrapper
3. Add selection/hover states
4. Test on canvas with 50+ nodes
5. Optimize performance
6. Add expansion behavior
7. Polish animations

**Ready to start implementing or need more details on any specific node type?**
