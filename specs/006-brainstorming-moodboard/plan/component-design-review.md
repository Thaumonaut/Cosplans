# Component Design Review - Feature 006

**Feature**: Enhanced Brainstorming & Moodboarding
**Created**: 2026-01-08
**Status**: Design Phase
**Purpose**: Systematically review each component's interaction patterns, evaluate design approaches, and ensure cohesive UX across the feature

---

## Process

For each major component, we will:

1. **Define the user flow** - What is the user trying to accomplish?
2. **Present 2-3 design approaches** - Different interaction patterns
3. **Document tradeoffs** - Pros/cons of each approach
4. **Collect targeted references** - High-quality examples of each pattern
5. **Make recommendation** - Which approach fits our system best
6. **Document integration** - How it connects with other components
7. **Get your feedback** - Decision form for approval/notes/alternatives

---

## Decision Tracking

**How to Use This Section**:

- Review each component's approaches
- Use the decision form at the end of each component to:
  - ✅ Approve the recommendation
  - ⚠️ Approve with modifications
  - 🤔 Flag for discussion
  - ❌ Reject and suggest alternative
- Add your notes, questions, and alternative ideas
- I'll review your feedback and iterate on the design


| #  | Component                | AI Recommendation           | Your Decision | Status         | Quick Notes                      |
| ---- | -------------------------- | ----------------------------- | --------------- | ---------------- | ---------------------------------- |
| 1  | Moodboard Canvas         | C: Hybrid (freeform + grid) | ✅ Approved   | 🟢 Approved    | Add "piles" as expandable groups |
| 2  | Node Creation            | D: Multi-Modal              | ⚠️ Modified | 🟡 Draft       | Replace FAB with bottom toolbar  |
| 3  | Node Connections         | A: Manual Edges             | ✅ Approved   | 🟢 Approved    | Manual is good enough            |
| 4  | Canvas Controls          | C: Contextual (revised)     | ⚠️ Modified | 🟠 Discussion  | Auto-hide with hotkey hints      |
| 5  | Social Media Integration | C: Hybrid (PWA + Paste)     | ✅ Approved   | 🟢 Approved    | PWA day-one, add install prompt  |
| 6  | Image Upload             | C: Multi-Modal              | ✅ Approved   | 🟢 Approved    |                                  |
| 7  | Character Lookup         | C: Hybrid (Inline + Browse) | ✅ Approved   | 🟢 Approved    | Quick vs deep search             |
| 8  | Budget Item Creation     | TBD                         | ⬜ Pending    | 🔴 Not Started | Similar to node creation         |
| 9  | View Switcher            | C: Icon Toolbar             | ✅ Approved   | 🟢 Approved    |                                  |
| 10 | Table View               | C: Hybrid (Inline + Drawer) | ⚠️ Modified | 🟢 Approved    | Use drawer instead of modal      |
| 11 | Gallery View             | B: Masonry Grid             | ✅ Approved   | 🟢 Approved    |                                  |
| 12 | Timeline View            | B: Vertical Feed            | ✅ Approved   | 🟢 Approved    | Social feed style                |
| 13 | List View                | Hybrid: B+C                 | ⚠️ Modified   | 🟠 Discussion  | Nested cards + compact mode      |
| 14 | Graph View               | C: Hybrid Force-Directed    | ✅ Approved   | 🟢 Approved    | With stabilization               |
| 15 | Option Tabs              | Hybrid: Tabs/Dropdown       | ⚠️ Modified   | 🟠 Discussion  | Base node linking concept        |
| 16 | Option Comparison        | Hybrid: Side-by-Side/Swiper | ✅ Approved   | 🟢 Approved    | Responsive                       |
| 17 | Idea→Project Wizard     | A: Modal Wizard             | ✅ Approved   | 🟢 Approved    | 5-step guided flow               |
| 18 | Budget Summary           | C: Badge + Drawer           | ✅ Approved   | 🟢 Approved    | Toolbar badge                    |
| 19 | Share Dialog             | C: Two-Tier (Simple+Adv)    | ✅ Approved   | 🟢 Approved    | Progressive disclosure           |
| 20 | Comments System          | A: Inline Comments          | ⚠️ Modified   | 🟠 Discussion  | Better UX, contained convos      |

**Status Key**:

- 🟢 **Approved** - Decision finalized, ready for implementation
- 🟡 **Draft** - Design complete, awaiting your review
- 🟠 **Discussion** - Needs further discussion or alternatives
- 🔴 **Not Started** - Component not yet designed

**Your Decision Key**:

- ✅ = Approved as-is
- ⚠️ = Approved with modifications
- 🤔 = Needs discussion
- ❌ = Rejected, prefer alternative

---

## Component Inventory

### Core Canvas Components

1. [Moodboard Canvas](#1-moodboard-canvas) - Infinite canvas with pan/zoom
2. [Node Types & Creation](#2-node-types--creation) - Adding items to canvas
3. [Node Connections](#3-node-connections) - Edges between nodes
4. [Canvas Controls](#4-canvas-controls) - Zoom, pan, minimap

### Content Integration Components

5. [Social Media Link Integration](#5-social-media-link-integration) - Add links, fetch previews
6. [Image Upload & Management](#6-image-upload--management) - Upload, organize images
7. [Character Database Lookup](#7-character-database-lookup) - ⚠️ **NEEDS DESIGN**
8. [Budget Item Creation](#8-budget-item-creation) - Add costs, vendors

### View & Organization Components

9. [View Mode Switcher](#9-view-mode-switcher) - Canvas/Table/Gallery/Timeline/List/Graph
10. [Table View](#10-table-view) - Spreadsheet-style editing
11. [Gallery View](#11-gallery-view) - Pinterest-style grid
12. [Timeline View](#12-timeline-view) - Chronological layout

### Multi-Option Management

13. [Option Tabs/Switcher](#13-option-tabsswitcher) - Multiple costume versions
14. [Option Comparison](#14-option-comparison) - Side-by-side view

### Conversion & Workflow

15. [Idea→Project Wizard](#15-ideaproject-wizard) - Guided conversion flow
16. [Budget Summary](#16-budget-summary) - Totals, categories

### Sharing & Collaboration

17. [Share Dialog](#17-share-dialog) - Generate link, permissions
18. [Comments System](#18-comments-system) - OAuth commenting

---

## 1. Moodboard Canvas

**User Goal**: Visually organize inspiration items in a freeform spatial layout

### Design Approaches

#### Approach A: Pure Infinite Canvas (Miro/Milanote style)

- **Pattern**: Completely freeform, drag items anywhere, infinite in all directions
- **Interaction**:
  - Pan: Click+drag background
  - Zoom: Mouse wheel / pinch
  - Add: Click "+" button → creates node at viewport center
  - Move: Drag nodes freely

**Pros**:

- Maximum flexibility
- Familiar to users of Miro/Milanote
- Natural for brainstorming
- No artificial constraints

**Cons**:

- Can become chaotic/disorganized
- Harder to find items without search
- Mobile: infinite pan can be confusing
- Performance concerns with 200+ items

#### Approach B: Sectioned Canvas (Notion-style boards)

- **Pattern**: Canvas divided into columns/sections with free positioning within sections
- **Interaction**:
  - Columns: Fixed vertical sections (e.g., "Fabric", "Makeup", "References")
  - Drag between columns
  - Free Y-positioning within column

**Pros**:

- Built-in organization
- Easier to scan/navigate
- Better mobile experience (scroll columns)
- Familiar from Kanban boards

**Cons**:

- Less flexible than pure canvas
- Requires upfront section planning
- Doesn't match "infinite canvas" requirement

#### Approach C: Hybrid (Milanote + optional grid)

- **Pattern**: Infinite canvas with optional snap-to-grid and section boundaries
- **Interaction**:
  - Default: Freeform like Approach A
  - Toggle: Enable grid snapping for alignment
  - Optional: Draw section boxes for grouping
  - Minimap: Shows all sections

**Pros**:

- Best of both worlds
- User can choose structure level
- Supports both chaos and organization
- Section boxes provide visual grouping

**Cons**:

- More complex to implement
- Need to teach both modes
- Grid snapping can feel restrictive

### Recommendation: **Approach C (Hybrid)** ✅

**Rationale**:

- Matches spec requirement for "freeform infinite canvas"
- Optional grid/sections support users who want structure
- Section boxes (groups) already in spec
- Allows both creative exploration AND organized planning

---

### 📝 Your Decision & Notes

**Mark your choice** (edit the line below):

- [X] ✅ Approve Approach C (Hybrid)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
Add your thoughts here]
- What you like about this approach
- Concerns or questions
- Modifications you'd like to see
- Alternative ideas

I like the idea of structure with chaos. so you could have "piles" as groups and if you click in the pile expands into a new canvas or grid view where you can organize priority in the pile. this fits well with the adhd brain of organized piles or organized chaos.i also think somethink like unreal engine blueprints is a good example of connected and nested ideas.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### References Needed:

- [ ] Milanote: Screenshot of actual board with 20+ items
- [ ] Miro: Board with section boxes/frames
- [ ] Obsidian Canvas: Node layout and connections
- [ ] FigJam: Freeform with section headers

### Integration Points:

- **View Switcher**: Canvas is one of 6 views
- **Node Creation**: All node types appear on canvas
- **Minimap**: Shows canvas overview for navigation

---

## 2. Node Types & Creation

**User Goal**: Quickly add different types of content to the moodboard

### Design Approaches

#### Approach A: Context Menu (Right-click)

- **Pattern**: Right-click canvas → menu with node types
- **Interaction**:
  - Right-click background → "Add Image", "Add Link", "Add Note", "Add Budget Item"
  - Node appears at click position
  - Inline editing immediately

**Pros**:

- Fast for power users
- No UI clutter
- Precise positioning
- Familiar desktop pattern

**Cons**:

- Not discoverable
- Doesn't work on mobile (no right-click)
- Requires different mobile solution

#### Approach B: Floating Action Button (FAB)

- **Pattern**: "+" button in bottom-right corner → opens type picker
- **Interaction**:
  - Click "+" → radial menu or list of node types
  - Select type → node appears at viewport center
  - Drag to position

**Pros**:

- Always visible
- Works on mobile
- Familiar mobile pattern
- Consistent across devices

**Cons**:

- Node appears at center (not where you want it)
- Extra step to position
- FAB can block canvas content

#### Approach C: Toolbar + Drag-to-Create

- **Pattern**: Node type buttons in toolbar → drag to canvas to create
- **Interaction**:
  - Toolbar shows: [Image] [Link] [Note] [Budget] buttons
  - Drag button onto canvas → creates node at drop position
  - Or: Click button → cursor changes → click canvas to place

**Pros**:

- Visual, discoverable
- One-step create + position
- Works on desktop
- No hidden menus

**Cons**:

- Toolbar takes space
- Drag gesture awkward on mobile
- May need separate mobile solution

#### Approach D: Multi-Mode (Context + FAB + Toolbar)

- **Pattern**: All three methods available
- **Interaction**:
  - Desktop: Toolbar for discovery, right-click for speed
  - Mobile: FAB only
  - Keyboard: Shortcuts (e.g., 'i' for image, 'l' for link)

**Pros**:

- Accommodates all user types
- Power users get shortcuts
- Beginners get visual tools
- Mobile-optimized separately

**Cons**:

- Complex to implement
- Multiple ways to do same thing
- Inconsistent?

### Recommendation: **Approach D (Multi-Mode)** ✅

**Rationale**:

- Accommodates both desktop and mobile
- Progressive disclosure: toolbar for beginners, shortcuts for experts
- Industry standard (Figma, Miro all have multiple creation methods)
- Flexibility > simplicity for creative tools

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [ ] ✅ Approve Approach D (Multi-Mode)
- [X] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
i dont like the fab idea but something like obsidian mobile with a bottom toolbar that sits above the keyboard and tap and hold for quick menu to add new nodes.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### References Needed:

- [ ] Figma: Toolbar with shape tools + drag-to-create
- [ ] Miro: FAB menu on mobile vs toolbar on desktop
- [ ] FigJam: Sticky note creation flow (click toolbar vs keyboard)
- [ ] Notion: Add block menu (slash commands + buttons)

### Integration Points:

- **Mobile vs Desktop**: Different UIs for same action
- **Keyboard Shortcuts**: Quick creation for power users
- **Default Node Position**: Viewport center vs cursor position

---

## 3. Node Connections

**User Goal**: Show relationships between nodes (e.g., "this wig works with both costumes")

### Design Approaches

#### Approach A: Manual Edge Drawing

- **Pattern**: Click node → drag handle → drop on target node
- **Interaction**:
  - Hover node → shows connection handles (circles on edges)
  - Drag handle → draw arrow
  - Drop on another node → creates edge
  - Click edge → add label

**Pros**:

- Precise control
- Visual feedback
- Familiar from flowchart tools
- Labeled edges support explanations

**Cons**:

- Fiddly on mobile
- Requires explanation/tutorial
- Handles add visual clutter

#### Approach B: Connection Mode Toggle

- **Pattern**: Enable "connect mode" → click two nodes → creates edge
- **Interaction**:
  - Click "Connect" button in toolbar
  - Click first node (highlights)
  - Click second node (creates edge)
  - Type label (optional)
  - Exit mode

**Pros**:

- Easier on mobile (just tapping)
- No handle clutter
- Clear mode separation
- Two-click simplicity

**Cons**:

- Mode switching is annoying
- Not as fluid as drag
- Forget to exit mode
- No visual during creation

#### Approach C: Automatic Smart Connections

- **Pattern**: System suggests connections based on proximity, tags, or content
- **Interaction**:
  - Add nodes near each other → suggested connection appears (dotted)
  - Click suggestion to confirm
  - Same tags → auto-suggest connection
  - Manual creation still available

**Pros**:

- Reduces user work
- AI/smart assistance
- Discovers relationships user might miss
- Progressive: manual always available

**Cons**:

- Complex logic to implement
- May suggest wrong connections
- Could be annoying
- Over-engineering for MVP?

### Recommendation: **Approach A (Manual) for MVP, Approach C (Smart) for future** ✅

**Rationale**:

- Manual edges are well-understood pattern
- Match spec: "Connection lines between related items"
- Smart suggestions can be added later as enhancement
- Keep MVP simple, iterate with usage data

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach A (Manual edges)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
i think manual is good enough unless we get feedback for better connections with nodes.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### References Needed:

- [ ] Obsidian Canvas: Edge creation with handles
- [ ] Excalidraw: Arrow drawing between elements
- [ ] Miro: Connection creation flow
- [ ] Whimsical: Edge labels and styling

### Integration Points:

- **Graph View**: Shows only nodes + edges (no canvas positioning)
- **Edge Labels**: Text annotations on connections
- **Edge Styling**: Color, line style (future)

---

## 7. Character Database Lookup

**User Goal**: Find and attach character information to an idea without manual entry

### Context

This is a critical component that the user specifically called out. We need to design the interaction carefully as it impacts the idea creation flow.

**Current Database**: Characters have:

- Name
- Series/Fandom
- Image
- Tags
- Metadata (gender, appearance notes)

**User Story**: "When creating a new idea, I want to search for existing characters or enter a new character name"

### Design Approaches

#### Approach A: Inline Search Bar (Auto-complete)

- **Pattern**: Type-ahead search in a single input field
- **Interaction**:
  1. User types in "Character" field on idea form
  2. After 2 characters, dropdown shows matching results
  3. Results show: character name, series, thumbnail
  4. Click result → fills character_id
  5. Or: Keep typing → create new character inline
  6. Hit Enter → creates new if no match selected

**Pros**:

- Fast, minimal UI
- No interruption to flow
- Familiar (like Google search)
- Works for both existing + new
- Single field handles everything

**Cons**:

- Can't see full character details before selecting
- Limited space for search results
- Hard to browse all characters
- New character creation is implicit (might create dupes)

**Tradeoffs**:

- ✅ Speed > Precision
- ✅ Flow > Exploration
- ❌ Can create duplicate characters accidentally

#### Approach B: Search Modal/Dialog

- **Pattern**: Dedicated search interface in a modal
- **Interaction**:
  1. Click "Select Character" button → opens modal
  2. Modal shows: search bar + grid of recent/popular characters
  3. Type to search, or browse grid
  4. Click character → shows detail view
  5. Confirm → closes modal, fills field
  6. Or: "Create New Character" button → new character form

**Pros**:

- More space for results
- Can show character details before selecting
- Browse mode for exploration
- Explicit new character creation (fewer dupes)
- Can show additional metadata

**Cons**:

- Interrupts flow (modal context switch)
- Extra click to open
- Slower for users who know character name
- More complex UI

**Tradeoffs**:

- ✅ Precision > Speed
- ✅ Exploration > Flow
- ✅ Prevents duplicates
- ❌ More clicks

#### Approach C: Hybrid (Inline + Browse)

- **Pattern**: Inline search with "Browse" button
- **Interaction**:
  1. Default: Inline auto-complete field (Approach A)
  2. "Browse" button next to field → opens modal (Approach B)
  3. Best of both:
     - Fast: Just type and select
     - Careful: Click browse to see options
  4. New character: "+ Create New" at bottom of dropdown

**Pros**:

- Power users get speed
- New users get exploration
- Accommodates both use cases
- Clear "create new" action

**Cons**:

- Two ways to do same thing
- More implementation work
- Need to design both UIs
- Complexity?

**Tradeoffs**:

- ✅ Flexibility > Simplicity
- ✅ Supports both mental models

#### Approach D: Command Palette (Notion-style)

- **Pattern**: Slash commands or command palette
- **Interaction**:
  1. Type "/" in character field → shows command menu
  2. Options: "/search", "/browse", "/create new"
  3. Select mode → appropriate UI appears
  4. Or: Smart detection:
     - Just typing → assumes search
     - Type "/" → shows menu

**Pros**:

- Powerful, extensible pattern
- Keyboard-friendly
- Can add more commands later
- Feels modern/professional

**Cons**:

- Requires learning
- Not discoverable for new users
- Overkill for one field?
- Mobile: slash commands are awkward

**Tradeoffs**:

- ✅ Power > Simplicity
- ❌ Requires education

### Recommendation: **Approach C (Hybrid)** ✅

**Rationale**:

1. **Supports both use cases**:

   - Fast: Type and pick (90% of the time)
   - Careful: Browse and compare (10% of the time, new users, or when uncertain)
2. **Prevents duplicate characters**:

   - Clear "+ Create New" option in dropdown
   - Browse mode shows all existing characters
   - Harder to accidentally create dupes
3. **Progressive disclosure**:

   - Simple by default (just type)
   - Advanced option available (browse)
   - Doesn't overwhelm new users
4. **Mobile-friendly**:

   - Inline autocomplete works on mobile
   - Browse modal works on mobile
   - No complex gestures needed

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach C (Hybrid - Inline + Browse)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
i like the idea of a quick search and a deep search where a quick search is good for finding quick information vs a deep search for specific reference material.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Inline Auto-complete**:

```
┌─────────────────────────────────────────────────┐
│ Character: [Asuka Langley Soryu___________] [🔍]│
│                                                  │
│   ┌──────────────────────────────────────────┐  │
│   │ 🔍 Search results for "Asuka"            │  │
│   ├──────────────────────────────────────────┤  │
│   │ [img] Asuka Langley Soryu                │  │
│   │       Neon Genesis Evangelion            │  │
│   ├──────────────────────────────────────────┤  │
│   │ [img] Asuka R. Kreutz                    │  │
│   │       Guilty Gear                        │  │
│   ├──────────────────────────────────────────┤  │
│   │ + Create new character "Asuka"           │  │
│   └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Browse Modal** (click 🔍 button):

```
┌─────────────────────────────────────────────────┐
│ ✕ Select Character                              │
├─────────────────────────────────────────────────┤
│ [Search characters_____________________] [🔍]   │
│                                                  │
│ Recently Used:                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐                     │
│ │ Saber│ │ Asuka│ │ Miku │                     │
│ │[img] │ │[img] │ │[img] │                     │
│ └──────┘ └──────┘ └──────┘                     │
│                                                  │
│ Popular Characters:                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │ Zero │ │ Link │ │ Cloud│ │Naruto│           │
│ │[img] │ │[img] │ │[img] │ │[img] │           │
│ └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                  │
│ [+ Create New Character]                        │
└─────────────────────────────────────────────────┘
```

### References Needed:

- [ ] GitHub: Repository search (inline autocomplete)
- [ ] Notion: Page mentions (@-mentions with dropdown)
- [ ] Linear: Issue search modal with recent items
- [ ] Figma: Component search (inline + browse library)
- [ ] Slack: Channel/user picker (hybrid search)

### Integration Points:

- **Idea Creation Form**: Character field is required
- **Character Management**: Create new characters inline or via dedicated page
- **Duplicate Prevention**: Search existing before creating new
- **Mobile**: Auto-complete dropdown must work on mobile keyboards
- **Performance**: Debounce search queries (300ms), limit results (10 max)

### Implementation Notes:

- Use `<Combobox>` component from Melt UI / Shadcn
- Debounce search: `debounce(handleSearch, 300)`
- Fuzzy matching: Include series name in search
- Cache recent characters client-side
- Thumbnail lazy loading in browse modal

---

## Next Steps

### For Each Remaining Component:

1. **Define user goal**
2. **Present 2-3 approaches**
3. **Document tradeoffs**
4. **Make recommendation**
5. **Collect targeted references**

### Components to Complete:

- [ ] Social Media Link Integration
- [ ] Image Upload & Management
- [ ] Budget Item Creation
- [ ] View Mode Switcher
- [ ] Table View
- [ ] Gallery View
- [ ] Timeline View
- [ ] Option Tabs/Switcher
- [ ] Option Comparison
- [ ] Idea→Project Wizard
- [ ] Budget Summary
- [ ] Share Dialog
- [ ] Comments System

### Reference Collection Strategy:

For each component, collect **2-3 high-quality examples**:

1. **Screenshot actual product** (not marketing page)
2. **Show interaction state** (hover, active, focused)
3. **Include annotations** (what makes it good/bad)
4. **Name the file** descriptively (e.g., `github-autocomplete-mentions.png`)

### Design System Integration:

After individual components are designed:

1. **Review consistency**: Do patterns match?
2. **Identify shared components**: What can be reused?
3. **Document component library**: Card, Button, Autocomplete, etc.
4. **Create style guide**: Colors, typography, spacing for this feature

---

## 5. Social Media Link Integration

**User Goal**: Capture inspiration from Instagram/TikTok/Pinterest while browsing and watch content directly in the app

**Priority**: 🔥 HIGH - User Story #1

### Context

Users are scrolling Instagram/TikTok and find cosplay inspiration. They need to:

1. **Quickly save** the content without breaking their flow
2. **Watch videos** directly in Cosplans (embedded Reels/TikToks)
3. **Organize** by team/idea/moodboard
4. **No app switching** - stay in creative flow

**Supported Platforms**: Instagram, TikTok, Pinterest, YouTube, Facebook

### Design Approaches

#### Approach A: Copy-Paste Only (Desktop-focused)

- **Pattern**: Copy URL from browser → paste in Cosplans
- **Interaction**:
  1. User copies URL from social media
  2. Opens Cosplans in another tab
  3. Pastes URL onto canvas
  4. System fetches preview
  5. Creates LinkNode

**Pros**:

- Simple to implement
- Works on any device
- No special setup needed
- No platform permissions

**Cons**:

- **Breaks flow** (switch tabs, copy, paste)
- **Desktop-biased** (awkward on mobile)
- **No embedded viewing** (links out to platform)
- **Slow** (multiple steps)
- **Easy to forget** (lose inspiration)

**Tradeoffs**:

- ✅ Simplicity > User experience
- ❌ Poor mobile experience
- ❌ No embedded content

#### Approach B: PWA Share Target (Mobile-optimized)

- **Pattern**: Install web app → share from Instagram/TikTok → quick capture flow
- **Interaction**:
  1. **One-time setup**: User installs Cosplans as PWA
  2. **Capture flow**:
     - User sees inspiration on Instagram
     - Taps "Share" → "Cosplans" appears in share sheet
     - Selects Cosplans
     - Quick modal opens: "Save to which idea?"
     - Selects team + idea (or creates new)
     - Content saved with embedded player
  3. **Viewing**: Watch Reels/TikToks directly in Cosplans (no leaving app)

**Pros**:

- **Fast mobile workflow** (tap Share → select idea → done)
- **Embedded viewing** (watch content in-app)
- **No app switching** (stays in flow)
- **Context preservation** (already know which idea)
- **Native feel** (feels like app integration)
- **Works offline** (PWA capabilities)

**Cons**:

- Requires PWA installation (education needed)
- Platform-specific share targets (iOS/Android different)
- May not work on all platforms (browser dependent)
- Embedded content requires iframe support
- Some platforms block embeds (Instagram limits)

**Tradeoffs**:

- ✅ Mobile UX > Implementation complexity
- ✅ Embedded content > Simple links
- ⚠️ Requires PWA setup

#### Approach C: Hybrid (PWA + Paste + Browser Extension)

- **Pattern**: Multiple capture methods for different contexts
- **Interaction**:
  - **Mobile**: PWA share target (Approach B)
  - **Desktop**:
    - Primary: Browser extension (one-click save)
    - Fallback: Smart paste (Approach A with enhancements)
    - Bookmarklet: Drag to bookmark bar, click to capture
  - **All platforms**: Embedded viewing when possible

**Pros**:

- **Best experience on each platform**
- **Multiple entry points** (share, extension, paste)
- **Progressive enhancement** (paste works, share is better)
- **Power users**: Browser extension for one-click
- **Beginners**: Paste still works

**Cons**:

- **Complex to maintain** (3 capture methods)
- **Education needed** (which method when?)
- **More implementation work** (PWA + extension + paste)
- **Testing burden** (all platforms/browsers)

**Tradeoffs**:

- ✅ Best UX on all platforms > Single approach
- ⚠️ Complexity in maintenance

### Recommendation: **Approach C (Hybrid) with Phased Rollout** ✅

**Rationale**:

1. **Phase 1 (MVP)**: Smart paste - works immediately, no setup
2. **Phase 2**: PWA share target - huge mobile UX improvement
3. **Phase 3**: Browser extension - power user feature
4. **Embedded viewing**: Priority for all phases (when platform allows)
5. **Progressive enhancement**: Each phase adds value, doesn't replace previous

**Implementation Priority**:

- **Week 1-2**: Smart paste + embedded players (MVP)
- **Week 3-4**: PWA installation + share target (mobile optimization)
- **Week 5+**: Browser extension + bookmarklet (power users)

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach C (Hybrid PWA + Paste + Extension)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
i think paste is good first but i think pwa is just as important since my cosplay friends are often on instagram and so a quick way to save ideas from instagram is needed day one. but a future feature might be saving pwa shortcuts so if you are working on a project an option to save to a certain idea instead of selecting each time. also we need a popup to let people know on mobile they can download the pwa for better saving options.
```

**Questions for discussion**:

```
[Add any questions here]
- PWA testing requirements?
- Platform embed limitations?
- Timeline feasibility?
```

---

### Detailed Design Spec

#### Phase 1: Smart Paste with Embedded Content

**URL Detection Flow**:

```
User pastes content
    ↓
Is clipboard URL? (regex check)
    ↓ No → Insert as text
    ↓ Yes
    ↓
What's the platform?
    ↓
Instagram/TikTok/YouTube → Create EmbedNode (with player)
Pinterest/Facebook → Create LinkNode (preview card)
Other URL → Create basic LinkNode
```

**EmbedNode vs LinkNode**:

```
State 1: Loading
┌─────────────────────────┐
│ 🔗 Fetching preview...  │
│ [spinner animation]      │
│ instagram.com/p/xyz     │
└─────────────────────────┘

State 2: Success (Preview Loaded)
┌─────────────────────────┐
│ 📷 [Preview Image]      │
│ Amazing cosplay!!        │
│ @cosplayer_name         │
│ 🔗 Instagram            │
└─────────────────────────┘

State 3: Failed (Fallback)
┌─────────────────────────┐
│ 🔗 instagram.com/p/xyz  │
│ (Preview unavailable)    │
│ [Click to open]         │
└─────────────────────────┘
```

### References Needed:

- [ ] **PWA Share Target**: Pinterest PWA share functionality
- [ ] **Instagram embed**: How Instagram handles oEmbed
- [ ] **TikTok embed**: TikTok embed player documentation
- [ ] **YouTube embed**: YouTube iframe API
- [ ] **Notion**: Link paste → bookmark creation
- [ ] **Raindrop.io**: Browser extension + PWA share target
- [ ] **Pocket**: Save-to-app flow on mobile
- [ ] **Are.na**: Multi-platform content capture

### Integration Points:

- **PWA Manifest**: Add share_target configuration
- **Service Worker**: Handle shared content
- **Node Types**: EmbedNode (with player) vs LinkNode (preview card)
- **Metadata Service**: Extract embed URLs and metadata
- **Quick Capture Modal**: Shared component for all capture methods
- **Team/Idea Selector**: Reusable picker component

### Implementation Notes:

#### PWA Share Target Setup:

```json
// manifest.json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

#### Service Worker Share Handler:

```javascript
// service-worker.js
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/share')) {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const url = formData.get('url');
        const title = formData.get('title');
    
        // Open app with share data
        return Response.redirect('/share?url=' + encodeURIComponent(url));
      })()
    );
  }
});
```

#### Metadata Extraction Strategy:

```javascript
// Priority order by platform:
1. YouTube: Use oEmbed API (official)
2. TikTok: Extract video ID, use embed URL
3. Instagram: Use oEmbed API (limited), fallback to Open Graph
4. Pinterest: Use oEmbed API
5. Generic: Open Graph tags, Twitter Cards
6. Fallback: URL only with basic preview
```

#### Embed Node Type:

```typescript
interface EmbedNode extends BaseNode {
  type: 'embed';
  data: {
    url: string;
    platform: 'youtube' | 'tiktok' | 'vimeo' | 'other';
    embedUrl: string;  // iframe src
    thumbnail: string;
    title: string;
    author: string;
    canEmbed: boolean;  // false for Instagram/Facebook
  }
}
```

#### Performance Considerations:

- Lazy load iframe embeds (load when scrolled into view)
- Pause videos when scrolled out of viewport
- Limit concurrent video plays (max 2-3 at once)
- Use thumbnail placeholders until user clicks play
- Cache metadata for 24 hours (reduce API calls)

#### Privacy & Security:

- Use sandbox attribute on iframes
- Restrict iframe permissions (no camera, mic, etc.)
- Validate embed URLs (whitelist domains)
- User consent for autoplay
- CORS proxy for metadata extraction

---

## 6. Image Upload & Management

**User Goal**: Add photos from device/computer to moodboard

**Priority**: 🔥 HIGH - Core moodboard functionality

### Design Approaches

#### Approach A: Click to Upload (Traditional)

- **Pattern**: Click button → file picker → select image → uploads → creates node
- **Interaction**:
  1. Click "Add Image" button
  2. OS file picker opens
  3. User selects 1 or multiple images
  4. Files upload with progress indicator
  5. ImageNode(s) created on canvas
  6. Position nodes automatically

**Pros**:

- Familiar pattern
- Clear, explicit action
- Multi-select supported
- Works on all platforms
- Progress feedback

**Cons**:

- Slow (click → select → wait)
- No direct manipulation
- Hard to position multiple images
- Mobile: file picker is awkward

**Tradeoffs**:

- ✅ Reliability > Speed
- ❌ No direct manipulation

#### Approach B: Drag & Drop (Desktop)

- **Pattern**: Drag files from desktop → drop on canvas → uploads → creates nodes
- **Interaction**:
  1. User drags files from Finder/Explorer
  2. Canvas shows drop zone highlight
  3. Drop files → uploads start
  4. Nodes appear at drop position
  5. Can drag multiple files at once

**Pros**:

- Fast, direct manipulation
- Natural desktop workflow
- Position while uploading
- Feels powerful
- No click needed

**Cons**:

- Desktop only (no mobile)
- Not discoverable (need to teach)
- Some users don't know this pattern
- Drop target must be clear

**Tradeoffs**:

- ✅ Speed > Discoverability
- ❌ Desktop only

#### Approach C: Multi-Modal (Click + Drag + Paste)

- **Pattern**: Support all input methods
- **Interaction**:
  - Desktop: Drag & drop (primary), click to upload (fallback), paste image
  - Mobile: Click to upload, photo camera, paste
  - All methods create ImageNode(s)

**Pros**:

- Accommodates all users
- Power users get speed
- Beginners get buttons
- Platform-appropriate
- Paste clipboard images (screenshots!)

**Cons**:

- Complex to implement all methods
- Need to explain options
- Multiple codepaths to maintain

**Tradeoffs**:

- ✅ Flexibility > Simplicity
- ✅ Platform optimization

### Recommendation: **Approach C (Multi-Modal)** ✅

**Rationale**:

1. **Desktop power users**: Drag & drop is fastest
2. **Mobile users**: Camera/gallery picker is only option
3. **Clipboard**: Paste screenshots is huge productivity win
4. **Progressive disclosure**: All methods available, but primary method is obvious

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach C (Multi-Modal)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Desktop Drop Zone**:

```
Canvas (idle state)
┌─────────────────────────────────────┐
│                                     │
│         [moodboard content]         │
│                                     │
└─────────────────────────────────────┘

Canvas (dragging files over)
┌─────────────────────────────────────┐
│   ╔═══════════════════════════╗     │
│   ║  📷 Drop images here      ║     │
│   ║  to add to moodboard      ║     │
│   ╚═══════════════════════════╝     │
└─────────────────────────────────────┘
```

**Upload Progress**:

```
┌─────────────────────────┐
│ 📷 [────────    ] 65%   │
│ cosplay-ref.jpg         │
│ Uploading...            │
└─────────────────────────┘
```

**Multiple Image Upload**:

```
Uploads 3 images at once:
┌──────┐ ┌──────┐ ┌──────┐
│ ▓▓▓  │ │ ▓▓▓▓ │ │ ▓▓   │
│ 45%  │ │ 89%  │ │ 12%  │
└──────┘ └──────┘ └──────┘
(arranged in grid near drop position)
```

**Mobile Upload Options**:

```
Click [Add Image] button on mobile:

┌─────────────────────────┐
│ 📷 Take Photo           │
├─────────────────────────┤
│ 🖼️  Choose from Gallery │
├─────────────────────────┤
│ 📋 Paste from Clipboard │
└─────────────────────────┘
```

### Image Processing Pipeline:

```
1. Client-side:
   - Validate: file type (jpg, png, webp, gif), size (<10MB)
   - Generate thumbnail preview (immediate feedback)
   - Compress: quality 85%, max 2000px width
   
2. Upload:
   - Supabase Storage: /moodboards/{idea_id}/{filename}
   - Progress tracking with resumable uploads
   - Generate signed URL
   
3. Post-processing:
   - Generate thumbnails: 200px, 400px, 800px
   - Extract EXIF data (optional)
   - Store metadata in node
   
4. Create Node:
   - ImageNode with full-size and thumbnail URLs
   - Position at drop location or viewport center
```

### References Needed:

- [ ] Figma: Drag & drop images onto canvas
- [ ] Notion: Image upload (drag, click, paste)
- [ ] Miro: Multi-image upload with progress
- [ ] Dropbox: Drag & drop upload with clear drop zones
- [ ] Instagram: Mobile photo upload flow

### Integration Points:

- **Storage**: Supabase Storage for image hosting
- **Node Creation**: Uses same ImageNode component
- **Progress**: Shared progress indicator component
- **Error Handling**: Toast for failed uploads, file too large, etc.
- **Optimization**: Lazy load images in canvas, thumbnail while zoomed out

### Implementation Notes:

- Max file size: 10MB (configurable)
- Supported formats: JPG, PNG, WebP, GIF (animated GIFs supported)
- Compression: Use `browser-image-compression` library
- Resumable uploads: Supabase handles this automatically
- Duplicate detection: Hash files, warn if same image already exists
- Batch upload: Max 10 images at once
- Mobile camera: Use `capture="camera"` attribute

---

## 4. Canvas Controls

**User Goal**: Navigate and manipulate the infinite canvas (zoom, pan, fit to screen)

**Priority**: 🔥 HIGH - Core canvas functionality

### Design Approaches

#### Approach A: Floating Control Panel (Miro-style)

- **Pattern**: Persistent controls in corner with zoom slider and buttons
- **Interaction**:
  - Bottom-right corner panel
  - Zoom: [−] [slider] [+] [100%]
  - Buttons: [Fit to Screen] [Minimap]
  - Always visible, can hide

**Pros**:

- Always accessible
- Visual feedback (see zoom level)
- Familiar from Miro, Figma
- Clear affordances

**Cons**:

- Takes screen space
- Can block content
- Redundant with mouse wheel zoom
- More UI clutter

**Tradeoffs**:

- ✅ Discoverability > Minimalism
- ❌ Screen space usage

#### Approach B: Minimal (Gestures + Keyboard)

- **Pattern**: No visible controls, all gesture/keyboard
- **Interaction**:
  - Zoom: Mouse wheel, pinch, Cmd+/Cmd−
  - Pan: Click & drag background, two-finger drag (trackpad)
  - Fit: Double-click background
  - Minimap: Keyboard shortcut (M)

**Pros**:

- Clean, minimal UI
- Fast for power users
- More canvas space
- Professional feel

**Cons**:

- Not discoverable
- Requires learning
- No visual feedback
- Difficult for beginners

**Tradeoffs**:

- ✅ Minimalism > Discoverability
- ❌ Requires documentation

#### Approach C: Contextual Controls (Hybrid)

- **Pattern**: Minimal by default, controls appear on hover or when needed
- **Interaction**:
  - Hover canvas edge → controls fade in
  - Zoom via wheel/pinch (primary)
  - Control panel shows current zoom level
  - Minimap toggleable
  - "?" button for keyboard shortcuts

**Pros**:

- Clean when not needed
- Available when needed
- Visual feedback when active
- Progressive disclosure

**Cons**:

- Hover doesn't work on mobile
- Can be annoying (controls appearing/disappearing)
- Inconsistent visibility

**Tradeoffs**:

- ⚠️ Context-dependent visibility can be frustrating

### Recommendation: **Approach A (Floating Panel) with Gesture Support** ✅

**Rationale**:

1. **Discoverability**: New users can see controls immediately
2. **Power users**: Still get gestures/keyboard shortcuts
3. **Visual feedback**: Always see current zoom level
4. **Mobile**: Touch controls need visible UI (no hover)
5. **Standard pattern**: Figma, Miro, Excalidraw all use this

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [ ] ✅ Approve Approach A (Floating Panel)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [X] ❌ Prefer different approach: c (specify)

**Your notes**:

```
i want an easy way to navigate but also options for people who want visual buttons to push so if the mouse movies or the canvas is dragged it will show controls and then after a short time they hide again. controls should also show the hotkey for natural learning.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Control Panel Layout**:

```
Bottom-right corner:
┌──────────────────────────────┐
│ [−] ═══●═══ [+]  [100%] [⊡] │ 
└──────────────────────────────┘
   │    │    │    │      │    │
   │    │    │    │      │    └─ Fullscreen
   │    │    │    │      └────── Zoom indicator/reset
   │    │    │    └───────────── Zoom in
   │    │    └────────────────── Zoom slider (25-200%)
   │    └─────────────────────── Zoom out
   └──────────────────────────── Can drag to reposition

Additional buttons (optional):
[🗺️] - Toggle minimap
[⊞] - Fit to screen
[⊙] - Center on selection
```

**Minimap** (toggleable):

```
Bottom-left corner:
┌────────────────┐
│ [minimap view] │
│  ┌──┐          │
│  │▓▓│ ← viewport
│  └──┘          │
│   🔸🔸 ← nodes │
└────────────────┘
(draggable viewport indicator)
```

**Zoom Behavior**:

- Mouse wheel: Zoom at cursor position
- Pinch gesture: Zoom at fingers midpoint
- Slider: Zoom at canvas center
- Zoom range: 25% to 200%
- Snap points: 50%, 75%, 100%, 125%, 150%

**Pan Behavior**:

- Click & drag background: Pan canvas
- Spacebar + drag: Pan (even over nodes)
- Two-finger trackpad: Pan
- Mobile: Touch & drag background

### References Needed:

- [ ] Figma: Canvas controls (zoom, pan, view options)
- [ ] Miro: Control panel and minimap
- [ ] Excalidraw: Minimal canvas controls
- [ ] Tldraw: Zoom slider and fit controls
- [ ] Google Maps: Zoom controls (reference for familiar pattern)

### Integration Points:

- **XYFlow**: Uses @xyflow/svelte built-in controls, customized
- **Keyboard Shortcuts**: Shared shortcut system
- **Responsive**: Different layout on mobile (simplified)
- **Accessibility**: Keyboard navigation for all controls

### Implementation Notes:

- Use `<Controls>` component from @xyflow/svelte
- Custom styling to match app design system
- Debounce zoom slider for performance (16ms)
- Persist zoom level per moodboard (localStorage)
- Minimap: Render nodes as simplified shapes (performance)
- Keyboard shortcuts:
  - `+`/`-`: Zoom in/out
  - `0`: Reset to 100%
  - `1`: Fit to screen
  - Space + drag: Pan
  - `M`: Toggle minimap

---

## 9. View Mode Switcher

**User Goal**: Switch between different ways of viewing the same moodboard data (Canvas, Table, Gallery, Timeline, List, Graph)

**Priority**: 🔥 HIGH - Core feature requirement (6 views specified)

### Context

Spec requires **6 view modes** for the same data:

1. **Canvas** - Freeform infinite canvas (default)
2. **Table** - Spreadsheet-style rows/columns
3. **Gallery** - Pinterest-style grid
4. **Timeline** - Chronological by date
5. **List** - Compact list with metadata
6. **Graph** - Pure network visualization (nodes + edges only)

Users need to switch between these views seamlessly.

### Design Approaches

#### Approach A: Tab Bar (Horizontal Tabs)

- **Pattern**: Tabs at top of moodboard area
- **Interaction**:

  ```
  [Canvas] [Table] [Gallery] [Timeline] [List] [Graph]
  ─────────────────────────────────────────────────
  [moodboard content in selected view]
  ```

  - Click tab → switches view
  - Active tab highlighted
  - All tabs always visible

**Pros**:

- Familiar pattern (browser tabs)
- All options visible
- Clear which view is active
- Easy to switch

**Cons**:

- Takes horizontal space (6 tabs!)
- Mobile: tabs may wrap or need scrolling
- Can't add icons + text (too wide)
- Visual clutter

**Tradeoffs**:

- ✅ Discoverability > Space efficiency
- ❌ Doesn't scale well (6 tabs is a lot)

#### Approach B: Dropdown Selector

- **Pattern**: Single button that opens dropdown menu
- **Interaction**:
  ```
  [Canvas ▼]  ← Click to open menu

  Dropdown:
  ┌─────────────┐
  │ ✓ Canvas    │
  │   Table     │
  │   Gallery   │
  │   Timeline  │
  │   List      │
  │   Graph     │
  └─────────────┘
  ```

**Pros**:

- Compact (one button)
- Scales to any number of views
- Mobile-friendly
- Can add icons + descriptions

**Cons**:

- Hides options (less discoverable)
- Extra click to see options
- Current view not immediately obvious
- Slower to switch

**Tradeoffs**:

- ✅ Space efficiency > Discoverability
- ❌ Slower interaction

#### Approach C: Icon Toolbar (Notion-style)

- **Pattern**: Icon buttons in toolbar, one per view
- **Interaction**:

  ```
  [⊞] [☰] [⊡] [⟷] [≡] [◉]
   │   │   │   │   │   └─ Graph
   │   │   │   │   └───── List
   │   │   │   └───────── Timeline
   │   │   └───────────── Gallery
   │   └───────────────── Table
   └───────────────────── Canvas (active)
  ```

  - Icons with tooltips on hover
  - Active view highlighted
  - Compact visual representation

**Pros**:

- Compact yet visible
- Visual icons are memorable
- One-click switching
- Professional look (Notion, Airtable use this)
- Works on mobile (icons are touch-friendly)

**Cons**:

- Icons may not be immediately clear
- Requires learning icon meanings
- Need good icon design
- Tooltips required for clarity

**Tradeoffs**:

- ✅ Balance of space and discoverability
- ⚠️ Requires icon familiarity

#### Approach D: Hybrid (Icons + Dropdown on Mobile)

- **Pattern**: Adaptive based on screen size
- **Interaction**:
  - **Desktop**: Icon toolbar (Approach C)
  - **Mobile**: Dropdown (Approach B)
  - Best of both worlds

**Pros**:

- Optimized for each platform
- Desktop: fast icon switching
- Mobile: space-efficient dropdown
- Responsive design

**Cons**:

- Inconsistent across devices
- More complex to implement
- Need to maintain both UIs

**Tradeoffs**:

- ✅ Platform optimization > Consistency

### Recommendation: **Approach C (Icon Toolbar)** ✅

**Rationale**:

1. **Balance**: Visible but compact
2. **Industry standard**: Notion, Airtable, Linear all use icon toolbars
3. **One-click**: Fast switching for power users
4. **Scalable**: Works on mobile (icons are touch-friendly)
5. **Professional**: Clean, modern aesthetic

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach C (Icon Toolbar)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Icon Toolbar Layout**:

```
Top of moodboard area:

┌────────────────────────────────────────────────┐
│ [⊞] [☰] [⊡] [⟷] [≡] [◉]    [Filter ▼] [Sort ▼]│
│  ▔                                              │
│ Active indicator under Canvas icon             │
└────────────────────────────────────────────────┘

Icon meanings:
⊞ - Canvas (grid/freeform)
☰ - Table (rows)
⊡ - Gallery (image grid)
⟷ - Timeline (horizontal/vertical)
≡ - List (compact)
◉ - Graph (network)
```

**Hover State** (Desktop):

```
Hover over icon:
┌─────────┐
│ Gallery │ ← Tooltip
└────┬────┘
     [⊡]  ← Icon highlights
```

**Mobile Adaptation**:

```
On small screens (<640px):
- Icons remain visible
- Slightly larger touch targets (44x44px)
- Tooltips don't show (no hover)
- Long-press for view name (optional)
```

**View Switching Animation**:

```
Smooth transition between views:
1. Fade out current view (200ms)
2. Switch data structure
3. Fade in new view (200ms)
4. Update URL: /ideas/123/moodboard?view=gallery
```

### References Needed:

- [ ] Notion: Database view switcher (table, board, gallery, etc.)
- [ ] Airtable: View toolbar with icons
- [ ] Linear: Issue view switcher (list, board)
- [ ] Figma: Layer panel view options
- [ ] Obsidian: View mode switcher (edit, preview, source)

### Integration Points:

- **URL State**: View mode in query param (`?view=gallery`)
- **Persistence**: Remember last view per moodboard (localStorage)
- **Keyboard Shortcuts**:
  - `1` - Canvas
  - `2` - Table
  - `3` - Gallery
  - `4` - Timeline
  - `5` - List
  - `6` - Graph
- **View State**: Each view remembers its own state (zoom, filters, sort)

### Implementation Notes:

- Use Svelte stores for view state management
- Lazy load view components (code splitting)
- Shared data structure across all views
- View-specific settings stored separately
- Smooth transitions with Svelte transitions
- Icons from Lucide or Heroicons

---

## 10. Table View

**User Goal**: See all moodboard items in a spreadsheet-style layout for quick editing and bulk operations

**Priority**: 🔥 HIGH - One of 6 required views

### Design Approaches

#### Approach A: Full Spreadsheet (Airtable-style)

- **Pattern**: Rich spreadsheet with inline editing, column types, sorting, filtering
- **Interaction**:
  - Columns: Thumbnail, Name, Type, Tags, Created, URL, Notes
  - Click cell → inline edit
  - Drag column headers to reorder
  - Right-click header → sort, filter, hide
  - Multi-select rows → bulk actions

**Pros**:

- Powerful, familiar to users of Airtable/Excel
- Inline editing is fast
- Rich column types (date, tags, etc.)
- Bulk operations
- Professional feel

**Cons**:

- Complex to implement
- Heavy UI (lots of features)
- May be overkill for moodboard
- Performance with 200+ rows

**Tradeoffs**:

- ✅ Power > Simplicity
- ⚠️ May be too complex for creative tool

#### Approach B: Simple Data Table (Read-mostly)

- **Pattern**: Basic table for viewing, click row to edit in modal
- **Interaction**:
  - Columns: Thumbnail, Name, Type, Tags, Created
  - Click row → opens detail modal
  - Basic sort (click header)
  - No inline editing
  - Export to CSV

**Pros**:

- Simple, clean
- Fast to implement
- Good for scanning/reviewing
- Less overwhelming

**Cons**:

- Not great for editing
- Modal switching is slow
- Less powerful
- Users expect inline editing

**Tradeoffs**:

- ✅ Simplicity > Power
- ❌ Not ideal for bulk editing

#### Approach C: Hybrid Table (Inline + Modal)

- **Pattern**: Inline edit for simple fields, modal for complex
- **Interaction**:
  - Inline edit: Name, Tags (click to edit)
  - Modal edit: Notes, URL, Image (click thumbnail)
  - Sort and filter in header
  - Multi-select for bulk tag/delete

**Pros**:

- Balance of power and simplicity
- Fast for common edits
- Modal for complex edits
- Progressive disclosure

**Cons**:

- Inconsistent (when inline vs modal?)
- Need to learn both patterns
- More complex than B, less powerful than A

**Tradeoffs**:

- ✅ Balance > Extremes

### Recommendation: **Approach C (Hybrid Table)** ✅

**Rationale**:

1. **Common case is fast**: Edit name/tags inline (80% of edits)
2. **Complex edits in modal**: Full editing power when needed
3. **Not overwhelming**: Simpler than full spreadsheet
4. **Familiar pattern**: Gmail, Notion use this approach

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [ ] ✅ Approve Approach C (Hybrid Table)
- [X] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
instead of modal we can use the drawer popover we use for the quick detail views.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Table Layout**:

```
┌──────┬─────────────────┬────────┬──────────────┬────────────┐
│ [✓]  │ Thumbnail       │ Name   │ Tags         │ Created    │
├──────┼─────────────────┼────────┼──────────────┼────────────┤
│ [ ]  │ [image preview] │ Wig    │ hair, red    │ 2 days ago │
│      │ (click=modal)   │ ^edit  │ ^edit        │            │
├──────┼─────────────────┼────────┼──────────────┼────────────┤
│ [ ]  │ [link preview]  │ Pose   │ reference    │ 3 days ago │
├──────┼─────────────────┼────────┼──────────────┼────────────┤
│ [ ]  │ [image preview] │ Fabric │ material     │ 1 week ago │
└──────┴─────────────────┴────────┴──────────────┴────────────┘
  │           │             │          │              │
  └─ Select   └─ Click to   └─ Click   └─ Click to   └─ Sort by
     checkbox    open modal     to edit    edit tags     date
```

**Inline Editing** (Name field):

```
Click name:
┌─────────────────────┐
│ Wig reference___    │ ← Input appears
└─────────────────────┘
(blur or Enter to save)
```

**Tag Editing** (Inline):

```
Click tags:
┌──────────────────────────┐
│ [hair] [red] [+]         │
│  ^remove  ^remove  ^add  │
└──────────────────────────┘
(tag picker dropdown)
```

**Modal Edit** (Click thumbnail):

```
┌────────────────────────────────────┐
│ ✕ Edit Image Node                  │
├────────────────────────────────────┤
│ [Large image preview]              │
│                                     │
│ Name: [Wig reference________]      │
│ Tags: [hair] [red] [+]             │
│ Notes: [Wavy style, shoulder...]   │
│ URL:  [https://...]                │
│                                     │
│ Created: Jan 5, 2026               │
│ Modified: Jan 8, 2026              │
│                                     │
│         [Delete]  [Save Changes]   │
└────────────────────────────────────┘
```

**Bulk Actions** (Select multiple):

```
3 items selected:
┌──────────────────────────────────────┐
│ [Add Tags] [Remove Tags] [Delete]    │
└──────────────────────────────────────┘
```

### Column Configuration:

```
Default columns:
1. Checkbox (select)
2. Thumbnail (40x40px preview)
3. Name (editable)
4. Type (Image/Link/Note/Budget)
5. Tags (editable)
6. Created (sortable)

Optional columns (hide/show):
- Modified date
- URL (for links)
- Cost (for budget items)
- Connections (# of edges)
```

### References Needed:

- [ ] Airtable: Grid view with inline editing
- [ ] Notion: Table database with cell editing
- [ ] Linear: Issue table with inline editing
- [ ] Gmail: Email list with select and bulk actions
- [ ] Google Sheets: Spreadsheet interaction patterns

### Integration Points:

- **Table Library**: Use `@tanstack/svelte-table` (already in spec)
- **Shared Data**: Same store as Canvas view
- **Filtering**: Shared filter state across views
- **Sorting**: Persisted per-moodboard
- **Export**: CSV export button in toolbar

### Implementation Notes:

- Virtual scrolling for 200+ rows (performance)
- Debounce inline edits (500ms after typing stops)
- Optimistic updates (instant UI, sync to DB)
- Keyboard navigation (arrow keys, Tab, Enter)
- Column resize (drag header border)
- Column reorder (drag header)
- Row height: 60px (comfortable for thumbnails)

---

## 11. Gallery View

**User Goal**: Browse moodboard items in a Pinterest-style masonry grid focused on visuals

**Priority**: 🔥 HIGH - One of 6 required views, mobile-friendly

### Design Approaches

#### Approach A: Fixed Grid (Instagram-style)

- **Pattern**: Uniform square grid, all items same size
- **Interaction**:
  - 3-4 columns (responsive)
  - Square aspect ratio (1:1)
  - Images cropped to fit
  - Click to open detail

**Pros**:

- Clean, organized look
- Easy to implement
- Predictable layout
- Fast scrolling

**Cons**:

- Crops images (loses context)
- Wasted space for text/links
- Less visually interesting
- Not ideal for varied content

**Tradeoffs**:

- ✅ Simplicity > Visual fidelity
- ❌ Crops content

#### Approach B: Masonry Grid (Pinterest-style)

- **Pattern**: Variable height columns, items maintain aspect ratio
- **Interaction**:
  - 2-4 columns (responsive)
  - Items maintain original aspect ratio
  - Staggered heights (masonry)
  - Infinite scroll

**Pros**:

- Visually appealing
- No cropping (full images)
- Industry standard (Pinterest, Unsplash)
- Works for varied content types

**Cons**:

- Complex layout calculation
- Slower rendering
- Can look chaotic
- Harder to scan uniformly

**Tradeoffs**:

- ✅ Visual appeal > Uniformity
- ⚠️ Performance considerations

#### Approach C: Justified Grid (Google Photos-style)

- **Pattern**: Rows of variable-width items, all rows same height
- **Interaction**:
  - Items scale to fill row width
  - Row height consistent (e.g., 200px)
  - No gaps between items
  - Smooth, continuous layout

**Pros**:

- No cropping
- No gaps (efficient use of space)
- Visually clean
- Good for photos

**Cons**:

- Complex algorithm
- Can distort aspect ratios slightly
- Not great for mixed content types
- Harder to implement

**Tradeoffs**:

- ✅ Space efficiency > Simplicity

### Recommendation: **Approach B (Masonry Grid)** ✅

**Rationale**:

1. **Industry standard**: Pinterest, Unsplash, Dribbble all use masonry
2. **No cropping**: Shows full images (important for inspiration)
3. **Visually appealing**: Staggered layout is engaging
4. **Works for mixed content**: Images, links, notes all work
5. **Mobile-friendly**: Responsive columns (1-2 on mobile, 3-4 on desktop)

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach B (Masonry Grid)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Masonry Layout**:

```
Desktop (4 columns):
┌──────┬──────┬──────┬──────┐
│ img1 │ img2 │ img3 │ img4 │
│      │      ├──────┤      │
│      │      │ img7 │      │
├──────┤      │      ├──────┤
│ img5 │      │      │ img8 │
│      ├──────┤      │      │
│      │ img6 │      │      │
└──────┴──────┴──────┴──────┘

Mobile (2 columns):
┌──────┬──────┐
│ img1 │ img2 │
│      ├──────┤
│      │ img3 │
├──────┤      │
│ img4 │      │
│      ├──────┤
│      │ img5 │
└──────┴──────┘
```

**Card Design**:

```
Image Card:
┌─────────────────┐
│                 │
│  [image fills]  │
│                 │
├─────────────────┤
│ Title           │
│ [tag] [tag]     │
└─────────────────┘

Link Card:
┌─────────────────┐
│ [link preview]  │
│  thumbnail      │
├─────────────────┤
│ 🔗 Title        │
│ instagram.com   │
│ [tag] [tag]     │
└─────────────────┘

Note Card:
┌─────────────────┐
│ 📝 Note Title   │
│                 │
│ Text content... │
│ (truncated)     │
│                 │
│ [tag] [tag]     │
└─────────────────┘
```

**Hover State**:

```
┌─────────────────┐
│  [image]        │
│  ┌───────────┐  │ ← Overlay appears
│  │ [👁] [✏]  │  │
│  │ View Edit │  │
│  └───────────┘  │
└─────────────────┘
```

**Responsive Breakpoints**:

```
< 640px:  1 column (mobile portrait)
640-768:  2 columns (mobile landscape, tablet portrait)
768-1024: 3 columns (tablet landscape)
> 1024px: 4 columns (desktop)
```

### Masonry Algorithm:

```javascript
// Simplified masonry logic:
1. Initialize column heights array [0, 0, 0, 0]
2. For each item:
   - Find shortest column
   - Place item in that column
   - Update column height
3. Result: Balanced column heights
```

### References Needed:

- [ ] Pinterest: Masonry grid with varied content
- [ ] Unsplash: Photo grid with hover actions
- [ ] Dribbble: Design grid with cards
- [ ] Behance: Project grid with previews
- [ ] Google Photos: Justified grid (alternative reference)

### Integration Points:

- **Masonry Library**: Use `svelte-masonry` or custom implementation
- **Infinite Scroll**: Load more items as user scrolls
- **Lazy Loading**: Load images as they enter viewport
- **Filtering**: Filter items without re-layout
- **Sorting**: Re-layout on sort (created, modified, name)

### Implementation Notes:

- Use CSS Grid with `grid-auto-flow: dense` (modern approach)
- Or: Use `masonry-layout` library (more control)
- Image loading: Show skeleton/placeholder while loading
- Thumbnail sizes: 400px width (balance quality/performance)
- Gap between items: 16px
- Infinite scroll: Load 20 items at a time
- Virtualization: Only render visible items (performance)
- Keyboard navigation: Arrow keys to navigate cards

---

**Status**: Completed 11 components ✅

- #1-7: Core components
- #8: Budget Item Creation (deferred - similar to node creation)
- #9-11: View modes (Switcher, Table, Gallery)

**Next**: Timeline View, List View, Graph View, then multi-option management and wizard flow

---

## 12. Timeline View

**User Goal**: See moodboard items chronologically to track project evolution over time

**Priority**: 🟡 MEDIUM - One of 6 required views, useful for planning phases

### Context

Users want to see:

- When ideas were added
- Evolution of the project (early ideas vs recent)
- Project phases (research → planning → execution)
- Deadline-based milestones

### Design Approaches

#### Approach A: Horizontal Timeline (Linear style)

- **Pattern**: Horizontal scrolling timeline with items grouped by date
- **Interaction**:
  ```
  ┌────────────────────────────────────────────────────┐
  │ Jan 2026        Feb 2026        Mar 2026           │
  │    ↓               ↓               ↓               │
  │  ┌─────┐        ┌─────┐        ┌─────┐            │
  │  │ img │        │ img │        │ img │            │
  │  └─────┘        └─────┘        └─────┘            │
  │  ┌─────┐        ┌─────┐                           │
  │  │ note│        │ link│                           │
  │  └─────┘        └─────┘                           │
  │────●────────────●────────────●──────────────→     │
  └────────────────────────────────────────────────────┘
  ```

  - Scroll horizontally to navigate time
  - Items stacked vertically within date group
  - Timeline axis at bottom

**Pros**:

- Chronological flow feels natural (left to right)
- Good for seeing overall project arc
- Familiar pattern (GitHub, Linear timelines)
- Can show milestones/deadlines on axis

**Cons**:

- Horizontal scrolling awkward on desktop (mouse wheel is vertical)
- Mobile: horizontal scroll can conflict with swipe gestures
- Limited vertical space for items
- Harder to see many items at once

**Tradeoffs**:

- ✅ Chronological clarity > Content density
- ❌ Horizontal scroll UX

#### Approach B: Vertical Timeline (Facebook/Twitter style)

- **Pattern**: Vertical feed with date markers
- **Interaction**:
  ```
  ┌──────────────────────────────────┐
  │ March 15, 2026                   │
  │ ┌────────────────────────────┐   │
  │ │ Image: Wig inspiration     │   │
  │ └────────────────────────────┘   │
  │                                  │
  │ ┌────────────────────────────┐   │
  │ │ Note: Budget estimate      │   │
  │ └────────────────────────────┘   │
  │                                  │
  │ March 10, 2026                   │
  │ ┌────────────────────────────┐   │
  │ │ Link: Fabric tutorial      │   │
  │ └────────────────────────────┘   │
  │                                  │
  │ ↓ Scroll down for older          │
  └──────────────────────────────────┘
  ```

  - Natural vertical scrolling
  - Date headers separate groups
  - Reverse chronological (newest first)
  - Infinite scroll

**Pros**:

- Natural vertical scrolling (mouse wheel, mobile)
- High content density
- Familiar social feed pattern
- Easy to scan recent items
- Mobile-friendly

**Cons**:

- Less visual "timeline" feel
- Harder to see big picture / project phases
- No clear milestone visualization
- Just a feed (not distinctly timeline-like)

**Tradeoffs**:

- ✅ Usability > Visual metaphor
- ✅ Mobile-friendly > Desktop timeline aesthetic

#### Approach C: Gantt/Phase Timeline

- **Pattern**: Project phases as horizontal bands, items within phases
- **Interaction**:
  ```
  ┌─────────────────────────────────────────────────┐
  │ Research Phase ─────────────────────┐           │
  │ ┌─────┐ ┌─────┐ ┌─────┐            │           │
  │ │ img │ │ link│ │ note│            │           │
  │ └─────┘ └─────┘ └─────┘            │           │
  │                                     │           │
  │ Planning Phase ──────────────┐     │           │
  │ ┌─────┐ ┌─────┐              │     │           │
  │ │ img │ │budget              │     │           │
  │ └─────┘ └─────┘              │     │           │
  │                               │     │           │
  │ Execution Phase ──────────────┼─────┘           │
  │ ┌─────┐                       │                 │
  │ │(wip)│                       │                 │
  │ └─────┘                       │                 │
  └─────────────────────────────────────────────────┘
  ```

  - User creates phases manually
  - Drag items between phases
  - Horizontal timeline with phase overlaps

**Pros**:

- Clear project structure
- Great for planning
- Shows phase transitions
- Can set phase dates/deadlines

**Cons**:

- Requires upfront phase setup
- Complex UI
- Overkill for simple inspiration boards
- Not automatic (requires manual organization)

**Tradeoffs**:

- ✅ Structure > Automatic
- ⚠️ Complex for simple use cases

### Recommendation: **Approach B (Vertical Timeline)** ✅

**Rationale**:

1. **Natural scrolling**: Vertical is better UX on all devices
2. **Zero setup**: Automatic based on created_at timestamp
3. **Familiar**: Social feed pattern everyone knows
4. **Mobile-first**: Works perfectly on mobile
5. **Simple**: Just shows items in order, no complex configuration

**Enhancement for future**: Add phase markers (user can label date ranges like "Research", "Planning")

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach B (Vertical Timeline)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Timeline Feed Layout**:

```
┌────────────────────────────────────────┐
│ Timeline View              [⚙ Options] │
├────────────────────────────────────────┤
│                                        │
│ ┌ Today ─────────────────────────────┐ │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ 🖼️ Image Node                    │  │
│ │ Added 2 hours ago                │  │
│ │ [Thumbnail]                      │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌ Yesterday ─────────────────────────┐ │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ 🔗 Link Node                     │  │
│ │ Added 1 day ago                  │  │
│ │ Instagram post about wig styling │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ 📝 Text Note                     │  │
│ │ Added 1 day ago                  │  │
│ │ "Budget estimate: $150-200"      │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌ March 14, 2026 ───────────────────┐ │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ 🎨 Character Link                │  │
│ │ Added Mar 14                     │  │
│ │ Character: Asuka Langley         │  │
│ └──────────────────────────────────┘  │
│                                        │
│ [Load earlier items]                   │
└────────────────────────────────────────┘
```

**Date Grouping**:

- **Today**: Items from today
- **Yesterday**: Items from yesterday
- **This Week**: Group by day (Mon, Tue, Wed...)
- **Older**: Group by date (March 14, 2026)
- **Option**: Toggle between "Newest First" / "Oldest First"

**Timeline Card**:

```
┌────────────────────────────────────────┐
│ [Icon] Node Type                       │
│ Added [relative time]                  │
│                                        │
│ [Preview content based on node type]   │
│                                        │
│ [Tags: fabric, wig, red]               │
│                                        │
│ [Click to open detail view]            │
└────────────────────────────────────────┘
```

**Options Menu** (⚙):

- Sort: Newest First / Oldest First
- Filter: All items / Images only / Links only / Notes only
- Group by: Day / Week / Month
- Show: Created date / Modified date

### References Needed:

- [ ] Linear: Timeline view with date grouping
- [ ] GitHub: Activity feed with date headers
- [ ] Twitter/X: Timeline feed structure
- [ ] Notion: Database timeline view
- [ ] Google Drive: Activity panel with timestamps

### Integration Points:

- **Same data**: Just different sort/display of moodboard nodes
- **Filters**: Share filter state with other views
- **Detail view**: Click item → drawer with full details
- **Infinite scroll**: Load 50 items at a time

### Implementation Notes:

- Group items by date in component logic
- Use relative time for recent items ("2 hours ago", "yesterday")
- Absolute dates for older items ("March 14, 2026")
- Virtual scrolling for performance (100+ items)
- Pull to refresh on mobile
- Use `date-fns` for date formatting and grouping

---

## 13. List View

**User Goal**: See all moodboard items in a compact, scannable list format

**Priority**: 🟡 MEDIUM - One of 6 required views, good for quick overviews

### Context

Users need a simple, text-focused view for:

- Quick scanning of all items
- Finding specific items by name
- Bulk operations (delete, tag, export)
- Mobile-friendly (less visual than gallery)

### Design Approaches

#### Approach A: Dense List (Email inbox style)

- **Pattern**: Compact rows with minimal spacing
- **Interaction**:
  ```
  ┌────────────────────────────────────────────┐
  │ [✓] 🖼️  Wig reference - red bob          │ │ Tags: wig, red  •  Added 2h ago          │
  ├────────────────────────────────────────────┤
  │ [✓] 🔗  TikTok tutorial - styling         │
  │ Tags: tutorial  •  Added 1d ago            │
  ├────────────────────────────────────────────┤
  │ [✓] 📝  Budget note - $150-200            │
  │ Tags: budget  •  Added 3d ago              │
  └────────────────────────────────────────────┘
  ```

  - Small thumbnails or icons
  - 2-line display (title + metadata)
  - Checkboxes for bulk actions
  - Tight spacing (40-50px rows)

**Pros**:

- High density (see many items at once)
- Fast scanning
- Familiar email/task list pattern
- Good for bulk operations

**Cons**:

- Less visual appeal
- Hard to see image details
- Cramped on mobile
- Can feel overwhelming with many items

**Tradeoffs**:

- ✅ Density > Visual appeal
- ❌ Limited preview space

#### Approach B: Card List (Notion-style)

- **Pattern**: Cards with more whitespace and preview images
- **Interaction**:
  ```
  ┌────────────────────────────────────────────┐
  │ ┌────┐  Wig reference - red bob            │
  │ │img │  Tags: wig, red                      │
  │ └────┘  Added 2 hours ago                   │
  │         Instagram • @cosplayer_name         │
  └────────────────────────────────────────────┘

  ┌────────────────────────────────────────────┐
  │ ┌────┐  TikTok tutorial - styling          │
  │ │img │  Tags: tutorial                      │
  │ └────┘  Added 1 day ago                     │
  │         TikTok • @tutorial_account          │
  └────────────────────────────────────────────┘
  ```

  - Medium thumbnails (80x80px)
  - Multi-line display with rich metadata
  - Generous spacing (80-100px rows)
  - Visual separation between items

**Pros**:

- Balanced density and visual appeal
- Easy to scan
- Shows more context
- Works well on mobile

**Cons**:

- Lower density (fewer items visible)
- More scrolling required
- Takes more space

**Tradeoffs**:

- ✅ Balance > Extremes
- ✅ Mobile-friendly

#### Approach C: Hierarchical List (Tree view)

- **Pattern**: Nested list with groups/categories
- **Interaction**:
  ```
  ▼ Fabric (3 items)
    ├─ 🖼️ Red satin reference
    ├─ 🔗 Fabric store link
    └─ 📝 Pricing notes

  ▼ Wig (2 items)
    ├─ 🖼️ Style reference
    └─ 🔗 Tutorial video

  ▶ Accessories (5 items)
  ```

  - Group by tags or categories
  - Expand/collapse sections
  - Nested hierarchy

**Pros**:

- Organized by category
- Easy to find items by type
- Can hide sections you don't need
- Good for large boards

**Cons**:

- Requires good tagging discipline
- More complex UI
- Expand/collapse interactions
- What if item has multiple tags?

**Tradeoffs**:

- ✅ Organization > Simplicity
- ⚠️ Requires good tagging

### Recommendation: **Approach B (Card List)** ✅

**Rationale**:

1. **Balanced**: Not too dense, not too spacious
2. **Mobile-friendly**: Works well on small screens
3. **Visual enough**: Thumbnails help recognition
4. **Familiar**: Notion, Airtable, Linear all use this pattern
5. **Flexible**: Easy to add metadata without cramping

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [ ] ✅ Approve Approach B (Card List)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [X] ❌ Prefer different approach: b & c (specify)

**Your notes**:

```
it would be nice to have nested cards for more details or a compact and mobile option so you can view it like c or like b.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**List View Layout**:

```
┌──────────────────────────────────────────────┐
│ List View           [Sort ▼] [Filter ▼]     │
├──────────────────────────────────────────────┤
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ [img]  Red wig inspiration               │ │
│ │        Tags: wig, red, asuka             │ │
│ │        Instagram • @cosplayer            │ │
│ │        Added 2 hours ago                 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ [img]  Fabric shopping guide             │ │
│ │        Tags: fabric, tutorial            │ │
│ │        TikTok • @sewing_tips             │ │
│ │        Added 1 day ago                   │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ [📝]   Budget estimate                   │ │
│ │        Tags: budget, planning            │ │
│ │        Note • "Need $150-200 for fabric" │ │
│ │        Added 3 days ago                  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [Load more items]                            │
└──────────────────────────────────────────────┘
```

**Card Structure**:

```
┌────────────────────────────────────────┐
│ [Thumbnail]  Title (truncated)         │
│              Tags: tag1, tag2, tag3    │
│              Platform • @author        │
│              Created/Modified time     │
│                              [⋮ More]  │
└────────────────────────────────────────┘
```

**Interaction States**:

- **Hover**: Subtle background highlight
- **Selected**: Checkbox appears (bulk actions)
- **Click**: Opens detail drawer

**Sorting Options**:

- Date Added (newest first)
- Date Modified (recently updated)
- Name (A-Z)
- Type (images, links, notes)

**Filtering**:

- By tag
- By type (image, link, note, budget)
- By date range
- By platform (Instagram, TikTok, etc.)

### References Needed:

- [ ] Notion: List database view
- [ ] Airtable: List view with cards
- [ ] Linear: Issue list view
- [ ] Todoist: Task list with metadata
- [ ] Google Keep: Note list view

### Integration Points:

- **Same data**: Filtered/sorted moodboard nodes
- **Bulk actions**: Select multiple → tag, delete, export
- **Quick filters**: Saved filter presets
- **Search**: Filter list in real-time

### Implementation Notes:

- Virtual scrolling for 100+ items
- Thumbnail size: 80x80px
- Row height: ~100px (comfortable touch target)
- Lazy load thumbnails
- Pull to refresh on mobile
- Infinite scroll: Load 30 items at a time

---

## 14. Graph View

**User Goal**: Visualize relationships and connections between moodboard items

**Priority**: 🟡 MEDIUM - One of 6 required views, useful for complex boards

### Context

Graph view shows the network of connections between items:

- Which items are related (via edges drawn on canvas)
- Clusters of related inspiration
- Disconnected items (no connections)
- Visual thinking about relationships

This is the "Obsidian-style" view mentioned in the spec.

### Design Approaches

#### Approach A: Force-Directed Graph (D3.js style)

- **Pattern**: Physics-based layout where nodes push/pull each other
- **Interaction**:
  ```
        [img]────[img]
          │        │
          └───[note]───[link]
                │
              [budget]
  ```

  - Nodes automatically arrange themselves
  - Connected nodes pulled together
  - Disconnected nodes pushed apart
  - Drag nodes to rearrange
  - Zoom and pan
  - Animated layout

**Pros**:

- Beautiful, organic layout
- Automatically finds clusters
- Reveals hidden patterns
- Interactive and engaging
- Industry standard (Obsidian, Roam)

**Cons**:

- Can be chaotic with many nodes
- Layout changes on every view (not stable)
- Performance issues with 100+ nodes
- Confusing for new users
- Mobile: hard to interact (small nodes)

**Tradeoffs**:

- ✅ Visual beauty > Layout stability
- ⚠️ Performance concerns at scale

#### Approach B: Static Hierarchical Layout

- **Pattern**: Tree-like structure with fixed positions
- **Interaction**:
  ```
  Root Idea
  ├─ Fabric
  │  ├─ img (red satin)
  │  └─ img (pattern)
  ├─ Wig
  │  ├─ img (style ref)
  │  └─ link (tutorial)
  └─ Budget
     └─ note ($150-200)
  ```

  - Top-down or left-right hierarchy
  - Manual or tag-based grouping
  - Fixed, predictable layout
  - Expand/collapse sections

**Pros**:

- Stable, predictable layout
- Easy to understand
- Good performance
- Works well on mobile
- Clear hierarchy

**Cons**:

- Requires hierarchy (moodboards are more flat)
- Less flexible
- Doesn't show complex relationships
- Not "graph-like"

**Tradeoffs**:

- ✅ Clarity > Flexibility
- ❌ Doesn't fit moodboard structure

#### Approach C: Hybrid (Force-Directed with Constraints)

- **Pattern**: Force-directed with layout stabilization
- **Interaction**:
  - Force-directed layout (like Approach A)
  - **But**: Stabilizes after initial animation
  - **But**: Remember positions between sessions
  - **But**: Limit node movement (damped physics)
  - User can manually adjust and pin nodes
  - Groups stay together

**Pros**:

- Beautiful automatic layout
- Stabilizes (not always moving)
- User can override positions
- Best of both worlds
- Practical for real use

**Cons**:

- More complex implementation
- Still performance concerns
- Requires fine-tuning physics

**Tradeoffs**:

- ✅ Balance > Purity
- ⚠️ Complexity

### Recommendation: **Approach C (Hybrid Force-Directed)** ✅

**Rationale**:

1. **Visual appeal**: Force-directed layouts look great
2. **Practical**: Stabilization makes it usable
3. **User control**: Can pin nodes and adjust
4. **Standard pattern**: Obsidian, Roam, Logseq all use this
5. **Start simple**: MVP can be basic force-directed, add refinements later

**Implementation note**: Use existing library (d3-force, cytoscape.js, or vis.js) - don't build from scratch

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach C (Hybrid Force-Directed)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Graph View Layout**:

```
┌────────────────────────────────────────────┐
│ Graph View                    [⚙ Options]  │
├────────────────────────────────────────────┤
│                                            │
│       ○ ─────── ○                          │
│       │         │                          │
│       │    ○    │                          │
│       │    │    │                          │
│       ○ ───┴─── ○                          │
│                                            │
│            ○                               │
│            │                               │
│       ○ ───○─── ○                          │
│                                            │
│  [Isolated nodes shown at bottom]          │
│       ○    ○    ○                          │
│                                            │
└────────────────────────────────────────────┘
```

**Node Representation**:

```
Different node types have different visual styles:
○  Image node (circle with thumbnail)
□  Note node (square)
◇  Link node (diamond)
⬡  Budget node (hexagon)
```

**Interaction**:

- **Click node**: Select (highlight connections)
- **Double-click node**: Open detail drawer
- **Drag node**: Move and pin position
- **Right-click node**: Context menu (pin, unpin, go to canvas)
- **Hover edge**: Show label if any

**Graph Controls**:

```
[🔍+ ] [🔍- ] [⊡ Fit] [⟲ Re-layout] [⚙ Settings]
```

**Settings Panel**:

- Physics strength: Adjust force simulation
- Node spacing: Control density
- Show labels: Toggle node labels
- Show isolated: Hide/show disconnected nodes
- Color by: Type, Tag, Date added

### References Needed:

- [ ] Obsidian: Graph view with force-directed layout
- [ ] Roam Research: Graph overview
- [ ] Logseq: Graph visualization
- [ ] Neo4j Bloom: Graph database visualization
- [ ] Gephi: Network visualization (reference for controls)

### Integration Points:

- **Canvas data**: Uses same edges from canvas view
- **Node selection**: Click node → opens in drawer or jumps to canvas view
- **Edge creation**: Cannot create edges in graph view (go to canvas)
- **Filtering**: Filter by tags, types (same as other views)

### Implementation Notes:

- Use `d3-force` or `cytoscape.js` for graph layout
- Limit to 200 nodes max (performance)
- If > 200 nodes, show warning and paginate
- WebGL rendering for large graphs (use `pixi.js` + `d3-force`)
- Mobile: Simplified view (no physics, static layout)
- Save node positions in localStorage (stability between sessions)

---

## 15. Option Tabs/Switcher

**User Goal**: Manage multiple costume variations within a single Idea

**Priority**: 🔥 HIGH - User Story #3 (Multi-Option Management)

### Context

From spec: "As a cosplayer, I want to compare multiple costume design options within a single Idea so I can evaluate different approaches before committing."

Users need to:

- Create multiple options (Option A, Option B, Option C)
- Each option has its own subset of moodboard items
- Switch between options to compare
- See shared items across all options

Example: "Asuka Cosplay" idea with 3 options:

- Option 1: EVA Plugsuit
- Option 2: School Uniform
- Option 3: Casual Outfit

### Design Approaches

#### Approach A: Tabs (Browser-style)

- **Pattern**: Horizontal tabs at top of moodboard
- **Interaction**:
  ```
  ┌─────────────────────────────────────────┐
  │ [Option 1: EVA Plugsuit] [Option 2: School] [+ New] │
  ├─────────────────────────────────────────┤
  │                                         │
  │   [Moodboard for Option 1]              │
  │                                         │
  └─────────────────────────────────────────┘
  ```

  - Click tab to switch
  - Active tab highlighted
  - "+ New" to create option
  - Drag tabs to reorder

**Pros**:

- Familiar pattern (browsers, Figma pages)
- Always visible
- Fast switching (one click)
- Clear which option is active

**Cons**:

- Takes horizontal space
- With many options (5+), tabs wrap or scroll
- Mobile: tabs may be cramped

**Tradeoffs**:

- ✅ Visibility > Space efficiency
- ⚠️ Doesn't scale well (5+ options)

#### Approach B: Dropdown Selector

- **Pattern**: Single dropdown shows current option
- **Interaction**:
  ```
  ┌─────────────────────────────────────────┐
  │ Option: [EVA Plugsuit ▼]         [+ New]│
  ├─────────────────────────────────────────┤
  │                                         │
  │   [Moodboard for selected option]       │
  │                                         │
  └─────────────────────────────────────────┘

  Click dropdown:
  ┌──────────────────────┐
  │ EVA Plugsuit    ✓    │
  │ School Uniform       │
  │ Casual Outfit        │
  │ ─────────────────    │
  │ + New Option         │
  └──────────────────────┘
  ```

  - Compact (one button)
  - Dropdown shows all options
  - Checkmark shows active

**Pros**:

- Space-efficient
- Scales to many options
- Mobile-friendly
- Clean UI

**Cons**:

- Hidden (less discoverable)
- Slower (2 clicks to switch)
- Can't see all options at once

**Tradeoffs**:

- ✅ Space efficiency > Visibility
- ❌ Slower switching

#### Approach C: Sidebar Panel

- **Pattern**: Collapsible sidebar with option list
- **Interaction**:
  ```
  ┌────┬────────────────────────────────┐
  │ ☰  │                                │
  │ 📋 │                                │
  │    │   [Moodboard]                  │
  │ 1  │                                │
  │ 2  │                                │
  │ 3  │                                │
  │    │                                │
  │ +  │                                │
  └────┴────────────────────────────────┘

  Expand sidebar:
  ┌──────────────┬───────────────────────┐
  │ Options      │                       │
  │ ☰ Collapse   │                       │
  │              │                       │
  │ ✓ 1. EVA     │   [Moodboard]         │
  │   2. School  │                       │
  │   3. Casual  │                       │
  │              │                       │
  │ + New Option │                       │
  └──────────────┴───────────────────────┘
  ```

  - Collapsible sidebar (default collapsed on mobile)
  - Icons when collapsed, full names when expanded
  - Always visible (when expanded)
  - Drag to reorder

**Pros**:

- Doesn't take horizontal space
- Can show option previews (thumbnails)
- Scales well
- Works on desktop and tablet
- Can add metadata (item count, last edited)

**Cons**:

- Takes vertical space
- Mobile: sidebar is awkward
- Collapse/expand interaction
- More complex than tabs

**Tradeoffs**:

- ✅ Scalability > Simplicity
- ⚠️ Mobile experience

### Recommendation: **Approach A (Tabs) for ≤4 options, Approach B (Dropdown) for 5+ options** ✅

**Rationale**:

1. **Common case**: Most ideas have 2-3 options
2. **Tabs are fastest**: One-click switching for ≤4 options
3. **Graceful degradation**: Auto-switch to dropdown when 5+ options
4. **Mobile**: Use dropdown by default on small screens
5. **Best UX for each scenario**: Don't force one pattern

**Hybrid Implementation**:

- **Desktop (≤4 options)**: Show tabs
- **Desktop (5+ options)**: Auto-convert to dropdown
- **Mobile**: Always use dropdown (space-constrained)
- **Setting**: User can override (force dropdown or tabs)

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [ ] ✅ Approve Hybrid (Tabs/Dropdown)
- [X] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
when i think of groups i think you could jist have a base character node that links to other nodes so variations would be linked to all resources with slight differences where different characters are more like silos where they have their own set of resources. so maybe groups are a way to view sub canvases seperate from the main network but i also think having different tabs for each variation or character is good since we can organize better that way.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Tab Interface** (≤4 options, desktop):

```
┌────────────────────────────────────────────────┐
│ [1: EVA Plugsuit*] [2: School] [3: Casual] [+] │
├────────────────────────────────────────────────┤
│                                                │
│   Canvas/Table/Gallery/etc for Option 1        │
│                                                │
└────────────────────────────────────────────────┘

* = Active tab
Right-click tab: Rename, Duplicate, Delete, Move
```

**Dropdown Interface** (5+ options or mobile):

```
┌────────────────────────────────────────────────┐
│ Option: [1: EVA Plugsuit ▼]            [+ New] │
├────────────────────────────────────────────────┤
│                                                │
│   Canvas/Table/Gallery/etc for Option 1        │
│                                                │
└────────────────────────────────────────────────┘
```

**Option Management**:

- **Create**: Click "+ New" → "Option [N]" created
- **Rename**: Click option name → inline edit
- **Delete**: Right-click → Delete (confirm if has items)
- **Duplicate**: Right-click → Duplicate (copies all items)
- **Reorder**: Drag tabs to reorder

**Shared Items**:

- Items can be tagged as "All Options" (appear in every option)
- Checkbox when creating item: "Show in all options"
- Example: Character reference might be shared across all costume variations

**Data Model**:

```
moodboard_nodes table:
- idea_option_id: FK to idea_options (null = shared across all)

idea_options table:
- id
- idea_id
- option_name: "EVA Plugsuit"
- option_order: 1, 2, 3
- created_at
```

### References Needed:

- [ ] Figma: Pages/frames switcher
- [ ] Notion: Database views switcher
- [ ] Chrome: Browser tabs interaction
- [ ] Obsidian: Multiple panes/tabs
- [ ] Linear: Project switcher (dropdown)

### Integration Points:

- **View modes**: Options work with all views (Canvas, Table, Gallery, etc.)
- **Filtering**: Can filter "Show shared items" / "This option only"
- **Conversion**: When converting Idea→Project, user chooses which option
- **Comparison view**: Component #16 shows options side-by-side

### Implementation Notes:

- Store current option in URL: `/ideas/123/moodboard?option=1`
- Remember last viewed option per idea (localStorage)
- Keyboard shortcuts: `Ctrl+1`, `Ctrl+2`, etc. to switch options
- Mobile: Swipe left/right to switch options (gesture navigation)

---

## 16. Option Comparison View

**User Goal**: Compare multiple costume options side-by-side to make a decision

**Priority**: 🔥 HIGH - User Story #3 (Multi-Option Management)

### Context

After creating multiple options, users need to compare them:

- See all options at once (not switching tabs)
- Compare visual references side-by-side
- Compare budgets, complexity, availability
- Make final decision on which option to pursue

This is a special view mode specifically for comparing options.

### Design Approaches

#### Approach A: Side-by-Side Columns

- **Pattern**: Each option in a vertical column
- **Interaction**:
  ```
  ┌─────────────┬─────────────┬─────────────┐
  │ Option 1:   │ Option 2:   │ Option 3:   │
  │ EVA Plugsuit│ School      │ Casual      │
  ├─────────────┼─────────────┼─────────────┤
  │ [img]       │ [img]       │ [img]       │
  │ [img]       │ [link]      │ [link]      │
  │ [note]      │ [img]       │ [img]       │
  │             │             │ [note]      │
  │ Budget:     │ Budget:     │ Budget:     │
  │ $200-250    │ $100-150    │ $80-120     │
  │             │             │             │
  │ Items: 12   │ Items: 8    │ Items: 6    │
  └─────────────┴─────────────┴─────────────┘
  ```

  - Scroll all columns together (synced)
  - Equal column width
  - Mobile: horizontal scroll between columns

**Pros**:

- See all options at once
- Easy to compare visually
- Familiar pattern (product comparison tables)
- Clear structure

**Cons**:

- Limited to 2-3 options on desktop (width constraint)
- Mobile: can only see one column at a time
- Doesn't scale to 5+ options
- Synchronized scrolling can be janky

**Tradeoffs**:

- ✅ Visual comparison > Scalability
- ⚠️ Width-constrained

#### Approach B: Grid Layout (2x2 or 3x2)

- **Pattern**: Options in a grid
- **Interaction**:
  ```
  ┌────────────────┬────────────────┐
  │ Option 1:      │ Option 2:      │
  │ EVA Plugsuit   │ School Uniform │
  │                │                │
  │ [Gallery of    │ [Gallery of    │
  │  items]        │  items]        │
  │                │                │
  │ Budget: $200   │ Budget: $100   │
  ├────────────────┼────────────────┤
  │ Option 3:      │ [Add Option]   │
  │ Casual Outfit  │                │
  │                │                │
  │ [Gallery]      │                │
  │                │                │
  │ Budget: $80    │                │
  └────────────────┴────────────────┘
  ```

  - Each cell is independent scroll
  - Grid adjusts to number of options (1x2, 2x2, 3x2)
  - Mobile: Stacks vertically

**Pros**:

- Scales better (can show 4-6 options)
- Independent scrolling
- Mobile: Natural vertical stack
- Flexible layout

**Cons**:

- Harder to compare (not aligned horizontally)
- Independent scrolling can be disorienting
- Less table-like (harder to compare specific attributes)

**Tradeoffs**:

- ✅ Scalability > Direct comparison
- ⚠️ Alignment issues

#### Approach C: Swiper/Carousel (Mobile-first)

- **Pattern**: One option at a time, swipe to compare
- **Interaction**:
  ```
  ┌──────────────────────────────────┐
  │ Option 1: EVA Plugsuit    [1/3]  │
  ├──────────────────────────────────┤
  │                                  │
  │ [Gallery of items]               │
  │                                  │
  │ Budget: $200-250                 │
  │ Items: 12                        │
  │ Complexity: Hard                 │
  │                                  │
  │ [← Prev]  [Choose]  [Next →]     │
  └──────────────────────────────────┘

  Swipe right → Option 2
  ```

  - One option fills screen
  - Swipe or arrow buttons to navigate
  - Pagination dots show position
  - "Choose this option" button

**Pros**:

- Great on mobile
- Full attention to each option
- Easy to understand
- Works for any number of options

**Cons**:

- Can't see multiple options at once
- Desktop: underutilizes screen space
- Not true "comparison" (can't see side-by-side)
- More clicks/swipes to compare

**Tradeoffs**:

- ✅ Mobile UX > Desktop comparison
- ❌ Not simultaneous comparison

### Recommendation: **Approach A (Side-by-Side) for Desktop, Approach C (Swiper) for Mobile** ✅

**Rationale**:

1. **Desktop**: Side-by-side is best for comparison (2-3 columns)
2. **Mobile**: Swiper works better (limited width)
3. **Responsive**: Automatically switches based on screen size
4. **Common case**: Most users have 2-3 options (fits columns)
5. **Fallback**: If 4+ options on desktop, show "Too many to compare - hide some options"

**Responsive Breakpoint**:

- Desktop (>768px): Side-by-side columns (max 3)
- Mobile (<768px): Swiper/carousel (one at a time)

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Hybrid (Side-by-Side/Swiper)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Comparison View (Desktop)**:

```
┌────────────────────────────────────────────────────┐
│ Compare Options                           [✕ Close] │
├───────────────┬───────────────┬────────────────────┤
│ Option 1:     │ Option 2:     │ Option 3:          │
│ EVA Plugsuit  │ School Uniform│ Casual Outfit      │
│ [☆ Favorite]  │ [☆]           │ [☆]                │
├───────────────┼───────────────┼────────────────────┤
│               │               │                    │
│ [Image]       │ [Image]       │ [Image]            │
│ [Image]       │ [Image]       │ [Link]             │
│ [Link]        │ [Note]        │ [Image]            │
│               │               │                    │
│ Items: 12     │ Items: 8      │ Items: 6           │
│               │               │                    │
│ 💰 Budget:    │ 💰 Budget:    │ 💰 Budget:         │
│ $200-250      │ $100-150      │ $80-120            │
│               │               │                    │
│ ⚙️ Complexity: │ ⚙️ Complexity: │ ⚙️ Complexity:      │
│ Hard          │ Medium        │ Easy               │
│               │               │                    │
│ ⏰ Time:       │ ⏰ Time:       │ ⏰ Time:            │
│ 2-3 months    │ 1-2 months    │ 2-4 weeks          │
│               │               │                    │
│ [Choose This] │ [Choose This] │ [Choose This]      │
└───────────────┴───────────────┴────────────────────┘
```

**Comparison View (Mobile)**:

```
┌────────────────────────────────┐
│ Compare Options      [✕ Close] │
├────────────────────────────────┤
│ ●○○  (1 of 3)                  │
│                                │
│ Option 1: EVA Plugsuit         │
│ [☆ Favorite]                   │
│                                │
│ [Image Gallery]                │
│                                │
│ Items: 12                      │
│                                │
│ 💰 Budget: $200-250            │
│ ⚙️ Complexity: Hard            │
│ ⏰ Time: 2-3 months             │
│                                │
│ [← Prev]  [Choose]  [Next →]   │
│                                │
│ ═════════════════              │
│ (Swipe to see Option 2)        │
└────────────────────────────────┘
```

**Comparison Attributes** (shown for each option):

- **Visual Preview**: 3-5 key images/links
- **Item Count**: Total moodboard items
- **Budget Estimate**: Total or range
- **Complexity**: User-set (Easy/Medium/Hard)
- **Time Estimate**: User-set (weeks/months)
- **Materials**: Key materials needed
- **Availability**: Are materials/refs available?

**Actions**:

- **Choose This**: Select option, hide others, continue with single option
- **Favorite**: Star favorite options (visual marker)
- **Close**: Return to normal view with option switcher

### References Needed:

- [ ] Amazon: Product comparison table
- [ ] Notion: Database side-by-side view
- [ ] Figma: Compare versions side-by-side
- [ ] Tinder: Card swiper (mobile reference)
- [ ] Product Hunt: Side-by-side comparison

### Integration Points:

- **Option Switcher**: Button to enter comparison mode
- **Decision**: Choosing an option hides (not deletes) others
- **Navigation**: Return to single option view
- **Wizard**: Can launch Idea→Project wizard from comparison view

### Implementation Notes:

- Load all option data upfront (no lazy loading during comparison)
- Limit to 3 options on desktop (width constraint)
- If 4+ options: Show selection UI "Choose 2-3 options to compare"
- Mobile: Use Swiper.js or similar carousel library
- Desktop: CSS Grid with fixed columns
- Synced scrolling: Use intersection observer + scroll sync

---

## 17. Idea→Project Wizard

**User Goal**: Convert a brainstormed Idea into an actionable Project with guidance

**Priority**: 🔥 HIGH - User Story #5 (Wizard-driven conversion)

### Context

From spec: "As a cosplayer, I want a guided wizard to convert my Idea into a Project so I can ensure I've thought through all the important decisions."

Users need help transitioning from creative brainstorming to execution planning:

- Choose which option (if multiple)
- Confirm character/design
- Review budget
- Set timeline/deadlines
- Choose convention/event (optional)
- Create initial tasks

### Design Approaches

#### Approach A: Multi-Step Modal Wizard

- **Pattern**: Classic wizard with steps in a modal
- **Interaction**:
  ```
  ┌────────────────────────────────────────┐
  │ Convert Idea to Project          [✕]   │
  ├────────────────────────────────────────┤
  │ Step 1 of 5: Choose Option             │
  │                                        │
  │ ○ Option 1: EVA Plugsuit               │
  │ ● Option 2: School Uniform (selected)  │
  │ ○ Option 3: Casual Outfit              │
  │                                        │
  │ [Back]                     [Next →]    │
  └────────────────────────────────────────┘
  ```

  - Linear progression (Step 1 → 2 → 3 → 4 → 5)
  - Modal overlay (darkened background)
  - Can go back/forward
  - "Cancel" exits wizard

**Pros**:

- Clear, guided flow
- Familiar pattern (many setup wizards)
- Focus (modal blocks other actions)
- Shows progress (Step X of Y)

**Cons**:

- Modal feels heavy
- Can't reference moodboard during wizard
- If user needs to check something, must cancel wizard
- Locked into linear flow

**Tradeoffs**:

- ✅ Guided flow > Flexibility
- ❌ Can't multitask

#### Approach B: Sidebar Panel Wizard

- **Pattern**: Wizard in side panel, main content still visible
- **Interaction**:
  ```
  ┌──────────┬────────────────────────────┐
  │ Convert  │                            │
  │ to       │   [Moodboard still         │
  │ Project  │    visible in background]  │
  │          │                            │
  │ Step 1/5 │                            │
  │ Choose   │                            │
  │ Option   │                            │
  │          │                            │
  │ ○ EVA    │                            │
  │ ● School │                            │
  │ ○ Casual │                            │
  │          │                            │
  │ [Back]   │                            │
  │ [Next]   │                            │
  └──────────┴────────────────────────────┘
  ```

  - Wizard in right sidebar (drawer)
  - Moodboard visible on left (reference)
  - Can close wizard and resume later
  - Progress indicator in sidebar

**Pros**:

- Can see moodboard while deciding
- Less intrusive than modal
- Can close and resume
- Feels lighter

**Cons**:

- Less focused (distracted by moodboard)
- Mobile: sidebar takes full screen anyway
- More complex state management (resume wizard)

**Tradeoffs**:

- ✅ Context available > Focus
- ⚠️ More complex

#### Approach C: Inline/Embedded Wizard

- **Pattern**: Wizard steps embedded in the page flow
- **Interaction**:
  ```
  ┌────────────────────────────────────────┐
  │ Idea: Asuka Langley Cosplay            │
  │                                        │
  │ Ready to start planning?               │
  │                                        │
  │ ┌────────────────────────────────────┐ │
  │ │ 1. Choose Option                   │ │
  │ │ ○ EVA   ● School   ○ Casual        │ │
  │ └────────────────────────────────────┘ │
  │                                        │
  │ ┌────────────────────────────────────┐ │
  │ │ 2. Confirm Budget: $100-150        │ │
  │ │ [Edit]                             │ │
  │ └────────────────────────────────────┘ │
  │                                        │
  │ ┌────────────────────────────────────┐ │
  │ │ 3. Set Timeline                    │ │
  │ │ Convention: [Select event ▼]       │ │
  │ │ Start: [Date picker]               │ │
  │ └────────────────────────────────────┘ │
  │                                        │
  │ [Create Project]                       │
  └────────────────────────────────────────┘
  ```

  - All steps visible at once (accordion or expanded)
  - Fill out form-style
  - Can jump to any step
  - No "Next" buttons

**Pros**:

- See all steps at once (overview)
- Can fill out in any order
- Less clicking
- Feels more like a form than a wizard

**Cons**:

- Less guided (no enforced order)
- Can be overwhelming (too much at once)
- Doesn't feel like a "journey"

**Tradeoffs**:

- ✅ Overview > Guided steps
- ❌ Less hand-holding

### Recommendation: **Approach A (Modal Wizard) for MVP, Approach B (Sidebar) for future** ✅

**Rationale**:

1. **Guided experience**: Modal forces focus (good for first-time users)
2. **Simple implementation**: Standard wizard pattern
3. **Clear progress**: Users know where they are
4. **Future**: Add sidebar option for power users who want reference
5. **Mobile**: Modal works well on mobile

**Wizard Steps**:

1. **Choose Option** (if multiple options exist)
2. **Confirm Budget**
3. **Set Timeline** (convention, deadline)
4. **Initial Tasks** (auto-generate or manual)
5. **Review & Create**

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach A (Modal Wizard)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Wizard Flow**:

**Step 1: Choose Option** (if multiple options exist)

```
┌────────────────────────────────────────────┐
│ Convert to Project                   [✕]   │
├────────────────────────────────────────────┤
│ Step 1 of 5: Choose Costume Option         │
│                                            │
│ Which version do you want to make?        │
│                                            │
│ ○ Option 1: EVA Plugsuit                   │
│   12 items • Budget: $200-250              │
│   [Preview images]                         │
│                                            │
│ ● Option 2: School Uniform (selected)      │
│   8 items • Budget: $100-150               │
│   [Preview images]                         │
│                                            │
│ ○ Option 3: Casual Outfit                  │
│   6 items • Budget: $80-120                │
│   [Preview images]                         │
│                                            │
│ [Cancel]                      [Next →]     │
└────────────────────────────────────────────┘
```

**Step 2: Confirm Budget**

```
┌────────────────────────────────────────────┐
│ Convert to Project                   [✕]   │
├────────────────────────────────────────────┤
│ Step 2 of 5: Review Budget                 │
│                                            │
│ Estimated budget from moodboard:           │
│                                            │
│ Fabric: $50                                │
│ Wig: $40                                   │
│ Accessories: $30                           │
│ Shoes: $45                                 │
│ Misc: $20                                  │
│ ─────────────                              │
│ Total: $185                                │
│                                            │
│ Budget Range: [$100] - [$200]              │
│                                            │
│ [← Back]                      [Next →]     │
└────────────────────────────────────────────┘
```

**Step 3: Set Timeline**

```
┌────────────────────────────────────────────┐
│ Convert to Project                   [✕]   │
├────────────────────────────────────────────┤
│ Step 3 of 5: Timeline & Deadlines          │
│                                            │
│ When do you need this completed?           │
│                                            │
│ Convention/Event: [Select event ▼]         │
│   (or create new event)                    │
│                                            │
│ Target Completion: [Date picker]           │
│   Recommended start: Now                   │
│   Time needed: ~6 weeks                    │
│                                            │
│ Milestones:                                │
│ ☑ Create automatically (recommended)       │
│ ☐ I'll set them later                      │
│                                            │
│ [← Back]                      [Next →]     │
└────────────────────────────────────────────┘
```

**Step 4: Initial Tasks**

```
┌────────────────────────────────────────────┐
│ Convert to Project                   [✕]   │
├────────────────────────────────────────────┤
│ Step 4 of 5: Create Initial Tasks          │
│                                            │
│ We'll create these tasks to get started:   │
│                                            │
│ ☑ Order fabric ($50)                       │
│ ☑ Purchase wig ($40)                       │
│ ☑ Find pattern or tutorial                 │
│ ☑ Take measurements                        │
│ ☑ Create construction timeline             │
│                                            │
│ [+ Add custom task]                        │
│                                            │
│ [← Back]                      [Next →]     │
└────────────────────────────────────────────┘
```

**Step 5: Review & Create**

```
┌────────────────────────────────────────────┐
│ Convert to Project                   [✕]   │
├────────────────────────────────────────────┤
│ Step 5 of 5: Review & Create               │
│                                            │
│ Project Name: [Asuka School Uniform]       │
│                                            │
│ Summary:                                   │
│ • Option: School Uniform                   │
│ • Budget: $100-$200                        │
│ • Timeline: 6 weeks                        │
│ • Convention: Anime Expo 2026              │
│ • Initial Tasks: 5 tasks                   │
│                                            │
│ Your Idea moodboard will be linked to      │
│ this Project for reference.                │
│                                            │
│ [← Back]          [Create Project →]       │
└────────────────────────────────────────────┘
```

**After Creation**:

```
✓ Project Created!

Redirecting to your new project...

[Go to Project] [Stay on Idea]
```

### References Needed:

- [ ] Stripe: Onboarding wizard
- [ ] Notion: Database creation wizard
- [ ] Shopify: Store setup wizard
- [ ] Linear: Project creation flow
- [ ] Airtable: Import wizard

### Integration Points:

- **Button location**: "Convert to Project" button on Idea detail page
- **Data migration**: Moodboard stays with Idea, Project references it
- **Navigation**: After creation, navigate to new Project
- **Cancellation**: Can cancel wizard without consequences
- **Resume**: If user closes, wizard resets (don't save partial progress)

### Implementation Notes:

- Use Svelte stores for wizard state
- Validate each step before allowing "Next"
- Auto-save nothing until final "Create Project" click
- Keyboard navigation: Enter = Next, Esc = Cancel
- Accessibility: ARIA labels, focus management
- Mobile: Full-screen modal on small screens

---

## 18. Budget Summary

**User Goal**: See total costs and budget breakdown at a glance

**Priority**: 🔥 HIGH - User Story #2 (Itemized budgeting)

### Context

From spec: "As a cosplayer, I want to itemize my budget with links to specific products/references so I can track costs accurately and know where to buy materials."

Budget summary shows:

- Total budget (sum of all budget items)
- Budget by category (fabric, wig, props, etc.)
- Budget vs. actual (planned vs. spent)
- Links to products/vendors

This component appears:

- In moodboard view (floating widget or panel)
- On Idea detail page
- On Project detail page

### Design Approaches

#### Approach A: Floating Summary Widget

- **Pattern**: Persistent widget in corner of moodboard
- **Interaction**:
  ```
  [Moodboard canvas]

            ┌──────────────────┐
            │ 💰 Budget        │
            ├──────────────────┤
            │ Total: $185      │
            │ ───────          │
            │ Target: $150-200 │
            │                  │
            │ [See Details →]  │
            └──────────────────┘
  ```

  - Always visible (floating)
  - Shows just total and range
  - Click to expand full breakdown
  - Minimizable

**Pros**:

- Always visible (constant awareness)
- Quick glance
- Doesn't take much space
- Works well on desktop

**Cons**:

- Can block canvas content
- Mobile: takes precious space
- Limited information (just totals)

**Tradeoffs**:

- ✅ Visibility > Space
- ⚠️ Can obstruct canvas

#### Approach B: Sidebar Panel

- **Pattern**: Dedicated sidebar for budget (collapsible)
- **Interaction**:
  ```
  ┌──────────┬────────────────────────────┐
  │ Budget   │                            │
  │ Summary  │   [Moodboard Canvas]       │
  │          │                            │
  │ Total:   │                            │
  │ $185     │                            │
  │          │                            │
  │ Fabric:  │                            │
  │ $50      │                            │
  │          │                            │
  │ Wig:     │                            │
  │ $40      │                            │
  │          │                            │
  │ Props:   │                            │
  │ $30      │                            │
  │          │                            │
  │ [+Item]  │                            │
  └──────────┴────────────────────────────┘
  ```

  - Sidebar always visible (when expanded)
  - Full budget breakdown visible
  - Can add items directly from sidebar
  - Collapsible (←/→ button)

**Pros**:

- Shows full information
- Easy to add/edit items
- No obstruction (dedicated space)
- Good for budget-heavy planning

**Cons**:

- Takes horizontal space
- Mobile: sidebar is awkward
- Not all users need budget always visible

**Tradeoffs**:

- ✅ Information > Canvas space
- ⚠️ Always visible (even when not needed)

#### Approach C: Toolbar Badge + Drawer

- **Pattern**: Badge in toolbar, click to open drawer
- **Interaction**:
  ```
  Toolbar:
  [Canvas] [Table] [Gallery] ... [💰 $185]
                                     ↑
                             Click to open drawer

  Drawer (slides from right):
  ┌────────────────────────────────────┐
  │ Budget Summary              [✕]    │
  ├────────────────────────────────────┤
  │ Total: $185                        │
  │ Target Range: $150 - $200   ✓      │
  │                                    │
  │ Breakdown:                         │
  │ ┌────────────────────────────────┐ │
  │ │ Fabric         $50      [Edit] │ │
  │ │ • Red satin fabric              │ │
  │ │   [Link to store]               │ │
  │ └────────────────────────────────┘ │
  │                                    │
  │ ┌────────────────────────────────┐ │
  │ │ Wig            $40      [Edit] │ │
  │ │ • Red bob wig                   │ │
  │ │   [Link to Amazon]              │ │
  │ └────────────────────────────────┘ │
  │                                    │
  │ [+ Add Budget Item]                │
  └────────────────────────────────────┘
  ```

  - Badge shows total in toolbar (always visible)
  - Click badge → drawer opens with full breakdown
  - Drawer shows all items with links
  - Mobile-friendly (drawer slides from bottom)

**Pros**:

- Minimal space (just a badge)
- Full details when needed (drawer)
- Mobile-friendly
- Doesn't obstruct canvas
- Always accessible

**Cons**:

- Not immediately visible (must click)
- One more click to see breakdown
- Badge might be missed by users

**Tradeoffs**:

- ✅ Space efficiency > Immediate visibility
- ✅ Mobile-friendly

### Recommendation: **Approach C (Toolbar Badge + Drawer)** ✅

**Rationale**:

1. **Space-efficient**: Badge takes minimal space
2. **Mobile-friendly**: Drawer works great on mobile
3. **Accessible**: Always in toolbar (predictable location)
4. **Progressive disclosure**: Show summary, expand for details
5. **Standard pattern**: Many apps use badge + drawer (notifications, etc.)

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach C (Badge + Drawer)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Budget Badge (Toolbar)**:

```
Top toolbar:
[Canvas] [Table] [Gallery] [Timeline] [List] [Graph] | [💰 $185]
                                                            ↑
                                                  Click to open drawer
                                                
Badge states:
• Under budget: [💰 $185] (green)
• On budget: [💰 $185] (blue)
• Over budget: [💰 $250 ⚠️] (red)
```

**Budget Drawer (Expanded)**:

```
┌────────────────────────────────────────────┐
│ Budget Summary                       [✕]   │
├────────────────────────────────────────────┤
│                                            │
│ Total Budget: $185                         │
│ Target Range: $150 - $200           ✓      │
│ Status: On Track                           │
│                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│                                            │
│ Breakdown by Category:                     │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ 🎨 Fabric                   $50        │ │
│ │ ─────────────────────────────────────  │ │
│ │ • Red satin fabric (2 yards)           │ │
│ │   [🔗 Fabric.com - $45]                │ │
│ │   [🖼️ Reference image]                 │ │
│ │ • Thread & supplies                    │ │
│ │   $5 estimated                         │ │
│ │                               [Edit]   │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ 💇 Wig                      $40        │ │
│ │ ─────────────────────────────────────  │ │
│ │ • Red bob wig                          │ │
│ │   [🔗 Amazon - $39.99]                 │ │
│ │   [🖼️ Reference image]                 │ │
│ │                               [Edit]   │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ 🎭 Props                    $30        │ │
│ │ ─────────────────────────────────────  │ │
│ │ • School bag replica                   │ │
│ │   $30 estimated                        │ │
│ │                               [Edit]   │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ 👠 Shoes                    $45        │ │
│ │ ─────────────────────────────────────  │ │
│ │ • Brown loafers                        │ │
│ │   [🔗 Zappos - $44.99]                 │ │
│ │                               [Edit]   │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ 🔧 Misc                     $20        │ │
│ │ ─────────────────────────────────────  │ │
│ │ • Makeup, accessories, etc.            │ │
│ │                               [Edit]   │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ [+ Add Budget Item]                        │
│                                            │
└────────────────────────────────────────────┘
```

**Budget Item Card (Expanded)**:

```
┌────────────────────────────────────────┐
│ 🎨 Fabric                   $50        │
│ ─────────────────────────────────────  │
│                                        │
│ Description:                           │
│ Red satin fabric (2 yards)             │
│                                        │
│ Links:                                 │
│ [🔗 Fabric.com - $45]                  │
│ [🔗 Joann Fabrics - $52]               │
│                                        │
│ References:                            │
│ [🖼️ Fabric swatch photo]              │
│ [🖼️ Color reference]                  │
│                                        │
│ Notes:                                 │
│ "Need to check if they have exact      │
│  shade in stock. Alternative: darker   │
│  red from Joann."                      │
│                                        │
│ Status: [ ] Purchased  [✓] Researching │
│                                        │
│ [Edit]  [Delete]                       │
└────────────────────────────────────────┘
```

**Budget Status Indicator**:

- **Under budget**: Green checkmark, "Under budget by $15"
- **On budget**: Blue checkmark, "Within budget"
- **Over budget**: Red warning, "Over budget by $50"

**Budget Categories**:

- Fabric
- Wig
- Props
- Shoes
- Makeup
- Accessories
- Patterns/Books
- Misc

### References Needed:

- [ ] Mint: Budget summary and categories
- [ ] You Need A Budget (YNAB): Budget breakdown
- [ ] Notion: Financial tracker templates
- [ ] Splitwise: Expense summary
- [ ] Google Sheets: Budget templates

### Integration Points:

- **Budget Items**: Each item can link to moodboard nodes (images, links)
- **Contacts**: Budget items can link to vendors/contacts
- **Shopping List**: Export budget items to shopping list
- **Timeline**: Budget items can have target purchase dates

### Implementation Notes:

- Store budget items in `budget_items` table
- Each item has: category, amount, links, notes, status
- Calculate total by summing all items
- Badge updates in real-time (reactive)
- Drawer uses same component as other drawers (consistency)
- Mobile: Drawer slides from bottom (full height)
- Desktop: Drawer slides from right (partial width)

---

## 19. Share Dialog

**User Goal**: Share moodboard with others via link with control over permissions

**Priority**: 🟡 MEDIUM - Social feature, collaborative brainstorming

### Context

From spec: "Share moodboards with others via shareable link. Public viewing without login, OAuth login required to comment."

Users want to:

- Share inspiration boards with friends
- Get feedback via comments
- Collaborate on ideas
- Share publicly (social media, forums)

### Design Approaches

#### Approach A: Simple Link Share (Minimal)

- **Pattern**: Generate link, copy to clipboard
- **Interaction**:
  ```
  ┌────────────────────────────────────┐
  │ Share Moodboard              [✕]   │
  ├────────────────────────────────────┤
  │                                    │
  │ Anyone with this link can view:    │
  │                                    │
  │ [https://cosplans.app/m/abc123]    │
  │                        [📋 Copy]   │
  │                                    │
  │ ☑ Allow comments (OAuth required)  │
  │                                    │
  │ [Done]                             │
  └────────────────────────────────────┘
  ```

  - Click "Share" → generates link
  - Copy link to clipboard
  - Simple on/off for comments
  - No advanced settings

**Pros**:

- Super simple
- Fast to implement
- No complex permissions
- Familiar pattern

**Cons**:

- Limited control
- Can't revoke access easily
- No expiration dates
- No analytics (who viewed?)

**Tradeoffs**:

- ✅ Simplicity > Control
- ❌ Limited features

#### Approach B: Advanced Share Settings

- **Pattern**: Full-featured sharing with permissions
- **Interaction**:
  ```
  ┌────────────────────────────────────────┐
  │ Share Moodboard                  [✕]   │
  ├────────────────────────────────────────┤
  │                                        │
  │ Link: [https://cosplans.app/m/abc123] │
  │                           [📋 Copy]    │
  │                                        │
  │ Permissions:                           │
  │ ○ Private (only me)                    │
  │ ● Public (anyone with link)            │
  │ ○ Team only                            │
  │                                        │
  │ Features:                              │
  │ ☑ Allow comments (OAuth required)      │
  │ ☐ Allow downloads                      │
  │ ☐ Show author name                     │
  │                                        │
  │ Expiration:                            │
  │ ○ Never                                │
  │ ○ 7 days                               │
  │ ○ 30 days                              │
  │ ○ Custom: [Date picker]                │
  │                                        │
  │ Password protection:                   │
  │ ☐ Require password: [_______]          │
  │                                        │
  │ [Share]  [Cancel]                      │
  └────────────────────────────────────────┘
  ```

  - Many options
  - Granular control
  - Expiration dates
  - Password protection

**Pros**:

- Full control over sharing
- Enterprise features (expiration, password)
- Privacy-focused
- Professional

**Cons**:

- Complex UI
- Overwhelming for simple use case
- Most features won't be used
- Slower to share

**Tradeoffs**:

- ✅ Control > Simplicity
- ⚠️ Complexity for edge cases

#### Approach C: Two-Tier (Simple + Advanced)

- **Pattern**: Simple by default, "Advanced" button for power users
- **Interaction**:
  ```
  ┌────────────────────────────────────┐
  │ Share Moodboard              [✕]   │
  ├────────────────────────────────────┤
  │                                    │
  │ [https://cosplans.app/m/abc123]    │
  │                        [📋 Copy]   │
  │                                    │
  │ ☑ Allow comments                   │
  │                                    │
  │ [Advanced Options ▼]               │
  │                                    │
  │ [Done]                             │
  └────────────────────────────────────┘

  Click "Advanced Options":
  ┌────────────────────────────────────┐
  │ Share Moodboard              [✕]   │
  ├────────────────────────────────────┤
  │ Link: [https://...]    [📋 Copy]   │
  │ ☑ Allow comments                   │
  │                                    │
  │ Advanced Options:                  │
  │ • Expires in: [Never ▼]            │
  │ • Show author: [Yes ▼]             │
  │ • Allow downloads: [No ▼]          │
  │                                    │
  │ [Revoke All Access]                │
  │                                    │
  │ [Done]                             │
  └────────────────────────────────────┘
  ```

  - Simple UI by default
  - Advanced options hidden (expandable)
  - Progressive disclosure

**Pros**:

- Simple for common case
- Advanced options available
- Not overwhelming
- Flexible

**Cons**:

- Slight complexity (expand/collapse)
- Some users won't find advanced options

**Tradeoffs**:

- ✅ Balance > Extremes

### Recommendation: **Approach C (Two-Tier)** ✅

**Rationale**:

1. **Common case is fast**: Just copy link
2. **Power users get control**: Advanced options available
3. **Progressive disclosure**: Complexity hidden by default
4. **Best UX**: Doesn't overwhelm or limit

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [X] ✅ Approve Approach C (Two-Tier)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [ ] ❌ Prefer different approach: ________ (specify)

**Your notes**:

```
[Add your thoughts here]
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Share Dialog (Simple View)**:

```
┌────────────────────────────────────────┐
│ Share "Asuka Cosplay" Moodboard  [✕]   │
├────────────────────────────────────────┤
│                                        │
│ 🔗 Share Link                          │
│                                        │
│ [https://cosplans.app/m/abc123def]     │
│                          [📋 Copy]     │
│                                        │
│ Options:                               │
│ ☑ Allow comments (OAuth required)      │
│ ☑ Show my name as author               │
│                                        │
│ [▼ Advanced Options]                   │
│                                        │
│ ─────────────────────────────────────  │
│                                        │
│ 👥 Currently shared with:              │
│ • Anyone with the link                 │
│ • 3 people have viewed                 │
│ • 1 comment                            │
│                                        │
│ [Done]                 [Revoke Access] │
└────────────────────────────────────────┘
```

**Share Dialog (Advanced View)**:

```
┌────────────────────────────────────────┐
│ Share "Asuka Cosplay" Moodboard  [✕]   │
├────────────────────────────────────────┤
│ 🔗 Share Link                          │
│ [https://cosplans.app/m/abc123def]     │
│                          [📋 Copy]     │
│                                        │
│ Options:                               │
│ ☑ Allow comments (OAuth required)      │
│ ☑ Show my name as author               │
│                                        │
│ [▲ Advanced Options]                   │
│ ┌────────────────────────────────────┐ │
│ │ Link expires:                      │ │
│ │ ○ Never                            │ │
│ │ ○ In 7 days                        │ │
│ │ ○ In 30 days                       │ │
│ │ ● Custom: [Mar 15, 2026]           │ │
│ │                                    │ │
│ │ Visibility:                        │ │
│ │ ● Public (anyone with link)        │ │
│ │ ○ Team only                        │ │
│ │                                    │ │
│ │ Additional:                        │ │
│ │ ☐ Allow image downloads            │ │
│ │ ☐ Password protect (enterprise)    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ 👥 Analytics:                          │
│ • 3 unique viewers                     │
│ • Last viewed: 2 hours ago             │
│ • 1 comment from @friend_name          │
│                                        │
│ [Done]                 [Revoke Access] │
└────────────────────────────────────────┘
```

**Share Button Location**:

```
Moodboard page header:
┌────────────────────────────────────────┐
│ Asuka Cosplay Moodboard                │
│ [Canvas ▼] [+ Add]     [Share] [⋮More] │
└────────────────────────────────────────┘
                             ↑
                      Click to open dialog
```

**Shared Moodboard View** (for viewers):

```
┌────────────────────────────────────────┐
│ 👁️ Viewing shared moodboard            │
│ "Asuka Cosplay" by @username           │
├────────────────────────────────────────┤
│                                        │
│ [Moodboard content - read-only]        │
│                                        │
│ ───────────────────────────────────────│
│                                        │
│ 💬 Comments (1)                        │
│                                        │
│ @friend_name: "Love the wig choice!"   │
│ 2 hours ago                            │
│                                        │
│ [Sign in with Google to comment]       │
│                                        │
└────────────────────────────────────────┘
```

### References Needed:

- [ ] Google Docs: Share dialog
- [ ] Figma: Share file dialog
- [ ] Notion: Share page dialog
- [ ] Dropbox: Share link settings
- [ ] GitHub: Repository sharing

### Integration Points:

- **URL structure**: `/m/{share_id}` (short, shareable)
- **Comments**: Component #20 (OAuth commenting)
- **Analytics**: Track views, unique visitors
- **Revoke**: Invalidate share link (generate new ID)

### Implementation Notes:

- Share ID: Random string (not sequential)
- Store in `moodboard_shares` table
- Check expiration on each page load
- OAuth providers: Google, GitHub, Discord (lightweight)
- No email verification required for commenting
- Rate limit: Max 5 shares per moodboard (prevent spam)

---

## 20. Comments System

**User Goal**: Leave feedback on shared moodboards without creating an account

**Priority**: 🟡 MEDIUM - Social feature, enables collaboration

### Context

From spec: "Allow public viewing without login, require OAuth login (Google, etc.) to comment - no full account creation required."

Users want to:

- Leave feedback on friends' moodboards
- Ask questions about choices
- Suggest alternatives
- No signup friction (use existing OAuth)

### Design Approaches

#### Approach A: Inline Comments (Google Docs style)

- **Pattern**: Click item → add comment to that specific item
- **Interaction**:
  ```
  [Moodboard with items]

  Click image node:
  ┌────────────────────────────┐
  │ [Image]                    │
  │                            │
  │ 💬 (2)                     │ ← Comment count
  └────────────────────────────┘

  Click 💬:
  ┌────────────────────────────────────┐
  │ Comments on "Red wig reference"    │
  ├────────────────────────────────────┤
  │ @friend: "This shade looks great!" │
  │ 2 hours ago                        │
  │                                    │
  │ @you: "Thanks! Found it on Amazon" │
  │ 1 hour ago                         │
  │                                    │
  │ [Sign in to reply]                 │
  └────────────────────────────────────┘
  ```

  - Comments attached to specific items
  - Thread-style conversations
  - Item shows comment count badge

**Pros**:

- Contextual (comment on specific items)
- Clear what comment refers to
- Organized by item
- Great for detailed feedback

**Cons**:

- Complex implementation
- Comments fragmented across items
- Hard to see all feedback at once
- Mobile: Inline comments can be cramped

**Tradeoffs**:

- ✅ Context > Overview
- ⚠️ Complex to implement

#### Approach B: General Comments (Blog style)

- **Pattern**: Comments at bottom of moodboard (or side panel)
- **Interaction**:
  ```
  [Moodboard content]

  ──────────────────────────────

  💬 Comments (3)

  ┌────────────────────────────────────┐
  │ @friend_1:                         │
  │ "Loving the color palette! Have    │
  │  you considered a darker red wig?" │
  │ 3 hours ago                        │
  │                                    │
  │ [Reply]                            │
  └────────────────────────────────────┘

  ┌────────────────────────────────────┐
  │ @friend_2:                         │
  │ "Where did you find that fabric    │
  │  reference?"                       │
  │ 1 hour ago                         │
  │                                    │
  │ [Reply]                            │
  └────────────────────────────────────┘

  [Sign in with Google to comment]
  ```

  - Comments at bottom (or sidebar)
  - Chronological list
  - Can reference items in text
  - Simpler structure

**Pros**:

- Simple to implement
- Easy to see all comments
- Familiar pattern (blogs, Reddit)
- Mobile-friendly
- Can @mention items

**Cons**:

- Less contextual
- Can't tell which item comment refers to
- Comments can be vague ("I like this!")

**Tradeoffs**:

- ✅ Simplicity > Context
- ✅ Overview > Specificity

#### Approach C: Hybrid (General + Item Comments)

- **Pattern**: General comments + ability to tag items
- **Interaction**:
  ```
  General comments section:
  ┌────────────────────────────────────┐
  │ @friend:                           │
  │ "Love the [Wig reference] choice!" │
  │       ↑ Click to highlight item    │
  │ 2 hours ago                        │
  │                                    │
  │ [Reply]                            │
  └────────────────────────────────────┘

  When writing comment:
  ┌────────────────────────────────────┐
  │ Write a comment...                 │
  │                                    │
  │ [📎 Reference item]                │
  │                                    │
  │ [Post Comment]                     │
  └────────────────────────────────────┘

  Click "Reference item" → Select from moodboard
  ```

  - General comment stream
  - Can tag/reference specific items
  - Clicking tagged item highlights it
  - Best of both worlds

**Pros**:

- Simple comment stream
- Can reference items when needed
- Flexible
- Not overwhelming

**Cons**:

- Tagging items is extra step
- Not all comments will tag items
- Slightly more complex than Approach B

**Tradeoffs**:

- ✅ Balance > Pure approach

### Recommendation: **Approach B (General Comments) for MVP, Approach C (Hybrid) for future** ✅

**Rationale**:

1. **Simple for MVP**: General comments are fast to implement
2. **Good enough**: Most feedback is general ("Looks great!", "I like the colors")
3. **Mobile-friendly**: Comment stream works well on mobile
4. **Future enhancement**: Add item tagging later if needed
5. **Standard pattern**: Blog-style comments are universally understood

---

### 📝 Your Decision & Notes

**Mark your choice**:

- [ ] ✅ Approve Approach B (General Comments)
- [ ] ⚠️ Approve with modifications (note changes below)
- [ ] 🤔 Needs discussion (add questions below)
- [X] ❌ Prefer different approach: a (specify)

**Your notes**:

```
this is better ux and easier to keep converstions contained but a lot of all conversations could be useful to review all comments.
```

**Questions for discussion**:

```
[Add any questions here]
```

---

### Detailed Design Spec

**Comments Section (Shared Moodboard)**:

```
┌────────────────────────────────────────────┐
│ [Moodboard content above]                  │
│                                            │
├────────────────────────────────────────────┤
│ 💬 Comments (3)                            │
├────────────────────────────────────────────┤
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [Avatar] @friend_1           3h ago    │ │
│ │                                        │ │
│ │ Loving the color palette! The red wig  │ │
│ │ is perfect for Asuka. Have you thought │ │
│ │ about adding more reference for the    │ │
│ │ plugsuit texture?                      │ │
│ │                                        │ │
│ │ [👍 2]  [Reply]                        │ │
│ └────────────────────────────────────────┘ │
│                                            │
│   ┌──────────────────────────────────────┐ │
│   │ [Avatar] @you            2h ago      │ │
│   │                                      │ │
│   │ Thanks! I'll add some fabric close-  │ │
│   │ ups this weekend.                    │ │
│   │                                      │ │
│   │ [👍 1]                               │ │
│   └──────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [Avatar] @friend_2           1h ago    │ │
│ │                                        │ │
│ │ Where did you find that pattern        │ │
│ │ reference? I've been looking for       │ │
│ │ something similar!                     │ │
│ │                                        │ │
│ │ [👍]  [Reply]                          │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ──────────────────────────────────────────│
│                                            │
│ [Sign in with Google to leave a comment]  │
│ [Sign in with GitHub]                     │
│                                            │
└────────────────────────────────────────────┘
```

**Comment Input (After OAuth login)**:

```
┌────────────────────────────────────────────┐
│ 💬 Leave a comment                         │
├────────────────────────────────────────────┤
│ Signed in as @your_name        [Sign out]  │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Write your comment here...             │ │
│ │                                        │ │
│ │                                        │ │
│ │                                        │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Markdown supported • [?] Formatting help   │
│                                            │
│ [Cancel]                   [Post Comment]  │
└────────────────────────────────────────────┘
```

**OAuth Sign-In Flow**:

```
1. User clicks "Sign in with Google"
2. OAuth popup opens (Google consent screen)
3. User approves access (email, name, avatar only)
4. Popup closes
5. User now logged in (session stored)
6. Comment input appears
7. User can post comment
```

**Comment Actions**:

- **Reply**: Nest comment (one level only)
- **React**: 👍 emoji only (keep simple)
- **Edit**: Author can edit their own comments (5 min window)
- **Delete**: Author can delete their own comments
- **Report**: Flag inappropriate comments (owner reviews)

**Moderation** (Moodboard owner):

- Owner sees [Delete] button on all comments
- Owner can disable comments on their moodboard
- Owner gets email notification for new comments (opt-in)

### References Needed:

- [ ] GitHub: Issue comments with OAuth
- [ ] Disqus: Blog commenting system
- [ ] Reddit: Threaded comments
- [ ] YouTube: Video comments
- [ ] Dev.to: Article comments

### Integration Points:

- **OAuth Providers**: Google, GitHub (start with these 2)
- **User data**: Store minimal info (name, avatar, provider ID)
- **No email**: Don't require email verification
- **Notifications**: Email notifications to moodboard owner (optional)

### Implementation Notes:

- Use Supabase Auth for OAuth (built-in)
- Store comments in `moodboard_comments` table
- Rate limit: Max 10 comments per user per hour (anti-spam)
- Markdown support: Use `marked` library
- XSS protection: Sanitize HTML output
- Real-time: Use Supabase realtime subscriptions (new comments appear instantly)
- Mobile: Comments stack vertically, tap to reply

---

## Design Review Complete! 🎉

**Total Components Reviewed**: 20

### Summary

✅ **Completed** (20/20):

1. Moodboard Canvas
2. Node Creation
3. Node Connections
4. Canvas Controls
5. Social Media Integration (with PWA)
6. Image Upload
7. Character Lookup
8. Budget Item Creation (deferred)
9. View Switcher
10. Table View
11. Gallery View
12. Timeline View
13. List View
14. Graph View
15. Option Tabs/Switcher
16. Option Comparison
17. Idea→Project Wizard
18. Budget Summary
19. Share Dialog
20. Comments System

### Next Steps

1. **Review your decisions**: Go through each component and fill out decision forms
2. **Iterate on feedback**: I'll update designs based on your notes
3. **Collect references**: Gather screenshots of the UI patterns we've identified
4. **Create design system**: Define shared components (buttons, cards, drawers)
5. **Begin implementation**: Start with high-priority components

### Key Design Decisions Made

- **PWA-first** with share target integration (Social Media)
- **Contextual UI** with auto-hide controls (Canvas Controls)
- **Drawer popovers** instead of modals (Table View, Character Lookup)
- **Bottom toolbar** for mobile node creation (Node Creation)
- **Hybrid approaches** for flexibility (Canvas, Character Lookup, View Switcher)
- **Progressive disclosure** throughout (Share Dialog, Budget Summary)

### Implementation Priority (Suggested)

**Phase 1 - Core Canvas** (Weeks 1-2):

- Moodboard Canvas
- Node Creation
- Image Upload
- View Switcher

**Phase 2 - Social Integration** (Weeks 3-4):

- Social Media Integration (paste MVP)
- PWA setup and share target
- Character Lookup

**Phase 3 - Views** (Weeks 5-6):

- Table View
- Gallery View
- Timeline View
- List View

**Phase 4 - Multi-Option** (Weeks 7-8):

- Option Tabs/Switcher
- Option Comparison
- Idea→Project Wizard

**Phase 5 - Budget & Sharing** (Weeks 9-10):

- Budget Summary
- Share Dialog
- Comments System

Would you like me to:

- Create a detailed implementation plan?
- Start collecting reference screenshots?
- Design the component system architecture?
- Something else?
