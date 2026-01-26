# Quick Start: Robust Task Management Implementation

**Feature**: Robust Task Management  
**Date**: 2025-11-02  
**Purpose**: Developer guide for implementing robust task management with custom stages and team scoping

## Overview

This feature enhances task management with:
1. **Bug Fixes**: Task completion persistence, proper team-based visibility scoping
2. **Modern UI**: Enhanced task cards, scrollable kanban columns
3. **Custom Stages**: Team-specific workflow stages with completion tracking
4. **Team Scoping**: Standalone tasks support with proper RLS enforcement

## Implementation Order

### Phase 1: Critical Bug Fixes (P1)

1. **Fix Task Completion Bug**
   - Investigate why completion toggles reset
   - Ensure stage changes persist to database
   - Verify UI updates after API calls

2. **Fix Task Visibility Scoping**
   - Add `team_id` column to `tasks` table for standalone tasks
   - Update RLS policies to filter by team membership
   - Test cross-team data isolation

### Phase 2: Data Model Updates

3. **Add Task Stages Table**
   - Create `task_stages` migration
   - Create default stages for existing teams
   - Add `stage_id` column to `tasks` table

4. **Migrate Existing Tasks**
   - Assign existing tasks to default stages based on `completed` boolean
   - Update queries to join with `task_stages`

### Phase 3: UI Enhancements (P1-P2)

5. **Modern Task Card Design**
   - Create `TaskCard.svelte` component
   - Display all info with placeholders
   - Update kanban view to use new cards

6. **Scrollable Kanban Columns**
   - Add `overflow-y: auto` to column containers
   - Implement sticky headers
   - Test drag-and-drop with scrolling

7. **Custom Stages Configuration**
   - Create stage management UI (settings page)
   - Implement add/remove/reorder stages
   - Update kanban to use custom stages

### Phase 4: Polish (P2-P3)

8. **Enhanced Dashboard Display**
   - Update dashboard task widget design
   - Improve visual hierarchy
   - Add "View All" link

9. **Team Filtering & Multi-Team View**
   - Add team filter to task list
   - Implement "Show all teams" toggle
   - Add team indicators to task cards

## Step-by-Step Implementation

### Step 1: Database Migrations

Create migration files in `supabase/migrations/`:

```bash
# 1. Add team_id and stage_id to tasks
supabase/migrations/YYYYMMDDHHMMSS_add_task_team_and_stage.sql

# 2. Create task_stages table
supabase/migrations/YYYYMMDDHHMMSS_create_task_stages.sql

# 3. Create default stages for existing teams
supabase/migrations/YYYYMMDDHHMMSS_create_default_task_stages.sql

# 4. Migrate existing tasks to stages
supabase/migrations/YYYYMMDDHHMMSS_migrate_tasks_to_stages.sql

# 5. Fix RLS policies for team scoping
supabase/migrations/YYYYMMDDHHMMSS_fix_task_rls_policies.sql
```

### Step 2: Update TypeScript Types

Update `src/lib/types/domain/task.ts`:

```typescript
export interface Task {
  id: string
  projectId?: string | null
  resourceId?: string | null
  teamId: string // ADDED
  stageId: string // ADDED
  title: string
  description?: string
  dueDate?: string | null
  priority: TaskPriority
  assignedTo?: string | null
  completed: boolean // DEPRECATED (derived from stage)
  createdAt: string
  updatedAt: string
}

// ADD new interface
export interface TaskStage {
  id: string
  teamId: string
  name: string
  displayOrder: number
  isCompletionStage: boolean
  createdAt: string
  updatedAt: string
}
```

### Step 3: Create Task Stage Service

Create `src/lib/api/services/taskStageService.ts`:

```typescript
import { supabase } from '$lib/supabase'
import type { TaskStage, TaskStageCreate, TaskStageUpdate } from '$lib/types/domain/task'

export const taskStageService = {
  async list(teamId: string): Promise<TaskStage[]> {
    // Query task_stages filtered by team_id, ordered by display_order
  },
  
  async create(stage: TaskStageCreate): Promise<TaskStage> {
    // Insert into task_stages, ensure at least one completion stage exists
  },
  
  async update(id: string, updates: TaskStageUpdate): Promise<TaskStage> {
    // Update task_stages
  },
  
  async delete(id: string): Promise<void> {
    // Check for active tasks, prevent deletion if referenced
  },
  
  async ensureDefaults(teamId: string): Promise<TaskStage[]> {
    // Create default stages if they don't exist
  }
}
```

### Step 4: Update Task Service

Update `src/lib/api/services/taskService.ts`:

1. **Add stage support**:
   - Include `stage_id` in create/update operations
   - Join with `task_stages` to get stage info
   - Derive `completed` from `stage.is_completion_stage`

2. **Add team scoping**:
   - For standalone tasks, require `team_id`
   - Filter queries by current active team by default
   - Support multi-team view toggle

3. **Add moveToStage method**:
   ```typescript
   async moveToStage(taskId: string, stageId: string): Promise<Task> {
     return await this.update(taskId, { stageId })
   }
   ```

### Step 5: Create Modern Task Card Component

Create `src/lib/components/tasks/TaskCard.svelte`:

```svelte
<script lang="ts">
  import type { Task } from '$lib/types/domain/task'
  
  interface Props {
    task: Task
    stageName?: string
    assignedUser?: { name: string; avatarUrl?: string }
    projectName?: string
    draggable?: boolean
  }
  
  let { task, stageName, assignedUser, projectName, draggable = false }: Props = $props()
</script>

<div class="task-card ...">
  <h4>{task.title}</h4>
  <p>{task.description || "No description provided"}</p>
  <!-- Priority badge, due date, assigned user, project link -->
</div>
```

### Step 6: Update Kanban View

Update `src/routes/(auth)/tasks/+page.svelte`:

1. **Load stages**: Fetch team's stages on mount
2. **Render columns**: Map stages to kanban columns (not hardcoded todo/in-progress/done)
3. **Scrollable columns**: Add `overflow-y-auto max-h-[600px]` to column containers
4. **Drag-and-drop**: Update `handleDrop` to use `moveToStage` instead of `toggleComplete`
5. **Visual feedback**: Show dragged task opacity, highlight drop zones

### Step 7: Fix Completion Bug

Investigate `src/lib/components/tasks/TaskDetail.svelte`:

1. **Check state management**: Ensure reactive updates after API calls
2. **Verify API calls**: Confirm `update` method persists changes
3. **Add error handling**: Show errors if update fails, revert UI state
4. **Test persistence**: Verify changes persist after page refresh

### Step 8: Fix Visibility Bug

1. **Check RLS policies**: Verify policies filter by team membership
2. **Test cross-team access**: Create task as User A (Team 1), verify User B (Team 2) cannot see it
3. **Update queries**: Ensure all task queries join with team_members or use RLS
4. **Add logging**: Log RLS policy violations if any

## Testing Checklist

### E2E Tests (Playwright)

Create `tests/e2e/tasks/`:

- [ ] `task-completion.spec.ts`: Create task, move to completion stage, verify persistence
- [ ] `task-visibility.spec.ts`: Create task as User A, verify User B (different team) cannot see it
- [ ] `task-stages.spec.ts`: Create custom stages, move tasks between stages, verify kanban updates
- [ ] `task-kanban-drag.spec.ts`: Drag task between columns, verify stage updates, verify UI persistence

### Integration Tests

Update `tests/integration/task-service.test.ts`:

- [ ] Test task creation with stage assignment
- [ ] Test stage filtering by team
- [ ] Test RLS policy enforcement (mock Supabase RLS)
- [ ] Test standalone task creation with team_id

### Manual Testing

- [ ] Create project-scoped task, verify it appears in project
- [ ] Create standalone task, verify it appears in tasks list (not tied to project)
- [ ] Move task between stages, verify completion status derived from stage
- [ ] Configure custom stages, verify kanban columns match stages
- [ ] Test drag-and-drop with many tasks (50+), verify scrolling works
- [ ] Test multi-team view toggle, verify team indicators appear

## Common Pitfalls

1. **RLS Circular Dependencies**: Avoid querying `team_members` from within `tasks` RLS policies if `team_members` queries `tasks`. Use SECURITY DEFINER functions or direct column checks.

2. **Stage Deletion**: Prevent deleting stages with active tasks. Check `tasks.stage_id` before deletion.

3. **Completion Stage Requirement**: Ensure at least one completion stage exists per team. Validate in application logic (RLS can't enforce this).

4. **Default Stage Assignment**: When creating task without `stage_id`, assign to first non-completion stage (not first stage, which might be completion).

5. **Backward Compatibility**: Keep `completed` boolean during migration period. Derive from `stage.is_completion_stage` for new code, but support old tasks.

6. **Team ID Source**: For project-scoped tasks, derive `team_id` from `projects.team_id` (don't store directly). For standalone tasks, store in `tasks.team_id`.

## Key Files to Modify

### New Files
- `supabase/migrations/YYYYMMDDHHMMSS_*.sql` - Database migrations
- `src/lib/api/services/taskStageService.ts` - Stage management service
- `src/lib/components/tasks/TaskCard.svelte` - Modern task card component
- `tests/e2e/tasks/*.spec.ts` - E2E tests

### Modified Files
- `src/lib/types/domain/task.ts` - Add `TaskStage`, update `Task` interface
- `src/lib/api/services/taskService.ts` - Add stage support, team scoping
- `src/routes/(auth)/tasks/+page.svelte` - Update kanban with stages, scrolling
- `src/lib/components/tasks/TaskDetail.svelte` - Fix completion bug, add stage selector
- `src/lib/stores/tasks-store.ts` - Add stage filtering support
- `src/routes/(auth)/dashboard/+page.svelte` - Update task widget design

## Next Steps

After completing this implementation:

1. **Monitor**: Check for RLS policy performance issues
2. **Iterate**: Gather user feedback on custom stages workflow
3. **Optimize**: Add indexes if query performance degrades with many tasks
4. **Document**: Update user guide with custom stages configuration

## Resources

- [Research Document](./research.md) - Technical decisions and best practices
- [Data Model](./data-model.md) - Database schema and relationships
- [API Contracts](./contracts/) - Service interfaces and OpenAPI schema
- [Specification](./spec.md) - Feature requirements and user stories


