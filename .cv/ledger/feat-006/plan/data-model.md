# Data Model - Feature 006: Enhanced Brainstorming & Moodboarding

**Feature Branch**: `006-brainstorming-moodboard`
**Created**: 2026-01-08
**Status**: Planning Phase

---

## Entity Relationship Overview

```
ideas (1) ←──────┐
  ↓              │
  ├─→ moodboard_nodes (N) ←─── parent_id (self-referencing for piles)
  │      ↓      ↓
  │      │      └─→ moodboard_node_character_links (N) ← multi-character linking
  │      └─→ moodboard_edges (N) ← connects nodes
  │
  ├─→ idea_options (N)
  │      ↓
  │      └─→ budget_items (N) ←→ contacts (N)
  │
  ├─→ moodboard_shares (1)
  │      ↓
  │      └─→ moodboard_comments (N)
  │
  ├─→ moodboard_tab_state (N) ← per-user tab preferences
  │
  └─→ projects (N)
         ↑
         └─── references idea's moodboard via source_idea_id
```

---

## Core Entities

### 1. moodboard_nodes

**Purpose**: Store all canvas nodes (images, social media, notes, budget items, contacts)

**Schema**:
```sql
CREATE TABLE moodboard_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  node_type VARCHAR(50) NOT NULL CHECK (node_type IN (
    'social_media', 'image', 'link', 'note', 'swatch', 'budget_item', 'contact', 'sketch', 'pile'
  )),
  content_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  short_comment TEXT,
  long_note TEXT,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  width INTEGER DEFAULT 300,
  height INTEGER,
  z_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES moodboard_nodes(id) ON DELETE CASCADE,  -- For items inside piles
  is_expanded BOOLEAN DEFAULT TRUE,  -- For pile nodes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_moodboard_nodes_idea_id ON moodboard_nodes(idea_id);
CREATE INDEX idx_moodboard_nodes_node_type ON moodboard_nodes(node_type);
CREATE INDEX idx_moodboard_nodes_tags ON moodboard_nodes USING GIN(tags);
CREATE INDEX idx_moodboard_nodes_metadata ON moodboard_nodes USING GIN(metadata);
```

**Metadata Field Structure by Node Type**:

```typescript
// social_media
{
  platform: 'instagram' | 'tiktok' | 'pinterest' | 'youtube' | 'facebook',
  post_id: string,
  author: string,
  author_avatar?: string,
  caption?: string,
  publish_date?: string,
  embed_html?: string,
  extracted_at: string
}

// image
{
  original_filename: string,
  file_size: number,
  mime_type: string,
  dimensions: { width: number, height: number },
  storage_path: string
}

// link
{
  title: string,
  description?: string,
  site_name?: string,
  favicon?: string
}

// note
{
  rich_text?: string,  // Future: Tiptap JSON
  background_color?: string
}

// swatch
{
  color_hex: string,
  color_name?: string
}

// sketch
{
  drawing_data: string,  // Base64 encoded PNG or SVG path data
  template_type?: 'blank' | 'figure' | 'grid',
  dimensions: { width: number, height: number },
  storage_path: string,  // Supabase Storage path for saved PNG
  tool_settings?: {
    color: string,
    thickness: number
  }
}

// pile (expandable group)
{
  pile_name: string,
  pile_color?: string,  // For visual distinction
  child_count: number,  // Number of items in pile
  preview_thumbnails?: string[]  // Up to 4 child thumbnails for preview
}

// budget_item (references budget_items table)
{
  budget_item_id: string  // Foreign key to budget_items
}

// contact (references contacts table)
{
  contact_id: string  // Foreign key to contacts
}
```

**State Transitions**: None (nodes are static once created)

**Validation Rules**:
- `idea_id` must reference existing idea
- `node_type` must be from enum
- `position_x`, `position_y` required for canvas positioning
- `width` must be positive if specified
- For `social_media`: `metadata.platform` and `content_url` required
- For `image`: `thumbnail_url` and `metadata.storage_path` required

---

### 2. moodboard_edges

**Purpose**: Store connections between moodboard nodes

**Schema**:
```sql
CREATE TABLE moodboard_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  edge_type VARCHAR(50) NOT NULL CHECK (edge_type IN (
    'connection', 'reference', 'alternative', 'shared_resource', 'supplier_option'
  )),
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT chk_no_self_loops CHECK (source_node_id != target_node_id),
  CONSTRAINT chk_same_idea CHECK (
    (SELECT idea_id FROM moodboard_nodes WHERE id = source_node_id) = idea_id
    AND
    (SELECT idea_id FROM moodboard_nodes WHERE id = target_node_id) = idea_id
  )
);

CREATE INDEX idx_moodboard_edges_idea_id ON moodboard_edges(idea_id);
CREATE INDEX idx_moodboard_edges_source ON moodboard_edges(source_node_id);
CREATE INDEX idx_moodboard_edges_target ON moodboard_edges(target_node_id);
CREATE INDEX idx_moodboard_edges_type ON moodboard_edges(edge_type);
```

**Edge Type Semantics**:
- `connection`: Generic connection between any nodes
- `reference`: BudgetItemNode → ImageNode/SocialMediaNode (budget item references this inspiration)
- `supplier_option`: BudgetItemNode → ContactNode (contact is a supplier option)
- `shared_resource`: BudgetItemNode → OptionNode (budget item shared across options)
- `alternative`: Any → Any (alternative approach/choice)

**Validation Rules**:
- Both source and target must exist and belong to same idea
- No self-loops allowed
- Edge type must match semantic rules (e.g., supplier_option only between budget_item and contact nodes)

---

### 3. idea_options

**Purpose**: Store multiple costume options/variations within a single idea

**Schema**:
```sql
CREATE TABLE idea_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_idea_options_idea_id ON idea_options(idea_id);
```

**Validation Rules**:
- `idea_id` must reference existing idea
- `name` is required
- `difficulty` must be 1-5 if specified

---

### 4. budget_items

**Purpose**: Track itemized budget with dual representation (table + optional canvas node)

**Schema**:
```sql
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  option_id UUID REFERENCES idea_options(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  actual_cost DECIMAL(10, 2),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('need', 'want', 'nice_to_have')),
  is_shared BOOLEAN DEFAULT FALSE,
  notes TEXT,
  linked_node_id UUID REFERENCES moodboard_nodes(id) ON DELETE SET NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT chk_budget_item_context CHECK (
    (idea_id IS NOT NULL AND project_id IS NULL) OR
    (idea_id IS NULL AND project_id IS NOT NULL)
  )
);

CREATE INDEX idx_budget_items_idea_id ON budget_items(idea_id);
CREATE INDEX idx_budget_items_option_id ON budget_items(option_id);
CREATE INDEX idx_budget_items_project_id ON budget_items(project_id);
CREATE INDEX idx_budget_items_contact_id ON budget_items(contact_id);
CREATE INDEX idx_budget_items_linked_node_id ON budget_items(linked_node_id);
```

**Validation Rules**:
- Must belong to either idea OR project (not both, not neither)
- `item_name` and `estimated_cost` required
- `quantity` must be positive
- `priority` must be from enum
- `currency` must be valid ISO 4217 code
- If `linked_node_id` is set, that node must be type `budget_item`

**Sync with Canvas**:
- When budget item added to canvas: create moodboard_node with `metadata.budget_item_id`, set `budget_items.linked_node_id`
- When budget item updated: sync changes to linked moodboard_node metadata
- When canvas node deleted: set `budget_items.linked_node_id` to NULL (budget item persists)

---

### 5. contacts

**Purpose**: Store vendor/supplier/commissioner contact information

**Schema**:
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'commissioner', 'supplier', 'venue', 'photographer', 'other'
  )),
  email TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contacts_team_id ON contacts(team_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_is_favorite ON contacts(is_favorite);
```

**Social Media JSONB Structure**:
```json
{
  "instagram": "@username",
  "tiktok": "@username",
  "twitter": "@username",
  "facebook": "page-url"
}
```

**Validation Rules**:
- `team_id` and `name` required
- `type` must be from enum
- `rating` must be 1-5 if specified
- At least one contact method (email, website, or social_media) should be provided

---

### 6. moodboard_shares

**Purpose**: Manage public sharing of moodboards with unique tokens

**Schema**:
```sql
CREATE TABLE moodboard_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT chk_revoked_inactive CHECK (
    (is_active = FALSE AND revoked_at IS NOT NULL) OR
    (is_active = TRUE AND revoked_at IS NULL)
  )
);

CREATE UNIQUE INDEX idx_moodboard_shares_token ON moodboard_shares(share_token);
CREATE INDEX idx_moodboard_shares_idea_id ON moodboard_shares(idea_id);
CREATE INDEX idx_moodboard_shares_active ON moodboard_shares(is_active);
```

**Share Token Generation**:
```typescript
// Generate cryptographically secure random token
const shareToken = crypto.randomBytes(16).toString('hex'); // 32 character hex string
```

**State Transitions**:
```
Created (is_active=true, revoked_at=null)
   ↓ (user clicks "Disable Sharing")
Revoked (is_active=false, revoked_at=NOW())
```

**Validation Rules**:
- `share_token` must be unique and non-empty
- `idea_id` must reference existing idea
- When deactivating, `revoked_at` must be set

---

### 7. moodboard_comments

**Purpose**: Store comments from OAuth-authenticated users on shared moodboards

**Schema**:
```sql
CREATE TABLE moodboard_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  node_id UUID REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  oauth_provider VARCHAR(50) NOT NULL CHECK (oauth_provider IN (
    'google', 'github', 'facebook', 'microsoft'
  )),
  oauth_user_id TEXT NOT NULL,
  commenter_name TEXT NOT NULL,
  commenter_avatar TEXT,
  commenter_email TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT chk_comment_text_not_empty CHECK (LENGTH(TRIM(comment_text)) > 0)
);

CREATE INDEX idx_moodboard_comments_idea_id ON moodboard_comments(idea_id);
CREATE INDEX idx_moodboard_comments_node_id ON moodboard_comments(node_id);
CREATE INDEX idx_moodboard_comments_oauth_user ON moodboard_comments(oauth_provider, oauth_user_id);
CREATE INDEX idx_moodboard_comments_created_at ON moodboard_comments(created_at DESC);
```

**Comment Scoping**:
- `node_id` NULL: Comment on entire moodboard
- `node_id` set: Comment on specific node

**Validation Rules**:
- `oauth_provider` must be from enum
- `oauth_user_id`, `commenter_name`, `comment_text` required
- `comment_text` must not be empty or whitespace-only
- If `node_id` set, node must belong to the idea

---

### 8. moodboard_node_character_links

**Purpose**: Link moodboard nodes (resources) to multiple characters for multi-character cosplay planning

**Schema**:
```sql
CREATE TABLE moodboard_node_character_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES moodboard_nodes(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(node_id, character_name)
);

CREATE INDEX idx_node_character_links_node ON moodboard_node_character_links(node_id);
CREATE INDEX idx_node_character_links_character ON moodboard_node_character_links(character_name);
CREATE INDEX idx_node_character_links_idea ON moodboard_node_character_links(idea_id);
```

**Usage**:
- Resources can appear on multiple character tabs
- Example: Shared fabric swatch appears on both "Tanjiro" and "Inosuke" tabs
- Query: "Get all nodes for Tanjiro" includes nodes with character_name='Tanjiro' OR nodes on "All" tab with no character links
- Resources with no character links appear only on "All" (overview) tab

**Validation Rules**:
- `node_id` must reference existing moodboard node
- `character_name` required
- `idea_id` must match the node's idea_id
- A node can have zero (appears only on All tab) or many character links

---

### 9. moodboard_tab_state

**Purpose**: Persist user's tab navigation and view preferences per idea

**Schema**:
```sql
CREATE TABLE moodboard_tab_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active_character_tab TEXT,  -- NULL = "All" tab, otherwise character name
  active_variation_tab TEXT,  -- Variation/progress tab within character
  tab_order JSONB DEFAULT '[]'::jsonb,  -- Array of character names in user's preferred order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(idea_id, user_id)
);

CREATE UNIQUE INDEX idx_tab_state_idea_user ON moodboard_tab_state(idea_id, user_id);
```

**Tab Order JSONB Structure**:
```json
["Tanjiro", "Inosuke", "Zenitsu"]
```

**Validation Rules**:
- One record per user per idea
- `active_character_tab` NULL means "All" (overview) tab is active
- `tab_order` determines order of character tabs in UI

---

### 10. tutorials

**Purpose**: Store saved tutorials and patterns for reuse

**Schema**:
```sql
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  technique_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tutorials_team_id ON tutorials(team_id);
CREATE INDEX idx_tutorials_tags ON tutorials USING GIN(technique_tags);
CREATE INDEX idx_tutorials_rating ON tutorials(rating DESC NULLS LAST);
```

**Technique Tags Examples**: `armor`, `sewing`, `wig_styling`, `foam_crafting`, `thermoplastics`, `makeup`, `prop_making`

**Validation Rules**:
- `team_id`, `title`, `url` required
- `rating` must be 1-5 if specified
- `url` should be valid URL format

---

## Modified Entities

### ideas (existing table)

**New Columns**:
```sql
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS character_db_id TEXT;

CREATE INDEX idx_ideas_event_id ON ideas(event_id);
CREATE INDEX idx_ideas_character_db_id ON ideas(character_db_id);
```

**Note**: `title`, `character`, `series` already optional (from Feature 004 refactoring)

---

### projects (existing table)

**New Columns**:
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_option_id UUID REFERENCES idea_options(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;

CREATE INDEX idx_projects_source_idea_id ON projects(source_idea_id);
CREATE INDEX idx_projects_source_option_id ON projects(source_option_id);
CREATE INDEX idx_projects_event_id ON projects(event_id);
```

**Moodboard Access Pattern**:
```sql
-- Project accesses idea's moodboard via join
SELECT mn.* FROM moodboard_nodes mn
JOIN projects p ON p.source_idea_id = mn.idea_id
WHERE p.id = :project_id;
```

---

## Database Functions & Triggers

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_moodboard_nodes_updated_at BEFORE UPDATE ON moodboard_nodes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_idea_options_updated_at BEFORE UPDATE ON idea_options
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moodboard_comments_updated_at BEFORE UPDATE ON moodboard_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON tutorials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Sync budget item with canvas node

```sql
CREATE OR REPLACE FUNCTION sync_budget_item_to_canvas()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.linked_node_id IS NOT NULL THEN
    UPDATE moodboard_nodes
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{budget_item_id}',
      to_jsonb(NEW.id::text)
    ),
    updated_at = NOW()
    WHERE id = NEW.linked_node_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_budget_item_after_insert AFTER INSERT ON budget_items
FOR EACH ROW EXECUTE FUNCTION sync_budget_item_to_canvas();

CREATE TRIGGER sync_budget_item_after_update AFTER UPDATE ON budget_items
FOR EACH ROW EXECUTE FUNCTION sync_budget_item_to_canvas();
```

---

## Row Level Security (RLS) Policies

### moodboard_nodes

```sql
ALTER TABLE moodboard_nodes ENABLE ROW LEVEL SECURITY;

-- Users can view nodes for their team's ideas
CREATE POLICY moodboard_nodes_select_policy ON moodboard_nodes
FOR SELECT USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

-- Users can insert nodes for their team's ideas
CREATE POLICY moodboard_nodes_insert_policy ON moodboard_nodes
FOR INSERT WITH CHECK (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

-- Users can update/delete nodes for their team's ideas
CREATE POLICY moodboard_nodes_update_policy ON moodboard_nodes
FOR UPDATE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

CREATE POLICY moodboard_nodes_delete_policy ON moodboard_nodes
FOR DELETE USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);
```

### moodboard_shares

```sql
ALTER TABLE moodboard_shares ENABLE ROW LEVEL SECURITY;

-- Anyone can view active shares (for public sharing)
CREATE POLICY moodboard_shares_select_policy ON moodboard_shares
FOR SELECT USING (is_active = TRUE);

-- Only idea owner can create/manage shares
CREATE POLICY moodboard_shares_manage_policy ON moodboard_shares
FOR ALL USING (
  idea_id IN (SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);
```

### moodboard_comments

```sql
ALTER TABLE moodboard_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on shared moodboards
CREATE POLICY moodboard_comments_select_policy ON moodboard_comments
FOR SELECT USING (
  idea_id IN (
    SELECT idea_id FROM moodboard_shares WHERE is_active = TRUE
  ) OR
  idea_id IN (
    SELECT id FROM ideas WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);

-- Authenticated OAuth users can insert comments on shared boards
CREATE POLICY moodboard_comments_insert_policy ON moodboard_comments
FOR INSERT WITH CHECK (
  idea_id IN (SELECT idea_id FROM moodboard_shares WHERE is_active = TRUE)
);
```

---

## Query Patterns

### Get all nodes for an idea's moodboard

```sql
SELECT 
  mn.*,
  COUNT(DISTINCT mec.id) as connection_count
FROM moodboard_nodes mn
LEFT JOIN moodboard_edges mec ON (mn.id = mec.source_node_id OR mn.id = mec.target_node_id)
WHERE mn.idea_id = :idea_id
GROUP BY mn.id
ORDER BY mn.z_index ASC, mn.created_at ASC;
```

### Get budget summary for an idea option

```sql
SELECT 
  option_id,
  COUNT(*) as item_count,
  SUM(estimated_cost * quantity) as total_estimated,
  SUM(COALESCE(actual_cost, estimated_cost) * quantity) as total_actual,
  SUM(CASE WHEN is_shared THEN 0 ELSE estimated_cost * quantity END) as non_shared_cost
FROM budget_items
WHERE idea_id = :idea_id
GROUP BY option_id;
```

### Get project with source idea moodboard

```sql
SELECT 
  p.*,
  i.title as source_idea_title,
  json_agg(mn.*) as moodboard_nodes
FROM projects p
LEFT JOIN ideas i ON p.source_idea_id = i.id
LEFT JOIN moodboard_nodes mn ON mn.idea_id = p.source_idea_id
WHERE p.id = :project_id
GROUP BY p.id, i.id;
```

### Get comments with commenter info

```sql
SELECT 
  mc.*,
  COALESCE(mn.metadata->>'title', 'Entire moodboard') as comment_target
FROM moodboard_comments mc
LEFT JOIN moodboard_nodes mn ON mc.node_id = mn.id
WHERE mc.idea_id = :idea_id
ORDER BY mc.created_at DESC;
```

### Get nodes for a specific character tab

```sql
-- Get nodes for specific character (e.g., "Tanjiro")
SELECT DISTINCT mn.*
FROM moodboard_nodes mn
LEFT JOIN moodboard_node_character_links mncl ON mn.id = mncl.node_id
WHERE mn.idea_id = :idea_id
  AND (
    mncl.character_name = :character_name  -- Explicitly linked to this character
    OR (
      -- Also include nodes with no character links (appear on All tab only)
      -- but only if viewing "All" tab
      :character_name IS NULL 
      AND NOT EXISTS (
        SELECT 1 FROM moodboard_node_character_links 
        WHERE node_id = mn.id
      )
    )
  )
ORDER BY mn.z_index ASC, mn.created_at ASC;

-- Get "All" tab nodes (overview)
SELECT mn.*
FROM moodboard_nodes mn
WHERE mn.idea_id = :idea_id
  AND mn.parent_id IS NULL  -- Top-level nodes only, not inside piles
ORDER BY mn.z_index ASC, mn.created_at ASC;
```

### Get pile contents (children)

```sql
SELECT mn.*
FROM moodboard_nodes mn
WHERE mn.parent_id = :pile_node_id
ORDER BY mn.created_at ASC;
```

### Get user's tab state

```sql
SELECT *
FROM moodboard_tab_state
WHERE idea_id = :idea_id
  AND user_id = :user_id;
```

---

## Migration Strategy

### Phase 1: Core Tables
1. Create `moodboard_nodes` (with parent_id, is_expanded for piles)
2. Create `moodboard_edges`
3. Create `idea_options`, `budget_items`, `contacts`
4. Add foreign keys and indexes

### Phase 2: Sharing & Comments
1. Create `moodboard_shares`, `moodboard_comments`
2. Set up RLS policies
3. Create share token generation function

### Phase 3: Multi-Character & Navigation
1. Create `moodboard_node_character_links` (multi-character resource linking)
2. Create `moodboard_tab_state` (tab navigation persistence)
3. Add indexes for character queries

### Phase 4: Auxiliary Tables
1. Create `tutorials`
2. Modify `ideas` and `projects` tables
3. Create triggers and functions

### Phase 5: Data Migration (if needed)
1. Migrate existing budget data to new structure
2. Create default idea_option for ideas with single approach
3. Backfill metadata fields

---

## Data Integrity Constraints

1. **Referential Integrity**:
   - All foreign keys have ON DELETE CASCADE or SET NULL
   - Orphaned nodes prevented by CASCADE deletes

2. **Business Logic Constraints**:
   - Budget items belong to idea OR project (not both)
   - Edges only connect nodes within same idea
   - Share tokens are unique and cryptographically secure
   - Comments require valid OAuth user

3. **Performance Considerations**:
   - GIN indexes on JSONB and array columns
   - Indexes on all foreign keys
   - Indexes on frequently filtered columns (is_active, created_at)

---

## Scalability Notes

**Expected Data Volumes**:
- Moodboard nodes: ~50-200 per idea (per spec)
- Edges: ~100-400 per idea (2x nodes, approximate)
- Budget items: ~10-30 per option
- Comments: ~5-20 per shared moodboard

**Performance Optimization**:
- Partition `moodboard_nodes` by `idea_id` if grows beyond 100k rows
- Use materialized views for complex aggregations (budget summaries)
- Consider separate read replicas for public share views

**Storage Estimates**:
- Each node: ~1-2 KB (with metadata)
- Each edge: ~200 bytes
- 10,000 ideas with 100 nodes each: ~1-2 GB
- Thumbnail storage (Supabase Storage): External, not counted

---

## Status

✅ **Complete** - Data model defined with all entities, relationships, validation rules, and query patterns.
