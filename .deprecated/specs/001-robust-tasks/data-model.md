# Data Model: Robust Task Management

**Feature**: Robust Task Management  
**Date**: 2025-11-02  
**Purpose**: Define database schema and entity relationships for task management with custom stages and team scoping

## Entity Relationships

```
users
└── [1:N] team_members ──[N:1]── teams
                              │
                              ├── [1:N] projects ──[1:N]── tasks
                              │
                              ├── [1:N] task_stages
                              │
                              └── [1:N] tasks (standalone, via team_id)

tasks
├── [N:0..1] projects (project_id, nullable for standalone tasks)
├── [N:0..1] resources (resource_id, nullable for project-level tasks)
├── [N:0..1] users (assigned_to, nullable)
└── [N:1] task_stages (stage_id, required - determines completion status)
```

## Database Tables

### tasks (Enhanced)

**Purpose**: Task tracking with support for project-scoped, resource-level, and standalone tasks. Completion determined by stage (not separate boolean).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Task unique identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Project reference (nullable for standalone tasks) |
| resource_id | UUID | REFERENCES resources(id) ON DELETE CASCADE | Resource reference (nullable for project-level tasks) |
| team_id | UUID | REFERENCES teams(id) ON DELETE CASCADE | Team reference (required for standalone tasks, derived from project for project-scoped) |
| stage_id | UUID | REFERENCES task_stages(id) ON DELETE SET NULL | Current stage (required, determines completion) |
| title | TEXT | NOT NULL | Task title |
| description | TEXT | | Task description |
| completed | BOOLEAN | DEFAULT FALSE | **DEPRECATED**: Use stage.is_completion_stage instead. Kept for backward compatibility during migration. |
| due_date | DATE | | Task deadline |
| priority | TEXT | NOT NULL, DEFAULT 'medium' | Priority: 'low', 'medium', 'high' |
| assigned_to | UUID | REFERENCES users(id) | Assigned team member (nullable) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `CHECK (priority IN ('low', 'medium', 'high'))`
- At least one of `project_id` or `team_id` must be set (enforced via application logic, not DB constraint)
- If `project_id` is set, `team_id` is derived from `projects.team_id` (no direct column needed, query via JOIN)
- If `project_id` is NULL, `team_id` must be set (standalone task)

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_tasks_project ON tasks(project_id)` - Project's tasks
- `INDEX idx_tasks_resource ON tasks(resource_id)` - Resource-specific tasks
- `INDEX idx_tasks_team ON tasks(team_id)` - Team's standalone tasks
- `INDEX idx_tasks_stage ON tasks(stage_id)` - Stage filtering
- `INDEX idx_tasks_assigned ON tasks(assigned_to)` - User's assigned tasks
- `INDEX idx_tasks_due_date ON tasks(due_date)` - Deadline sorting
- `INDEX idx_tasks_team_stage ON tasks(team_id, stage_id)` - Team kanban queries (compound)

**Business Rules**:
- **Project-scoped tasks**: `project_id IS NOT NULL`, `team_id` derived from `projects.team_id`
- **Standalone tasks**: `project_id IS NULL`, `team_id IS NOT NULL`
- **Resource-level tasks**: `resource_id IS NOT NULL`, `project_id IS NOT NULL`
- **Completion**: Task is completed if `stage.is_completion_stage = TRUE` (not based on `completed` boolean)
- **Stage required**: All tasks must have a `stage_id` (no NULL stages allowed)

**Migration Notes**:
- Existing tasks: Assign to default stage based on `completed` boolean (completed → "Done" stage, not completed → "Todo" stage)
- `completed` boolean kept during transition period for backward compatibility, then deprecated

---

### task_stages (New)

**Purpose**: Team-specific task stage configurations. Defines workflow stages (e.g., "Todo", "In Progress", "Review", "Done") with completion flags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Stage unique identifier |
| team_id | UUID | NOT NULL, REFERENCES teams(id) ON DELETE CASCADE | Owning team |
| name | TEXT | NOT NULL | Stage name (e.g., "Todo", "In Progress", "Done") |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | Sort order for kanban columns (0 = first, 1 = second, etc.) |
| is_completion_stage | BOOLEAN | NOT NULL, DEFAULT FALSE | If TRUE, tasks in this stage are considered completed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Constraints**:
- `UNIQUE (team_id, name)` - Unique stage names per team
- At least one `is_completion_stage = TRUE` must exist per team (enforced via application logic)
- `display_order >= 0`

**Indexes**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_task_stages_team_name ON task_stages(team_id, name)`
- `INDEX idx_task_stages_team ON task_stages(team_id, display_order)` - Team's stages in order

**Business Rules**:
- **Team-specific**: Each team has its own stage configuration
- **Default stages**: Automatically created for new teams: "Todo" (order 0), "In Progress" (order 1), "Done" (order 2, is_completion_stage = TRUE)
- **Completion stages**: At least one completion stage must exist per team
- **Stage deletion**: Cannot delete stages that have active tasks (enforced via application logic)
- **Stage reordering**: Display order determines kanban column order (left to right)

**Default Stages** (auto-created for new teams):
1. **Todo** (display_order: 0, is_completion_stage: FALSE)
2. **In Progress** (display_order: 1, is_completion_stage: FALSE)
3. **Done** (display_order: 2, is_completion_stage: TRUE)

---

## Type Definitions (TypeScript)

### Task Entity

```typescript
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  projectId?: string | null // null = standalone task, set = project task
  resourceId?: string | null // null = project-level task, set = resource-level task
  teamId: string // Required: either from project.team_id or tasks.team_id
  stageId: string // Required: current workflow stage
  title: string
  description?: string
  dueDate?: string | null // ISO date string
  priority: TaskPriority
  assignedTo?: string | null // user ID
  completed: boolean // DEPRECATED: Derived from stage.is_completion_stage
  createdAt: string
  updatedAt: string
}

export interface TaskCreate {
  projectId?: string | null // null = standalone task, set = project task
  resourceId?: string // Optional: resource-level task
  teamId?: string // Required if projectId is null (standalone task)
  stageId?: string // Optional: defaults to first non-completion stage
  title: string
  description?: string
  dueDate?: string
  priority?: TaskPriority // Defaults to 'medium'
  assignedTo?: string
}

export interface TaskUpdate {
  stageId?: string // Change stage (for drag-and-drop)
  title?: string
  description?: string
  dueDate?: string | null
  priority?: TaskPriority
  assignedTo?: string | null
  projectId?: string | null // Move to different project
  resourceId?: string | null // Move to different resource
}
```

### TaskStage Entity

```typescript
export interface TaskStage {
  id: string
  teamId: string
  name: string
  displayOrder: number
  isCompletionStage: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskStageCreate {
  teamId: string
  name: string
  displayOrder: number
  isCompletionStage?: boolean // Defaults to false
}

export interface TaskStageUpdate {
  name?: string
  displayOrder?: number
  isCompletionStage?: boolean
}
```

---

## Validation Rules

### Task Validation

1. **Required Fields**: `title`, `stage_id`, and either `project_id` or `team_id`
2. **Priority**: Must be 'low', 'medium', or 'high'
3. **Due Date**: Must be valid ISO date string or NULL
4. **Stage Assignment**: `stage_id` must belong to task's team (project.team_id or tasks.team_id)
5. **Assignment**: `assigned_to` must be a member of task's team

### TaskStage Validation

1. **Required Fields**: `name`, `team_id`, `display_order`
2. **Unique Name**: Stage name must be unique within team
3. **Completion Stage**: At least one completion stage must exist per team
4. **Deletion**: Cannot delete stage if tasks reference it (soft check in application, hard constraint in RLS)

---

## State Transitions

### Task Stage Transitions

```
[Any Stage] ──[drag/drop]──> [Any Other Stage]
                              │
                              └──[if completion stage]──> [Completed State]
```

**Rules**:
- Tasks can be moved to any stage via drag-and-drop
- Completion is derived from `stage.is_completion_stage`
- No restrictions on transitions (teams define their own workflows)
- Stage changes update `tasks.updated_at` timestamp

---

## RLS Policies

### tasks RLS Policies

**SELECT Policy**: Users can see tasks from teams they are active members of
```sql
CREATE POLICY tasks_select ON public.tasks FOR SELECT USING (
  -- Project-scoped tasks: user must be member of project's team
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = (SELECT auth.uid()) 
        AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  -- Standalone tasks: user must be member of task's team
  (
    project_id IS NULL AND
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND COALESCE(status, 'active') = 'active'
    )
  )
);
```

**INSERT Policy**: Users must be owner/editor of target team
```sql
CREATE POLICY tasks_insert ON public.tasks FOR INSERT WITH CHECK (
  -- Project-scoped tasks: user must be owner/editor of project's team
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = (SELECT auth.uid()) 
        AND role IN ('owner', 'editor')
        AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  -- Standalone tasks: user must be owner/editor of task's team
  (
    project_id IS NULL AND
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND role IN ('owner', 'editor')
      AND COALESCE(status, 'active') = 'active'
    )
  )
);
```

**UPDATE Policy**: Users must be owner/editor of task's team
```sql
CREATE POLICY tasks_update ON public.tasks FOR UPDATE USING (
  -- Same logic as SELECT policy
  (
    project_id IS NOT NULL AND project_id IN (...)
    OR
    project_id IS NULL AND team_id IN (...)
  )
  AND
  -- Additional check: user must be owner/editor
  (
    (project_id IS NOT NULL AND EXISTS (...owner/editor check...))
    OR
    (project_id IS NULL AND EXISTS (...owner/editor check...))
  )
);
```

**DELETE Policy**: Users must be owner/editor of task's team
```sql
CREATE POLICY tasks_delete ON public.tasks FOR DELETE USING (
  -- Same as UPDATE policy
);
```

### task_stages RLS Policies

**SELECT Policy**: Users can see stages from teams they are members of
```sql
CREATE POLICY task_stages_select ON public.task_stages FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = (SELECT auth.uid()) 
    AND COALESCE(status, 'active') = 'active'
  )
);
```

**INSERT Policy**: Users must be owner/editor to create stages
```sql
CREATE POLICY task_stages_insert ON public.task_stages FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = (SELECT auth.uid()) 
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);
```

**UPDATE Policy**: Users must be owner/editor to modify stages
```sql
CREATE POLICY task_stages_update ON public.task_stages FOR UPDATE USING (
  -- Same as INSERT
);
```

**DELETE Policy**: Users must be owner/editor to delete stages (enforced: no active tasks)
```sql
CREATE POLICY task_stages_delete ON public.task_stages FOR DELETE USING (
  -- Same as INSERT
  -- Note: Application logic prevents deletion if tasks reference stage
);
```

---

## Migration Strategy

### Phase 1: Add team_id and stage system

1. Create `task_stages` table
2. Create default stages for all existing teams
3. Add `team_id` column to `tasks` (nullable initially)
4. Add `stage_id` column to `tasks` (nullable initially)

### Phase 2: Migrate existing tasks

1. For project-scoped tasks: Set `stage_id` based on `completed` boolean (completed → "Done", else → "Todo")
2. For standalone tasks: Set `team_id` from user's active team (best guess, may need manual review)
3. Make `stage_id` NOT NULL after migration

### Phase 3: Deprecate completed boolean

1. Keep `completed` boolean for backward compatibility (derived from `stage.is_completion_stage`)
2. Update application code to use `stage.is_completion_stage` instead of `completed`
3. Remove `completed` column in future migration (not in MVP scope)

---

## Query Patterns

### Get tasks for kanban board (filtered by team)

```sql
SELECT t.*, ts.name as stage_name, ts.display_order, ts.is_completion_stage
FROM tasks t
JOIN task_stages ts ON t.stage_id = ts.id
WHERE (
  (t.project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = t.project_id 
    AND p.team_id = $1
  ))
  OR
  (t.project_id IS NULL AND t.team_id = $1)
)
ORDER BY ts.display_order, t.created_at DESC;
```

### Get team's task stages (for kanban columns)

```sql
SELECT * FROM task_stages
WHERE team_id = $1
ORDER BY display_order ASC;
```

### Check if task is completed (derived from stage)

```sql
SELECT t.*, ts.is_completion_stage as completed
FROM tasks t
JOIN task_stages ts ON t.stage_id = ts.id
WHERE t.id = $1;
```


