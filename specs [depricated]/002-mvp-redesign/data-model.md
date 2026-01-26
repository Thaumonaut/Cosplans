# Data Model: MVP Cosplay Tracker Redesign

**Date**: 2025-10-30  
**Phase**: 1 (Data Model & Schema Design)  
**Purpose**: Complete database schema, relationships, constraints, and RLS policies

## Overview

This document defines the complete PostgreSQL schema for the MVP redesign, including all tables, relationships, indexes, constraints, and Row Level Security (RLS) policies. The schema supports team-based multi-tenancy with polymorphic entities (resources, tools) and hierarchical task tracking.

---

## Entity Relationship Diagram

```
┌──────────┐
│  users   │
└────┬─────┘
     │
     │ 1:N
     │
┌────▼────────┐
│team_members │
└────┬────────┘
     │ N:1
     │
┌────▼────┐      1:N      ┌──────────┐
│  teams  ├───────────────►│ projects │
└─────────┘                └────┬─────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    │ 1:N       │ 1:N       │ N:M
                    │           │           │
              ┌─────▼─┐   ┌─────▼─┐   ┌─────▼────────────┐
              │ tasks │   │ ideas │   │project_resources │
              └───────┘   └───────┘   └─────┬────────────┘
                                            │ N:1
                                            │
┌─────────┐      1:N      ┌────────────────▼┐
│  teams  ├───────────────►│   resources     │
└─────────┘                └─────────────────┘

┌─────────┐      1:N      ┌────────────────┐
│  teams  ├───────────────►│     tools      │
└─────────┘                └────────────────┘

┌─────────┐      1:N      ┌────────────────┐      1:N      ┌──────┐
│  teams  ├───────────────►│  photoshoots   ├───────────────►│ shots│
└─────────┘                └────────┬───────┘                └──────┘
                                    │
                                    │ N:M
                                    │
                           ┌────────▼────────────┐
                           │photoshoot_projects  │
                           └─────────────────────┘

┌──────────┐      1:N      ┌───────────┐
│  users   ├───────────────►│ comments  │
└──────────┘                └────┬──────┘
                                 │ N:1 (polymorphic)
                                 │
                      ┌──────────┼──────────┐
                      │          │          │
                      │          │          │
              ┌───────▼──┐  ┌────▼─────┐  ┌▼──────────┐
              │ projects │  │resources │  │photoshoots│
              └──────────┘  └──────────┘  └───────────┘
```

---

## Core Tables

### users

**Purpose**: User authentication and profile data (managed by Supabase Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Supabase auth user ID |
| email | TEXT | UNIQUE, NOT NULL | User email address |
| name | TEXT | | User display name |
| avatar_url | TEXT | | Profile image URL |
| bio | TEXT | | User biography |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last profile update |

**Indexes**:
- `PRIMARY KEY (id)` - B-tree index on id
- `UNIQUE INDEX idx_users_email ON users(email)` - Unique email lookup

**Notes**:
- This table is managed by Supabase Auth
- Additional profile fields stored here
- RLS policies applied

---

### teams

**Purpose**: Collaboration groups (personal or multi-user)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Team unique identifier |
| name | TEXT | NOT NULL | Team name |
| type | TEXT | NOT NULL, DEFAULT 'personal' | Team type: 'personal' or 'private' |
| created_by | UUID | NOT NULL, REFERENCES users(id) | Team creator (initial owner) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Team creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Constraints**:
- `CHECK (type IN ('personal', 'private'))` - Only two types for MVP

**Indexes**:
- `PRIMARY KEY (id)` - B-tree index on id
- `INDEX idx_teams_created_by ON teams(created_by)` - Creator lookup

**Notes**:
- Personal teams auto-created on user registration (1 user, 1 owner)
- Private teams require invitation
- Public teams deferred to Phase 3

---

### team_members

**Purpose**: Team membership and roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Membership ID |
| team_id | UUID | NOT NULL, REFERENCES teams(id) ON DELETE CASCADE | Team reference |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | User reference |
| role | TEXT | NOT NULL | Role: 'owner', 'editor', or 'viewer' |
| status | TEXT | NOT NULL, DEFAULT 'active' | Status: 'invited', 'active', 'inactive' |
| invited_by | UUID | REFERENCES users(id) | Who sent the invitation |
| invited_at | TIMESTAMPTZ | | Invitation timestamp |
| joined_at | TIMESTAMPTZ | | Acceptance timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation |

**Constraints**:
- `UNIQUE (team_id, user_id)` - One membership per user per team
- `CHECK (role IN ('owner', 'editor', 'viewer'))` - Valid roles only
- `CHECK (status IN ('invited', 'active', 'inactive'))` - Valid statuses

**Indexes**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_team_members_unique ON team_members(team_id, user_id)`
- `INDEX idx_team_members_user ON team_members(user_id)` - User's teams lookup
- `INDEX idx_team_members_team ON team_members(team_id)` - Team's members lookup

**Business Rules**:
- Every team must have at least one owner
- Cannot remove last owner without transferring ownership
- Personal teams always have exactly 1 member (owner)

---

### ideas

**Purpose**: Cosplay ideas and inspiration (pre-project)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Idea unique identifier |
| team_id | UUID | NOT NULL, REFERENCES teams(id) ON DELETE CASCADE | Owning team |
| character | TEXT | NOT NULL | Character name |
| series | TEXT | NOT NULL | Series/franchise name |
| description | TEXT | | Detailed description |
| difficulty | TEXT | NOT NULL | Difficulty: 'beginner', 'intermediate', 'advanced' |
| estimated_cost | DECIMAL(10, 2) | | Cost estimate in USD |
| images | TEXT[] | DEFAULT '{}' | Array of image URLs |
| tags | TEXT[] | DEFAULT '{}' | Searchable tags |
| notes | TEXT | | Additional notes |
| status | TEXT | NOT NULL, DEFAULT 'saved' | Status: 'saved' or 'converted' |
| converted_project_id | UUID | REFERENCES projects(id) | Linked project if converted |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))`
- `CHECK (status IN ('saved', 'converted'))`

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_ideas_team ON ideas(team_id)` - Team's ideas
- `INDEX idx_ideas_status ON ideas(team_id, status)` - Filter by status
- `INDEX idx_ideas_difficulty ON ideas(team_id, difficulty)` - Filter by difficulty
- `GIN INDEX idx_ideas_tags ON ideas USING gin(tags)` - Tag search
- `GIN INDEX idx_ideas_search ON ideas USING gin(to_tsvector('english', character || ' ' || series))` - Full-text search

**Trigger**:
```sql
CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### projects

**Purpose**: Active cosplay projects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Project unique identifier |
| team_id | UUID | NOT NULL, REFERENCES teams(id) ON DELETE CASCADE | Owning team |
| from_idea_id | UUID | REFERENCES ideas(id) | Source idea if converted |
| character | TEXT | NOT NULL | Character name |
| series | TEXT | NOT NULL | Series/franchise name |
| status | TEXT | NOT NULL | Status: 'planning', 'in-progress', 'completed', 'archived' |
| progress | INTEGER | DEFAULT 0, CHECK (progress >= 0 AND progress <= 100) | Progress percentage (0-100) |
| estimated_budget | DECIMAL(10, 2) | | Estimated budget |
| spent_budget | DECIMAL(10, 2) | DEFAULT 0 | Actual spending |
| deadline | DATE | | Project deadline |
| description | TEXT | | Project description |
| cover_image | TEXT | | Primary project image |
| reference_images | TEXT[] | DEFAULT '{}' | Reference image URLs |
| tags | TEXT[] | DEFAULT '{}' | Searchable tags |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `CHECK (status IN ('planning', 'in-progress', 'completed', 'archived'))`
- `CHECK (progress >= 0 AND progress <= 100)`
- `CHECK (spent_budget >= 0)`

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_projects_team ON projects(team_id)` - Team's projects
- `INDEX idx_projects_status ON projects(team_id, status)` - Filter by status
- `INDEX idx_projects_deadline ON projects(team_id, deadline)` - Deadline sorting
- `GIN INDEX idx_projects_tags ON projects USING gin(tags)`
- `GIN INDEX idx_projects_search ON projects USING gin(to_tsvector('english', character || ' ' || series))`

**Trigger**:
```sql
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### resources

**Purpose**: Polymorphic resource library (props, fabrics, wigs, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Resource unique identifier |
| team_id | UUID | NOT NULL, REFERENCES teams(id) ON DELETE CASCADE | Owning team |
| name | TEXT | NOT NULL | Resource name |
| description | TEXT | | Resource description |
| images | TEXT[] | DEFAULT '{}' | Image URLs (thumbnail, display, original) |
| cost | DECIMAL(10, 2) | | Resource cost |
| tags | TEXT[] | DEFAULT '{}' | Searchable tags |
| notes | TEXT | | Additional notes |
| metadata | JSONB | NOT NULL | Category-specific fields |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `CHECK ((metadata->>'category') IN ('prop', 'fabric', 'wig', 'pattern', 'costume-piece', 'accessory', 'material'))` - Valid categories

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_resources_team ON resources(team_id)` - Team's resources
- `INDEX idx_resources_category ON resources(team_id, (metadata->>'category'))` - Filter by category
- `GIN INDEX idx_resources_tags ON resources USING gin(tags)`
- `GIN INDEX idx_resources_search ON resources USING gin(to_tsvector('english', name))`

**Metadata Schema Examples**:

```json
// Prop
{
  "category": "prop",
  "dimensions": "12 x 8 x 4 inches",
  "weight": "2 lbs",
  "material": "EVA foam",
  "fragile": false,
  "requiresAssembly": true,
  "storageLocation": "Basement shelf 3"
}

// Fabric
{
  "category": "fabric",
  "fabricType": "Cotton",
  "color": "Royal Blue",
  "quantity": 3.5,
  "unit": "yards",
  "width": 60,
  "stretch": false,
  "washable": true
}

// Wig
{
  "category": "wig",
  "color": "Silver",
  "length": "waist-length",
  "style": "straight",
  "needsStyling": true,
  "laceType": "lace-front",
  "heatResistant": true
}
```

**Trigger**:
```sql
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### project_resources

**Purpose**: Many-to-many relationship between projects and resources

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Link ID |
| project_id | UUID | NOT NULL, REFERENCES projects(id) ON DELETE CASCADE | Project reference |
| resource_id | UUID | NOT NULL, REFERENCES resources(id) ON DELETE CASCADE | Resource reference |
| quantity | INTEGER | DEFAULT 1, CHECK (quantity > 0) | Quantity needed |
| status | TEXT | NOT NULL, DEFAULT 'needed' | Status: 'needed', 'acquired', 'in-progress', 'completed' |
| notes | TEXT | | Project-specific notes |
| added_at | TIMESTAMPTZ | DEFAULT NOW() | When linked |

**Constraints**:
- `UNIQUE (project_id, resource_id)` - One link per project-resource pair
- `CHECK (status IN ('needed', 'acquired', 'in-progress', 'completed'))`
- `CHECK (quantity > 0)`

**Indexes**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_project_resources_unique ON project_resources(project_id, resource_id)`
- `INDEX idx_project_resources_project ON project_resources(project_id)` - Project's resources
- `INDEX idx_project_resources_resource ON project_resources(resource_id)` - Resource usage

---

### tools

**Purpose**: Polymorphic tool/equipment library

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Tool unique identifier |
| team_id | UUID | NOT NULL, REFERENCES teams(id) ON DELETE CASCADE | Owning team |
| name | TEXT | NOT NULL | Tool name |
| description | TEXT | | Tool description |
| images | TEXT[] | DEFAULT '{}' | Image URLs |
| tags | TEXT[] | DEFAULT '{}' | Searchable tags |
| notes | TEXT | | Additional notes |
| metadata | JSONB | NOT NULL | Category-specific fields |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `CHECK ((metadata->>'category') IN ('crafting-tool', 'shoot-equipment'))`

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_tools_team ON tools(team_id)`
- `INDEX idx_tools_category ON tools(team_id, (metadata->>'category'))`
- `GIN INDEX idx_tools_tags ON tools USING gin(tags)`

**Metadata Schema Examples**:

```json
// Crafting Tool
{
  "category": "crafting-tool",
  "brand": "Dremel",
  "model": "4000-3/34",
  "purchaseDate": "2024-03-15",
  "purchasePrice": 89.99,
  "condition": "good",
  "storageLocation": "Workshop drawer 2",
  "manualUrl": "https://...",
  "warrantyExpires": "2026-03-15"
}

// Shoot Equipment
{
  "category": "shoot-equipment",
  "brand": "Neewer",
  "model": "18\" Ring Light",
  "owned": true,
  "rentalCost": null,
  "owner": null,
  "specifications": "18 inch diameter, 55W, 3200-5600K"
}
```

**Trigger**:
```sql
CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### tasks

**Purpose**: Task tracking (project-level and resource-level)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Task unique identifier |
| project_id | UUID | NOT NULL, REFERENCES projects(id) ON DELETE CASCADE | Project reference |
| resource_id | UUID | REFERENCES resources(id) ON DELETE CASCADE | Optional resource reference |
| title | TEXT | NOT NULL | Task title |
| description | TEXT | | Task description |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| due_date | DATE | | Task deadline |
| priority | TEXT | NOT NULL, DEFAULT 'medium' | Priority: 'low', 'medium', 'high' |
| assigned_to | UUID | REFERENCES users(id) | Assigned team member |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `CHECK (priority IN ('low', 'medium', 'high'))`

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_tasks_project ON tasks(project_id)` - Project's tasks
- `INDEX idx_tasks_resource ON tasks(resource_id)` - Resource-specific tasks
- `INDEX idx_tasks_assigned ON tasks(assigned_to)` - User's assigned tasks
- `INDEX idx_tasks_due_date ON tasks(due_date)` - Deadline sorting

**Business Rules**:
- Project-level tasks: `resource_id IS NULL`
- Resource-level tasks: `resource_id IS NOT NULL`
- Resource-level tasks contribute to resource progress calculation

**Trigger**:
```sql
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### photoshoots

**Purpose**: Photoshoot planning and execution

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Photoshoot unique identifier |
| team_id | UUID | NOT NULL, REFERENCES teams(id) ON DELETE CASCADE | Owning team |
| title | TEXT | NOT NULL | Photoshoot title |
| date | DATE | | Scheduled date |
| location | TEXT | | Shoot location |
| description | TEXT | | Photoshoot description |
| status | TEXT | NOT NULL, DEFAULT 'planning' | Status: 'planning', 'scheduled', 'completed' |
| notes | TEXT | | Additional notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `CHECK (status IN ('planning', 'scheduled', 'completed'))`

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_photoshoots_team ON photoshoots(team_id)`
- `INDEX idx_photoshoots_date ON photoshoots(team_id, date)` - Date sorting
- `INDEX idx_photoshoots_status ON photoshoots(team_id, status)`

**Trigger**:
```sql
CREATE TRIGGER update_photoshoots_updated_at
  BEFORE UPDATE ON photoshoots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### photoshoot_projects

**Purpose**: Many-to-many relationship between photoshoots and projects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Link ID |
| photoshoot_id | UUID | NOT NULL, REFERENCES photoshoots(id) ON DELETE CASCADE | Photoshoot reference |
| project_id | UUID | NOT NULL, REFERENCES projects(id) ON DELETE CASCADE | Project reference |
| added_at | TIMESTAMPTZ | DEFAULT NOW() | When linked |

**Constraints**:
- `UNIQUE (photoshoot_id, project_id)` - One link per photoshoot-project pair

**Indexes**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_photoshoot_projects_unique ON photoshoot_projects(photoshoot_id, project_id)`
- `INDEX idx_photoshoot_projects_photoshoot ON photoshoot_projects(photoshoot_id)`
- `INDEX idx_photoshoot_projects_project ON photoshoot_projects(project_id)`

---

### shots

**Purpose**: Shot list items for photoshoots

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Shot unique identifier |
| photoshoot_id | UUID | NOT NULL, REFERENCES photoshoots(id) ON DELETE CASCADE | Photoshoot reference |
| description | TEXT | NOT NULL | Shot description |
| pose | TEXT | | Pose notes/reference |
| reference_image | TEXT | | Reference image URL |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| final_photos | TEXT[] | DEFAULT '{}' | Final photo URLs |
| order_index | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_shots_photoshoot ON shots(photoshoot_id, order_index)` - Ordered shot list

---

### crew_members

**Purpose**: Crew assignments for photoshoots

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Crew member ID |
| photoshoot_id | UUID | NOT NULL, REFERENCES photoshoots(id) ON DELETE CASCADE | Photoshoot reference |
| name | TEXT | NOT NULL | Crew member name |
| role | TEXT | NOT NULL | Role: 'photographer', 'assistant', 'makeup', 'other' |
| contact | TEXT | | Contact information |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Constraints**:
- `CHECK (role IN ('photographer', 'assistant', 'makeup', 'other'))`

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_crew_members_photoshoot ON crew_members(photoshoot_id)`

---

### comments

**Purpose**: Comments on entities (polymorphic)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Comment unique identifier |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Comment author |
| entity_type | TEXT | NOT NULL | Entity type: 'idea', 'project', 'resource', 'tool', 'photoshoot' |
| entity_id | UUID | NOT NULL | Entity reference (polymorphic) |
| content | TEXT | NOT NULL | Comment text |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `CHECK (entity_type IN ('idea', 'project', 'resource', 'tool', 'photoshoot'))`

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_comments_entity ON comments(entity_type, entity_id)` - Entity's comments
- `INDEX idx_comments_user ON comments(user_id)` - User's comments

**Trigger**:
```sql
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS) Policies

### General Policy Pattern

All tables follow team-based access control:
1. **Owners**: Full access (SELECT, INSERT, UPDATE, DELETE)
2. **Editors**: Full content access except team management
3. **Viewers**: Read-only + comment ability

### RLS Policy Definitions

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE photoshoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE photoshoot_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's role in team
CREATE OR REPLACE FUNCTION get_user_team_role(team_uuid UUID, user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM team_members
  WHERE team_id = team_uuid AND user_id = user_uuid AND status = 'active'
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Users: Can only see and update own profile
CREATE POLICY users_select ON users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY users_update ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Teams: Can see teams they're a member of
CREATE POLICY teams_select ON teams
  FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Teams: Only owners can update/delete teams
CREATE POLICY teams_update ON teams
  FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

CREATE POLICY teams_delete ON teams
  FOR DELETE
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Team Members: Can see members of teams they belong to
CREATE POLICY team_members_select ON team_members
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members AS tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- Team Members: Only owners can manage membership
CREATE POLICY team_members_insert ON team_members
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

CREATE POLICY team_members_update ON team_members
  FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

CREATE POLICY team_members_delete ON team_members
  FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Content Tables (ideas, projects, resources, tools, photoshoots, tasks):
-- Viewers can SELECT, Editors can INSERT/UPDATE/DELETE, Owners can do everything

-- Example for projects (repeat pattern for all content tables)
CREATE POLICY projects_select ON projects
  FOR SELECT
  USING (
    get_user_team_role(team_id, auth.uid()) IN ('owner', 'editor', 'viewer')
  );

CREATE POLICY projects_insert ON projects
  FOR INSERT
  WITH CHECK (
    get_user_team_role(team_id, auth.uid()) IN ('owner', 'editor')
  );

CREATE POLICY projects_update ON projects
  FOR UPDATE
  USING (
    get_user_team_role(team_id, auth.uid()) IN ('owner', 'editor')
  );

CREATE POLICY projects_delete ON projects
  FOR DELETE
  USING (
    get_user_team_role(team_id, auth.uid()) IN ('owner', 'editor')
  );

-- Comments: Viewers can INSERT (comment), authors can UPDATE/DELETE own comments
CREATE POLICY comments_select ON comments
  FOR SELECT
  USING (
    entity_type = 'project' AND entity_id IN (
      SELECT id FROM projects
      WHERE get_user_team_role(team_id, auth.uid()) IN ('owner', 'editor', 'viewer')
    )
    OR entity_type = 'resource' AND entity_id IN (
      SELECT id FROM resources
      WHERE get_user_team_role(team_id, auth.uid()) IN ('owner', 'editor', 'viewer')
    )
    -- ... repeat for all entity types
  );

CREATE POLICY comments_insert ON comments
  FOR INSERT
  WITH CHECK (
    -- Can comment if have access to entity (any role)
    (entity_type = 'project' AND entity_id IN (
      SELECT id FROM projects
      WHERE get_user_team_role(team_id, auth.uid()) IN ('owner', 'editor', 'viewer')
    ))
    OR (entity_type = 'resource' AND entity_id IN (
      SELECT id FROM resources
      WHERE get_user_team_role(team_id, auth.uid()) IN ('owner', 'editor', 'viewer')
    ))
    -- ... repeat for all entity types
  );

CREATE POLICY comments_update ON comments
  FOR UPDATE
  USING (user_id = auth.uid())  -- Only own comments
  WITH CHECK (user_id = auth.uid());

CREATE POLICY comments_delete ON comments
  FOR DELETE
  USING (user_id = auth.uid());  -- Only own comments
```

---

## Utility Functions

### Update Timestamp Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Progress Calculation Function (PostgreSQL)

```sql
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  project_task_completion DECIMAL;
  resource_completion DECIMAL;
  total_resources INTEGER;
  result INTEGER;
BEGIN
  -- Calculate project-level task completion
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)),
    0
  ) INTO project_task_completion
  FROM tasks
  WHERE project_id = project_uuid AND resource_id IS NULL;
  
  -- Calculate resource completion (status + resource tasks)
  SELECT COUNT(*) INTO total_resources
  FROM project_resources
  WHERE project_id = project_uuid;
  
  IF total_resources > 0 THEN
    SELECT AVG(
      (
        CASE pr.status
          WHEN 'needed' THEN 0
          WHEN 'acquired' THEN 0.25
          WHEN 'in-progress' THEN 0.5
          WHEN 'completed' THEN 1.0
        END +
        COALESCE(
          (SELECT COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)
           FROM tasks
           WHERE resource_id = pr.resource_id),
          0
        )
      ) / 2
    ) INTO resource_completion
    FROM project_resources pr
    WHERE pr.project_id = project_uuid;
  ELSE
    resource_completion := 0;
  END IF;
  
  -- Hybrid calculation
  IF total_resources = 0 THEN
    result := ROUND(project_task_completion * 100);
  ELSIF NOT EXISTS (SELECT 1 FROM tasks WHERE project_id = project_uuid AND resource_id IS NULL) THEN
    result := ROUND(resource_completion * 100);
  ELSE
    result := ROUND(((project_task_completion + resource_completion) / 2) * 100);
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## Migration Strategy

### Migration Order

1. **Foundation**: users (Supabase managed), teams, team_members
2. **Content Base**: ideas, projects, resources, tools
3. **Relationships**: project_resources, tasks
4. **Events**: photoshoots, photoshoot_projects, shots, crew_members
5. **Social**: comments
6. **Utilities**: Triggers, functions, RLS policies

### Sample Migration Files

Located in `supabase/migrations/`:

- `20250000000000_initial_schema.sql` - Create users, teams, team_members
- `20250000000001_ideas_table.sql` - Create ideas table
- `20250000000002_projects_table.sql` - Create projects table
- `20250000000003_resources_table.sql` - Create resources table
- `20250000000004_tools_table.sql` - Create tools table
- `20250000000005_tasks_table.sql` - Create tasks table
- `20250000000006_photoshoots_table.sql` - Create photoshoots, shots, crew_members
- `20250000000007_teams_table.sql` - Create photoshoot_projects, project_resources
- `20250000000008_comments_table.sql` - Create comments table
- `20250000000009_rls_policies.sql` - Apply all RLS policies
- `20250000000010_utility_functions.sql` - Create triggers and functions

---

## Data Model Summary

**Total Tables**: 14
- Core: users, teams, team_members
- Content: ideas, projects, resources, tools, photoshoots
- Relationships: project_resources, photoshoot_projects, tasks, shots, crew_members
- Social: comments

**Total Indexes**: 40+ (including primary keys, foreign keys, and performance indexes)

**RLS Policies**: 50+ (covering all CRUD operations for all tables)

**Key Design Decisions**:
1. **Polymorphic Entities**: Resources and Tools use JSONB metadata for category-specific fields
2. **Team-Based Multi-Tenancy**: All content scoped to teams via RLS
3. **Hierarchical Tasks**: Tasks can be project-level or resource-level
4. **Progress Calculation**: Stored procedure for consistent hybrid calculation
5. **Soft Relationships**: Comments use polymorphic foreign keys (not enforced by DB)

**Phase 2 Considerations**:
- Split Resource/Tool tables if query performance degrades
- Add separate tables for conventions (events domain expansion)
- Add post-production tables (social media scheduling)
- Add notification tables for enhanced notification system
- Add activity log table for audit trail

---

## Next Steps

1. ✅ Data model complete
2. → Generate API contracts (OpenAPI schema)
3. → Generate quickstart.md (developer guide)
4. → Update agent context
5. → Proceed to Phase 2 (tasks breakdown)



