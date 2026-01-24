# FEAT-006 Implementation Tasks - Complete Roadmap (v1.0 - v2.0)

**Feature**: Moodboard Organization & Container Detail Display Patterns  
**Created**: 2026-01-23  
**Target Timeline**: 1-2 months (AI-assisted development)  
**Current State**: Foundation complete (CP-01), Canvas Editor in progress (CP-02)

## Document Overview

This document provides the complete task breakdown for FEAT-006 from current state through v2.0. Tasks are organized by version and checkpoint, building on existing work documented in:
- `FEAT-006.tasks.md` (original tasks, T-001 through T-035)
- `T-015-container-dnd-implementation.md` (container drag-drop)
- New capability-based specifications (CAP-001 through CAP-020)

---

## Current State Summary

### ✅ Completed (from original FEAT-006.tasks.md)

**Checkpoint CP-01 (Foundation):**
- T-001: Database migration for moodboards table ✅
- T-002: Database migration for hierarchical nodes ✅
- T-003: Create moodboardsService ✅
- T-004: Auto-create moodboards on entity creation ✅
- T-005: Create moodboard routes ✅
- T-006: Create basic node CRUD operations ✅

**Checkpoint CP-02 (Canvas Editor) - Partial:**
- T-015: Container card types (partially complete, needs final wiring)

### 🔧 In Progress
- T-007: Install and configure Svelte Flow
- T-008: Create base MoodboardNode component
- T-008.5: Create canvas context menu
- T-009: Implement drill-in navigation for containers
- T-010: Implement position persistence

### 📋 Planned
- Remaining canvas editor tasks (T-010 through T-014)
- Card types (T-016 through T-020)
- Mobile capture (T-021 through T-024)
- Integration tasks (T-025 through T-028)
- Sharing & polish (T-029 through T-035)

---

## Version 1.0 - Foundation & Core Containers (Week 1)

**Goal**: Complete container nodes with inspector panel and drill-in navigation  
**Capabilities**: CAP-002 (Containers), CAP-004 (Inspector Panel)

### Task Group: Complete Canvas Foundation

#### T-036: Finalize Svelte Flow Integration
**Status**: Needs completion  
**Depends on**: T-007  
**Time**: 2-3 hours  
**Capability**: CAP-002

**What**: Complete the @xyflow/svelte canvas setup with proper node rendering

**Steps**:
1. Verify @xyflow/svelte is installed and configured
2. Ensure custom node types work with container nodes
3. Test zoom, pan, and touch gestures
4. Add grid snapping (20px snap)
5. Configure 48px touch targets for mobile

**Test**:
- [ ] Canvas renders without errors
- [ ] Can zoom in/out with mouse wheel and pinch
- [ ] Can pan by dragging canvas background
- [ ] Nodes snap to 20px grid
- [ ] Touch targets are 48px minimum

**Files**:
- `src/lib/components/moodboard/MoodboardCanvas.svelte` (verify/enhance)

---

#### T-037: Wire Up Container Drag-and-Drop (Complete T-015)
**Status**: Nearly done, needs final wiring  
**Depends on**: T-015  
**Time**: 1 hour  
**Capability**: CAP-002

**What**: Apply the patches from T-015-PATCH.md to complete drag-drop functionality

**Steps**:
1. Add `ContainerDropZone` import to `+page.svelte`
2. Add `onMoveToContainer` prop to gallery NodeCards
3. Test dragging cards into containers
4. Verify containers cannot be nested

**Test**:
- [ ] Can drag reference card onto container (blue highlight)
- [ ] Card moves into container after drop
- [ ] Can drill into container to see moved card
- [ ] Cannot drag container onto another container
- [ ] Changes persist after reload

**Files**:
- `src/routes/(auth)/moodboard/[id]/+page.svelte` (apply patches)

---

#### T-038: Create InspectorPanel Component
**Status**: New task  
**Depends on**: T-006  
**Time**: 4-5 hours  
**Capability**: CAP-004

**What**: Build the right-side panel that shows selected node/container details

**Steps**:
1. Create `src/lib/components/moodboard/InspectorPanel.svelte`
2. Implement responsive layout:
   - Desktop: Fixed right panel (300px, resizable 250-500px)
   - Mobile: Bottom sheet (slide-up drawer)
3. Add tabs: Details, Connections (connections v1.5)
4. Implement inline editing for all properties
5. Add pin/unpin functionality
6. Show parent container context when inside nested container

**Details**:
```svelte
<!-- Desktop structure -->
<aside class="inspector-panel" style="width: {width}px">
  <header>
    <Badge>{node.node_type}</Badge>
    <Button onclick={togglePin}>Pin</Button>
    <Button onclick={close}>×</Button>
  </header>
  
  <Tabs>
    <Tab value="details">
      <!-- Name, description, tags, metadata -->
      <InlineTextEditor value={node.data.name} />
      <TagSelector tags={node.data.tags} />
      <!-- Type-specific fields -->
    </Tab>
    <Tab value="connections">
      <!-- Coming in v1.5 -->
    </Tab>
  </Tabs>
</aside>

<!-- Mobile: use ui/sheet.svelte instead -->
```

**Reuses**:
- `ui/sheet.svelte` - Mobile drawer
- `ui/tabs.svelte` - Tab navigation
- `ui/button.svelte`, `ui/badge.svelte`
- `base/InlineTextEditor.svelte`, `base/TagSelector.svelte`

**Test**:
- [ ] Desktop: Panel appears on right side when node selected
- [ ] Mobile: Sheet slides up from bottom
- [ ] Pin button keeps panel open between selections
- [ ] Inline editing saves changes
- [ ] Panel closes with X button or clicking outside (if not pinned)

**Files**:
- `src/lib/components/moodboard/InspectorPanel.svelte` (new)
- `src/routes/(auth)/moodboard/[id]/+page.svelte` (integrate)

---

#### T-039: Create ContextBar Component
**Status**: New task  
**Depends on**: T-009  
**Time**: 2-3 hours  
**Capability**: CAP-004

**What**: Show parent container details when drilled into nested container

**Steps**:
1. Create `src/lib/components/moodboard/ContextBar.svelte`
2. Display parent container thumbnail + name
3. Show breadcrumb path (Home > Container A > Container B)
4. Make collapsible on mobile (progressive disclosure)
5. Integrate with drill-in navigation

**Details**:
```svelte
<div class="context-bar" class:collapsed={isCollapsed}>
  <!-- Collapse button (mobile) -->
  <Button onclick={toggleCollapse}>☰</Button>
  
  {#if !isCollapsed}
    <!-- Parent container card -->
    <div class="parent-preview">
      <img src={parent.thumbnail} />
      <span>{parent.name}</span>
    </div>
    
    <!-- Breadcrumb -->
    <Breadcrumbs path={breadcrumbPath} onClick={navigateTo} />
  {/if}
</div>
```

**Reuses**:
- `base/Breadcrumbs.svelte` - Enhance for container navigation
- `ui/button.svelte`

**Test**:
- [ ] Context bar appears when inside container
- [ ] Shows parent container info
- [ ] Breadcrumb navigates correctly
- [ ] Mobile: Defaults to collapsed state
- [ ] Desktop: Always expanded

**Files**:
- `src/lib/components/moodboard/ContextBar.svelte` (new)
- `src/routes/(auth)/moodboard/[id]/+page.svelte` (integrate)

---

#### T-040: Complete Drill-In Navigation (Finish T-009)
**Status**: In progress  
**Depends on**: T-038, T-039  
**Time**: 3-4 hours  
**Capability**: CAP-002

**What**: Finalize container drill-in/drill-out navigation with proper state management

**Steps**:
1. Enhance drill-in logic to update URL with container ID
2. Update breadcrumb path when drilling in
3. Add "Back" button functionality
4. Update inspector to show container context
5. Test deep nesting (5+ levels)

**URL Structure**:
- Root: `/moodboard/[id]`
- Nested: `/moodboard/[id]?container=[container_id]`
- Browser back button should work

**Test**:
- [ ] Clicking "Open" on container drills in
- [ ] URL updates with ?container=X
- [ ] Breadcrumb shows full path
- [ ] Browser back button navigates out
- [ ] Inspector shows parent context
- [ ] Deep nesting (5 levels) works

**Files**:
- `src/routes/(auth)/moodboard/[id]/+page.svelte` (enhance)

---

### Task Group: Position Persistence & State Management

#### T-041: Implement Canvas Position Persistence (Complete T-010)
**Status**: Needs implementation  
**Depends on**: T-036  
**Time**: 2-3 hours  
**Capability**: CAP-002

**What**: Save node positions when dragged, update database

**Steps**:
1. Add drag end handler to canvas
2. Debounce position updates (500ms)
3. Batch update multiple nodes if multi-select dragged
4. Show "Saving..." indicator during update
5. Optimistic UI update (don't wait for DB)

**Service Function**:
```typescript
// In moodboardsService.ts
export async function updateNodePosition(
  nodeId: string,
  position: { x: number; y: number }
): Promise<void> {
  await supabase
    .from('moodboard_nodes')
    .update({
      position_x: position.x,
      position_y: position.y,
      updated_at: new Date().toISOString()
    })
    .eq('id', nodeId);
}
```

**Test**:
- [ ] Drag node, position saves to database
- [ ] Reload page, node appears at saved position
- [ ] Multiple nodes can be dragged at once (batch update)
- [ ] No flickering during save

**Files**:
- `src/lib/api/services/moodboardsService.ts` (add function)
- `src/lib/components/moodboard/MoodboardCanvas.svelte` (add handler)

---

#### T-042: State Management & Stores
**Status**: Enhance existing store  
**Depends on**: T-003  
**Time**: 2-3 hours

**What**: Enhance moodboard store for new architecture

**Steps**:
1. Update `src/lib/stores/moodboard.ts` for hierarchical structure
2. Add reactive state for:
   - Current container ID
   - Breadcrumb path
   - Selected node(s)
   - Inspector open/pinned state
3. Add actions for drill-in/out
4. Add derived stores for filtered views

**Store Structure**:
```typescript
// src/lib/stores/moodboard.ts
export const moodboardStore = writable({
  moodboard: null,
  nodes: [],
  edges: [],
  currentContainerId: null,
  breadcrumbPath: [],
  selectedNodeIds: new Set(),
  inspectorOpen: false,
  inspectorPinned: false
});

// Derived stores
export const currentNodes = derived(
  moodboardStore,
  $store => $store.nodes.filter(n => n.parent_id === $store.currentContainerId)
);
```

**Test**:
- [ ] Store updates reactively
- [ ] Drill-in updates currentContainerId
- [ ] Breadcrumb path syncs
- [ ] Selection state persists during navigation

**Files**:
- `src/lib/stores/moodboard.ts` (enhance)

---

## Version 1.1 - Ghost Nodes (Week 1-2)

**Goal**: Implement ghost nodes for cross-container visibility  
**Capabilities**: CAP-003

### Task Group: Ghost Node Implementation

#### T-043: Create Ghost Node Computation Utilities
**Status**: New task  
**Time**: 2-3 hours  
**Capability**: CAP-003

**What**: Create client-side functions to compute ghost nodes from edges

**Steps**:
1. Create `src/lib/utils/moodboard/ghostNodes.ts`
2. Implement `computeGhostNodes()` function
3. Logic: For each edge, if one endpoint is outside current container, create ghost
4. Return ghost nodes with metadata (source path, edge ID, opacity)

**Function Signature**:
```typescript
export function computeGhostNodes(
  currentContainerId: string | null,
  allNodes: MoodboardNode[],
  allEdges: MoodboardEdge[]
): ComputedGhostNode[] {
  // 1. Get local node IDs (nodes in current container)
  const localNodeIds = new Set(
    allNodes
      .filter(n => n.parent_id === currentContainerId)
      .map(n => n.id)
  );
  
  // 2. Find edges with one endpoint local, one external
  const externalConnections = allEdges.filter(e =>
    (localNodeIds.has(e.source) && !localNodeIds.has(e.target)) ||
    (localNodeIds.has(e.target) && !localNodeIds.has(e.source))
  );
  
  // 3. Create ghost for each external node
  const ghosts = externalConnections.map(edge => {
    const externalNodeId = localNodeIds.has(edge.source) ? edge.target : edge.source;
    const originalNode = allNodes.find(n => n.id === externalNodeId);
    
    return {
      ...originalNode,
      is_ghost: true,
      ghost_data: {
        ghost_of: externalNodeId,
        source_path: getNodePath(externalNodeId, allNodes),
        edge_id: edge.id
      },
      opacity: 0.4
    };
  });
  
  return ghosts;
}

function getNodePath(nodeId: string, allNodes: MoodboardNode[]): string[] {
  // Recursive path generation
  // Returns: ['Container A', 'Container B', 'Node Name']
}
```

**Test**:
- [ ] Returns empty array when no edges
- [ ] Creates ghost for external connected nodes
- [ ] Does not create ghost for internal connections
- [ ] Ghost has correct source_path

**Files**:
- `src/lib/utils/moodboard/ghostNodes.ts` (new)

---

#### T-044: Create GhostNode Component
**Status**: New task  
**Depends on**: T-043  
**Time**: 2-3 hours  
**Capability**: CAP-003

**What**: Visual component for rendering ghost nodes

**Steps**:
1. Create `src/lib/components/moodboard/nodes/GhostNode.svelte`
2. Wrap any node type with ghost styling (40% opacity, dashed border)
3. Add ghost icon badge (👻)
4. Click handler opens "Go to source" dialog
5. Prevent editing (read-only)

**Component**:
```svelte
<script>
  import { Dialog } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  
  let { node, onGoToSource } = $props();
  let showDialog = $state(false);
</script>

<div class="ghost-node" style="opacity: 0.4">
  <div class="ghost-badge">👻</div>
  
  <!-- Render original node type -->
  {#if node.node_type === 'character'}
    <ContainerNode {node} readonly />
  {:else if node.node_type === 'image'}
    <ImageNode {node} readonly />
  {/if}
  
  <!-- Click overlay -->
  <div class="ghost-overlay" onclick={() => showDialog = true} />
</div>

<Dialog open={showDialog}>
  <p>This node lives in: {node.ghost_data.source_path.join(' > ')}</p>
  <Button onclick={onGoToSource}>Go to source</Button>
</Dialog>
```

**Test**:
- [ ] Ghost renders at 40% opacity
- [ ] Has dashed border and ghost badge
- [ ] Click opens dialog with source path
- [ ] "Go to source" navigates correctly
- [ ] Cannot edit ghost node

**Files**:
- `src/lib/components/moodboard/nodes/GhostNode.svelte` (new)

---

#### T-045: Integrate Ghost Nodes into Canvas
**Status**: New task  
**Depends on**: T-044  
**Time**: 2-3 hours  
**Capability**: CAP-003

**What**: Add ghost node computation to canvas rendering

**Steps**:
1. Update `+page.svelte` to compute ghosts when inside container
2. Add ghosts to node list (after real nodes)
3. Handle "Go to source" navigation
4. Test performance with 50+ nodes

**Integration**:
```svelte
<script>
  import { computeGhostNodes } from '$lib/utils/moodboard/ghostNodes';
  
  // Compute ghosts when inside container
  const nodesWithGhosts = $derived(() => {
    if (!currentContainerId) return nodes;
    
    const ghosts = computeGhostNodes(currentContainerId, nodes, edges);
    return [...nodes, ...ghosts];
  });
  
  function handleGoToSource(ghostNode) {
    // Navigate to ghost's source container
    navigateToNode(ghostNode.ghost_data.ghost_of);
  }
</script>

<MoodboardCanvas nodes={nodesWithGhosts} />
```

**Test**:
- [ ] Ghosts appear when inside container with external edges
- [ ] No ghosts at root level (no edges yet in v1.1)
- [ ] Click ghost navigates to source
- [ ] Performance: <100ms computation for 50 nodes

**Files**:
- `src/routes/(auth)/moodboard/[id]/+page.svelte` (enhance)

---

## Version 1.2 - Planning Nodes (Week 2-3)

**Goal**: Add event, contact, and checklist node types  
**Capabilities**: CAP-007, CAP-008, CAP-009

### Task Group: Event Nodes

#### T-046: Database Schema for Event Nodes
**Status**: New task  
**Time**: 1-2 hours  
**Capability**: CAP-007

**What**: Add event-specific columns to moodboard_nodes

**Steps**:
1. Create migration to add `event_data` JSONB column
2. Create index on event start_date for queries
3. Add calendar provider enum

**Migration**:
```sql
-- File: supabase/migrations/YYYYMMDDHHMMSS_add_event_nodes.sql

ALTER TABLE moodboard_nodes 
ADD COLUMN IF NOT EXISTS event_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_moodboard_nodes_event_date
  ON moodboard_nodes((event_data->>'start_date'))
  WHERE node_type = 'event';

-- event_data structure:
-- {
--   "start_date": "2026-02-15T14:00:00Z",
--   "end_date": "2026-02-15T18:00:00Z",
--   "location": "Convention Center",
--   "calendar_provider": "google",
--   "calendar_event_id": "abc123",
--   "sync_status": "synced",
--   "reminder_enabled": true
-- }
```

**Test**:
- [ ] Migration applies cleanly
- [ ] Can insert event node with event_data
- [ ] Index improves query performance

**Files**:
- `supabase/migrations/YYYYMMDDHHMMSS_add_event_nodes.sql` (new)

---

#### T-047: Create EventNode Component
**Status**: New task  
**Depends on**: T-046  
**Time**: 3-4 hours  
**Capability**: CAP-007

**What**: Visual component for event nodes with calendar integration

**Steps**:
1. Create `src/lib/components/moodboard/nodes/EventNode.svelte`
2. Display date/time prominently
3. Show countdown ("in 3 days")
4. Calendar provider badge
5. Sync status indicator
6. Link to calendar event

**Component**:
```svelte
<script>
  import { Badge } from '$lib/components/ui/badge';
  import { Calendar } from 'lucide-svelte';
  
  let { node, variant = 'canvas' } = $props();
  
  const eventData = node.event_data;
  const startDate = new Date(eventData.start_date);
  const isPast = startDate < new Date();
  
  // Countdown calculation
  const timeUntil = $derived(() => {
    const diff = startDate - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `in ${days} days` : 'today';
  });
</script>

<div class="event-node" class:past={isPast}>
  <div class="event-header">
    <Calendar size={20} />
    <Badge>{eventData.calendar_provider}</Badge>
    {#if eventData.sync_status === 'synced'}
      <span class="sync-indicator">✓</span>
    {/if}
  </div>
  
  <div class="event-body">
    <h3>{node.data.name}</h3>
    <div class="event-date">
      {startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })}
    </div>
    {#if !isPast}
      <div class="countdown">{timeUntil()}</div>
    {/if}
    {#if eventData.location}
      <div class="location">📍 {eventData.location}</div>
    {/if}
  </div>
</div>

<style>
  .event-node.past {
    opacity: 0.6;
    filter: grayscale(50%);
  }
  
  .countdown {
    font-weight: 600;
    color: #3b82f6;
  }
</style>
```

**Test**:
- [ ] Event node renders with date/time
- [ ] Countdown updates dynamically
- [ ] Past events show grayed out
- [ ] Calendar badge shows provider
- [ ] Sync indicator appears when synced

**Files**:
- `src/lib/components/moodboard/nodes/EventNode.svelte` (new)

---

#### T-048: Implement Calendar Sync Service
**Status**: New task  
**Depends on**: T-047  
**Time**: 6-8 hours  
**Capability**: CAP-007

**What**: OAuth integration with Google, Apple, Outlook calendars

**Steps**:
1. Create `src/lib/api/services/calendarService.ts`
2. Implement OAuth flows for each provider
3. Create/update/delete calendar events
4. Polling sync (every 15 minutes)
5. Store tokens securely in backend

**Service Structure**:
```typescript
// src/lib/api/services/calendarService.ts

interface CalendarProvider {
  name: 'google' | 'apple' | 'outlook';
  authorize(): Promise<AuthToken>;
  createEvent(event: CalendarEvent): Promise<string>;
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  fetchEvent(eventId: string): Promise<CalendarEvent>;
}

class GoogleCalendarProvider implements CalendarProvider {
  // Google Calendar API implementation
}

class OutlookCalendarProvider implements CalendarProvider {
  // Microsoft Graph API implementation
}

export async function syncEventToCalendar(
  nodeId: string,
  provider: 'google' | 'apple' | 'outlook'
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  // Implementation
}
```

**Notes**:
- OAuth tokens stored in backend (encrypted)
- API calls proxied through backend (security)
- Implement in phases: Google first, then Outlook, then Apple

**Test**:
- [ ] OAuth flow works for Google Calendar
- [ ] Event created in Google Calendar
- [ ] Event updates sync to calendar
- [ ] Poll detects calendar changes

**Files**:
- `src/lib/api/services/calendarService.ts` (new)
- Backend API routes for OAuth (TBD)

---

### Task Group: Contact Nodes

#### T-049: Database Schema for Contacts
**Status**: New task  
**Time**: 1-2 hours  
**Capability**: CAP-008

**What**: Create global contacts table

**Migration**:
```sql
-- File: supabase/migrations/YYYYMMDDHHMMSS_create_contacts_table.sql

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Add to moodboard_nodes
ALTER TABLE moodboard_nodes
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);

CREATE INDEX idx_moodboard_nodes_contact_id
  ON moodboard_nodes(contact_id)
  WHERE node_type = 'contact';
```

**Test**:
- [ ] Can create contact
- [ ] Contact nodes reference global contacts
- [ ] Updates to contact propagate to all nodes

**Files**:
- `supabase/migrations/YYYYMMDDHHMMSS_create_contacts_table.sql` (new)

---

#### T-050: Create ContactNode Component
**Status**: New task  
**Depends on**: T-049  
**Time**: 3-4 hours  
**Capability**: CAP-008

**What**: Visual component for contact nodes

**Steps**:
1. Create `src/lib/components/moodboard/nodes/ContactNode.svelte`
2. Display avatar (80px circle)
3. Show name and role
4. Contact action icons (email, phone, social)
5. Quick actions (mailto:, tel:, social links)

**Component**:
```svelte
<script>
  import { Avatar } from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import { Mail, Phone, ExternalLink } from 'lucide-svelte';
  
  let { node } = $props();
  const contact = node.contact_data; // Populated via join
</script>

<div class="contact-node">
  <Avatar src={contact.avatar_url} alt={contact.name} size="lg" />
  
  <div class="contact-info">
    <h3>{contact.name}</h3>
    {#if contact.role}
      <Badge variant="secondary">{contact.role}</Badge>
    {/if}
  </div>
  
  <div class="contact-actions">
    {#if contact.email}
      <a href="mailto:{contact.email}">
        <Mail size={18} />
      </a>
    {/if}
    {#if contact.phone}
      <a href="tel:{contact.phone}">
        <Phone size={18} />
      </a>
    {/if}
    {#each contact.social_links as link}
      <a href={link.url} target="_blank">
        <ExternalLink size={18} />
      </a>
    {/each}
  </div>
</div>
```

**Test**:
- [ ] Contact card renders with avatar
- [ ] Email icon opens mailto: link
- [ ] Phone icon opens tel: link (mobile)
- [ ] Social links open in new tab
- [ ] Editing contact updates all instances

**Files**:
- `src/lib/components/moodboard/nodes/ContactNode.svelte` (new)

---

### Task Group: Checklist Nodes

#### T-051: Database Schema for Checklists
**Status**: New task  
**Time**: 1 hour  
**Capability**: CAP-009

**What**: Add checklist_data JSONB column

**Migration**:
```sql
ALTER TABLE moodboard_nodes
ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT NULL;

-- checklist_data structure:
-- {
--   "items": [
--     {
--       "id": "uuid",
--       "text": "Buy fabric",
--       "completed": false,
--       "notes": "Red satin",
--       "order": 0,
--       "parent_id": null,
--       "created_at": "2026-01-23T...",
--       "completed_at": null
--     }
--   ],
--   "show_progress": true,
--   "due_date": null
-- }
```

**Files**:
- `supabase/migrations/YYYYMMDDHHMMSS_add_checklist_nodes.sql` (new)

---

#### T-052: Create ChecklistNode Component
**Status**: New task  
**Depends on**: T-051  
**Time**: 4-5 hours  
**Capability**: CAP-009

**What**: Interactive checklist with progress tracking

**Steps**:
1. Create `src/lib/components/moodboard/nodes/ChecklistNode.svelte`
2. Show progress bar
3. Render first 3-5 uncompleted items
4. Checkbox interactions
5. Inline item editing
6. Add item button
7. Celebration animation at 100%

**Component Features**:
- Collapsible completed items
- Nested sub-items (indent)
- Drag to reorder
- Enter key to add new item

**Test**:
- [ ] Progress bar updates when items checked
- [ ] Items can be added/edited/deleted
- [ ] Reordering works (drag handle)
- [ ] 100% completion shows celebration
- [ ] Compact view shows first 3-5 items

**Files**:
- `src/lib/components/moodboard/nodes/ChecklistNode.svelte` (new)

---

## Version 1.3 - Visual Tools (Week 3-4)

**Goal**: Add sketch tool and compare nodes  
**Capabilities**: CAP-011, CAP-012

### Task Group: Sketch Tool

#### T-053: Database Schema for Sketches
**Status**: New task  
**Time**: 1 hour  
**Capability**: CAP-011

**Migration**:
```sql
ALTER TABLE moodboard_nodes
ADD COLUMN IF NOT EXISTS sketch_data JSONB DEFAULT NULL;

-- sketch_data structure:
-- {
--   "image_url": "storage/sketches/uuid.jpg",
--   "image_width": 1920,
--   "image_height": 1080,
--   "annotations": [
--     {
--       "id": "uuid",
--       "type": "path" | "line" | "rect" | "circle" | "text",
--       "data": {...},
--       "style": {
--         "color": "#FF0000",
--         "stroke_width": 3,
--         "opacity": 1.0
--       }
--     }
--   ],
--   "scale": {
--     "reference_pixels": 100,
--     "real_units": 10,
--     "unit": "cm"
--   }
-- }
```

**Files**:
- `supabase/migrations/YYYYMMDDHHMMSS_add_sketch_nodes.sql` (new)

---

#### T-054: Create SketchNode Component
**Status**: New task  
**Depends on**: T-053  
**Time**: 2 hours  
**Capability**: CAP-011

**What**: Display sketch node with annotations overlayed (static)

**Steps**:
1. Create `src/lib/components/moodboard/nodes/SketchNode.svelte`
2. Render image with SVG annotations overlay
3. Show annotation count badge
4. Click to open SketchEditor

**Test**:
- [ ] Image renders with annotations
- [ ] Annotations visible as static overlay
- [ ] Click opens sketch editor

**Files**:
- `src/lib/components/moodboard/nodes/SketchNode.svelte` (new)

---

#### T-055: Create SketchEditor Component
**Status**: New task  
**Depends on**: T-054  
**Time**: 8-10 hours  
**Capability**: CAP-011

**What**: Full-screen annotation editor with drawing tools

**Steps**:
1. Create `src/lib/components/moodboard/SketchEditor.svelte`
2. Implement drawing tools:
   - Pencil (freehand)
   - Pen (bezier curves)
   - Line (with arrows)
   - Rectangle, Circle
   - Text
   - Eraser
3. Tool properties: color, size, opacity
4. Undo/redo (Ctrl+Z/Y)
5. Save annotations as SVG paths
6. Export PNG with annotations

**Large Task - Break Down**:
- T-055a: Canvas setup and image loading (2h)
- T-055b: Implement pencil and pen tools (2h)
- T-055c: Implement shapes (line, rect, circle) (2h)
- T-055d: Implement text tool (1h)
- T-055e: Tool properties panel (1h)
- T-055f: Undo/redo system (2h)

**Test**:
- [ ] Can draw freehand lines
- [ ] Can add shapes and text
- [ ] Undo/redo works
- [ ] Saves annotations to database
- [ ] Export PNG includes annotations

**Files**:
- `src/lib/components/moodboard/SketchEditor.svelte` (new)

---

### Task Group: Compare Nodes

#### T-056: Database Schema for Compare Nodes
**Status**: New task  
**Time**: 1 hour  
**Capability**: CAP-012

**Migration**:
```sql
ALTER TABLE moodboard_nodes
ADD COLUMN IF NOT EXISTS compare_data JSONB DEFAULT NULL;

-- compare_data structure:
-- {
--   "items": [
--     {"node_id": "uuid1", "label": "Option A"},
--     {"node_id": "uuid2", "label": "Option B"}
--   ],
--   "mode": "side-by-side" | "stacked" | "overlay" | "slider",
--   "settings": {
--     "sync_zoom": true,
--     "show_labels": true
--   }
-- }
```

**Files**:
- `supabase/migrations/YYYYMMDDHHMMSS_add_compare_nodes.sql` (new)

---

#### T-057: Create CompareNode Component
**Status**: New task  
**Depends on**: T-056  
**Time**: 2-3 hours  
**Capability**: CAP-012

**What**: Display compare node with thumbnails

**Steps**:
1. Create `src/lib/components/moodboard/nodes/CompareNode.svelte`
2. Show 2x2 or 1x2 grid of compared item thumbnails
3. Labels below each thumbnail
4. Mode indicator badge
5. Click to open ComparisonView

**Test**:
- [ ] Shows thumbnails of compared items
- [ ] Mode badge displays
- [ ] Click opens full comparison

**Files**:
- `src/lib/components/moodboard/nodes/CompareNode.svelte` (new)

---

#### T-058: Create ComparisonView Component
**Status**: New task  
**Depends on**: T-057  
**Time**: 6-8 hours  
**Capability**: CAP-012

**What**: Full-screen comparison modal with multiple modes

**Steps**:
1. Create `src/lib/components/moodboard/ComparisonView.svelte`
2. Implement comparison modes:
   - Side-by-side (horizontal)
   - Stacked (vertical)
   - Overlay (layered with opacity sliders)
   - Slider (before/after divider)
3. Synchronized zoom/pan
4. Mode switcher tabs
5. Export as PNG

**Large Task - Break Down**:
- T-058a: Modal structure and mode switcher (2h)
- T-058b: Side-by-side and stacked layouts (2h)
- T-058c: Overlay mode with opacity controls (2h)
- T-058d: Slider mode (before/after) (2h)
- T-058e: Synchronized zoom/pan (2h)
- T-058f: Export functionality (1h)

**Test**:
- [ ] All 4 modes work correctly
- [ ] Zoom/pan syncs across items
- [ ] Can export comparison as PNG
- [ ] Mobile: Touch gestures work

**Files**:
- `src/lib/components/moodboard/ComparisonView.svelte` (new)

---

## Version 1.4 - Power User Features (Week 4-5)

**Goal**: Batch operations, CSV import/export, list view  
**Capabilities**: CAP-013, CAP-016, CAP-017, CAP-018

### Task Group: Batch Operations

#### T-059: Implement Marquee Selection
**Status**: New task  
**Time**: 3-4 hours  
**Capability**: CAP-013

**What**: Click-drag to select multiple nodes on canvas

**Steps**:
1. Add mouse down/move/up handlers to canvas
2. Draw selection rectangle (dashed border)
3. Highlight nodes inside rectangle
4. Finalize selection on mouse up
5. Support Shift+click (add to selection), Ctrl+click (toggle)

**Test**:
- [ ] Drag creates selection box
- [ ] Nodes inside box get selected
- [ ] Shift+click adds to selection
- [ ] Ctrl+click toggles individual nodes
- [ ] Escape deselects all

**Files**:
- `src/lib/components/moodboard/MoodboardCanvas.svelte` (enhance)

---

#### T-060: Create BatchActionToolbar Component
**Status**: New task  
**Depends on**: T-059  
**Time**: 4-5 hours  
**Capability**: CAP-013

**What**: Floating toolbar for multi-selection actions

**Steps**:
1. Create `src/lib/components/moodboard/BatchActionToolbar.svelte`
2. Position above selection center
3. Actions: Group, Tag, Color, Link, Delete
4. "More" dropdown for additional actions
5. Confirmation dialogs for destructive actions

**Test**:
- [ ] Toolbar appears on multi-select
- [ ] Batch delete works with confirmation
- [ ] Batch tag adds tags to all selected
- [ ] "Group" creates pile/container from selection

**Files**:
- `src/lib/components/moodboard/BatchActionToolbar.svelte` (new)

---

### Task Group: CSV Import/Export

#### T-061: Create CSV Import Wizard
**Status**: New task  
**Time**: 6-8 hours  
**Capability**: CAP-016

**What**: Multi-step wizard for CSV import with column mapping

**Steps**:
1. Create `src/lib/components/moodboard/CSVImportWizard.svelte`
2. Step 1: File upload and preview (first 5 rows)
3. Step 2: Column mapping (CSV column → node property)
4. Step 3: Node type selection
5. Step 4: Preview nodes (show 5 examples)
6. Step 5: Import with progress bar
7. Use papaparse for CSV parsing

**Test**:
- [ ] Can upload CSV file
- [ ] Auto-detects common columns (Name, Description, Tags)
- [ ] Mapping UI is intuitive
- [ ] Import creates nodes correctly
- [ ] Error handling for invalid rows

**Files**:
- `src/lib/components/moodboard/CSVImportWizard.svelte` (new)
- `package.json` (add papaparse dependency)

---

#### T-062: Create CSV Export Dialog
**Status**: New task  
**Time**: 3-4 hours  
**Capability**: CAP-017

**What**: Export moodboard nodes to CSV

**Steps**:
1. Create `src/lib/components/moodboard/CSVExportDialog.svelte`
2. Select scope: All, Selected, Current Container, Filtered
3. Column selection (checkboxes)
4. Export options: delimiter, encoding, quote style
5. Preview (first 5 rows)
6. Download CSV file

**Test**:
- [ ] Exports all nodes correctly
- [ ] Column selection works
- [ ] CSV opens in Excel/Sheets correctly
- [ ] Special characters handled properly

**Files**:
- `src/lib/components/moodboard/CSVExportDialog.svelte` (new)

---

### Task Group: Enhanced List View

#### T-063: Create ListView Component (Enhance T-013)
**Status**: Enhance existing task  
**Time**: 6-8 hours  
**Capability**: CAP-018

**What**: Full-featured table view with sorting, filtering, inline editing

**Steps**:
1. Create or enhance `src/lib/components/moodboard/ListView.svelte`
2. Table with columns: Checkbox, Thumbnail, Name, Type, Tags, Modified, Actions
3. Sortable columns (click header)
4. Inline editing (name, tags)
5. Multi-select rows
6. Pagination (50 per page)
7. Virtual scrolling for large datasets (>200 nodes)

**Test**:
- [ ] Table renders all nodes
- [ ] Sorting works (ascending/descending)
- [ ] Inline editing saves changes
- [ ] Multi-select via checkboxes
- [ ] Pagination navigates correctly
- [ ] Performance: <3s load for 500 nodes

**Files**:
- `src/lib/components/moodboard/ListView.svelte` (new/enhance)

---

## Version 1.5 - Canvas Polish (Week 5-6)

**Goal**: Piles, sequential edges, templates, filtering, container peek  
**Capabilities**: CAP-001, CAP-005, CAP-006, CAP-010, CAP-014, CAP-015

### Task Group: Pile Nodes

#### T-064: Database Schema for Piles
**Status**: New task  
**Time**: 1 hour  
**Capability**: CAP-001

**Migration**:
```sql
ALTER TABLE moodboard_nodes
ADD COLUMN IF NOT EXISTS pile_contents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pile_layout JSONB DEFAULT NULL;

-- pile_contents: array of node IDs
-- pile_layout: { expansion_style: 'radial' | 'grid', item_positions: {...} }
```

**Files**:
- `supabase/migrations/YYYYMMDDHHMMSS_add_pile_nodes.sql` (new)

---

#### T-065: Create PileNode Component
**Status**: New task  
**Depends on**: T-064  
**Time**: 4-5 hours  
**Capability**: CAP-001

**What**: Single-layer grouping with in-place expansion

**Steps**:
1. Create `src/lib/components/moodboard/nodes/PileNode.svelte`
2. Display as stacked cards with count badge
3. Show preview thumbnails (top 3 items)
4. Click to expand in-place (radial or grid layout)
5. Expansion animation (300ms)
6. Drag items out to remove from pile

**Test**:
- [ ] Pile shows count and preview
- [ ] Expansion spreads items around pile
- [ ] Collapsed state restores items
- [ ] Can drag items out of pile
- [ ] Animation smooth

**Files**:
- `src/lib/components/moodboard/nodes/PileNode.svelte` (new)

---

#### T-066: Implement Pile-to-Container Conversion
**Status**: New task  
**Depends on**: T-065  
**Time**: 3-4 hours  
**Capability**: CAP-006

**What**: Convert pile to container with one click

**Steps**:
1. Add context menu option: "Convert to Container"
2. Show conversion dialog:
   - Select container type (character/prop/group)
   - Option: "Move items inside" vs "Keep at root"
3. Transaction: Create container, update items' parent_id, delete pile
4. Undo available (30s window)

**Test**:
- [ ] Conversion dialog appears
- [ ] Items move into new container
- [ ] Original pile deleted
- [ ] Undo restores pile
- [ ] Transaction all-or-nothing

**Files**:
- `src/lib/components/moodboard/ConversionDialog.svelte` (new)
- `src/lib/api/services/moodboardsService.ts` (add function)

---

### Task Group: Sequential Edges & Timeline

#### T-067: Database Schema for Sequential Edges
**Status**: New task  
**Time**: 1 hour  
**Capability**: CAP-010

**Migration**:
```sql
-- Assuming moodboard_edges table exists (from earlier work)
ALTER TABLE moodboard_edges
ADD COLUMN IF NOT EXISTS edge_type TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS sequence_number INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sequence_metadata JSONB DEFAULT NULL;

CREATE INDEX idx_moodboard_edges_sequence
  ON moodboard_edges(source, sequence_number)
  WHERE edge_type = 'sequential';

-- Add progress status to nodes (for timeline tracking)
ALTER TABLE moodboard_nodes
ADD COLUMN IF NOT EXISTS progress_status TEXT DEFAULT 'pending';
-- Values: 'pending', 'in_progress', 'complete'
```

**Files**:
- `supabase/migrations/YYYYMMDDHHMMSS_add_sequential_edges.sql` (new)

---

#### T-068: Implement Sequential Edge Creation
**Status**: New task  
**Depends on**: T-067  
**Time**: 3-4 hours  
**Capability**: CAP-010

**What**: Create edges with sequence numbers

**Steps**:
1. Add "Connect Sequential" mode to canvas
2. Click nodes in order to create sequence
3. Auto-assign sequence numbers (1, 2, 3...)
4. Visual: Thicker line, sequence badge

**Test**:
- [ ] Can create sequential edge chain
- [ ] Sequence numbers auto-increment
- [ ] Edges render with badges
- [ ] Can reorder sequence (drag badge)

**Files**:
- `src/lib/components/moodboard/MoodboardCanvas.svelte` (enhance)
- `src/lib/api/services/moodboardsService.ts` (add functions)

---

#### T-069: Create TimelineView Component
**Status**: New task  
**Depends on**: T-068  
**Time**: 6-8 hours  
**Capability**: CAP-010

**What**: Horizontal timeline view of sequenced nodes

**Steps**:
1. Create `src/lib/components/moodboard/TimelineView.svelte`
2. Compute sequences from sequential edges
3. Horizontal layout (left to right)
4. Nodes positioned by sequence number
5. Progress bar showing completion
6. Swimlanes for parallel branches

**Test**:
- [ ] Timeline renders sequenced nodes
- [ ] Nodes ordered correctly
- [ ] Progress bar accurate
- [ ] Zoom in/out works
- [ ] Can mark nodes as in progress/complete

**Files**:
- `src/lib/components/moodboard/TimelineView.svelte` (new)

---

### Task Group: Node Templates

#### T-070: Database Schema for Templates
**Status**: New task  
**Time**: 1 hour  
**Capability**: CAP-014

**Migration**:
```sql
CREATE TABLE node_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  node_type TEXT NOT NULL,
  template_data JSONB NOT NULL,
  visibility TEXT DEFAULT 'private', -- 'private' | 'team' | 'public'
  is_builtin BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_node_templates_user_id ON node_templates(user_id);
CREATE INDEX idx_node_templates_visibility ON node_templates(visibility);
```

**Files**:
- `supabase/migrations/YYYYMMDDHHMMSS_create_node_templates.sql` (new)

---

#### T-071: Create TemplateLibrary Component
**Status**: New task  
**Depends on**: T-070  
**Time**: 5-6 hours  
**Capability**: CAP-014

**What**: Template library panel with search and filtering

**Steps**:
1. Create `src/lib/components/moodboard/TemplateLibrary.svelte`
2. Sections: My Templates, Team Templates, Public, Built-in
3. Search and filter by type
4. Template cards with preview
5. "Use Template" action
6. Template management (create, edit, delete)

**Test**:
- [ ] Templates load and display
- [ ] Search filters correctly
- [ ] Can create template from node
- [ ] Using template creates new node
- [ ] Built-in templates available

**Files**:
- `src/lib/components/moodboard/TemplateLibrary.svelte` (new)

---

### Task Group: Ghost Filtering

#### T-072: Implement Filter Bar
**Status**: New task  
**Time**: 3-4 hours  
**Capability**: CAP-015

**What**: Search/filter nodes with ghost rendering for non-matches

**Steps**:
1. Create `src/lib/components/moodboard/FilterBar.svelte`
2. Search input (text, tags, type, date range, status)
3. Apply filters: matching nodes full opacity, non-matching 60% opacity
4. Filter badge shows "X of Y nodes"
5. Clear filter button

**Test**:
- [ ] Text search highlights matches
- [ ] Non-matches render as ghosts (60% opacity)
- [ ] Multiple filters combine (AND logic)
- [ ] Clear restores full view
- [ ] Performance: <300ms for 100 nodes

**Files**:
- `src/lib/components/moodboard/FilterBar.svelte` (new)

---

### Task Group: Container Peek

#### T-073: Create ContainerPeek Component
**Status**: New task  
**Time**: 4-5 hours  
**Capability**: CAP-005

**What**: Quick preview modal for container contents

**Steps**:
1. Create `src/lib/components/moodboard/ContainerPeek.svelte`
2. Trigger: Shift+click container or long-press (mobile)
3. Modal shows miniature canvas (600x400px)
4. Read-only view (pan/zoom only)
5. "Open Full View" button to drill in
6. Lazy-load contents (fetch on peek)
7. Cache for 5 minutes

**Test**:
- [ ] Shift+click opens peek
- [ ] Shows container contents (read-only)
- [ ] Pan/zoom works
- [ ] "Open Full View" drills in
- [ ] Cache prevents refetch
- [ ] Loads in <300ms (cached) or <1s (fetch)

**Files**:
- `src/lib/components/moodboard/ContainerPeek.svelte` (new)

---

## Version 2.0 - Polish & Accessibility (Week 7-8)

**Goal**: Unified card component and WCAG 2.1 AA compliance  
**Capabilities**: CAP-019, CAP-020

### Task Group: Unified Card Refactor

#### T-074: Create UnifiedCard Component
**Status**: New task  
**Time**: 8-10 hours  
**Capability**: CAP-019

**What**: Single card component that renders all node types

**Steps**:
1. Create `src/lib/components/moodboard/UnifiedCard.svelte`
2. Accept props: node, variant (canvas/gallery/inspector/list/peek), mode (view/edit/select/drag)
3. Shared structure: header, body, footer
4. Type-specific content via slots or conditional rendering
5. Consistent styling across all variants
6. Replace all individual node components

**Large Refactor - Break Down**:
- T-074a: Create base UnifiedCard structure (2h)
- T-074b: Implement variant layouts (canvas/gallery/list) (2h)
- T-074c: Type-specific content delegation (3h)
- T-074d: Migrate ContainerNode to UnifiedCard (1h)
- T-074e: Migrate EventNode to UnifiedCard (1h)
- T-074f: Migrate ContactNode to UnifiedCard (1h)
- T-074g: Migrate ChecklistNode to UnifiedCard (1h)
- T-074h: Migrate remaining node types (2h)
- T-074i: Remove old node components (1h)

**Test**:
- [ ] All node types render via UnifiedCard
- [ ] Visual consistency across variants
- [ ] No regressions in functionality
- [ ] Code reduction ~40%

**Files**:
- `src/lib/components/moodboard/UnifiedCard.svelte` (new)
- Delete: All individual node components

---

### Task Group: Accessibility Compliance

#### T-075: Implement Keyboard Navigation
**Status**: New task  
**Time**: 4-5 hours  
**Capability**: CAP-020

**What**: Full keyboard accessibility across all views

**Steps**:
1. Tab order: Logical focus progression
2. Keyboard shortcuts:
   - Ctrl+1/2/3: Switch views
   - Ctrl+F: Search
   - Arrow keys: Navigate nodes
   - Space: Select
   - Enter: Open/edit
   - Escape: Close/cancel
3. Focus indicators (3:1 contrast ratio)
4. Focus trap in modals/dialogs
5. Skip links

**Test**:
- [ ] Can navigate entire app with keyboard only
- [ ] Focus indicators visible in all themes
- [ ] Shortcuts documented and discoverable
- [ ] Modals trap focus
- [ ] Skip links work

**Files**:
- `src/lib/components/KeyboardShortcuts.svelte` (enhance existing)
- Various components (add keyboard handlers)

---

#### T-076: Screen Reader Support
**Status**: New task  
**Time**: 5-6 hours  
**Capability**: CAP-020

**What**: ARIA labels, live regions, semantic HTML

**Steps**:
1. Semantic HTML: Proper headings, landmarks, lists
2. ARIA labels for all interactive elements
3. ARIA live regions for dynamic updates (toast, filter results)
4. Status messages (non-interruptive)
5. Alt text for all meaningful images
6. Test with NVDA, JAWS, VoiceOver

**Test**:
- [ ] Screen reader announces all content correctly
- [ ] Dynamic updates announced
- [ ] No unlabeled buttons/inputs
- [ ] Headings in logical order (h1 > h2 > h3)
- [ ] Passes axe DevTools audit (0 critical issues)

**Files**:
- All components (add ARIA attributes)

---

#### T-077: Accessibility Audit & Fixes
**Status**: New task  
**Time**: 8-10 hours  
**Capability**: CAP-020

**What**: Comprehensive accessibility testing and remediation

**Steps**:
1. Run automated tools:
   - axe DevTools
   - Lighthouse accessibility audit
   - Pa11y CI
2. Manual testing:
   - Keyboard only (all workflows)
   - Screen reader (NVDA, JAWS, VoiceOver)
   - High contrast mode
   - 200% zoom
   - Reduced motion preference
3. Fix all critical and serious issues
4. Document accessibility statement

**Checklist**:
- [ ] Lighthouse score > 90
- [ ] axe DevTools: 0 critical/serious issues
- [ ] WCAG 2.1 Level AA compliance verified
- [ ] Color contrast 4.5:1 (text), 3:1 (UI)
- [ ] All functionality keyboard accessible
- [ ] Screen reader tested with 3 tools
- [ ] Accessibility statement published

**Files**:
- `.cv/spec/features/feat-006/ACCESSIBILITY.md` (new - document compliance)
- Various components (fixes)

---

## Version Completion Checklists

### v1.0 Complete When:
- [ ] All T-036 through T-042 complete
- [ ] Containers drill-in/out works
- [ ] Inspector panel functional
- [ ] Context bar shows parent info
- [ ] Position persistence works
- [ ] E2E test: Create container, add nodes, drill in, navigate out

### v1.1 Complete When:
- [ ] T-043 through T-045 complete
- [ ] Ghost nodes appear in nested containers
- [ ] "Go to source" navigation works
- [ ] Performance: <100ms ghost computation

### v1.2 Complete When:
- [ ] T-046 through T-052 complete
- [ ] Event nodes sync with Google Calendar
- [ ] Contact nodes reusable across moodboards
- [ ] Checklist progress tracking works

### v1.3 Complete When:
- [ ] T-053 through T-058 complete
- [ ] Sketch tool can annotate images
- [ ] Compare nodes show side-by-side view
- [ ] Export comparison as PNG

### v1.4 Complete When:
- [ ] T-059 through T-063 complete
- [ ] Batch operations work (multi-select → tag/delete)
- [ ] CSV import creates nodes
- [ ] CSV export downloads file
- [ ] List view sortable and filterable

### v1.5 Complete When:
- [ ] T-064 through T-073 complete
- [ ] Piles expand/collapse
- [ ] Sequential edges create timelines
- [ ] Templates library functional
- [ ] Ghost filtering works
- [ ] Container peek opens preview

### v2.0 Complete When:
- [ ] T-074 through T-077 complete
- [ ] All nodes use UnifiedCard
- [ ] WCAG 2.1 AA compliance verified
- [ ] Accessibility statement published
- [ ] Code reduction ~40% achieved

---

## Critical Path

**Week 1 (v1.0):**
T-036, T-037, T-038, T-039, T-040, T-041, T-042

**Week 2 (v1.1 + v1.2 start):**
T-043, T-044, T-045, T-046, T-047, T-048 (calendar sync - phase 1)

**Week 3 (v1.2 complete + v1.3 start):**
T-049, T-050, T-051, T-052, T-053, T-054, T-055 (sketch editor)

**Week 4 (v1.3 complete + v1.4 start):**
T-056, T-057, T-058 (comparison view), T-059, T-060, T-061

**Week 5 (v1.4 complete + v1.5 start):**
T-062, T-063, T-064, T-065, T-066, T-067

**Week 6 (v1.5 continue):**
T-068, T-069, T-070, T-071, T-072, T-073

**Week 7-8 (v2.0):**
T-074 (UnifiedCard refactor), T-075, T-076, T-077 (accessibility)

---

## Task Statistics

**Total Tasks**: 77 (T-001 through T-077)  
**Completed**: 6 (T-001 through T-006)  
**In Progress**: 5 (T-007 through T-011, T-015 partial)  
**Remaining**: 66

**Estimated Hours by Version:**
- v1.0: 20-25 hours
- v1.1: 6-8 hours
- v1.2: 25-30 hours
- v1.3: 20-25 hours
- v1.4: 20-25 hours
- v1.5: 25-30 hours
- v2.0: 30-35 hours

**Total**: ~170-200 hours

**With AI-assisted development**: Estimated 50-60% time savings = **85-100 hours** (10-12 full days or 2 months part-time)

---

## Notes for Implementation

1. **Test-Driven Development**: Write tests before implementation where possible
2. **Code Reviews**: Review each checkpoint before moving to next
3. **User Feedback**: Gather feedback after v1.0, v1.2, v1.4 (major milestones)
4. **Performance Monitoring**: Profile after each version, optimize bottlenecks
5. **Documentation**: Update component registry after each checkpoint

---

**Last Updated**: 2026-01-23  
**Next Review**: After v1.0 completion

