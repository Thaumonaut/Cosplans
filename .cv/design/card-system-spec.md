# Moodboard Card Design System - Hybrid Grid with Smart Sizing

**Design Direction:** #3 (Hybrid Adaptive) with user-controlled card sizes  
**Philosophy:** Structured grid + content-aware constraints + user control  
**Date:** 2026-01-24

---

## Grid System Foundation

### Base Grid Units
The gallery uses a **12-column responsive grid** with three size classes:

| Size Class | Grid Units | Width | Height | Use Cases |
|-----------|-----------|-------|---------|-----------|
| **Small** | 1x1 | ~200px | ~200px | Notes, icons, compact data |
| **Medium** | 2x2 | ~416px | ~416px | Standard cards, most content |
| **Wide** | 4x2 | ~848px | ~416px | Color palettes, timelines, wide media |
| **Tall** | 2x4 | ~416px | ~848px | Social media posts, detailed info |
| **Large** | 4x4 | ~848px | ~848px | Featured content, hero images |

**Grid Gap:** 16px between cards  
**Responsive:** Columns collapse on mobile (12 → 6 → 3 → 1)

---

## Content-Type Size Rules

### 1. Image Nodes
**Allowed Sizes:** Small, Medium, Wide, Tall, Large  
**Default:** Medium  
**Minimum:** Small (thumbnail)  
**Constraints:** None - images are flexible

**Rationale:** Reference images should scale to show detail needed

---

### 2. Social Media Posts (Instagram, TikTok, YouTube)
**Allowed Sizes:** Medium (2x2), Tall (2x4), Large (4x4)  
**Default:** Tall (2x4) - matches mobile post aspect ratio  
**Minimum:** Medium (2x2) - maintains embed readability  
**Constraints:** 
- **Must be at least 2 units tall** - embeds need vertical space
- Cannot be Small (1x1) - too cramped
- Cannot be Wide-only (4x2) - wrong aspect ratio

**Rationale:** Social media is vertical-first, needs space for captions/metadata

**Example:**
```
✅ Tall (2x4) - Perfect for Instagram posts
✅ Large (4x4) - Great for featured content
✅ Medium (2x2) - Acceptable minimum
❌ Small (1x1) - Too small to be useful
❌ Wide (4x2) - Wrong aspect ratio
```

---

### 3. Link Previews
**Allowed Sizes:** Medium (2x2), Wide (4x2)  
**Default:** Medium (2x2)  
**Minimum:** Medium  
**Constraints:** 
- At least 2 units wide - needs space for metadata
- Maximum 2 units tall - link cards shouldn't dominate

**Rationale:** Link previews are landscape-oriented (OG images)

---

### 4. Notes
**Allowed Sizes:** ALL (Small, Medium, Wide, Tall, Large)  
**Default:** Small (1x1)  
**Minimum:** Small  
**Constraints:** None - most flexible

**Rationale:** Notes adapt to content length - quick notes stay small, detailed notes can expand

**Example:**
```
Small (1x1):   "Check this reference"
Medium (2x2):  "Character backstory: Lorem ipsum..."
Wide (4x2):    "Detailed construction notes with steps"
```

---

### 5. Color Palettes
**Allowed Sizes:** Wide (4x2), Medium (2x2)  
**Default:** Wide (4x2)  
**Minimum:** Medium (2x2)  
**Constraints:** 
- Prefer wide layouts - swatches displayed horizontally
- Cannot be Tall - wastes vertical space

**Rationale:** Colors are best viewed side-by-side horizontally

**Layout:**
```
Wide (4x2):    [■][■][■][■][■][■]  ← 6-8 swatches visible
Medium (2x2):  [■][■]
               [■][■]  ← 4 swatches in 2x2 grid
```

---

### 6. Measurements
**Allowed Sizes:** Small (1x1), Medium (2x2), Tall (2x4)  
**Default:** Medium (2x2)  
**Minimum:** Small - can show abbreviated data  
**Constraints:** 
- Tall option for detailed measurements (body, garment)
- No Wide - data is vertical list format

**Rationale:** Measurement lists are vertical, need height not width

**Example:**
```
Small (1x1):   Bust: 34"
               Waist: 28"

Medium (2x2):  Bust: 34"
               Waist: 28"
               Hips: 36"
               [+ 3 more]

Tall (2x4):    All 10 measurements
               with full labels
```

---

### 7. Fabric Swatches
**Allowed Sizes:** Small (1x1), Medium (2x2)  
**Default:** Medium (2x2)  
**Minimum:** Small  
**Constraints:** 
- Maximum Medium (2x2) - swatches don't need huge space
- Square only - shows texture best

**Rationale:** Fabric texture is square, price/metadata fits in footer

---

### 8. Budget Items
**Allowed Sizes:** Small (1x1), Medium (2x2)  
**Default:** Small (1x1)  
**Minimum:** Small  
**Constraints:** 
- Maximum Medium for detailed breakdown
- Square or portrait only

**Rationale:** Budget items are data-dense but compact

---

### 9. Contacts
**Allowed Sizes:** Small (1x1), Medium (2x2)  
**Default:** Small (1x1) - shows avatar + name  
**Minimum:** Small  
**Constraints:** 
- Maximum Medium for full contact card
- Square only

**Rationale:** Contact cards are square (avatar-centric)

---

### 10. Container Nodes (Character, Group, etc.)
**Allowed Sizes:** Medium (2x2), Wide (4x2), Large (4x4)  
**Default:** Medium (2x2)  
**Minimum:** Medium - needs space to show child count, preview  
**Constraints:** 
- Cannot be Small - need to show container info
- Large option for featured/important containers

**Rationale:** Containers need space to indicate they're special and show child preview

---

## User Controls for Resizing

### Resize UI Pattern

#### Option A: Corner Handle (Recommended)
```
┌─────────────────────────────┐
│                             │
│   Card Content              │
│                             │
│                             │
│                          [⋮⋮]│ ← Resize handle
└─────────────────────────────┘
```

**Behavior:**
- Hover card → resize handle appears in bottom-right
- Click + drag → resize to grid snap points
- Only allowed sizes show as snap points
- Invalid sizes are skipped

#### Option B: Context Menu
```
Right-click card → Resize submenu
  • Small (1x1)
  • Medium (2x2)   ✓ Current
  • Wide (4x2)     [grayed if not allowed]
  • Tall (2x4)
  • Large (4x4)
```

**Behavior:**
- Right-click → shows resize options
- Grayed out = not allowed for this content type
- Click → animated resize to new size

#### Option C: Quick Size Buttons (On select)
```
┌─────────────────────────────┐
│ [S] [M] [W] [T] [L]         │ ← Size selector bar
├─────────────────────────────┤
│   Card Content              │
│                             │
└─────────────────────────────┘
```

**Behavior:**
- Select card → size buttons appear in header
- Disabled buttons are grayed
- Click → instant resize

**Recommendation:** Combination of A + B
- Corner handle for quick drag resize
- Context menu for precise selection
- Keyboard shortcuts: `Cmd + [1-5]` for sizes

---

## Responsive Behavior

### Breakpoints
```css
/* Large desktop: 12 columns */
@media (min-width: 1440px) {
  Small:  1 col (120px)
  Medium: 2 col (256px)
  Wide:   4 col (528px)
}

/* Desktop: 12 columns */
@media (min-width: 1024px) {
  Small:  1 col (100px)
  Medium: 2 col (216px)
  Wide:   4 col (448px)
}

/* Tablet: 6 columns */
@media (min-width: 768px) {
  Small:  1 col → stays same
  Medium: 2 col → stays same
  Wide:   4 col → becomes 3 col
  Tall:   2 col → stays same
  Large:  4 col → becomes 3 col
}

/* Mobile: 2-3 columns */
@media (max-width: 767px) {
  All cards: Stack 2-3 wide
  Tall cards: Become 2-col
  Wide cards: Become full width
}
```

---

## Visual Design Specifications

### Card Anatomy (All Types)
```css
.card {
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  overflow: hidden;
  transition: all 0.2s ease;
}

.card:hover {
  border-color: var(--card-border-hover);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}
```

### Card Header (Optional - content-dependent)
```css
.card-header {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--card-header-bg);
  border-bottom: 1px solid var(--card-divider);
}

.card-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  border-radius: 6px;
}
```

### Card Content Area
```css
.card-content {
  padding: 16px;
  flex: 1;
  overflow: hidden;
}

/* Content-specific layouts */
.card-content.image {
  padding: 0; /* Full bleed */
}

.card-content.data {
  padding: 16px; /* Standard padding */
}
```

### Card Footer
```css
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--card-divider);
  background: var(--card-footer-bg);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.3;
}

.card-meta {
  font-size: 12px;
  color: var(--text-muted);
}
```

---

## Implementation Strategy

### Phase 1: Core Grid System
1. Implement CSS Grid with 12-column layout
2. Define 5 size classes (S, M, W, T, L)
3. Add responsive breakpoints
4. Create base card component

### Phase 2: Content-Type Cards
1. Create specialized layouts for each type
2. Implement size constraints per type
3. Add default sizes
4. Test each card type at all allowed sizes

### Phase 3: User Controls
1. Add resize handle to cards
2. Implement drag-to-resize
3. Add context menu resize option
4. Add keyboard shortcuts
5. Save size preferences per node

### Phase 4: Polish
1. Add resize animations
2. Refine hover states
3. Add loading states
4. Optimize performance (virtualization if needed)

---

## Size Constraint Reference Table

| Content Type | Small | Medium | Wide | Tall | Large | Default |
|-------------|-------|--------|------|------|-------|---------|
| Image | ✅ | ✅ | ✅ | ✅ | ✅ | Medium |
| Instagram | ❌ | ✅ | ❌ | ✅ | ✅ | Tall |
| TikTok | ❌ | ✅ | ❌ | ✅ | ✅ | Tall |
| YouTube | ❌ | ✅ | ✅ | ❌ | ✅ | Wide |
| Link Preview | ❌ | ✅ | ✅ | ❌ | ❌ | Medium |
| Note | ✅ | ✅ | ✅ | ✅ | ✅ | Small |
| Color Palette | ❌ | ✅ | ✅ | ❌ | ❌ | Wide |
| Measurements | ✅ | ✅ | ❌ | ✅ | ❌ | Medium |
| Fabric | ✅ | ✅ | ❌ | ❌ | ❌ | Medium |
| Budget | ✅ | ✅ | ❌ | ❌ | ❌ | Small |
| Contact | ✅ | ✅ | ❌ | ❌ | ❌ | Small |
| Container | ❌ | ✅ | ✅ | ❌ | ✅ | Medium |

**Legend:**  
✅ Allowed  
❌ Not allowed (grayed out in UI)

---

## Next Steps

1. **Generate detailed mockups** for each content type at allowed sizes
2. **Prototype resize interaction** - test drag vs menu vs buttons
3. **Create component library** - base Card + content-specific variants
4. **Implement in phases** - grid first, then cards, then resize controls

**Ready to generate detailed card mockups for specific content types?**
