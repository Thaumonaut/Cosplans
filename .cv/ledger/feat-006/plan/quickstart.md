# Quickstart Guide - Feature 006: Moodboarding

**For Developers**: Get started implementing the Enhanced Brainstorming & Moodboarding feature

---

## Prerequisites

- Feature 004 (Idea title refactoring) must be deployed
- Supabase database access
- Node.js 18+ and Bun installed
- Familiarity with SvelteKit and TypeScript

---

## 1. Install Dependencies

```bash
# Core canvas library
bun add @xyflow/svelte

# URL metadata extraction (Phase 1 MVP)
bun add unfurl.js  # or metascraper + plugins

# OAuth for commenting
bun add @supabase/auth-helpers-sveltekit

# Table component (choose one after research validates)
bun add @tanstack/svelte-table
# OR
bun add svelte-headless-table

# Development dependencies
bun add -d @types/node
```

---

## 2. Database Setup

### Run Migrations

```bash
# Apply all Feature 006 migrations
bunx supabase db push

# Migrations should be created in order:
# 20260108000010_create_moodboard_nodes.sql
# 20260108000020_create_moodboard_edges.sql
# 20260108000030_create_idea_options.sql
# 20260108000040_create_budget_items.sql
# 20260108000050_create_contacts.sql
# 20260108000060_create_moodboard_shares.sql
# 20260108000070_create_moodboard_comments.sql
# 20260108000080_create_tutorials.sql
# 20260108000090_modify_ideas_projects.sql
```

### Verify Tables

```bash
# Check tables exist
bunx supabase db diff --linked

# Test RLS policies
bunx supabase db test
```

---

## 3. Set Up OAuth Providers

### Supabase Dashboard Configuration

1. Navigate to Authentication > Providers in Supabase Dashboard
2. Enable Google OAuth:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`
3. Enable GitHub OAuth (optional):
   - Client ID: (from GitHub OAuth Apps)
   - Client Secret: (from GitHub OAuth Apps)

### Environment Variables

```env
# .env.local
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth callback URL
PUBLIC_SITE_URL=http://localhost:5173
```

---

## 4. Project Structure

```
src/
├── lib/
│   ├── components/
│   │   └── moodboard/
│   │       ├── MoodboardCanvas.svelte          # Svelte Flow wrapper
│   │       ├── nodes/
│   │       │   ├── ImageNode.svelte
│   │       │   ├── SocialMediaNode.svelte
│   │       │   ├── TextNode.svelte
│   │       │   ├── BudgetItemNode.svelte
│   │       │   └── ContactNode.svelte
│   │       ├── CustomEdge.svelte               # Labeled edges
│   │       ├── CanvasControls.svelte           # Zoom, pan controls
│   │       ├── ViewSwitcher.svelte             # Switch between views
│   │       ├── MoodboardTableView.svelte       # Table view
│   │       ├── MoodboardTimelineView.svelte    # Timeline view
│   │       ├── MoodboardGalleryView.svelte     # Pinterest grid
│   │       ├── MoodboardListView.svelte        # Compact list
│   │       ├── MoodboardGraphView.svelte       # Network graph
│   │       ├── AddContentModal.svelte          # Add node modal
│   │       ├── ShareMoodboard.svelte           # Sharing controls
│   │       └── BudgetItemizer.svelte           # Budget form
│   │
│   ├── api/
│   │   └── services/
│   │       ├── moodboardService.ts             # Moodboard CRUD
│   │       ├── urlParserService.ts             # URL metadata extraction
│   │       ├── budgetService.ts                # Budget operations
│   │       ├── contactService.ts               # Contact management
│   │       └── shareService.ts                 # Sharing & comments
│   │
│   ├── types/
│   │   └── moodboard.ts                        # TypeScript interfaces
│   │
│   └── stores/
│       └── moodboard.ts                        # Svelte stores for state
│
├── routes/
│   ├── (auth)/
│   │   └── ideas/
│   │       └── [id]/
│   │           └── moodboard/
│   │               └── +page.svelte            # Main moodboard page
│   │
│   └── share/
│       └── moodboard/
│           └── [token]/
│               └── +page.svelte                # Public share view
│
└── tests/
    ├── unit/
    │   ├── urlParser.test.ts
    │   └── budgetCalculations.test.ts
    ├── integration/
    │   ├── moodboard-api.test.ts
    │   └── sharing.test.ts
    └── e2e/
        ├── moodboard/
        │   ├── social-media-integration.spec.ts
        │   ├── view-switching.spec.ts
        │   └── sharing.spec.ts
        └── budget/
            └── budget-management.spec.ts
```

---

## 5. Implement Core Services

### URL Parser Service (Phase 1 MVP)

```typescript
// src/lib/api/services/urlParserService.ts
import { unfurl } from 'unfurl.js';

export async function parseUrl(url: string) {
  try {
    const metadata = await unfurl(url);
    
    return {
      platform: detectPlatform(url),
      title: metadata.title || metadata.open_graph?.title,
      description: metadata.description || metadata.open_graph?.description,
      thumbnailUrl: metadata.open_graph?.images?.[0]?.url,
      author: metadata.twitter_card?.creator,
      embedHtml: metadata.oEmbed?.html,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    // Fallback: return basic link data
    return {
      platform: 'other',
      title: url,
      thumbnailUrl: null,
      extractedAt: new Date().toISOString()
    };
  }
}

function detectPlatform(url: string): string {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('pinterest.com')) return 'pinterest';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('facebook.com')) return 'facebook';
  return 'other';
}
```

### Moodboard Service

```typescript
// src/lib/api/services/moodboardService.ts
import { supabase } from '$lib/supabaseClient';
import type { MoodboardNode, CreateMoodboardNodeRequest } from '$lib/types/moodboard';

export const moodboardService = {
  async getNodes(ideaId: string): Promise<MoodboardNode[]> {
    const { data, error } = await supabase
      .from('moodboard_nodes')
      .select(`
        *,
        connection_count:moodboard_edges(count)
      `)
      .eq('idea_id', ideaId)
      .order('z_index', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  async createNode(ideaId: string, request: CreateMoodboardNodeRequest): Promise<MoodboardNode> {
    const { data, error } = await supabase
      .from('moodboard_nodes')
      .insert({
        idea_id: ideaId,
        ...request
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async updateNode(nodeId: string, updates: Partial<MoodboardNode>): Promise<MoodboardNode> {
    const { data, error } = await supabase
      .from('moodboard_nodes')
      .update(updates)
      .eq('id', nodeId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async deleteNode(nodeId: string): Promise<void> {
    const { error } = await supabase
      .from('moodboard_nodes')
      .delete()
      .eq('id', nodeId);
    
    if (error) throw error;
  }
};
```

---

## 6. Implement Svelte Flow Canvas

### Basic Canvas Setup

```svelte
<!-- src/lib/components/moodboard/MoodboardCanvas.svelte -->
<script lang="ts">
  import { SvelteFlow, Controls, Background, MiniMap } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  
  import ImageNode from './nodes/ImageNode.svelte';
  import SocialMediaNode from './nodes/SocialMediaNode.svelte';
  import TextNode from './nodes/TextNode.svelte';
  import BudgetItemNode from './nodes/BudgetItemNode.svelte';
  import ContactNode from './nodes/ContactNode.svelte';
  import CustomEdge from './CustomEdge.svelte';
  
  import { moodboardService } from '$lib/api/services/moodboardService';
  
  export let ideaId: string;
  
  let nodes = $state([]);
  let edges = $state([]);
  
  const nodeTypes = {
    image: ImageNode,
    social_media: SocialMediaNode,
    note: TextNode,
    budget_item: BudgetItemNode,
    contact: ContactNode
  };
  
  const edgeTypes = {
    default: CustomEdge
  };
  
  // Load moodboard data
  async function loadMoodboard() {
    const nodesData = await moodboardService.getNodes(ideaId);
    const edgesData = await moodboardService.getEdges(ideaId);
    
    nodes = nodesData.map(n => ({
      id: n.id,
      type: n.node_type,
      position: { x: n.position_x, y: n.position_y },
      data: {
        ...n,
        onUpdate: handleNodeUpdate,
        onDelete: handleNodeDelete
      }
    }));
    
    edges = edgesData.map(e => ({
      id: e.id,
      source: e.source_node_id,
      target: e.target_node_id,
      type: 'default',
      data: {
        label: e.label,
        edgeType: e.edge_type
      }
    }));
  }
  
  function handleNodeUpdate(nodeId: string, updates: any) {
    // Update node in database
    moodboardService.updateNode(nodeId, updates);
  }
  
  function handleNodeDelete(nodeId: string) {
    moodboardService.deleteNode(nodeId);
    nodes = nodes.filter(n => n.id !== nodeId);
  }
  
  function onNodeDragStop(event) {
    const node = event.detail.node;
    moodboardService.updateNode(node.id, {
      position_x: node.position.x,
      position_y: node.position.y
    });
  }
  
  $effect(() => {
    loadMoodboard();
  });
</script>

<div class="moodboard-canvas">
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    {edgeTypes}
    onNodeDragStop={onNodeDragStop}
    fitView
  >
    <Controls />
    <MiniMap />
    <Background />
  </SvelteFlow>
</div>

<style>
  .moodboard-canvas {
    width: 100%;
    height: 100vh;
  }
</style>
```

### Custom Node Example

```svelte
<!-- src/lib/components/moodboard/nodes/ImageNode.svelte -->
<script lang="ts">
  import type { NodeProps } from '@xyflow/svelte';
  
  type $$Props = NodeProps;
  
  export let data: $$Props['data'];
  
  const { thumbnailUrl, tags, shortComment, onUpdate, onDelete } = data;
  
  let isEditing = $state(false);
  let editedComment = $state(shortComment);
  
  function handleSave() {
    onUpdate(data.id, { short_comment: editedComment });
    isEditing = false;
  }
</script>

<div class="image-node">
  <div class="node-header">
    <span class="node-icon">🖼️</span>
    <span class="node-type">Image</span>
    <button class="delete-btn" onclick={() => onDelete(data.id)}>×</button>
  </div>
  
  <div class="node-content">
    <img src={thumbnailUrl} alt="Moodboard image" />
  </div>
  
  <div class="node-footer">
    {#if tags?.length > 0}
      <div class="tags">
        {#each tags as tag}
          <span class="tag">#{tag}</span>
        {/each}
      </div>
    {/if}
    
    {#if isEditing}
      <input bind:value={editedComment} on:blur={handleSave} />
    {:else}
      <p onclick={() => isEditing = true}>{shortComment || 'Add comment...'}</p>
    {/if}
  </div>
</div>

<style>
  .image-node {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    min-width: 300px;
    overflow: hidden;
  }
  
  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .node-content img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .node-footer {
    padding: 12px;
  }
  
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }
  
  .tag {
    background: #e0e7ff;
    color: #4c51bf;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
  }
</style>
```

---

## 7. Testing Strategy

### Write Tests FIRST (TDD Approach)

#### Example: URL Parser Test

```typescript
// tests/unit/urlParser.test.ts
import { describe, test, expect } from 'bun:test';
import { parseUrl } from '$lib/api/services/urlParserService';

describe('URL Parser Service', () => {
  test('should extract metadata from Instagram URL', async () => {
    const url = 'https://www.instagram.com/p/example/';
    const metadata = await parseUrl(url);
    
    expect(metadata.platform).toBe('instagram');
    expect(metadata.title).toBeDefined();
    expect(metadata.thumbnailUrl).toBeDefined();
  });
  
  test('should fallback gracefully on invalid URL', async () => {
    const url = 'https://invalid-url.com/404';
    const metadata = await parseUrl(url);
    
    expect(metadata.platform).toBe('other');
    expect(metadata.title).toBe(url);
  });
});
```

#### Example: E2E Test

```typescript
// tests/e2e/moodboard/social-media-integration.spec.ts
import { test, expect } from '@playwright/test';

test('user can paste Instagram URL and see preview', async ({ page }) => {
  await page.goto('/ideas/123/moodboard');
  
  // Open add content modal
  await page.click('[data-testid="add-content-button"]');
  
  // Paste URL
  await page.fill('[data-testid="url-input"]', 'https://instagram.com/p/example');
  await page.click('[data-testid="add-url-button"]');
  
  // Wait for node to appear
  await expect(page.locator('[data-testid="moodboard-node"]')).toBeVisible();
  await expect(page.locator('[data-testid="node-thumbnail"]')).toHaveAttribute('src', /.+/);
});
```

---

## 8. Development Workflow

### Phase 1: MVP (Weeks 1-3)

1. **Week 1**: Database + Basic Canvas
   - Run migrations
   - Implement moodboard service
   - Basic Svelte Flow canvas with 1-2 node types
   - Test: Can create and display nodes
   
2. **Week 2**: URL Parsing + Social Media Nodes
   - Implement unfurl.js integration
   - Create SocialMediaNode component
   - Test: Can paste URLs and see previews
   
3. **Week 3**: Gallery View + Budget Items
   - Implement MoodboardGalleryView
   - Create budget_items table operations
   - Test: View switching works, budget items CRUD

### Phase 2: Core Features (Weeks 4-6)

1. **Week 4**: Multiple Options + Budget Integration
   - Implement idea_options
   - Connect budget items to options
   - Test: Multiple options with separate budgets
   
2. **Week 5**: Sharing + Comments
   - Implement share token generation
   - OAuth setup for comments
   - Public share view
   - Test: Can share and comment
   
3. **Week 6**: Additional Views (Table, Timeline, List)
   - Implement remaining view components
   - View state persistence
   - Test: All views render same data

### Phase 3: Polish (Weeks 7-8)

1. **Week 7**: Contact Management + Edges
   - Implement contact CRUD
   - Edge creation UI
   - Test: Can link contacts to budget items
   
2. **Week 8**: UI Polish + Performance
   - Animation refinements
   - Mobile responsiveness
   - Performance optimization
   - Test: 60fps with 100+ nodes

---

## 9. Common Patterns

### Reactive State with Svelte 5

```typescript
// Use $state for reactive values
let nodes = $state([]);
let selectedNode = $state(null);

// Use $derived for computed values
let totalBudget = $derived(() => {
  return budgetItems.reduce((sum, item) => sum + item.estimated_cost, 0);
});

// Use $effect for side effects
$effect(() => {
  // Load data when ideaId changes
  if (ideaId) {
    loadMoodboard(ideaId);
  }
});
```

### Error Handling

```typescript
try {
  const node = await moodboardService.createNode(ideaId, nodeData);
  toast.success('Node created successfully');
} catch (error) {
  if (error.code === '23503') {
    toast.error('Invalid idea ID');
  } else if (error.code === '42501') {
    toast.error('Permission denied');
  } else {
    toast.error('Failed to create node');
  }
  console.error(error);
}
```

### Optimistic Updates

```typescript
function handleNodeUpdate(nodeId, updates) {
  // Update UI immediately
  nodes = nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n);
  
  // Update database in background
  moodboardService.updateNode(nodeId, updates)
    .catch(error => {
      // Rollback on error
      loadMoodboard();
      toast.error('Update failed');
    });
}
```

---

## 10. Debugging Tips

### Check RLS Policies

```sql
-- Test if user can view nodes
SELECT * FROM moodboard_nodes WHERE idea_id = 'your-idea-id';

-- Check active policies
SELECT * FROM pg_policies WHERE tablename = 'moodboard_nodes';
```

### Svelte Flow DevTools

```typescript
// Enable debug mode
<SvelteFlow
  nodes={nodes}
  edges={edges}
  debug={true}  // Shows helpful debug info
/>
```

### Common Issues

1. **Nodes not appearing**: Check RLS policies, verify idea_id exists
2. **Position not saving**: Ensure onNodeDragStop handler calls API
3. **Edges not connecting**: Verify both nodes exist and belong to same idea
4. **OAuth redirect failing**: Check PUBLIC_SITE_URL matches Supabase config

---

## 11. Performance Checklist

- [ ] Use virtualization for large lists (table, gallery views)
- [ ] Lazy load images with `loading="lazy"`
- [ ] Debounce position updates during drag
- [ ] Use indexes on frequently queried columns
- [ ] Cache URL parsing results
- [ ] Optimize Svelte Flow render with `shouldUpdate` prop
- [ ] Use CDN for thumbnail storage
- [ ] Implement pagination for comments

---

## 12. Next Steps

After completing MVP:

1. **Collect UI/UX references** (as specified in spec)
2. **Design mockups** based on references
3. **Implement remaining views** (Table, Timeline, Graph)
4. **Add Phase 2 features** (Official platform APIs)
5. **Performance optimization** for 200+ nodes
6. **Mobile-specific optimizations**

---

## Resources

- [Svelte Flow Documentation](https://svelteflow.dev)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/sveltekit)
- [OpenAPI Spec](../contracts/moodboard-api.yaml)
- [Data Model](./data-model.md)
- [Feature Spec](../spec.md)

---

## Support

Questions? Check:
1. Feature spec for requirements
2. Data model for schema details
3. API contracts for endpoint definitions
4. Test files for usage examples

Happy coding! 🎨
