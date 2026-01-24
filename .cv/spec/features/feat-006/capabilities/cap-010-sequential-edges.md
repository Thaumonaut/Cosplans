# CAP-010: Sequential Edges & Timeline View

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-004 (Progress Tracking & Comparison)

## Intent

Enable users to create ordered sequences of nodes (events, tasks, progress stages) using special "sequential" edges that maintain order and can be visualized as timelines, supporting project planning and progress tracking workflows.

## Functional Requirements

1. **Sequential Edge Creation**
   - Right-click edge → "Convert to Sequential"
   - Or create edge with Shift+drag (creates sequential by default)
   - Sequential edges have order number (sequence_number)
   - Multiple sequential edges from same node form a chain

2. **Sequence Numbering**
   - First edge in sequence: sequence_number = 1
   - Subsequent edges: Auto-increment (2, 3, 4...)
   - Reordering: Drag edge handle to change order
   - Branching: Node can have multiple outgoing sequential edges (parallel paths)
   - Merging: Node can have multiple incoming sequential edges (convergence)

3. **Visual Styling**
   - Sequential edges: Thicker line (3px vs 2px)
   - Arrow with sequence number badge
   - Color-coded by progress: Gray (pending), Blue (in progress), Green (complete)
   - Dashed line for future steps, solid for current/past

4. **Timeline View Mode**
   - Toggle: Canvas view ↔ Timeline view
   - Timeline view: Horizontal layout with nodes ordered by sequence
   - Time axis (if event nodes with dates): Scaled by actual dates
   - Swimlanes (if multiple branches): Parallel paths shown vertically separated
   - Zoom in/out on timeline

5. **Progress Tracking**
   - Nodes in sequence can be marked: Pending, In Progress, Complete
   - Sequential edge inherits status from source node
   - Progress bar shows: X of Y nodes complete
   - Timeline view highlights current step

6. **Auto-Layout for Sequences**
   - "Arrange as Timeline" action: Auto-positions nodes horizontally
   - Spacing: Even or scaled by dates (if event nodes)
   - Straighten edges: Removes unnecessary bends

## Data Model

### Database Schema
```sql
-- Add to moodboard_edges table
ALTER TABLE moodboard_edges ADD COLUMN edge_type TEXT DEFAULT 'default';
ALTER TABLE moodboard_edges ADD COLUMN sequence_number INTEGER DEFAULT NULL;
ALTER TABLE moodboard_edges ADD COLUMN sequence_metadata JSONB DEFAULT NULL;

CREATE INDEX idx_moodboard_edges_sequence 
  ON moodboard_edges(source, sequence_number) 
  WHERE edge_type = 'sequential';

-- Add progress status to nodes
ALTER TABLE moodboard_nodes ADD COLUMN progress_status TEXT DEFAULT 'pending';
-- Values: 'pending', 'in_progress', 'complete'
```

### Type Definitions
```typescript
interface SequentialEdge extends BaseMoodboardEdge {
  edge_type: 'sequential';
  sequence_number: number; // 1, 2, 3, ...
  sequence_metadata?: {
    estimated_duration?: number; // Minutes
    actual_duration?: number; // Minutes
    notes?: string;
  };
}

interface ProgressNode extends BaseMoodboardNode {
  progress_status: 'pending' | 'in_progress' | 'complete';
}

interface TimelineData {
  nodes: ProgressNode[];
  edges: SequentialEdge[];
  sequences: Sequence[]; // Computed chains
}

interface Sequence {
  id: string;
  nodes: ProgressNode[];
  edges: SequentialEdge[];
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
}
```

## UI/UX Requirements

1. **Sequential Edge Styling**
   - Line width: 3px (vs 2px default)
   - Sequence badge: Circle with number (e.g., "1", "2", "3")
   - Badge position: Midpoint of edge
   - Color by status:
     - Pending: Gray (#999)
     - In Progress: Blue (#3b82f6)
     - Complete: Green (#22c55e)
   - Dashed line: If source node is pending
   - Solid line: If source node is in progress or complete

2. **Canvas View Enhancements**
   - Sequence badges visible at all zoom levels
   - Hovering edge: Show tooltip "Step X of Y"
   - Context menu: "View as Timeline", "Reorder", "Remove Sequence"

3. **Timeline View Layout**
   - Horizontal axis: Left to right (start → end)
   - Nodes: Positioned horizontally by sequence, vertically by branch
   - Grid background: Subtle vertical lines for each step
   - Time scale (if dates): Show dates on axis
   - Current step: Highlighted with border/shadow

4. **Timeline View Controls**
   - Zoom slider: Adjust spacing
   - "Fit to View" button: Auto-zoom to show all steps
   - "Show Dates" toggle: If event nodes present
   - "Swimlanes" toggle: Separate parallel branches

5. **Progress Bar**
   - Shows at top of timeline view or in inspector
   - Segments for each node (color-coded by status)
   - Percentage text: "60% complete (3/5)"

6. **Node Status Controls**
   - Node context menu: "Mark as In Progress", "Mark as Complete"
   - Keyboard shortcuts: `P` (pending), `I` (in progress), `C` (complete)
   - Status badge on node corner

## Components

### Reuse from Registry
- `ui/button.svelte` - View toggle button
- `ui/slider.svelte` - Zoom slider
- `ui/badge.svelte` - Status badges
- `ui/progress.svelte` - Progress bar

### New Components Required
- `moodboard/SequentialEdge.svelte` - Sequential edge renderer
- `moodboard/TimelineView.svelte` - Timeline view component
- `moodboard/TimelineAxis.svelte` - Time scale axis
- `moodboard/ProgressBar.svelte` - Sequence progress bar
- `moodboard/SequenceReorder.svelte` - Drag-to-reorder UI

## Edge Cases

1. **Circular Sequences**: Prevent cycles (validate on edge creation)
2. **Orphaned Sequence Numbers**: If node deleted, renumber remaining edges
3. **Branching Sequences**: Multiple edges from same node, each numbered independently
4. **Merging Sequences**: Multiple incoming edges, choose primary sequence for timeline
5. **Non-Connected Nodes**: Timeline view only shows connected nodes, hides isolated nodes
6. **Very Long Sequences (>50 steps)**: Virtualize timeline, show "Load more" at ends
7. **Mixed Edge Types**: Timeline shows only sequential edges, ignores default edges
8. **Date Conflicts**: If event dates out of order, show warning in timeline view

## Performance Considerations

- Sequence computation: Run on edge changes only (memoize)
- Timeline layout: Use CSS transforms for positioning (GPU-accelerated)
- Virtualize timeline if > 50 nodes
- Debounce status changes (300ms) to reduce DB writes
- Cache timeline view state per session

## Testing Strategy

**Unit Tests:**
- Sequence computation from edges
- Sequence number auto-increment
- Circular reference detection
- Progress calculation

**Integration Tests:**
- Create sequential edges → sequence numbers assigned
- Reorder edges → numbers updated
- Mark node complete → edge color updates
- Switch to timeline view → nodes arranged horizontally

**E2E Tests:**
- User creates 5 nodes, links with sequential edges → sequence numbered 1-5
- User switches to timeline view → nodes arranged left-to-right
- User marks nodes complete → progress bar updates
- User reorders edge → sequence renumbered

## Success Metrics

- Sequence creation time < 500ms
- Timeline view render time < 1s (50 nodes)
- Auto-layout completes in < 2s (50 nodes)
- 70% of users with 5+ connected nodes use timeline view

## Dependencies

- **Requires:** Edge system (existing), node system
- **Required By:** None (enhancement feature)
- **Related:** CAP-007 (Event nodes use dates for timeline), CAP-009 (Checklists use progress status)

## Open Questions

1. **Gantt Chart View**: Support Gantt-style bars with date ranges? → Phase 2 (start with simple timeline)
2. **Critical Path**: Highlight critical path in timeline? → Phase 2 (requires duration estimates)
3. **Auto-Status**: Auto-mark nodes as "in progress" when previous step completes? → Phase 1 (optional toggle)

## References

- Council Decision 6: "yes, maybe we can add a special edge type of linear where it links nodes together sequentially"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Edge interactions)
