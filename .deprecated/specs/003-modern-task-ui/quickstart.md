# Quickstart Guide: Modern Task UI Development

**Feature**: 003-modern-task-ui  
**Target Audience**: Developers new to the task UI codebase  
**Time to Complete**: 30 minutes

This guide helps you understand the modern task UI architecture and get productive quickly.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Development Setup](#local-development-setup)
3. [Key Concepts](#key-concepts)
4. [Common Development Tasks](#common-development-tasks)
5. [Testing](#testing)
6. [Debugging Tips](#debugging-tips)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Component Tree

```
TasksPage (routes/(auth)/tasks/+page.svelte)
│
├── ViewModeSelector (tabs: List/Board/Calendar/Timeline)
├── TaskFilterPanel
│   ├── FilterOptions
│   ├── SavedViewsDropdown
│   └── SearchInput
│
├── [Current View Component]
│   ├── TaskListView (with VirtualList)
│   ├── TaskBoardView (with DNDable columns)
│   ├── TaskCalendarView (CSS Grid calendar)
│   └── TaskTimelineView (horizontal bars)
│
└── TaskDetailPanel (unified create/edit/view)
    ├── Details Tab (properties + subtasks + attachments)
    ├── Comments Tab (rich text + @mentions)
    └── Activity Tab (change log)

EmbeddedTaskView (reusable for projects/photoshoots/resources)
├── Toggle (List/Board only)
└── TaskListView or TaskBoardView (filtered)

QuickCreateOverlay (keyboard shortcut 'N')
└── Minimal creation form
```

### Data Flow

```
User Action → Svelte Store Update → Optimistic UI Update → API Call → Success/Revert
                                                               ↓
                                               Notification Creation (if applicable)
                                                               ↓
                                               Supabase Realtime → Other Clients
```

### State Management

- **Svelte Stores**: Reactive state (`tasks`, `activeFilters`, `currentViewMode`)
- **URL Params**: Shareable state (filters, detail panel open)
- **LocalStorage**: User preferences (view mode)
- **Supabase DB**: Persistent state (saved views, templates)

### Design Patterns

1. **Unified Detail Panel**: One component for create/edit/view modes
2. **Living Document**: Inline editing (InlineTextEditor, InlineSelect, etc.)
3. **Optimistic Updates**: Update UI immediately, revert on error
4. **Progressive Disclosure**: Show essentials, hide complexity

---

## Local Development Setup

### Prerequisites

- **Bun**: `curl -fsSL https://bun.sh/install | bash`
- **Supabase CLI**: `brew install supabase/tap/supabase` (macOS)
- **Git**: Latest version

### Step 1: Clone & Install

```bash
cd /home/jek/Downloads/cosplay-tracker
bun install
```

### Step 2: Environment Setup

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Database Migrations

```bash
# Run all migrations (includes task UI tables)
supabase db reset

# Or apply only task UI migrations
supabase migration up --include 20251103_create_subtasks
supabase migration up --include 20251103_create_task_comments
supabase migration up --include 20251103_create_task_attachments
supabase migration up --include 20251103_create_task_notifications
supabase migration up --include 20251103_create_task_templates
supabase migration up --include 20251103_create_saved_task_views
```

### Step 4: Seed Test Data

```bash
# Run seed script to create test tasks
bun run seed:tasks

# Or manually via Supabase Studio:
# http://localhost:54323 (if running local Supabase)
```

### Step 5: Start Dev Server

```bash
bun run dev
# Server starts at http://localhost:5173
```

### Step 6: Verify Setup

1. Navigate to `http://localhost:5173/tasks`
2. You should see the tasks page with view mode tabs
3. Create a test task → verify detail panel opens
4. Switch between List/Board views → verify tasks persist

---

## Key Concepts

### 1. Unified Detail Panel

**One component, three modes**: Create, Edit, View

```svelte
<!-- TaskDetailPanel.svelte -->
<script lang="ts">
  let mode = $derived(() => {
    if (!taskId) return 'create'
    if (explicitReadOnly) return 'view'
    return 'edit'
  })
</script>

{#if mode === 'create'}
  <InlineTextEditor bind:value={newTask.title} placeholder="Task title..." />
{:else if mode === 'edit'}
  <InlineTextEditor bind:value={task.title} onSave={updateTask} />
{:else}
  <div class="title">{task.title}</div>
{/if}
```

**Key Benefits**:
- No duplicate code (one source of truth)
- Smooth transitions (no unmount/remount)
- Consistent UX (same interface everywhere)

### 2. Living Document Editing

**Pattern**: Click to edit, save on blur, revert on error.

```svelte
<InlineTextEditor
  bind:value={task.title}
  variant="title"
  onSave={async (newValue) => {
    await taskService.updateTask(task.id, { title: newValue })
  }}
  onError={(error) => {
    showToast(error.message, 'error')
  }}
/>
```

**Existing Inline Components** (in `src/lib/components/base/`):
- `InlineTextEditor.svelte` - Text/textarea
- `InlineSelect.svelte` - Dropdown
- `InlineDatePicker.svelte` - Date input
- `InlineCheckbox.svelte` - Checkbox
- `StageSelector.svelte` - Stage dropdown

**Creating New Inline Components**:
1. Copy `InlineTextEditor.svelte` as template
2. Replace input element with your UI (select, datepicker, etc.)
3. Implement `onSave` callback pattern
4. Add `editable` prop for read-only mode
5. Use `isSaving` state for loading indicator

### 3. Optimistic UI Updates

**Pattern**: Update UI immediately, API call in background, revert on error.

```typescript
async function updateTaskStage(taskId: string, newStageId: string) {
  const previousStageId = task.stageId
  
  // Optimistic update
  task.stageId = newStageId
  tasks.update(t => [...t])
  
  try {
    await taskService.updateTask(taskId, { stageId: newStageId })
  } catch (error) {
    // Revert on failure
    task.stageId = previousStageId
    tasks.update(t => [...t])
    showToast('Failed to update task stage', 'error')
  }
}
```

**Where to Use**:
- Drag-and-drop operations
- Checkbox toggles (subtask completion)
- Priority/assignee changes
- Bulk operations

### 4. State Management

**Svelte Stores Pattern**:

```typescript
// stores/tasks.ts
export const tasks = writable<Task[]>([])
export const currentViewMode = writable<ViewMode>('list')

// Derived stores (computed values)
export const filteredTasks = derived(
  [tasks, activeFilters, searchQuery],
  ([$tasks, $filters, $search]) => {
    return $tasks.filter(task => matchesFilters(task, $filters, $search))
  }
)

// Usage in component
<script lang="ts">
  import { tasks, filteredTasks } from '$lib/stores/tasks'
  
  $effect(() => {
    console.log('Filtered tasks changed:', $filteredTasks)
  })
</script>
```

**URL State Sync**:

```typescript
// Sync filters to URL for shareability
function syncFiltersToURL(filters: TaskFilters) {
  const params = new URLSearchParams()
  params.set('filter', JSON.stringify(filters))
  goto(`/tasks?${params}`, { replaceState: true })
}

// Restore from URL on page load
onMount(() => {
  const filterParam = $page.url.searchParams.get('filter')
  if (filterParam) {
    activeFilters.set(JSON.parse(filterParam))
  }
})
```

---

## Common Development Tasks

### Task 1: Add a New View Mode

**Example**: Add a "Gantt Chart" view mode.

1. **Add to types** (`src/lib/types/domain/task.ts`):
```typescript
export type ViewMode = 'list' | 'board' | 'calendar' | 'timeline' | 'gantt'
```

2. **Create view component** (`src/lib/components/tasks/views/TaskGanttView.svelte`):
```svelte
<script lang="ts">
  import { filteredTasks } from '$lib/stores/tasks'
</script>

<div class="gantt-view">
  {#each $filteredTasks as task}
    <div class="gantt-row">
      <span>{task.title}</span>
      <div class="gantt-bar" style="..."></div>
    </div>
  {/each}
</div>
```

3. **Add to TasksPage** (`src/routes/(auth)/tasks/+page.svelte`):
```svelte
{#if $currentViewMode === 'gantt'}
  <TaskGanttView />
{/if}
```

4. **Add tab to ViewModeSelector**:
```svelte
<button onclick={() => currentViewMode.set('gantt')}>
  Gantt
</button>
```

### Task 2: Add a New Filter Option

**Example**: Add "Created This Week" filter.

1. **Update TaskFilters type** (`contracts/types.ts`):
```typescript
export interface TaskFilters {
  // ... existing filters
  createdThisWeek?: boolean
}
```

2. **Add filter UI** (`TaskFilterPanel.svelte`):
```svelte
<Checkbox
  bind:checked={$activeFilters.createdThisWeek}
  label="Created This Week"
  onChange={applyFilters}
/>
```

3. **Update filter logic** (`utils/task-filters.ts`):
```typescript
function matchesFilters(task: Task, filters: TaskFilters): boolean {
  // ... existing logic
  
  if (filters.createdThisWeek) {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    if (new Date(task.createdAt) < weekAgo) {
      return false
    }
  }
  
  return true
}
```

### Task 3: Extend Task Detail Panel

**Example**: Add "Related Tasks" section.

1. **Create component** (`tasks/detail/RelatedTasksSection.svelte`):
```svelte
<script lang="ts">
  let { taskId } = $props()
  let relatedTasks = $state<Task[]>([])
  
  onMount(async () => {
    relatedTasks = await taskService.getRelatedTasks(taskId)
  })
</script>

<div class="section">
  <h3>Related Tasks</h3>
  <ul>
    {#each relatedTasks as task}
      <li><TaskCard {task} /></li>
    {/each}
  </ul>
</div>
```

2. **Add to TaskDetailPanel** (`tasks/TaskDetailPanel.svelte`):
```svelte
<!-- After attachments section -->
<RelatedTasksSection {taskId} />
```

### Task 4: Create a Custom Inline Editor

**Example**: InlineUserSelector with avatar.

1. **Create component** (`base/InlineUserSelector.svelte`):
```svelte
<script lang="ts">
  import { teamMembers } from '$lib/stores/teams'
  
  let { value = $bindable<string | null>(null), onSave } = $props()
  let isOpen = $state(false)
  
  async function selectUser(userId: string) {
    value = userId
    isOpen = false
    await onSave?.(userId)
  }
  
  const selectedUser = $derived(
    $teamMembers.find(u => u.id === value)
  )
</script>

<button onclick={() => isOpen = !isOpen} class="user-selector">
  {#if selectedUser}
    <Avatar user={selectedUser} size="sm" />
    {selectedUser.name}
  {:else}
    <span class="placeholder">Assign to...</span>
  {/if}
</button>

{#if isOpen}
  <div class="dropdown">
    {#each $teamMembers as user}
      <button onclick={() => selectUser(user.id)}>
        <Avatar {user} size="sm" />
        {user.name}
      </button>
    {/each}
  </div>
{/if}
```

2. **Use in detail panel**:
```svelte
<InlineUserSelector
  bind:value={task.assignedTo}
  onSave={(userId) => updateTask({ assignedTo: userId })}
/>
```

---

## Testing

### E2E Tests (Playwright)

**Run tests**:
```bash
bun run test:e2e
```

**Write a new test** (`tests/e2e/tasks-views.spec.ts`):
```typescript
import { test, expect } from '@playwright/test'

test('user can switch between view modes', async ({ page }) => {
  // Setup: Navigate to tasks page
  await page.goto('/tasks')
  
  // Verify list view is default
  await expect(page.locator('[data-testid="task-list-view"]')).toBeVisible()
  
  // Switch to board view
  await page.click('[data-testid="view-tab-board"]')
  
  // Verify board view displays
  await expect(page.locator('[data-testid="task-board-view"]')).toBeVisible()
  await expect(page.locator('[data-testid="stage-column"]')).toHaveCount(3)
})
```

**Test Data Setup**:
```typescript
// tests/helpers/task-fixtures.ts
export async function createTestTask(params: Partial<TaskCreateInput> = {}) {
  const task = await taskService.createTask({
    title: params.title || 'Test Task',
    priority: params.priority || 'medium',
    ...params,
  })
  return task
}
```

### Integration Tests (Vitest)

**Run tests**:
```bash
bun run test:integration
```

**Write a service test** (`tests/integration/taskService.test.ts`):
```typescript
import { describe, test, expect, beforeEach } from 'vitest'
import { taskService } from '$lib/api/services/taskService'

describe('TaskService', () => {
  let testTask: Task
  
  beforeEach(async () => {
    testTask = await createTestTask()
  })
  
  test('creates task with subtasks', async () => {
    const task = await taskService.createTask({
      title: 'Task with subtasks',
      subtasks: [
        { title: 'Subtask 1', order: 0 },
        { title: 'Subtask 2', order: 1 },
      ]
    })
    
    expect(task.id).toBeDefined()
    
    const subtasks = await subtaskService.getSubtasks(task.id)
    expect(subtasks).toHaveLength(2)
    expect(subtasks[0].title).toBe('Subtask 1')
  })
})
```

### Manual Testing Checklist

**Before submitting PR**:

- [ ] All 4 view modes render correctly
- [ ] Task detail panel opens and closes smoothly
- [ ] Drag-and-drop works in board view
- [ ] Inline editing saves changes (try title, priority, assignee)
- [ ] Subtasks can be added, edited, completed, deleted
- [ ] Comments can be added with @mentions
- [ ] File attachments upload and download
- [ ] Filters apply correctly (try 2-3 filter combinations)
- [ ] Saved views persist across page refresh
- [ ] Mobile view is functional (use DevTools mobile emulation)
- [ ] Notifications appear for @mentions (test with second user)
- [ ] No console errors or warnings

---

## Debugging Tips

### Svelte DevTools

**Install**: [Svelte DevTools Extension](https://chrome.google.com/webstore/detail/svelte-devtools/ckolcbmkjpjmangdbmnkpjigpkddpogn)

**Usage**:
1. Open DevTools → Svelte tab
2. Inspect component tree
3. View store values in real-time
4. Track reactive dependencies

### Logging Store Changes

```typescript
// Debug store updates
tasks.subscribe(value => {
  console.log('[tasks store]', value)
})

activeFilters.subscribe(value => {
  console.log('[filters store]', value)
})
```

### Supabase Query Debugging

```typescript
// Enable query logging
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('team_id', teamId)
  .then(result => {
    console.log('[Supabase query]', result)
    return result
  })
```

### Performance Profiling

```typescript
// Measure render time
$effect(() => {
  const start = performance.now()
  
  // Render logic here
  
  const end = performance.now()
  console.log(`Render took ${end - start}ms`)
})
```

### Network Requests

**Chrome DevTools**:
1. Network tab → Filter by "Fetch/XHR"
2. Look for `/api/tasks` requests
3. Check request/response payloads
4. Verify status codes (200, 201, 204, 400, 404, 500)

---

## Troubleshooting

### Issue: Tasks not loading

**Symptoms**: Empty task list, no errors in console.

**Solutions**:
1. Check Supabase connection: `supabase status`
2. Verify team selection: `console.log($currentTeam)`
3. Check RLS policies: Try query in Supabase Studio
4. Clear LocalStorage: `localStorage.clear()` in console

### Issue: Drag-and-drop not working

**Symptoms**: Can't drag task cards in board view.

**Solutions**:
1. Verify `draggable="true"` attribute on cards
2. Check `ondragstart`, `ondragover`, `ondrop` handlers
3. Test in different browser (Firefox vs Chrome)
4. Add console.logs in drag handlers to trace execution

### Issue: Inline editor not saving

**Symptoms**: Changes revert after editing.

**Solutions**:
1. Check `onSave` callback: Add `console.log`
2. Verify API endpoint returns success
3. Check for JavaScript errors in console
4. Ensure optimistic update isn't being overwritten

### Issue: Filters not applying

**Symptoms**: Tasks don't filter when selecting filters.

**Solutions**:
1. Check filter store: `console.log($activeFilters)`
2. Verify filter logic in `utils/task-filters.ts`
3. Test with single filter first (isolate issue)
4. Check URL params: Are filters syncing to URL?

### Issue: Supabase Realtime not working

**Symptoms**: Notifications don't appear instantly.

**Solutions**:
1. Check Supabase plan: Realtime enabled?
2. Verify subscription code: Look for `supabase.channel(...).subscribe()`
3. Fall back to polling: Should auto-fallback, check implementation
4. Test in Supabase Studio: Try realtime in SQL editor

---

## Additional Resources

- **Spec**: [spec.md](./spec.md) - Full requirements
- **Plan**: [plan.md](./plan.md) - Implementation plan
- **Data Model**: [data-model.md](./data-model.md) - Database schema
- **API Docs**: [contracts/api-schema.yaml](./contracts/api-schema.yaml) - API reference
- **Types**: [contracts/types.ts](./contracts/types.ts) - TypeScript types

**External Docs**:
- [Svelte 5 Docs](https://svelte-5-preview.vercel.app/docs/introduction)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Tanstack Virtual](https://tanstack.com/virtual/latest)

---

## Getting Help

**Questions?**
1. Check this quickstart guide first
2. Search existing issues/docs
3. Ask in team chat (include error messages, screenshots)
4. Create GitHub issue with reproduction steps

**Contributing**:
- Follow existing code patterns
- Write tests for new features
- Update this guide if you add new concepts
- Request code review before merging

---

**Quickstart Complete!** You should now be able to develop task UI features confidently. Start with a small task (add a filter option) to get familiar with the patterns, then tackle larger features.

