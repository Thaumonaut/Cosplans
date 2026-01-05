# Implementation Plan: Application Stability and Quality Improvement

**Branch**: `004-bugfix-testing` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-bugfix-testing/spec.md`

## Summary

This feature addresses 23+ documented bugs, improves testing coverage, and adds critical reliability enhancements to the Cosplay Tracker application. Primary focus areas include: task management reliability (deletion, view synchronization), cross-device responsive design, data persistence improvements, team management enhancements, and multi-API character database integration with fallback. The feature also implements network interruption handling with local storage auto-save and establishes adaptive layouts for extreme screen sizes.

**Technical Approach**: Systematic bug fixing prioritized by user impact (P1 → P2 → P3), test-first development for critical flows, and integration of resilience patterns (offline handling, API fallback, confirmation dialogs for destructive actions).

## Technical Context

**Language/Version**: TypeScript 5.9.2 with strict mode
**Framework**: SvelteKit 2.43.2 with Svelte 5.39.5
**Runtime**: Bun (development and build)
**Primary Dependencies**: Supabase 2.76.1 (auth/database), Flowbite Svelte 1.19.0, Tailwind CSS 3.4.18, Zod 3.25.76, sveltekit-superforms 2.28.1
**Storage**: Cloudflare R2 (images/assets), Supabase (structured data)
**Testing**: Vitest 4.0.3 (unit/integration), Playwright 1.56.1 (E2E)
**Target Platform**: Web (mobile + desktop), deployed to Cloudflare Pages/Workers
**Project Type**: Web application (SvelteKit)
**Performance Goals**: <3s character API aggregation (95th percentile), <1s task operations, <2s kanban sync
**Constraints**: Must maintain backward compatibility with existing user data, zero data loss during bug fixes
**Scale/Scope**: 36 functional requirements, 14 measurable success criteria, 23+ bug fixes, 5 external API integrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Project-Centric**: Bug fixes apply to project-scoped features (tasks, resources, events, teams) - compliant
- [x] **Team-Based**: Team ownership transfer and deletion rules strengthen team architecture - compliant
- [x] **Feature Scope**: Quality improvement and bug fixing support MVP Core delivery - Phase 1/MVP enhancement
- [x] **Complete Workflow**: Fixes enable reliable workflow (task management, mobile access, data persistence, post-production) - compliant
- [x] **MVP First**: Fixes critical MVP blockers first (P1), enhancements later (P2/P3) - compliant
- [x] **Test-First**: Comprehensive test coverage requirement (FR-032 through FR-036, SC-009, SC-010) - compliant
- [x] **Modular**: Fixes organized by domain (Tracking/Tasks, Events/Photoshoots, Resources/Characters, Main/Teams) - compliant
- [x] **Cost-Conscious**: All external APIs use free tiers (MyAnimeList, AniList, IGDB, Comic Vine, TMDB) - compliant
- [x] **Future-Ready**: Offline handling + multi-API integration patterns support future enhancements - compliant
- [x] **Data Privacy**: Confirmation dialogs, team ownership transfer prevent accidental data loss - compliant
- [x] **Tech Stack**: Uses established SvelteKit + Supabase + Flowbite + Tailwind - fully compliant
- [x] **Navigation**: No navigation changes required - bug fixes to existing features - compliant

**Feature Phase**: MVP Core Enhancement - Quality and reliability improvements to enable successful MVP launch

**Violations**: None

## Project Structure

### Documentation (this feature)

```text
specs/004-bugfix-testing/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (API research, best practices)
├── data-model.md        # Phase 1 output (minimal - primarily existing models)
├── quickstart.md        # Phase 1 output (testing and bug fix verification)
├── contracts/           # Phase 1 output (character API contracts)
│   ├── character-api.yaml          # Multi-API integration contract
│   ├── offline-sync.yaml           # Local storage sync contract
│   └── team-management.yaml        # Team ownership transfer contract
├── checklists/
│   └── requirements.md  # Already created during /speckit.specify
└── spec.md              # Feature specification (already created)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   └── services/
│   │       ├── taskService.ts        # [MODIFY] Add deletion confirmation, sync improvements
│   │       ├── teamService.ts        # [MODIFY] Add ownership transfer
│   │       ├── characterService.ts   # [NEW] Multi-API character aggregation
│   │       ├── offlineService.ts     # [NEW] Local storage + sync queue
│   │       └── apiAggregator.ts      # [NEW] Generic multi-API fallback pattern
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskDeleteModal.svelte          # [NEW] Confirmation with dependency counts
│   │   │   ├── TaskBoard.svelte                # [MODIFY] Fix tablet header rendering
│   │   │   └── KanbanView.svelte               # [MODIFY] Fix sync after creation
│   │   ├── teams/
│   │   │   ├── TeamDeleteModal.svelte          # [MODIFY] Add ownership transfer flow
│   │   │   └── OwnershipTransferDialog.svelte  # [NEW] Transfer UI
│   │   ├── characters/
│   │   │   ├── CharacterSearchModal.svelte     # [NEW] Multi-API search with aggregation
│   │   │   └── CharacterApiSelector.svelte     # [NEW] User selection from merged results
│   │   ├── layout/
│   │   │   ├── ActionBar.svelte      # [MODIFY] Fix sticky positioning, viewport calc
│   │   │   ├── Sidebar.svelte        # [MODIFY] Fix mobile scroll, toggle, grouping
│   │   │   └── ResponsiveContainer.svelte  # [NEW] Adaptive breakpoint wrapper
│   │   └── shared/
│   │       ├── OfflineIndicator.svelte   # [NEW] Network status display
│   │       └── WhatShouldIDoNow.svelte   # [MODIFY] Fix positioning on small screens
│   ├── stores/
│   │   ├── offlineStore.ts           # [NEW] Sync queue + connectivity tracking
│   │   └── characterApiStore.ts      # [NEW] API response caching
│   ├── utils/
│   │   ├── responsive.ts             # [NEW] Breakpoint utilities
│   │   ├── apiAggregation.ts         # [NEW] Deduplication + merge logic
│   │   └── offlineSync.ts            # [NEW] IndexedDB wrapper for local storage
│   └── types/
│       ├── character.ts              # [NEW] Unified character data model
│       └── offline.ts                # [NEW] Sync queue types
├── routes/
│   ├── (app)/
│   │   ├── tasks/
│   │   │   └── +page.svelte          # [MODIFY] Add delete functionality
│   │   ├── settings/
│   │   │   └── +page.svelte          # [MODIFY] Rename preferences→notifications, remove dark mode toggle
│   │   ├── teams/
│   │   │   └── [teamId]/+page.svelte # [MODIFY] Add delete + transfer flows
│   │   └── +layout.svelte            # [MODIFY] Fix viewport dimensions, action bar calc
│   └── (auth)/
│       └── signup/+page.server.ts    # [MODIFY] Auto-create personal team if missing
└── app.css                           # [MODIFY] Add responsive breakpoints

tests/
├── e2e/
│   ├── tasks/
│   │   ├── task-deletion.spec.ts               # [NEW] Delete with dependencies
│   │   ├── task-sync.spec.ts                   # [NEW] Kanban view sync
│   │   └── task-offline.spec.ts                # [NEW] Offline task creation
│   ├── teams/
│   │   ├── team-deletion.spec.ts               # [NEW] Ownership transfer requirement
│   │   └── team-creation-fallback.spec.ts      # [NEW] Auto-create personal team
│   ├── responsive/
│   │   ├── mobile-layout.spec.ts               # [NEW] Mobile breakpoint tests
│   │   ├── tablet-layout.spec.ts               # [NEW] Tablet task board rendering
│   │   └── extreme-sizes.spec.ts               # [NEW] Very small/large viewports
│   ├── characters/
│   │   ├── character-api-fallback.spec.ts      # [NEW] Multi-API with failures
│   │   └── character-search.spec.ts            # [NEW] Aggregation + deduplication
│   └── persistence/
│       ├── notes-persistence.spec.ts           # [NEW] Idea→planning transition
│       └── offline-sync.spec.ts                # [NEW] Network interruption recovery
├── integration/
│   ├── services/
│   │   ├── characterService.test.ts            # [NEW] API aggregation logic
│   │   ├── offlineService.test.ts              # [NEW] Sync queue management
│   │   └── teamService.test.ts                 # [MODIFY] Add ownership transfer tests
│   └── utils/
│       └── apiAggregation.test.ts              # [NEW] Deduplication algorithms
└── unit/
    ├── components/
    │   ├── TaskDeleteModal.test.ts             # [NEW] Dependency count display
    │   └── OfflineIndicator.test.ts            # [NEW] Status display logic
    └── utils/
        ├── responsive.test.ts                   # [NEW] Breakpoint detection
        └── offlineSync.test.ts                  # [NEW] IndexedDB operations
```

**Structure Decision**: This is a web application using SvelteKit's standard structure. Bug fixes are organized by domain (tasks, teams, characters, layout) with new utilities for cross-cutting concerns (offline handling, responsive design, API aggregation). Testing infrastructure already exists; expanding coverage to meet 80% target (SC-009).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitutional violations - this section is not applicable.*

## Phase 0: Research & Analysis

### Research Objectives

**Purpose**: Resolve unknowns about external APIs, best practices for offline sync, and responsive design patterns before implementation.

#### 1. Character Database APIs

**Research Questions**:
- What are the API endpoints, authentication methods, rate limits, and response formats for each service?
- How do we deduplicate characters across APIs (matching algorithm)?
- What are the API cost structures and free tier limits?

**APIs to Research**:
1. **MyAnimeList API** - Anime/manga characters
   - Endpoint structure
   - Authentication (OAuth2?)
   - Rate limits
   - Response schema
   - Character data completeness (images, series, descriptions)

2. **AniList API** - Anime/manga characters
   - GraphQL API structure
   - Public access or authentication required?
   - Rate limits
   - Response schema
   - Data overlap with MyAnimeList

3. **IGDB (Internet Game Database) API** - Video game characters
   - REST API endpoints
   - Twitch authentication requirement
   - Rate limits
   - Character/game data model
   - Image availability

4. **Comic Vine API** - Comic book characters
   - REST API endpoints
   - API key requirements
   - Rate limits
   - Response format
   - Search capabilities

5. **TMDB (The Movie Database) API** - Movie/TV/cartoon characters
   - REST API endpoints
   - API key requirements (free tier)
   - Rate limits
   - Person vs Character entities
   - Image CDN structure

**Deduplication Research**:
- Fuzzy matching algorithms (Levenshtein distance, Jaro-Winkler)
- Name normalization (removing special characters, spacing)
- Series/franchise matching
- Confidence scoring for matches
- User override for ambiguous matches

#### 2. Offline Synchronization Patterns

**Research Questions**:
- What is the best practice for conflict resolution (last-write-wins, operational transforms, user prompts)?
- How do we handle partial sync failures (some tasks sync, others don't)?
- What data structures work best for sync queues in IndexedDB?

**Topics**:
- **IndexedDB Best Practices**
  - Schema design for sync queue
  - Transaction management
  - Error handling
  - Size limits and cleanup

- **Conflict Resolution Strategies**
  - Last-write-wins (simple, may lose data)
  - Operational transforms (complex, preserves intent)
  - Three-way merge (requires baseline tracking)
  - User prompt with diff view (best UX, requires UI)

- **Sync Queue Management**
  - FIFO vs priority-based processing
  - Retry strategies (exponential backoff)
  - Batch sync vs individual operations
  - Handling dependencies (task → subtask order)

- **Network Detection**
  - Navigator.onLine reliability
  - Ping-based detection
  - Supabase connection monitoring

#### 3. Responsive Design & Adaptive Layouts

**Research Questions**:
- What are the standard breakpoints for mobile/tablet/desktop/large desktop?
- How do we test across extreme viewport sizes efficiently?
- What CSS strategies work best for adaptive vs responsive design?

**Topics**:
- **Breakpoint Standards**
  - Industry standard breakpoints (Bootstrap, Tailwind, Material Design)
  - Mobile-first vs desktop-first approach
  - Breakpoint selection for this application

- **CSS Strategies**
  - Container queries vs media queries
  - Flexbox vs Grid for adaptive layouts
  - Overflow handling for extreme sizes
  - Sticky positioning across browsers

- **Testing Approaches**
  - Playwright viewport testing
  - Visual regression testing
  - Real device testing vs emulation
  - Automated screenshot comparison

#### 4. Team Ownership Transfer Patterns

**Research Questions**:
- What UX patterns do other apps use for ownership transfer?
- How do we prevent orphaned teams?
- What's the best flow for transferring then leaving vs transferring then deleting?

**Topics**:
- **UX Patterns**
  - Slack team ownership transfer
  - GitHub organization ownership
  - Discord server ownership
  - Best practices from research

- **Edge Cases**
  - Transfer to user who leaves immediately
  - Circular ownership dependencies
  - Transfer while operations are in progress
  - Rollback scenarios

#### 5. Testing Strategy & Coverage

**Research Questions**:
- How do we achieve 80% coverage efficiently (focus on critical paths)?
- What's the best way to test responsive layouts automatically?
- How do we test offline scenarios in E2E tests?

**Topics**:
- **Coverage Analysis**
  - Current test coverage baseline
  - Critical path identification
  - High-risk areas requiring tests
  - Coverage reporting tools

- **E2E Testing**
  - Playwright offline simulation
  - Network throttling
  - Viewport testing strategies
  - Flaky test prevention

- **Test Data Management**
  - Factory patterns for test data
  - Database seeding strategies
  - Cleanup between tests
  - Isolation techniques

### Research Deliverables

**Output**: `research.md` containing:
1. **Character API Integration Guide**
   - Endpoint documentation for all 5 APIs
   - Authentication setup instructions
   - Rate limit tracking strategy
   - Response schema mappings
   - Deduplication algorithm selection
   - Recommended API call patterns

2. **Offline Sync Architecture**
   - Chosen conflict resolution strategy with rationale
   - IndexedDB schema for sync queue
   - Sync queue processing algorithm
   - Network detection approach
   - Error handling patterns

3. **Responsive Design Implementation**
   - Selected breakpoints with justification
   - CSS strategy (container queries + media queries)
   - Adaptive layout component patterns
   - Testing approach for all viewport sizes

4. **Team Management Flows**
   - Ownership transfer UX flow diagrams
   - Edge case handling decisions
   - Database transaction patterns
   - User messaging/confirmation text

5. **Testing Strategy**
   - Test coverage targets by domain
   - Test pyramid recommendations (E2E vs integration vs unit ratios)
   - Playwright configuration for offline/responsive tests
   - CI/CD integration approach

## Phase 1: Design & Contracts

### Prerequisites

- `research.md` complete with all API endpoints, schemas, and patterns documented
- Character API keys obtained for development/testing

### Data Model Changes

**Existing Models** (minimal modifications needed):

1. **Task Model** - Add soft delete tracking
   ```typescript
   interface Task {
     // ... existing fields
     deleted_at: string | null         // NEW: Soft delete timestamp
     deleted_by: string | null         // NEW: User who deleted
     dependency_count: number          // NEW: Cached count of subtasks/links
   }
   ```

2. **Team Model** - Add ownership tracking
   ```typescript
   interface Team {
     // ... existing fields
     owner_id: string                  // MODIFY: Make explicit (was implicit)
     previous_owner_id: string | null  // NEW: For audit trail
     ownership_transferred_at: string | null  // NEW: Transfer timestamp
   }
   ```

3. **User Model** - Add team creation tracking
   ```typescript
   interface User {
     // ... existing fields
     personal_team_id: string          // NEW: Reference to auto-created team
   }
   ```

**New Models**:

1. **Character** - Aggregated from multiple APIs
   ```typescript
   interface Character {
     id: string                        // Internal UUID
     name: string                      // Normalized name
     series: string                    // Series/franchise
     description: string | null
     image_url: string | null
     source_api: CharacterSource       // Which API(s) provided data
     external_ids: {                   // References to source APIs
       myanimelist_id?: number
       anilist_id?: number
       igdb_id?: number
       comicvine_id?: number
       tmdb_id?: number
     }
     metadata: Record<string, any>     // API-specific additional data
     created_at: string
     updated_at: string
   }

   enum CharacterSource {
     MYANIMELIST = 'myanimelist',
     ANILIST = 'anilist',
     IGDB = 'igdb',
     COMICVINE = 'comicvine',
     TMDB = 'tmdb',
     MANUAL = 'manual'
   }
   ```

2. **SyncQueueItem** - Local storage for offline operations
   ```typescript
   interface SyncQueueItem {
     id: string                        // Local UUID
     operation: 'create' | 'update' | 'delete'
     entity_type: string               // 'task', 'note', 'team', etc.
     entity_id: string
     data: Record<string, any>         // The change payload
     timestamp: number                 // When queued
     retry_count: number               // For exponential backoff
     last_error: string | null
     status: 'pending' | 'syncing' | 'failed' | 'completed'
   }
   ```

3. **APIResponseCache** - Cache character API responses
   ```typescript
   interface APIResponseCache {
     query: string                     // Search query
     api_source: CharacterSource
     response: any                     // Raw API response
     cached_at: number                 // Timestamp
     ttl: number                       // Time to live (ms)
   }
   ```

### API Contracts

#### 1. Character API Aggregation Contract

**File**: `contracts/character-api.yaml`

```yaml
openapi: 3.0.0
info:
  title: Character API Aggregation Service
  version: 1.0.0
  description: Multi-source character database integration with fallback

paths:
  /api/characters/search:
    post:
      summary: Search characters across multiple APIs
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: Character name or series to search
                sources:
                  type: array
                  items:
                    type: string
                    enum: [myanimelist, anilist, igdb, comicvine, tmdb, all]
                  description: Which APIs to query (defaults to all)
                limit:
                  type: integer
                  default: 10
                  description: Max results per API
      responses:
        '200':
          description: Aggregated character results
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/AggregatedCharacter'
                  sources_queried:
                    type: array
                    items:
                      type: string
                  sources_failed:
                    type: array
                    items:
                      type: string
                  total_results:
                    type: integer

  /api/characters/{id}:
    get:
      summary: Get character by internal ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Character details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AggregatedCharacter'

components:
  schemas:
    AggregatedCharacter:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        series:
          type: string
        description:
          type: string
        image_url:
          type: string
        sources:
          type: array
          items:
            type: string
        confidence_score:
          type: number
          description: Deduplication confidence (0-1)
        external_ids:
          type: object
```

#### 2. Offline Sync Contract

**File**: `contracts/offline-sync.yaml`

```yaml
openapi: 3.0.0
info:
  title: Offline Sync Service
  version: 1.0.0

paths:
  /api/sync/queue:
    post:
      summary: Add operation to sync queue
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SyncOperation'
      responses:
        '202':
          description: Queued for sync

  /api/sync/status:
    get:
      summary: Get sync queue status
      responses:
        '200':
          description: Current sync status
          content:
            application/json:
              schema:
                type: object
                properties:
                  queue_length:
                    type: integer
                  is_syncing:
                    type: boolean
                  last_sync:
                    type: string
                  failed_operations:
                    type: integer

components:
  schemas:
    SyncOperation:
      type: object
      required:
        - operation
        - entity_type
        - entity_id
        - data
      properties:
        operation:
          type: string
          enum: [create, update, delete]
        entity_type:
          type: string
        entity_id:
          type: string
        data:
          type: object
```

#### 3. Team Management Contract

**File**: `contracts/team-management.yaml`

```yaml
openapi: 3.0.0
info:
  title: Team Ownership Management
  version: 1.0.0

paths:
  /api/teams/{id}/transfer-ownership:
    post:
      summary: Transfer team ownership
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - new_owner_id
              properties:
                new_owner_id:
                  type: string
                  description: User ID of new owner
      responses:
        '200':
          description: Ownership transferred
        '400':
          description: Invalid transfer (user not a member, etc.)
        '403':
          description: Not authorized (only owner can transfer)

  /api/teams/{id}:
    delete:
      summary: Delete team
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Team deleted
        '409':
          description: Cannot delete - active members exist (must transfer first)
        '403':
          description: Not authorized (only owner can delete)
```

### Implementation Architecture

#### Multi-API Character Integration

**Pattern**: Parallel queries with response aggregation and deduplication

```typescript
// Service Layer
class CharacterService {
  async searchCharacters(query: string): Promise<AggregatedCharacter[]> {
    // 1. Query all APIs in parallel
    const [mal, anilist, igdb, comicvine, tmdb] = await Promise.allSettled([
      this.myAnimeListClient.search(query),
      this.aniListClient.search(query),
      this.igdbClient.search(query),
      this.comicVineClient.search(query),
      this.tmdbClient.search(query)
    ]);

    // 2. Collect successful responses
    const results = [];
    if (mal.status === 'fulfilled') results.push(...mal.value);
    // ... same for other APIs

    // 3. Deduplicate and merge
    const deduplicated = this.deduplicateCharacters(results);

    // 4. Sort by confidence score
    return deduplicated.sort((a, b) => b.confidence - a.confidence);
  }

  private deduplicateCharacters(results: RawCharacter[]): AggregatedCharacter[] {
    // Fuzzy matching algorithm
    // Group by normalized name + series
    // Merge metadata from all sources
    // Calculate confidence based on # of matching sources
  }
}
```

#### Offline Sync with Conflict Resolution

**Pattern**: Optimistic UI + sync queue with retry

```typescript
// Offline Store
class OfflineSyncStore {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = $state(navigator.onLine);

  async queueOperation(operation: SyncOperation) {
    // 1. Add to IndexedDB queue
    await this.db.syncQueue.add(operation);

    // 2. Update optimistic UI immediately
    this.applyOptimisticUpdate(operation);

    // 3. Try to sync if online
    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    const pending = await this.db.syncQueue.where('status').equals('pending').toArray();

    for (const item of pending) {
      try {
        await this.syncToServer(item);
        await this.db.syncQueue.update(item.id, { status: 'completed' });
      } catch (error) {
        if (error.isConflict) {
          // Prompt user for resolution
          await this.resolveConflict(item, error.serverData);
        } else {
          // Retry with backoff
          await this.retryLater(item);
        }
      }
    }
  }
}
```

#### Responsive Adaptive Layout

**Pattern**: Breakpoint-based component composition

```typescript
// Responsive Container Component
<script lang="ts">
  import { breakpoint } from '$lib/utils/responsive';

  const { isMobile, isTablet, isDesktop, isLargeDesktop } = breakpoint;
</script>

{#if $isMobile}
  <MobileLayout>
    <slot />
  </MobileLayout>
{:else if $isTablet}
  <TabletLayout>
    <slot />
  </TabletLayout>
{:else if $isDesktop}
  <DesktopLayout>
    <slot />
  </DesktopLayout>
{:else}
  <LargeDesktopLayout>
    <slot />
  </LargeDesktopLayout>
{/if}
```

### Quickstart Development Guide

**File**: `quickstart.md`

Purpose: Enable developers to quickly verify bug fixes and run tests

```markdown
# Quickstart: Bug Fixing and Testing

## Setup

1. Install dependencies: `bun install`
2. Set up environment variables (copy `.env.example` to `.env`)
3. Obtain API keys for character services (see research.md)
4. Run database migrations: `bun run supabase db push`

## Running Tests

### All Tests
\`\`\`bash
bun test
\`\`\`

### By Type
\`\`\`bash
bun test:unit        # Unit tests
bun test:integration # Integration tests
bun test:e2e         # End-to-end tests
\`\`\`

### Specific Bug Tests
\`\`\`bash
# Task deletion with dependencies
bun test tests/e2e/tasks/task-deletion.spec.ts

# Responsive layouts
bun test tests/e2e/responsive/

# Offline synchronization
bun test tests/e2e/persistence/offline-sync.spec.ts

# Character API integration
bun test tests/e2e/characters/
\`\`\`

## Bug Fix Verification Checklist

### P1 - Critical Fixes

- [ ] Task deletion shows confirmation with dependency counts
- [ ] Deleted tasks removed from all views (list + kanban)
- [ ] Tasks appear in kanban immediately after creation
- [ ] Mobile layout: content constrained to viewport
- [ ] Mobile layout: sidebar fixed position (doesn't scroll)
- [ ] Mobile layout: action bar sticky at top
- [ ] Tablet layout: task board headers render correctly
- [ ] Notes persist from idea phase to planning phase
- [ ] New users always have a personal team created

### P2 - Important Fixes

- [ ] Sidebar toggle works reliably
- [ ] Photoshoots/tools/resources/calendar grouped in sidebar
- [ ] Settings shows "notifications" instead of "preferences"
- [ ] Dark mode toggle removed from settings
- [ ] Team deletion requires ownership transfer when members exist
- [ ] Team ownership can be transferred to another member

### P3 - Enhanced Features

- [ ] Character search queries multiple APIs
- [ ] Character results are deduplicated and merged
- [ ] User can select from aggregated character results
- [ ] Manual character entry available when APIs fail
- [ ] Custom fields settings moved to unified task settings page

### Resilience Features

- [ ] Network interruption: changes saved to local storage
- [ ] Network interruption: offline indicator displayed
- [ ] Network restoration: automatic sync retry
- [ ] Sync conflicts: user prompted for resolution
- [ ] Extreme viewports: overflow scrolling prevents layout break

## Common Development Tasks

### Adding a Bug Fix

1. Write failing test first (TDD)
2. Implement fix
3. Verify test passes
4. Update documentation if needed

### Testing Responsive Layouts

\`\`\`bash
# Run with different viewports
bun test:e2e -- --project=mobile
bun test:e2e -- --project=tablet
bun test:e2e -- --project=desktop
\`\`\`

### Testing Offline Scenarios

\`\`\`bash
# Playwright has built-in offline mode
# See tests/e2e/persistence/offline-sync.spec.ts for examples
\`\`\`

### Debugging Character API Integration

\`\`\`bash
# Enable API logging
DEBUG=character-api:* bun run dev

# Test individual APIs
bun run scripts/test-character-api.ts --api myanimelist
\`\`\`
\`\`\`

## Phase 2: Not Included in This Command

Phase 2 (task breakdown and implementation sequencing) is handled by the `/speckit.tasks` command and is not part of `/speckit.plan`.

## Next Steps

1. Review this plan for completeness
2. Execute Phase 0 research (documented in `research.md`)
3. Execute Phase 1 design (generate `data-model.md`, API contracts, `quickstart.md`)
4. Proceed to `/speckit.tasks` to break down implementation into actionable tasks

## Constitutional Alignment Summary

This bug fixing and quality improvement feature strongly aligns with constitutional principles:

- **Enables MVP Success**: Fixes critical blockers preventing reliable MVP delivery
- **Supports Complete Workflow**: Ensures all phases of cosplay lifecycle work correctly
- **Test-First Approach**: Comprehensive testing requirements (80% coverage target)
- **Data Privacy**: Confirmation dialogs prevent accidental data loss
- **Cost-Conscious**: All new integrations use free API tiers
- **Future-Ready**: Offline patterns and multi-API integration support planned enhancements
- **Tech Stack Compliance**: Uses established SvelteKit + Supabase + Tailwind stack

**Gate Status**: ✅ PASSED - Ready for Phase 0 research
