# Research: MVP Cosplay Tracker Redesign

**Date**: 2025-10-30  
**Phase**: 0 (Research & Technology Decisions)  
**Purpose**: Document technology choices, best practices, and implementation patterns for the MVP redesign

## Overview

This document resolves all technical uncertainties identified in the plan and establishes patterns for implementing the MVP redesign features. Each decision includes rationale, alternatives considered, and implementation guidelines.

---

## 1. Fuzzy Search Implementation

### Decision: Fuse.js (Client-Side) for MVP, pg_trgm (Server-Side) for Phase 2

**Rationale**:
- **MVP Performance Adequate**: With expected dataset sizes (50-500 items per entity type), client-side search with Fuse.js provides sub-second response times
- **Simpler Implementation**: No server-side setup, works immediately with loaded data
- **Lower Infrastructure Costs**: No additional database extensions or query optimization needed
- **Migration Path**: Can switch to pg_trgm when dataset sizes exceed 1000+ items without changing UI

**Alternatives Considered**:

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Fuse.js (client)** | Simple setup, no backend changes, works offline, <1KB minified | Limited to loaded dataset, re-indexes on data change | ✅ **Selected for MVP** |
| **pg_trgm (PostgreSQL)** | Handles massive datasets, indexes persisted, supports complex queries | Requires migration setup, slower for small datasets, network latency | Phase 2 upgrade path |
| **MiniSearch** | Lighter than Fuse (2KB), fast indexing | Less fuzzy matching control, smaller community | Rejected - Fuse.js more mature |
| **Backend Full-Text Search** | Best for large scale | Over-engineered for MVP | Deferred to Phase 3 |

**Implementation Guidelines**:

```typescript
// lib/utils/search.ts
import Fuse from 'fuse.js'

type SearchableEntity = {
  id: string
  name: string
  character?: string
  series?: string
  tags?: string[]
}

export function createFuzzySearch<T extends SearchableEntity>(
  items: T[],
  keys: string[] = ['name', 'character', 'series', 'tags']
) {
  return new Fuse(items, {
    keys,
    threshold: 0.3,        // 0.3 allows ~2 character typos for 8+ char words
    distance: 100,         // Max distance for match
    ignoreLocation: true,  // Match anywhere in string
    useExtendedSearch: false
  })
}

// Usage in stores
export function searchIdeas(query: string, ideas: Idea[]) {
  if (!query) return ideas
  
  const fuse = createFuzzySearch(ideas, ['character', 'series', 'tags'])
  const results = fuse.search(query)
  
  // Return with relevance score
  return results.map(r => ({ ...r.item, score: r.score }))
}
```

**Performance Targets**:
- Search 500 items: <100ms
- Index rebuild: <50ms
- Memory footprint: <5MB for 500 items

**Migration Trigger**: When single entity type exceeds 1000 items or search latency exceeds 500ms

---

## 2. Image Processing Strategy

### Decision: Client-Side Canvas API for MVP, Sharp for Future Server-Side Optimization

**Rationale**:
- **Zero Infrastructure Cost**: Browser Canvas API requires no server-side processing
- **Immediate Feedback**: Users see preview before upload
- **Bandwidth Savings**: Compression happens before network transfer
- **Acceptable Performance**: Modern browsers compress 10MB images in 2-5 seconds
- **Server-Side Migration**: Can add Sharp processing on Cloudflare Workers when scaling

**Alternatives Considered**:

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Browser Canvas API** | Zero cost, immediate preview, reduces upload bandwidth | Browser-dependent quality, blocks UI thread | ✅ **Selected for MVP** |
| **Sharp (Cloudflare Workers)** | Consistent quality, non-blocking, better compression | Requires serverless function setup, processing costs | Phase 2 optimization |
| **Cloudflare Images** | CDN delivery, automatic optimization | $5/month minimum + $1/1000 images | Too expensive for MVP |
| **Client + Server Hybrid** | Best quality + UX | Increased complexity | Deferred |

**Implementation Guidelines**:

```typescript
// lib/utils/image.ts

export type ImageVariant = 'thumbnail' | 'display' | 'original'

export interface ProcessedImage {
  thumbnail: Blob    // 200px width, max 100KB
  display: Blob      // max 2MB, max 2000px width
  original: Blob     // unmodified
  metadata: {
    originalSize: number
    thumbnailSize: number
    displaySize: number
    dimensions: { width: number, height: number }
  }
}

export async function processImage(file: File): Promise<ProcessedImage> {
  // Validate size
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10MB')
  }
  
  // Load image
  const img = await loadImage(file)
  
  // Generate variants
  const thumbnail = await resizeImage(img, 200, 0.7)  // 200px width, 70% quality
  const display = await compressImage(img, 2 * 1024 * 1024)  // Max 2MB
  
  return {
    thumbnail,
    display,
    original: file,
    metadata: {
      originalSize: file.size,
      thumbnailSize: thumbnail.size,
      displaySize: display.size,
      dimensions: { width: img.width, height: img.height }
    }
  }
}

async function resizeImage(
  img: HTMLImageElement,
  targetWidth: number,
  quality: number
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  // Calculate dimensions maintaining aspect ratio
  const scale = targetWidth / img.width
  canvas.width = targetWidth
  canvas.height = img.height * scale
  
  // Draw and compress
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality)
  })
}

async function compressImage(
  img: HTMLImageElement,
  maxSize: number
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  // Start at original size
  let width = img.width
  let height = img.height
  let quality = 0.9
  
  // Iteratively reduce quality/size until under maxSize
  while (quality > 0.3) {
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality)
    })
    
    if (blob.size <= maxSize) return blob
    
    quality -= 0.1
  }
  
  // If still too large, reduce dimensions
  width = Math.floor(width * 0.8)
  height = Math.floor(height * 0.8)
  
  return compressImage(img, maxSize)  // Recursive
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
```

**Upload Flow**:
1. User selects image file
2. Show loading indicator
3. Process image (generate 3 variants)
4. Upload all 3 variants to Supabase Storage
5. Store URLs in database
6. Display thumbnail in UI

**Performance Optimization**:
- Use Web Workers for processing (non-blocking)
- Show progress bar during compression
- Implement upload queue for multiple images
- Cache processed variants locally (IndexedDB)

---

## 3. UI Component Library: Flowbite Svelte (Constitutional Requirement)

### Decision: Flowbite Svelte (Constitution: "Flowbite First")

**Rationale**:
- **Constitutional Requirement**: Constitution explicitly mandates "Flowbite First" as a non-negotiable component standard
- **Pre-built Components**: Faster development with comprehensive component library
- **Tailwind Native**: Built on Tailwind CSS, matches existing tech stack
- **Svelte 5 Compatible**: Flowbite Svelte supports Svelte 5 runes
- **Customizable**: Can extend and customize components as needed for inline editing

**Alternatives Considered**:

| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| **Flowbite Svelte** | Constitution-compliant, pre-built components, faster setup, Tailwind-native | Different from React source designs | ✅ **Selected (Constitutional)** |
| **shadcn-svelte** | Direct React→Svelte conversion path, composition-based | Violates constitution "Flowbite First" | Rejected (Constitutional violation) |
| **Melt UI** | Headless primitives, maximum flexibility | Too low-level, requires building everything | Too time-consuming |
| **Skeleton** | All-in-one framework | Opinionated design system, hard to match React designs | Doesn't match requirements |

**Implementation Strategy**:
1. Use Flowbite Svelte for base components (Button, Card, Badge, Modal, Tabs)
2. Customize Flowbite components with Tailwind utilities to match React design aesthetic
3. Create inline editing wrappers around Flowbite inputs (InlineTextEditor, InlineSelect, etc.)
4. Build domain components on top (ProjectCard, ResourceCard, etc.)
5. Override Flowbite theme variables to match modern design from React source

**Component Mapping** (React shadcn → Flowbite Svelte):

| React Component | Flowbite Component | Customization Needed |
|----------------|---------------------|----------------------|
| `<Button>` | `<Button>` | Adjust styling to match React design |
| `<Card>` | `<Card>` | Customize with Tailwind for modern look |
| `<Input>` | `<Input>` | Wrap with InlineTextEditor for blur handling |
| `<Select>` | `<Select>` | Wrap with InlineSelect for auto-save |
| `<Tabs>` | `<Tabs>` | Adjust active tab styling |
| `<Dialog>` | `<Modal>` | Customize modal styles |
| `<Sheet>` | `<Drawer>` | Use Drawer component for side panels |

**Customization Approach**:
Since React designs use shadcn/ui aesthetic, we'll customize Flowbite components:
- Override default Flowbite theme colors to match React designs
- Use Tailwind utility classes for spacing, shadows, and borders
- Create custom variants for components that need different styling
- Maintain Flowbite's accessibility and functionality while matching visual design

---

## 4. Polymorphic Entity Implementation

### Decision: TypeScript Discriminated Unions + JSONB Metadata

**Rationale**:
- **Type Safety**: Discriminated unions provide compile-time type checking for category-specific fields
- **Database Flexibility**: JSONB allows storing varying metadata without schema changes
- **Query Simplicity**: Single table simplifies joins and reduces migration complexity
- **Future Migration**: Can split into separate tables if performance degrades

**Alternatives Considered**:

| Pattern | Pros | Cons | Decision |
|---------|------|------|----------|
| **Discriminated Unions + JSONB** | Type-safe, flexible, single table, easy queries | JSONB indexes less efficient | ✅ **Selected** |
| **Separate Tables per Type** | Best query performance, clearest schema | 10+ tables, complex joins, migration overhead | Phase 2 migration option |
| **EAV (Entity-Attribute-Value)** | Maximum flexibility | Poor performance, no type safety, complex queries | Rejected |
| **Single Table Inheritance** | Standard ORM pattern | Requires ORM, many NULL columns, inflexible | Rejected |

**Implementation Pattern**:

```typescript
// lib/types/domain/resource.ts

// Enum for categories
export enum ResourceCategory {
  Prop = 'prop',
  Fabric = 'fabric',
  Wig = 'wig',
  Pattern = 'pattern',
  CostumePiece = 'costume-piece',
  Accessory = 'accessory',
  Material = 'material'
}

// Base resource (common fields)
type BaseResource = {
  id: string
  name: string
  description: string
  images: string[]
  cost?: number
  tags: string[]
  notes: string
  teamId: string
  createdAt: Date
  updatedAt: Date
}

// Category-specific metadata types
type PropMetadata = {
  category: ResourceCategory.Prop
  dimensions?: string
  weight?: string
  material?: string
  fragile: boolean
  requiresAssembly: boolean
  storageLocation?: string
}

type FabricMetadata = {
  category: ResourceCategory.Fabric
  fabricType: string
  color: string
  quantity: number
  unit: 'yards' | 'meters'
  width?: number
  stretch: boolean
  washable: boolean
}

type WigMetadata = {
  category: ResourceCategory.Wig
  color: string
  length: string
  style: string
  needsStyling: boolean
  laceType: 'none' | 'lace-front' | 'full-lace'
  heatResistant: boolean
}

// ... more metadata types

// Discriminated union
export type ResourceMetadata = 
  | PropMetadata
  | FabricMetadata
  | WigMetadata
  | PatternMetadata
  | CostumePieceMetadata
  | AccessoryMetadata
  | MaterialMetadata

// Final resource type
export type Resource = BaseResource & {
  metadata: ResourceMetadata
}

// Type guards
export function isProp(resource: Resource): resource is BaseResource & { metadata: PropMetadata } {
  return resource.metadata.category === ResourceCategory.Prop
}

export function isFabric(resource: Resource): resource is BaseResource & { metadata: FabricMetadata } {
  return resource.metadata.category === ResourceCategory.Fabric
}

// Usage with switch for exhaustiveness checking
function getResourceFields(category: ResourceCategory): FieldDefinition[] {
  switch (category) {
    case ResourceCategory.Prop:
      return propFields
    case ResourceCategory.Fabric:
      return fabricFields
    case ResourceCategory.Wig:
      return wigFields
    case ResourceCategory.Pattern:
      return patternFields
    case ResourceCategory.CostumePiece:
      return costumePieceFields
    case ResourceCategory.Accessory:
      return accessoryFields
    case ResourceCategory.Material:
      return materialFields
    default:
      // TypeScript enforces exhaustive check
      const _exhaustive: never = category
      throw new Error(`Unknown category: ${category}`)
  }
}
```

**Database Schema**:

```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT[],
  cost DECIMAL(10, 2),
  tags TEXT[],
  notes TEXT,
  metadata JSONB NOT NULL,  -- Category-specific fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category filtering
CREATE INDEX idx_resources_category ON resources ((metadata->>'category'));

-- Full-text search index for future
CREATE INDEX idx_resources_search ON resources USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

**Validation Strategy**:
- Zod schemas for runtime validation
- TypeScript types for compile-time checking
- Database constraints for data integrity

---

## 5. Auto-Save Implementation (On-Blur Pattern)

### Decision: On-Blur with Debounce Guard + Optimistic UI Updates

**Rationale** (from clarifications):
- User selected on-blur auto-save (Question 2 clarification)
- Ensures complete input before saving
- Simpler state management than continuous debounce
- Aligns with Notion/Linear patterns

**Implementation Pattern**:

```typescript
// lib/components/base/InlineTextEditor.svelte
<script lang="ts">
  interface Props {
    value: string
    editable: boolean
    onSave: (value: string) => Promise<void>
    onValidate?: (value: string) => string | null  // Returns error message or null
    placeholder?: string
    multiline?: boolean
  }
  
  let { value = $bindable(), editable, onSave, onValidate, placeholder, multiline }: Props = $props()
  
  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let lastSavedValue = $state(value)
  
  async function handleBlur() {
    if (!editable || value === lastSavedValue) return
    
    // Validate
    if (onValidate) {
      error = onValidate(value)
      if (error) return  // Don't save if invalid
    }
    
    // Optimistic update
    lastSavedValue = value
    isSaving = true
    error = null
    
    try {
      await onSave(value)
    } catch (err) {
      // Revert on error
      value = lastSavedValue
      error = err.message
    } finally {
      isSaving = false
    }
  }
</script>

{#if multiline}
  <textarea
    bind:value
    onblur={handleBlur}
    disabled={!editable}
    {placeholder}
    class:saving={isSaving}
    class:error={!!error}
  />
{:else}
  <input
    type="text"
    bind:value
    onblur={handleBlur}
    disabled={!editable}
    {placeholder}
    class:saving={isSaving}
    class:error={!!error}
  />
{/if}

{#if isSaving}
  <span class="status">Saving...</span>
{/if}

{#if error}
  <span class="error-message">{error}</span>
{/if}
```

**Best Practices**:
- Show "Saving..." indicator during save
- Show success feedback (brief checkmark)
- Show error inline with retry option
- Prevent navigation during unsaved changes
- Queue saves if multiple blurs happen quickly

---

## 6. Progress Calculation Algorithm

### Decision: Hybrid Model with Hierarchical Task Tracking

**Rationale** (from clarifications):
- User selected hybrid approach (Question 4 clarification)
- Resources can have their own tasks (e.g., "Style wig" tasks for wig resource)
- Project progress = average of (project-level task completion + resource completion)
- Resource progress = average of (status value + resource-specific task completion)

**Implementation**:

```typescript
// lib/utils/progress.ts

type ResourceStatus = 'needed' | 'acquired' | 'in-progress' | 'completed'

const STATUS_VALUES: Record<ResourceStatus, number> = {
  needed: 0,
  acquired: 0.25,
  'in-progress': 0.5,
  completed: 1.0
}

export function calculateResourceProgress(
  status: ResourceStatus,
  tasks: Task[]
): number {
  const statusValue = STATUS_VALUES[status]
  
  if (tasks.length === 0) {
    return statusValue
  }
  
  const taskCompletion = tasks.filter(t => t.completed).length / tasks.length
  
  // Average status and task completion
  return (statusValue + taskCompletion) / 2
}

export function calculateProjectProgress(
  projectTasks: Task[],
  resources: Array<{ status: ResourceStatus, tasks: Task[] }>
): number {
  // Calculate project-level task completion
  const projectTaskCompletion = projectTasks.length > 0
    ? projectTasks.filter(t => t.completed).length / projectTasks.length
    : 0
  
  // Calculate overall resource completion
  const resourceCompletion = resources.length > 0
    ? resources.reduce((sum, r) => sum + calculateResourceProgress(r.status, r.tasks), 0) / resources.length
    : 0
  
  // If only one metric available, use it
  if (projectTasks.length === 0 && resources.length > 0) {
    return resourceCompletion
  }
  if (resources.length === 0 && projectTasks.length > 0) {
    return projectTaskCompletion
  }
  if (projectTasks.length === 0 && resources.length === 0) {
    return 0
  }
  
  // Hybrid: average both metrics
  return (projectTaskCompletion + resourceCompletion) / 2
}

// Real-time reactivity with Svelte stores
export function createProgressStore(projectId: string) {
  return derived(
    [projectTasksStore, projectResourcesStore],
    ([$tasks, $resources]) => {
      const projectTasks = $tasks.filter(t => t.projectId === projectId && !t.resourceId)
      const resources = $resources
        .filter(r => r.projectId === projectId)
        .map(r => ({
          status: r.status,
          tasks: $tasks.filter(t => t.resourceId === r.resourceId)
        }))
      
      return calculateProjectProgress(projectTasks, resources)
    }
  )
}
```

**UI Display**:
- Show project progress as percentage (0-100%)
- Show breakdown: "50% tasks, 75% resources → 62.5% overall"
- Highlight resources with incomplete tasks
- Allow drilling down into resource-specific task lists

---

## 7. Team Permissions Model

### Decision: Permissive Three-Tier System (Owner/Editor/Viewer with Comments)

**Rationale** (from clarifications):
- User selected permissive model (Question 1 clarification)
- Owner: Full control
- Editor: Full content control except team management
- Viewer: Read-only + commenting ability

**Implementation with RLS**:

```sql
-- Row Level Security Policies

-- Owners can do everything
CREATE POLICY owner_all ON projects
  FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Editors can INSERT, UPDATE, DELETE content (not team settings)
CREATE POLICY editor_write ON projects
  FOR INSERT, UPDATE, DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Viewers can SELECT and INSERT comments
CREATE POLICY viewer_read ON projects
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor', 'viewer')
    )
  );

CREATE POLICY viewer_comment ON comments
  FOR INSERT
  USING (
    entity_type = 'project' AND
    entity_id IN (
      SELECT id FROM projects
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Team management restricted to owners only
CREATE POLICY team_management ON team_members
  FOR INSERT, UPDATE, DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
```

**Frontend Permission Checking**:

```typescript
// lib/auth/permissions.ts

export enum TeamRole {
  Owner = 'owner',
  Editor = 'editor',
  Viewer = 'viewer'
}

export type PermissionAction = 
  | 'read'
  | 'create'
  | 'edit'
  | 'delete'
  | 'archive'
  | 'comment'
  | 'manage_team'

export function can(role: TeamRole, action: PermissionAction): boolean {
  switch (role) {
    case TeamRole.Owner:
      return true  // Can do everything
      
    case TeamRole.Editor:
      return action !== 'manage_team'  // Everything except team management
      
    case TeamRole.Viewer:
      return action === 'read' || action === 'comment'  // Read and comment only
      
    default:
      return false
  }
}

// Usage in components
const userRole = $derived($currentTeam?.members.find(m => m.userId === $user?.id)?.role)

const canEdit = $derived(userRole && can(userRole, 'edit'))
const canDelete = $derived(userRole && can(userRole, 'delete'))
const canManageTeam = $derived(userRole && can(userRole, 'manage_team'))
```

---

## 8. Component Conversion Strategy (React → Svelte)

### Decision: Manual Conversion with Pattern Library

**Rationale**:
- Automated conversion tools (e.g., ai-jsx-to-svelte) produce poor quality
- Manual conversion ensures understanding and proper Svelte 5 idioms
- Pattern library speeds up repetitive conversions

**Conversion Patterns**:

**1. State Management**:
```typescript
// React
const [count, setCount] = useState(0)
const [name, setName] = useState('')

// Svelte 5 (runes)
let count = $state(0)
let name = $state('')
```

**2. Props**:
```typescript
// React
interface Props {
  title: string
  optional?: number
}

function Component({ title, optional = 5 }: Props) {}

// Svelte 5
interface Props {
  title: string
  optional?: number
}

let { title, optional = 5 }: Props = $props()
```

**3. Effects**:
```typescript
// React
useEffect(() => {
  // side effect
  return () => {
    // cleanup
  }
}, [dep1, dep2])

// Svelte 5
$effect(() => {
  // Automatically tracks dep1, dep2
  // side effect
  
  return () => {
    // cleanup
  }
})
```

**4. Derived Values**:
```typescript
// React
const doubled = useMemo(() => count * 2, [count])

// Svelte 5
const doubled = $derived(count * 2)
```

**5. Event Handlers**:
```jsx
// React
<button onClick={() => setCount(count + 1)}>

// Svelte
<button onclick={() => count++}>
```

**6. Conditional Rendering**:
```jsx
// React
{condition && <div>Content</div>}
{condition ? <A /> : <B />}

// Svelte
{#if condition}
  <div>Content</div>
{/if}

{#if condition}
  <A />
{:else}
  <B />
{/if}
```

**Conversion Checklist**:
- [ ] Convert useState → $state
- [ ] Convert useEffect → $effect
- [ ] Convert useMemo → $derived
- [ ] Convert props destructuring → $props()
- [ ] Convert className → class
- [ ] Convert onClick → onclick (lowercase)
- [ ] Convert {condition &&} → {#if}
- [ ] Remove React imports
- [ ] Add Svelte lang="ts" to script tag
- [ ] Test component in isolation

---

## Implementation Priorities

**Phase 0 Complete**. Ready for Phase 1 (Data Model & Contracts).

**Next Steps**:
1. Generate `data-model.md` with complete database schema
2. Generate API contracts in `contracts/` directory
3. Generate `quickstart.md` developer guide
4. Update agent context with new technologies
5. Proceed to Phase 2 (`/speckit.tasks` command) for task breakdown

---

## References

- [Fuse.js Documentation](https://fusejs.io/)
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Flowbite Svelte Documentation](https://flowbite-svelte.com/)
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)


