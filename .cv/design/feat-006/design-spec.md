# FEAT-006: Brainstorming & Moodboard — Design Document

> **Status:** Approved
> **Version:** 3.0
> **Feature:** `.cv/spec/features/FEAT-006.md`
> **Created:** 2026-01-20
> **Last Updated:** 2026-01-21

---

# Architecture Overview (Revised 2026-01-21)

## Moodboard Hierarchy

Moodboards are **first-class entities** with a hierarchical ownership model:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERSONAL MOODBOARD (per user)                                              │
│  Route: /moodboard                                                          │
│  Contains: Team links, Idea links, loose items saved for later             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 📋 Team  │  │ 📋 Team  │  │ 💡 Idea  │  │ 📝 Note  │  │ 🔗 Link  │     │
│  │ Personal │  │ DBZ Group│  │ Frieren  │  │ Cool ref │  │ Tutorial │     │
│  └────┬─────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│       │                                                                     │
└───────┼─────────────────────────────────────────────────────────────────────┘
        │ Click to drill in
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TEAM MOODBOARD                                                             │
│  Route: /teams/[id]/moodboard                                               │
│  Contains: Idea links, Project links, shared contacts, team resources      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 💡 Idea  │  │ 💡 Idea  │  │ 📦 Project│  │ 👤 Contact│  │ 🧵 Fabric│     │
│  │ Raiden   │  │ Yae Miko │  │ AX 2026  │  │ Arda Wigs│  │ Swatches │     │
│  └────┬─────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│       │                                                                     │
└───────┼─────────────────────────────────────────────────────────────────────┘
        │ Click to drill in
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  IDEA MOODBOARD                                                             │
│  Route: /ideas/[id]/moodboard                                               │
│  Contains: Characters, Props, references, budget items                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 👤 Char  │  │ 🔧 Prop  │  │ 📁 Wigs  │  │ 📷 Ref   │  │ 💰 Budget│     │
│  │ Raiden   │  │ Polearm  │  │ Options  │  │ Official │  │ Wig $85  │     │
│  └────┬─────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│       │                                                                     │
└───────┼─────────────────────────────────────────────────────────────────────┘
        │ Click to drill in
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CHARACTER SUB-BOARD                                                        │
│  Route: /moodboard/[id]?parent=[character_node_id]                         │
│  Contains: Options (variants), character-specific refs and budget          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ 🎭 Option│  │ 🎭 Option│  │ 📷 Ref   │  │ 📝 Note  │                    │
│  │ Archon   │  │ Casual   │  │ Pose ref │  │ Hair tips│                    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Views & Locations

| Location | Available Views | Editing |
|----------|-----------------|---------|
| `/moodboard/[id]` (Full Editor) | Canvas, Gallery, List | Full |
| Idea/Project Detail (Flyout) | Gallery, List + Lite Canvas | View-only + Add |
| References Tab | Gallery, List | Add/Delete |

---

## Card Types (v1.0)

### Visual Reference

```
CONTAINERS (drillable)                    LEAF NODES
┌────────────────────┐                    ┌────────────────────┐
│ 📁 Group/Stack     │                    │ 🖼️ Image           │
│ ┌────┬────┬────┐   │                    │ ┌────────────────┐ │
│ │ 🖼 │ 🖼 │ 🖼 │   │                    │ │                │ │
│ └────┴────┴────┘   │                    │ │   [image]      │ │
│ 6 items            │                    │ │                │ │
│ Click to open →    │                    │ └────────────────┘ │
└────────────────────┘                    │ Caption text       │
                                          │ [tag] [tag]        │
┌────────────────────┐                    └────────────────────┘
│ 👤 Character       │
│ ┌────┬────┬────┐   │                    ┌────────────────────┐
│ │ 🎭 │ 📷 │ 💰 │   │                    │ 📱 Social Media    │
│ └────┴────┴────┘   │                    │ ┌────────────────┐ │
│ Raiden Shogun      │                    │ │ 📷 Instagram   │ │
│ 2 options, $385    │                    │ │   [embed]      │ │
│ Click to open →    │                    │ │                │ │
└────────────────────┘                    │ └────────────────┘ │
                                          │ @cosplayer         │
┌────────────────────┐                    │ [fabric] [ref]     │
│ 🎭 Option/Variant  │                    └────────────────────┘
│ ┌────┬────┬────┐   │
│ │ 📷 │ 📝 │ 🧵 │   │                    ┌────────────────────┐
│ └────┴────┴────┘   │                    │ 📝 Note            │
│ Super Saiyan       │                    │                    │
│ 8 items, $120      │                    │ Purple fabric opts │
│ Click to open →    │                    │ - Check Joann's    │
└────────────────────┘                    │ - Compare swatches │
                                          │                    │
┌────────────────────┐                    │ [fabric] [todo]    │
│ 🔧 Prop            │                    └────────────────────┘
│ ┌────┬────┬────┐   │
│ │ 📷 │ 🎬 │ 💰 │   │                    ┌────────────────────┐
│ └────┴────┴────┘   │                    │ 💰 Budget Item     │
│ Power Pole         │                    │                    │
│ 4 items, $80       │                    │ Wig - $85          │
│ Click to open →    │                    │ Arda Wigs          │
└────────────────────┘                    │ Status: Planned    │
                                          │                    │
┌────────────────────┐                    │ [wig] [buy]        │
│ 📋 Moodboard Link  │                    └────────────────────┘
│                    │
│ → Team: DBZ Group  │                    ┌────────────────────┐
│                    │                    │ 🎨 Color Palette   │
│ 12 items           │                    │ ┌──┬──┬──┬──┬──┐   │
│ Click to open →    │                    │ │▓▓│▓▓│▓▓│▓▓│▓▓│   │
└────────────────────┘                    │ └──┴──┴──┴──┴──┘   │
                                          │ Raiden colors      │
                                          │ [palette]          │
                                          └────────────────────┘

                                          ┌────────────────────┐
                                          │ 📏 Measurements    │
                                          │                    │
                                          │ Bust: 36" Waist: 28│
                                          │ Hips: 38" Height: 5'6│
                                          │ Updated: Jan 2026  │
                                          │ [body]             │
                                          └────────────────────┘

                                          ┌────────────────────┐
                                          │ 🧵 Fabric          │
                                          │ ┌────────────────┐ │
                                          │ │   [swatch]     │ │
                                          │ └────────────────┘ │
                                          │ Purple Satin       │
                                          │ 4-way stretch      │
                                          │ $12/yd - Joann's   │
                                          └────────────────────┘

                                          ┌────────────────────┐
                                          │ 👤 Contact         │
                                          │                    │
                                          │ Jane Doe           │
                                          │ 📷 Photographer    │
                                          │ @jane_photos       │
                                          │ [contact]          │
                                          └────────────────────┘

                                          ┌────────────────────┐
                                          │ 🔗 Link            │
                                          │ ┌────────────────┐ │
                                          │ │  [thumbnail]   │ │
                                          │ └────────────────┘ │
                                          │ Tutorial: Armor    │
                                          │ youtube.com/...    │
                                          └────────────────────┘
```

---

## Reference Analysis

### 1. Infinite Canvas / Moodboard Tools

#### Milanote
**URL:** https://milanote.com

**Key Patterns:**
- Freeform canvas with spatial organization
- Multi-format content: notes, images, videos, sketches
- "See the big picture—and the details" philosophy
- Cross-device: desktop app + mobile apps for quick capture
- Collaboration: invite to edit, comment, or view

**What Works:**
- Intuitive drag-and-drop for visual thinkers
- Combine different content types seamlessly
- Mobile capture → desktop organize workflow

**Our Adaptation:**
- Similar freeform canvas with Svelte Flow
- Focus on social media content (Instagram, TikTok) as primary capture
- Mobile-first with PWA Share Target

---

#### Miro
**URL:** https://miro.com

**Key Patterns:**
- Collaborative whiteboard with real-time cursors
- Extensive template library
- Toolbar at bottom/side for tools
- Minimap for navigation
- Frames for organizing sections

**What Works:**
- Real-time collaboration creates engagement
- Templates reduce blank-page paralysis
- Frames help organize large canvases

**Our Adaptation:**
- Real-time collab deferred to v3.0
- Templates for v1.5 (convention prep, armor build, etc.)
- Simple canvas first, no frames in v1.0

---

#### Svelte Flow (Our Technology Choice)
**URL:** https://svelteflow.dev

**Built-in Features:**
- Background (lines, dots, cross variants)
- Controls for viewport manipulation
- MiniMap for navigation overview
- Panel for positioning content
- NodeToolbar / EdgeToolbar for contextual menus

**Interaction Patterns:**
- Dragging nodes, zooming, panning — all built-in
- Connection validation and prevention
- Drag-and-drop node creation
- Lasso selection
- Keyboard navigation (arrow keys, delete, escape)

**What We'll Use (v1.0):**
- Custom nodes (disable default node types)
- Zoom/pan controls
- Background (dots)
- Disable edges/connections

**What We'll Add (v1.5):**
- MiniMap
- Edge connections with labels
- NodeToolbar

---

### 2. Social Media / Inspiration Tools

#### Pinterest
**URL:** https://pinterest.com

**Key Patterns:**
- Masonry grid layout (variable height cards)
- Pin card: image + title + source
- Save to board flow (one click)
- Boards as collections
- Infinite scroll

**What Works:**
- Masonry grid is visually engaging
- Quick save workflow (minimal friction)
- Image-first design

**Our Adaptation:**
- Gallery view uses masonry grid
- "Add to moodboard" as simple as Pinterest save
- Show platform badges (Instagram, TikTok icons)

---

#### Raindrop.io
**URL:** https://raindrop.io

**Key Patterns:**
- Multiple view modes: Grid, Headlines, Masonry, List
- Automatic metadata extraction from URLs
- Full-text search across saved content
- Tags + collections for organization
- Public collections shareable without signup

**What Works:**
- View mode switching is smooth
- Metadata extraction "just works"
- Sharing without requiring viewer accounts

**Our Adaptation:**
- View switcher: Gallery, List, Canvas
- URL metadata extraction via oembed/unfurl
- Public moodboard sharing (OAuth only for comments)

---

#### Are.na
**URL:** https://are.na

**Key Patterns:**
- "Blocks" as universal content units
- "Channels" as flexible collections
- Connect content across channels
- Personal classification system
- Visual + relational organization

**What Works:**
- Flexible block types (images, links, files, text)
- Non-linear exploration
- Personal knowledge building

**Our Adaptation:**
- Nodes as flexible content units
- Multi-character tabs as "channels"
- Tag-based cross-referencing

---

### 3. View Mode References

#### Gallery View (Pinterest-style)
**Reference:** Pinterest, Raindrop.io Grid, Instagram Explore

**Expected Behavior:**
- Masonry grid with variable height cards
- Responsive columns (1 mobile → 3+ desktop)
- Infinite scroll or pagination
- Hover reveals actions (on desktop)
- Tap opens detail view (on mobile)

**Implementation Notes:**
- CSS columns or masonry library
- Lazy load images for performance
- Card component reusable across views

---

#### List View (Compact Rows)
**Reference:** Raindrop.io Headlines, Linear issues, Notion list

**Expected Behavior:**
- Thumbnail + title + tags + date in row
- Sortable columns
- Click row to expand or open detail
- Bulk selection for actions
- Compact density for scanning

**Implementation Notes:**
- Simple table or flex rows
- Sort state persisted
- Mobile: single-column stack

---

#### Canvas View (Freeform)
**Reference:** Milanote, Miro, FigJam, Obsidian Canvas

**Expected Behavior:**
- Infinite pannable workspace
- Nodes at saved positions
- Zoom: mouse wheel (desktop), pinch (mobile)
- Pan: drag background (desktop), swipe (mobile)
- Drag nodes to reposition
- Tap-hold to grab on mobile (Milanote-style)

**Implementation Notes:**
- Svelte Flow handles core interactions
- Custom node components for content types
- Save position on drag end
- Debounce position saves

---

## Competitive Analysis Matrix

| Feature | Milanote | Miro | Pinterest | Raindrop | Are.na | **Cosplans** |
|---------|----------|------|-----------|----------|--------|--------------|
| Infinite Canvas | Yes | Yes | No | No | No | **Yes** |
| Node Connections | Yes | Yes | No | No | Cross-link | **v1.5** |
| Masonry Grid | No | No | Yes | Yes | Yes | **Yes** |
| List View | No | No | No | Yes | Yes | **Yes** |
| Social Media Embeds | Limited | Yes | Native | Limited | Yes | **Yes** |
| URL Metadata | Yes | Yes | Yes | Yes | Yes | **Yes** |
| Mobile Capture | App | App | App | App | Limited | **PWA Share Target** |
| Budget Tracking | No | No | No | No | No | **Yes** |
| Offline Support | App | Limited | App | App | No | **Yes (PWA)** |
| Public Sharing | Yes | Yes | Yes | Yes | Yes | **Yes** |
| OAuth Comments | No | Miro acct | Pinterest acct | No | Are.na acct | **Yes (Google/GitHub)** |

**Key Differentiators:**
1. Social media capture via Share Target (no app install needed on Android)
2. Budget tracking integrated with moodboard
3. Cosplay-specific workflow (idea → project conversion)
4. ADHD-friendly design (progressive disclosure, quick capture)

---

## User Expectations Audit

### 1. "Infinite Canvas" Expectations
**Based on:** Milanote, Miro, FigJam, Obsidian Canvas

**Users expect:**
- Smooth zoom/pan (60fps)
- Drag-drop to reposition
- Right-click context menu (desktop)
- Two-finger gestures (mobile)
- Background grid or dots
- Some kind of minimap for large canvases

**Our v1.0 approach:**
- Zoom/pan with Svelte Flow (built-in)
- Drag-drop nodes
- Touch: tap-hold to drag, swipe to pan, pinch to zoom
- Background dots (subtle)
- Minimap deferred to v1.5

---

### 2. "Paste URL" Expectations
**Based on:** Pinterest, Notion, Are.na, Raindrop

**Users expect:**
- Paste URL → instant preview appears
- Thumbnail extracted automatically
- Title/description pulled if available
- Platform recognized (Instagram badge, etc.)
- Fallback to basic link if extraction fails

**Our v1.0 approach:**
- Paste URL in add dialog
- Metadata extraction via oembed/unfurl
- Platform badge on social media nodes
- Graceful fallback (URL + "View on [platform]" link)

---

### 3. "View Switching" Expectations
**Based on:** Raindrop, Notion, Airtable

**Users expect:**
- Toggle in toolbar area
- Instant switch (no reload)
- Data preserved across views
- Each view remembers its state (sort, filter)
- Canvas positions don't change when switching away and back

**Our v1.0 approach:**
- ViewSwitcher in header (Gallery | List | Canvas)
- Same data, different presentation
- Canvas positions stored in DB
- View preference in localStorage

---

### 4. "Mobile Capture" Expectations
**Based on:** Pinterest app, Instagram save, mobile browsers

**Users expect:**
- Share from Instagram/TikTok → appears in app
- Minimal steps (2-3 taps max)
- Works offline (queues for sync)
- Shows confirmation

**Our v1.0 approach:**
- PWA Share Target (Android)
- Capacitor share extension (iOS)
- Team/idea selector → confirm → done
- Offline queue with "pending sync" badge

---

### 5. "Shareable Link" Expectations
**Based on:** Figma, Loom, Google Docs

**Users expect:**
- "Copy link" button
- Anyone with link can view (no signup)
- Optional: require login to comment
- Owner can revoke access
- Link shows current state (not snapshot)

**Our v1.0 approach:**
- ShareDialog with copy button
- Public view without login
- OAuth (Google/GitHub) to comment
- Revoke toggle
- Live view (not snapshot)

---

## Interaction Patterns

### Touch Interactions (Mobile)

| Action | Gesture | Notes |
|--------|---------|-------|
| Pan canvas | Swipe with one finger | Default behavior |
| Zoom | Pinch with two fingers | Standard zoom gesture |
| Select node | Tap | Opens detail drawer |
| Move node | Tap and hold, then drag | Milanote-style |
| Edit node | Tap edit button on card | Inline editing |
| Delete node | Swipe left on card (list) or tap delete | Contextual |

### Desktop Interactions

| Action | Input | Notes |
|--------|-------|-------|
| Pan canvas | Drag background / scroll | Also: spacebar + drag |
| Zoom | Mouse wheel / +/- buttons | Or ctrl+scroll |
| Select node | Click | Single selection |
| Multi-select | Shift+click or lasso | Future: v1.5 |
| Move node | Drag | Direct manipulation |
| Context menu | Right-click | Edit, delete, duplicate |
| Quick add | Double-click canvas | Opens add dialog at position |

---

## Component Design

### Node Card (Base Pattern)

All node types share a common card structure:

```
┌─────────────────────────────────┐
│ [Platform Badge]     [⋮ Menu]   │  ← Header (optional)
├─────────────────────────────────┤
│                                 │
│         [Content Area]          │  ← Type-specific
│                                 │
├─────────────────────────────────┤
│ Title / Caption                 │  ← Short comment
│ [Tags]  [Tags]                  │  ← Tag chips
└─────────────────────────────────┘
```

### Node Types

#### ImageNode
- Content: Image with aspect ratio preserved
- Header: None (or source badge if from URL)
- Footer: Caption, tags

#### SocialMediaNode
- Content: Embedded video/image preview
- Header: Platform badge (Instagram, TikTok, etc.)
- Footer: Creator name, caption, tags
- Fallback: Thumbnail + "View on [platform]" link

#### NoteNode
- Content: Text (markdown rendered)
- Header: None
- Footer: Tags
- Style: Sticky-note yellow background (optional)

#### BudgetItemNode
- Content: Item name, cost, quantity
- Header: Currency badge
- Footer: Supplier link, "shared" badge
- Style: Subtle green tint for budget items

#### ContactNode
- Content: Name, type icon, contact info
- Header: Contact type badge
- Footer: Link to full contact
- Style: Blue tint for contacts

---

## View Layouts

### Gallery View (Masonry)

```
┌────────────────────────────────────────────┐
│ [View: Gallery | List | Canvas]  [+ Add]   │
├────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │         │ │         │ │         │        │
│ │  Card   │ │  Card   │ │  Card   │        │
│ │         │ │ (tall)  │ │         │        │
│ └─────────┘ │         │ └─────────┘        │
│ ┌─────────┐ └─────────┘ ┌─────────┐        │
│ │         │ ┌─────────┐ │         │        │
│ │  Card   │ │  Card   │ │  Card   │        │
│ └─────────┘ └─────────┘ │ (tall)  │        │
│                         │         │        │
│                         └─────────┘        │
└────────────────────────────────────────────┘
```

### List View

```
┌────────────────────────────────────────────┐
│ [View: Gallery | List | Canvas]  [+ Add]   │
├────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐   │
│ │ [img] Title here...  [tags] [date]   │   │
│ └──────────────────────────────────────┘   │
│ ┌──────────────────────────────────────┐   │
│ │ [img] Another item   [tags] [date]   │   │
│ └──────────────────────────────────────┘   │
│ ┌──────────────────────────────────────┐   │
│ │ [img] Third item     [tags] [date]   │   │
│ └──────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

### Canvas View

```
┌────────────────────────────────────────────┐
│ [View: Gallery | List | Canvas]  [+ Add]   │
├────────────────────────────────────────────┤
│ · · · · · · · · · · · · · · · · · · · · ·  │
│ · · · ┌─────┐ · · · · · · · · · · · · · ·  │
│ · · · │Card │ · · · ┌─────────┐ · · · · ·  │
│ · · · └─────┘ · · · │  Card   │ · · · · ·  │
│ · · · · · · · · · · │ (large) │ · · · · ·  │
│ · · · · · · · · · · └─────────┘ · · · · ·  │
│ · · · · · · ┌─────┐ · · · · · · · · · · ·  │
│ · · · · · · │Card │ · · · · · · · · · · ·  │
│ · · · · · · └─────┘ · · · · · · · · · · ·  │
│                          [Zoom: + | - | ⊡] │
└────────────────────────────────────────────┘
```

### Context Menu Interactions

**Canvas Right-Click (empty space):**
```
┌─────────────────────────┐
│ Add Node            →   │  ← Opens submenu
│ Paste               ⌘V  │  ← If clipboard has node
├─────────────────────────┤
│ Reset Zoom          0   │
│ Fit to View         ⌘0  │
└─────────────────────────┘
```

**Add Node Submenu:**
```
┌─────────────────────────────┐
│ 📝 Note                     │
│ 🔗 Link                     │
│ 🖼️ Image                    │
├─────────────────────────────┤
│ 📁 Group                    │
│ 👤 Character                │
│ 🎭 Option / Variant         │
│ 🔧 Prop                     │
│ 📋 Moodboard Link           │
└─────────────────────────────┘
```

**Node Right-Click (existing):**
```
┌─────────────────────────┐
│ Edit                    │
│ Duplicate           ⌘D  │
│ Delete              ⌫   │
└─────────────────────────┘
```

**Interaction Patterns:**
- Right-click on empty canvas → Context menu at cursor position
- Click "Add Node" → Shows submenu with card types
- Select card type → Opens AddNodeModal with cursor position preserved
- Double-click canvas → Quick shortcut to open AddNodeModal
- Mobile: Long-press canvas (not node) → Opens same context menu
- ESC key or click outside → Close menu

---

## Mobile Considerations

### Bottom Toolbar (Obsidian-style)

```
┌────────────────────────────────────────────┐
│                                            │
│              [Content Area]                │
│                                            │
├────────────────────────────────────────────┤
│  [⊕ Add]  [☷ View]  [⚙ Filter]  [↗ Share] │
└────────────────────────────────────────────┘
```

- Always visible in thumb zone
- Tap-hold for extended options
- Primary actions only (4-5 max)

### Share Target Flow

```
Instagram → Share → Cosplans
    ↓
┌────────────────────────────────────────────┐
│           Add to Moodboard                 │
├────────────────────────────────────────────┤
│  Team: [Personal ▾]                        │
│  Idea: [Current Cosplay ▾]                 │
│                                            │
│  Preview:                                  │
│  ┌─────────────────────────────────────┐   │
│  │ [Instagram thumbnail]               │   │
│  │ @creator_name                       │   │
│  └─────────────────────────────────────┘   │
│                                            │
│  [Cancel]                    [Add ✓]       │
└────────────────────────────────────────────┘
```

---

## Animation & Feedback

### Micro-interactions

| Action | Animation | Duration |
|--------|-----------|----------|
| Node added | Scale up + fade in | 200ms |
| Node deleted | Scale down + fade out | 150ms |
| Node dragged | Subtle shadow lift | While dragging |
| View switch | Cross-fade content | 150ms |
| Share link copied | Checkmark flash | 300ms |
| Save success | Green pulse on card | 200ms |

### Loading States

- Skeleton cards in Gallery/List
- Spinner overlay on Canvas during initial load
- Progressive image loading (blur → sharp)

---

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels on canvas nodes
- [ ] Alt text for images
- [ ] Color not sole indicator (badges have icons too)
- [ ] Reduced motion option respects `prefers-reduced-motion`
- [ ] Touch targets ≥44px on mobile

---

## Open Design Questions

1. **Node resize:** Should users be able to resize nodes on canvas, or fixed sizes based on content?
   - Recommendation: Fixed sizes for v1.0, resizable in v1.5

2. **Canvas background:** Dots, grid, or plain?
   - Recommendation: Subtle dots (matches Svelte Flow default)

3. **Empty state:** What shows when moodboard is empty?
   - **Decision:** Canvas with simple template showing sample nodes demonstrating features

4. **Drag feedback:** Shadow lift, outline, or opacity change?
   - Recommendation: Shadow lift (Milanote-style)

---

## Expert Council Review (2026-01-20)

### Feedback Addressed

| Expert | Concern | Decision |
|--------|---------|----------|
| Technical | Embed performance on canvas | **ACCEPTED** — Thumbnail-only on canvas, full embed on click/expand |
| Technical | Position save debounce | **ACCEPTED** — Debounce 300-500ms, batch saves |
| Technical | Share token security | **ACCEPTED** — Use UUID v4 or nanoid |

### Feedback Rejected (with rationale)

| Expert | Concern | Decision | Rationale |
|--------|---------|----------|-----------|
| Product | Reduce v1.0 scope to "alpha" | **REJECTED** | Empty alpha has no value. Need features to attract users. Full v1.0 scope stands. |
| ADHD | Paste directly without modal | **REJECTED** | Share Target provides low-friction capture. In-app modal is desirable friction for intentional organization. |
| ADHD | Default Gallery, hide Canvas until 10+ items | **REJECTED** | Canvas should be default. Hidden features hurt ADHD users more than visible ones. Keep all views accessible. |
| UX | Inline quick-add buttons in empty state | **MODIFIED** | Use template-based empty state instead (see below) |

### Design Decisions from Review

1. **Default view: Canvas** (not Gallery)
   - Canvas is the core differentiator
   - Show all view options visibly, don't hide any

2. **Empty state: Template-based**
   - Show canvas with sample/demo nodes demonstrating features
   - "This is what a moodboard looks like" approach
   - Clear "Start Fresh" or "Keep Template" options
   - Better for ADHD: shows what's possible, not blank intimidation

3. **Canvas embeds: Thumbnail-only**
   - Social media nodes show thumbnail + platform badge
   - Click/tap to expand and load full embed
   - Keeps canvas performant with 50+ items

4. **Features always visible**
   - All view modes visible in switcher
   - All add options visible (URL, Image, Note)
   - Progressive disclosure for complexity, not for hiding core features

5. **In-app add flow: Modal is fine**
   - Share Target = low friction capture (mobile)
   - In-app modal = intentional organization (desktop/deliberate)
   - Different contexts, different friction levels appropriate

---

---

# Detailed Wireframes & Mockups

> **Added:** 2026-01-20
> **Status:** Complete

This section provides comprehensive ASCII wireframes for all moodboard screens and states.

---

## Screen 1: Moodboard Main View (Desktop — Canvas Default)

The primary moodboard interface. Canvas is the default view.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ◀ Back to Idea    Genshin Impact - Raiden Shogun                    [👤 User] │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [Overview]  [References ●]  [Budget]  [Notes]                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Options: [All ▼]  [Option A]  [Option B]  [+ Add Option]                │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  View: [Canvas ●] [Gallery] [List]     Filter: [All Types ▼]  [+ Add]  │   │
│  │                                                                         │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│  │ · · ┌──────────────┐ · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│  │ · · │ 📷 Instagram │ · · · · ┌──────────────────┐ · · · · · · · · · · · │   │
│  │ · · │ ┌──────────┐ │ · · · · │ 📝 Note          │ · · · · · · · · · · · │   │
│  │ · · │ │  ~~~~~~  │ │ · · · · │                  │ · · · · · · · · · · · │   │
│  │ · · │ │  ~~~~~~  │ │ · · · · │ Purple fabric    │ · · · · · · · · · · · │   │
│  │ · · │ │  ~~~~~~  │ │ · · · · │ options - check  │ · · · · · · · · · · · │   │
│  │ · · │ └──────────┘ │ · · · · │ Joann's sale     │ · · · · · · · · · · · │   │
│  │ · · │ @cosplayer   │ · · · · │                  │ · · · · · · · · · · · │   │
│  │ · · │ [fabric] [ref]│ · · · · │ [fabric]         │ · · · · · · · · · · · │   │
│  │ · · └──────────────┘ · · · · └──────────────────┘ · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · ┌──────────────┐ · · · ┌──────────────┐ · · · · · · · · · · │   │
│  │ · · · · · · │ 🎬 TikTok    │ · · · │ 💰 Budget    │ · · · · · · · · · · │   │
│  │ · · · · · · │ ┌──────────┐ │ · · · │              │ · · · · · · · · · · │   │
│  │ · · · · · · │ │  ▶ ~~~~  │ │ · · · │ Wig - $85    │ · · · · · · · · · · │   │
│  │ · · · · · · │ │  ~~~~~~  │ │ · · · │ Arda Wigs    │ · · · · · · · · · · │   │
│  │ · · · · · · │ └──────────┘ │ · · · │              │ · · · · · · · · · · │   │
│  │ · · · · · · │ Wig tutorial │ · · · │ [wig] [buy]  │ · · · · · · · · · · │   │
│  │ · · · · · · │ [wig] [how-to]│ · · · └──────────────┘ · · · · · · · · · · │   │
│  │ · · · · · · └──────────────┘ · · · · · · · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · ┌──────────────┐ · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · │ 🖼️ Image     │ · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · │ ┌──────────┐ │ · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · │ │ Official │ │ · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · │ │   art    │ │ · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · │ └──────────┘ │ · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · │ [reference]  │ · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · └──────────────┘ · · · · · · · · · · · · · · · · │   │
│  │                                                                         │   │
│  │                                               ┌─────────────────────┐   │   │
│  │                                               │  [−]  [100%]  [+]   │   │   │
│  │                                               │  [⊡ Fit to screen]  │   │   │
│  │                                               └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Budget Total: $385 (5 items)                              [Share Moodboard]   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Option tabs** at top for multi-character/variant support
- **View switcher** with Canvas as default (highlighted)
- **Filter dropdown** for content type filtering
- **Zoom controls** in bottom-right corner
- **Budget summary** in footer
- **Share button** for public sharing

---

## Screen 2: Gallery View (Pinterest-style Masonry)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ◀ Back to Idea    Genshin Impact - Raiden Shogun                    [👤 User] │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [Overview]  [References ●]  [Budget]  [Notes]                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Options: [All ▼]                                                        │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  View: [Canvas] [Gallery ●] [List]     Filter: [All Types ▼]  [+ Add]  │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │ 📷         │  │ 🎬         │  │ 🖼️         │  │ 📷         │        │   │
│  │  │ ┌────────┐ │  │ ┌────────┐ │  │ ┌────────┐ │  │ ┌────────┐ │        │   │
│  │  │ │        │ │  │ │        │ │  │ │        │ │  │ │        │ │        │   │
│  │  │ │        │ │  │ │   ▶    │ │  │ │ Art    │ │  │ │        │ │        │   │
│  │  │ │        │ │  │ │        │ │  │ │        │ │  │ │        │ │        │   │
│  │  │ └────────┘ │  │ │        │ │  │ └────────┘ │  │ │        │ │        │   │
│  │  │ @cosplayer │  │ │        │ │  │ Official   │  │ │        │ │        │   │
│  │  │ [fabric]   │  │ └────────┘ │  │ [ref]      │  │ └────────┘ │        │   │
│  │  └────────────┘  │ Wig tut    │  └────────────┘  │ @user2     │        │   │
│  │                  │ [wig]      │                  │ [armor]    │        │   │
│  │  ┌────────────┐  └────────────┘  ┌────────────┐  └────────────┘        │   │
│  │  │ 📝         │                  │ 💰         │                        │   │
│  │  │            │  ┌────────────┐  │            │  ┌────────────┐        │   │
│  │  │ Purple     │  │ 📷         │  │ Wig - $85  │  │ 👤         │        │   │
│  │  │ fabric     │  │ ┌────────┐ │  │ Arda Wigs  │  │            │        │   │
│  │  │ options    │  │ │        │ │  │            │  │ Jane Doe   │        │   │
│  │  │            │  │ │        │ │  │ [wig]      │  │ Wig Maker  │        │   │
│  │  │ [fabric]   │  │ └────────┘ │  └────────────┘  │            │        │   │
│  │  └────────────┘  │ @user3     │                  │ [contact]  │        │   │
│  │                  │ [props]    │                  └────────────┘        │   │
│  │                  └────────────┘                                        │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  12 items • Budget: $385                                   [Share Moodboard]   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Masonry grid** with variable card heights
- **Platform badges** (📷 Instagram, 🎬 TikTok, 📝 Note, 💰 Budget, 👤 Contact)
- **Hover actions** (not shown — edit, delete, open)
- **Tag chips** on each card
- **Item count** in footer

---

## Screen 3: List View (Compact Rows)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ◀ Back to Idea    Genshin Impact - Raiden Shogun                    [👤 User] │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [Overview]  [References ●]  [Budget]  [Notes]                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Options: [All ▼]                                                        │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  View: [Canvas] [Gallery] [List ●]     Filter: [All Types ▼]  [+ Add]  │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  ┌─────┬──────────────────────────────────┬──────────┬─────────┬──────┐ │   │
│  │  │     │ Title                            │ Tags     │ Type    │ Date │ │   │
│  │  ├─────┼──────────────────────────────────┼──────────┼─────────┼──────┤ │   │
│  │  │ [▪] │ 📷 @cosplayer - Raiden fabric    │ fabric   │ Insta   │ Jan 5│ │   │
│  │  ├─────┼──────────────────────────────────┼──────────┼─────────┼──────┤ │   │
│  │  │ [▪] │ 🎬 Wig styling tutorial          │ wig,how  │ TikTok  │ Jan 4│ │   │
│  │  ├─────┼──────────────────────────────────┼──────────┼─────────┼──────┤ │   │
│  │  │ [▪] │ 🖼️ Official character art        │ ref      │ Image   │ Jan 3│ │   │
│  │  ├─────┼──────────────────────────────────┼──────────┼─────────┼──────┤ │   │
│  │  │ [▪] │ 📝 Purple fabric options         │ fabric   │ Note    │ Jan 3│ │   │
│  │  ├─────┼──────────────────────────────────┼──────────┼─────────┼──────┤ │   │
│  │  │ [▪] │ 💰 Wig - $85 (Arda Wigs)         │ wig,buy  │ Budget  │ Jan 2│ │   │
│  │  ├─────┼──────────────────────────────────┼──────────┼─────────┼──────┤ │   │
│  │  │ [▪] │ 💰 Fabric - $120 (Joann's)       │ fabric   │ Budget  │ Jan 2│ │   │
│  │  ├─────┼──────────────────────────────────┼──────────┼─────────┼──────┤ │   │
│  │  │ [▪] │ 👤 Jane Doe - Wig Maker          │ contact  │ Contact │ Jan 1│ │   │
│  │  ├─────┼──────────────────────────────────┼──────────┼─────────┼──────┤ │   │
│  │  │ [▪] │ 📷 @user2 - Armor detail         │ armor    │ Insta   │ Jan 1│ │   │
│  │  └─────┴──────────────────────────────────┴──────────┴─────────┴──────┘ │   │
│  │                                                                         │   │
│  │  [Select All]  [Delete Selected]  [Add Tags to Selected]               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  12 items • Budget: $385                                   [Share Moodboard]   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Sortable columns** (click header to sort)
- **Checkbox selection** for bulk actions
- **Bulk actions bar** at bottom
- **Compact rows** for quick scanning
- **Type icons** for visual distinction

---

## Screen 4: Empty State (Template-Based)

When a user creates a new idea, they see a pre-populated demo moodboard.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ◀ Back to Idea    New Cosplay Idea                                  [👤 User] │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [Overview]  [References ●]  [Budget]  [Notes]                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  ╔═══════════════════════════════════════════════════════════════════╗ │   │
│  │  ║  ✨ Welcome to your moodboard!                                    ║ │   │
│  │  ║                                                                   ║ │   │
│  │  ║  This is where you collect inspiration before starting a         ║ │   │
│  │  ║  project. We've added some examples to show you how it works.    ║ │   │
│  │  ║                                                                   ║ │   │
│  │  ║  [Start Fresh — Clear All]     [Keep Examples & Explore]         ║ │   │
│  │  ╚═══════════════════════════════════════════════════════════════════╝ │   │
│  │                                                                         │   │
│  │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│  │ · · ┌────────────────┐ · · · · · · · · · ┌────────────────┐ · · · · · · │   │
│  │ · · │ 📷 EXAMPLE     │ · · · · · · · · · │ 📝 EXAMPLE     │ · · · · · · │   │
│  │ · · │ ┌────────────┐ │ · · · · · · · · · │                │ · · · · · · │   │
│  │ · · │ │ Sample     │ │ · · · · · · · · · │ Add notes for  │ · · · · · · │   │
│  │ · · │ │ Instagram  │ │ · · · · · · · · · │ fabric ideas,  │ · · · · · · │   │
│  │ · · │ │ post       │ │ · · · · · · · · · │ techniques,    │ · · · · · · │   │
│  │ · · │ └────────────┘ │ · · · · · · · · · │ or reminders   │ · · · · · · │   │
│  │ · · │ Paste Instagram│ · · · · · · · · · │                │ · · · · · · │   │
│  │ · · │ or TikTok URLs │ · · · · · · · · · │ [example]      │ · · · · · · │   │
│  │ · · │ [example]      │ · · · · · · · · · └────────────────┘ · · · · · · │   │
│  │ · · └────────────────┘ · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│  │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│  │ · · · · · ┌────────────────┐ · · · · ┌────────────────┐ · · · · · · · · │   │
│  │ · · · · · │ 💰 EXAMPLE     │ · · · · │ 👤 EXAMPLE     │ · · · · · · · · │   │
│  │ · · · · · │                │ · · · · │                │ · · · · · · · · │   │
│  │ · · · · · │ Track costs    │ · · · · │ Save contacts  │ · · · · · · · · │   │
│  │ · · · · · │ like wigs,     │ · · · · │ for commission │ · · · · · · · · │   │
│  │ · · · · · │ fabric, props  │ · · · · │ ers, vendors   │ · · · · · · · · │   │
│  │ · · · · · │                │ · · · · │                │ · · · · · · · · │   │
│  │ · · · · · │ [example]      │ · · · · │ [example]      │ · · · · · · · · │   │
│  │ · · · · · └────────────────┘ · · · · └────────────────┘ · · · · · · · · │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Welcome banner** explaining the moodboard concept
- **Clear action buttons**: Start Fresh vs Keep Examples
- **Demo nodes** showing each content type with explanatory text
- **"EXAMPLE" badges** to clearly mark demo content
- Nodes are **draggable** — user can explore before deciding

---

## Screen 5: Add Reference Modal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│      ┌─────────────────────────────────────────────────────────────────┐       │
│      │                     Add to Moodboard                            │       │
│      ├─────────────────────────────────────────────────────────────────┤       │
│      │                                                                 │       │
│      │   [🔗 URL]   [🖼️ Image]   [📝 Note]   [💰 Budget]   [👤 Contact] │       │
│      │                                                                 │       │
│      │  ─────────────────────────────────────────────────────────────  │       │
│      │                                                                 │       │
│      │  URL (Instagram, TikTok, Pinterest, YouTube...)                │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ https://instagram.com/p/ABC123...                       │   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │                                                                 │       │
│      │  Preview:                                                       │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ 📷 Instagram                                            │   │       │
│      │  │ ┌─────────────┐                                         │   │       │
│      │  │ │             │  @cosplayartist                         │   │       │
│      │  │ │  Thumbnail  │  "Amazing Raiden Shogun fabric details" │   │       │
│      │  │ │             │                                         │   │       │
│      │  │ └─────────────┘                                         │   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │                                                                 │       │
│      │  Add a comment (optional):                                     │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ Love this fabric technique!                             │   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │                                                                 │       │
│      │  Tags:                                                         │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ [fabric ×] [reference ×] [+ Add tag]                    │   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │                                                                 │       │
│      │  Option: [All ▼]  (applies to: All options)                    │       │
│      │                                                                 │       │
│      │                                                                 │       │
│      │  [Cancel]                                      [Add to Board]  │       │
│      │                                                                 │       │
│      └─────────────────────────────────────────────────────────────────┘       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Content type tabs** at top (URL, Image, Note, Budget, Contact)
- **Auto-preview** when URL is pasted
- **Platform detection** with badge
- **Metadata extraction** (thumbnail, author, caption)
- **Comment field** for personal notes
- **Tag selector** with autocomplete
- **Option selector** to assign to specific variant

---

## Screen 6: Budget Item Form (within Add Modal)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│      ┌─────────────────────────────────────────────────────────────────┐       │
│      │                     Add to Moodboard                            │       │
│      ├─────────────────────────────────────────────────────────────────┤       │
│      │                                                                 │       │
│      │   [🔗 URL]   [🖼️ Image]   [📝 Note]   [💰 Budget ●]  [👤 Contact]│       │
│      │                                                                 │       │
│      │  ─────────────────────────────────────────────────────────────  │       │
│      │                                                                 │       │
│      │  Item Name *                                                   │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ Raiden Shogun Wig                                       │   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │                                                                 │       │
│      │  Estimated Cost *           Quantity                           │       │
│      │  ┌─────────────────────┐    ┌─────────────────────┐            │       │
│      │  │ $ 85.00             │    │ 1                   │            │       │
│      │  └─────────────────────┘    └─────────────────────┘            │       │
│      │                                                                 │       │
│      │  Supplier/Vendor (optional)                                    │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ [Search contacts...                              ] [+]  │   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │  Linked: Arda Wigs (ardawigs.com)                             │       │
│      │                                                                 │       │
│      │  URL (optional — product link)                                 │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ https://ardawigs.com/products/...                       │   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │                                                                 │       │
│      │  Notes:                                                        │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ Need to check shipping times before con                 │   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │                                                                 │       │
│      │  Tags: [wig ×] [buy ×] [+ Add]                                │       │
│      │                                                                 │       │
│      │  ☑ Shared across all options                                  │       │
│      │                                                                 │       │
│      │  [Cancel]                                      [Add to Board]  │       │
│      │                                                                 │       │
│      └─────────────────────────────────────────────────────────────────┘       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Item name** and **cost** (required)
- **Quantity** field for multiples
- **Supplier search** with contact linking
- **Product URL** for price tracking
- **"Shared across options"** checkbox for common items

---

## Screen 7: Multi-Option Tabs

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Options: [All ▼]  [Archon Outfit ✓]  [Casual Skin]  [+ Add Option]            │
├─────────────────────────────────────────────────────────────────────────────────┤

When "All" is selected:
┌─────────────────────────────────────────────────────────────────────────────────┐
│  All items shown. Items tagged with specific options show a badge.             │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                          │
│  │ 📷 Instagram │  │ 📝 Note      │  │ 💰 Budget    │                          │
│  │              │  │              │  │              │                          │
│  │ [ARCHON]     │  │ [SHARED]     │  │ $85 - Wig    │                          │
│  │              │  │              │  │ [SHARED]     │                          │
│  └──────────────┘  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────────┘

When specific option is selected:
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Options: [All]  [Archon Outfit ● ▼]  [Casual Skin]  [+ Add Option]            │
│           └────────────────────────┐                                           │
│                                    │  ┌─────────────────────────┐              │
│                                    │  │ Archon Outfit           │              │
│                                    │  │ ─────────────────────── │              │
│                                    │  │ Difficulty: ★★★★☆      │              │
│                                    │  │ Budget: $385            │              │
│                                    │  │ Items: 8                │              │
│                                    │  │ ─────────────────────── │              │
│                                    │  │ [Edit]  [Delete]        │              │
│                                    │  └─────────────────────────┘              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Showing: 6 items for "Archon Outfit" + 3 shared items                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Tab bar** with All + specific options
- **Dropdown on tab** shows option details
- **Option metadata**: difficulty rating, budget subtotal, item count
- **Shared badges** on items that appear across options
- **Filtered count** shows breakdown

---

## Screen 8: Mobile — Canvas View

```
┌─────────────────────────┐
│ ◀  Raiden Shogun    ⋮  │
├─────────────────────────┤
│ [All ▼] [Archon] [Casual]│
├─────────────────────────┤
│ · · · · · · · · · · · · │
│ · ┌─────────┐ · · · · · │
│ · │ 📷      │ · · · · · │
│ · │ ~~~~~~~ │ · · · · · │
│ · │ ~~~~~~~ │ · ┌─────┐ │
│ · │ @user   │ · │ 📝  │ │
│ · └─────────┘ · │     │ │
│ · · · · · · · · │     │ │
│ · · ┌─────────┐ └─────┘ │
│ · · │ 💰      │ · · · · │
│ · · │ $85 Wig │ · · · · │
│ · · └─────────┘ · · · · │
│ · · · · · · · · · · · · │
│ · · · · · ┌─────────┐ · │
│ · · · · · │ 🎬      │ · │
│ · · · · · │  ▶ ~~~~ │ · │
│ · · · · · │ Tutorial│ · │
│ · · · · · └─────────┘ · │
│ · · · · · · · · · · · · │
│                [+] [-]  │
├─────────────────────────┤
│ [⊕ Add] [☷] [⚙] [↗]    │
└─────────────────────────┘

Touch gestures:
- Swipe: Pan canvas
- Pinch: Zoom
- Tap: Select node
- Tap + hold: Drag node
```

**Key Elements:**
- **Compact header** with back and menu
- **Option pills** horizontally scrollable
- **Bottom toolbar** in thumb zone
- **Floating zoom controls**

---

## Screen 9: Mobile — Share Target Flow

```
┌─────────────────────────┐       ┌─────────────────────────┐
│                         │       │                         │
│    Instagram Post       │       │   Add to Moodboard      │
│                         │       ├─────────────────────────┤
│    [Share Button]       │ ───▶  │                         │
│         │               │       │  Team:                  │
│         ▼               │       │  ┌───────────────────┐  │
│   ┌───────────┐         │       │  │ Personal       ▼ │  │
│   │ Cosplans  │         │       │  └───────────────────┘  │
│   └───────────┘         │       │                         │
│                         │       │  Idea:                  │
└─────────────────────────┘       │  ┌───────────────────┐  │
                                  │  │ Raiden Shogun  ▼ │  │
                                  │  └───────────────────┘  │
                                  │                         │
                                  │  ┌───────────────────┐  │
                                  │  │ 📷 Instagram      │  │
                                  │  │ ┌───────────────┐ │  │
                                  │  │ │   Thumbnail   │ │  │
                                  │  │ └───────────────┘ │  │
                                  │  │ @cosplayartist    │  │
                                  │  └───────────────────┘  │
                                  │                         │
                                  │  Quick note (optional): │
                                  │  ┌───────────────────┐  │
                                  │  │                   │  │
                                  │  └───────────────────┘  │
                                  │                         │
                                  │ [Cancel]    [Add ✓]    │
                                  └─────────────────────────┘

After adding:
┌─────────────────────────┐
│                         │
│         ✓               │
│                         │
│   Added to moodboard!   │
│                         │
│   "Raiden Shogun"       │
│                         │
│   [Open Moodboard]      │
│   [Done]                │
│                         │
└─────────────────────────┘
```

**Key Elements:**
- **2-3 taps** from Instagram to saved
- **Team + Idea selectors** (remember last used)
- **Preview** of what's being captured
- **Quick note** field (optional)
- **Confirmation** with option to open or dismiss

---

## Screen 10: Share Moodboard Dialog

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│      ┌─────────────────────────────────────────────────────────────────┐       │
│      │                     Share Moodboard                             │       │
│      ├─────────────────────────────────────────────────────────────────┤       │
│      │                                                                 │       │
│      │  Anyone with the link can view this moodboard.                 │       │
│      │                                                                 │       │
│      │  Link:                                                          │       │
│      │  ┌─────────────────────────────────────────────────────────┐   │       │
│      │  │ https://cosplans.com/share/moodboard/abc123xyz        📋│   │       │
│      │  └─────────────────────────────────────────────────────────┘   │       │
│      │                                                      [Copied!] │       │
│      │                                                                 │       │
│      │  ─────────────────────────────────────────────────────────────  │       │
│      │                                                                 │       │
│      │  Settings:                                                      │       │
│      │                                                                 │       │
│      │  ☑ Allow comments                                              │       │
│      │    Viewers must sign in with Google or GitHub to comment       │       │
│      │                                                                 │       │
│      │  ☐ Include budget items                                        │       │
│      │    Show cost estimates and supplier info                       │       │
│      │                                                                 │       │
│      │  ☐ Include contact info                                        │       │
│      │    Show vendor/supplier contact details                        │       │
│      │                                                                 │       │
│      │  ─────────────────────────────────────────────────────────────  │       │
│      │                                                                 │       │
│      │  Sharing is: [● Active]                                        │       │
│      │                                                                 │       │
│      │  [Stop Sharing]                                      [Done]    │       │
│      │                                                                 │       │
│      └─────────────────────────────────────────────────────────────────┘       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Copy link** with instant feedback
- **Privacy toggles** for budget and contact info
- **Comments toggle** (OAuth required)
- **Stop Sharing** to revoke access

---

## Screen 11: Idea → Project Conversion Wizard

### Step 1: Choose Option

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Convert to Project                            Step 1 of 4  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Which option are you building?                                                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ◉  Archon Outfit                                                       │   │
│  │      Difficulty: ★★★★☆  •  Budget: $385  •  8 items                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ○  Casual Skin                                                         │   │
│  │      Difficulty: ★★☆☆☆  •  Budget: $120  •  4 items                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ○  All options (create separate projects)                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│                                                                                 │
│  [Cancel]                                                       [Next →]       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Review Data

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Convert to Project                            Step 2 of 4  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  What will carry over:                                                         │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ✓ Moodboard                                                            │   │
│  │    Shared — both Idea and Project will reference the same moodboard    │   │
│  │    You can continue adding to it from either place                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ✓ Budget Items (5 items, $385 total)                                   │   │
│  │    Copied — changes in project won't affect idea budget                 │   │
│  │    ☑ Copy all    ☐ Select items to copy                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ✓ Tags (12 tags)                                                       │   │
│  │    Copied — project starts with same tags                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│                                                                                 │
│  [← Back]                                                       [Next →]       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Project Details

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Convert to Project                            Step 3 of 4  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Project Details:                                                              │
│                                                                                 │
│  Project Name *                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Raiden Shogun - Archon Outfit                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Target Completion Date (optional)                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 📅 March 15, 2026                                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  For Event (optional)                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [Search events...                                               ] [+]   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  Linked: Anime Expo 2026 (July 3-6, Los Angeles)                              │
│                                                                                 │
│  Status                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Planning  ▼                                                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  [← Back]                                                       [Next →]       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 4: Confirm

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Convert to Project                            Step 4 of 4  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                              ✓                                                 │
│                                                                                 │
│  Ready to create your project!                                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Project: Raiden Shogun - Archon Outfit                                │   │
│  │  From: Raiden Shogun (Idea)                                            │   │
│  │  Option: Archon Outfit                                                  │   │
│  │  Event: Anime Expo 2026                                                 │   │
│  │  Deadline: March 15, 2026                                              │   │
│  │  Budget: $385 (5 items)                                                 │   │
│  │  Moodboard: Shared with idea                                           │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  The original idea will remain accessible. You can convert other             │
│  options to separate projects later.                                          │
│                                                                                 │
│                                                                                 │
│  [← Back]                                                [Create Project ✓]   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 12: Node Detail Drawer (Expanded View)

When user clicks/taps a node, a drawer opens with full details.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Canvas (dimmed)                     │  Node Details                    [×]   │
│                                      ├─────────────────────────────────────────┤
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · ┌─────┐ · · · · · · · · · · ·  │  📷 Instagram Post                      │
│  · · │ ••• │ · · · · · · · · · · ·  │  ─────────────────────────────────────  │
│  · · └─────┘ · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  ┌─────────────────────────────────┐    │
│  · · · · · · · · · · · · · · · · ·  │  │                                 │    │
│  · · · · · · · · · · · · · · · · ·  │  │      [Full Embed/Image]        │    │
│  · · · · · · · · · · · · · · · · ·  │  │                                 │    │
│  · · · · · · · · · · · · · · · · ·  │  │                                 │    │
│  · · · · · · · · · · · · · · · · ·  │  │                                 │    │
│  · · · · · · · · · · · · · · · · ·  │  └─────────────────────────────────┘    │
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  @cosplayartist                         │
│  · · · · · · · · · · · · · · · · ·  │  "Amazing Raiden Shogun fabric ref"     │
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  ─────────────────────────────────────  │
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  Your note:                             │
│  · · · · · · · · · · · · · · · · ·  │  ┌─────────────────────────────────┐    │
│  · · · · · · · · · · · · · · · · ·  │  │ Love this fabric technique!    │    │
│  · · · · · · · · · · · · · · · · ·  │  └─────────────────────────────────┘    │
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  Tags: [fabric] [reference] [+ Add]    │
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  Option: Archon Outfit                  │
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  Added: Jan 5, 2026                     │
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  [Open on Instagram ↗]                  │
│  · · · · · · · · · · · · · · · · ·  │                                         │
│  · · · · · · · · · · · · · · · · ·  │  ─────────────────────────────────────  │
│  · · · · · · · · · · · · · · · · ·  │  [Delete]                        [Save] │
│  · · · · · · · · · · · · · · · · ·  │                                         │
└──────────────────────────────────────┴─────────────────────────────────────────┘
```

**Key Elements:**
- **Full embed** (loads when drawer opens, not on canvas)
- **Editable note** field
- **Tag management**
- **External link** to original source
- **Delete action** with confirmation

---

## Color & Visual Language

### Node Type Colors

| Type | Background | Badge Color | Icon |
|------|------------|-------------|------|
| Image | White | Gray | 🖼️ |
| Instagram | White | Pink/Magenta #E1306C | 📷 |
| TikTok | White | Black #000000 | 🎬 |
| YouTube | White | Red #FF0000 | ▶️ |
| Pinterest | White | Red #E60023 | 📌 |
| Note | Yellow #FFF9C4 | None | 📝 |
| Budget | Green tint #E8F5E9 | Green | 💰 |
| Contact | Blue tint #E3F2FD | Blue | 👤 |

### Tag Colors

Tags use a palette of muted colors, auto-assigned based on hash of tag name:
- Soft purple, teal, coral, gold, sage, dusty rose, slate

---

## Next Steps

1. [x] Council review this design document
2. [x] Create low-fidelity wireframes for key screens
3. [ ] Update FEAT-006 spec to SFS-v2 format with decisions
4. [ ] Prototype Svelte Flow integration with one node type
5. [ ] User testing on touch interactions
6. [ ] Finalize component specs

---

---

# Revised Wireframes (2026-01-21)

The following wireframes reflect the updated hierarchical architecture.

## Full-Screen Canvas Editor

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🏠 > Team: Personal > 💡 Raiden Shogun > 👤 Archon Outfit      [×]            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  View: [Canvas ●] [Gallery] [List]       Filter: [All ▼]  [+ Add]  [Share]    │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│ · · ┌────────────────┐ · · · · · · · · · · ┌────────────────┐ · · · · · · · · · │
│ · · │ 📷 Instagram   │ · · · · · · · · · · │ 🎨 Palette     │ · · · · · · · · · │
│ · · │ ┌────────────┐ │ · · · · · · · · · · │ ┌──┬──┬──┬──┐  │ · · · · · · · · · │
│ · · │ │   image    │ │ · · · · · · · · · · │ │▓▓│▓▓│▓▓│▓▓│  │ · · · · · · · · · │
│ · · │ └────────────┘ │ · · · · · · · · · · │ └──┴──┴──┴──┘  │ · · · · · · · · · │
│ · · │ @cosplayer     │ · · · · · · · · · · │ Purple/gold    │ · · · · · · · · · │
│ · · │ [fabric]       │ · · · · · · · · · · │ [colors]       │ · · · · · · · · · │
│ · · └────────────────┘ · · · · · · · · · · └────────────────┘ · · · · · · · · · │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · ┌────────────────┐ · · · ┌────────────────┐ · · · · · · · · · · · · │
│ · · · · · · │ 📝 Note        │ · · · │ 💰 Budget      │ · · · · · · · · · · · · │
│ · · · · · · │                │ · · · │                │ · · · · · · · · · · · · │
│ · · · · · · │ Fabric needs:  │ · · · │ Wig - $85      │ · · · · · · · · · · · · │
│ · · · · · · │ - 3yd purple   │ · · · │ Arda Wigs      │ · · · · · · · · · · · · │
│ · · · · · · │ - 1yd gold     │ · · · │ [wig] [buy]    │ · · · · · · · · · · · · │
│ · · · · · · │ [fabric]       │ · · · └────────────────┘ · · · · · · · · · · · · │
│ · · · · · · └────────────────┘ · · · · · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · ┌────────────────┐ · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · │ 🧵 Fabric      │ · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · │ ┌────────────┐ │ · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · │ │  swatch    │ │ · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · │ └────────────┘ │ · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · │ Purple Satin   │ · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · │ $12/yd         │ · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · └────────────────┘ · · · · · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │
│                                                                                 │
│                                                     ┌─────────────────────┐     │
│                                                     │  [−]  [100%]  [+]   │     │
│                                                     │  [⊡ Fit]            │     │
│                                                     └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  5 items • Budget: $385                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Hierarchical Gallery View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🏠 > Team: Personal > 💡 Raiden Shogun                         [×]            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  View: [Canvas] [Gallery ●] [List]       Filter: [All ▼]  [+ Add]  [Share]    │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ 👤 CHARACTER     │  │ 👤 CHARACTER     │  │ 🔧 PROP          │              │
│  │                  │  │                  │  │                  │              │
│  │ ┌────┬────┐      │  │ ┌────┬────┐      │  │ ┌────┬────┐      │              │
│  │ │ 🎭 │ 🎭 │      │  │ │ 📷 │ 📷 │      │  │ │ 📷 │ 🎬 │      │              │
│  │ ├────┼────┤      │  │ ├────┼────┤      │  │ ├────┼────┤      │              │
│  │ │ 📷 │ 💰 │      │  │ │ 📝 │ 💰 │      │  │ │ 💰 │ 📝 │      │              │
│  │ └────┴────┘      │  │ └────┴────┘      │  │ └────┴────┘      │              │
│  │                  │  │                  │  │                  │              │
│  │ Raiden Shogun    │  │ Yae Miko         │  │ Polearm          │              │
│  │ 2 options        │  │ 6 items          │  │ 4 items          │              │
│  │ 12 items, $385   │  │ $220 budget      │  │ $80 budget       │              │
│  │                  │  │                  │  │                  │              │
│  │ Click to open →  │  │ Click to open →  │  │ Click to open →  │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │ 📁 GROUP         │  │ 📷 Instagram     │  │ 📝 Note          │              │
│  │                  │  │                  │  │                  │              │
│  │ ┌────┬────┐      │  │ ┌──────────────┐ │  │                  │              │
│  │ │ 🧵 │ 🧵 │      │  │ │              │ │  │ General notes    │              │
│  │ ├────┼────┤      │  │ │   [image]    │ │  │ for the build    │              │
│  │ │ 🧵 │ 🧵 │      │  │ │              │ │  │                  │              │
│  │ └────┴────┘      │  │ └──────────────┘ │  │                  │              │
│  │                  │  │                  │  │                  │              │
│  │ Wig Options      │  │ @photographer    │  │ [planning]       │              │
│  │ 4 items          │  │ [photoshoot]     │  │                  │              │
│  │                  │  │                  │  │                  │              │
│  │ Click to open →  │  │                  │  │                  │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  8 items • Budget: $685                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## References Tab in Flyout (Lite Preview)

```
┌─────────────────────────────────────────────────────────────────┐
│  Raiden Shogun                                          [×]     │
├─────────────────────────────────────────────────────────────────┤
│  [Overview]  [References ●]  [Budget]  [Notes]                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  View: [Gallery ●] [List]            [Open Full Moodboard →]   │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ 👤 Raiden  │  │ 👤 Yae     │  │ 🔧 Polearm │                │
│  │ ┌────┬────┐│  │ ┌────┬────┐│  │ ┌────┬────┐│                │
│  │ │ 🎭 │ 🎭 ││  │ │ 📷 │ 📷 ││  │ │ 📷 │ 🎬 ││                │
│  │ └────┴────┘│  │ └────┴────┘│  │ └────┴────┘│                │
│  │ 12 items   │  │ 6 items    │  │ 4 items    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ 📷 Insta   │  │ 📝 Note    │  │ 💰 $85     │                │
│  │ [image]    │  │ Fabric...  │  │ Wig        │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  CANVAS PREVIEW                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ││
│  │ · · [👤] · · · · · · [👤] · · · · · · [🔧] · · · · · · · · ││
│  │ · · · · · · · · [📁] · · · · · · · · · · · · · · · · · · · ││
│  │ · · · · · · · · · · · · · · [📷] · · · [📝] · · · · · · · · ││
│  │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ││
│  │                                              [⛶ Fullscreen] ││
│  └─────────────────────────────────────────────────────────────┘│
│  Pan/zoom to explore • Click to view details                   │
│                                                                 │
│  [+ Add Reference]                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Moodboard Navigation (Cmd+K)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│         ┌─────────────────────────────────────────────────────────────┐         │
│         │  🔍 Search moodboards...                            ⌘K     │         │
│         ├─────────────────────────────────────────────────────────────┤         │
│         │                                                             │         │
│         │  RECENT                                                     │         │
│         │  ┌─────────────────────────────────────────────────────┐   │         │
│         │  │ 👤 Raiden Shogun > 🎭 Archon Outfit                 │   │         │
│         │  │ 📋 Team: Personal                                    │   │         │
│         │  │ 🔧 Frieren > Staff Prop                              │   │         │
│         │  └─────────────────────────────────────────────────────┘   │         │
│         │                                                             │         │
│         │  MY BOARDS                                                  │         │
│         │  ┌─────────────────────────────────────────────────────┐   │         │
│         │  │ 🏠 Personal Moodboard                                │   │         │
│         │  │ ├── 📋 Team: Personal                                │   │         │
│         │  │ │   ├── 💡 Raiden Shogun                             │   │         │
│         │  │ │   │   ├── 👤 Raiden                                │   │         │
│         │  │ │   │   │   ├── 🎭 Archon Outfit                     │   │         │
│         │  │ │   │   │   └── 🎭 Casual Skin                       │   │         │
│         │  │ │   │   └── 🔧 Polearm                               │   │         │
│         │  │ │   └── 💡 Frieren                                   │   │         │
│         │  │ └── 📋 Team: DBZ Group                               │   │         │
│         │  │     └── 💡 Goku                                      │   │         │
│         │  └─────────────────────────────────────────────────────┘   │         │
│         │                                                             │         │
│         │  [Enter to select] [↑↓ to navigate] [Esc to close]         │         │
│         └─────────────────────────────────────────────────────────────┘         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Search: "goku ssj"
┌─────────────────────────────────────────────────────────────────────────────────┐
│         ┌─────────────────────────────────────────────────────────────┐         │
│         │  🔍 goku ssj                                                │         │
│         ├─────────────────────────────────────────────────────────────┤         │
│         │                                                             │         │
│         │  RESULTS                                                    │         │
│         │  ┌─────────────────────────────────────────────────────┐   │         │
│         │  │ 🎭 Super Saiyan                                      │   │         │
│         │  │    in: Team: DBZ > Goku                              │   │         │
│         │  ├─────────────────────────────────────────────────────┤   │         │
│         │  │ 📷 SSJ hair reference                                │   │         │
│         │  │    in: Team: DBZ > Goku > Super Saiyan               │   │         │
│         │  ├─────────────────────────────────────────────────────┤   │         │
│         │  │ 🎬 SSJ wig tutorial (TikTok)                         │   │         │
│         │  │    in: Team: DBZ > Goku > Super Saiyan               │   │         │
│         │  └─────────────────────────────────────────────────────┘   │         │
│         │                                                             │         │
│         └─────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Add Card Menu

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Card                                              [×]      │
├─────────────────────────────────────────────────────────────────┤
│  🔍 Search cards...                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  QUICK ADD                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ 📱     │ │ 🖼️     │ │ 📝     │ │ 💰     │                   │
│  │ URL    │ │ Image  │ │ Note   │ │ Budget │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📁 CONTAINERS                                                  │
│     📁 Group/Stack        Organize related items                │
│     👤 Character          A character you're cosplaying         │
│     🎭 Option/Variant     Different version (SSJ, casual)       │
│     🔧 Prop               Prop with sub-items                   │
│     📋 Moodboard Link     Link to another board                 │
│                                                                 │
│  🖼️ REFERENCES                                                  │
│     🖼️ Image              Upload an image                       │
│     📱 Social Media       Instagram, TikTok, YouTube, etc.      │
│     🔗 Link               Any URL with preview                  │
│     📝 Note               Text note with markdown               │
│                                                                 │
│  🎨 DESIGN                                                      │
│     🎨 Color Palette      Color swatches                        │
│     📏 Measurements       Body or garment measurements          │
│                                                                 │
│  🧵 MATERIALS                                                   │
│     🧵 Fabric             Fabric swatch with properties         │
│                                                                 │
│  👤 PEOPLE & MONEY                                              │
│     👤 Contact            Vendor, photographer, etc.            │
│     💰 Budget Item        Track costs                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Future Features (v1.5+)

### Shot List Card

```
┌────────────────────────────────────────────────────────────────────┐
│ 📸 Shot List: Raiden Photoshoot                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Shot 1: Hero Pose                                          [✓]   │
│  ┌────────────┐  Pose: Standing with polearm raised               │
│  │ [pose ref] │  Lighting: Dramatic backlight                     │
│  └────────────┘  Location: Near water                             │
│                                                                    │
│  Shot 2: Action Slash                                       [ ]   │
│  ┌────────────┐  Pose: Mid-swing attack                           │
│  │ [pose ref] │  Lighting: Side light, motion blur                │
│  └────────────┘                                                    │
│                                                                    │
│  [+ Add Shot]                                                      │
│                                                                    │
│  Linked: 📍 Japanese Garden • 👤 @photographer                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Auto Budget Card (v2.0+, requires edges)

```
┌────────────────────────────────────────────────────────────────────┐
│ 📊 Auto Budget: Raiden Shogun                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Linked Groups:                                                    │
│  ├── 👤 Raiden              [$385]                                │
│  │   ├── 🎭 Archon ●        $340  ← selected                      │
│  │   └── 🎭 Casual          $180                                  │
│  ├── 🔧 Polearm             [$120]                                │
│  └── 📁 Shared              [$95]                                 │
│                                                                    │
│  ─────────────────────────────────────────────────────────────     │
│  TOTAL (selected):           $555                                  │
│  Range: $480 — $640                                                │
│                                                                    │
│  Breakdown:                                                        │
│  ├── Fabrics    $180  ████████████░░░░  32%                       │
│  ├── Wig        $85   ██████░░░░░░░░░░  15%                       │
│  ├── Prop       $120  ████████░░░░░░░░  22%                       │
│  └── Other      $170  ███████████░░░░░  31%                       │
│                                                                    │
│  [Compare Options]  [Export]                                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Coupon Tracker (Separate Feature, v1.5)

```
┌────────────────────────────────────────────────────────────────────┐
│ 🏷️ Deals & Coupons                                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ACTIVE                                                            │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🛒 Joann Fabrics                                           │   │
│  │    50% off one regular item          SAVE50    [Copy]      │   │
│  │    Expires: Feb 28, 2026                                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 💇 Arda Wigs                                               │   │
│  │    Free shipping over $50            Auto-applied          │   │
│  │    Ongoing                                                 │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  UPCOMING SALES                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 🛒 Joann Fabrics — Spring Sale       Usually late March    │   │
│  │    [Set Reminder]                                          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  [+ Add Coupon]  [+ Add Sale Reminder]                             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

*This document captures design decisions and patterns for FEAT-006. Updated 2026-01-21 with hierarchical architecture, card types, and navigation.*
