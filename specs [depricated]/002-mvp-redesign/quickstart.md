# Developer Quickstart: MVP Cosplay Tracker Redesign

**Last Updated**: 2025-10-30  
**Branch**: `002-mvp-redesign`  
**Prerequisites**: Bun 1.0+, Node 18+, PostgreSQL 14+, Supabase CLI

## Overview

This guide helps developers quickly set up their environment and start building the MVP Cosplay Tracker redesign. It covers installation, configuration, common workflows, and troubleshooting.

---

## Quick Start (5 minutes)

```bash
# 1. Clone and enter repository
cd /home/jek/Downloads/cosplay-tracker

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Run database migrations
bunx supabase db reset  # Creates all tables, policies, functions

# 5. Start development server
bun dev
```

**Access the app**: http://localhost:5173

---

## Environment Setup

### Required Environment Variables

Create `.env` file in project root:

```bash
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
PUBLIC_APP_URL=http://localhost:5173

# Image Storage
PUBLIC_STORAGE_BUCKET=cosplay-images
```

### Supabase Setup

1. **Create Supabase Project**: https://app.supabase.com/
2. **Get API Keys**: Settings → API → Copy `URL` and `anon` key
3. **Link Local Project**:
   ```bash
   bunx supabase link --project-ref <your-project-ref>
   ```
4. **Apply Migrations**:
   ```bash
   bunx supabase db reset
   ```

### Storage Bucket Setup

Create image storage bucket in Supabase:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('cosplay-images', 'cosplay-images', true);

-- Set bucket policies
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cosplay-images');

CREATE POLICY "Authenticated users can read images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cosplay-images');

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cosplay-images' AND auth.uid() = owner);
```

---

## Project Structure

### Key Directories

```
src/
├── lib/
│   ├── api/              # Data abstraction layer
│   │   ├── services/     # Service implementations (ideaService, projectService, etc.)
│   │   ├── supabase.ts   # Supabase client
│   │   └── types.ts      # API-specific types
│   ├── types/            # TypeScript types
│   │   ├── domain/       # UI-friendly domain models
│   │   └── api/          # API response types
│   ├── components/       # Svelte 5 components
│   │   ├── base/         # Reusable base components (InlineTextEditor, PolymorphicForm)
│   │   ├── cards/        # Entity cards (IdeaCard, ProjectCard, etc.)
│   │   ├── domain/       # Domain-specific components
│   │   └── ui/           # Flowbite Svelte components (from package)
│   ├── stores/           # Svelte stores (state management)
│   ├── utils/            # Utility functions (search, progress, image)
│   └── schemas/          # Polymorphic form schemas
├── routes/               # SvelteKit routes
│   ├── (auth)/           # Authenticated routes
│   │   ├── ideas/        # Ideas board
│   │   ├── projects/     # Projects list & detail
│   │   ├── resources/    # Resource library
│   │   ├── tools/        # Tools list
│   │   ├── photoshoots/  # Photoshoots
│   │   ├── calendar/     # Calendar view
│   │   ├── teams/        # Team management
│   │   └── settings/     # User settings
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── +layout.svelte    # Root layout
└── app.html              # HTML template

tests/
├── e2e/                  # Playwright E2E tests
├── integration/          # Vitest integration tests
└── unit/                 # Vitest unit tests

specs/002-mvp-redesign/
├── spec.md               # Feature specification
├── plan.md               # Implementation plan
├── research.md           # Technology decisions
├── data-model.md         # Database schema
├── quickstart.md         # This file
└── contracts/            # API contracts
    ├── api-schema.yaml   # OpenAPI schema
    └── types.ts          # TypeScript types
```

---

## Common Development Workflows

### 1. Create a New Entity Service

Example: Creating a service for a new entity

```typescript
// src/lib/api/services/exampleService.ts

import { supabase } from '../supabase'
import type { Example, ExampleCreate, ExampleUpdate } from '@/types/domain/example'

export const exampleService = {
  async list(teamId: string, filters = {}) {
    const { data, error } = await supabase
      .from('examples')
      .select('*')
      .eq('team_id', teamId)
    
    if (error) throw error
    return data as Example[]
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('examples')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Example
  },

  async create(teamId: string, input: ExampleCreate) {
    const { data, error } = await supabase
      .from('examples')
      .insert({ ...input, team_id: teamId })
      .select()
      .single()
    
    if (error) throw error
    return data as Example
  },

  async update(id: string, input: ExampleUpdate) {
    const { data, error } = await supabase
      .from('examples')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Example
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('examples')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
```

### 2. Create a Svelte Store

Example: Store for managing entity state

```typescript
// src/lib/stores/examples.ts

import { writable, derived } from 'svelte/store'
import { exampleService } from '@/api/services/exampleService'
import type { Example } from '@/types/domain/example'

function createExamplesStore() {
  const { subscribe, set, update } = writable<Example[]>([])
  
  return {
    subscribe,
    
    async load(teamId: string) {
      const examples = await exampleService.list(teamId)
      set(examples)
    },
    
    async create(teamId: string, input: ExampleCreate) {
      const example = await exampleService.create(teamId, input)
      update(items => [...items, example])
      return example
    },
    
    async update(id: string, input: ExampleUpdate) {
      const example = await exampleService.update(id, input)
      update(items => items.map(item => item.id === id ? example : item))
      return example
    },
    
    async delete(id: string) {
      await exampleService.delete(id)
      update(items => items.filter(item => item.id !== id))
    }
  }
}

export const examples = createExamplesStore()

// Derived store for filtered examples
export const activeExamples = derived(
  examples,
  $examples => $examples.filter(ex => ex.status === 'active')
)
```

### 3. Create a Polymorphic Form Component

Example: Form with category-based fields

```svelte
<!-- src/lib/components/base/PolymorphicForm.svelte -->
<script lang="ts">
  import { ResourceCategory } from '@/types/domain/resource'
  import type { ResourceMetadata } from '@/types/domain/resource'
  
  interface Props {
    category: ResourceCategory
    metadata: ResourceMetadata
    onUpdate: (metadata: ResourceMetadata) => void
  }
  
  let { category, metadata = $bindable(), onUpdate }: Props = $props()
  
  function handleChange() {
    onUpdate(metadata)
  }
</script>

{#if category === ResourceCategory.Prop}
  <div class="space-y-4">
    <input
      type="text"
      bind:value={metadata.dimensions}
      placeholder="Dimensions"
      onblur={handleChange}
    />
    <input
      type="text"
      bind:value={metadata.material}
      placeholder="Material"
      onblur={handleChange}
    />
    <label>
      <input type="checkbox" bind:checked={metadata.fragile} onchange={handleChange} />
      Fragile
    </label>
  </div>

{:else if category === ResourceCategory.Fabric}
  <div class="space-y-4">
    <input
      type="text"
      bind:value={metadata.fabricType}
      placeholder="Fabric Type"
      onblur={handleChange}
    />
    <input
      type="text"
      bind:value={metadata.color}
      placeholder="Color"
      onblur={handleChange}
    />
    <input
      type="number"
      bind:value={metadata.quantity}
      placeholder="Quantity"
      onblur={handleChange}
    />
    <select bind:value={metadata.unit} onchange={handleChange}>
      <option value="yards">Yards</option>
      <option value="meters">Meters</option>
    </select>
  </div>

{:else if category === ResourceCategory.Wig}
  <div class="space-y-4">
    <input
      type="text"
      bind:value={metadata.color}
      placeholder="Color"
      onblur={handleChange}
    />
    <input
      type="text"
      bind:value={metadata.length}
      placeholder="Length"
      onblur={handleChange}
    />
    <select bind:value={metadata.laceType} onchange={handleChange}>
      <option value="none">No Lace</option>
      <option value="lace-front">Lace Front</option>
      <option value="full-lace">Full Lace</option>
    </select>
  </div>

{:else}
  <p class="text-muted-foreground">Select a category to see specific fields</p>
{/if}
```

### 4. Implement Auto-Save on Blur

Example: Inline text editor with auto-save

```svelte
<!-- src/lib/components/base/InlineTextEditor.svelte -->
<script lang="ts">
  interface Props {
    value: string
    editable: boolean
    onSave: (value: string) => Promise<void>
    onValidate?: (value: string) => string | null
    placeholder?: string
  }
  
  let { value = $bindable(), editable, onSave, onValidate, placeholder }: Props = $props()
  
  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let lastSavedValue = $state(value)
  
  async function handleBlur() {
    if (!editable || value === lastSavedValue) return
    
    // Validate
    if (onValidate) {
      error = onValidate(value)
      if (error) return
    }
    
    // Save
    lastSavedValue = value
    isSaving = true
    error = null
    
    try {
      await onSave(value)
    } catch (err) {
      value = lastSavedValue
      error = err.message
    } finally {
      isSaving = false
    }
  }
</script>

<input
  type="text"
  bind:value
  onblur={handleBlur}
  disabled={!editable}
  {placeholder}
  class:saving={isSaving}
  class:error={!!error}
/>

{#if isSaving}
  <span class="text-muted-foreground text-sm">Saving...</span>
{/if}

{#if error}
  <span class="text-destructive text-sm">{error}</span>
{/if}
```

### 5. Add a New Database Migration

```bash
# Create new migration file
bunx supabase migration new add_new_table

# Edit migration file: supabase/migrations/TIMESTAMP_add_new_table.sql
```

Example migration:

```sql
-- Add new table
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_new_table_team ON new_table(team_id);

-- Add RLS policies
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY new_table_select ON new_table
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY new_table_insert ON new_table
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor') AND status = 'active'
    )
  );

-- Apply migration
bunx supabase db reset
```

### 6. Test with Playwright (E2E)

```typescript
// tests/e2e/example.spec.ts

import { test, expect } from '@playwright/test'
import { LoginPage } from './support/page-objects/LoginPage'

test.describe('Example Feature', () => {
  test('should create and view example', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'password')
    
    // Navigate to examples
    await page.goto('/examples')
    
    // Create new example
    await page.click('button:has-text("New Example")')
    await page.fill('input[name="name"]', 'Test Example')
    await page.click('button:has-text("Save")')
    
    // Verify creation
    await expect(page.locator('text=Test Example')).toBeVisible()
  })
})
```

Run E2E tests:

```bash
# Run all E2E tests
bun test:e2e

# Run specific test file
bunx playwright test tests/e2e/example.spec.ts

# Run with UI mode
bunx playwright test --ui
```

### 7. Test with Vitest (Unit/Integration)

```typescript
// tests/unit/services/exampleService.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { exampleService } from '@/api/services/exampleService'
import { setupTestSchema, cleanupTestSchema } from '@/tests/utils/test-database'

describe('exampleService', () => {
  let schemaName: string
  let teamId: string
  
  beforeEach(async () => {
    schemaName = await setupTestSchema()
    // Create test team
    teamId = 'test-team-id'
  })
  
  afterEach(async () => {
    await cleanupTestSchema(schemaName)
  })
  
  it('should create an example', async () => {
    const input = { name: 'Test Example' }
    const example = await exampleService.create(teamId, input)
    
    expect(example).toBeDefined()
    expect(example.name).toBe('Test Example')
    expect(example.teamId).toBe(teamId)
  })
  
  it('should list team examples', async () => {
    await exampleService.create(teamId, { name: 'Example 1' })
    await exampleService.create(teamId, { name: 'Example 2' })
    
    const examples = await exampleService.list(teamId)
    
    expect(examples).toHaveLength(2)
  })
})
```

Run unit tests:

```bash
# Run all unit tests
bun test

# Run specific test file
bunx vitest run tests/unit/services/exampleService.test.ts

# Run with watch mode
bunx vitest watch
```

---

## Development Scripts

```bash
# Development server with hot reload
bun dev

# Type checking
bun run check

# Linting
bun run lint

# Format code
bun run format

# Run all tests
bun test:all

# Run unit tests only
bun test

# Run integration tests
bun test:integration

# Run E2E tests
bun test:e2e

# Build for production
bun run build

# Preview production build
bun run preview

# Database migrations
bunx supabase db reset       # Reset and apply all migrations
bunx supabase db push        # Push local changes to remote
bunx supabase db pull        # Pull remote changes to local
bunx supabase migration new  # Create new migration
```

---

## Troubleshooting

### Issue: "Supabase connection failed"

**Solution**:
1. Check `.env` has correct `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
2. Verify Supabase project is active: https://app.supabase.com/
3. Check network connectivity

### Issue: "RLS policy violation"

**Solution**:
1. Ensure user is authenticated
2. Verify user is member of the team they're trying to access
3. Check RLS policies in database:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

### Issue: "Migration failed"

**Solution**:
1. Check migration syntax
2. Roll back and retry:
   ```bash
   bunx supabase db reset
   ```
3. Check for conflicting migrations

### Issue: "Image upload fails"

**Solution**:
1. Verify storage bucket exists: `cosplay-images`
2. Check storage policies allow uploads
3. Ensure file size < 10MB
4. Check browser console for errors

### Issue: "Progress calculation incorrect"

**Solution**:
1. Verify tasks have correct `resourceId` (null for project-level, ID for resource-level)
2. Check resource statuses are valid: needed/acquired/in-progress/completed
3. Run progress calculation function manually:
   ```sql
   SELECT calculate_project_progress('project-uuid');
   ```

### Issue: "Fuzzy search not working"

**Solution**:
1. Check Fuse.js is imported correctly
2. Verify search index is created for dataset
3. Adjust threshold if too strict (increase from 0.3 to 0.5)
4. Check search keys match entity properties

### Issue: "Auto-save not triggering"

**Solution**:
1. Verify `onblur` handler is attached to input
2. Check `editable` prop is true
3. Ensure `onSave` function is async and returns Promise
4. Check browser console for async errors

---

## Performance Tips

### 1. Image Optimization
- Compress images before upload using Canvas API
- Serve thumbnails in grid views, display quality in detail pages
- Use lazy loading for image grids

### 2. Query Optimization
- Use indexes for frequently filtered columns
- Limit query results with pagination
- Use `select('*')` sparingly - select only needed columns

### 3. State Management
- Use derived stores for computed values
- Avoid unnecessary store subscriptions
- Batch store updates when possible

### 4. Component Optimization
- Use `$derived` for computed values instead of `$effect`
- Minimize reactive statements
- Lazy load heavy components

---

## Related Documentation

- **Feature Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Research & Technology Decisions**: [research.md](./research.md)
- **Data Model & Schema**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api-schema.yaml](./contracts/api-schema.yaml)
- **TypeScript Types**: [contracts/types.ts](./contracts/types.ts)

## External Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes)
- [Supabase Documentation](https://supabase.com/docs)
- [Flowbite Svelte](https://flowbite-svelte.com/)
- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)

---

## Getting Help

1. **Check Existing Documentation**: Start with spec.md and plan.md
2. **Review Code Examples**: Look at existing services/components for patterns
3. **Check Test Files**: Tests often demonstrate correct usage
4. **Consult Research**: research.md has technology decisions and rationale
5. **Supabase Logs**: Check Supabase dashboard → Logs for database errors

---

**Ready to start building?** Run `bun dev` and open http://localhost:5173 🚀


