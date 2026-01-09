# Design References - Feature 006: Moodboarding

**Created**: 2026-01-08  
**Status**: Research in Progress  
**Purpose**: Collect UI/UX references from existing tools to inform implementation decisions

---

## Research Objectives

1. **Set User Expectations**: Understand what users expect based on familiar tools
2. **Identify Best Practices**: Find proven patterns for canvas, tables, timelines
3. **Avoid Common Pitfalls**: Learn from anti-patterns in existing tools
4. **Establish Visual Language**: Define color, spacing, animation patterns
5. **Mobile Optimization**: Study touch-optimized interfaces

---

## Reference Categories

### 1. Infinite Canvas / Moodboard Tools

#### Milanote
**URL**: https://milanote.com  
**Focus**: Board layout, drag-and-drop UX, node types, connection UI

**Screenshots Needed**:
- [ ] Main board view with multiple nodes
- [ ] Node creation flow (add content modal)
- [ ] Connection/relationship creation
- [ ] Board sharing interface
- [ ] Mobile canvas view

**What to Study**:
- How do they handle zoom/pan smoothness?
- What's their minimap design?
- How do node connections appear during creation?
- What feedback happens on drag operations?
- Mobile: How do they handle touch gestures?

**Notes**:
<!-- Add observations here -->
```
Key Observations:
- 
- 
- 

What Works Well:
- 
- 

What to Avoid:
- 
- 

User Expectations:
- 
```

**Screenshots**: 
<!-- Drop screenshot files in /specs/006-brainstorming-moodboard/research-assets/ -->
<!-- Example: ![Milanote Board](../research-assets/milanote-board-01.png) -->

---

#### Miro
**URL**: https://miro.com  
**Focus**: Zoom/pan performance, minimap design, real-time collaboration, toolbar

**Screenshots Needed**:
- [ ] Infinite canvas with zoom controls
- [ ] Toolbar and tool palette
- [ ] Minimap navigation
- [ ] Real-time cursors (collaborative editing)
- [ ] Template picker

**What to Study**:
- How smooth is 60fps zoom/pan with 100+ objects?
- Where are controls positioned (corners, floating)?
- How do they indicate zoom level?
- What's the visual style of connections?

**Notes**:
```
Key Observations:
- 
- 

What Works Well:
- 
- 

What to Avoid:
- 
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Obsidian Canvas
**URL**: https://obsidian.md  
**Focus**: Node connections, graph view, relationship visualization, edge styling

**Screenshots Needed**:
- [ ] Canvas with connected nodes
- [ ] Edge creation UX
- [ ] Graph view (network visualization)
- [ ] Node selection and multi-select
- [ ] Color coding and grouping

**What to Study**:
- How do edges connect (straight, bezier, orthogonal)?
- How are edge labels displayed?
- What's the UX for creating connections?
- How does graph view differ from canvas view?

**Notes**:
```
Key Observations:
- 
- 

Connection Patterns:
- 
- 

Visual Style:
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### FigJam
**URL**: https://figma.com/figjam  
**Focus**: Sticky note aesthetic, collaborative features, commenting system

**Screenshots Needed**:
- [ ] Sticky note cards on canvas
- [ ] Cursor presence (multiplayer)
- [ ] Comment threads
- [ ] Stamp/emoji reactions
- [ ] Drawing/pen tools

**What to Study**:
- What makes sticky notes feel tactile?
- How do they show who's viewing/editing?
- Comment thread UX and positioning
- Emoji/reaction placement

**Notes**:
```
Key Observations:
- 
- 

Collaboration UX:
- 
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Notion Boards/Canvas
**URL**: https://notion.so  
**Focus**: Multiple view switching, database views, card design

**Screenshots Needed**:
- [ ] Gallery view (cards)
- [ ] Table view
- [ ] Timeline view
- [ ] View switcher UI
- [ ] Database properties panel

**What to Study**:
- How instant is view switching?
- Where is the view switcher positioned?
- How do they maintain context across views?
- Property/metadata editing patterns

**Notes**:
```
Key Observations:
- 
- 

View Switching:
- 
- 
```

**Screenshots**: 
<!-- Add here -->

---

### 2. Social Media Inspiration Tools

#### Pinterest
**URL**: https://pinterest.com  
**Focus**: Masonry grid layout, infinite scroll, pin interactions, save workflow

**Screenshots Needed**:
- [ ] Main feed (masonry grid)
- [ ] Pin detail view
- [ ] Save to board flow
- [ ] Board organization
- [ ] Pin overlay on hover

**What to Study**:
- Masonry layout performance with infinite scroll
- Image loading strategy (lazy load, blur-up)
- Hover state interactions
- "Save" button prominence and positioning
- Mobile: How does grid adapt?

**Notes**:
```
Key Observations:
- 
- 

Grid Performance:
- 
- 

Save/Bookmark UX:
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Are.na
**URL**: https://are.na  
**Focus**: Block-based content organization, channel system, multi-format content

**Screenshots Needed**:
- [ ] Channel view with mixed content
- [ ] Block detail view
- [ ] Connection between blocks
- [ ] Add to channel flow
- [ ] Search and discovery

**What to Study**:
- How do they display mixed content types (images, links, text)?
- What's their card design for different content?
- How do connections between blocks work?
- Metadata extraction from URLs

**Notes**:
```
Key Observations:
- 
- 

Multi-Format Handling:
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Raindrop.io
**URL**: https://raindrop.io  
**Focus**: Bookmark organization, metadata extraction, view modes, tag management

**Screenshots Needed**:
- [ ] Grid view of bookmarks
- [ ] List view
- [ ] URL metadata preview
- [ ] Tag sidebar
- [ ] Collections (folders)

**What to Study**:
- How is URL metadata displayed (favicon, title, description)?
- Tag management UX (add, filter, search)
- View mode switching
- Thumbnail generation quality

**Notes**:
```
Key Observations:
- 
- 

Metadata Display:
- 
- 

Tag System:
- 
```

**Screenshots**: 
<!-- Add here -->

---

### 3. Timeline Visualizations

#### Google Photos Timeline
**URL**: https://photos.google.com  
**Focus**: Chronological photo organization, date grouping, vertical scroll

**Screenshots Needed**:
- [ ] Main timeline feed (vertical)
- [ ] Date headers/markers
- [ ] Grouping by day/month/year
- [ ] Scroll performance with thousands of items
- [ ] Thumbnail loading strategy

**What to Study**:
- How are date markers styled and positioned?
- What's the grouping logic (auto or user-controlled)?
- Thumbnail size and aspect ratio handling
- Scroll performance optimization
- "Jump to date" navigation

**Notes**:
```
Key Observations:
- 
- 

Date Grouping:
- 
- 

Performance:
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Toggl Timeline
**URL**: https://toggl.com/track/timeline  
**Focus**: Horizontal timeline with items, zoom levels, time-based positioning

**Screenshots Needed**:
- [ ] Horizontal timeline view
- [ ] Zoom controls (day/week/month)
- [ ] Time blocks on timeline
- [ ] Today marker
- [ ] Timeline scrubbing

**What to Study**:
- How do items position along time axis?
- Zoom levels and transitions
- "Today" indicator design
- Dragging items on timeline
- Horizontal scroll UX

**Notes**:
```
Key Observations:
- 
- 

Zoom Behavior:
- 
- 
```

**Screenshots**: 
<!-- Add here -->

---

### 4. Data Table Interfaces

#### Airtable
**URL**: https://airtable.com  
**Focus**: Table view with rich content, inline editing, view customization

**Screenshots Needed**:
- [ ] Grid view with various column types
- [ ] Inline cell editing
- [ ] Column type selector
- [ ] Row expansion/detail view
- [ ] Multi-select and bulk actions
- [ ] View options panel

**What to Study**:
- Inline editing UX (click vs double-click)
- Cell type variety (text, tags, links, images)
- Column resizing and reordering
- Row selection patterns
- Bulk action toolbar

**Notes**:
```
Key Observations:
- 
- 

Inline Editing:
- 
- 

Column Types:
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Linear
**URL**: https://linear.app  
**Focus**: Fast table performance, keyboard shortcuts, filters, minimal design

**Screenshots Needed**:
- [ ] Issue list view
- [ ] Quick filters
- [ ] Keyboard shortcuts modal
- [ ] Row hover states
- [ ] Multi-select interface

**What to Study**:
- Performance with large datasets
- Keyboard-first navigation
- Filter chip design
- Minimal, clean aesthetic
- Status indicators and badges

**Notes**:
```
Key Observations:
- 
- 

Keyboard Navigation:
- 
- 

Performance:
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Notion Database
**URL**: https://notion.so  
**Focus**: Multi-view switching (table/board/timeline), property visibility

**Screenshots Needed**:
- [ ] Database table view
- [ ] Property configuration panel
- [ ] View switcher in action
- [ ] Formula/rollup columns
- [ ] Filter and sort UI

**What to Study**:
- How do properties map across views?
- View state persistence
- Property show/hide controls
- Advanced column types (formula, rollup)

**Notes**:
```
Key Observations:
- 
- 

View Persistence:
- 
```

**Screenshots**: 
<!-- Add here -->

---

### 5. Budget / Finance Tools

#### YNAB (You Need A Budget)
**URL**: https://youneedabudget.com  
**Focus**: Budget itemization, category management, budget vs actual comparison

**Screenshots Needed**:
- [ ] Budget category view
- [ ] Transaction entry
- [ ] Budget vs actual columns
- [ ] Category targets/goals
- [ ] Mobile budget view

**What to Study**:
- How are categories organized (hierarchical)?
- Visual indicators for over/under budget
- Transaction detail form
- Color coding and status

**Notes**:
```
Key Observations:
- 
- 

Budget Display:
- 
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Splitwise
**URL**: https://splitwise.com  
**Focus**: Expense tracking, person linking, item-level detail, payment status

**Screenshots Needed**:
- [ ] Expense list
- [ ] Add expense form
- [ ] Split calculation
- [ ] Balance summary
- [ ] Settlement flow

**What to Study**:
- How do they link people to expenses?
- Item-level breakdown UI
- Split calculation display
- Status indicators (paid/unpaid)

**Notes**:
```
Key Observations:
- 
- 

Contact Linking:
- 
```

**Screenshots**: 
<!-- Add here -->

---

### 6. Sharing & Collaboration

#### Figma Share Links
**URL**: https://figma.com  
**Focus**: Public sharing without account, commenting, guest access

**Screenshots Needed**:
- [ ] Share modal
- [ ] Public link view (as guest)
- [ ] Comment thread
- [ ] Guest commenting UX
- [ ] Permission settings

**What to Study**:
- How do guests interact without accounts?
- Comment placement and threading
- Share link generation UX
- Permission granularity

**Notes**:
```
Key Observations:
- 
- 

Guest Experience:
- 
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Loom Share
**URL**: https://loom.com  
**Focus**: Shareable video links, emoji reactions, engagement without friction

**Screenshots Needed**:
- [ ] Share link page
- [ ] Emoji reaction bar
- [ ] Comment section
- [ ] Viewer analytics
- [ ] CTA buttons on share page

**What to Study**:
- Emoji reaction placement and variety
- Comment input UX
- Share page layout and branding
- Low-friction engagement patterns

**Notes**:
```
Key Observations:
- 
- 

Engagement Patterns:
- 
```

**Screenshots**: 
<!-- Add here -->

---

### 7. Mobile-First Canvas Tools

#### Concepts App
**URL**: https://concepts.app  
**Focus**: Touch-optimized infinite canvas, gesture controls, tool palettes

**Screenshots Needed**:
- [ ] Canvas with touch gestures
- [ ] Tool palette (mobile)
- [ ] Gesture reference/tutorial
- [ ] Zoom controls
- [ ] Layer panel

**What to Study**:
- How are gestures taught to users?
- Tool palette placement and size
- Pinch-zoom smoothness
- Two-finger gestures (undo, pan)

**Notes**:
```
Key Observations:
- 
- 

Touch Gestures:
- 
- 
```

**Screenshots**: 
<!-- Add here -->

---

#### Procreate
**URL**: https://procreate.com  
**Focus**: Canvas manipulation, layer system, natural interactions

**Screenshots Needed**:
- [ ] Canvas zoom/pan
- [ ] Gesture shortcuts
- [ ] Layer stack
- [ ] Quick menu
- [ ] Touch interface design

**What to Study**:
- Pinch-zoom feel and responsiveness
- Two-finger gestures
- Tool accessibility on small screens
- Performance with complex canvases

**Notes**:
```
Key Observations:
- 
- 

Gesture Design:
- 
```

**Screenshots**: 
<!-- Add here -->

---

## Competitive Analysis Matrix

Fill this in as you explore each tool:

| Feature | Milanote | Miro | Pinterest | Notion | Airtable | Our App |
|---------|----------|------|-----------|--------|----------|---------|
| **Infinite Canvas** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Node Connections** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Social Media Embeds** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Budget Tracking** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Multiple Views** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Timeline View** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Table View** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Mobile Canvas** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Public Sharing** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **OAuth Comments** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Offline First** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |
| **Contact Linking** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ Planned |

**Legend**: ✅ Has, ⚠️ Partial, ❌ None, ⬜ Research pending

---

## User Expectation Audit

### Question 1: When users see an "infinite canvas", what do they expect?

**Based on**: Milanote, Miro, FigJam, Notion Canvas

**Expected Behaviors**:
- 
- 
- 

**Must-Have Features**:
- 
- 

**Nice-to-Have Features**:
- 
- 

---

### Question 2: When users paste an Instagram URL, what should happen?

**Based on**: Pinterest save pin, Are.na block, Notion embed

**Expected Behaviors**:
- 
- 

**Visual Feedback**:
- 
- 

**Error Handling**:
- 
- 

---

### Question 3: What does a "timeline view" look like?

**Based on**: Google Photos, Facebook Timeline, Notion timeline

**Expected Layout**:
- 
- 

**Date Grouping**:
- 
- 

**Navigation**:
- 
- 

---

### Question 4: How should table inline editing work?

**Based on**: Airtable, Notion, Linear

**Expected Interaction**:
- 
- 

**Keyboard Behavior**:
- 
- 

**Auto-Save**:
- 
- 

---

### Question 5: What's the standard for shareable links?

**Based on**: Figma, Loom, Google Docs

**Expected Controls**:
- 
- 

**Access Levels**:
- 
- 

**Security**:
- 
- 

---

## Design System References

### Color Palettes

#### Tool 1: [Name]
**Primary Colors**: 
- 
- 

**Accent Colors**: 
- 

**Neutral Colors**: 
- 

**Why it works**: 

---

#### Tool 2: [Name]
**Primary Colors**: 
- 

**Why it works**: 

---

### Typography

#### Tool 1: [Name]
**Fonts Used**: 
- 

**Heading Sizes**: 
- 

**Body Text**: 
- 

**Why it works**: 

---

### Spacing & Layout

#### Tool 1: [Name]
**Spacing Scale**: 
- 

**Grid System**: 
- 

**Why it works**: 

---

### Animation & Transitions

#### Tool 1: [Name]
**Transition Duration**: 
- 

**Easing Functions**: 
- 

**Animated Elements**: 
- 

**Why it works**: 

---

## Key Patterns to Adopt

### Pattern 1: [Name]
**Seen in**: [Tool names]

**Description**: 

**Why adopt**: 

**Implementation notes**: 

---

### Pattern 2: [Name]
**Seen in**: [Tool names]

**Description**: 

**Why adopt**: 

**Implementation notes**: 

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: [Name]
**Seen in**: [Tool names]

**Description**: 

**Why avoid**: 

**Alternative approach**: 

---

### Anti-Pattern 2: [Name]
**Seen in**: [Tool names]

**Description**: 

**Why avoid**: 

---

## Mobile-Specific Findings

### Touch Gestures
**Best practices from**: 

- 
- 

### Tool Placement
**Best practices from**: 

- 
- 

### Performance
**Best practices from**: 

- 
- 

---

## Accessibility Findings

### Keyboard Navigation
**Best practices from**: 

- 
- 

### Screen Reader Support
**Best practices from**: 

- 
- 

### Color Contrast
**Best practices from**: 

- 
- 

---

## Next Steps

After completing research:

- [ ] Create design mockups based on collected references
- [ ] Define color palette and typography
- [ ] Document component library patterns
- [ ] Create prototype for key interactions (canvas, view switching)
- [ ] Test prototype with users
- [ ] Refine based on feedback
- [ ] Begin implementation (start with tasks.md)

---

## Research Assets

Store screenshots and recordings in:
```
/specs/006-brainstorming-moodboard/research-assets/
├── canvas/
│   ├── milanote-board-01.png
│   ├── miro-canvas-01.png
│   └── ...
├── tables/
│   ├── airtable-grid-01.png
│   └── ...
├── timelines/
│   └── ...
├── mobile/
│   └── ...
└── misc/
    └── ...
```

---

**Status**: 🔍 Research in progress - Fill in sections as you explore each tool


