# Data Model: Application Stability and Quality Improvement

**Feature**: `004-bugfix-testing`  
**Date**: 2026-01-03  
**Purpose**: Document data model changes and new entities for bug fixes and enhancements

---

## Overview

This feature primarily fixes bugs and adds reliability enhancements. Most data models remain unchanged. This document focuses on:
1. **Minimal modifications** to existing entities (soft delete, ownership tracking)
2. **New entities** for character API integration and offline sync
3. **Supporting entities** for conflict resolution and caching

---

## Existing Entity Modifications

### 1. Task Entity

**Changes**: Add soft delete tracking and dependency counting

**Modified Fields**:
```typescript
interface Task {
  // ... existing fields (id, title, description, stage_id, priority, etc.)
  
  // NEW: Soft delete tracking
  deleted_at: string | null;        // ISO 8601 timestamp when deleted
  deleted_by: string | null;        // UUID of user who deleted
  
  // NEW: Cached dependency count (for deletion confirmation)
  dependency_count: number;         // Count of subtasks + resource links
}
```

**Rationale**:
- `deleted_at`: Enables soft delete for data recovery and audit trails
- `deleted_by`: Tracks who deleted for accountability
- `dependency_count`: Pre-computed count for fast deletion confirmation UI

**Database Migration**:
```sql
ALTER TABLE tasks
  ADD COLUMN deleted_at TIMESTAMPTZ,
  ADD COLUMN deleted_by UUID REFERENCES auth.users(id),
  ADD COLUMN dependency_count INTEGER DEFAULT 0;

-- Index for filtering non-deleted tasks
CREATE INDEX idx_tasks_not_deleted ON tasks(team_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Function to update dependency count
CREATE OR REPLACE FUNCTION update_task_dependency_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tasks
  SET dependency_count = (
    SELECT COUNT(*) FROM subtasks WHERE task_id = tasks.id
  ) + (
    SELECT COUNT(*) FROM task_resources WHERE task_id = tasks.id
  )
  WHERE id = NEW.task_id OR id = OLD.task_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update dependency count
CREATE TRIGGER task_dependency_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subtasks
  FOR EACH ROW EXECUTE FUNCTION update_task_dependency_count();

CREATE TRIGGER task_resource_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON task_resources
  FOR EACH ROW EXECUTE FUNCTION update_task_dependency_count();
```

**RLS Policy Updates**:
```sql
-- Update existing RLS policies to exclude deleted tasks
DROP POLICY IF EXISTS tasks_select ON tasks;
CREATE POLICY tasks_select ON tasks
  FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    AND deleted_at IS NULL
  );
```

---

### 2. Team Entity

**Changes**: Make ownership explicit and add transfer tracking

**Modified Fields**:
```typescript
interface Team {
  // ... existing fields (id, name, created_at, etc.)
  
  // MODIFY: Make owner_id explicit (was implicit via team_members with role='owner')
  owner_id: string;                 // UUID of current owner (NOT NULL)
  
  // NEW: Ownership transfer audit trail
  previous_owner_id: string | null; // UUID of previous owner
  ownership_transferred_at: string | null; // ISO 8601 timestamp of last transfer
}
```

**Rationale**:
- `owner_id`: Explicit ownership simplifies queries and prevents orphaned teams
- `previous_owner_id`: Audit trail for ownership history
- `ownership_transferred_at`: Timestamp for tracking transfer events

**Database Migration**:
```sql
-- Add new columns
ALTER TABLE teams
  ADD COLUMN owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN previous_owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN ownership_transferred_at TIMESTAMPTZ;

-- Migrate existing data: set owner_id from team_members with role='owner'
UPDATE teams t
SET owner_id = (
  SELECT user_id FROM team_members tm
  WHERE tm.team_id = t.id AND tm.role = 'owner'
  LIMIT 1
)
WHERE owner_id IS NULL;

-- Make owner_id required (after data migration)
ALTER TABLE teams
  ALTER COLUMN owner_id SET NOT NULL;

-- Index for owner queries
CREATE INDEX idx_teams_owner ON teams(owner_id);

-- Constraint: owner must be a team member
ALTER TABLE teams
  ADD CONSTRAINT teams_owner_must_be_member CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id AND tm.user_id = teams.owner_id
    )
  );
```

**RLS Policy Updates**:
```sql
-- Update team policies to check owner_id
DROP POLICY IF EXISTS teams_delete ON teams;
CREATE POLICY teams_delete ON teams
  FOR DELETE
  USING (owner_id = auth.uid());
```

---

### 3. User Entity

**Changes**: Track personal team creation

**Modified Fields**:
```typescript
interface User {
  // ... existing fields (id, email, created_at, etc.)
  
  // NEW: Reference to auto-created personal team
  personal_team_id: string | null;   // UUID of personal team (nullable for existing users)
}
```

**Rationale**:
- `personal_team_id`: Quick lookup for user's personal team
- Enables auto-creation during signup
- Nullable for backward compatibility with existing users

**Database Migration**:
```sql
-- Add column
ALTER TABLE users
  ADD COLUMN personal_team_id UUID REFERENCES teams(id);

-- Migrate existing data: find or create personal team
-- (Run as one-time migration script)
DO $$
DECLARE
  user_record RECORD;
  personal_team_id UUID;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Find existing personal team
    SELECT id INTO personal_team_id
    FROM teams
    WHERE owner_id = user_record.id
      AND name = (SELECT email FROM auth.users WHERE id = user_record.id) || '''s Team'
    LIMIT 1;
    
    -- Create if doesn't exist
    IF personal_team_id IS NULL THEN
      INSERT INTO teams (name, owner_id)
      VALUES ((SELECT email FROM auth.users WHERE id = user_record.id) || '''s Team', user_record.id)
      RETURNING id INTO personal_team_id;
      
      -- Add user as member
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (personal_team_id, user_record.id, 'owner');
    END IF;
    
    -- Update user record
    UPDATE users SET personal_team_id = personal_team_id WHERE id = user_record.id;
  END LOOP;
END $$;
```

---

## New Entities

### 4. Character Entity

**Purpose**: Store aggregated character data from multiple APIs

**Schema**:
```typescript
interface Character {
  id: string;                        // UUID (primary key)
  name: string;                      // Normalized character name
  series: string;                    // Series/franchise name
  description: string | null;        // Character description (merged from APIs)
  image_url: string | null;         // Best available image URL
  source_apis: string[];             // Array of API sources (e.g., ['myanimelist', 'anilist'])
  external_ids: {                    // JSONB object with external IDs
    myanimelist_id?: number;
    anilist_id?: number;
    igdb_id?: number;
    comicvine_id?: number;
    tmdb_id?: number;
  };
  metadata: Record<string, any>;     // JSONB object for API-specific data
  confidence_score: number;           // Deduplication confidence (0-1)
  created_at: string;                 // ISO 8601 timestamp
  updated_at: string;                 // ISO 8601 timestamp
}
```

**Database Schema**:
```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  series TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  source_apis TEXT[] NOT NULL DEFAULT '{}',
  external_ids JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_characters_name ON characters USING gin(name gin_trgm_ops); -- Trigram for fuzzy search
CREATE INDEX idx_characters_series ON characters(series);
CREATE INDEX idx_characters_source_apis ON characters USING gin(source_apis);
CREATE INDEX idx_characters_external_ids ON characters USING gin(external_ids);

-- RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Characters are team-scoped (linked via projects)
-- For now, allow all authenticated users to read (can be scoped later)
CREATE POLICY characters_select ON characters
  FOR SELECT
  USING (true); -- All authenticated users can search characters

-- Only system can create/update (via service layer)
CREATE POLICY characters_insert ON characters
  FOR INSERT
  WITH CHECK (false); -- Disable direct inserts, use service layer

CREATE POLICY characters_update ON characters
  FOR UPDATE
  USING (false); -- Disable direct updates, use service layer
```

**Relationships**:
- Characters are referenced by Projects (via `project.character_id`)
- Characters are not directly team-scoped (shared across teams for efficiency)
- Can be scoped to teams later if needed

---

### 5. SyncQueueItem Entity (IndexedDB)

**Purpose**: Local storage for offline operations queue

**Schema** (IndexedDB, not PostgreSQL):
```typescript
interface SyncQueueItem {
  id: string;                        // Local UUID (primary key)
  operation: 'create' | 'update' | 'delete';
  entity_type: 'task' | 'note' | 'team' | 'resource' | 'project';
  entity_id: string;                 // Server ID if exists, local UUID if not
  data: Record<string, any>;         // The change payload (JSON)
  timestamp: number;                  // When queued (Unix timestamp in ms)
  retry_count: number;               // Number of retry attempts (0-5)
  last_error: string | null;          // Last error message
  status: 'pending' | 'syncing' | 'failed' | 'completed' | 'conflict';
  server_version?: number;            // Server version timestamp for conflict detection
  conflict_data?: Record<string, any>; // Server version if conflict detected
}
```

**IndexedDB Schema** (via Dexie.js):
```typescript
// See research.md for full implementation
// Stored in browser IndexedDB, not PostgreSQL
```

**Relationships**:
- No database relationships (local-only storage)
- Linked to server entities via `entity_type` + `entity_id`
- Cleaned up after successful sync (7-day retention for audit)

---

### 6. APIResponseCache Entity (IndexedDB)

**Purpose**: Cache character API responses to reduce API calls

**Schema** (IndexedDB, not PostgreSQL):
```typescript
interface APIResponseCache {
  id: string;                        // Local UUID (primary key)
  query: string;                      // Search query (indexed)
  api_source: 'myanimelist' | 'anilist' | 'igdb' | 'comicvine' | 'tmdb';
  response: any;                     // Raw API response (JSON)
  cached_at: number;                 // Unix timestamp in ms
  ttl: number;                       // Time to live in ms (24 hours default)
}
```

**IndexedDB Schema**:
```typescript
// See research.md for full implementation
// Stored in browser IndexedDB, not PostgreSQL
```

**Cache Strategy**:
- TTL: 24 hours for character searches
- Key: `query + api_source`
- Auto-cleanup: Remove expired entries on app start
- Size limit: Max 1000 entries, LRU eviction

---

### 7. TeamOwnershipHistory Entity

**Purpose**: Audit trail for team ownership transfers

**Schema**:
```typescript
interface TeamOwnershipHistory {
  id: string;                        // UUID (primary key)
  team_id: string;                    // UUID (foreign key to teams)
  from_user_id: string;               // UUID of previous owner
  to_user_id: string;                 // UUID of new owner
  transferred_at: string;             // ISO 8601 timestamp
  transferred_by: string;             // UUID of user who initiated transfer (usually from_user_id)
}
```

**Database Schema**:
```sql
CREATE TABLE team_ownership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  transferred_at TIMESTAMPTZ DEFAULT NOW(),
  transferred_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_team_ownership_history_team ON team_ownership_history(team_id);
CREATE INDEX idx_team_ownership_history_user ON team_ownership_history(from_user_id, to_user_id);

-- RLS
ALTER TABLE team_ownership_history ENABLE ROW LEVEL SECURITY;

-- Only team members can view ownership history
CREATE POLICY team_ownership_history_select ON team_ownership_history
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );
```

**Relationships**:
- `team_id` → `teams.id` (CASCADE delete)
- `from_user_id` → `auth.users.id`
- `to_user_id` → `auth.users.id`
- `transferred_by` → `auth.users.id`

---

## Entity Relationships Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐         ┌──────────────┐
│  Team (owner)   │────────│ TeamMember   │
└──────┬──────────┘         └──────────────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│   Project   │
└──────┬──────┘
       │
       │ N:1 (optional)
       │
┌──────▼──────┐         ┌──────────────┐
│  Character  │◄────────│   Project    │
└─────────────┘         └──────────────┘
       │
       │ (referenced by)
       │
┌──────▼──────┐
│   Project   │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│    Task     │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│   Subtask   │
└─────────────┘

┌──────────────────┐
│ SyncQueueItem     │ (IndexedDB - local only)
│ APIResponseCache  │ (IndexedDB - local only)
└──────────────────┘

┌──────────────────────┐
│ TeamOwnershipHistory │
└──────────┬───────────┘
           │
           │ N:1
           │
    ┌──────▼──────┐
    │    Team     │
    └─────────────┘
```

---

## Validation Rules

### Task Entity
- `deleted_at` must be NULL or valid ISO 8601 timestamp
- `deleted_by` must be NULL or valid UUID referencing auth.users
- `dependency_count` must be >= 0
- If `deleted_at` is set, task should not appear in normal queries (filtered by RLS)

### Team Entity
- `owner_id` must NOT be NULL
- `owner_id` must reference a user who is a team member (enforced by constraint)
- `previous_owner_id` can be NULL (for teams that haven't been transferred)
- `ownership_transferred_at` can be NULL (for teams that haven't been transferred)

### User Entity
- `personal_team_id` can be NULL (for existing users before migration)
- If `personal_team_id` is set, must reference a valid team
- Team referenced by `personal_team_id` must have `owner_id = user.id`

### Character Entity
- `name` must NOT be NULL or empty
- `series` must NOT be NULL or empty
- `source_apis` must be non-empty array
- `confidence_score` must be between 0.0 and 1.0
- `external_ids` must be valid JSONB object

### SyncQueueItem (IndexedDB)
- `operation` must be one of: 'create', 'update', 'delete'
- `entity_type` must be one of valid entity types
- `status` must be one of: 'pending', 'syncing', 'failed', 'completed', 'conflict'
- `retry_count` must be between 0 and 5
- `timestamp` must be valid Unix timestamp in milliseconds

---

## State Transitions

### Task Deletion Flow
```
Task (active)
    │
    │ User clicks delete
    │
    ▼
Check dependency_count
    │
    ├─ dependency_count > 0 → Show confirmation dialog
    │                           │
    │                           │ User confirms
    │                           ▼
    │                      Set deleted_at, deleted_by
    │                           │
    │                           ▼
    └─ dependency_count = 0 → Task (soft deleted)
                                    │
                                    │ (hidden from queries)
                                    ▼
                              Task (archived)
```

### Team Ownership Transfer Flow
```
Team (owner: User A)
    │
    │ User A initiates transfer
    │
    ▼
Check: Are there other members?
    │
    ├─ No → Allow deletion (no transfer needed)
    │
    └─ Yes → Show transfer dialog
                │
                │ User A selects User B
                │
                ▼
            Atomic transaction:
                1. Update teams.owner_id = User B
                2. Update teams.previous_owner_id = User A
                3. Update teams.ownership_transferred_at = NOW()
                4. Insert into team_ownership_history
                5. Notify User B
                │
                ▼
            Team (owner: User B)
                │
                │ User A can now leave or delete
                ▼
            Team (deleted) OR Team (User A as member)
```

### Offline Sync Flow
```
User action (create/update/delete)
    │
    │ Network online?
    │
    ├─ Yes → Sync immediately
    │         │
    │         ├─ Success → Update UI
    │         │
    │         └─ Conflict → Show resolution dialog
    │
    └─ No → Add to SyncQueueItem (status: 'pending')
                │
                │ Network restored
                │
                ▼
            Process queue (FIFO)
                │
                ├─ Success → Mark 'completed', remove after 7 days
                │
                ├─ Conflict → Mark 'conflict', prompt user
                │
                └─ Failure → Increment retry_count
                                │
                                ├─ retry_count < 5 → Retry with backoff
                                │
                                └─ retry_count >= 5 → Mark 'failed', notify user
```

---

## Migration Strategy

### Phase 1: Add New Columns (Non-Breaking)
1. Add `deleted_at`, `deleted_by`, `dependency_count` to `tasks`
2. Add `owner_id`, `previous_owner_id`, `ownership_transferred_at` to `teams`
3. Add `personal_team_id` to `users`
4. Create `characters` table
5. Create `team_ownership_history` table

### Phase 2: Migrate Existing Data
1. Set `owner_id` for all existing teams (from team_members with role='owner')
2. Create personal teams for users without teams
3. Set `personal_team_id` for all users
4. Calculate initial `dependency_count` for all tasks

### Phase 3: Add Constraints
1. Make `owner_id` NOT NULL (after data migration)
2. Add constraint: owner must be team member
3. Add indexes for performance

### Phase 4: Update Application Code
1. Update queries to filter `deleted_at IS NULL`
2. Update team deletion flow to require ownership transfer
3. Add offline sync logic
4. Add character API integration

---

## Performance Considerations

### Indexes
- `idx_tasks_not_deleted`: Fast filtering of active tasks
- `idx_teams_owner`: Fast owner lookups
- `idx_characters_name`: Trigram index for fuzzy character search
- `idx_characters_source_apis`: GIN index for array queries

### Caching
- Character API responses: 24-hour TTL in IndexedDB
- Task dependency counts: Cached in database (updated via triggers)
- Team ownership: Cached in application state (rarely changes)

### Query Optimization
- Use `WHERE deleted_at IS NULL` in all task queries (indexed)
- Use `SELECT ... FOR UPDATE` for ownership transfers (prevent race conditions)
- Batch sync queue processing (10 items at a time)

---

## Security Considerations

### RLS Policies
- Tasks: Filter deleted tasks automatically
- Teams: Only owner can delete (after transfer)
- Characters: Read-only for all authenticated users (system creates)
- Team ownership history: Only team members can view

### Data Integrity
- Atomic ownership transfers (database transactions)
- Constraint: Owner must be team member
- Soft delete prevents accidental data loss
- Audit trail for all ownership transfers

### Offline Sync Security
- Sync queue items stored locally (IndexedDB)
- Server validates all operations (no trust in client data)
- Conflict resolution requires user confirmation
- Failed operations logged for review

---

## Future Enhancements

### Post-MVP
- Hard delete after 30 days (GDPR compliance)
- Character search scoped to teams (if needed)
- Advanced conflict resolution (three-way merge)
- Sync queue prioritization (user-defined priorities)
- Character image optimization (CDN caching)

---

**Data Model Status**: ✅ Complete - All entities defined with relationships, validation, and migration strategy



