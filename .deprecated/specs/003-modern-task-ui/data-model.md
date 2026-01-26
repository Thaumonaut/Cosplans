# Data Model: Modern Task Management UI

**Feature**: 003-modern-task-ui  
**Date**: 2025-11-03  
**Purpose**: Define database schema and entity relationships for modern task UI

This document provides complete database table definitions, relationships, indexes, constraints, and RLS policies for all new entities introduced by the modern task UI feature.

---

## Design Principles

1. **Additive Only**: No changes to existing `tasks` or `task_stages` tables
2. **Team Isolation**: All entities respect team boundaries via RLS
3. **Soft Deletes**: Comments use soft delete pattern to preserve conversation context
4. **Foreign Key Cascades**: Appropriate ON DELETE behaviors prevent orphaned data
5. **Performance**: Indexes on common query patterns (task_id, user_id, team_id)

---

## Entity Relationship Diagram

```
┌──────────┐
│  users   │
└────┬─────┘
     │
     ├──────── task_notifications (user_id)
     ├──────── task_comments (user_id, mentions)
     ├──────── task_attachments (uploaded_by)
     ├──────── saved_task_views (user_id)
     ├──────── task_labels (created_by)
     ├──────── task_label_assignments (assigned_by)
     ├──────── user_task_stats (user_id)
     └──────── task_breakdown_patterns (created_by)

┌──────────┐
│  teams   │
└────┬─────┘
     │
     ├──────── task_templates (team_id)
     ├──────── saved_task_views (team_id)
     ├──────── custom_field_definitions (team_id)
     ├──────── task_labels (team_id)
     ├──────── user_task_stats (team_id)
     └──────── task_breakdown_patterns (team_id)

┌──────────┐
│  tasks   │ (existing table, no changes)
└────┬─────┘
     │
     ├──────── subtasks (task_id)
     ├──────── task_comments (task_id)
     ├──────── task_attachments (task_id)
     ├──────── task_notifications (task_id)
     ├──────── task_custom_field_values (task_id)
     ├──────── task_label_assignments (task_id)
     └──────── task_stage_deadlines (task_id)

┌──────────────┐
│  task_stages │ (existing table, no changes)
└────┬─────────┘
     │
     └──────── task_stage_deadlines (stage_id)

┌────────────────────────────┐
│ custom_field_definitions   │
└────────────┬───────────────┘
             │
             └──────── task_custom_field_values (field_definition_id)

┌──────────────┐
│  task_labels │
└────┬─────────┘
     │
     └──────── task_label_assignments (label_id)
```

---

## Database Tables

### 1. subtasks

**Purpose**: Child checklist items under parent tasks for breaking down work into smaller steps.

**Table Definition**:

```sql
CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subtasks_display_order_check CHECK (display_order >= 0)
);
```

**Indexes**:

```sql
CREATE INDEX idx_subtasks_task_id ON public.subtasks(task_id, display_order);
CREATE INDEX idx_subtasks_task_completed ON public.subtasks(task_id, completed);
```

**Constraints**:
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE - Deleting task deletes all subtasks
- `display_order >= 0` - Ensures logical ordering
- `title` NOT NULL - Every subtask must have a title

**Business Rules**:
- Subtasks ordered by `display_order` within parent task
- Completion percentage calculated from completed vs total subtasks
- Maximum 50 subtasks per task (enforced application-side for UX)
- No nested subtasks (single level only)

**RLS Policies**:

```sql
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view subtasks for tasks in their teams
CREATE POLICY subtasks_select ON public.subtasks FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- INSERT: Users must be team member to create subtasks
CREATE POLICY subtasks_insert ON public.subtasks FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- UPDATE: Users must be team member to update subtasks
CREATE POLICY subtasks_update ON public.subtasks FOR UPDATE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- DELETE: Users must be team member to delete subtasks
CREATE POLICY subtasks_delete ON public.subtasks FOR DELETE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);
```

**TypeScript Interface**:

```typescript
export interface Subtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface SubtaskCreate {
  taskId: string
  title: string
  displayOrder?: number
}

export interface SubtaskUpdate {
  title?: string
  completed?: boolean
  displayOrder?: number
}
```

---

### 2. task_comments

**Purpose**: Comments and discussion on tasks with @mentions for collaboration.

**Table Definition**:

```sql
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT ARRAY[]::UUID[], -- Array of user IDs mentioned
  deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete flag
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id, created_at DESC);
CREATE INDEX idx_task_comments_user_id ON public.task_comments(user_id);
CREATE INDEX idx_task_comments_mentions ON public.task_comments USING GIN(mentions);
```

**Constraints**:
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE
- `user_id` REFERENCES `auth.users(id)` ON DELETE CASCADE
- `content` NOT NULL - Cannot post empty comment
- `deleted` DEFAULT FALSE - Soft delete pattern

**Business Rules**:
- Soft delete: Set `deleted = TRUE` instead of removing row
- Deleted comments show "[Comment deleted]" placeholder
- Only comment author can edit/delete (enforced in application layer)
- @mentions stored as UUID array for efficient querying
- @mentions trigger notifications to mentioned users
- Maximum 10,000 characters per comment (enforced application-side)

**RLS Policies**:

```sql
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view comments on tasks in their teams (including deleted for context)
CREATE POLICY task_comments_select ON public.task_comments FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- INSERT: Users must be team member to comment
CREATE POLICY task_comments_insert ON public.task_comments FOR INSERT WITH CHECK (
  user_id = (SELECT auth.uid())
  AND task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- UPDATE: Only comment author can edit (and only content/mentions)
CREATE POLICY task_comments_update ON public.task_comments FOR UPDATE USING (
  user_id = (SELECT auth.uid())
) WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- DELETE: Only comment author can delete (soft delete - sets deleted flag)
CREATE POLICY task_comments_delete ON public.task_comments FOR DELETE USING (
  user_id = (SELECT auth.uid())
);
```

**TypeScript Interface**:

```typescript
export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[] // Array of user IDs
  deleted: boolean
  createdAt: string
  updatedAt: string
  
  // Populated from joins (not in DB)
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TaskCommentCreate {
  taskId: string
  content: string
  mentions?: string[]
}

export interface TaskCommentUpdate {
  content: string
  mentions?: string[]
}
```

---

### 3. task_attachments

**Purpose**: File attachments (documents, images, archives) linked to tasks.

**Table Definition**:

```sql
CREATE TABLE public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- Size in bytes
  mime_type TEXT NOT NULL,
  storage_url TEXT NOT NULL, -- Cloudflare R2 URL
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_attachments_file_size_check CHECK (file_size > 0 AND file_size <= 26214400) -- Max 25MB
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_attachments_task_id ON public.task_attachments(task_id, created_at DESC);
CREATE INDEX idx_task_attachments_uploaded_by ON public.task_attachments(uploaded_by);
```

**Constraints**:
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE
- `uploaded_by` REFERENCES `auth.users(id)` ON DELETE CASCADE
- `file_size` between 1 and 26214400 bytes (25MB limit)
- All fields NOT NULL

**Business Rules**:
- Files stored in Cloudflare R2 bucket: `task-attachments`
- Storage path pattern: `{teamId}/{taskId}/{timestamp}-{filename}`
- Signed URLs generated on-demand (1 hour expiry)
- Deletion removes both DB record and R2 file
- Supported MIME types: documents (PDF, DOCX), images (JPG, PNG, GIF, WEBP), archives (ZIP)
- Maximum 20 attachments per task (enforced application-side)

**RLS Policies**:

```sql
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view attachments for tasks in their teams
CREATE POLICY task_attachments_select ON public.task_attachments FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- INSERT: Users must be team member to upload attachments
CREATE POLICY task_attachments_insert ON public.task_attachments FOR INSERT WITH CHECK (
  uploaded_by = (SELECT auth.uid())
  AND task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- DELETE: Only uploader or task assignee can delete attachments
CREATE POLICY task_attachments_delete ON public.task_attachments FOR DELETE USING (
  uploaded_by = (SELECT auth.uid())
  OR task_id IN (
    SELECT id FROM public.tasks
    WHERE assigned_to = (SELECT auth.uid())
  )
);
```

**TypeScript Interface**:

```typescript
export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileSize: number // bytes
  mimeType: string
  storageUrl: string
  uploadedBy: string
  createdAt: string
  
  // Populated from joins (not in DB)
  uploader?: {
    id: string
    name: string
  }
  signedUrl?: string // Generated on-demand
}

export interface TaskAttachmentCreate {
  taskId: string
  fileName: string
  fileSize: number
  mimeType: string
  storageUrl: string
}
```

---

### 4. task_notifications

**Purpose**: In-app notification events for task assignments, @mentions, comments, status changes.

**Table Definition**:

```sql
CREATE TABLE public.task_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'assignment', 'mention', 'comment', 'status_change'
  message TEXT NOT NULL, -- Human-readable notification text
  read BOOLEAN NOT NULL DEFAULT FALSE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who triggered the notification
  metadata JSONB DEFAULT '{}'::JSONB, -- Additional context (e.g., old/new values for status_change)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_notifications_event_type_check CHECK (
    event_type IN ('assignment', 'mention', 'comment', 'status_change')
  )
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_notifications_user_id ON public.task_notifications(user_id, created_at DESC);
CREATE INDEX idx_task_notifications_user_read ON public.task_notifications(user_id, read, created_at DESC);
CREATE INDEX idx_task_notifications_task_id ON public.task_notifications(task_id);
```

**Constraints**:
- `user_id` REFERENCES `auth.users(id)` ON DELETE CASCADE
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE
- `event_type` IN ('assignment', 'mention', 'comment', 'status_change')
- All core fields NOT NULL except `actor_user_id` (nullable for system events)

**Business Rules**:
- Notifications created via trigger or application code
- Email notifications sent asynchronously via Edge Function (FR-086 to FR-095)
- Unread count calculated from `read = FALSE` AND `user_id = current_user`
- Notifications auto-deleted after 90 days (cleanup job)
- User notification preferences stored in `users` table (separate concern)
- No notification for user's own actions (e.g., don't notify me when I comment)

**Event Types and Messages**:

| Event Type | Example Message | Triggered By |
|------------|-----------------|--------------|
| assignment | "Alice assigned you to 'Buy fabric'" | Task `assigned_to` field changes |
| mention | "Bob mentioned you in a comment" | @mention in comment content |
| comment | "Charlie commented on 'Buy fabric'" | New comment added |
| status_change | "Diana moved 'Buy fabric' to Done" | Task `stage_id` changes |

**RLS Policies**:

```sql
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only view their own notifications
CREATE POLICY task_notifications_select ON public.task_notifications FOR SELECT USING (
  user_id = (SELECT auth.uid())
);

-- INSERT: System/application creates notifications (no direct user INSERT)
-- Enforced via application layer, not RLS

-- UPDATE: Users can only mark their own notifications as read
CREATE POLICY task_notifications_update ON public.task_notifications FOR UPDATE USING (
  user_id = (SELECT auth.uid())
) WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- DELETE: Users can delete their own notifications (dismiss)
CREATE POLICY task_notifications_delete ON public.task_notifications FOR DELETE USING (
  user_id = (SELECT auth.uid())
);
```

**TypeScript Interface**:

```typescript
export type NotificationEventType = 'assignment' | 'mention' | 'comment' | 'status_change'

export interface TaskNotification {
  id: string
  userId: string
  taskId: string
  eventType: NotificationEventType
  message: string
  read: boolean
  actorUserId: string | null
  metadata: Record<string, any>
  createdAt: string
  
  // Populated from joins (not in DB)
  task?: {
    id: string
    title: string
  }
  actor?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TaskNotificationCreate {
  userId: string
  taskId: string
  eventType: NotificationEventType
  message: string
  actorUserId?: string
  metadata?: Record<string, any>
}
```

---

### 5. task_templates

**Purpose**: Reusable task patterns for common workflows (e.g., "Convention Packing List", "Photoshoot Prep").

**Table Definition**:

```sql
CREATE TABLE public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_stage_id UUID REFERENCES public.task_stages(id) ON DELETE SET NULL,
  default_priority TEXT DEFAULT 'medium',
  subtasks JSONB DEFAULT '[]'::JSONB, -- Array of subtask objects: [{ title, order }, ...]
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_templates_priority_check CHECK (
    default_priority IN ('low', 'medium', 'high')
  ),
  CONSTRAINT task_templates_team_name_unique UNIQUE (team_id, name)
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_templates_team_id ON public.task_templates(team_id, name);
CREATE INDEX idx_task_templates_created_by ON public.task_templates(created_by);
```

**Constraints**:
- `team_id` REFERENCES `teams(id)` ON DELETE CASCADE
- `UNIQUE (team_id, name)` - Template names unique within team
- `default_priority` IN ('low', 'medium', 'high')

**Business Rules**:
- Templates are team-scoped (not global)
- Applying template creates new task + subtasks with template defaults
- Subtasks stored as JSONB array: `[{ title: "Check costume", order: 0 }, ...]`
- Templates can be created from existing tasks ("Save as Template" feature)
- Maximum 50 templates per team (enforced application-side)

**Subtasks JSON Schema**:

```json
[
  { "title": "Check costume pieces", "order": 0 },
  { "title": "Pack makeup kit", "order": 1 },
  { "title": "Prepare props", "order": 2 }
]
```

**RLS Policies**:

```sql
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- SELECT: Team members can view team templates
CREATE POLICY task_templates_select ON public.task_templates FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- INSERT: Team members can create templates
CREATE POLICY task_templates_insert ON public.task_templates FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- UPDATE: Template creator or team owner/editor can update
CREATE POLICY task_templates_update ON public.task_templates FOR UPDATE USING (
  created_by = (SELECT auth.uid())
  OR team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- DELETE: Template creator or team owner can delete
CREATE POLICY task_templates_delete ON public.task_templates FOR DELETE USING (
  created_by = (SELECT auth.uid())
  OR team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role = 'owner'
    AND COALESCE(status, 'active') = 'active'
  )
);
```

**TypeScript Interface**:

```typescript
export interface TaskTemplateSubtask {
  title: string
  order: number
}

export interface TaskTemplate {
  id: string
  teamId: string
  name: string
  description?: string
  defaultStageId?: string
  defaultPriority: 'low' | 'medium' | 'high'
  subtasks: TaskTemplateSubtask[]
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface TaskTemplateCreate {
  teamId: string
  name: string
  description?: string
  defaultStageId?: string
  defaultPriority?: 'low' | 'medium' | 'high'
  subtasks?: TaskTemplateSubtask[]
}

export interface TaskTemplateUpdate {
  name?: string
  description?: string
  defaultStageId?: string
  defaultPriority?: 'low' | 'medium' | 'high'
  subtasks?: TaskTemplateSubtask[]
}
```

---

### 6. saved_task_views

**Purpose**: User-saved filter combinations for quick access to custom task views.

**Table Definition**:

```sql
CREATE TABLE public.saved_task_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::JSONB, -- TaskFilters object
  grouping TEXT NOT NULL DEFAULT 'stage',
  view_mode TEXT NOT NULL DEFAULT 'list',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT saved_task_views_grouping_check CHECK (
    grouping IN ('stage', 'priority', 'project', 'assignee', 'dueDate')
  ),
  CONSTRAINT saved_task_views_view_mode_check CHECK (
    view_mode IN ('list', 'board', 'calendar', 'timeline')
  ),
  CONSTRAINT saved_task_views_user_team_name_unique UNIQUE (user_id, team_id, name)
);
```

**Indexes**:

```sql
CREATE INDEX idx_saved_task_views_user_team ON public.saved_task_views(user_id, team_id);
```

**Constraints**:
- `user_id` REFERENCES `auth.users(id)` ON DELETE CASCADE
- `team_id` REFERENCES `teams(id)` ON DELETE CASCADE
- `UNIQUE (user_id, team_id, name)` - View names unique per user per team
- `grouping` IN ('stage', 'priority', 'project', 'assignee', 'dueDate')
- `view_mode` IN ('list', 'board', 'calendar', 'timeline')

**Business Rules**:
- Saved views are user-specific (not shared with team)
- Filters stored as JSONB for flexibility
- Maximum 20 saved views per user per team (enforced application-side)
- Default view (if user has one) indicated by separate user preference (not in this table)

**Filters JSON Schema**:

```json
{
  "stages": ["stage-id-1", "stage-id-2"],
  "priorities": ["high", "medium"],
  "assignees": ["user-id-1"],
  "projects": ["project-id-1"],
  "dateRange": { "start": "2025-11-01", "end": "2025-11-30" },
  "tags": ["urgent", "shopping"],
  "includeArchived": false
}
```

**RLS Policies**:

```sql
ALTER TABLE public.saved_task_views ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only view their own saved views
CREATE POLICY saved_task_views_select ON public.saved_task_views FOR SELECT USING (
  user_id = (SELECT auth.uid())
);

-- INSERT: Users can create their own saved views (must be team member)
CREATE POLICY saved_task_views_insert ON public.saved_task_views FOR INSERT WITH CHECK (
  user_id = (SELECT auth.uid())
  AND team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- UPDATE: Users can only update their own saved views
CREATE POLICY saved_task_views_update ON public.saved_task_views FOR UPDATE USING (
  user_id = (SELECT auth.uid())
) WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- DELETE: Users can only delete their own saved views
CREATE POLICY saved_task_views_delete ON public.saved_task_views FOR DELETE USING (
  user_id = (SELECT auth.uid())
);
```

**TypeScript Interface**:

```typescript
export interface SavedTaskViewFilters {
  stages?: string[]
  priorities?: ('low' | 'medium' | 'high')[]
  assignees?: string[]
  projects?: string[]
  dateRange?: { start: string; end: string }
  tags?: string[]
  includeArchived?: boolean
}

export interface SavedTaskView {
  id: string
  userId: string
  teamId: string
  name: string
  filters: SavedTaskViewFilters
  grouping: 'stage' | 'priority' | 'project' | 'assignee' | 'dueDate'
  viewMode: 'list' | 'board' | 'calendar' | 'timeline'
  createdAt: string
  updatedAt: string
}

export interface SavedTaskViewCreate {
  teamId: string
  name: string
  filters: SavedTaskViewFilters
  grouping?: string
  viewMode?: string
}

export interface SavedTaskViewUpdate {
  name?: string
  filters?: SavedTaskViewFilters
  grouping?: string
  viewMode?: string
}
```

---

### 7. custom_field_definitions

**Purpose**: Team-specific custom field schema definitions allowing teams to extend task data with domain-specific fields.

**Table Definition**:

```sql
CREATE TABLE public.custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  default_value TEXT,
  options JSONB DEFAULT '{}'::JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  show_on_card BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT custom_field_definitions_field_type_check CHECK (
    field_type IN ('text', 'textarea', 'number', 'currency', 'dropdown', 'multi-select', 'checkbox', 'date', 'url', 'email')
  ),
  CONSTRAINT custom_field_definitions_team_name_unique UNIQUE (team_id, field_name)
);
```

**Indexes**:

```sql
CREATE INDEX idx_custom_field_definitions_team_id ON public.custom_field_definitions(team_id, display_order);
CREATE INDEX idx_custom_field_definitions_show_on_card ON public.custom_field_definitions(team_id, show_on_card) WHERE show_on_card = TRUE;
```

**Constraints**:
- `team_id` REFERENCES `teams(id)` ON DELETE CASCADE - Deleting team deletes all custom field definitions
- `field_type` must be one of 10 supported types
- `field_name` unique per team
- `display_order >= 0` - Ensures logical ordering

**Business Rules**:
- Maximum 20 custom field definitions per team (enforced application-side)
- Field definitions ordered by `display_order` within team
- `options` JSONB stores:
  - For dropdown/multi-select: Array of choice strings
  - For currency: Default currency code (ISO 4217)
  - For number: Optional min/max values
- `show_on_card` controls whether field appears on task cards in list/board view
- Deleting a field definition CASCADE deletes all `task_custom_field_values` for that field

**RLS Policies**:

```sql
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view custom field definitions for their teams
CREATE POLICY custom_field_definitions_select ON public.custom_field_definitions FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Only team owners/admins can create custom field definitions
CREATE POLICY custom_field_definitions_insert ON public.custom_field_definitions FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- UPDATE: Only team owners/admins can update custom field definitions
CREATE POLICY custom_field_definitions_update ON public.custom_field_definitions FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
) WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- DELETE: Only team owners/admins can delete custom field definitions
CREATE POLICY custom_field_definitions_delete ON public.custom_field_definitions FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);
```

**Field Type Details**:
- **text**: Single-line text input, value stored as plain string
- **textarea**: Multi-line text input, value stored as plain string
- **number**: Numeric input, value stored as numeric string (e.g., "42", "3.14")
- **currency**: Number + currency code, value stored as JSON: `{"amount": "100.00", "currency": "USD"}`
- **dropdown**: Single-select from predefined options, value stored as selected option string
- **multi-select**: Multiple selections, value stored as JSON array: `["option1", "option2"]`
- **checkbox**: Boolean yes/no, value stored as `"true"` or `"false"` string
- **date**: Date picker, value stored as ISO 8601 date string: `"2025-11-03"`
- **url**: Link input with validation, value stored as URL string
- **email**: Email input with validation, value stored as email string

---

### 8. task_custom_field_values

**Purpose**: Store custom field values for individual tasks, with all values as TEXT for flexible type handling.

**Table Definition**:

```sql
CREATE TABLE public.task_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES public.custom_field_definitions(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_custom_field_values_task_field_unique UNIQUE (task_id, field_definition_id)
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_custom_field_values_task_id ON public.task_custom_field_values(task_id);
CREATE INDEX idx_task_custom_field_values_field_definition_id ON public.task_custom_field_values(field_definition_id);
```

**Constraints**:
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE - Deleting task deletes all custom field values
- `field_definition_id` REFERENCES `custom_field_definitions(id)` ON DELETE CASCADE - Deleting field definition deletes all values
- UNIQUE constraint on `(task_id, field_definition_id)` - One value per field per task
- `value` nullable for non-required fields

**Business Rules**:
- All values stored as TEXT with type-specific formatting:
  - text/textarea/number: Plain string
  - currency: JSON object `{"amount": "100.00", "currency": "USD"}`
  - multi-select: JSON array `["option1", "option2"]`
  - checkbox: `"true"` or `"false"` string
  - date: ISO 8601 string `"2025-11-03"`
  - url/email: Plain string
- Application layer handles parsing and validation based on field type
- NULL allowed for non-required fields
- Required field enforcement: Only on task creation or save, not retroactively

**RLS Policies**:

```sql
ALTER TABLE public.task_custom_field_values ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view custom field values for tasks in their teams
CREATE POLICY task_custom_field_values_select ON public.task_custom_field_values FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- INSERT: Users can insert custom field values for tasks in their teams
CREATE POLICY task_custom_field_values_insert ON public.task_custom_field_values FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- UPDATE: Users can update custom field values for tasks they can edit
CREATE POLICY task_custom_field_values_update ON public.task_custom_field_values FOR UPDATE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
) WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- DELETE: Users can delete custom field values for tasks they can edit
CREATE POLICY task_custom_field_values_delete ON public.task_custom_field_values FOR DELETE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);
```

---

### 9. task_labels

**Purpose**: Team-scoped color-coded labels for flexible task categorization and organization.

**Table Definition**:

```sql
CREATE TABLE public.task_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_labels_team_name_unique UNIQUE (team_id, name)
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_labels_team_id ON public.task_labels(team_id, name);
CREATE INDEX idx_task_labels_created_by ON public.task_labels(created_by);
```

**Constraints**:
- `team_id` REFERENCES `teams(id)` ON DELETE CASCADE - Deleting team deletes all labels
- `created_by` REFERENCES `auth.users(id)` ON DELETE SET NULL - Track creator, preserve label if user deleted
- `name` unique per team
- `color` must be valid 6-digit hex color (e.g., "#FF6B6B")

**Business Rules**:
- Maximum 50 labels per team (enforced application-side)
- Label names case-sensitive within team (Application, application are different)
- Default colors provided from predefined palette: red, orange, yellow, green, blue, purple, pink, gray
- Deleting a label removes all `task_label_assignments` for that label (CASCADE)

**RLS Policies**:

```sql
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view labels for their teams
CREATE POLICY task_labels_select ON public.task_labels FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Any team member can create labels
CREATE POLICY task_labels_insert ON public.task_labels FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- UPDATE: Any team member can update labels
CREATE POLICY task_labels_update ON public.task_labels FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
) WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- DELETE: Only team owners/admins or label creator can delete labels
CREATE POLICY task_labels_delete ON public.task_labels FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
    AND (role IN ('owner', 'admin') OR user_id = created_by)
  )
);
```

---

### 10. task_label_assignments

**Purpose**: Many-to-many relationship between tasks and labels, allowing multiple labels per task.

**Table Definition**:

```sql
CREATE TABLE public.task_label_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.task_labels(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_label_assignments_task_label_unique UNIQUE (task_id, label_id)
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_label_assignments_task_id ON public.task_label_assignments(task_id);
CREATE INDEX idx_task_label_assignments_label_id ON public.task_label_assignments(label_id);
```

**Constraints**:
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE - Deleting task removes all label assignments
- `label_id` REFERENCES `task_labels(id)` ON DELETE CASCADE - Deleting label removes all assignments
- `assigned_by` REFERENCES `auth.users(id)` ON DELETE SET NULL - Track who assigned label
- UNIQUE constraint on `(task_id, label_id)` - Same label cannot be assigned twice to same task

**Business Rules**:
- No hard limit on labels per task, but UI suggests first 3 visible, remaining collapsed
- Assigning same label twice to same task is idempotent (UNIQUE constraint prevents duplicates)

**RLS Policies**:

```sql
ALTER TABLE public.task_label_assignments ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view label assignments for tasks in their teams
CREATE POLICY task_label_assignments_select ON public.task_label_assignments FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- INSERT: Users can assign labels to tasks in their teams
CREATE POLICY task_label_assignments_insert ON public.task_label_assignments FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- DELETE: Users can remove label assignments from tasks in their teams
CREATE POLICY task_label_assignments_delete ON public.task_label_assignments FOR DELETE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);
```

---

### 11. task_stage_deadlines

**Purpose**: Stage-level milestone deadlines for breaking down long-duration tasks into manageable checkpoints.

**Table Definition**:

```sql
CREATE TABLE public.task_stage_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.task_stages(id) ON DELETE CASCADE,
  deadline TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_stage_deadlines_task_stage_unique UNIQUE (task_id, stage_id)
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_stage_deadlines_task_id ON public.task_stage_deadlines(task_id);
CREATE INDEX idx_task_stage_deadlines_deadline ON public.task_stage_deadlines(deadline) WHERE completed_at IS NULL;
```

**Constraints**:
- `task_id` REFERENCES `tasks(id)` ON DELETE CASCADE - Deleting task removes all stage deadlines
- `stage_id` REFERENCES `task_stages(id)` ON DELETE CASCADE - Deleting stage removes deadlines for that stage
- UNIQUE constraint on `(task_id, stage_id)` - One deadline per stage per task
- `completed_at` nullable - NULL = not yet reached this stage, NOT NULL = stage completed

**Business Rules**:
- Stage deadlines optional (not all stages require deadlines)
- System prompts to set stage deadlines for tasks with due date > 7 days away
- When task moves to new stage, `completed_at` set automatically for previous stage if not already set
- Stage deadlines color-coded: green (>3 days), yellow (1-3 days), red (<1 day or overdue)
- Completing stage before deadline shows encouragement message

**RLS Policies**:

```sql
ALTER TABLE public.task_stage_deadlines ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view stage deadlines for tasks in their teams
CREATE POLICY task_stage_deadlines_select ON public.task_stage_deadlines FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- INSERT: Users can create stage deadlines for tasks in their teams
CREATE POLICY task_stage_deadlines_insert ON public.task_stage_deadlines FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- UPDATE: Users can update stage deadlines for tasks in their teams
CREATE POLICY task_stage_deadlines_update ON public.task_stage_deadlines FOR UPDATE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
) WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- DELETE: Users can delete stage deadlines for tasks in their teams
CREATE POLICY task_stage_deadlines_delete ON public.task_stage_deadlines FOR DELETE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);
```

---

### 12. user_task_stats

**Purpose**: Track user task completion statistics for streak tracking, gamification, and progress visibility.

**Table Definition**:

```sql
CREATE TABLE public.user_task_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_task_completed_at TIMESTAMPTZ,
  streak_paused_at TIMESTAMPTZ, -- Set when user misses a day (1-day grace period)
  tasks_completed_today INTEGER NOT NULL DEFAULT 0,
  tasks_completed_total INTEGER NOT NULL DEFAULT 0,
  celebration_animations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_task_stats_user_team_unique UNIQUE (user_id, team_id)
);
```

**Indexes**:

```sql
CREATE INDEX idx_user_task_stats_user_id ON public.user_task_stats(user_id);
CREATE INDEX idx_user_task_stats_team_id ON public.user_task_stats(team_id);
CREATE INDEX idx_user_task_stats_last_completed ON public.user_task_stats(last_task_completed_at);
```

**Constraints**:
- `user_id` REFERENCES `auth.users(id)` ON DELETE CASCADE - Deleting user removes stats
- `team_id` REFERENCES `teams(id)` ON DELETE CASCADE - Deleting team removes stats for that team
- UNIQUE constraint on `(user_id, team_id)` - One stats record per user per team
- `current_streak >= 0`, `best_streak >= 0`, `tasks_completed_today >= 0`, `tasks_completed_total >= 0`

**Business Rules**:
- **Streak Logic**:
  - Increment `current_streak` when user completes first task of the day
  - If user misses a day, set `streak_paused_at` (1-day grace period)
  - If user completes task during grace day, clear `streak_paused_at` and keep streak
  - If user misses 2 consecutive days, reset `current_streak` to 0
  - Update `best_streak` if `current_streak` exceeds it
- **Daily Reset**: `tasks_completed_today` resets to 0 at midnight user local time (handled by cron job)
- **Celebrations**: `celebration_animations_enabled` controls confetti/animations (respects prefers-reduced-motion)

**RLS Policies**:

```sql
ALTER TABLE public.user_task_stats ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view their own stats for teams they belong to
CREATE POLICY user_task_stats_select ON public.user_task_stats FOR SELECT USING (
  user_id = auth.uid()
  AND team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Users can create their own stats records
CREATE POLICY user_task_stats_insert ON public.user_task_stats FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- UPDATE: Users can update their own stats
CREATE POLICY user_task_stats_update ON public.user_task_stats FOR UPDATE USING (
  user_id = auth.uid()
  AND team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
) WITH CHECK (
  user_id = auth.uid()
  AND team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- DELETE: Users can delete their own stats (rare, usually for privacy requests)
CREATE POLICY user_task_stats_delete ON public.user_task_stats FOR DELETE USING (
  user_id = auth.uid()
);
```

---

### 13. task_breakdown_patterns

**Purpose**: Store learned patterns for task breakdown assistance, improving suggestions over time based on team usage.

**Table Definition**:

```sql
CREATE TABLE public.task_breakdown_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL, -- Normalized keywords (lowercase, stemmed) for matching
  task_type TEXT, -- Optional: Costume Creation, Prop Building, Photoshoot Planning, Convention Prep, Material Sourcing
  suggested_subtasks JSONB NOT NULL, -- Array of subtask objects: [{"title": "...", "order": 0}, ...]
  times_offered INTEGER NOT NULL DEFAULT 0,
  times_accepted INTEGER NOT NULL DEFAULT 0,
  acceptance_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN times_offered > 0 THEN (times_accepted::DECIMAL / times_offered::DECIMAL * 100) ELSE 0 END
  ) STORED,
  is_low_quality BOOLEAN GENERATED ALWAYS AS (
    times_offered >= 10 AND (times_accepted::DECIMAL / times_offered::DECIMAL) < 0.20
  ) STORED,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes**:

```sql
CREATE INDEX idx_task_breakdown_patterns_team_id ON public.task_breakdown_patterns(team_id);
CREATE INDEX idx_task_breakdown_patterns_keywords ON public.task_breakdown_patterns USING GIN(keywords);
CREATE INDEX idx_task_breakdown_patterns_task_type ON public.task_breakdown_patterns(team_id, task_type) WHERE task_type IS NOT NULL;
CREATE INDEX idx_task_breakdown_patterns_acceptance_rate ON public.task_breakdown_patterns(team_id, acceptance_rate DESC) WHERE NOT is_low_quality;
```

**Constraints**:
- `team_id` REFERENCES `teams(id)` ON DELETE CASCADE - Deleting team deletes all patterns
- `created_by` REFERENCES `auth.users(id)` ON DELETE SET NULL - Track pattern creator
- `keywords` array must have at least 1 element
- `suggested_subtasks` JSONB must be valid array of objects with "title" and "order" fields
- `acceptance_rate` computed column: `(times_accepted / times_offered * 100)` or 0 if never offered
- `is_low_quality` computed column: TRUE if `times_offered >= 10` AND `acceptance_rate < 20%`

**Business Rules**:
- **Pattern Matching**:
  - Extract keywords from task title → normalize (lowercase, stem)
  - Query patterns with matching keywords using GIN index for fast text search
  - Rank results by `acceptance_rate` DESC
  - Filter out `is_low_quality = TRUE` patterns
- **Learning**:
  - When user accepts breakdown: increment `times_accepted` and `times_offered`
  - When user dismisses breakdown: increment `times_offered` only
  - Computed `acceptance_rate` auto-updates based on counters
  - Patterns <20% acceptance after 10+ offers marked as low quality (deprioritized)
- **Pattern Creation**:
  - When user manually creates subtasks, system offers "Save as pattern?" for future reuse
  - Team owners/admins can view and manage patterns in settings

**RLS Policies**:

```sql
ALTER TABLE public.task_breakdown_patterns ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view patterns for their teams
CREATE POLICY task_breakdown_patterns_select ON public.task_breakdown_patterns FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Any team member can create patterns
CREATE POLICY task_breakdown_patterns_insert ON public.task_breakdown_patterns FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- UPDATE: Team owners/admins or pattern creator can update patterns
CREATE POLICY task_breakdown_patterns_update ON public.task_breakdown_patterns FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
    AND (role IN ('owner', 'admin') OR user_id = created_by)
  )
) WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
    AND (role IN ('owner', 'admin') OR user_id = created_by)
  )
);

-- DELETE: Only team owners/admins can delete patterns
CREATE POLICY task_breakdown_patterns_delete ON public.task_breakdown_patterns FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);
```

---

## Migration Order & Rollback

### Migration Sequence

Execute migrations in this order to satisfy foreign key dependencies:

1. **20251103150000_create_subtasks.sql** - Depends only on `tasks` (existing)
2. **20251103150001_create_task_comments.sql** - Depends on `tasks` and `auth.users`
3. **20251103150002_create_task_attachments.sql** - Depends on `tasks` and `auth.users`
4. **20251103150003_create_task_notifications.sql** - Depends on `tasks` and `auth.users`
5. **20251103150004_create_task_templates.sql** - Depends on `teams` and `task_stages`
6. **20251103150005_create_saved_task_views.sql** - Depends on `teams` and `auth.users`
7. **20251103150006_create_custom_field_definitions.sql** - Depends on `teams`
8. **20251103150007_create_task_custom_field_values.sql** - Depends on `tasks` and `custom_field_definitions`
9. **20251103150008_create_task_labels.sql** - Depends on `teams` and `auth.users`
10. **20251103150009_create_task_label_assignments.sql** - Depends on `tasks` and `task_labels`
11. **20251103150010_create_task_stage_deadlines.sql** - Depends on `tasks` and `task_stages`
12. **20251103150011_create_user_task_stats.sql** - Depends on `teams` and `auth.users`
13. **20251103150012_create_task_breakdown_patterns.sql** - Depends on `teams` and `auth.users`

### Rollback Strategy

**Approach**: Execute DROP TABLE statements in reverse order.

```sql
-- Rollback script (execute in this order)
DROP TABLE IF EXISTS public.task_breakdown_patterns CASCADE;
DROP TABLE IF EXISTS public.user_task_stats CASCADE;
DROP TABLE IF EXISTS public.task_stage_deadlines CASCADE;
DROP TABLE IF EXISTS public.task_label_assignments CASCADE;
DROP TABLE IF EXISTS public.task_labels CASCADE;
DROP TABLE IF EXISTS public.task_custom_field_values CASCADE;
DROP TABLE IF EXISTS public.custom_field_definitions CASCADE;
DROP TABLE IF EXISTS public.saved_task_views CASCADE;
DROP TABLE IF EXISTS public.task_templates CASCADE;
DROP TABLE IF EXISTS public.task_notifications CASCADE;
DROP TABLE IF EXISTS public.task_attachments CASCADE;
DROP TABLE IF EXISTS public.task_comments CASCADE;
DROP TABLE IF EXISTS public.subtasks CASCADE;
```

**Safety**: All tables are new (no existing data), so rollback is safe. No risk to existing `tasks` or `task_stages` tables.

---

## Performance Considerations

### Index Strategy

**Query Patterns Optimized**:
- Fetch all subtasks for a task → `idx_subtasks_task_id`
- Fetch all comments for a task → `idx_task_comments_task_id`
- Fetch unread notifications for user → `idx_task_notifications_user_read`
- Find users mentioned in comments → `idx_task_comments_mentions` (GIN index)
- Fetch templates for a team → `idx_task_templates_team_id`

### Query Performance Targets

| Query | Target Latency | Index Used |
|-------|----------------|------------|
| Get task with subtasks | <50ms | `idx_subtasks_task_id` |
| Get task comments (20 most recent) | <100ms | `idx_task_comments_task_id` |
| Get user unread notifications | <50ms | `idx_task_notifications_user_read` |
| Search comments with @mentions | <200ms | `idx_task_comments_mentions` (GIN) |
| Get team templates | <50ms | `idx_task_templates_team_id` |

### Optimization Techniques

1. **Partial Indexes**: Create indexes on commonly filtered subsets (e.g., unread notifications)
2. **JSONB Indexing**: GIN indexes on `mentions` array and `metadata` JSONB fields
3. **Connection Pooling**: Use Supabase connection pooler for high concurrency
4. **Query Plan Analysis**: Use `EXPLAIN ANALYZE` to verify index usage
5. **Batch Operations**: Fetch related entities in single query (JOIN or subquery)

---

## Data Integrity & Validation

### Application-Level Validations

**Enforced in TypeScript services** (not database constraints):

| Validation | Rule | Reason |
|------------|------|--------|
| Max subtasks per task | 50 | UX/performance |
| Max attachments per task | 20 | UX/performance |
| Max templates per team | 50 | Prevent abuse |
| Max saved views per user | 20 | Reasonable limit |
| Max comment length | 10,000 chars | UX |
| Attachment file size | 25MB | R2 costs |

### Database-Level Constraints

**Enforced by PostgreSQL**:
- Foreign key integrity (CASCADE/SET NULL behaviors)
- CHECK constraints on enum-like fields (`event_type`, `priority`)
- UNIQUE constraints on name fields (templates, saved views)
- NOT NULL constraints on required fields

---

## Security & Privacy

### Row-Level Security (RLS)

**All tables have RLS enabled** with policies enforcing:
- Users can only access data for teams they belong to
- Users can only modify their own data (comments, notifications, saved views)
- Team roles enforced for sensitive operations (template deletion)

### Data Encryption

- **At Rest**: Supabase encrypts all data at rest (AES-256)
- **In Transit**: All connections use TLS 1.2+
- **File Storage**: R2 URLs are signed with expiring tokens (1 hour)

### Privacy Compliance

- **GDPR**: Soft delete for comments preserves conversation context while allowing user data removal
- **Data Export**: All user data exportable via API
- **Data Deletion**: CASCADE DELETE ensures complete removal of user data

---

## Testing Data

### Seed Data for Development

**Example Subtasks**:
```sql
INSERT INTO subtasks (task_id, title, display_order) VALUES
  ('task-1', 'Order fabric', 0),
  ('task-1', 'Cut pattern pieces', 1),
  ('task-1', 'Sew main body', 2);
```

**Example Comments**:
```sql
INSERT INTO task_comments (task_id, user_id, content, mentions) VALUES
  ('task-1', 'user-1', 'Great progress! @user-2 can you review?', ARRAY['user-2']::UUID[]);
```

**Example Templates**:
```sql
INSERT INTO task_templates (team_id, name, description, subtasks) VALUES
  ('team-1', 'Convention Packing', 'Standard packing checklist', 
   '[{"title":"Check costume","order":0},{"title":"Pack makeup","order":1}]'::JSONB);
```

---

## Monitoring & Maintenance

### Database Metrics to Track

- **Table Sizes**: Monitor growth of `task_comments`, `task_notifications`, `task_attachments`
- **Index Usage**: Ensure indexes are actually used (`pg_stat_user_indexes`)
- **Query Performance**: Track slow queries (>100ms) in logs
- **RLS Overhead**: Measure RLS policy evaluation time

### Cleanup Jobs

**Scheduled Maintenance**:
- **Notifications**: Delete notifications older than 90 days (cron job)
- **Deleted Comments**: Permanently remove soft-deleted comments after 30 days (optional)
- **Orphaned Attachments**: Find and remove R2 files not referenced in DB (safety check)

**Example Cleanup Query**:
```sql
-- Delete old notifications
DELETE FROM task_notifications
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Summary Statistics

**New Tables**: 13  
**New Indexes**: 29  
**New RLS Policies**: 52  
**Total FK Relationships**: 21

**Estimated Storage** (per 1000 tasks):
- Subtasks: ~500KB (avg 5 subtasks/task, 100 bytes each)
- Comments: ~2MB (avg 10 comments/task, 200 bytes each)
- Attachments: ~50MB (metadata only, actual files in R2)
- Notifications: ~1MB (avg 5 notifications/task, 200 bytes each)
- Templates: ~10KB (avg 10 templates/team, 1KB each)
- Saved Views: ~5KB (avg 5 views/user, 1KB each)
- Custom Field Definitions: ~20KB (avg 10 fields/team, 2KB each)
- Task Custom Field Values: ~1MB (avg 5 custom fields/task, 200 bytes each)
- Task Labels: ~10KB (avg 20 labels/team, 500 bytes each)
- Task Label Assignments: ~200KB (avg 2 labels/task, 100 bytes each)
- Task Stage Deadlines: ~300KB (avg 3 stage deadlines/task, 100 bytes each)
- User Task Stats: ~5KB (1 record per user per team, 500 bytes each)
- Task Breakdown Patterns: ~50KB (avg 30 patterns/team, ~1.5KB each)

**Total Additional Storage**: ~55MB per 1000 tasks (metadata only)

---

**Data Model Complete**: ✅ Ready for API contract definition

