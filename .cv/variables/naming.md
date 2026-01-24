# Naming Conventions

Consistent naming patterns across the codebase.

---

## Files & Folders

### Components

```
PascalCase.svelte           # Preferred for new components
kebab-case.svelte           # Legacy (migrate when touching)
```

**Examples:**
- `ProjectCard.svelte` (good)
- `project-card.svelte` (legacy)

### Services

```
src/lib/api/services/
  projectService.ts         # camelCase + Service suffix
  taskService.ts
  teamService.ts
```

### Types

```
src/lib/types/
  domain/
    project.ts              # lowercase, singular
    task.ts
  api/
    projectApi.ts           # lowercase + Api suffix
```

### Routes

```
src/routes/
  projects/
    +page.svelte            # SvelteKit convention
    +page.server.ts
    [id]/
      +page.svelte
```

---

## TypeScript

### Types & Interfaces

```typescript
// Types for unions, primitives
type ProjectStatus = 'idea' | 'planning' | 'active' | 'post-production' | 'archived';
type Priority = 'low' | 'medium' | 'high';

// Interfaces for objects
interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
}

// API response types
interface ProjectResponse {
  data: Project;
  error: string | null;
}
```

### Functions

```typescript
// Verbs for actions
function createProject(data: CreateProjectInput): Promise<Project>
function getProjectById(id: string): Promise<Project>
function updateProject(id: string, data: UpdateProjectInput): Promise<Project>
function deleteProject(id: string): Promise<void>

// "is" prefix for boolean checks
function isProjectActive(project: Project): boolean
function hasPermission(user: User, action: string): boolean
```

### Constants

```typescript
// SCREAMING_SNAKE_CASE
const MAX_TEAM_MEMBERS = 50;
const DEFAULT_PAGE_SIZE = 20;
const API_TIMEOUT_MS = 30000;
```

### Enums (avoid, prefer union types)

```typescript
// Prefer
type Status = 'active' | 'inactive';

// Avoid
enum Status {
  Active = 'active',
  Inactive = 'inactive'
}
```

---

## Database (Supabase)

### Tables

```sql
-- snake_case, plural
projects
tasks
team_members
budget_items
moodboard_nodes
```

### Columns

```sql
-- snake_case
id              -- UUID primary key
created_at      -- Timestamp
updated_at      -- Timestamp
project_id      -- Foreign key
is_archived     -- Boolean (is_ prefix)
```

### Foreign Keys

```sql
-- {table}_id pattern
project_id      -- references projects(id)
team_id         -- references teams(id)
created_by      -- references users(id) (exception for clarity)
```

---

## CSS / Tailwind

### Custom Classes (rare)

```css
/* BEM-style for custom components */
.task-card { }
.task-card__header { }
.task-card--completed { }
```

### Tailwind Usage

```html
<!-- Prefer utilities over custom classes -->
<div class="flex items-center gap-2 p-4 bg-white rounded-lg shadow">

<!-- Group related utilities -->
<div class="
  flex items-center gap-2
  p-4
  bg-white dark:bg-gray-800
  rounded-lg shadow
">
```

---

## Git

### Branches

```
{spec-id}-{feature-name}
006-brainstorming-moodboard
004-bugfix-testing
007-component-consolidation
```

### Commits

```
{type}: {description}

feat: Add notes functionality to ReferenceCard
fix: Resolve mobile sidebar scroll issue
refactor: Consolidate inline editor components
docs: Update component registry
chore: Remove unused dependencies
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`

---

## API Endpoints (Future)

```
GET    /api/projects           # List
GET    /api/projects/:id       # Get one
POST   /api/projects           # Create
PATCH  /api/projects/:id       # Update
DELETE /api/projects/:id       # Delete

# Nested resources
GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
```

---

## Common Abbreviations

| Full | Abbreviation | Context |
|------|--------------|---------|
| identifier | `id` | Always |
| configuration | `config` | Files, variables |
| application | `app` | Files, variables |
| properties | `props` | Svelte components |
| parameters | `params` | Functions, routes |
| database | `db` | Variables, files |
| authentication | `auth` | Folders, services |
| utilities | `utils` | Files, folders |

**Avoid abbreviating** domain terms: `project`, `task`, `team`, `budget`, `moodboard`
