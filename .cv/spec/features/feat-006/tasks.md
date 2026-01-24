# FEAT-006 Implementation Tasks

**Feature**: Moodboard Organization & Container Detail Display Patterns  
**Created**: 2026-01-23  
**Target Timeline**: v1.0-v1.5 (1-2 months)

## Overview

This document provides detailed, junior-developer-friendly tasks for implementing FEAT-006. Tasks are organized by checkpoint (CP-001 through CP-008) and version (v1.0 through v2.0).

Each task includes:
- **What**: Clear description
- **Why**: Context and purpose
- **How**: Step-by-step implementation guide
- **Test**: How to verify it works
- **Files**: Which files to create/modify

---

## Version 1.0 - Foundation (Week 1)

### Checkpoint CP-001: Foundation & Core Nodes

---

## Task 1.0.1: Setup Database Schema for Container Nodes

**What**: Add database support for container node types (character, prop, group)  
**Why**: Containers are the core organizational feature - we need to store them  
**Capability**: CAP-002  
**Estimated Time**: 1-2 hours

### Steps

1. **Create migration file**
   ```bash
   # In terminal
   cd supabase/migrations
   # Create new migration file with timestamp
   touch $(date +%Y%m%d%H%M%S)_add_container_support_to_moodboards.sql
   ```

2. **Add container-specific columns to moodboard_nodes**
   ```sql
   -- File: supabase/migrations/YYYYMMDDHHMMSS_add_container_support_to_moodboards.sql
   
   -- Add parent_id for nested containers (NULL = root level)
   ALTER TABLE moodboard_nodes 
   ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES moodboard_nodes(id) ON DELETE CASCADE;
   
   -- Add index for hierarchy queries (performance)
   CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_parent_id 
     ON moodboard_nodes(parent_id) 
     WHERE parent_id IS NOT NULL;
   
   -- Add index for fetching children of a container
   CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_moodboard_parent 
     ON moodboard_nodes(moodboard_id, parent_id);
   
   -- Ensure node_type supports container types
   -- (Assuming node_type is TEXT, no constraint needed)
   -- If you have a CHECK constraint, update it:
   -- ALTER TABLE moodboard_nodes DROP CONSTRAINT IF EXISTS moodboard_nodes_node_type_check;
   -- ALTER TABLE moodboard_nodes ADD CONSTRAINT moodboard_nodes_node_type_check 
   --   CHECK (node_type IN ('note', 'image', 'link', 'character', 'prop', 'group', ...));
   ```

3. **Run migration**
   ```bash
   # In terminal
   supabase db push
   # Or if using local dev:
   supabase migration up
   ```

4. **Update TypeScript types**
   ```typescript
   // File: src/lib/types/domain/moodboard.ts
   
   // Add to existing BaseMoodboardNode interface
   export interface BaseMoodboardNode {
     id: string;
     moodboard_id: string;
     node_type: string;
     parent_id: string | null; // NEW: null = root level, otherwise container ID
     position_x: number;
     position_y: number;
     width: number;
     height: number;
     data: Record<string, any>;
     created_at: string;
     updated_at: string;
   }
   
   // Add new container node types
   export interface ContainerNode extends BaseMoodboardNode {
     node_type: 'character' | 'prop' | 'group';
     data: {
       name: string;
       description?: string;
       color?: string;
       icon?: string;
       image_url?: string;
       metadata?: {
         item_count?: number; // Cached count of children
         preview_items?: string[]; // IDs of first 3-5 items for preview
       };
     };
   }
   ```

### Test

1. **Check migration applied**
   ```bash
   # In terminal - connect to your database
   psql $DATABASE_URL
   
   # Check parent_id column exists
   \d moodboard_nodes
   # Should show parent_id column
   
   # Check indexes created
   \di idx_moodboard_nodes_parent_id
   ```

2. **Manual test in database**
   ```sql
   -- Create a test container node
   INSERT INTO moodboard_nodes (moodboard_id, node_type, parent_id, position_x, position_y, width, height, data)
   VALUES (
     'some-moodboard-id',
     'character',
     NULL, -- root level
     0, 0, 200, 250,
     '{"name": "Test Character", "description": "Test container"}'::jsonb
   );
   
   -- Verify it was created
   SELECT id, node_type, parent_id, data->>'name' FROM moodboard_nodes WHERE node_type = 'character';
   ```

### Files Modified
- `supabase/migrations/YYYYMMDDHHMMSS_add_container_support_to_moodboards.sql` (new)
- `src/lib/types/domain/moodboard.ts` (modified)

---

## Task 1.0.2: Create Container Node Service Functions

**What**: Create API functions to create, read, update, delete container nodes  
**Why**: We need backend logic to manage containers with proper validation  
**Capability**: CAP-002  
**Estimated Time**: 2-3 hours

### Steps

1. **Create service file**
   ```bash
   # In terminal
   mkdir -p src/lib/api/services
   touch src/lib/api/services/containerNodesService.ts
   ```

2. **Implement CRUD functions**
   ```typescript
   // File: src/lib/api/services/containerNodesService.ts
   
   import { supabase } from '$lib/supabaseClient';
   import type { ContainerNode } from '$lib/types/domain/moodboard';
   
   /**
    * Create a new container node
    */
   export async function createContainerNode(params: {
     moodboardId: string;
     nodeType: 'character' | 'prop' | 'group';
     parentId?: string | null; // Optional: parent container (null = root)
     name: string;
     description?: string;
     position: { x: number; y: number };
     color?: string;
     icon?: string;
   }): Promise<{ data: ContainerNode | null; error: any }> {
     const { moodboardId, nodeType, parentId = null, name, description, position, color, icon } = params;
     
     // Validate parent exists if provided
     if (parentId) {
       const { data: parent, error: parentError } = await supabase
         .from('moodboard_nodes')
         .select('id, node_type')
         .eq('id', parentId)
         .single();
       
       if (parentError || !parent) {
         return { data: null, error: 'Parent container not found' };
       }
       
       // Ensure parent is a container type
       if (!['character', 'prop', 'group'].includes(parent.node_type)) {
         return { data: null, error: 'Parent must be a container node' };
       }
     }
     
     // Create container node
     const { data, error } = await supabase
       .from('moodboard_nodes')
       .insert({
         moodboard_id: moodboardId,
         node_type: nodeType,
         parent_id: parentId,
         position_x: position.x,
         position_y: position.y,
         width: 200,
         height: 250,
         data: {
           name,
           description,
           color,
           icon,
           metadata: {
             item_count: 0,
             preview_items: []
           }
         }
       })
       .select()
       .single();
     
     return { data: data as ContainerNode, error };
   }
   
   /**
    * Get container node by ID with children
    */
   export async function getContainerNode(nodeId: string): Promise<{
     data: ContainerNode | null;
     children: BaseMoodboardNode[];
     error: any;
   }> {
     // Get container node
     const { data: node, error: nodeError } = await supabase
       .from('moodboard_nodes')
       .select('*')
       .eq('id', nodeId)
       .single();
     
     if (nodeError) {
       return { data: null, children: [], error: nodeError };
     }
     
     // Get children nodes (nodes with parent_id = nodeId)
     const { data: children, error: childrenError } = await supabase
       .from('moodboard_nodes')
       .select('*')
       .eq('parent_id', nodeId)
       .order('created_at', { ascending: true });
     
     return {
       data: node as ContainerNode,
       children: children || [],
       error: childrenError
     };
   }
   
   /**
    * Update container node
    */
   export async function updateContainerNode(
     nodeId: string,
     updates: Partial<ContainerNode['data']>
   ): Promise<{ data: ContainerNode | null; error: any }> {
     // Fetch current data
     const { data: current, error: fetchError } = await supabase
       .from('moodboard_nodes')
       .select('data')
       .eq('id', nodeId)
       .single();
     
     if (fetchError) {
       return { data: null, error: fetchError };
     }
     
     // Merge updates with current data
     const newData = { ...current.data, ...updates };
     
     const { data, error } = await supabase
       .from('moodboard_nodes')
       .update({ data: newData, updated_at: new Date().toISOString() })
       .eq('id', nodeId)
       .select()
       .single();
     
     return { data: data as ContainerNode, error };
   }
   
   /**
    * Delete container node (and optionally its children)
    */
   export async function deleteContainerNode(
     nodeId: string,
     options: { deleteChildren?: boolean } = {}
   ): Promise<{ error: any }> {
     const { deleteChildren = true } = options;
     
     if (deleteChildren) {
       // Cascade delete handled by ON DELETE CASCADE in migration
       const { error } = await supabase
         .from('moodboard_nodes')
         .delete()
         .eq('id', nodeId);
       
       return { error };
     } else {
       // Move children to root (parent_id = null) before deleting
       await supabase
         .from('moodboard_nodes')
         .update({ parent_id: null })
         .eq('parent_id', nodeId);
       
       const { error } = await supabase
         .from('moodboard_nodes')
         .delete()
         .eq('id', nodeId);
       
       return { error };
     }
   }
   
   /**
    * Get breadcrumb path for a container
    */
   export async function getContainerBreadcrumbs(nodeId: string): Promise<{
     data: Array<{ id: string; name: string }>;
     error: any;
   }> {
     // Recursive query to get all parents up to root
     // Using PostgreSQL recursive CTE
     const { data, error } = await supabase.rpc('get_container_path', {
       node_id: nodeId
     });
     
     return { data: data || [], error };
   }
   ```

3. **Create database function for breadcrumb path**
   ```sql
   -- File: supabase/migrations/YYYYMMDDHHMMSS_add_breadcrumb_function.sql
   
   CREATE OR REPLACE FUNCTION get_container_path(node_id UUID)
   RETURNS TABLE (id UUID, name TEXT, depth INTEGER)
   LANGUAGE plpgsql
   AS $$
   BEGIN
     RETURN QUERY
     WITH RECURSIVE path AS (
       -- Base case: start with the given node
       SELECT 
         n.id,
         n.data->>'name' AS name,
         n.parent_id,
         1 AS depth
       FROM moodboard_nodes n
       WHERE n.id = node_id
       
       UNION ALL
       
       -- Recursive case: get parent nodes
       SELECT 
         n.id,
         n.data->>'name' AS name,
         n.parent_id,
         p.depth + 1
       FROM moodboard_nodes n
       INNER JOIN path p ON n.id = p.parent_id
     )
     SELECT 
       path.id,
       path.name,
       path.depth
     FROM path
     ORDER BY depth DESC; -- Root first, current node last
   END;
   $$;
   ```

4. **Run new migration**
   ```bash
   supabase db push
   ```

### Test

1. **Unit test in browser console** (or create proper test file)
   ```typescript
   // Open your app in browser, open console
   import { createContainerNode, getContainerNode } from '$lib/api/services/containerNodesService';
   
   // Test create
   const { data: container, error } = await createContainerNode({
     moodboardId: 'your-test-moodboard-id',
     nodeType: 'character',
     name: 'Iron Man Cosplay',
     description: 'Mark 50 armor build',
     position: { x: 100, y: 100 },
     color: '#FF0000'
   });
   
   console.log('Created container:', container);
   
   // Test read
   if (container) {
     const { data: fetched, children } = await getContainerNode(container.id);
     console.log('Fetched container:', fetched);
     console.log('Children count:', children.length);
   }
   ```

2. **Test breadcrumbs function**
   ```sql
   -- In psql
   SELECT * FROM get_container_path('some-container-id');
   -- Should return path from root to node
   ```

### Files Created/Modified
- `src/lib/api/services/containerNodesService.ts` (new)
- `supabase/migrations/YYYYMMDDHHMMSS_add_breadcrumb_function.sql` (new)

---

## Task 1.0.3: Create ContainerNode Component

**What**: Build the visual component that renders a container node on the canvas  
**Why**: Users need to see and interact with containers  
**Capability**: CAP-002  
**Estimated Time**: 3-4 hours

### Steps

1. **Create component file**
   ```bash
   mkdir -p src/lib/components/moodboard/nodes
   touch src/lib/components/moodboard/nodes/ContainerNode.svelte
   ```

2. **Implement component**
   ```svelte
   <!-- File: src/lib/components/moodboard/nodes/ContainerNode.svelte -->
   <script lang="ts">
     import { Badge } from '$lib/components/ui/badge';
     import { Button } from '$lib/components/ui/button';
     import { InlineTextEditor } from '$lib/components/base/InlineTextEditor.svelte';
     import type { ContainerNode as ContainerNodeType } from '$lib/types/domain/moodboard';
     
     // Props
     interface Props {
       node: ContainerNodeType;
       variant?: 'canvas' | 'gallery' | 'list';
       selected?: boolean;
       onEnter?: () => void;
       onUpdate?: (updates: Partial<ContainerNodeType['data']>) => void;
     }
     
     let {
       node,
       variant = 'canvas',
       selected = false,
       onEnter,
       onUpdate
     }: Props = $props();
     
     // Computed values
     const itemCount = $derived(node.data.metadata?.item_count ?? 0);
     const previewItems = $derived(node.data.metadata?.preview_items ?? []);
     const containerTypeLabel = $derived(
       node.node_type === 'character' ? 'Character' :
       node.node_type === 'prop' ? 'Prop' :
       'Group'
     );
     const containerColor = $derived(node.data.color ?? '#6B7280');
     
     // Handle name update
     function handleNameUpdate(newName: string) {
       onUpdate?.({ name: newName });
     }
     
     // Handle enter (drill in)
     function handleEnter() {
       onEnter?.();
     }
   </script>
   
   <div
     class="container-node"
     class:selected
     class:canvas={variant === 'canvas'}
     class:gallery={variant === 'gallery'}
     class:list={variant === 'list'}
     style="--container-color: {containerColor}"
   >
     <!-- Header -->
     <div class="container-header">
       <Badge variant="secondary" class="type-badge">
         {containerTypeLabel}
       </Badge>
       {#if itemCount > 0}
         <Badge variant="outline" class="count-badge">
           {itemCount} items
         </Badge>
       {/if}
     </div>
     
     <!-- Body -->
     <div class="container-body">
       {#if node.data.image_url}
         <img src={node.data.image_url} alt={node.data.name} class="container-image" />
       {:else}
         <div class="container-icon">
           {#if node.node_type === 'character'}
             <svg><!-- Character icon --></svg>
           {:else if node.node_type === 'prop'}
             <svg><!-- Prop icon --></svg>
           {:else}
             <svg><!-- Group icon --></svg>
           {/if}
         </div>
       {/if}
       
       <!-- Name (editable inline) -->
       <div class="container-name">
         <InlineTextEditor
           value={node.data.name}
           onSave={handleNameUpdate}
           placeholder="Container name"
         />
       </div>
       
       {#if variant !== 'canvas' && node.data.description}
         <p class="container-description">
           {node.data.description}
         </p>
       {/if}
       
       <!-- Preview thumbnails (if has items) -->
       {#if previewItems.length > 0}
         <div class="preview-grid">
           {#each previewItems.slice(0, 6) as itemId}
             <div class="preview-thumb">
               <!-- Thumbnail rendering (simplified) -->
               <div class="preview-placeholder"></div>
             </div>
           {/each}
         </div>
       {/if}
     </div>
     
     <!-- Footer / Enter button -->
     <div class="container-footer">
       <Button onclick={handleEnter} variant="secondary" class="enter-btn">
         Open →
       </Button>
     </div>
   </div>
   
   <style>
     .container-node {
       display: flex;
       flex-direction: column;
       background: white;
       border: 2px solid #e5e7eb;
       border-radius: 8px;
       box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
       overflow: hidden;
       transition: all 0.2s;
     }
     
     .container-node:hover {
       box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
     }
     
     .container-node.selected {
       border-color: var(--container-color);
       box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
     }
     
     /* Canvas variant */
     .container-node.canvas {
       width: 200px;
       height: 250px;
     }
     
     /* Gallery variant */
     .container-node.gallery {
       width: 250px;
       height: 300px;
     }
     
     /* List variant */
     .container-node.list {
       flex-direction: row;
       height: 60px;
       width: 100%;
     }
     
     .container-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 8px 12px;
       background: #f9fafb;
       border-bottom: 1px solid #e5e7eb;
     }
     
     .container-body {
       flex: 1;
       display: flex;
       flex-direction: column;
       padding: 12px;
       overflow: hidden;
     }
     
     .container-image {
       width: 100%;
       height: 120px;
       object-fit: cover;
       border-radius: 4px;
       margin-bottom: 8px;
     }
     
     .container-icon {
       width: 100%;
       height: 80px;
       display: flex;
       align-items: center;
       justify-content: center;
       color: var(--container-color);
       margin-bottom: 8px;
     }
     
     .container-icon svg {
       width: 48px;
       height: 48px;
     }
     
     .container-name {
       font-weight: 600;
       font-size: 14px;
       margin-bottom: 4px;
     }
     
     .container-description {
       font-size: 12px;
       color: #6b7280;
       line-height: 1.4;
       display: -webkit-box;
       -webkit-line-clamp: 2;
       -webkit-box-orient: vertical;
       overflow: hidden;
     }
     
     .preview-grid {
       display: grid;
       grid-template-columns: repeat(3, 1fr);
       gap: 4px;
       margin-top: 8px;
     }
     
     .preview-thumb {
       aspect-ratio: 1;
       background: #f3f4f6;
       border-radius: 2px;
       overflow: hidden;
     }
     
     .preview-placeholder {
       width: 100%;
       height: 100%;
       background: linear-gradient(135deg, #f3f4f6 25%, #e5e7eb 25%, #e5e7eb 50%, #f3f4f6 50%, #f3f4f6 75%, #e5e7eb 75%);
       background-size: 20px 20px;
     }
     
     .container-footer {
       padding: 8px 12px;
       border-top: 1px solid #e5e7eb;
     }
     
     .enter-btn {
       width: 100%;
     }
     
     /* List variant specific */
     .container-node.list .container-body {
       flex-direction: row;
       gap: 12px;
       align-items: center;
     }
     
     .container-node.list .container-icon {
       width: 40px;
       height: 40px;
       margin: 0;
     }
     
     .container-node.list .preview-grid {
       display: none;
     }
   </style>
   ```

3. **Add container type icons** (using Lucide icons)
   ```bash
   npm install lucide-svelte
   ```
   
   Update component to use icons:
   ```svelte
   <script>
     import { User, Package, Folder } from 'lucide-svelte';
     // ... rest of script
   </script>
   
   <!-- In the icon section: -->
   <div class="container-icon">
     {#if node.node_type === 'character'}
       <User size={48} />
     {:else if node.node_type === 'prop'}
       <Package size={48} />
     {:else}
       <Folder size={48} />
     {/if}
   </div>
   ```

### Test

1. **Create a test page**
   ```svelte
   <!-- File: src/routes/test/container-node/+page.svelte -->
   <script lang="ts">
     import ContainerNode from '$lib/components/moodboard/nodes/ContainerNode.svelte';
     import type { ContainerNode as ContainerNodeType } from '$lib/types/domain/moodboard';
     
     const testNode: ContainerNodeType = {
       id: 'test-1',
       moodboard_id: 'test-board',
       node_type: 'character',
       parent_id: null,
       position_x: 0,
       position_y: 0,
       width: 200,
       height: 250,
       data: {
         name: 'Iron Man Cosplay',
         description: 'Mark 50 armor build with LED effects',
         color: '#dc2626',
         metadata: {
           item_count: 12,
           preview_items: ['1', '2', '3', '4', '5', '6']
         }
       },
       created_at: new Date().toISOString(),
       updated_at: new Date().toISOString()
     };
     
     let selected = $state(false);
     
     function handleEnter() {
       console.log('Enter container:', testNode.id);
       alert('Drilling into container!');
     }
     
     function handleUpdate(updates) {
       console.log('Update container:', updates);
     }
   </script>
   
   <div class="test-page">
     <h1>ContainerNode Component Test</h1>
     
     <label>
       <input type="checkbox" bind:checked={selected} />
       Selected
     </label>
     
     <div class="test-grid">
       <div>
         <h3>Canvas Variant</h3>
         <ContainerNode
           node={testNode}
           variant="canvas"
           {selected}
           onEnter={handleEnter}
           onUpdate={handleUpdate}
         />
       </div>
       
       <div>
         <h3>Gallery Variant</h3>
         <ContainerNode
           node={testNode}
           variant="gallery"
           {selected}
           onEnter={handleEnter}
           onUpdate={handleUpdate}
         />
       </div>
       
       <div style="width: 100%;">
         <h3>List Variant</h3>
         <ContainerNode
           node={testNode}
           variant="list"
           {selected}
           onEnter={handleEnter}
           onUpdate={handleUpdate}
         />
       </div>
     </div>
   </div>
   
   <style>
     .test-page {
       padding: 24px;
       max-width: 1200px;
       margin: 0 auto;
     }
     
     .test-grid {
       display: grid;
       grid-template-columns: auto auto;
       gap: 24px;
       margin-top: 24px;
     }
     
     .test-grid > div:last-child {
       grid-column: 1 / -1;
     }
   </style>
   ```

2. **Visit test page**
   - Navigate to `http://localhost:5173/test/container-node`
   - Verify all three variants render correctly
   - Test inline name editing (click on name)
   - Test "Open →" button (should show alert)
   - Test selected state (checkbox)

3. **Visual checklist**
   - [ ] Container renders with correct icon (User/Package/Folder)
   - [ ] Type badge shows (Character/Prop/Group)
   - [ ] Item count badge shows "12 items"
   - [ ] Preview grid shows 6 thumbnails
   - [ ] Name is editable inline
   - [ ] "Open →" button works
   - [ ] Selected state shows blue border
   - [ ] Hover shows shadow effect

### Files Created/Modified
- `src/lib/components/moodboard/nodes/ContainerNode.svelte` (new)
- `src/routes/test/container-node/+page.svelte` (new, for testing)
- `package.json` (modified - added lucide-svelte)

---

## Task 1.0.4: Create InspectorPanel Component

**What**: Build the right-side panel that shows container details  
**Why**: Solves the context loss problem - users can see container info while drilled in  
**Capability**: CAP-004  
**Estimated Time**: 4-5 hours

### Steps

1. **Create component file**
   ```bash
   touch src/lib/components/moodboard/InspectorPanel.svelte
   ```

2. **Implement component structure**
   ```svelte
   <!-- File: src/lib/components/moodboard/InspectorPanel.svelte -->
   <script lang="ts">
     import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
     import { Button } from '$lib/components/ui/button';
     import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
     import { Badge } from '$lib/components/ui/badge';
     import { InlineTextEditor } from '$lib/components/base/InlineTextEditor.svelte';
     import { TagSelector } from '$lib/components/base/TagSelector.svelte';
     import { X, Pin, PinOff } from 'lucide-svelte';
     import type { MoodboardNode } from '$lib/types/domain/moodboard';
     
     interface Props {
       selectedNode: MoodboardNode | null;
       isOpen: boolean;
       isPinned?: boolean;
       width?: number; // Desktop only
       onClose?: () => void;
       onPinToggle?: () => void;
       onNodeUpdate?: (nodeId: string, updates: any) => void;
     }
     
     let {
       selectedNode = $bindable(),
       isOpen = $bindable(),
       isPinned = $bindable(false),
       width = 300,
       onClose,
       onPinToggle,
       onNodeUpdate
     }: Props = $props();
     
     // Responsive detection
     let isMobile = $state(false);
     let isTablet = $state(false);
     
     $effect(() => {
       // Check viewport size
       const checkViewport = () => {
         isMobile = window.innerWidth < 768;
         isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
       };
       checkViewport();
       window.addEventListener('resize', checkViewport);
       return () => window.removeEventListener('resize', checkViewport);
     });
     
     // Close handler
     function handleClose() {
       if (!isPinned || isMobile) {
         isOpen = false;
         onClose?.();
       }
     }
     
     // Pin toggle
     function handlePinToggle() {
       isPinned = !isPinned;
       onPinToggle?.();
     }
     
     // Node property updates
     function handleNameUpdate(newName: string) {
       if (selectedNode) {
         onNodeUpdate?.(selectedNode.id, { name: newName });
       }
     }
     
     function handleTagsUpdate(newTags: string[]) {
       if (selectedNode) {
         onNodeUpdate?.(selectedNode.id, { tags: newTags });
       }
     }
   </script>
   
   {#if isMobile}
     <!-- Mobile: Bottom sheet -->
     <Sheet open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
       <SheetContent side="bottom" class="inspector-sheet-mobile">
         <SheetHeader>
           <div class="inspector-header">
             {#if selectedNode}
               <Badge variant="secondary">{selectedNode.node_type}</Badge>
             {/if}
             <SheetTitle>
               {selectedNode?.data?.name ?? 'Node Details'}
             </SheetTitle>
             <Button variant="ghost" size="icon" onclick={handleClose}>
               <X size={20} />
             </Button>
           </div>
         </SheetHeader>
         
         {#if selectedNode}
           <div class="inspector-content">
             {@render inspectorContent(selectedNode)}
           </div>
         {/if}
       </SheetContent>
     </Sheet>
   {:else}
     <!-- Desktop/Tablet: Side panel -->
     {#if isOpen && selectedNode}
       <aside
         class="inspector-panel"
         class:pinned={isPinned}
         style="width: {width}px;"
       >
         <!-- Header -->
         <div class="inspector-header">
           <Badge variant="secondary">{selectedNode.node_type}</Badge>
           <div class="inspector-actions">
             <Button
               variant="ghost"
               size="icon"
               onclick={handlePinToggle}
               title={isPinned ? 'Unpin' : 'Pin'}
             >
               {#if isPinned}
                 <PinOff size={18} />
               {:else}
                 <Pin size={18} />
               {/if}
             </Button>
             <Button variant="ghost" size="icon" onclick={handleClose}>
               <X size={18} />
             </Button>
           </div>
         </div>
         
         <!-- Content -->
         <div class="inspector-content">
           {@render inspectorContent(selectedNode)}
         </div>
       </aside>
     {/if}
   {/if}
   
   {#snippet inspectorContent(node: MoodboardNode)}
     <Tabs defaultValue="details" class="inspector-tabs">
       <TabsList class="w-full">
         <TabsTrigger value="details" class="flex-1">Details</TabsTrigger>
         <TabsTrigger value="connections" class="flex-1">Connections</TabsTrigger>
       </TabsList>
       
       <TabsContent value="details" class="inspector-tab-content">
         <!-- Node Name -->
         <div class="inspector-field">
           <label class="field-label">Name</label>
           <InlineTextEditor
             value={node.data.name}
             onSave={handleNameUpdate}
             placeholder="Node name"
           />
         </div>
         
         <!-- Node Type -->
         <div class="inspector-field">
           <label class="field-label">Type</label>
           <Badge variant="outline">{node.node_type}</Badge>
         </div>
         
         <!-- Tags -->
         <div class="inspector-field">
           <label class="field-label">Tags</label>
           <TagSelector
             tags={node.data.tags ?? []}
             onUpdate={handleTagsUpdate}
           />
         </div>
         
         <!-- Type-specific fields -->
         {#if node.node_type === 'character' || node.node_type === 'prop' || node.node_type === 'group'}
           {@render containerFields(node)}
         {/if}
         
         <!-- Metadata -->
         <div class="inspector-field">
           <label class="field-label">Created</label>
           <p class="field-value text-muted">
             {new Date(node.created_at).toLocaleDateString()}
           </p>
         </div>
         
         <div class="inspector-field">
           <label class="field-label">Modified</label>
           <p class="field-value text-muted">
             {new Date(node.updated_at).toLocaleDateString()}
           </p>
         </div>
       </TabsContent>
       
       <TabsContent value="connections" class="inspector-tab-content">
         <p class="text-muted">Connections coming in v1.5</p>
         <!-- TODO: Show edges connected to this node -->
       </TabsContent>
     </Tabs>
   {/snippet}
   
   {#snippet containerFields(node)}
     <div class="inspector-field">
       <label class="field-label">Description</label>
       <InlineTextEditor
         value={node.data.description ?? ''}
         onSave={(val) => onNodeUpdate?.(node.id, { description: val })}
         placeholder="Add description"
         multiline
       />
     </div>
     
     <div class="inspector-field">
       <label class="field-label">Items</label>
       <p class="field-value">
         {node.data.metadata?.item_count ?? 0} items
       </p>
     </div>
   {/snippet}
   
   <style>
     /* Desktop/Tablet Panel */
     .inspector-panel {
       position: fixed;
       top: 64px; /* Below navbar */
       right: 0;
       bottom: 0;
       background: white;
       border-left: 1px solid #e5e7eb;
       box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
       display: flex;
       flex-direction: column;
       z-index: 40;
       transition: transform 0.3s ease;
     }
     
     .inspector-panel.pinned {
       /* Pinned stays open */
     }
     
     /* Header */
     .inspector-header {
       display: flex;
       align-items: center;
       gap: 8px;
       padding: 16px;
       border-bottom: 1px solid #e5e7eb;
       background: #f9fafb;
     }
     
     .inspector-header :global(.badge) {
       flex-shrink: 0;
     }
     
     .inspector-actions {
       display: flex;
       gap: 4px;
       margin-left: auto;
     }
     
     /* Content */
     .inspector-content {
       flex: 1;
       overflow-y: auto;
       padding: 16px;
     }
     
     /* Fields */
     .inspector-field {
       margin-bottom: 20px;
     }
     
     .field-label {
       display: block;
       font-size: 12px;
       font-weight: 600;
       color: #6b7280;
       text-transform: uppercase;
       letter-spacing: 0.05em;
       margin-bottom: 8px;
     }
     
     .field-value {
       font-size: 14px;
       color: #111827;
     }
     
     .field-value.text-muted {
       color: #6b7280;
     }
     
     /* Tabs */
     .inspector-tabs {
       height: 100%;
       display: flex;
       flex-direction: column;
     }
     
     .inspector-tab-content {
       flex: 1;
       overflow-y: auto;
       padding-top: 16px;
     }
     
     /* Mobile Sheet */
     :global(.inspector-sheet-mobile) {
       max-height: 70vh;
     }
     
     /* Responsive */
     @media (max-width: 768px) {
       .inspector-panel {
         display: none; /* Use sheet instead */
       }
     }
   </style>
   ```

### Test

1. **Update test page to include inspector**
   ```svelte
   <!-- File: src/routes/test/inspector/+page.svelte -->
   <script lang="ts">
     import ContainerNode from '$lib/components/moodboard/nodes/ContainerNode.svelte';
     import InspectorPanel from '$lib/components/moodboard/InspectorPanel.svelte';
     import { Button } from '$lib/components/ui/button';
     import type { ContainerNode as ContainerNodeType } from '$lib/types/domain/moodboard';
     
     let testNode = $state<ContainerNodeType>({
       id: 'test-1',
       moodboard_id: 'test-board',
       node_type: 'character',
       parent_id: null,
       position_x: 0,
       position_y: 0,
       width: 200,
       height: 250,
       data: {
         name: 'Iron Man Cosplay',
         description: 'Mark 50 armor build with LED effects',
         color: '#dc2626',
         tags: ['armor', 'led', 'marvel'],
         metadata: {
           item_count: 12,
           preview_items: []
         }
       },
       created_at: '2026-01-20T10:00:00Z',
       updated_at: '2026-01-23T15:30:00Z'
     });
     
     let inspectorOpen = $state(false);
     let inspectorPinned = $state(false);
     
     function handleNodeSelect() {
       inspectorOpen = true;
     }
     
     function handleNodeUpdate(nodeId: string, updates: any) {
       console.log('Update node:', nodeId, updates);
       testNode.data = { ...testNode.data, ...updates };
     }
   </script>
   
   <div class="test-page">
     <h1>InspectorPanel Test</h1>
     
     <div class="controls">
       <Button onclick={() => inspectorOpen = !inspectorOpen}>
         Toggle Inspector
       </Button>
       <label>
         <input type="checkbox" bind:checked={inspectorPinned} />
         Pinned
       </label>
     </div>
     
     <div class="canvas-area">
       <ContainerNode
         node={testNode}
         variant="canvas"
         selected={inspectorOpen}
         onEnter={handleNodeSelect}
       />
     </div>
     
     <InspectorPanel
       selectedNode={testNode}
       bind:isOpen={inspectorOpen}
       bind:isPinned={inspectorPinned}
       onNodeUpdate={handleNodeUpdate}
     />
   </div>
   
   <style>
     .test-page {
       min-height: 100vh;
       background: #f3f4f6;
     }
     
     .controls {
       padding: 16px;
       background: white;
       border-bottom: 1px solid #e5e7eb;
       display: flex;
       gap: 16px;
       align-items: center;
     }
     
     .canvas-area {
       padding: 48px;
     }
   </style>
   ```

2. **Test checklist**
   - [ ] Desktop: Panel appears on right side
   - [ ] Mobile: Sheet appears from bottom
   - [ ] Pin button works (panel stays open)
   - [ ] Close button works
   - [ ] Tabs switch (Details/Connections)
   - [ ] Name inline editing works
   - [ ] Tags can be added/removed
   - [ ] Description editing works
   - [ ] Created/Modified dates display

### Files Created/Modified
- `src/lib/components/moodboard/InspectorPanel.svelte` (new)
- `src/routes/test/inspector/+page.svelte` (new)

---

I'll continue with more tasks in the next response. Would you like me to continue with:
- Task 1.0.5: Create ContextBar Component
- Task 1.0.6: Setup breadcrumb navigation
- Task 1.0.7: Integrate with @xyflow/svelte canvas
- And so on...

Or would you like me to adjust the level of detail in these tasks first?