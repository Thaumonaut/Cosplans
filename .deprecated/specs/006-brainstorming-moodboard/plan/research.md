# Research - Feature 006: Enhanced Brainstorming & Moodboarding

**Feature Branch**: `006-brainstorming-moodboard`
**Created**: 2026-01-08
**Status**: Complete

---

## Research Findings

### 1. Infinite Canvas Library Selection

**Decision**: @xyflow/svelte (Svelte Flow)

**Rationale**:
- Native Svelte 5 support with full TypeScript integration
- Built-in infinite canvas with zoom/pan
- Node and edge system matches our Milanote + Obsidian hybrid approach
- DOM-based rendering (critical for social media embeds via iframe)
- Includes Background, MiniMap, Controls components
- Active maintenance and MIT license

**Alternatives Considered**:
| Library | Reason Rejected |
|---------|-----------------|
| Konva.js | Canvas-based - problematic for iframe embeds |
| Fabric.js | Not Svelte-native, canvas-based |
| Mermaid | Diagram-focused, not interactive canvas |
| Custom HTML | Reinventing the wheel, maintenance burden |

**Installation**: `bun add @xyflow/svelte`

---

### 2. URL Metadata Extraction

**Decision**: `unfurl.js` as primary, with fallbacks

**Rationale**:
- Generic metadata extraction works across all platforms without API keys
- Parses Open Graph, Twitter Cards, oEmbed endpoints
- Server-side execution (required for CORS)
- Active maintenance, TypeScript types available

**Implementation Strategy**:
```typescript
// Phase 1 (MVP): Generic extraction
import { unfurl } from 'unfurl.js';

// Fallback chain:
// 1. Try unfurl.js (Open Graph + oEmbed)
// 2. Use basic URL metadata (title from URL path)
// 3. Store URL-only fallback (still useful)
```

**Platform-Specific Notes**:
| Platform | oEmbed Support | Open Graph | Notes |
|----------|---------------|------------|-------|
| Instagram | Limited | Yes | Private embeds require Graph API |
| TikTok | No | Limited | Best-effort metadata extraction |
| Pinterest | Yes | Yes | Good oEmbed support |
| YouTube | Yes | Yes | Excellent metadata support |
| Facebook | Limited | Yes | Mobile URLs may differ |

**Alternatives Considered**:
| Library | Reason Rejected |
|---------|-----------------|
| oembed-parser | Less comprehensive than unfurl |
| metascraper | More complex setup, similar results |
| Official APIs | Phase 2 - require API keys, rate limits |

---

### 3. Table Component for Table View

**Decision**: TanStack Table with custom Svelte components

**Rationale**:
- Headless - full control over rendering and styling
- Built-in sorting, filtering, pagination
- Framework-agnostic with Svelte adapter
- Row selection and inline editing support
- Virtualization for large datasets (200+ nodes)

**Installation**: `bun add @tanstack/svelte-table`

**Alternatives Considered**:
| Library | Reason Rejected |
|---------|-----------------|
| svelte-headless-table | Smaller community, fewer features |
| AGGrid | Overkill, paid for advanced features |
| Custom table | Maintenance burden for sorting/filtering |

---

### 4. Timeline Visualization

**Decision**: Custom implementation using CSS flexbox/grid

**Rationale**:
- Our timeline is simpler than typical charting libraries expect
- Need both vertical (Pinterest-style) and horizontal layouts
- Items are fixed-size cards, not variable Gantt bars
- CSS scroll-snap provides smooth user experience
- No external dependency needed

**Implementation Approach**:
```svelte
<!-- Vertical Timeline -->
<div class="timeline-vertical">
  {#each groupedByDate as group}
    <div class="date-marker">{formatDate(group.date)}</div>
    {#each group.nodes as node}
      <MoodboardNodeCard {node} />
    {/each}
  {/each}
</div>

<!-- Horizontal Timeline -->
<div class="timeline-horizontal">
  <!-- Similar structure with flex-direction: row -->
</div>
```

---

### 5. OAuth for Comments (Lightweight Auth)

**Decision**: Supabase Auth with Google/GitHub providers

**Rationale**:
- Already integrated in the codebase
- No additional infrastructure needed
- Supports "Sign in with Google/GitHub" one-click flow
- User info (name, avatar) automatically available
- No full account creation required for commenters

**Implementation**:
- Configure Google OAuth in Supabase dashboard
- Configure GitHub OAuth as secondary option
- Store `oauth_provider` + `oauth_user_id` in comments table
- Cache commenter display info in comment record

---

### 6. Image Optimization

**Decision**: Use existing Supabase Storage with client-side resizing

**Rationale**:
- Supabase Storage already configured (R2 backend suspected)
- Browser-native image compression via canvas
- Resize before upload to save bandwidth/storage
- No additional server-side processing needed for MVP

**Implementation**:
```typescript
// Client-side resize before upload
async function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  const img = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(maxWidth, maxWidth * img.height / img.width);
  const ctx = canvas.getContext('2d');
  ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
}
```

---

### 7. Canvas Mobile Touch Support

**Decision**: Svelte Flow's built-in touch handling + custom refinements

**Rationale**:
- Svelte Flow includes pinch-zoom and pan gestures
- May need threshold adjustments for our node sizes
- Touch targets should be minimum 44x44px
- Node drag should use `touch-action: none` to prevent scroll

**Potential Issues to Watch**:
- iOS Safari sometimes conflicts with system gestures
- Need to test on actual devices during development
- Consider "lock canvas" mode for mobile editing

---

### 8. State Management

**Decision**: Svelte 5 runes + stores for moodboard state

**Rationale**:
- Svelte 5 reactivity is sufficient for local state
- Writable stores for cross-component sharing
- No need for external state library (Zustand, etc.)
- Nodes/edges as single reactive store

**Implementation Pattern**:
```typescript
// src/lib/stores/moodboard.ts
import { writable, derived } from 'svelte/store';
import type { Node, Edge } from '@xyflow/svelte';

export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
export const selectedNodeIds = writable<Set<string>>(new Set());

export const taggedNodes = derived(
  [nodes],
  ([$nodes]) => $nodes.filter(n => n.data?.tags?.length)
);
```

---

## Embed Policy Research

### Platform Embed Restrictions

| Platform | iframe Embed | oEmbed | Restrictions |
|----------|-------------|--------|--------------|
| Instagram | ⚠️ | ✅ | Requires embed.js script; may break |
| TikTok | ⚠️ | ✅ | Requires embed script; size limits |
| Pinterest | ✅ | ✅ | Generally permissive |
| YouTube | ✅ | ✅ | Standard embed, nocookie option |
| Facebook | ⚠️ | ✅ | Requires SDK, may break |

**Strategy**:
1. Try oEmbed HTML first (platform-provided embed)
2. Fall back to thumbnail + play button overlay
3. Link to original on click
4. Never store video content locally (copyright)

---

## Database Migration Strategy

**New Tables** (8 total):
1. `moodboard_nodes` - Canvas nodes with position data
2. `moodboard_edges` - Connections between nodes
3. `idea_options` - Multiple options per idea
4. `budget_items` - Itemized budgets with contact links
5. `contacts` - Team-level contact database
6. `moodboard_shares` - Shareable link tracking
7. `moodboard_comments` - OAuth-authenticated comments
8. `tutorials` - Team tutorial library

**Modified Tables** (2 total):
1. `ideas` - Add `event_id`, `character_db_id`
2. `projects` - Add `source_idea_id`, `source_option_id`, `event_id`

**Migration Sequence**:
```
20260108000100_create_moodboard_nodes.sql
20260108000110_create_moodboard_edges.sql
20260108000120_create_idea_options.sql
20260108000130_create_budget_items.sql
20260108000140_create_contacts.sql
20260108000150_create_moodboard_shares.sql
20260108000160_create_moodboard_comments.sql
20260108000170_create_tutorials.sql
20260108000180_modify_ideas_projects.sql
```

---

## Performance Considerations

### Canvas Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Nodes visible | 50-200 | Reasonable brainstorming size |
| Zoom/pan FPS | 60fps | Chrome DevTools FPS meter |
| Initial load | < 2s | Lighthouse |
| Add node | < 200ms | User perception |

### Optimization Strategies
- Virtualize nodes outside viewport (Svelte Flow built-in)
- Lazy load thumbnails as nodes enter view
- Debounce position saves on drag end (not during)
- Use WebP for all cached thumbnails

---

## Security Considerations

### RLS Policies Required

**moodboard_nodes**:
- SELECT: Team members via ideas → team_id
- INSERT/UPDATE/DELETE: Team members

**moodboard_shares**:
- SELECT: Anyone (for public viewing)
- INSERT/UPDATE/DELETE: Moodboard owner (via ideas → team)

**moodboard_comments**:
- SELECT: Anyone (for shared boards)
- INSERT: OAuth-authenticated users
- DELETE: Comment author or board owner

---

## Open Items Resolved

| Question | Resolution |
|----------|------------|
| Moodboard sharing auth | OAuth for comments, public viewing |
| Idea→Project moodboard | Shared canvas (reference, not copy) |
| Timeline orientation | User-toggleable, vertical default |
| URL parsing approach | Generic metadata (unfurl.js) + fallbacks |
| Budget dual representation | Table + optional canvas nodes |

---

**Status**: ✅ Research complete - Ready for implementation
