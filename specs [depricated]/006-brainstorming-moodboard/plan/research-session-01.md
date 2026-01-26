# Research Session 01 - Design Reference Collection

**Date**: 2026-01-08  
**Status**: Completed  
**Total Screenshots Collected**: 15  
**Duration**: ~30 minutes  

---

## Executive Summary

Successfully collected design references from 8 major platforms covering canvas interfaces, mobile UI patterns, moodboards, tables, and timelines. The research provides concrete visual examples of:

1. **Infinite canvas implementations** (Miro, Milanote, FigJam)
2. **Mobile UI patterns** (ScreensDesign - 2,100+ apps)
3. **Moodboard layouts** (Pinterest, Miro templates)
4. **Table interfaces** (Airtable, Notion)
5. **Timeline views** (Various mobile apps)

---

## 📊 Collection Summary by Platform

### 1. **Dribbble** (dribbble.com)
**Status**: ✅ Successfully collected  
**Access**: Public search available  
**Value**: High - curated design work

#### Screenshots Collected:
- `misc/dribbble-moodboard-search.png` - Moodboard design examples
- `misc/dribbble-canvas-interface.png` - Canvas UI patterns

#### Key Observations:
- **Moodboard Search**: Found 1,000+ visual design examples
- **Canvas Interface Search**: Modern canvas UI patterns with clean aesthetics
- **Design Quality**: Professional, polished designs from practicing designers
- **Diversity**: Wide range of styles and approaches

**Insights for Implementation**:
- Moodboards favor grid-based layouts with varied image sizes
- Popular color schemes: pastels, high contrast, monochromatic
- Common patterns: masonry grids, free-form arrangements, sectioned layouts


### 2. **ScreensDesign** (screensdesign.com)
**Status**: ✅ Excellent resource  
**Access**: Public browsing, 2,100+ iOS apps  
**Value**: Very High - real production apps

#### Screenshots Collected:
- `mobile/screensdesign-homepage.png` - Platform overview
- `mobile/screensdesign-gallery-search.png` - Gallery UI examples  
- `mobile/screensdesign-board-search.png` - Board interface patterns (Zalando, Luma)
- `timelines/screensdesign-timeline-search.png` - Timeline implementations

#### Key Observations:

**Gallery Patterns**:
- **Greg (Plant app)**: Dark mode with image thumbnails in grid
- **Voilà AI**: Gallery with filter options and category tags
- **Common patterns**: Card-based grids, thumbnail previews, quick filters

**Board Interfaces**:
- **Zalando Fashion**: Pinterest-style masonry layout with product cards
- **Luma Dream Machine**: Card-based board with visual thumbnails
- **Pattern**: "Favorites/Boards/Owned" tab structure is standard

**Timeline Patterns**:
- **Fishbrain**: Hourly timeline with bar charts showing activity
- **Aumio (Sleep app)**: Progress timeline with visual player controls
- **Key insight**: Timelines work best with visual anchors (icons, charts, progress bars)

**Insights for Implementation**:
- Mobile apps favor **vertical scrolling** over infinite canvas
- **Touch targets** need to be large (min 44x44px)
- **Filtering** is essential for galleries (by date, category, tags)
- **Preview cards** should show key info without opening item
- **Dark mode** is widely implemented and expected


### 3. **Miro** (miro.com)
**Status**: ✅ Excellent resource  
**Access**: Public templates, 7,000+ boards  
**Value**: Very High - production moodboard tool

#### Screenshots Collected:
- `canvas/milanote-homepage-hero.png` - Early capture
- `canvas/miro-templates-homepage.png` - Template library overview
- `canvas/miro-brainstorming-templates.png` - Brainstorming category
- `canvas/miro-mood-board-templates.png` - 9 mood board templates

#### Key Observations:

**Mood Board Templates** (9 templates reviewed):
1. **Product Vision Canvas** - 6K uses, 977 likes
2. **Mood Check In** - 2.3K uses, 171 likes  
3. **Ultimate Storyboarding Template** - 1.5K uses, 353 likes
4. **MoodBoard** (basic) - 825 uses, 68 likes
5. **Mood Board Template** (official Miro) - 215 uses
6. **Moodboarding** (AI-accelerated) - 112 uses
7. **World Creator Moodboard** (AI) - 64 uses
8. **Awesome Moodboard** - 50 uses
9. **Team Reflection Mood Board** - 33 uses

**Template Patterns**:
- **Grid-based sections** with headers/categories
- **Sticky note style** cards for quick ideas
- **Image placeholders** with drag-and-drop areas
- **Color coding** by category or priority
- **Collaborative cursors** showing team members

**Insights for Implementation**:
- **Template approach**: Users want starting points, not blank canvas
- **AI integration**: New trend - "AI-accelerated" templates gaining traction
- **Social proof**: Usage stats matter (shows template value)
- **Visual hierarchy**: Clear sections with headers/dividers
- **Mobile responsive**: Miro works on mobile but desktop-first


### 4. **Pinterest** (pinterest.com)
**Status**: ✅ Collected  
**Access**: Limited (requires account for full access)  
**Value**: High - real-world moodboard inspiration

#### Screenshots Collected:
- `misc/pinterest-moodboard-search.png` - Moodboard grid layout

#### Key Observations:
- **Masonry grid layout** - variable height cards, fixed width
- **Visual density**: Maximum images visible without scrolling
- **Filter tags**: Aesthetic, Inspiration, Pink, Design, Concept, etc.
- **Quick actions**: Save, more options on hover
- **Image quality**: High-res images, professional photography

**Popular Moodboard Themes** (from search):
- Aesthetic/color-themed boards (Pink, Blue, Green, Brown)
- Seasonal themes (Winter, Summer, 2026)
- Style boards (Fashion, Deco, Interior design)
- Purpose boards (Vision board, Inspiration, Ideas)

**Insights for Implementation**:
- **Masonry layout** is THE standard for visual boards
- **Color filtering** is popular for moodboards
- **Hover states** should reveal quick actions
- **Infinite scroll** expected for browsing
- **Visual search** (find similar images) is valuable


### 5. **Notion** (notion.com)
**Status**: ✅ Collected  
**Access**: Public marketing site  
**Value**: Medium - workspace patterns

#### Screenshots Collected:
- `misc/notion-homepage.png` - Workspace overview

#### Key Observations:
- **Unified workspace**: "One workspace. Zero busywork."
- **AI integration**: Notion Agent featured prominently
- **Flexible views**: Table, board, timeline, calendar, gallery
- **Collaboration**: Real-time editing, comments, mentions
- **Mobile apps**: iOS, Android, Mac, Windows support

**Insights for Implementation**:
- **Database views**: Users want multiple ways to view same data
- **Inline editing**: Click to edit any field directly
- **Properties/metadata**: Rich field types (date, person, select, etc.)
- **Templates**: Essential for onboarding and productivity
- **AI assistance**: Expected for content generation


### 6. **FigJam** (figma.com/figjam)
**Status**: ✅ Collected  
**Access**: Public marketing site  
**Value**: High - collaborative canvas

#### Screenshots Collected:
- `canvas/figjam-homepage.png` - Canvas interface example

#### Key Observations:
- **Sticky notes**: Primary building block (colored, editable)
- **Connectors**: Lines between elements with labels
- **Stamps/reactions**: Hearts, emojis for feedback
- **Timer widget**: Built-in for time-boxing activities
- **Voting**: Built-in voting/prioritization tools
- **Playful design**: Casual, friendly aesthetic

**Canvas Features Visible**:
- "How might we" prompts as headers
- Sticky notes organized in columns
- Color coding by theme (orange, pink, purple, green)
- User avatars showing collaboration
- Timer in corner for workshops

**Insights for Implementation**:
- **Casual aesthetic**: Moodboarding is creative, not corporate
- **Quick creation**: One-click to add sticky note
- **Visual affordances**: Clear what's clickable/draggable
- **Collaboration indicators**: Show who's where
- **Workshop tools**: Timer, voting, stamps enhance brainstorming


### 7. **Airtable** (airtable.com)
**Status**: ✅ Collected  
**Access**: Public marketing site  
**Value**: High - table/database patterns

#### Screenshots Collected:
- `tables/airtable-platform.png` - Platform overview

#### Key Observations:
- **Spreadsheet meets database**: Familiar table interface
- **Rich field types**: Attachments, links, checkboxes, ratings
- **Multiple views**: Grid, Kanban, Calendar, Gallery, Form
- **AI assistant**: Riley AI for platform guidance
- **Automation**: Built-in workflow automation
- **Custom interfaces**: Build views on top of data

**Insights for Implementation**:
- **Progressive disclosure**: Start simple, reveal power features
- **Field type icons**: Visual indicators for data types
- **Inline attachments**: Show image thumbnails in cells
- **View switching**: Easy toggle between perspectives
- **AI chat**: Helpful for guidance, not intrusive


### 8. **Milanote** (milanote.com)
**Status**: ✅ Early capture  
**Access**: Public marketing site  
**Value**: High - direct competitor

#### Screenshots Collected:
- `canvas/milanote-homepage-hero.png` - Board interface

#### Key Observations:
- **Card-based**: Everything is a card (images, text, links, files)
- **Columns**: Optional column structure for organization
- **Drag and drop**: Fluid repositioning
- **Visual hierarchy**: Large images, smaller text cards
- **Board preview**: Shows actual board in hero image
- **Collections**: Group related boards

**Insights for Implementation**:
- **Hybrid approach**: Canvas + optional structure (columns/sections)
- **Card metaphor**: Consistent interaction model
- **Image-first**: Large, beautiful images are primary
- **Text as secondary**: Supporting notes, not main content
- **Collections**: Essential for organizing multiple boards

---

## 🎯 Key Patterns Identified

### Canvas/Moodboard Patterns:

1. **Layout Approaches**:
   - **Free-form canvas**: Drag anywhere (Miro, FigJam)
   - **Masonry grid**: Variable height, fixed width (Pinterest)
   - **Hybrid**: Optional structure on canvas (Milanote)
   - **Sectioned**: Defined areas with headers (Miro templates)

2. **Node/Card Types**:
   - Images (with or without metadata)
   - Text notes/sticky notes
   - Links (URL preview cards)
   - Files/attachments
   - Embeds (videos, social posts)
   - Connections/arrows between nodes

3. **Interaction Patterns**:
   - **Drag to position**: Core interaction
   - **Click to edit**: Inline editing
   - **Hover for actions**: Delete, duplicate, etc.
   - **Zoom/pan**: Essential for large boards
   - **Multi-select**: Shift+click or drag-select

4. **Collaboration Features**:
   - Real-time cursors
   - User avatars
   - Comments/reactions
   - Activity feed
   - Share permissions (view/edit)

### Mobile Patterns:

1. **Navigation**:
   - Bottom tab bar (primary nav)
   - Top filters/search
   - Swipe gestures (back, between tabs)
   - Pull to refresh

2. **Lists/Grids**:
   - Vertical scrolling (not canvas)
   - Card-based items
   - Quick filters at top
   - Infinite scroll/pagination

3. **Touch Interactions**:
   - Large tap targets (44x44px min)
   - Swipe actions (delete, archive)
   - Long-press for menu
   - Pinch to zoom (where applicable)

### Table/Database Patterns:

1. **View Types**:
   - **Grid**: Spreadsheet-style
   - **Kanban**: Card columns
   - **Gallery**: Image-focused grid
   - **Calendar**: Date-based
   - **Timeline**: Gantt-style

2. **Field Types**:
   - Text, Number, Date
   - Single/Multi-select (tags)
   - Checkbox, Rating
   - Attachment (images/files)
   - Link to record, Lookup
   - Formula, Rollup

---

## 💡 Design Principles Extracted

### 1. **Progressive Disclosure**
- Start with simple, clean interface
- Reveal advanced features as needed
- Don't overwhelm new users

### 2. **Visual Hierarchy**
- Large, beautiful images are focal points
- Text is supporting, not primary
- Clear sections/headers for organization

### 3. **Immediate Feedback**
- Hover states show affordances
- Drag handles appear on interaction
- Visual feedback for every action

### 4. **Collaborative by Default**
- Show who else is here
- Real-time updates
- Easy sharing

### 5. **Mobile-First (for mobile views)**
- Vertical scrolling, not canvas
- Touch-friendly targets
- Simplified interactions

### 6. **Template-Driven**
- Don't start from blank
- Curated starting points
- Examples inspire usage

---

## 🚀 Recommendations for Feature 006

### 1. **Canvas Implementation** (@xyflow/svelte)
- Start with **free-form canvas** (like Miro)
- Add **optional grid snapping** (toggle on/off)
- Implement **minimap** for navigation
- Support **zoom levels**: 25%, 50%, 75%, 100%, 150%, 200%

### 2. **Node Types** (Priority Order)
1. **Image nodes**: Drag from device, URL, or library
2. **Text nodes**: Quick notes, headings
3. **Link nodes**: Social media embeds (US1)
4. **Section nodes**: Group related items

### 3. **Mobile Strategy**
- **Responsive views**, not direct canvas on mobile
- **Gallery view** for browsing nodes
- **Detail view** for editing single node
- **Quick add** button for new images

### 4. **Social Media Integration** (US1)
- **URL paste detection**: Auto-create preview card
- **Platforms**: Instagram, Pinterest, TikTok, Twitter/X, Behance
- **Link metadata**: Fetch title, image, description
- **Cache previews**: Store locally, don't refetch

### 5. **Budget Integration** (US3)
- **Node metadata**: Add cost, vendor, contact
- **Table view**: Switchable view showing all items in spreadsheet
- **Budget totals**: Calculate automatically
- **Export**: CSV, PDF for sharing

### 6. **Multiple Options** (US2)
- **Option tabs**: Switch between costume versions
- **Comparison view**: Side-by-side layout
- **Copy nodes**: Duplicate to new option
- **Status badges**: Planning, In Progress, Selected

---

## 📂 Reference Organization

All screenshots are organized in `/specs/006-brainstorming-moodboard/research-assets/`:

```
research-assets/
├── canvas/           (4 files)
│   ├── milanote-homepage-hero.png
│   ├── miro-templates-homepage.png
│   ├── miro-brainstorming-templates.png
│   ├── miro-mood-board-templates.png
│   └── figjam-homepage.png
├── mobile/          (3 files)
│   ├── screensdesign-homepage.png
│   ├── screensdesign-gallery-search.png
│   └── screensdesign-board-search.png
├── timelines/       (1 file)
│   └── screensdesign-timeline-search.png
├── tables/          (1 file)
│   └── airtable-platform.png
├── misc/            (6 files)
│   ├── dribbble-moodboard-search.png
│   ├── dribbble-canvas-interface.png
│   ├── mobbin-homepage.png
│   ├── pinterest-moodboard-search.png
│   ├── notion-homepage.png
│   └── (1 duplicate)
└── [budgets/, sharing/ - empty for now]
```

**Total**: 15 screenshots

---

## 🎬 Next Steps

### Immediate (Before Implementation):
1. ✅ **Collect references** - DONE
2. ⏳ **Annotate screenshots** - Mark key UI elements
3. ⏳ **Create component spec** - Define our node types
4. ⏳ **Design mockups** - Adapt patterns to Cosplans aesthetic

### During Implementation:
1. Reference specific screenshots for each component
2. Test interactions match expectations
3. Validate on mobile devices
4. A/B test layout approaches

### Post-Launch:
1. Monitor user behavior (do they use canvas or grid?)
2. Collect feedback on node types (what's missing?)
3. Iterate on social media preview accuracy
4. Expand template library based on usage

---

## 📎 Additional Resources to Explore

### Still Needed:
- [ ] **Mobbin** - Requires account, shows 576K screens
- [ ] **Behance** - Design portfolios with moodboards
- [ ] **Awwwards** - Award-winning web designs
- [ ] **Screenlane** - More mobile patterns

### Tool-Specific Deep Dives:
- [ ] Miro board examples (actual boards, not templates)
- [ ] Milanote tutorial videos
- [ ] FigJam templates library
- [ ] Airtable gallery view examples

---

## 🔗 References

All platforms visited and documented:

1. [Dribbble - Moodboard Search](https://dribbble.com/search/moodboard)
2. [Dribbble - Canvas Interface](https://dribbble.com/search/canvas%20interface)
3. [ScreensDesign - Gallery](https://screensdesign.com/search/?q=gallery)
4. [ScreensDesign - Board](https://screensdesign.com/search/?q=board)
5. [ScreensDesign - Timeline](https://screensdesign.com/search/?q=timeline)
6. [Miro - Mood Board Templates](https://miro.com/templates/mood-board/)
7. [Pinterest - Moodboard Search](https://www.pinterest.com/search/pins/?q=moodboard)
8. [Notion - Product Page](https://www.notion.com/product)
9. [FigJam - Homepage](https://www.figma.com/figjam/)
10. [Airtable - Platform](https://www.airtable.com/platform)

---

**Session Complete**: Ready for implementation phase with comprehensive visual references and documented patterns.
