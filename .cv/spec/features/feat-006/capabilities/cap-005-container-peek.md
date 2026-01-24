# CAP-005: Container Peek (Quick View)

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-007 (Container Peek & Polish)

## Intent

Enable quick preview of container contents without losing current canvas context, allowing users to "peek inside" via modal/overlay to verify contents or grab a reference without full drill-in navigation.

## Functional Requirements

1. **Peek Trigger**
   - Hover over container + press Space key (desktop)
   - Hold Shift + click container (desktop)
   - Long-press container (mobile, 500ms)
   - Click expand icon in context bar (inside another container)

2. **Peek Modal/Overlay**
   - Modal shows miniature canvas view of container contents
   - Size: 600x400px (desktop), 90vw x 60vh (mobile)
   - Background dimmed (overlay)
   - Shows container title at top
   - Canvas inside is interactive (pan/zoom only, no editing)

3. **Peek Interactions**
   - Pan: Drag canvas or two-finger drag (touch)
   - Zoom: Mouse wheel or pinch gesture
   - Click node: Show quick tooltip with name/type
   - Double-click node: Close peek, navigate to that node's actual location
   - "Open Full View" button: Close peek, drill into container normally
   - Click outside or Escape: Close peek

4. **Visual Indicators**
   - Container shows "peek" cursor on hover (eye icon)
   - Peek modal has subtle border matching container color
   - Read-only indicator: Banner at top "Preview Only"
   - Ghost nodes rendered at 40% opacity (consistent with CAP-003)

5. **Performance**
   - Lazy-load: Contents fetched on peek trigger, not on hover
   - Cache: Peek data cached for 5 minutes
   - Limit: Show max 100 nodes (warn if more)

## Data Model

### State Management
```typescript
interface PeekState {
  isOpen: boolean;
  containerId: string | null;
  containerData: ContainerNode | null;
  childNodes: MoodboardNode[];
  childEdges: MoodboardEdge[];
  cacheTimestamp: number;
}
```

### API
```typescript
// Fetch container contents for peek
async function fetchContainerPeek(containerId: string): Promise<PeekData> {
  const nodes = await fetchNodesByParent(containerId);
  const edges = await fetchEdgesByNodes(nodes.map(n => n.id));
  
  return {
    container: await fetchNode(containerId),
    nodes: nodes.slice(0, 100), // Limit to 100
    edges,
    totalCount: nodes.length
  };
}
```

## UI/UX Requirements

1. **Desktop Peek Modal**
   - Centered overlay (600x400px)
   - Rounded corners (8px)
   - Drop shadow (large, soft)
   - Header: Container icon + name + "Preview Only" badge + close button
   - Body: Canvas view (pan/zoom enabled)
   - Footer: Node count + "Open Full View" button

2. **Mobile Peek Sheet**
   - Slide up from bottom (90% screen height)
   - Swipe-down handle at top
   - Same header/body/footer structure
   - Canvas uses touch gestures (pan/pinch)

3. **Loading State**
   - Skeleton loader shows node placeholders
   - Spinner if load takes > 300ms
   - Error state if fetch fails: "Could not load preview"

4. **Empty State**
   - "This container is empty" message
   - "Open Full View to add items" button

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Peek modal (desktop)
- `ui/sheet.svelte` - Peek sheet (mobile)
- `ui/button.svelte` - Action buttons

### New Components Required
- `moodboard/ContainerPeek.svelte` - Main peek component
- `moodboard/PeekCanvas.svelte` - Read-only canvas view for peek

## Edge Cases

1. **Nested Peek**: Cannot peek inside container while already in peek (button disabled)
2. **Empty Container**: Show empty state with helpful message
3. **Large Container (>100 nodes)**: Show "Showing first 100 of X nodes" warning
4. **Deleted Container**: Close peek if container deleted while open
5. **Permission Changes**: If user loses access mid-peek, show error and close
6. **Slow Network**: Show loading state, timeout after 10s
7. **Ghost Nodes in Peek**: Ghosts render normally (consistent with main canvas)

## Performance Considerations

- Lazy-load: Only fetch when peek triggered
- Cache: Store peek data for 5 minutes (avoid refetch on quick re-peek)
- Throttle: Prevent rapid peek triggers (200ms cooldown)
- Canvas optimization: Use lower-quality rendering for peek (fewer details)
- Limit nodes: Hard cap at 100 nodes rendered
- Cleanup: Clear cache on navigation away from parent canvas

## Testing Strategy

**Unit Tests:**
- Peek state management (open/close)
- Cache expiration logic (5 minutes)
- Node limit enforcement (100 max)
- API fetch with error handling

**Integration Tests:**
- Trigger peek → modal opens with container contents
- Pan/zoom in peek canvas
- Double-click node in peek → navigates to node location
- "Open Full View" → closes peek, drills into container

**E2E Tests:**
- Desktop: Shift+click container → peek opens
- Mobile: Long-press container → peek sheet slides up
- User peeks, double-clicks node → navigates to that node
- User peeks, swipes down (mobile) → closes peek

## Accessibility

- Peek modal announced as "dialog" with label "Preview: [Container Name]"
- Focus trapped in modal while open
- Escape key closes peek
- Screen reader: Announce node count and "preview only" status
- Keyboard: Tab to "Open Full View" button, Enter to activate

## Success Metrics

- Peek opens in < 300ms (with cache)
- Peek opens in < 1000ms (without cache, 50 nodes)
- 80% of users discover peek feature within 3 sessions
- 60% of peeks result in "Open Full View" (indicating usefulness)

## Dependencies

- **Requires:** CAP-002 (Container Nodes)
- **Required By:** None (optional enhancement)
- **Related:** CAP-004 (Context bar launches peek), CAP-003 (Ghost nodes in peek)

## Open Questions

None - design approved in Council Decision 3 (user suggested peek feature).

## References

- Council Decision 3: User suggested "peek feature to quickly view inside a container"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Container interactions)
