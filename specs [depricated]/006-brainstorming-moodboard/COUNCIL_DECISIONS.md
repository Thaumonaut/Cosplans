# Council Design Decisions - FEAT-006 Moodboard

**Date**: 2026-01-23  
**Status**: In Progress - Working Session  
**Purpose**: Document design decisions from council role-play session

---

## Decision Log

### Decision 1: Mobile Screen Real Estate & Progressive Disclosure

**Question**: With context bar, toolbars, and inspector on mobile, how do we preserve canvas space? Should we hide canvas view entirely on mobile?

**Discussion**: 
- Current mobile UI already works well with existing canvas space
- Rather than hiding elements or views, use progressive disclosure to reduce visual clutter
- Keep canvas view available on mobile (some power users have tablets/large phones)

**Decision**: 
1. **Context Bar (Mobile)**: Progressive disclosure approach
   - **Collapsed state** (default): Show only container name + expand button
     - Height: ~44px
     - Content: "🏠 > Link (BotW) [⌄]"
   - **Expanded state** (on tap): Show full metadata + actions
     - Slides down to reveal: Series, Budget, Quick Actions (Edit, Add, View)
     - Auto-collapses after 10 seconds of inactivity or when user taps canvas
   
2. **Bottom Toolbar**: Use dropdown menus instead of always-visible buttons
   - Show 3-4 primary actions as icons
   - "More" menu (⋮) contains secondary actions
   - Reduces cognitive load while maintaining access

3. **Inspector Panel**: Already a drawer (bottom slide-up) - no change needed

4. **Keep both Canvas and Gallery views available on mobile**
   - Default to gallery on mobile (< 768px) for better UX
   - Allow user to switch to canvas if desired
   - Save preference per-user

**Rationale**: 
- Progressive disclosure maintains functionality while reducing clutter
- Current mobile UI is already working - don't break what works
- More steps is okay if each step is clear and purposeful
- Power users (tablet, large phone) benefit from canvas availability

**Implementation Notes**:
- Context bar has two states: collapsed (44px) and expanded (~100-120px)
- Smooth animation (200ms ease-out) on expand/collapse
- Tap outside expanded context bar to collapse
- Bottom toolbar: Primary actions always visible, secondary in dropdown

**Bottom Toolbar Priority (Mobile)**:
```
┌──────────────────────────────────────────┐
│   [⚡ Add]  [👁️ View]  [🔍 Search]  [⋮]  │
└──────────────────────────────────────────┘
```

**Always Visible (4 buttons)**:
1. **⚡ Add** - Quick Add menu (primary action for content capture)
2. **👁️ View** - View mode switcher (Canvas/Gallery/Table/Timeline/List/Graph)
3. **🔍 Search** - Search nodes by title, tags, content
4. **⋮ More** - Overflow menu with secondary actions

**More Menu (⋮) Contents**:
- 🏷️ Tags & Filter (opens filter sidebar)
- 🎯 Multi-Select Mode
- 📤 Share Moodboard
- ↩️ Undo / ↪️ Redo
- ⚙️ Moodboard Settings
- 📥 Import/Export
- ❓ Help & Tutorial

**Collapsed State Layout**:
```
┌─────────────────────────────────────┐
│ 🏠 > ... > Princess Zelda      [⌄] │  (44px height)
└─────────────────────────────────────┘
```
- Breadcrumb truncates middle levels if too long (shows "..." between home and current)
- Current container name shows full width available, truncates with "..." if needed
- Expand button [⌄] always visible on right

**Expanded State Layout**:
```
┌─────────────────────────────────────┐
│ 🏠 > Group: PAX > Princess Zelda    │
├─────────────────────────────────────┤
│ # Princess Zelda                     │  (Large title)
│ ## Version: Breath of the Wild      │  (Subtitle/variant)
│ Budget: $250 | Series: Zelda        │  (Metadata row)
├─────────────────────────────────────┤
│ [Edit] [Add Content] [View ▼] [⋮]  │  (Action buttons)
└─────────────────────────────▲───────┘
                               (Tap to collapse)
```
- Expanded height: ~120-140px (depends on content)
- Full breadcrumb path visible (wraps if needed)
- Title (h1 size) + Subtitle (h2 size) hierarchy
- Key metadata in readable format
- Action buttons as pill-style buttons

**Impact**:
- UX: Cleaner mobile interface, less overwhelming for new users
- Components: ContextBar needs collapsed/expanded states
- Components: BottomToolbar needs dropdown menu component
- Minimal canvas space impact: Only 44px context bar when collapsed

---

### Decision 2: Context Bar Accessibility & Truncation

**Question**: How do we handle breadcrumb truncation on narrow screens and ensure screen reader/keyboard accessibility?

**Truncation Decision**:
- **Algorithm**: Show only home icon + current container name when collapsed
- **Pattern**: `🏠 > ... > [Current Container Name]`
- **Example**: `All > Group: Convention Gear > Container: PAX East 2026 > Container: Camera Setups > Container: Lighting Option A`
  - Collapsed shows: `🏠 > ... > Lighting Option A`
  - Full path visible when expanded

**Screen Reader Behavior**:
- **Collapsed state announcement**: "Breadcrumb navigation, 5 levels, currently at Lighting Option A, expand for full path"
- **Expanded state**: Full path announced with each level
- Uses `<div role="navigation" aria-label="Breadcrumb navigation">`

**Keyboard Navigation**:
- **Expand**: Spacebar or Enter when breadcrumb focused
- **Navigate actions**: Tab through Edit, Add Content, View, More buttons
- **Collapse**: Tab away (auto-collapse) or Esc key

**ARIA Implementation**:

**Collapsed State**:
```html
<div 
  role="navigation" 
  aria-label="Breadcrumb navigation"
  class="context-bar collapsed"
>
  <button
    aria-expanded="false"
    aria-label="Breadcrumb navigation, 5 levels, currently at Lighting Option A, expand for full path"
    class="breadcrumb-toggle"
  >
    <span aria-hidden="true">🏠 > ... > Lighting Option A</span>
    <span class="expand-icon" aria-hidden="true">⌄</span>
  </button>
</div>
```

**Expanded State**:
```html
<div 
  role="navigation" 
  aria-label="Breadcrumb navigation"
  class="context-bar expanded"
>
  <nav aria-label="Container hierarchy">
    <ol class="breadcrumb-list">
      <li>
        <a href="#" aria-label="Navigate to All">
          <span aria-hidden="true">🏠</span>
          <span class="sr-only">Home</span>
        </a>
      </li>
      <li>
        <a href="#" aria-label="Navigate to Convention Gear">
          Group: Convention Gear
        </a>
      </li>
      <li>
        <a href="#" aria-label="Navigate to PAX East 2026">
          Container: PAX East 2026
        </a>
      </li>
      <li>
        <a href="#" aria-label="Navigate to Camera Setups">
          Container: Camera Setups
        </a>
      </li>
      <li aria-current="location">
        <span>Lighting Option A</span>
      </li>
    </ol>
  </nav>
  
  <section aria-label="Container details" class="container-metadata">
    <h1 id="container-title">Lighting Option A</h1>
    <p class="subtitle" aria-label="Variant">Professional Studio Setup</p>
    <dl class="metadata">
      <dt>Budget:</dt>
      <dd>$350</dd>
      <dt>Type:</dt>
      <dd>Group</dd>
    </dl>
  </section>
  
  <div role="toolbar" aria-label="Container actions" class="action-buttons">
    <button aria-label="Edit container details">
      <span aria-hidden="true">✏️</span> Edit
    </button>
    <button aria-label="Add content to container">
      <span aria-hidden="true">➕</span> Add Content
    </button>
    <button 
      aria-haspopup="menu" 
      aria-expanded="false" 
      aria-label="Change view mode"
    >
      <span aria-hidden="true">👁️</span> View
    </button>
    <button 
      aria-haspopup="menu" 
      aria-expanded="false" 
      aria-label="More actions"
    >
      <span aria-hidden="true">⋮</span>
    </button>
  </div>
  
  <button 
    aria-expanded="true"
    aria-label="Collapse context bar"
    class="collapse-button"
  >
    <span aria-hidden="true">▲</span>
  </button>
</div>
```

**Keyboard Interaction Patterns**:

1. **Focus on collapsed breadcrumb**:
   - Tab lands on breadcrumb button
   - Screen reader announces: "Breadcrumb navigation, 5 levels, currently at Lighting Option A, expand for full path, button"
   - Spacebar or Enter: Expands context bar
   
2. **When expanded**:
   - Focus moves to first breadcrumb link (Home)
   - Tab: Navigate through breadcrumb links → title → action buttons
   - Each breadcrumb link: Enter or Space activates navigation
   - Esc: Collapses context bar, returns focus to breadcrumb toggle
   - Tab away from last action button: Auto-collapses context bar

3. **Screen Reader Landmarks**:
   - Navigation landmark for breadcrumb
   - Toolbar role for action buttons
   - Clear heading hierarchy (h1 for container title)
   - Descriptive labels for all interactive elements

**Rationale**:
- Simple truncation (home + current) is clearest on mobile
- Full semantic HTML with proper ARIA roles ensures compatibility
- Keyboard navigation follows web standards (Tab, Enter, Space, Esc)
- Screen reader users get full context without visual clutter

**Implementation Notes**:
- Use semantic HTML first (`<nav>`, `<ol>`, `<button>`) before adding ARIA
- Icons have `aria-hidden="true"`, text alternatives in `aria-label`
- Current location marked with `aria-current="location"`
- Focus management: When expanding/collapsing, focus moves logically
- Test with NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)

**Impact**:
- Accessibility: WCAG 2.1 AA compliant breadcrumb navigation
- Components: ContextBar needs proper semantic markup and focus management
- Testing: Requires keyboard-only and screen reader testing
- Documentation: Add accessibility guidelines for component usage

---

---

### Decision 3: Piles vs Containers - Distinction and Use Cases

**Question**: What's the functional difference between piles and containers, and when should users use each?

**Core Distinction**:

**Piles** (Shallow Grouping):
- **Purpose**: Single-layer visual grouping for quick comparison and organization
- **Behavior**: Expands **in-place** on current canvas (no navigation away)
- **Visual**: Shows preview thumbnails (2-4 items visible), click to expand/collapse
- **Edges**: Can connect to other nodes with relationship lines
- **Use case**: "I want to see these items together without leaving my current view"
- **Examples**:
  - Pose reference pile (applicable to multiple characters)
  - Fabric swatch pile (comparing 5 options)
  - Tutorial videos pile (related techniques)
  - "Maybe" pile (undecided references)

**Containers** (Deep Nesting):
- **Purpose**: Organize complex nested information hierarchies
- **Behavior**: Double-click to **drill into** a dedicated canvas (navigation event)
- **Visual**: Shows as card with name, type, metadata preview, thumbnail
- **Context**: When inside, context bar shows breadcrumb path
- **Use case**: "This has enough content to deserve its own workspace"
- **Examples**:
  - Character container (20-50+ references, notes, budget items)
  - Event container (all planning for specific convention)
  - Project phase container (pre-production, production, post)
  - Equipment setup container (complete gear list with specs)

**Key Differences Table**:

| Feature | Pile | Container |
|---------|------|-----------|
| **Interaction** | Click to expand in-place | Double-click to drill into |
| **Navigation** | Stays on current canvas | Navigates to new canvas |
| **Depth** | Single layer | Infinite nesting |
| **Context** | No context loss | Context bar shows path |
| **Edge connections** | Yes, visible when collapsed | Yes, from container card |
| **Best for** | Quick comparison | Deep organization |
| **Typical size** | 2-20 items | 20-100+ items |

**Nesting Rules**:
- ✅ Containers can contain piles
- ✅ Piles can contain containers (expand pile, see container cards inside)
- ✅ Containers can contain containers (deep hierarchy)
- ✅ Piles can contain piles (though gets messy, not recommended)

**Visual Representation**:

**Pile (Collapsed)**:
```
┌─────────────────┐
│  Pose Refs (8)  │
│ ┌──┐┌──┐┌──┐┌──┐│  ← Shows 4 thumbnail previews
│ │  ││  ││  ││+4││
│ └──┘└──┘└──┘└──┘│
│   [Expand ▼]    │
└─────────────────┘
```

**Pile (Expanded in-place)**:
```
┌─────────────────────────────────────┐
│  Pose Refs (8)        [Collapse ▲] │
├─────────────────────────────────────┤
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ... │  ← All items visible
│ │  │ │  │ │  │ │  │ │  │ │  │     │     Fan out on canvas
│ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘     │     Still on same canvas
└─────────────────────────────────────┘
        ↓ edges visible ↓
    [Other nodes on canvas]
```

**Container (Card)**:
```
┌─────────────────────┐
│ 🎭 Character        │
│                     │
│ Tanjiro Kamado      │
│                     │
│ Series: Demon Slayer│
│ Budget: $350        │
│ 45 items inside     │
│                     │
│ [Open Container →]  │
└─────────────────────┘
     Double-click to drill in ↓
```

**Container (Inside view)**:
```
┌─────────────────────────────────────┐
│ 🏠 > Demon Slayer > Tanjiro    [⌄] │  ← Context bar
├─────────────────────────────────────┤
│                                     │
│  [Uniform Refs]  [Movie Version]   │  ← Piles inside container
│                                     │
│  [Fabric Swatches] [Wig Notes]     │  ← More piles
│                                     │
│  [Budget Item] [Budget Item]       │  ← Individual nodes
│                                     │
└─────────────────────────────────────┘
```

**Recommended Structure for Group Cosplay**:

**Scenario: Demon Slayer Group - PAX East 2026**

```
Main Moodboard Canvas:
├─ 🎭 Container: Tanjiro (drill in →)
│  Inside Tanjiro container:
│  ├─ 📚 Pile: Uniform References (15 images)
│  ├─ 📚 Pile: Movie Version References (8 images)
│  ├─ 📚 Pile: Civilian Outfit References (5 images)
│  ├─ 💰 Budget Item: Checkered Haori ($45)
│  ├─ 💰 Budget Item: Wig ($60)
│  └─ 📝 Note: "Need to decide between uniform versions"
│
├─ 🎭 Container: Inosuke (drill in →)
│  Inside Inosuke container:
│  ├─ 📚 Pile: Boar Mask References (20 images)
│  ├─ 📚 Pile: Costume References (12 images)
│  └─ 💰 Budget breakdown
│
├─ 🎭 Container: Zenitsu (drill in →)
│
├─ 📚 Pile: Shared Pose References (10 images)
│  ↓ edges connect to all 3 containers ↓
│  Connected to: Tanjiro, Inosuke, Zenitsu
│
└─ 📚 Pile: Group Photo Ideas (6 images)
   Connected to: Tanjiro, Inosuke, Zenitsu
```

**Workflow Examples**:

**Use Case 1: Quick Pose Comparison**
- User on main canvas
- Clicks "Shared Pose References" pile → Expands in-place
- Sees all 10 pose images fanned out
- Can see connections to character containers
- Collapses pile when done → Back to clean canvas

**Use Case 2: Deep Character Planning**
- User on main canvas
- Double-clicks "Tanjiro" container → Drills into Tanjiro's canvas
- Context bar shows: "🏠 > Demon Slayer > Tanjiro"
- Sees organized piles: Uniform Refs, Movie Refs, Civilian Refs
- Clicks "Uniform References" pile → Expands to see 15 images
- Adds notes, budget items, sketches
- Clicks "🏠" breadcrumb → Returns to main canvas

**Use Case 3: Equipment Planning (Photographer David's scenario)**
- Main canvas has 2 containers: "Setup A: Travel Light" and "Setup B: Studio Quality"
- Double-click "Setup A" → See all gear, notes, budget
- Or: Compare both setups side-by-side using piles instead
  - Create 2 piles: "Setup A" (5 items), "Setup B" (8 items)
  - Expand both piles in-place on same canvas
  - Quick visual comparison without drilling in

**Decision: When to Use Each**

**Use a Pile when**:
- Few items (2-20)
- Want quick comparison
- Items relate to multiple other nodes (shared resources)
- Need to see connections clearly
- Want to stay on current canvas

**Use a Container when**:
- Many items (20+)
- Complex nested structure
- Dedicated workspace needed
- Keeping main canvas clean
- Organizing major sections (characters, events, phases)

**Both are valid - user choice based on preference!**
- Some users prefer flat structure with piles (ADHD-friendly chaos)
- Some users prefer hierarchical structure with containers (organized)
- System supports both workflows

**Rationale**:
- Clear functional distinction prevents confusion
- Piles = horizontal organization (breadth)
- Containers = vertical organization (depth)
- Users can choose based on working style and content volume
- Progressive disclosure: Start with piles, promote to containers when content grows

**Implementation Notes**:
- Pile node type: `node_type: "pile"`, has `is_expanded: boolean`
- Container node type: `node_type: "container"`, has `container_type: "character"|"prop"|"group"`
- Piles expand with CSS animation (height/width transition)
- Containers navigate via router (new URL, browser back button works)
- Both can have edges in `moodboard_edges` table

**Impact**:
- UX: Clear mental model for organizing content
- Data model: `moodboard_nodes` table supports both types
- Components: `PileNode.svelte` (expand in-place), `ContainerNode.svelte` (drill-in)
- Navigation: Container drill-in uses Svelte routing, piles use local state

**Follow-up: Pile-to-Container Conversion & Container Peek**

**Question from Jess**: Can I promote a pile to a container when it grows too large? Can I peek inside containers without fully drilling in?

**Decision: Yes to Both!**

**1. Pile → Container Promotion**

**Trigger**:
- Right-click pile → "Convert to Container"
- Or: Automatic suggestion when pile exceeds 20 items: "This pile has 25 items. Convert to container for better organization?"

**Conversion Process**:
1. User confirms conversion
2. Modal: "Choose container type" (Character, Prop, Group)
3. Modal: "Enter container details" (name, metadata)
4. System creates new container node
5. All pile children become container children (parent_id updated)
6. All edges pointing to pile are redirected to container
7. Pile node deleted
8. Success message: "Pile converted! Double-click to open [Container Name]"

**What transfers**:
- ✅ All child nodes (images, notes, budget items)
- ✅ All edges/connections
- ✅ Tags from pile → applied to container
- ✅ Position on canvas (container appears where pile was)
- ✅ Notes/comments from pile → become container description

**Real-world analogy**: "Stack of papers getting too big → put in a binder"

**2. Container Peek (Quick View)**

**Purpose**: View container contents without drilling in (no navigation/context loss)

**Interaction**:
- **Desktop**: Hover container + press Spacebar, OR Right-click → "Peek Inside"
- **Mobile**: Long-press container, OR Tap container → small menu appears with "Peek" option

**Visual**: Popover/modal overlay

**Peek View**:
```
┌─────────────────────────────────────────┐
│  🎭 Tanjiro Kamado          [×] Close   │
│  Series: Demon Slayer | Budget: $350    │
├─────────────────────────────────────────┤
│  📚 Uniform Refs (15)  📚 Movie (8)     │  ← Collapsed piles
│  📚 Civilian (5)       💰 Haori ($45)   │  ← Preview items
│  💰 Wig ($60)          📝 Note          │
│                                         │
│  ... 39 more items                      │
│                                         │
│  [Open Container →]  (Full view)        │
└─────────────────────────────────────────┘
```

**Peek Features**:
- Shows up to 6-8 preview items (thumbnails/cards)
- Collapsed piles shown as collapsed (don't expand)
- Item count indicator: "... 39 more items"
- "Open Container" button at bottom → full drill-in
- Click outside peek view → closes
- Esc key → closes

**Peek Limitations** (keeps it "quick"):
- Can't edit items (read-only)
- Can't add new items
- Can't expand piles (just see they exist)
- Can't see edges/connections
- Can't zoom/pan
- Purpose: Quick glance, not full workspace

**Use Cases**:

**Quick Comparison**:
```
User has 3 character containers: Tanjiro, Inosuke, Zenitsu
Wants to compare budget totals quickly:
- Peek Tanjiro → See budget: $350
- Close peek
- Peek Inosuke → See budget: $420
- Close peek
- Peek Zenitsu → See budget: $280
Total: ~$1050 for group cosplay
(Didn't need to drill into any, stayed on main canvas)
```

**Remind Myself What's Inside**:
```
User on main canvas with 10 containers
"Wait, did I put the wig references in Tanjiro or in a separate container?"
- Peek Tanjiro → See "Wig ($60)" budget item
- Yes, found it! Close peek
- Click Edit on Tanjiro card (inspector) → Update notes
```

**3. Enhanced Container Card (On Canvas)**

To support peek, container cards show more info:

```
┌──────────────────────────────┐
│ 🎭 Character                 │
│                              │
│ Tanjiro Kamado               │
│ [Preview thumbnails: 4 items]│  ← NEW: Show 4 item previews
│                              │
│ Series: Demon Slayer         │
│ Budget: $350                 │
│ 45 items inside              │
│                              │
│ [Peek 👁] [Open →]          │  ← NEW: Peek button
└──────────────────────────────┘
```

**Container Card Interactions**:
- **Single click**: Select (inspector opens)
- **Click "Peek 👁" button**: Peek view opens
- **Double-click card or "Open →"**: Drill into container (full navigation)
- **Right-click**: Context menu (Edit, Peek, Open, Delete, etc.)

**Rationale**:
- **Pile-to-container conversion**: Supports natural growth pattern. Users start simple (pile), scale up when needed (container).
- **Container peek**: Solves "I just need a quick look" problem without forcing full navigation.
- **Real-world analogy**: Peek = looking through a binder's plastic sleeve without opening it. Full open = taking binder off shelf and opening to work.
- **Progressive disclosure**: Peek for quick reference, drill-in for deep work.

**Implementation Notes**:
- Pile-to-container conversion: Backend function `convertPileToContainer(pileId, containerType, metadata)`
- Automatic suggestion: Check pile child count on expand, show banner if > 20 items
- Peek view: Modal/popover component `<ContainerPeek>`
- Peek fetches lightweight data (first 6-8 items only, no full recursive tree)
- Preview thumbnails on container card: Query first 4 children for thumbnails

**Impact**:
- UX: Supports natural workflow evolution (pile → container as content grows)
- UX: Peek reduces unnecessary navigation (stay in flow)
- Data model: Conversion is just updating `node_type` and `parent_id` fields
- Components: New `<ContainerPeek>` modal component
- Components: Enhanced `ContainerNode` with preview thumbnails and Peek button
- Performance: Peek query must be fast (limit items, no deep recursion)

---

---

### Decision 4: Event Nodes, Contact Nodes, and Checklist Nodes

**Question**: How do we handle scheduling, contacts, and task lists on the moodboard?

**Discussion**: Photographers (and other creators) need to plan future events, track contacts, and manage shot lists without leaving the moodboard. Need visual, connected representations.

**Decision: Three New Node Types**

**1. Event Node**

**Purpose**: Represent calendar events with date/time/location on moodboard

**Data Source**: 
- Import from calendar (Google Calendar, Apple Calendar, Outlook)
- Or create manually on moodboard
- Bidirectional sync: Create event on moodboard → adds to calendar

**Event Node Card**:
```
┌──────────────────────────────┐
│ 📅 Event                     │
│                              │
│ Photoshoot with Sarah        │
│ 📍 PAX East - Artist Alley   │
│                              │
│ 🕐 Friday, March 15, 2:00 PM │
│ ⏱️ Duration: 1 hour          │
│                              │
│ [View in Calendar] [Edit]   │
└──────────────────────────────┘
```

**Event Node Metadata**:
- Event title
- Date & time (start, end)
- Location (text or coordinates)
- Description/notes
- Calendar ID (for sync)
- Reminder settings
- Attendees (list of contact IDs)

**Event Node Connections**:
```
📅 Event: Photoshoot with Sarah (Friday 2pm)
    ↓ "shooting"
📸 Contact: Sarah (Cosplayer)
    ↓ "wearing"
🎭 Container: Tanjiro Costume
    ↓ "references"
📚 Pile: Tanjiro Pose References
```

**Timeline View Integration**:
- Timeline view has toggle: "Show Added Date" | "Show Event Date"
- When "Event Date" selected, shows future events in chronological order
- Past events and non-event nodes shown by added date
- Color coding: Future events (blue), Today (green), Past events (gray)

**Use Case Example**:
```
David's PAX Photography Schedule:

Main Canvas:
├─ 📅 Event: Sarah Shoot (Fri 2pm) → 📸 Contact: Sarah → 🎭 Tanjiro
├─ 📅 Event: Mike Shoot (Fri 4pm) → 📸 Contact: Mike → 🎭 Inosuke
├─ 📅 Event: Group Shoot (Sat 10am) → 📸 Sarah, Mike, Alex
│                                    → 🎭 Tanjiro, Inosuke, Zenitsu
└─ 📚 Pile: Shot List Ideas (connected to all events)

Timeline View (Event Date mode):
Fri 2:00pm ─── Sarah Shoot
Fri 4:00pm ─── Mike Shoot
Sat 10:00am ── Group Shoot
```

**2. Contact Node**

**Purpose**: Represent people/businesses with contact info and relationships

**Contact Node Card**:
```
┌──────────────────────────────┐
│ 👤 Contact: Cosplayer        │
│                              │
│ [Profile Photo]              │
│ Sarah Chen                   │
│                              │
│ 📧 sarah@email.com           │
│ 📷 @sarahcosplay             │
│ 💬 Discord: sarah#1234       │
│                              │
│ Project: Tanjiro Cosplay     │
│ Status: In Progress          │
│                              │
│ [Message] [View Details]    │
└──────────────────────────────┘
```

**Contact Types**:
- Cosplayer
- Photographer
- Commissioner (armor, props, sewing)
- Supplier/Vendor
- Venue
- Makeup Artist
- Wig Maker
- Other

**Contact Node Metadata**:
- Name
- Profile photo (upload)
- Contact type
- Email, phone
- Social media (Instagram, Discord, TikTok, etc.)
- Notes
- Related project/costume (optional)
- Status (planning, in progress, completed)

**Contact Node Connections**:
```
📸 Contact: Sarah (Cosplayer)
    ↓ "making"
🎭 Container: Tanjiro Costume
    ↓ "needs"
💰 Budget Item: Checkered Haori
    ↓ "supplier option"
👤 Contact: Wig Vendor (Supplier)
```

**3. Checklist Node**

**Purpose**: Task lists, shot lists, shopping lists with checkable items

**Checklist Node Card (Collapsed)**:
```
┌──────────────────────────────┐
│ ☑️ Checklist                 │
│                              │
│ Shot List: Tanjiro Shoot     │
│                              │
│ ☑ Wide shot with sword       │
│ ☑ Close-up haori pattern     │
│ ☐ Action pose mid-swing      │
│ ☐ Reference comparison       │
│                              │
│ Progress: 2/4 (50%)          │
│                              │
│ [Expand ▼]                   │
└──────────────────────────────┘
```

**Checklist Node Card (Expanded)**:
```
┌────────────────────────────────────┐
│ ☑️ Shot List: Tanjiro Shoot   [▲] │
├────────────────────────────────────┤
│ ☑ Wide shot with sword             │
│   ├─ Notes: Use f/2.8 for bokeh   │
│   └─ 📷 [Photo attached]           │
│                                    │
│ ☑ Close-up haori pattern           │
│   └─ 📷 [Photo attached]           │
│                                    │
│ ☐ Action pose mid-swing            │
│   ├─ Ref: [Link to pose example]  │
│   └─ Priority: High                │
│                                    │
│ ☐ Reference comparison             │
│                                    │
│ [+ Add Item]                       │
└────────────────────────────────────┘
```

**Checklist Features**:
- Check/uncheck items (persists state)
- Progress indicator (X/Y completed, %)
- Sub-items (nested checkboxes)
- Attach notes to each item
- Attach photos/links to items (proof of completion)
- Priority markers (high, medium, low)
- Reorder items (drag-drop)
- Mark item as "N/A" (not applicable, grayed out)

**Checklist Use Cases**:
- Shot lists (photographers)
- Shopping lists (budget items to buy)
- Task lists (costume construction steps)
- Packing lists (con preparation)
- Pre-shoot checklist (equipment check)

**Checklist Connections**:
```
☑️ Checklist: Shot List
    ↓ "for"
📅 Event: Sarah Shoot (Fri 2pm)
    ↓ "with"
📸 Contact: Sarah
    ↓ "wearing"
🎭 Container: Tanjiro Costume
```

**Event-Checklist Integration**:
- Checklists can connect to event nodes
- When event node selected (inspector), shows "Connected Checklists" section
- Click checklist link → Opens checklist in inspector
- Event peek view shows preview of connected checklists:
  ```
  ┌─────────────────────────────────────┐
  │ 📅 Photoshoot with Sarah            │
  │ Friday, March 15, 2:00 PM           │
  ├─────────────────────────────────────┤
  │ Connected:                          │
  │ → ☑️ Shot List (2/4 complete)      │
  │ → 📸 Contact: Sarah                 │
  │ → 🎭 Container: Tanjiro Costume     │
  │                                     │
  │ [Open Event] [View Checklist]      │
  └─────────────────────────────────────┘
  ```
- Quick action: "View Checklist" button opens checklist without leaving peek
- Mobile: Swipe between event details and checklist tabs

**Contact Node Detailed View** (Inspector Panel):

When Contact node selected, inspector shows:

```
┌─────────────────────────────────┐
│ Contact Details                 │
├─────────────────────────────────┤
│ [Profile Photo]                 │
│                                 │
│ Name: Sarah Chen                │
│ Type: Cosplayer                 │
│                                 │
│ Contact Info:                   │
│ 📧 sarah@email.com              │
│ 📱 +1 (555) 123-4567            │
│ 📷 @sarahcosplay                │
│ 💬 Discord: sarah#1234          │
│                                 │
│ Current Project:                │
│ 🎭 Tanjiro Cosplay              │
│ Status: 70% complete            │
│                                 │
│ Notes:                          │
│ [Rich text editor]              │
│                                 │
│ Connections (3):                │
│ → 📅 Photoshoot Fri 2pm         │
│ → 🎭 Tanjiro Container          │
│ → ☑️ Shot List                  │
│                                 │
│ [Send Message] [Edit]           │
└─────────────────────────────────┘
```

**Rationale**:
- **Event nodes**: Brings calendar directly into moodboard, visual scheduling
- **Calendar sync**: Users don't maintain two separate systems
- **Contact nodes**: Visual representation of people/businesses in creative workflow
- **Checklist nodes**: Essential for task management without leaving moodboard
- **Connected workflow**: Events → Contacts → Costumes → References all visible and linked
- **Photographer use case**: Can plan entire shoot schedule on one canvas with all context

**Implementation Notes**:

**Event Node**:
- `node_type: "event"`
- `metadata.event_date` (ISO datetime)
- `metadata.event_end_date` (ISO datetime)
- `metadata.location` (string)
- `metadata.calendar_id` (for sync)
- Calendar sync: Use Google Calendar API, Apple Calendar (CalDAV), Outlook API
- Sync service: Background job checks for calendar updates every 15 minutes

**Contact Node**:
- `node_type: "contact"`
- `metadata.contact_type` (enum)
- `metadata.contact_info` (JSONB: email, phone, social media)
- `metadata.profile_photo_url` (Supabase Storage)
- `metadata.related_project_id` (optional link to project/idea)

**Checklist Node**:
- `node_type: "checklist"`
- `metadata.items` (JSONB array):
  ```json
  [
    {
      "id": "uuid",
      "text": "Wide shot with sword",
      "checked": true,
      "notes": "Use f/2.8 for bokeh",
      "attachments": ["photo_url"],
      "priority": "high",
      "children": []
    }
  ]
  ```
- Real-time sync: Check/uncheck immediately persists to DB

**Impact**:
- Data model: Add `event`, `contact`, `checklist` to `node_type` enum
- Calendar integration: New service for calendar API sync
- Components: `EventNode.svelte`, `ContactNode.svelte`, `ChecklistNode.svelte`
- Timeline view: Add "Show by Event Date" toggle
- Inspector: Contact-specific inspector layout

---

## Ideas Parking Lot

### Future: Cross-Team Project Sharing

**Concept** (from David's scenario): Cosplayer shares project with photographer, photographer sees limited view

**Use Case**:
- Sarah (cosplayer) working on Tanjiro costume
- David (photographer) shooting Sarah at PAX
- Sarah shares "Tanjiro Project" with David
- David sees: Character info, costume details, prop list, reference images, notes
- David does NOT see: Budget, personal notes, suppliers, private planning

**Sharing Levels**:
1. **Public share** (anyone with link): Read-only moodboard view
2. **Collaborator share** (specific person): Can comment, suggest
3. **Cross-team share** (photographer, commissioner): Read-only subset (no budget/private)
4. **Team member share** (full access): Edit, delete, manage

**Implementation**: Future feature (after core moodboard stable)

**Related to**: Existing moodboard sharing (Decision in original spec), but more granular permissions

---

---

### Decision 5: Batch Operations, Ghost Nodes, and Templates

**Question**: How do we handle multi-project workflows where content applies to multiple containers? How do batch operations work?

**Discussion**: Wig makers (and other multi-project creators) need to organize references across multiple simultaneous projects, with some references applying to multiple clients. Need efficient batch tagging and cross-container visibility.

**Decision: Batch Operations + Ghost Nodes + Node Templates**

**1. Batch Operations (Multi-Select and Bulk Actions)**

**Multi-Select**:
- **Desktop**: Click + drag selection box (lasso), or Shift/Cmd+Click to add to selection
- **Mobile**: Tap "Select Mode" button → tap nodes to select → toolbar appears
- Selected nodes highlighted with blue border + count indicator "12 selected"

**Bulk Actions** (available after multi-select):
```
┌────────────────────────────────────────┐
│ 12 nodes selected                      │
│ [Tag] [Delete] [Move] [Connect] [More]│
└────────────────────────────────────────┘
```

**Bulk Tagging Flow**:
1. Select 10 video nodes (Instagram tutorials)
2. Click "Tag" button
3. Modal: "Add tags to 10 nodes"
   - Text input with autocomplete: "#JinxWig #GradientTechnique"
   - Shows existing tags on any selected nodes
   - Option: "Replace existing tags" or "Add to existing tags"
4. Confirm → All 10 nodes get tagged
5. Toast notification: "Added tags to 10 nodes"

**Other Bulk Actions**:
- **Bulk Delete**: Confirm dialog "Delete 12 nodes?"
- **Bulk Move**: "Move to container" → Select target container
- **Bulk Connect**: "Connect all selected to..." → Select target node → Creates edges
- **Bulk Duplicate**: Creates copies of all selected nodes
- **Bulk Export**: Export selection as images/PDF

**Batch Add (URLs)**:
- Quick Add → Link → Paste multiple URLs (line-separated)
- Example input:
  ```
  https://instagram.com/reel/abc123
  https://tiktok.com/@user/video/456
  https://youtube.com/watch?v=xyz789
  ```
- System parses all URLs, fetches metadata in parallel
- Creates nodes in grid layout on canvas
- Toast: "Added 3 social media nodes"

**2. Ghost Nodes (Cross-Container Visibility)**

**Concept**: When a node has edges connecting to a container, a "ghost clone" appears inside that container.

**Ghost Node Behavior**:

**Main Canvas**:
```
Main Moodboard:
├─ 🎥 Video: Gradient Tutorial (REAL node)
│   ↓ "applies to"
├─ 🎭 Container: Jinx Wig
│   └─ Inside: 👻 Video: Gradient Tutorial (GHOST)
│   
│   ↓ "applies to"  
└─ 🎭 Container: Miku Wig
    └─ Inside: 👻 Video: Gradient Tutorial (GHOST)
```

**Ghost Node Visual**:
- Semi-transparent (80% opacity)
- Subtle "ghost" indicator (small 👻 badge in corner)
- Tooltip on hover: "Linked from main canvas" or "Linked from [Parent Container]"
- Can be moved/positioned independently inside each container
- Same content as real node (thumbnail, title, metadata)

**Ghost Node Interactions**:
- **Single-click**: Select (inspector shows real node data)
- **Double-click**: Opens real node (lightbox, viewer, drill-in)
- **Edit**: Changes apply to REAL node (seen in all ghost locations)
- **Delete**: 
  - Modal: "Remove link or delete entirely?"
  - Option A: "Remove from this container only" → Deletes ghost + edge (real node remains)
  - Option B: "Delete everywhere" → Deletes real node + all ghosts + all edges
- **Move**: Position is per-container (moving ghost in Jinx doesn't affect ghost in Miku)
- **Tag**: Adds tags to real node (visible in all locations)

**Ghost Node Creation**:
- **Method 1**: Create edge from node to container → Ghost automatically appears inside
- **Method 2**: Drag node near container → Hover menu: "Add to Jinx Wig" → Creates edge + ghost
- **Method 3**: Inside container, click "Link Existing Node" → Search/select node from parent → Ghost appears

**Use Case Example**:
```
Taylor's Workflow:

Main Canvas:
├─ 🎥 Gradient Tutorial (real node, tagged #Gradient)
│   ↓ connected to multiple containers
├─ 🎭 Client A: Jinx Wig
│   Inside Jinx container:
│   ├─ 👻 Gradient Tutorial (ghost, positioned near color swatches)
│   └─ Other Jinx-specific content
│
└─ 🎭 Client C: Miku Wig
    Inside Miku container:
    ├─ 👻 Gradient Tutorial (ghost, positioned near style references)
    └─ Other Miku-specific content

When Taylor opens Jinx container:
- Sees ghost tutorial in context with Jinx references
- Can watch video without leaving container
- If she tags it "#Advanced", tag appears in Miku container too
- If she deletes it, modal asks "Remove from Jinx only?" or "Delete everywhere?"
```

**3. Ghost Filtering (Visual Highlighting)**

**Purpose**: When filtering/searching, highlight matches and dim non-matches

**Filter Interaction**:
- User opens filter panel (or uses search bar)
- Types tag: "#GradientTechnique"
- Canvas responds:
  - **Matching nodes**: Full opacity, slight glow border (blue)
  - **Non-matching nodes**: 30% opacity (ghosted out)
  - **Matching count**: "8 of 50 nodes match"

**Ghost Filter Visual**:
```
Before filter:
┌────────────────────────────────────┐
│ 🎥 Tutorial 1  🎥 Tutorial 2      │
│ 🎥 Tutorial 3  🎥 Tutorial 4      │
│ 💰 Budget      📝 Note             │
└────────────────────────────────────┘

After filter "#Gradient":
┌────────────────────────────────────┐
│ 🎥 Tutorial 1  👻 Tutorial 2      │  ← Tutorial 1 matches (bright)
│                                    │  ← Tutorial 2 dimmed (no match)
│ 🎥 Tutorial 3  👻 Tutorial 4      │  ← Tutorial 3 matches (bright)
│                                    │  ← Tutorial 4 dimmed (no match)
│ 👻 Budget      👻 Note             │  ← Both dimmed (no match)
└────────────────────────────────────┘

Indicator: "2 of 6 nodes match '#Gradient'"
```

**Ghost Filter Features**:
- Filtered nodes remain visible (not hidden) but dimmed
- User can still click dimmed nodes
- Clear filter button (X) returns to normal view
- Multiple filters: AND logic ("#Gradient" AND "#Advanced")
- Filter persists when drilling into containers (applied to child canvas)
- **Ghost nodes match filters**: If ghost's real node matches filter, ghost highlighted (full opacity)
  - Example: Inside "Jinx" container, filter "#Gradient"
  - Real nodes in Jinx with #Gradient → Full opacity (highlighted)
  - Ghost nodes whose real node has #Gradient → Full opacity (highlighted)
  - Everything else → 30% opacity (dimmed)
  - Result: User sees ALL gradient content regardless of where it lives (real or ghost)

**Filter Options**:
- By tags (multi-select)
- By node type (images, videos, notes, budget items, etc.)
- By date range (added date or event date)
- By text search (title, content, metadata)

**4. Node Templates (Reusable Nodes)**

**Purpose**: Save checklist nodes, container structures, or note templates for reuse

**Template Types**:

**A. Checklist Templates**:
```
Template: "Standard Portrait Shots"
☐ Wide shot, full costume
☐ Medium shot, upper body
☐ Close-up, face and detail
☐ Action pose
☐ Props showcase
☐ Back view
☐ Detail shots (x3)

Usage:
- David creates template once
- Right-click template → "Create from template"
- Duplicates checklist with all items
- Renames to "Sarah - Tanjiro Shots"
- Checks off items during shoot
```

**B. Container Templates**:
```
Template: "Client Commission Container"
🎭 Container: [Client Name] - [Character]
├─ 📚 Pile: Reference Images
├─ 📚 Pile: Style References  
├─ 💰 Budget Item: Materials
├─ 💰 Budget Item: Labor
├─ 📝 Note: Client Requirements
├─ 📝 Note: Progress Updates
├─ ☑️ Checklist: Construction Steps
└─ 📅 Event: Deadline

Usage:
- Taylor creates template once for wig commissions
- Right-click canvas → "Create from template" → Select "Client Commission"
- Creates container with pre-filled structure
- Replaces placeholders with client info
```

**C. Note Templates**:
```
Template: "Character Reference Note"
# Character Name: [Fill in]
## Series: [Fill in]
## Variant: [Fill in]

### Key Features:
- Hair: [Fill in]
- Costume: [Fill in]
- Props: [Fill in]

### Construction Notes:
[Fill in]

### Reference Links:
- [Add links]
```

**Template Management**:
- **Save as template**: Right-click node → "Save as template" → Name template
- **Template library**: Main menu → "Templates" → Shows all saved templates
- **Use template**: Quick Add → "From template" → Select template
- **Edit template**: Template library → Edit → Updates template (doesn't affect instances)
- **Delete template**: Template library → Delete → Confirmation dialog
- **Share templates**: Export template → Import in another team/workspace (future)

**Template Storage**:
- Stored in `node_templates` table
- Fields: `id`, `team_id`, `name`, `description`, `node_type`, `template_data` (JSONB)
- Template data includes structure but not actual content (placeholders instead)

**Rationale**:
- **Batch operations**: Efficient organization of large amounts of content
- **Ghost nodes**: Solves multi-project cross-referencing without duplication
- **Ghost filtering**: Quick visual search without hiding context
- **Templates**: Reduces repetitive setup work, ensures consistency

**Implementation Notes**:

**Batch Operations**:
- Multi-select state managed in component store
- Bulk actions execute in transaction (all-or-nothing)
- Progress indicator for large batches (>20 nodes)

**Ghost Nodes**:
- Not stored as separate nodes in DB (computed from edges)
- When container loads, query: "Find nodes with edges pointing to this container"
- Render ghost nodes in container canvas
- Ghost position stored in `moodboard_edges.metadata.ghost_position_{container_id}`
- Deleting edge removes ghost from container

**Ghost Filtering**:
- Client-side filtering (no server query needed for small boards)
- CSS classes: `.node-filtered-match` (opacity: 1), `.node-filtered-ghost` (opacity: 0.3)
- Smooth transition animation (200ms)

**Templates**:
- New table: `node_templates`
- Create from template: Deep copy template data, replace placeholders
- Checklist template: Copy entire `metadata.items` array
- Container template: Recursively create container + children

**Impact**:
- UX: Efficient multi-project workflows for power users
- UX: Ghost nodes reduce duplication, keep content synced
- UX: Ghost filtering provides visual search without losing context
- Data model: Add `node_templates` table
- Data model: Add `ghost_position_{container_id}` to `moodboard_edges.metadata`
- Components: Multi-select toolbar, ghost node renderer, template library UI
- Performance: Ghost node queries must be optimized (index on edges, limit depth)

---

---

### Decision 6: Image Annotations, Progress Tracking, and Compare Nodes

**Question**: How do we handle image annotations for construction notes, progress photo tracking, and before/after comparisons?

**Discussion**: Prop makers and builders need to annotate reference images with construction notes, track build progress with photos, and compare references to work-in-progress.

**Decision: Enhanced Sketch Tool + Sequential Edges + Compare Nodes**

**1. Enhanced Sketch Tool with Image Import**

**Purpose**: Annotate reference images with construction notes, arrows, and drawings

**Sketch Node with Image Background**:

**Creation Flow**:
1. Right-click image node → "Annotate Image" OR
2. Quick Add → Sketch → "Import background image"
3. Select image (from moodboard or upload new)
4. Opens sketch editor with image as background layer

**Sketch Editor Features**:

```
┌────────────────────────────────────────────┐
│ Sketch: Iron Man Armor Notes         [×]  │
├────────────────────────────────────────────┤
│ Tools: [✏️ Pen] [➡️ Arrow] [⭕ Circle]    │
│        [📝 Text] [🎨 Color] [↩️ Undo]     │
├────────────────────────────────────────────┤
│                                            │
│   [Reference Image with annotations]      │
│   ↗️ "Contact cement here"                │
│   ↗️ "Magnets joint"                      │
│   ⭕ "Paint gradient starts"              │
│                                            │
├────────────────────────────────────────────┤
│ Side Notes Panel:                          │
│ 1. Use contact cement on seams            │
│ 2. This joint needs 4x 1/4" magnets       │
│ 3. Paint gradient: Gold → Dark gold       │
│                                            │
│ [Save Sketch]                              │
└────────────────────────────────────────────┘
```

**Sketch Tools**:
- **Pen/Brush**: Freehand drawing (multiple colors, widths)
- **Arrow**: Point to specific areas with directional arrows
- **Circle/Rectangle**: Highlight regions
- **Text**: Add inline text labels directly on image
- **Line**: Straight lines for measurements, connections
- **Color picker**: Choose from palette or custom
- **Eraser**: Remove annotations (doesn't erase background image)
- **Undo/Redo**: Full history

**Side Notes Panel**:
- Separate text area beside canvas
- Numbered/bulleted lists
- Can reference inline annotations: "See arrow 1"
- Supports markdown (bold, italic, links)
- Persists with sketch

**Output**:
- Creates new Sketch node on moodboard
- Node type: `sketch` with `metadata.has_background_image: true`
- Stores: Background image URL + annotation layer (SVG or canvas data)
- Thumbnail preview shows annotated image

**Sketch Node on Canvas**:
```
┌─────────────────────────────┐
│ ✏️ Sketch                   │
│                             │
│ [Annotated image preview]   │
│                             │
│ Iron Man Armor Notes        │
│ 3 annotations               │
│                             │
│ [Edit Sketch] [View]        │
└─────────────────────────────┘
```

**Linking to Original**:
- Edge connection: Original Image → Sketch (edge type: "annotated_in")
- Inspector shows: "Annotated version: [Sketch link]"
- Can have multiple sketch annotations of same image

**Additional Notes Node** (optional):
```
📷 Original Reference Image
    ↓ "annotated_in"
✏️ Sketch: Iron Man Armor Notes
    ↓ "detailed_notes"
📝 Note: Full Construction Instructions
```

**Use Case Example**:
```
Alex's Mjolnir Build:

Main Canvas:
├─ 📷 Reference Image: Movie Mjolnir
│   ↓ "annotated_in"
├─ ✏️ Sketch: Hammer Head Construction
│   Notes on image: "Foam layering", "Detail lines", "Weathering areas"
│   Side notes: "1. 3 layers of 10mm EVA foam..."
│   
│   ↓ "detailed_notes"
└─ 📝 Note: Full Build Plan
   "Materials list, step-by-step instructions..."
```

**2. Sequential Edges (Progress Tracking)**

**Purpose**: Link nodes in chronological order to show progression/timeline

**Sequential Edge Type**: `edge_type: "sequential"`

**Visual Representation**:
```
Sequential chain shows numbered progression:

┌─────┐  1→  ┌─────┐  2→  ┌─────┐  3→  ┌─────┐
│ WIP │ ───→ │ WIP │ ───→ │ WIP │ ───→ │Final│
│ Day1│      │ Day3│      │ Day7│      │Photo│
└─────┘      └─────┘      └─────┘      └─────┘
```

**Sequential Edge Features**:
- **Numbered**: Edges show sequence numbers (1, 2, 3...)
- **Directional**: Arrow shows progression (unidirectional)
- **Linear chain**: Each node has max 1 incoming + 1 outgoing sequential edge
- **Auto-numbering**: System auto-assigns sequence when edge created

**Creating Sequential Chains**:

**Method 1: Manual linking**
- Right-click node → "Add to sequence" → Click next node
- System asks: "Add as next step (3)?" or "Insert between steps 2 and 3?"

**Method 2: Multi-select order**
- Select multiple nodes (in order)
- Right-click → "Create sequence from selection"
- System creates sequential chain in selection order

**Method 3: Drag-and-link**
- Drag from node's "sequence handle" (special handle on right edge)
- Drop on next node → Creates sequential edge

**Use Case: Progress Photos**
```
Alex's Mjolnir Build Progress:

Main Canvas:
├─ 📷 Reference: Movie Mjolnir (goal)
│
└─ Progress Chain:
   ┌─────────────┐  1→  ┌─────────────┐  2→  ┌─────────────┐
   │ 📷 WIP:     │ ───→ │ 📷 WIP:     │ ───→ │ 📷 WIP:     │
   │ Foam Base   │      │ Detail Carve│      │ Primer Done │
   │ Day 1       │      │ Day 3       │      │ Day 5       │
   └─────────────┘      └─────────────┘      └─────────────┘
   
        3→  ┌─────────────┐  4→  ┌─────────────┐
       ───→ │ 📷 WIP:     │ ───→ │ 📷 Final:   │
            │ Paint Layer │      │ Weathering  │
            │ Day 7       │      │ Complete    │
            └─────────────┘      └─────────────┘
```

**Sequential Timeline View**:
- Timeline view automatically detects sequential chains
- Shows progress photos in order with dates
- Scrubber slider to see progression
- Animation: "Play" button cycles through sequence

**Difference from Regular Edges**:
- **Regular edge**: Bidirectional relationship (A relates to B, B relates to A)
- **Sequential edge**: Directional progression (A comes before B, B follows A)
- Use cases:
  - Regular: "Reference image" ↔ "Sketch annotation"
  - Sequential: "WIP Day 1" → "WIP Day 2" → "WIP Day 3"

**3. Compare Node (Before/After, Reference/WIP)**

**Purpose**: Side-by-side comparison of any two nodes

**Compare Node Type**: Special container-like node that holds exactly 2 child nodes

**Compare Node Visual**:

**On Canvas (Collapsed)**:
```
┌────────────────────────────────┐
│ ⚖️ Compare                     │
│                                │
│ Reference vs WIP               │
│                                │
│ ┌──────────┐ ┌──────────┐    │
│ │[Preview ]│ │[Preview ]│    │
│ │  Left    │ │  Right   │    │
│ └──────────┘ └──────────┘    │
│                                │
│ [View Comparison →]            │
└────────────────────────────────┘
```

**Compare View (Expanded)**:

**Side-by-Side Mode**:
```
┌─────────────────────────────────────────┐
│ ⚖️ Compare: Reference vs WIP       [×] │
├─────────────────────────────────────────┤
│ [Side-by-Side] [Slider] [Overlay]      │
├─────────────────────────────────────────┤
│                   │                     │
│   Reference       │    WIP Day 7        │
│   (Left)          │    (Right)          │
│                   │                     │
│   [Full image]    │    [Full image]     │
│                   │                     │
│                   │                     │
├─────────────────────────────────────────┤
│ Notes:                                  │
│ Good progress on paint gradient!        │
│ Need more weathering on edges           │
└─────────────────────────────────────────┘
```

**Slider Mode** (Image overlay with slider):
```
┌─────────────────────────────────────────┐
│ ⚖️ Compare: Reference vs WIP            │
├─────────────────────────────────────────┤
│                                         │
│     [Overlaid images with slider]       │
│          │←  Drag slider  →│            │
│     Left image shows ← │ → Right image  │
│                        ↕                 │
│                     [Slider]             │
│                                         │
└─────────────────────────────────────────┘
```

**Overlay Mode** (Opacity blend):
```
┌─────────────────────────────────────────┐
│ ⚖️ Compare: Reference vs WIP            │
├─────────────────────────────────────────┤
│                                         │
│     [Blended overlay image]             │
│                                         │
│     Opacity: [────○────] 50%            │
│              Left ← → Right             │
│                                         │
└─────────────────────────────────────────┘
```

**Compare Node Features**:
- **Any node type**: Images, sketches, notes, budgets, even containers
- **Multiple compare modes**: Side-by-side, slider, overlay
- **Zoom sync**: Zooming one side zooms both (for image comparison)
- **Pan sync**: Panning one side pans both
- **Notes**: Add comparison notes below
- **Swap sides**: Button to flip left/right
- **Fullscreen mode**: Expand to full window

**Creating Compare Nodes**:

**Method 1: Select two nodes**
- Multi-select 2 nodes
- Right-click → "Compare Selected"
- System creates compare node with both as children

**Method 2: Drag to compare**
- Drag node onto another node
- Hover menu: "Compare with [Node Name]"
- Creates compare node

**Method 3: From inspector**
- Select node → Inspector → "Compare with..." → Search/select another node

**Use Cases**:

**A. Reference vs WIP** (Images):
```
⚖️ Compare: Movie Mjolnir vs My Build
├─ Left: 📷 Reference Image (movie screenshot)
└─ Right: 📷 Progress Photo (WIP Day 7)

Mode: Slider overlay
Notes: "Handle length needs adjustment, leather wrap is good!"
```

**B. Budget Comparison** (Budget items):
```
⚖️ Compare: Estimated vs Actual Budget
├─ Left: 💰 Estimated Budget (3 items, $150 total)
└─ Right: 💰 Actual Budget (3 items, $180 total)

Mode: Side-by-side table
Shows: Cost differences, overages highlighted in red
```

**C. Note Comparison** (Text notes):
```
⚖️ Compare: Original Plan vs Revised Plan
├─ Left: 📝 Note: Initial Construction Plan
└─ Right: 📝 Note: Revised Plan (after foam shortage)

Mode: Side-by-side text
Shows: Text diff highlighting (red = removed, green = added)
```

**D. Sketch Comparison** (Annotated images):
```
⚖️ Compare: First vs Final Annotations
├─ Left: ✏️ Sketch: Initial design notes
└─ Right: ✏️ Sketch: Final with revisions

Mode: Overlay with toggle
Can switch between layers to see annotation changes
```

**Compare Node Data Model**:
- `node_type: "compare"`
- `metadata.compare_mode: "side-by-side" | "slider" | "overlay"`
- `metadata.left_node_id: uuid`
- `metadata.right_node_id: uuid`
- `metadata.comparison_notes: text`
- Children: 2 nodes (or ghost nodes if linked from elsewhere)

**Rationale**:
- **Enhanced sketch tool**: Enables practical construction note-taking on references
- **Sequential edges**: Natural way to represent progress/timeline
- **Compare nodes**: Essential for quality checking and progress evaluation
- **Flexible comparison**: Works for any content type (images, notes, budgets)

**Implementation Notes**:

**Enhanced Sketch Tool**:
- Canvas-based or SVG-based editor
- Background image layer (locked, can't draw on)
- Annotation layer (user drawings)
- Side notes stored in `metadata.side_notes`
- Export as single image (flattened) or layered (editable)

**Sequential Edges**:
- New edge type: `edge_type: "sequential"`
- `metadata.sequence_number: integer`
- Validation: Prevent cycles, ensure linear chain
- Auto-renumber when node inserted/removed from chain

**Compare Node**:
- New node type: `compare`
- Component: `<CompareView>` with mode switcher
- Image comparison: Use canvas API or CSS clip-path for slider
- Budget/Note comparison: Custom diff algorithm
- Fullscreen: Modal overlay with escape to close

**Impact**:
- UX: Builders can annotate references without external tools
- UX: Progress tracking becomes visual and interactive
- UX: Quality checking via side-by-side comparison
- Data model: Add `compare` and enhanced `sketch` node types
- Data model: Add `sequential` edge type with sequence numbers
- Components: Sketch editor, Compare viewer, Sequential timeline view
- Performance: Image comparison requires canvas rendering optimization

---

---

### Decision 7: Scaling and Bulk Import

**Question**: How do we handle large numbers of containers (50+) and bulk data import from spreadsheets?

**Discussion**: Event coordinators and power users may need to manage many containers simultaneously, requiring better organizational tools and bulk creation workflows.

**Decision: Enhanced List View + CSV Import (with mapping interface)**

**1. Enhanced List View for Container Management**

**Purpose**: Manage many containers efficiently without canvas clutter

**List View Features**:

**Filter by Node Type**:
- View switcher has "Show: All | Containers Only | Images Only | etc."
- "Containers Only" mode shows just container nodes
- Each row shows: Container name, type (character/prop/group), metadata preview, item count, last modified

**List View for Containers**:
```
┌──────────────────────────────────────────────────────────────┐
│ Containers (50)           [Filter ▼] [Sort ▼] [+ New]       │
├──────────────────────────────────────────────────────────────┤
│ 🎭 Character | Sarah Chen - Tanjiro    | 45 items | 2 hrs ago│
│ 🎭 Character | Mike Liu - Inosuke      | 38 items | 3 hrs ago│
│ 🎭 Character | Alex Kim - Zenitsu      | 29 items | 1 day ago│
│ 📦 Prop      | Equipment Setup A       | 12 items | 5 days ago│
│ 📁 Group     | Shared Pose References  | 18 items | 1 week ago│
│ ...                                                           │
└──────────────────────────────────────────────────────────────┘
```

**List View Interactions**:
- **Click row**: Select container (inspector opens)
- **Double-click row**: Drill into container (navigation)
- **Right-click row**: Context menu (Peek, Open, Edit, Delete, Export)
- **Hover row**: Preview thumbnail of first 4 items inside
- **Checkbox**: Multi-select for bulk actions

**Advanced Filtering** (in List View):
- **By container type**: Character, Prop, Group
- **By metadata**: 
  - "Division = Advanced" (for contest management)
  - "Budget > $200" (for cost planning)
  - "Status = In Progress" (for workflow tracking)
- **By date range**: Created date, modified date, event date
- **By item count**: "Containers with > 20 items"
- **By tags**: Same tag filtering as canvas

**Sorting Options**:
- Name (A-Z, Z-A)
- Created date (newest, oldest)
- Modified date (recently updated)
- Item count (most items, fewest items)
- Alphabetical by metadata field (e.g., sort contestants by division)

**Bulk Actions in List View**:
- Multi-select containers (checkboxes)
- Bulk add tags
- Bulk export (CSV, JSON, PDF reports)
- Bulk move to another container (nesting)
- Bulk delete
- Bulk metadata edit (e.g., change all "Novice" to "Intermediate")

**Search Bar** (always visible in list view):
- Real-time search across: Container names, metadata values, tags
- Example: Search "Advanced" shows all Advanced division contestants
- Example: Search "Demon Slayer" shows all Demon Slayer characters

**2. CSV Import with Mapping Interface**

**Purpose**: Bulk create nodes from spreadsheet data

**Import Flow**:

**Step 1: Upload CSV**
- User clicks "Import" → "From CSV file"
- File picker: Select .csv or .xlsx file
- System parses file, detects columns

**Step 2: Column Mapping Interface**

```
┌─────────────────────────────────────────────────────────┐
│ CSV Import: Map Columns to Node Fields                 │
├─────────────────────────────────────────────────────────┤
│ Preview: 50 rows detected                               │
│                                                          │
│ Map each column to a node field:                        │
│                                                          │
│ CSV Column          →  Node Field                       │
│ ────────────────────────────────────────────────────────│
│ Name                →  [Container Name ▼]               │
│ Email               →  [Contact: Email ▼]               │
│ Character           →  [Metadata: Character Name ▼]     │
│ Series              →  [Metadata: Series ▼]             │
│ Division            →  [Metadata: Custom Field ▼]       │
│ Prejudging Time     →  [Event Date ▼]                   │
│                                                          │
│ Node Type to Create: [Container ▼]                      │
│ Container Type:      [Character ▼]                      │
│                                                          │
│ [Preview Import] [Cancel] [Import 50 Nodes]             │
└─────────────────────────────────────────────────────────┘
```

**Mapping Options** (dropdown for each column):
- **Container Name** (required for containers)
- **Node Content/Title** (for notes, images, etc.)
- **Tags** (comma-separated values in CSV become tags)
- **Metadata: Character Name** (standard container field)
- **Metadata: Series** (standard container field)
- **Metadata: Custom Field** (creates custom field with column name)
- **Contact: Email** (if creating contact nodes)
- **Contact: Phone** (if creating contact nodes)
- **Event Date** (if creating event nodes, must be valid date format)
- **Budget Amount** (if creating budget items)
- **Ignore Column** (skip this column)

**Step 3: Preview Import**
- Shows first 5 rows with mapped data
- User can verify mapping is correct
- Example preview:
  ```
  Container 1:
  - Name: Sarah Chen - Tanjiro
  - Type: Character
  - Character Name: Tanjiro
  - Series: Demon Slayer
  - Custom Field (Division): Advanced
  - Event: 2026-03-15 14:00 (Prejudging Time)
  ```

**Step 4: Import Options**
- **Create as**: Containers, Contact nodes, Event nodes, Note nodes, Budget items
- **Position on canvas**: Grid layout, List (no position), Existing container (nested)
- **Auto-tag**: Add tag to all imported nodes (e.g., "#ImportedContestants")
- **Create connections**: Option to auto-connect related nodes

**Step 5: Execute Import**
- Progress bar: "Importing 50 nodes..."
- Creates nodes with mapped data
- Toast notification: "Successfully imported 50 containers"
- Opens list view filtered to show imported nodes

**CSV Format Requirements**:

**Flexible Parsing**:
- System detects: Commas, tabs, semicolons as delimiters
- First row assumed to be headers (column names)
- Handles quoted fields with commas inside
- Handles UTF-8 encoding (international characters)

**Example CSV for Contest Management**:
```csv
Name,Email,Character,Series,Division,Prejudging Time,Stage Time
Sarah Chen,sarah@email.com,Tanjiro,Demon Slayer,Advanced,2026-03-15 14:00,2026-03-15 19:00
Mike Liu,mike@email.com,Inosuke,Demon Slayer,Advanced,2026-03-15 14:15,2026-03-15 19:15
```

**Example CSV for Budget Items**:
```csv
Item Name,Estimated Cost,Actual Cost,Quantity,Supplier,Priority
Foam Sheets,$25.00,$28.50,5,Foam Mart,High
Contact Cement,$12.00,$12.00,1,Hardware Store,High
Paint Set,$35.00,,1,Art Supply,Medium
```

**3. CSV Export**

**Purpose**: Export moodboard data for external tools (Excel, reports)

**Export Options**:
- **Export current view**: Exports nodes visible in current filter
- **Export selected**: Exports only selected nodes
- **Export all**: Exports entire moodboard

**Export Format**:
- CSV (Excel-compatible)
- JSON (structured data)
- Markdown (human-readable)

**Exported Fields**:
- All node metadata (name, type, tags, custom fields)
- Creation/modification dates
- Connection counts
- URLs (for images, social media)

**Use Case: Contest Judging Report**
- Rachel exports all 50 contestant containers as CSV
- Includes: Name, Character, Division, Item count, Prejudging time
- Opens in Excel, shares with judges
- After contest, imports updated CSV with scores/rankings

**Rationale**:
- **List view with filters**: Efficiently manage 50+ containers without clutter
- **CSV import with mapping**: Flexible bulk creation without strict format requirements
- **Mapping interface**: Handles varying CSV structures (different column names, orders)
- **CSV export**: Interoperability with external tools (Excel, Google Sheets)
- **Preview before import**: Prevents errors, builds user confidence

**Implementation Notes**:

**Enhanced List View**:
- Server-side filtering and sorting (for performance with 1000+ nodes)
- Virtual scrolling for large lists (only render visible rows)
- Metadata filter query builder (WHERE clauses on JSONB fields)

**CSV Import**:
- Library: `papaparse` (robust CSV parser)
- Column detection: Fuzzy matching on column names (e.g., "Name" matches "name", "Name ", "NAME")
- Validation: Check required fields before import
- Transaction: Import all-or-nothing (rollback if error mid-import)
- Duplicate detection: Optional "Skip if container name exists"

**CSV Export**:
- Library: `papaparse` (CSV generator)
- Flatten JSONB metadata into columns
- Handle nested data (e.g., checklist items become comma-separated)
- Excel-compatible encoding (UTF-8 with BOM)

**Impact**:
- UX: Power users can manage hundreds of nodes efficiently
- UX: Bulk import reduces repetitive manual entry (saves hours)
- UX: CSV export enables reporting and external tool integration
- Data model: No schema changes (uses existing node structure)
- Components: Enhanced ListView with filters, CSVImportModal, mapping interface
- Performance: Server-side filtering crucial for large datasets
- Interoperability: Works with Excel, Google Sheets, Airtable, Notion

---

---

### Decision 8: Canvas Accessibility and Alternative Views

**Question**: How do we handle accessibility for canvas view, which is fundamentally visual and spatial?

**Discussion**: Infinite canvas with freeform positioning, spatial relationships, and visual edges is difficult to make fully accessible for keyboard-only and screen reader users. Need honest assessment of limitations and alternatives.

**Decision: Canvas = Visual, List/Table/Gallery = Accessible Alternatives**

**Accessibility Strategy**:

**Canvas View Accessibility**:
- **Primary audience**: Mouse/touch users
- **Limited keyboard support**: 
  - Tab through nodes (spatial order or creation order)
  - Enter/Space to open node
  - Arrow keys to navigate between nodes (nearest neighbor)
  - Escape to deselect/exit
- **Screen reader support**: 
  - Announces node count: "Canvas with 45 nodes"
  - Announces node type and name when focused
  - Cannot convey spatial layout effectively
- **Honest limitation**: "Canvas view is optimized for visual interaction. For full keyboard and screen reader accessibility, use List or Table view."

**Fully Accessible Views**:

**1. List View** (Best for screen readers):
- Standard list with ARIA markup
- Full keyboard navigation (arrow keys, tab, enter)
- Screen reader announces: Node type, name, metadata, position in list
- Search and filter accessible
- All CRUD operations keyboard-accessible

**2. Table View** (Best for keyboard-only users):
- Spreadsheet-style navigation (arrow keys, tab)
- Inline editing with keyboard
- Sort by clicking column headers (keyboard accessible)
- Screen reader reads table structure properly

**3. Gallery View** (Good for low vision):
- Grid layout with large cards
- High contrast mode support
- Keyboard navigation (arrow keys in grid)
- Screen reader friendly (card structure)

**WCAG 2.1 Compliance Strategy**:

**Level AA Compliance** (Required):
- ✅ **1.1.1 Non-text Content**: All images have alt text
- ✅ **1.3.1 Info and Relationships**: Semantic HTML in all views
- ⚠️ **1.3.2 Meaningful Sequence**: Canvas spatial order may not be meaningful for screen readers → **Alternative: List view provides meaningful sequence**
- ✅ **1.4.3 Contrast**: All text meets 4.5:1 ratio
- ✅ **2.1.1 Keyboard**: All functionality available via keyboard in List/Table/Gallery views
- ⚠️ **2.1.1 Keyboard**: Canvas has basic keyboard support but limited spatial manipulation → **Alternative views provide full keyboard access**
- ✅ **2.4.3 Focus Order**: Tab order logical in all views
- ✅ **2.4.7 Focus Visible**: Clear focus indicators
- ✅ **4.1.2 Name, Role, Value**: All controls properly labeled

**Accessibility Statement** (Documentation):

```markdown
# Accessibility Statement

Cosplans is committed to making our moodboard system accessible to all users.

## View Accessibility Levels

### Fully Accessible (WCAG 2.1 AA Compliant)
- **List View**: Optimized for screen readers and keyboard-only navigation
- **Table View**: Optimized for keyboard navigation with spreadsheet-style controls
- **Gallery View**: Accessible with keyboard and screen reader support

### Limited Accessibility
- **Canvas View**: Optimized for visual interaction with mouse/touch
  - Basic keyboard navigation available (Tab, Arrow keys, Enter, Space)
  - Screen reader announces nodes but cannot convey spatial relationships
  - **Recommendation**: Use List or Table view for full accessibility

## Keyboard Shortcuts
- All shortcuts work in all views
- Full keyboard shortcut list available in Help menu (press ?)

## Screen Reader Support
- Tested with NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)
- Best experience in List and Table views

## High Contrast Mode
- Supports system-level high contrast settings
- Custom high contrast theme available in Settings

## Need Help?
Contact us at accessibility@cosplans.com
```

**User Onboarding** (First-time users):

**Accessibility Detection**:
- System detects screen reader active (via `aria-live` test)
- Shows modal: "Welcome! We detected you're using a screen reader. Would you like to default to List view for better accessibility?"
- User can choose: "Yes, use List view" or "No, show Canvas"
- Preference saved for future sessions

**View Switcher Hint**:
- First time in Canvas view with screen reader: Banner appears
- "Canvas view is primarily visual. Switch to List view for full screen reader support."
- Dismissible banner, doesn't appear again

**Rationale**:
- **Honest about limitations**: Canvas is spatial/visual by nature, not fully accessible
- **Provide alternatives**: List/Table/Gallery views are fully accessible equivalents
- **Same functionality**: All features work in all views (create, edit, delete, tag, connect)
- **User choice**: Don't force accessible views, but recommend them
- **WCAG compliance**: Achieved through alternative views, not requiring Canvas accessibility
- **Industry standard**: Figma, Miro, Milanote all have similar limitations and alternatives

**Implementation Notes**:

**Canvas Keyboard Support** (Basic):
- Tab order: Nodes in creation order or spatial grid order (configurable)
- Arrow keys: Move between nodes using nearest-neighbor algorithm
- Enter: Open node (lightbox, drill-in, etc.)
- Space: Select node
- Escape: Deselect, close panel
- Delete: Delete selected node (with confirmation)
- Screen reader: Announce node type, name, tags, connection count

**Accessible Views** (Full):
- All ARIA landmarks properly labeled
- All interactive elements keyboard-accessible
- Focus management on view switch
- Screen reader announcements for state changes
- High contrast mode support

**Testing Requirements**:
- Manual testing with NVDA, JAWS, VoiceOver
- Keyboard-only testing (no mouse)
- Automated accessibility testing (axe, WAVE)
- User testing with screen reader users (before launch)

**Impact**:
- Accessibility: WCAG 2.1 AA compliant through alternative views
- UX: Clear guidance for screen reader users
- Documentation: Honest accessibility statement
- Testing: Regular accessibility audits required
- Legal: Meets ADA compliance for web accessibility

---

## Design Principles Discovered

Based on council discussion, these principles emerged:

1. **Progressive Disclosure**: Show simple by default, reveal complexity as needed (context bar, toolbars)

2. **Workflow Flexibility**: Support both organized (containers) and chaotic (piles) working styles

3. **Visual + Accessible**: Provide visual spatial canvas AND accessible linear views

4. **Connected Context**: Everything connects (events ↔ contacts ↔ costumes ↔ checklists)

5. **Multi-Project Cross-Reference**: Ghost nodes solve shared resources across projects

6. **Real-World Analogies**: 
   - Piles = stacks of paper
   - Containers = binders
   - Peek = looking through binder sleeve
   - Templates = blank forms to fill out

7. **Bulk Operations**: Power users need efficient multi-select and batch actions

8. **Interoperability**: CSV import/export for working with external tools

9. **Build and Compare**: Annotate references, track progress, compare results

10. **Honest Accessibility**: Don't claim full accessibility where it's not feasible; provide alternatives

---

## Feature Summary

### New Node Types (7)
1. **Pile**: Single-layer grouping, expands in-place
2. **Container**: Deep nesting, drill-in navigation (character, prop, group)
3. **Event**: Calendar-synced scheduling with date/time/location
4. **Contact**: People/businesses with contact info and relationships
5. **Checklist**: Task lists with progress tracking and attachments
6. **Compare**: Side-by-side comparison of any two nodes
7. **Enhanced Sketch**: Image annotation with drawing tools and side notes

### New Edge Types (2)
1. **Sequential**: Ordered progression chains (WIP Day 1 → Day 2 → Day 3)
2. **Ghost edges**: Create ghost node clones in connected containers

### Major Features (12)
1. **Progressive disclosure UI**: Collapsible context bar, dropdown toolbars
2. **Inspector panel**: Right sidebar (desktop) / bottom drawer (mobile)
3. **Container peek**: Quick view without navigation
4. **Pile-to-container conversion**: Natural growth pattern
5. **Ghost nodes**: Cross-container visibility without duplication
6. **Ghost filtering**: Visual highlighting (dim non-matches)
7. **Node templates**: Reusable structures (checklists, containers, notes)
8. **Batch operations**: Multi-select bulk actions (tag, delete, move, connect)
9. **Enhanced list view**: Filter, sort, search, container-only mode
10. **CSV import/export**: Bulk data with mapping interface
11. **Sequential timeline**: Progress tracking with scrubber/animation
12. **Compare modes**: Side-by-side, slider, overlay

### Accessibility Features (3)
1. **Alternative accessible views**: List, Table, Gallery (WCAG 2.1 AA)
2. **Screen reader detection**: Auto-suggest accessible view
3. **Honest documentation**: Clear about canvas limitations

---

## Open Questions

*Questions we still need to resolve*

---

## Feature Additions

*New features identified during council discussion*

---

## Design Principles Discovered

*High-level principles that emerged from the discussion*

