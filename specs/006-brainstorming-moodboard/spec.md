# Feature Specification: Enhanced Brainstorming & Moodboarding

**Feature Branch**: `006-brainstorming-moodboard`
**Created**: 2026-01-08
**Status**: Draft - Specification Phase
**Priority**: P1 - Core Creative Workflow

---

## Overview

Enhance the brainstorming and inspiration gathering phase of cosplay planning with visual moodboards and social media integration. This feature transforms the Idea phase from simple text notes into a rich visual inspiration workspace.

**Core Problem**: Users currently bounce between Instagram/TikTok for inspiration and the app for planning, losing context and breaking their creative flow. There's no way to visually organize inspiration or build moodboards, compare options, or track multiple variations of a single costume idea.

**Solution**: Add moodboard functionality to both Ideas and Projects, with multi-platform social media integration (Instagram, TikTok, Pinterest, Facebook, YouTube), better budgeting with itemization, contact/vendor tracking, multiple options per idea, and a wizard-driven idea→project conversion flow.

---

## Clarifications

### Session 2026-01-08

- Q: When a user creates a budget item (e.g., "wig - $45"), should it always require a moodboard node (image/link) to be created first, exist independently in the budget table, be a canvas node itself, or support all approaches? → A: Both B and C - Budget items exist independently in the budget table AND can be represented as canvas nodes (BudgetItemNode) with optional references
- Q: When converting an Idea to a Project via the wizard, how should moodboard nodes be handled (share same canvas, copy nodes, user chooses, or split by type)? → A: Share the same moodboard canvas - Idea and Project both point to the same nodes. Moodboards are mainly for the idea phase and mostly for reference in the planning phase
- Q: For moodboard sharing, should shared boards require login for viewing/commenting, allow public viewing with login for comments, allow anonymous commenting, or be team-only? → A: Allow public viewing without login, require OAuth login (Google, etc.) to comment - no full account creation required. Mix of B and C - lightweight authentication for commenting without signup friction
- Q: For the Timeline View, should items be arranged vertically, horizontally, user-toggleable, or automatic based on screen size? → A: User can toggle between horizontal and vertical layouts, with focus on vertical first (like Pinterest) and horizontal option as well
- Q: For URL parsing to extract metadata from social media posts, which technical approach (platform-specific parsers, web scraping, generic library, or official APIs)? → A: Start with generic metadata extraction library (oembed-parser, unfurl, metascraper) as MVP, add official platform APIs over time as needed

---

## User Requirements

### 1. Moodboard Feature 🎯 HIGH PRIORITY

**Concept**: Infinite canvas visual boards with node connections for collecting and organizing inspiration on both Ideas and Projects

**Confirmed Requirements**:
- **Canvas Type**: **Freeform Infinite Canvas with Node Connections** (Milanote + Obsidian hybrid)
  - Infinite pannable and zoomable workspace
  - Node-based UI with visual connections/edges
  - Spatial organization - position items anywhere
  - Connection lines between related items (wig → multiple options, budget item → reference image)
  - Graph view to see relationships
  - Touch gestures: pinch zoom, pan, drag on mobile
  - Smooth performance with 50-200+ items
  
- **Content Types Supported** (as Nodes):
  - Social media embeds (Instagram Reels, TikTok videos, Pinterest pins, Facebook posts, YouTube videos)
  - Uploaded images (JPG, PNG, WebP)
  - External links/URLs
  - Text notes
  - **Sketches** (hand-drawn inspiration with simple drawing tools)
  - Budget item cards
  - Contact/supplier cards
  - Color swatches (future)
  - **Piles** (expandable groups for "ADHD-friendly organized chaos")
  
- **Organization Method**: **Tags + Spatial Grouping**
  - Flexible tagging system for categorization
  - Tags like: "fabric", "pose", "makeup", "wig", "pattern", "tutorial", etc.
  - Multiple tags per item
  - Filter/search by tags
  - **Spatial grouping**: Visually group related items by position
  - Visual boundaries/sections (optional)
  
- **Node Grouping & Annotations**:
  - Groups can have **short comments** (inline labels)
  - Groups can have **long notes** (detailed descriptions for managing collections)
  - Keep multiple related ideas together spatially
  - Connect items with labeled edges (e.g., "works for both", "alternative to")
  
- **Canvas Features**:
  - Zoom and pan (desktop: mouse wheel/drag, mobile: pinch/swipe)
  - Minimap for navigation
  - Background grid (optional)
  - Controls panel
  - Responsive: works on desktop, tablet, mobile
  - Touch-optimized for mobile brainstorming

- **Multiple View Modes**: Same data, different perspectives
  1. **Canvas View** (default): Freeform infinite canvas with spatial organization
  2. **Table View**: Spreadsheet-style rows and columns for quick scanning
  3. **Timeline View**: Chronological layout by created/updated date
  4. **Gallery View**: Grid of thumbnails (Pinterest-style, no freeform positioning)
  5. **List View**: Compact list with metadata
  6. **Graph View**: Pure network visualization (nodes + edges only, Obsidian-style)
  
- **View Switching**:
  - Toggle between views instantly (same underlying data)
  - Views remember their own state (filters, sort order, zoom level)
  - Canvas view remembers positions, other views auto-arrange
  - Mobile-friendly: Gallery/List views may be better on small screens
  - Quick view switcher in toolbar
  
- **Sharing**:
  - Share moodboards with others via shareable link
  - **Public viewing**: Anyone with link can view moodboard without login
  - **Lightweight OAuth commenting**: OAuth login (Google, GitHub, etc.) required to comment - no full account signup needed
  - Quick social login for commenting without registration friction
  - Comments attributed to OAuth user (name, avatar from provider)
  - Moodboard owner can disable sharing anytime (revoke public access)
  - Collaborative inspiration gathering with accountability
  - Real-time collaboration (future)
  
- **Location**:
  - Moodboards primarily on **Ideas** (brainstorming phase)
  - **Projects reference the same moodboard** from their source Idea (shared canvas)
  - When viewing a Project, user can access the linked Idea's moodboard for reference
  - Ideas: General inspiration, multiple options, exploration, comparison (primary editing)
  - Projects: View/reference the source Idea's moodboard during planning (read-only or shared editing - TBD based on use case)
  - Progress photos: Separate feature on Projects only (not part of shared moodboard)

---

### 1.5. Progressive Disclosure & Multi-Layered Navigation 🎯 HIGH PRIORITY

**Design Philosophy**: **Simple by default, scales to complexity**

**Critical Insight**: Most users will have simple needs!
- Single cosplay for one event
- Quick inspiration capture
- Basic planning

**The system must NOT overwhelm simple use cases!**

**Progressive Complexity Levels**:

1. **Level 1 - Single Simple Cosplay**:
   - Only "[All]" tab visible
   - Items on canvas (images, links, notes, sketches)
   - No nesting required
   - Quick and simple

2. **Level 2 - Multiple Ideas (Deciding)**:
   - Still "[All]" tab only
   - Use **Piles** to separate options
   - Example: "Pile: Idea 1: Asuka", "Pile: Idea 2: Rei"
   - Decide later which to pursue

3. **Level 3 - Decided on One, Exploring Variations**:
   - "[All] [Character Name]" tabs appear
   - Character tab has variation tabs: "[All Shared] [Variation 1] [Variation 2]"
   - Multi-layered navigation

4. **Level 4 - Group Cosplay (Full Complexity)**:
   - "[All] [Character 1] [Character 2] [Character 3]" tabs
   - Each character has variations
   - **Multi-character resource linking**: Shared resources appear on multiple character tabs
   - Full power when needed

**Multi-Layered Tab Navigation**:

```
Top Level: [All] [Tanjiro] [Inosuke] [Zenitsu]
           └─ Home/Overview (loose notes, piles, shared resources)
                     └─ Character Canvas
                          └─ [All Shared] [Demon Slayer Uniform] [Civilian Clothes]
                               └─ Variation/Progress Tabs
```

**Tab System Features**:
- **"All" tab** = Home/Overview of entire idea
- **Character tabs** = Click to enter character-specific canvas
- **Variation tabs** (within character) = Different versions OR progress tracking
- **Flexible usage**: Single-layer for simple, multi-layer for complex
- **Shared resources**: Tag resources with multiple characters to appear on multiple tabs
- **Loose notes**: Items without character tags stay on "All" tab

**Quick Capture Priority**:
- ⚡ Quick Add button always visible
- Capture types: Photo, Image, Link, **Sketch**, Note, Voice (future)
- **Speed is critical**: Every extra click = lost inspiration
- Must be faster than taking a screenshot
- Must work offline (PWA)

---

### 2. Multi-Platform Social Media Integration 🎯 HIGH PRIORITY

**Concept**: Add content from multiple social media platforms seamlessly

**🚀 PWA SHARE TARGET - DAY-ONE PRIORITY**:
- Progressive Web App with share target integration
- Share directly from Instagram/TikTok → Select team & idea → Create moodboard node
- Embedded viewing: Watch reels/TikToks directly in app (no need to open Instagram/TikTok)
- Native app feel on mobile
- Offline capability
- Install prompt optimized

**Confirmed Platforms**:
1. Instagram (Reels, Posts)
2. TikTok (Videos)
3. Pinterest (Pins)
4. Facebook (Posts, Videos)
5. YouTube (Videos)
6. Others as needed

**Technical Approach**: **PWA with Share Target (Day-One Priority)**
- Progressive Web App as primary platform
- **Share Target API** for direct sharing from Instagram/TikTok/etc.
- Copy/paste URL as fallback
- Native mobile app as future enhancement (after PWA proven)
- Service Worker for offline support

**Quick-Add Methods** (all three wanted):
1. **Bookmarklet**: Browser bookmark that captures current page
2. **Browser Extension**: Chrome/Firefox extension for one-click save
3. **Keyboard Shortcut**: Quick access while browsing

**Content Capture**:
- **Phased metadata extraction approach**:
  - **Phase 1 (MVP)**: Generic metadata extraction libraries (oembed-parser, unfurl, metascraper)
    - Parses Open Graph tags, Twitter Cards, oembed endpoints
    - Works across all platforms without API keys
    - Simpler implementation, faster to ship
    - Good enough for most use cases
  - **Phase 2 (Enhancement)**: Add official platform APIs for better data quality
    - Instagram Graph API for richer Instagram data
    - TikTok API for video details
    - YouTube Data API for video metadata
    - Pinterest API for pin information
    - Used alongside generic parser for enhanced metadata
- Extract: thumbnail, title, creator/author, description, publish date
- Embed preview where platform allows (iframe embeds)
- Store original URL
- Cache thumbnails/previews locally (Supabase Storage)
- Handle failures gracefully (fallback to basic link with URL only)

---

### 3. Budget Improvements 🎯 HIGH PRIORITY

**Concept**: Better budget tools with itemization and price comparison in the **Idea phase**

**Key Requirements**:
- **Dual representation of budget items**: Budget items stored in dedicated `budget_items` table AND optionally visualized as canvas nodes
  - **Database table**: All budget items stored in `budget_items` table (source of truth)
  - **Canvas representation**: Users can optionally add budget items to canvas as BudgetItemNode for visual organization
  - **Sync mechanism**: When budget item added to canvas, creates moodboard_node linked to budget_items record
  - **Flexibility**: Budget items can exist without canvas representation (traditional list view) OR be visualized on canvas
  - Example workflow 1: User creates budget item in table view, later drags it to canvas for visual planning
  - Example workflow 2: User creates BudgetItemNode directly on canvas, which creates corresponding budget_items record
- **Budget itemization in Ideas**: Track item-level costs before committing to project
- **Price comparison**: Compare costs across different options/approaches
- **Contact linking**: 
  - Database: `contact_id` field in budget_items table
  - Canvas: Budget nodes can link to Contact nodes via edges to show supplier options visually
- **Item tracking** (in budget_items table):
  - Item name
  - Estimated/actual cost
  - Quantity needed
  - Supplier/contact link (contact_id field + optional canvas edges)
  - Priority/necessity (need vs nice-to-have)
  - Notes
  - Optional: linked_node_id (references moodboard_nodes if on canvas)
  
- **Multiple budgets per Idea**: Each "option" can have its own budget for comparison
- **Budget carries to Project**: Selected option's budget items (and their canvas representations if present) become project baseline

---

### 4. Contact/Vendor Management 🎯 MEDIUM PRIORITY

**Concept**: Track contacts for commissioners, suppliers, venues, etc.

**Contact Types**:
- Commissioners (armor, props, sewing)
- Suppliers (fabric stores, wig vendors, craft stores)
- Venues (photoshoot locations)
- Photographers
- Makeup artists
- Other collaborators

**Contact Information**:
- Name
- Type/category
- Contact methods (email, social media, website)
- Notes
- Past projects/items
- Rating/favorites
- Price range

**Item Linking**:
- Link contacts to budget items
- Show "supplier options" for each item
- Compare vendors by price, quality, availability

---

### 5. Multiple Options Per Idea 🎯 HIGH PRIORITY

**Concept**: Replace single "character" with multiple "options" (different approaches/versions)

**Terminology**: **"Options"** (NOT "characters")
- More flexible than "character"
- Supports OCs, original designs, crossovers, variations
- Example: "Armor version vs Casual version" or "Movie vs Comic design"

**Option Structure**:
- Each Idea can have multiple Options
- Each Option has:
  - Name/title
  - Description
  - Difficulty rating (per option)
  - Budget breakdown
  - Moodboard/references
  - Notes
  
- **Shared Resources**:
  - Some items/resources shared across options
  - Example: Same wig works for both versions
  - Flag items as "shared" in budgets

**Conversion to Projects**:
- Options can be converted **individually** to Projects
- User chooses which option(s) to promote
- Splitting capability: Convert multiple options from same Idea into separate Projects

---

### 6. Improved Idea → Project Transition 🎯 HIGH PRIORITY

**Concept**: Better UX for converting Ideas into Projects with wizard flow

**Current Problem**:
- Abrupt conversion
- No user input during transition
- Character/series handling unclear
- Budget doesn't carry over well

**New Approach: Wizard Flow**
1. **Choose Option**: If multiple options, select which to convert (can convert multiple)
2. **Review Data**: Show what will carry over
3. **Add Details**: Prompt for project-specific info (deadlines, events)
4. **Budget Confirmation**: Review and adjust budget from idea phase
5. **Create**: Complete conversion

**Data Handling**:
- Idea is **referenced** in Project (NOT copied entirely)
- Project links back to source Idea via `source_idea_id` and `source_option_id`
- **Moodboard**: Shared canvas - both Idea and Project point to the same moodboard nodes
  - Moodboard nodes remain associated with the original Idea
  - Project can view/reference the moodboard (read access)
  - Edits to moodboard affect both Idea and Project (shared source of truth)
  - Primary use case: Moodboard for brainstorming in Idea phase, referenced during Project planning
- Budget: Copy itemization as baseline (budget_items duplicated with new project_id)
- Options: Each option becomes separate project if split

**User Control**:
- User confirms what to bring forward
- Can exclude certain moodboard items
- Can adjust budget during conversion
- Can set project-specific fields (deadlines, events)

---

### 7. Character Database Integration 🎯 MEDIUM PRIORITY

**Concept**: Integration with character/series database

**Requirements**:
- Search for characters by name
- Auto-fill series information
- Link to character wiki/info
- Reference images from database
- Support custom characters (OCs)

**Implementation Notes**:
- External API (AniList, MyAnimeList, etc.) or internal database
- Optional feature - doesn't block manual entry
- Helps with discovery and standardization

---

### 8. Tutorial/Pattern Management 🎯 MEDIUM PRIORITY

**Concept**: Save tutorials and patterns as reusable references

**Features**:
- Save tutorial links with notes
- Tag by technique (armor, sewing, wig styling, etc.)
- Link to specific projects
- Personal library of techniques
- Rate/favorite tutorials
- **Built-in tutorial**: Reference template showing all moodboard features

**Use Cases**:
- "I found this amazing foam armor tutorial"
- "Save this wig styling video for future projects"
- "Pattern I bought for future use"

---

### 9. Fabric/Material Location Lookup 🎯 LOW PRIORITY

**Concept**: Track where to find specific fabrics/materials

**Features**:
- Store locations (physical or online)
- Link to suppliers
- Note availability, price, quality
- Photo of actual material
- Personal shopping database

---

### 10. Progress Photos (Projects Only) 🎯 MEDIUM PRIORITY

**Concept**: Track build progress with photos

**Requirements**:
- **Project phase ONLY** (not Ideas)
- Upload progress photos
- Organize chronologically
- Tag by task/stage
- Before/after comparisons
- Share progress with team/community

---

### 11. Event Linking 🎯 MEDIUM PRIORITY

**Concept**: Link Ideas/Projects to events for outfit planning

**Features**:
- Event calendar integration
- Link costumes to cons/photoshoots
- Deadline calculation from event date
- Multiple costumes per event
- Event details (location, dates, notes)

---

### 12. Export Features 🎯 LOW PRIORITY (Future)

**Concept**: Export moodboards and data for external use

**Options**:
- PDF export of moodboard
- Image grid export
- Budget spreadsheet
- Checklist export
- Share link (web view)

**Implementation**: Later phase, after core features stable

---

## Data Model Changes

### New Tables

**`moodboard_nodes`** (formerly moodboard_items):
```sql
- id (uuid)
- idea_id (uuid) -- NOT nullable, moodboards belong to Ideas
- node_type (enum: 'social_media', 'image', 'link', 'note', 'swatch', 'budget_item', 'contact', 'sketch', 'pile')
- content_url (text)
- thumbnail_url (text)
- metadata (jsonb)
- tags (text[])
- short_comment (text)
- long_note (text)
- position_x (float) -- canvas x coordinate
- position_y (float) -- canvas y coordinate
- width (integer, default 300)
- height (integer, nullable) -- auto if null
- z_index (integer, default 0)
- parent_id (uuid, nullable) -- For items inside piles, references another moodboard_node
- is_expanded (boolean, default true) -- For pile nodes
- created_at (timestamp)
- updated_at (timestamp)

-- Note: moodboard nodes always belong to Ideas
-- Projects access moodboard via source_idea_id relationship (shared canvas)
-- No project_id field needed - Projects reference the Idea's moodboard
-- parent_id creates hierarchy: pile nodes contain other nodes
```

**`moodboard_edges`**:
```sql
- id (uuid)
- idea_id (uuid) -- NOT nullable, edges belong to the same Idea as their nodes
- source_node_id (uuid) -- foreign key to moodboard_nodes
- target_node_id (uuid) -- foreign key to moodboard_nodes
- edge_type (enum: 'connection', 'reference', 'alternative', 'shared_resource', 'supplier_option')
- label (text, nullable) -- optional edge label
- created_at (timestamp)

-- Edge type usage:
-- 'reference': BudgetItemNode → ImageNode/SocialMediaNode (budget item references this inspiration)
-- 'supplier_option': BudgetItemNode → ContactNode (contact is a supplier option for this item)
-- 'shared_resource': BudgetItemNode → OptionNode (this budget item is shared across options)
-- 'alternative': Any node → Any node (alternative approach/choice)
-- 'connection': Generic connection between any nodes

-- Note: Edges always belong to Ideas (same as nodes)
-- Projects view edges via source_idea_id relationship
```

**`idea_options`**:
```sql
- id (uuid)
- idea_id (uuid)
- name (text)
- description (text)
- difficulty (integer 1-5)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**`budget_items`**:
```sql
- id (uuid)
- idea_id (uuid, nullable)
- option_id (uuid, nullable)
- project_id (uuid, nullable)
- item_name (text)
- estimated_cost (decimal)
- actual_cost (decimal, nullable)
- quantity (integer)
- contact_id (uuid, nullable) -- foreign key to contacts table
- priority (enum: 'need', 'want', 'nice_to_have')
- is_shared (boolean) -- shared across options
- notes (text)
- linked_node_id (uuid, nullable) -- foreign key to moodboard_nodes (if visualized on canvas)
- currency (text, default 'USD')
- created_at (timestamp)
- updated_at (timestamp)

-- When budget item is added to canvas:
-- Creates moodboard_node with node_type='budget_item'
-- moodboard_node.metadata stores reference back: { "budget_item_id": "uuid" }
-- Contact links via moodboard_edges with edge_type='supplier_option' (optional, visual only)
-- Reference links via moodboard_edges with edge_type='reference' (optional, visual only)
```

**`contacts`**:
```sql
- id (uuid)
- team_id (uuid)
- name (text)
- type (enum: 'commissioner', 'supplier', 'venue', 'photographer', 'other')
- email (text)
- website (text)
- social_media (jsonb)
- notes (text)
- rating (integer 1-5)
- is_favorite (boolean)
- created_at (timestamp)
```

**`tutorials`**:
```sql
- id (uuid)
- team_id (uuid)
- title (text)
- url (text)
- technique_tags (text[])
- notes (text)
- rating (integer 1-5)
- created_at (timestamp)
```

**`moodboard_shares`**:
```sql
- id (uuid)
- idea_id (uuid) -- foreign key to ideas (moodboard being shared)
- share_token (text, unique) -- unique token for shareable URL
- created_by (uuid) -- user who created the share
- is_active (boolean, default true) -- false when sharing disabled
- created_at (timestamp)
- revoked_at (timestamp, nullable)

-- Shareable URL format: /share/moodboard/{share_token}
-- Public viewing: no auth required
-- Commenting: requires login
```

**`moodboard_comments`**:
```sql
- id (uuid)
- idea_id (uuid) -- foreign key to ideas
- node_id (uuid, nullable) -- foreign key to moodboard_nodes (null = comment on entire board)
- oauth_provider (enum: 'google', 'github', 'facebook', etc.)
- oauth_user_id (text) -- user ID from OAuth provider
- commenter_name (text) -- display name from OAuth provider
- commenter_avatar (text) -- avatar URL from OAuth provider
- commenter_email (text, nullable) -- email from OAuth provider (if granted)
- comment_text (text)
- created_at (timestamp)
- updated_at (timestamp)

-- Comments use lightweight OAuth - no full account creation
-- Store OAuth user info for attribution
-- Can comment on entire moodboard or specific nodes
```

**`moodboard_node_character_links`**:
```sql
- id (uuid)
- node_id (uuid) -- foreign key to moodboard_nodes
- character_name (text) -- character this resource is linked to
- idea_id (uuid) -- foreign key to ideas (for efficient queries)
- created_at (timestamp)

-- UNIQUE constraint: (node_id, character_name)
-- Purpose: Multi-character resource linking
-- A node can be linked to multiple characters (appears on multiple character tabs)
-- Nodes with no links appear only on "All" (overview) tab
-- Example: Shared fabric swatch linked to both "Tanjiro" and "Inosuke"
```

**`moodboard_tab_state`**:
```sql
- id (uuid)
- idea_id (uuid) -- foreign key to ideas
- user_id (uuid) -- foreign key to users
- active_character_tab (text, nullable) -- NULL = "All" tab, otherwise character name
- active_variation_tab (text, nullable) -- Variation/progress tab within character
- tab_order (jsonb) -- Array of character names in user's preferred order
- created_at (timestamp)
- updated_at (timestamp)

-- UNIQUE constraint: (idea_id, user_id)
-- Purpose: Persist user's tab navigation and view preferences
-- Each user can have different tab state for same idea (personal preferences)
-- tab_order example: ["Tanjiro", "Inosuke", "Zenitsu"]
```

### Modified Tables

**`ideas`**:
- Already has `title` (optional)
- Already has `character` (optional)
- Already has `series` (optional)
- Add: `event_id` (uuid, nullable)
- Add: `character_db_id` (text, nullable) -- external character DB reference

**`projects`**:
- Add: `source_idea_id` (uuid, nullable) -- reference to original idea
- Add: `source_option_id` (uuid, nullable) -- which option was converted
- Add: `event_id` (uuid, nullable)

---

## UI Interaction Patterns (Based on Design Review)

### Canvas Controls
**Approach**: Contextual controls that auto-hide
- Controls appear near cursor/touch on canvas interaction
- Auto-hide after 3 seconds of inactivity
- Hotkey hints shown in controls (`Z` for zoom, `P` for pan)
- No persistent floating panels cluttering canvas
- Mobile: Controls appear on touch, persist during interaction

### Node Creation
**Approach**: Obsidian-style bottom toolbar (mobile) + contextual menu (desktop)
- **Mobile**: Bottom toolbar always visible, tap-and-hold for quick menus
- **Desktop**: Right-click canvas for context menu, or use Quick Add button
- **Quick Add flow**:
  1. Tap/click ⚡ Quick Add button
  2. Select: Photo, Image, Link, Sketch, Note
  3. Immediate capture → organize later

### Piles/Groups
**Approach**: Expandable groups for "ADHD-friendly organized chaos"
- Drag items together → auto-suggest "Create Pile"
- Pile shows preview thumbnails (up to 4 items)
- Click pile → expands to show all contents (like Unreal Engine blueprints)
- Collapse pile → items hidden but preserved
- Piles can be named and color-coded

### Editing Nodes
**Approach**: Drawer popover (not modal)
- Click node → drawer slides up from bottom (mobile) or right side (desktop)
- Partial overlay (can still see canvas)
- Easy to dismiss (swipe down, click outside, ESC key)
- Quick editing without losing canvas context

### List View
**Approach**: Adaptive density with nested cards
- **Compact mode** (default): Simple rows with thumbnails
- **Detailed mode**: Nested cards with metadata
- **Mobile**: Always compact, tap to expand individual cards
- **Desktop**: Toggle between compact/detailed
- Hybrid approach: Best of lists and cards

### Comments System
**Approach**: Inline comments per node + overview panel
- Each node has inline comment thread
- Click comment icon → drawer with comments for that node
- Side panel (desktop) or drawer (mobile) shows all comments overview
- Contained conversations per node
- Better UX than global comment thread

### Table View
**Approach**: Spreadsheet-like with drawer editing
- Click row → drawer slides out with full edit form
- No modal blocking entire table
- Continue scanning table while editing
- Inline quick edits for simple fields (tags, title)

### Character Tab Navigation
**Approach**: Multi-layered with flexible usage
- **Top level**: [All] [Character 1] [Character 2] ...
  - "All" = Home/Overview
  - Character tabs = Click to enter character-specific canvas
- **Within character**: [All Shared] [Variation 1] [Variation 2] ...
  - Flexible: Use for variations OR progress tracking
- **Multi-character resources**: Tag resource with multiple characters → appears on multiple tabs
- **Dropdown navigation**: For deeply nested variations

### Mobile Bottom Toolbar
**Approach**: Obsidian-style always-visible toolbar
- 4-5 primary actions: Quick Add, View Mode, Filter, Share, More
- Tap-and-hold for extended menus
- Thumb-friendly zone (bottom 15% of screen)
- Never auto-hides (primary navigation)

### Sketch Tool
**Approach**: Simple drawing interface for quick inspiration
- **Tools**: Pen, marker, eraser
- **Colors**: Common palette (10 colors)
- **Templates**: Blank, figure outline, grid
- **Mobile**: Touch drawing, finger or stylus
- **Desktop**: Mouse or drawing tablet
- **Pressure sensitivity**: If device supports
- **Export**: Save as PNG to canvas

---

## User Stories

### US-1: Add Social Media Content to Moodboard
**As a** cosplayer browsing Instagram  
**I want to** copy a reel URL and paste it into my idea moodboard  
**So that** I can collect inspiration without switching apps constantly

**Acceptance Criteria**:
- [ ] User can paste Instagram/TikTok/Pinterest/YouTube URL
- [ ] System parses URL and extracts metadata (thumbnail, title)
- [ ] Content appears in moodboard with preview
- [ ] User can add tags to categorize content
- [ ] User can add short comment or long note

### US-2: Compare Multiple Costume Options
**As a** cosplayer planning a new costume  
**I want to** create multiple options with different budgets  
**So that** I can compare approaches before committing

**Acceptance Criteria**:
- [ ] User can create multiple "options" within one Idea
- [ ] Each option has separate budget breakdown
- [ ] Each option has difficulty rating
- [ ] User can mark resources as "shared" across options
- [ ] User can view side-by-side comparison

### US-3: Convert Option to Project with Wizard
**As a** cosplayer ready to start building  
**I want to** convert my chosen option into a project with guidance  
**So that** I don't lose any planning work and set up project correctly

**Acceptance Criteria**:
- [ ] User clicks "Start Planning" and enters wizard
- [ ] Wizard shows option selection (if multiple)
- [ ] Wizard shows data review screen
- [ ] User can add project-specific details (deadline, event)
- [ ] Budget carries over as baseline
- [ ] Moodboard references link to original idea
- [ ] Project maintains reference to source idea + option

### US-4: Track Suppliers for Budget Items
**As a** cosplayer building a budget  
**I want to** link suppliers to each item  
**So that** I can compare vendor options and remember where to buy

**Acceptance Criteria**:
- [ ] User can add contacts/suppliers to system
- [ ] User can link contact to budget item
- [ ] User can add multiple supplier options per item
- [ ] System shows supplier comparison for item
- [ ] User can note prices from different vendors

### US-5: Share Moodboard for Feedback
**As a** cosplayer gathering inspiration  
**I want to** share my moodboard with friends  
**So that** I can get feedback on my ideas

**Acceptance Criteria**:
- [ ] User can generate shareable link to moodboard (unique URL)
- [ ] Anyone with link can view moodboard without creating account (public viewing)
- [ ] Viewers must use OAuth (Google, GitHub, etc.) to leave comments - no account signup required
- [ ] "Sign in with Google" button appears when user attempts to comment
- [ ] Comments show OAuth user's name and avatar from provider
- [ ] User receives notifications of new comments
- [ ] User can disable/revoke sharing anytime (link becomes invalid)
- [ ] No anonymous commenting (prevents spam, ensures accountability)
- [ ] Lightweight auth flow - one click to authenticate and comment

### US-6: Switch Between View Modes
**As a** cosplayer managing many inspiration items  
**I want to** view my moodboard in different formats (canvas, table, timeline, gallery, list)  
**So that** I can work in the way that best fits my current task

**Acceptance Criteria**:
- [ ] User can switch between 6 view modes via toolbar
- [ ] Canvas view preserves spatial positioning
- [ ] Table view shows columns: thumbnail, title, tags, type, created date, connections
- [ ] Timeline view organizes items chronologically
- [ ] Gallery view shows Pinterest-style grid (auto-arranged)
- [ ] List view shows compact rows with key metadata
- [ ] Graph view shows network of connections only
- [ ] Filters and tags work across all views
- [ ] Each view remembers its own state (sort, filters, zoom)
- [ ] View preference saved per user

### US-7: Use Table View for Quick Editing
**As a** cosplayer reviewing my inspiration collection  
**I want to** see all items in a table with inline editing  
**So that** I can quickly add tags, notes, and organize without opening each item

**Acceptance Criteria**:
- [ ] Table view shows all nodes in sortable, filterable table
- [ ] Columns: thumbnail, title/URL, tags, type, created, updated, connections count
- [ ] Inline editing of tags, title, short comments
- [ ] Click thumbnail to open full preview
- [ ] Sort by any column
- [ ] Multi-select rows for bulk actions (tag, delete)
- [ ] Export table as CSV

### US-8: Use Timeline to Track Progress
**As a** cosplayer building a project over time  
**I want to** see my inspiration and progress photos in chronological order  
**So that** I can track how my ideas evolved

**Acceptance Criteria**:
- [ ] Timeline view arranges items by created date
- [ ] **Default: Vertical timeline** (Pinterest-style scrolling, top to bottom)
- [ ] **Toggle to horizontal timeline** (left-to-right chronological axis)
- [ ] Toggle button in view toolbar to switch orientation
- [ ] Vertical mode: Items stacked vertically with date markers
- [ ] Horizontal mode: Items arranged along horizontal time axis
- [ ] Group by: day, week, month (works in both orientations)
- [ ] Show progress over time
- [ ] Click item to view details
- [ ] Filter timeline by tags or node type
- [ ] View preference saved per user

---

## Technical Approach

### Core Technology: @xyflow/svelte (Svelte Flow)

**Library Choice**: [@xyflow/svelte](https://svelteflow.dev/) - Node-based UI library for Svelte
- **Version**: Latest (actively maintained as of Jan 2026)
- **License**: MIT
- **Why Svelte Flow**:
  - Built specifically for Svelte with TypeScript support
  - Infinite canvas with zoom/pan out-of-the-box
  - Node and edge system (perfect for our Milanote + Obsidian hybrid)
  - Mobile-responsive with touch gesture support
  - DOM-based rendering (easier for embedded content like videos)
  - Includes: Background, Minimap, Controls, Panel components
  - Performance optimized for desktop, tablet, and mobile
  - Active community and documentation

**Installation**:
```bash
npm install @xyflow/svelte
```

**Key Features We'll Use**:
1. Custom node types for different content (image, video, note, budget, contact)
2. Edge connections with labels
3. Minimap for navigation
4. Background grid
5. Controls (zoom in/out, fit view)
6. Touch gestures (pinch zoom, pan, drag)
7. Selection and multi-select
8. Undo/redo (via state management)

### Phase 1: Foundation (MVP)
1. **Svelte Flow Integration**: Set up @xyflow/svelte with basic canvas
2. **Custom Node Types**: Create node components for images, notes, social media embeds
3. **View System Foundation**: View switcher component, state management for views
4. **Gallery View**: Simple Pinterest-style grid (easier than table, familiar UX)
5. **URL Parsing**: Service to extract metadata from social media URLs
6. **Data Model**: Create tables for moodboard_nodes, moodboard_edges, idea_options, budget_items, contacts
7. **Basic CRUD**: Add/remove nodes, create connections

### Phase 2: Core Features
1. **Multiple Options**: UI for managing options within ideas, option nodes on canvas
2. **Budget Itemization**: Budget item nodes with detailed breakdown, connect to contact nodes
3. **Contact Management**: Contact nodes, basic contact CRUD
4. **Edge Types**: Different connection types (shared resource, reference, alternative)
5. **Node Annotations**: Short comments and long notes on nodes

### Phase 3: Enhancements
1. **Additional Views**: Table view, List view, Timeline view
2. **Tag System**: Tag management, filtering, search (across all views)
3. **View State Persistence**: Remember user's view preferences, filters, sort order
4. **Wizard Flow**: Idea→Project conversion wizard
5. **Quick-Add Tools**: Bookmarklet, browser extension, keyboard shortcuts
6. **Character DB**: Integration with external API
7. **Tutorial Library**: Save and organize tutorials
8. **Progress Photos**: Upload and organize build photos

### Phase 4: Polish
1. **Sharing & Collaboration**: Moodboard sharing with comments
2. **Graph View**: Alternative view showing just connections (Obsidian-style)
3. **Event Integration**: Link ideas/projects to events
4. **Export Features**: PDF, image exports of canvas
5. **Fabric Lookup**: Material location tracking
6. **Real-time Collaboration**: Multi-user editing (future)

---

## UI Components Needed

### Svelte Flow Components

1. **MoodboardCanvas.svelte**: Main canvas wrapper using `<SvelteFlow>`
2. **Custom Node Types**:
   - **ImageNode.svelte**: Display images with tags, comments
   - **SocialMediaNode.svelte**: Embed Instagram/TikTok/YouTube with metadata
   - **TextNode.svelte**: Rich text notes
   - **BudgetItemNode.svelte**: Budget item card with pricing
   - **ContactNode.svelte**: Supplier/contact card
   - **ColorSwatchNode.svelte**: Color palette node (future)
3. **CustomEdge.svelte**: Custom edge component with labels
4. **CanvasControls.svelte**: Custom controls panel (zoom, fit, add node, etc.)
5. **NodeToolbar.svelte**: Toolbar that appears when node selected (edit, delete, connect)

### View Components

6. **ViewSwitcher.svelte**: Toolbar for switching between view modes
7. **MoodboardTableView.svelte**: Table/spreadsheet view of nodes
8. **MoodboardTimelineView.svelte**: Timeline visualization by date
9. **MoodboardGalleryView.svelte**: Pinterest-style grid (auto-arranged)
10. **MoodboardListView.svelte**: Compact list with metadata
11. **MoodboardGraphView.svelte**: Pure network graph (Obsidian-style, no content preview)

### Supporting Components

12. **AddContentModal.svelte**: Modal for adding new content (URL paste, upload, etc.)
13. **TagFilter.svelte**: Tag-based filtering sidebar (works across all views)
14. **OptionManager.svelte**: Manage multiple options within an idea
15. **BudgetItemizer.svelte**: Form for detailed budget breakdown
16. **IdeaConversionWizard.svelte**: Multi-step wizard for idea→project
17. **ContactManager.svelte**: CRUD interface for contacts
18. **ShareMoodboard.svelte**: Sharing controls and link generation
19. **TutorialLibrary.svelte**: Browse and manage saved tutorials

---

## Success Metrics

- **Engagement**: % of users who create at least one moodboard
- **Content Volume**: Average number of items per moodboard
- **View Usage**: Which views are most popular (Canvas vs Gallery vs Table vs Timeline vs List vs Graph)
- **View Switching**: How often users switch between views in a session
- **Mobile vs Desktop**: View preference by device type
- **Option Comparison**: % of ideas with multiple options
- **Budget Planning**: % of ideas with itemized budgets
- **Conversion Rate**: % of ideas converted to projects using wizard
- **Sharing**: % of moodboards shared with others
- **Time Savings**: Reduced time spent switching between apps (qualitative feedback)

---

## Open Questions & Future Considerations

1. **Moodboard Sharing**: Should shared boards require login to comment, or allow anonymous?
2. **Moodboard Copy**: When converting Idea→Project, copy moodboard items or share reference?
3. **Character DB**: Which API? AniList, MyAnimeList, custom?
4. **Tutorial Features**: Community tutorial sharing or personal library only?
5. **Fabric Lookup**: Personal database or community-shared resources?
6. **AI Features**: Auto-tagging images, budget estimation, difficulty rating suggestions?
7. **Reference Template**: Built-in tutorial showing all features - how to structure?

---

## Related Features

- **Feature 001**: Tasks (link moodboard items to specific build tasks)
- **Feature 003**: Modern Task UI (visual reference integration)
- **Current Idea System**: Major enhancement with options, budgets, moodboards
- **Current Project System**: Enhanced with moodboards, progress photos, idea references

---

## UI/UX Reference Collection (For Planning Phase)

**Objective**: During `/speckit.plan`, collect and analyze UI/UX references from existing tools to understand best practices, set user expectations, and identify proven patterns.

### Reference Categories to Collect

**1. Infinite Canvas / Moodboard Tools**
- **Milanote**: https://milanote.com
  - Study: Board layout, drag-and-drop UX, node types, connection UI
  - Focus: How they handle mobile vs desktop canvas interactions
  - Screenshot: Board view, node creation flow, sharing interface
- **Miro**: https://miro.com
  - Study: Zoom/pan performance, minimap design, real-time collaboration
  - Focus: Canvas controls, toolbar design, template system
- **Obsidian Canvas**: https://obsidian.md
  - Study: Node connections, graph view, relationship visualization
  - Focus: Edge styling, connection creation UX
- **FigJam**: https://figma.com/figjam
  - Study: Sticky note aesthetic, collaborative features
  - Focus: Commenting system, cursor presence
- **Notion Boards**: https://notion.so
  - Study: Multiple view switching, database views
  - Focus: Gallery, table, timeline view patterns

**2. Social Media Inspiration Tools**
- **Pinterest**: https://pinterest.com
  - Study: Grid layout, infinite scroll, pin interactions
  - Focus: Masonry grid performance, image loading, save workflow
- **Are.na**: https://are.na
  - Study: Block-based content organization, channel system
  - Focus: Multi-format content handling (images, links, text)
- **Raindrop.io**: https://raindrop.io
  - Study: Bookmark organization, metadata extraction, view modes
  - Focus: URL parsing results display, tag management
- **Cosmos**: https://cosmos.so
  - Study: Visual bookmarking, collections
  - Focus: Clean card design, hover states

**3. Timeline Visualizations**
- **Google Photos Timeline**: https://photos.google.com
  - Study: Chronological photo organization, date grouping
  - Focus: Vertical scroll with date markers, smooth performance
- **Facebook Timeline/Memories**: https://facebook.com
  - Study: Mixed content timeline, engagement patterns
  - Focus: Memory card design, "On This Day" features
- **Toggl Timeline**: https://toggl.com/track/timeline
  - Study: Horizontal timeline with items, zoom levels
  - Focus: Time-based positioning, interactive scrubbing

**4. Data Table Interfaces**
- **Airtable**: https://airtable.com
  - Study: Table view with rich content, inline editing
  - Focus: Cell types, quick actions, view customization
- **Linear**: https://linear.app
  - Study: Fast table performance, keyboard shortcuts
  - Focus: Row selection, bulk actions, filters
- **Notion Database**: https://notion.so
  - Study: Multi-view switching (table, board, timeline)
  - Focus: View state persistence, property visibility

**5. Budget/Finance Tools**
- **YNAB**: https://youneedabudget.com
  - Study: Budget itemization, category management
  - Focus: Transaction entry, budget vs actual comparison
- **Splitwise**: https://splitwise.com
  - Study: Expense tracking, person linking
  - Focus: Item-level detail, payment status
- **Mint**: https://mint.com
  - Study: Budget categories, spending visualization
  - Focus: Color coding, progress bars

**6. Sharing & Collaboration**
- **Figma Share Links**: https://figma.com
  - Study: Public sharing without account, commenting
  - Focus: Guest access UX, comment threads
- **Loom Share**: https://loom.com
  - Study: Shareable video links, emoji reactions
  - Focus: Engagement without friction
- **Google Docs Commenting**: https://docs.google.com
  - Study: Inline comments, suggestion mode
  - Focus: Comment attribution, notification system

**7. Mobile-First Canvas Tools**
- **Concepts App**: https://concepts.app
  - Study: Touch-optimized infinite canvas
  - Focus: Gesture controls, tool palettes
- **Paper by WeTransfer**: (discontinued but references available)
  - Study: Gesture-based creation
  - Focus: Minimalist UI, natural interactions
- **Procreate**: https://procreate.com
  - Study: Canvas manipulation, layer system
  - Focus: Pinch zoom, two-finger gestures

### Reference Deliverables (During Planning)

**For each reference, document**:
1. **Screenshot/Recording**: Key screens and interactions
2. **UX Pattern**: What makes it effective?
3. **User Expectation**: What will users expect based on this pattern?
4. **Adaptation**: How should we adapt this for our use case?
5. **Technical Note**: Library/approach used (if known)

**Example Documentation Format**:
```markdown
### Reference: Milanote Board View

**Screenshot**: [image]

**Pattern**: Freeform canvas with card-based nodes, drag-to-connect

**What Works**:
- Smooth 60fps zoom/pan even with 100+ items
- Clear visual feedback on drag (semi-transparent)
- Connection lines have bezier curves (feels natural)
- Minimap in bottom-right for navigation

**User Expectation**: 
- Users expect similar smooth performance
- Connection creation by dragging between nodes (not modal/menu)
- Right-click context menu for actions

**Our Adaptation**:
- Use Svelte Flow (similar architecture)
- Add edge labels (Milanote doesn't have this)
- Support touch gestures on mobile (Milanote is desktop-focused)

**Technical**: Uses custom canvas rendering, not DOM nodes (we'll use Svelte Flow's DOM approach for embeds)
```

### Competitive Analysis Matrix

Create comparison table during planning:

| Feature | Milanote | Miro | Pinterest | Notion | Our App |
|---------|----------|------|-----------|--------|---------|
| Infinite Canvas | ✅ | ✅ | ❌ | ❌ | ✅ |
| Node Connections | ✅ | ✅ | ❌ | ❌ | ✅ |
| Social Media Embeds | ❌ | ✅ | Native | ✅ | ✅ |
| Budget Tracking | ❌ | ❌ | ❌ | ✅ | ✅ |
| Timeline View | ❌ | ❌ | ❌ | ✅ | ✅ |
| Mobile Canvas | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Offline First | ❌ | ❌ | ❌ | ✅ | ✅ |

### User Expectation Audit

**Key Questions to Answer**:
1. When users see an "infinite canvas", what do they expect?
   - Based on: Milanote, Miro, FigJam, Notion Canvas
   - Expected: Zoom/pan, drag-drop, freeform positioning
   
2. When users paste an Instagram URL, what should happen?
   - Based on: Pinterest save pin, Are.na block, Notion embed
   - Expected: Instant preview, thumbnail extraction, platform icon
   
3. What does a "timeline view" look like?
   - Based on: Google Photos, Facebook, Notion timeline
   - Expected: Chronological scroll, date headers, grouping options
   
4. How should table inline editing work?
   - Based on: Airtable, Notion, Linear
   - Expected: Click to edit, Tab to next cell, auto-save
   
5. What's the standard for shareable links?
   - Based on: Figma, Loom, Google Docs
   - Expected: Copy link button, access toggle, revoke option

### Design System References

**Component Libraries to Study**:
- **Shadcn UI**: https://ui.shadcn.com (Modern, accessible components)
- **Radix UI**: https://radix-ui.com (Primitives for complex components)
- **Ark UI**: https://ark-ui.com (Headless components)
- **Melt UI**: https://melt-ui.com (Svelte-specific headless)

**Color/Theme Inspiration**:
- **Stripe**: https://stripe.com (Professional, clear hierarchy)
- **Linear**: https://linear.app (Dark mode excellence)
- **Vercel**: https://vercel.com (Clean, minimalist)

**Animation References**:
- **Framer Motion**: https://framer.com/motion (Smooth transitions)
- **Theatre.js**: https://theatrejs.com (Complex animations)
- **Lottie**: https://lottiefiles.com (Micro-interactions)

### Planning Phase Checklist

During `/speckit.plan`, ensure:
- [ ] Collected screenshots from at least 3 tools per category
- [ ] Documented UX patterns and user expectations
- [ ] Created competitive analysis matrix
- [ ] Identified 5-10 "must-have" patterns to replicate
- [ ] Noted 3-5 "avoid these" anti-patterns
- [ ] Listed specific animation/interaction details to copy
- [ ] Compiled color palette options from references
- [ ] Noted accessibility wins from reference tools

---

## Next Steps

1. ✅ **Refine specification** with user feedback
2. ✅ **Technical research** - Chose @xyflow/svelte as core library
3. **Run `/speckit.plan`** to create detailed implementation plan
   - **Critical**: Collect UI/UX references (see section above)
   - Document competitive analysis
   - Identify proven patterns to adopt
4. **Design mockups** for key UI components (canvas nodes, wizard, options manager)
   - Base on collected references
   - Ensure consistency with user expectations
5. **Prototype**: Build basic Svelte Flow canvas with one custom node type
6. **Run `/speckit.tasks`** to break down into actionable tasks
7. **Begin implementation** starting with Phase 1 (Foundation)

---

## Technical Dependencies

**NPM Packages**:
- `@xyflow/svelte` - Core infinite canvas library
- Social media URL parsing:
  - **Phase 1 (MVP)**: Generic metadata extraction
    - `oembed-parser` - oembed endpoint parser
    - `unfurl` or `metascraper` - Open Graph/Twitter Card parser
    - `link-preview-js` as additional fallback
  - **Phase 2 (Future)**: Official platform APIs (add as needed)
    - Instagram Graph API client (when richer data needed)
    - `@tiktok/tiktok-api` or equivalent
    - `youtube-api-v3-search` or official YouTube Data API client
    - Pinterest API client
- Image handling:
  - Already have Supabase Storage
  - Image optimization: `sharp` (server-side) or browser-native
- Rich text (for notes):
  - `tiptap` or `lexical` (future enhancement)
- OAuth for commenting:
  - `@supabase/auth-helpers` (supports Google, GitHub, etc.)
  - OAuth provider configuration in Supabase

**Research Needed**:
- **Phase 1 (MVP)**:
  - Best generic metadata extraction library (oembed-parser vs unfurl vs metascraper)
  - Reliability of Open Graph/Twitter Card parsing per platform
  - Embed policies for each platform (iframe embedding restrictions)
  - Mobile touch gesture optimization for Svelte Flow
  - Timeline visualization library supporting both vertical and horizontal layouts
  - Table component with inline editing (TanStack Table, svelte-headless-table)
  - OAuth provider setup in Supabase for lightweight guest commenting
- **Phase 2 (Future)**:
  - Instagram Graph API access requirements and rate limits (may require business account)
  - TikTok API availability for third-party apps
  - YouTube Data API quota limits
  - Pinterest API access and authentication flow
  - Real-time collaboration approach (Supabase Realtime, Yjs, etc.)

---

**Status**: 📝 READY FOR PLANNING - Specification complete with Svelte Flow, ready for `/speckit.plan`
