# Research: Application Stability and Quality Improvement

**Feature**: `004-bugfix-testing`  
**Date**: 2026-01-03  
**Purpose**: Resolve technical unknowns for bug fixes, API integrations, offline sync, responsive design, and testing strategies

---

## 1. Character Database APIs Integration

### Research Questions Resolved

#### 1.1 MyAnimeList API

**Decision**: Use MyAnimeList API v2 (Jikan API wrapper recommended for easier access)

**Rationale**:
- Jikan API provides free, no-authentication access to MyAnimeList data
- Rate limit: 3 requests/second, 60 requests/minute (generous for our use case)
- Endpoint: `https://api.jikan.moe/v4/characters?q={query}`
- Response includes: character name, images, about (description), anime/manga appearances
- No API key required for basic usage

**Alternatives Considered**:
- Direct MyAnimeList API: Requires OAuth2 authentication, more complex setup
- Scraping: Violates ToS, unreliable, not recommended

**Implementation Notes**:
- Use Jikan API v4 (latest stable)
- Cache responses for 24 hours to respect rate limits
- Handle 429 (rate limit) errors with exponential backoff
- Fallback to manual entry if API unavailable

**Response Schema**:
```typescript
interface JikanCharacter {
  mal_id: number;
  url: string;
  images: {
    jpg: { image_url: string };
    webp: { image_url: string };
  };
  name: string;
  name_kanji: string | null;
  nicknames: string[];
  about: string | null;
  anime: Array<{ role: string; anime: { mal_id: number; title: string } }>;
  manga: Array<{ role: string; manga: { mal_id: number; title: string } }>;
}
```

#### 1.2 AniList API

**Decision**: Use AniList GraphQL API (public, no authentication required)

**Rationale**:
- Free public API with generous rate limits (90 requests/minute per IP)
- GraphQL allows precise data fetching (only needed fields)
- Comprehensive character data including images, descriptions, media appearances
- Well-documented with interactive explorer

**Endpoint**: `https://graphql.anilist.co`

**Query Example**:
```graphql
query SearchCharacters($search: String) {
  Page(page: 1, perPage: 10) {
    characters(search: $search) {
      id
      name {
        full
        native
        alternative
      }
      image {
        large
        medium
      }
      description
      media {
        nodes {
          title {
            romaji
            english
          }
          type
        }
      }
    }
  }
}
```

**Alternatives Considered**:
- REST API: Not available, GraphQL is the only option
- Third-party wrappers: Unnecessary complexity, direct GraphQL is simpler

**Implementation Notes**:
- Use `graphql-request` or `@apollo/client` for GraphQL queries
- Cache responses for 24 hours
- Handle rate limiting (90 req/min is generous)
- Extract series from `media.nodes` array

#### 1.3 IGDB (Internet Game Database) API

**Decision**: Use IGDB API v4 with Twitch OAuth2 authentication

**Rationale**:
- Free tier available (500 requests/day, 4 requests/second)
- Comprehensive video game character database
- Requires Twitch Developer account (free) for client ID/secret
- REST API with good documentation

**Authentication**:
1. Register app at https://dev.twitch.tv/console/apps
2. Get Client ID and Client Secret
3. Exchange for access token (valid 60 days, refreshable)
4. Use access token in `Client-ID` header

**Endpoint**: `https://api.igdb.com/v4/characters`

**Request Example**:
```typescript
POST https://api.igdb.com/v4/characters
Headers: {
  'Client-ID': 'your_client_id',
  'Authorization': 'Bearer your_access_token'
}
Body: 'fields name,slug,description,url,created_at,updated_at,mug_shot,games; search "character_name"; limit 10;'
```

**Response Schema**:
```typescript
interface IGDBCharacter {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  url: string;
  mug_shot: { url: string } | null;
  games: Array<{ id: number; name: string }>;
}
```

**Alternatives Considered**:
- Alternative game databases: Less comprehensive, smaller community
- Scraping: Violates ToS, unreliable

**Implementation Notes**:
- Store access token securely (environment variable)
- Implement token refresh before expiration
- Cache responses for 24 hours
- Handle 401 (unauthorized) by refreshing token

#### 1.4 Comic Vine API

**Decision**: Use Comic Vine API (free tier with API key)

**Rationale**:
- Free tier: 200 requests/day (sufficient for our use case)
- Comprehensive comic book character database
- Simple REST API
- API key available from https://comicvine.gamespot.com/api/

**Endpoint**: `https://comicvine.gamespot.com/api/character/`

**Request Example**:
```
GET https://comicvine.gamespot.com/api/character/?api_key={key}&format=json&filter=name:{query}&limit=10
```

**Response Schema**:
```typescript
interface ComicVineCharacter {
  id: number;
  name: string;
  description: string | null;
  image: {
    icon_url: string;
    medium_url: string;
    screen_url: string;
  };
  publisher: { name: string } | null;
  real_name: string | null;
  aliases: string | null;
}
```

**Alternatives Considered**:
- Marvel/DC official APIs: Require paid subscriptions, limited access
- Scraping: Violates ToS

**Implementation Notes**:
- Store API key in environment variable
- Respect 200 requests/day limit (implement daily counter)
- Cache responses for 7 days (comic data changes infrequently)
- Handle 403 (rate limit exceeded) gracefully

#### 1.5 TMDB (The Movie Database) API

**Decision**: Use TMDB API v3 (free tier with API key)

**Rationale**:
- Free tier: 40 requests/10 seconds (very generous)
- Comprehensive movie/TV/cartoon character database
- Well-documented REST API
- API key available from https://www.themoviedb.org/settings/api

**Endpoint**: `https://api.themoviedb.org/3/search/person`

**Request Example**:
```
GET https://api.themoviedb.org/3/search/person?api_key={key}&query={character_name}&include_adult=false
```

**Note**: TMDB uses "Person" entity (actors/voice actors) rather than "Character". For character search, we'll search for people and extract their character roles from credits.

**Alternative Endpoint for Character Roles**:
```
GET https://api.themoviedb.org/3/person/{person_id}/combined_credits?api_key={key}
```

**Response Schema**:
```typescript
interface TMDBSearchResult {
  results: Array<{
    id: number;
    name: string;
    known_for_department: string;
    profile_path: string | null;
    known_for: Array<{
      title?: string;
      name?: string;
      media_type: 'movie' | 'tv';
    }>;
  }>;
}
```

**Alternatives Considered**:
- IMDB API: Requires paid subscription
- OMDB API: Limited character data, focuses on movies/shows not characters

**Implementation Notes**:
- Store API key in environment variable
- For character search, search people then extract character names from credits
- Cache responses for 7 days
- Image URLs require base URL: `https://image.tmdb.org/t/p/w500{profile_path}`

### 1.6 Character Deduplication Algorithm

**Decision**: Use fuzzy string matching with confidence scoring

**Rationale**:
- Multiple APIs may return the same character with slight name variations
- Need to merge results while preserving all source data
- User should see aggregated results, not duplicates

**Algorithm Selection**: Jaro-Winkler distance for name matching

**Implementation Strategy**:
1. **Normalize Names**: 
   - Convert to lowercase
   - Remove special characters, punctuation
   - Remove common suffixes (Jr., Sr., III)
   - Expand common abbreviations

2. **Fuzzy Matching**:
   - Calculate Jaro-Winkler similarity (0-1 scale)
   - Threshold: 0.85+ similarity = likely match
   - Also match on series/franchise name if available

3. **Confidence Scoring**:
   - Base score: Jaro-Winkler similarity
   - Bonus: Same series/franchise (+0.1)
   - Bonus: Multiple APIs return same character (+0.15)
   - Final confidence: min(1.0, base + bonuses)

4. **Merging Strategy**:
   - Group characters by normalized name + series
   - Merge metadata from all sources
   - Prefer images from APIs with higher resolution
   - Combine descriptions (deduplicate similar text)
   - Aggregate external IDs from all sources

5. **User Override**:
   - Present aggregated results with confidence scores
   - Allow user to manually separate if incorrectly merged
   - Store user corrections to improve future matching

**Alternatives Considered**:
- Levenshtein distance: Less accurate for name variations
- Exact matching: Too strict, misses valid matches
- Machine learning: Overkill for MVP, can be added post-MVP

**Code Example**:
```typescript
import { distance } from 'fastest-levenshtein';

function calculateSimilarity(name1: string, name2: string): number {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  // Jaro-Winkler implementation
  const jw = jaroWinkler(normalized1, normalized2);
  return jw;
}

function mergeCharacters(results: Character[]): AggregatedCharacter[] {
  const groups = new Map<string, Character[]>();
  
  for (const char of results) {
    const key = `${normalizeName(char.name)}|${char.series}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(char);
  }
  
  return Array.from(groups.values()).map(group => ({
    ...group[0],
    sources: group.map(c => c.source),
    confidence: calculateGroupConfidence(group),
    external_ids: mergeExternalIds(group)
  }));
}
```

---

## 2. Offline Synchronization Patterns

### Research Questions Resolved

#### 2.1 Conflict Resolution Strategy

**Decision**: User-prompted conflict resolution with last-write-wins fallback

**Rationale**:
- Best UX: User sees diff and chooses resolution
- Prevents data loss from automatic merging
- Handles edge cases (concurrent edits) gracefully
- Last-write-wins as fallback for non-critical conflicts

**Implementation Strategy**:
1. **Detect Conflicts**:
   - Server returns conflict flag when local version differs from server
   - Compare timestamps: if server updated after local change queued → conflict

2. **Conflict Resolution UI**:
   - Show side-by-side diff (local vs server)
   - Options: "Use My Version", "Use Server Version", "Merge Manually"
   - For simple fields (title, description): easy merge
   - For complex fields (custom fields, subtasks): prefer user version or manual merge

3. **Last-Write-Wins Fallback**:
   - If user doesn't respond within 24 hours, use server version
   - Log conflict for user review later
   - Send notification about resolved conflict

**Alternatives Considered**:
- **Operational Transforms**: Too complex for MVP, requires server-side OT engine
- **Three-way Merge**: Requires baseline tracking, adds complexity
- **Always Last-Write-Wins**: Simple but loses user data, poor UX
- **Automatic Merge**: Risky, may create invalid states

**Implementation Notes**:
- Store conflict metadata in sync queue item
- Queue conflicts separately from regular sync items
- Show conflict resolution UI in notification center
- Allow bulk conflict resolution for multiple items

#### 2.2 IndexedDB Schema Design

**Decision**: Use Dexie.js wrapper for IndexedDB with structured schema

**Rationale**:
- Dexie provides clean API over raw IndexedDB
- Type-safe with TypeScript
- Built-in transaction management
- Easy querying and indexing

**Schema Design**:
```typescript
import Dexie from 'dexie';

interface SyncQueueItem {
  id: string;                    // Local UUID
  operation: 'create' | 'update' | 'delete';
  entity_type: 'task' | 'note' | 'team' | 'resource';
  entity_id: string;              // Server ID if exists, local UUID if not
  data: Record<string, any>;      // The change payload
  timestamp: number;              // When queued (local time)
  retry_count: number;            // For exponential backoff
  last_error: string | null;      // Last error message
  status: 'pending' | 'syncing' | 'failed' | 'completed' | 'conflict';
  server_version?: number;        // Server version timestamp for conflict detection
  conflict_data?: Record<string, any>; // Server version if conflict
}

class SyncDatabase extends Dexie {
  syncQueue!: Dexie.Table<SyncQueueItem, string>;
  localCache!: Dexie.Table<any, string>; // Entity cache for offline reading
  
  constructor() {
    super('CosplayTrackerSync');
    this.version(1).stores({
      syncQueue: 'id, status, timestamp, entity_type, entity_id',
      localCache: 'id, entity_type, updated_at'
    });
  }
}
```

**Indexes**:
- `status`: For querying pending items
- `timestamp`: For FIFO processing
- `entity_type, entity_id`: For deduplication and conflict detection

**Alternatives Considered**:
- **Raw IndexedDB**: Too verbose, error-prone
- **localStorage**: 5-10MB limit, synchronous API, not suitable for large data
- **SQLite (via WASM)**: Overkill, adds bundle size

#### 2.3 Sync Queue Processing

**Decision**: FIFO processing with exponential backoff and priority queue for conflicts

**Rationale**:
- FIFO ensures operations execute in user's intended order
- Exponential backoff prevents server overload during outages
- Priority queue ensures conflicts are resolved before new operations

**Processing Algorithm**:
```typescript
async function processSyncQueue() {
  // 1. Process conflicts first (highest priority)
  const conflicts = await db.syncQueue
    .where('status').equals('conflict')
    .sortBy('timestamp');
  
  for (const item of conflicts) {
    await promptUserForResolution(item);
  }
  
  // 2. Process pending items in order
  const pending = await db.syncQueue
    .where('status').equals('pending')
    .sortBy('timestamp')
    .limit(10); // Batch size
  
  for (const item of pending) {
    try {
      item.status = 'syncing';
      await db.syncQueue.update(item.id, { status: 'syncing' });
      
      const result = await syncToServer(item);
      
      // Check for conflicts
      if (result.conflict) {
        item.status = 'conflict';
        item.conflict_data = result.server_data;
        await db.syncQueue.update(item.id, item);
        await promptUserForResolution(item);
      } else {
        item.status = 'completed';
        await db.syncQueue.update(item.id, { status: 'completed' });
        // Remove after 7 days
        setTimeout(() => db.syncQueue.delete(item.id), 7 * 24 * 60 * 60 * 1000);
      }
    } catch (error) {
      item.retry_count++;
      item.last_error = error.message;
      
      if (item.retry_count > 5) {
        item.status = 'failed';
        // Notify user of permanent failure
        await notifyUserOfSyncFailure(item);
      } else {
        // Exponential backoff: 2^retry_count seconds
        const delay = Math.pow(2, item.retry_count) * 1000;
        setTimeout(() => {
          item.status = 'pending';
          db.syncQueue.update(item.id, item);
        }, delay);
      }
    }
  }
}
```

**Retry Strategy**:
- Initial retry: 2 seconds
- Max retries: 5 attempts
- Backoff: 2^retry_count seconds (2s, 4s, 8s, 16s, 32s)
- After 5 failures: Mark as failed, notify user

**Alternatives Considered**:
- **Priority-based**: Complex to determine priorities, FIFO is simpler
- **Batch sync**: Good for efficiency but harder error handling
- **Immediate sync**: Doesn't work offline, defeats purpose

#### 2.4 Network Detection

**Decision**: Combine `navigator.onLine` with Supabase connection monitoring

**Rationale**:
- `navigator.onLine` is unreliable (can be true but no internet)
- Supabase connection status is authoritative
- Combination provides best user experience

**Implementation**:
```typescript
import { createClient } from '@supabase/supabase-js';

class NetworkMonitor {
  private isOnline = $state(navigator.onLine);
  private supabaseConnected = $state(true);
  
  constructor() {
    // Browser online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Supabase connection monitoring
    supabase.realtime.onOpen(() => {
      this.supabaseConnected = true;
      this.checkConnection();
    });
    
    supabase.realtime.onClose(() => {
      this.supabaseConnected = false;
    });
    
    // Periodic connectivity check
    setInterval(() => this.checkConnection(), 30000); // Every 30s
  }
  
  private async checkConnection() {
    try {
      // Lightweight ping to Supabase
      await supabase.from('_health').select('id').limit(1);
      this.supabaseConnected = true;
    } catch {
      this.supabaseConnected = false;
    }
  }
  
  get isConnected(): boolean {
    return this.isOnline && this.supabaseConnected;
  }
}
```

**Alternatives Considered**:
- **navigator.onLine only**: Unreliable, false positives
- **Ping-based only**: Adds latency, unnecessary requests
- **Supabase only**: Doesn't detect network changes quickly

---

## 3. Responsive Design & Adaptive Layouts

### Research Questions Resolved

#### 3.1 Breakpoint Standards

**Decision**: Use Tailwind CSS default breakpoints with one additional breakpoint

**Rationale**:
- Tailwind breakpoints are industry-standard
- Aligns with existing project setup (Tailwind already in use)
- Mobile-first approach matches modern best practices

**Selected Breakpoints**:
```typescript
const breakpoints = {
  mobile: '0px',        // Default (mobile-first)
  tablet: '768px',     // md in Tailwind
  desktop: '1024px',   // lg in Tailwind
  largeDesktop: '1920px' // xl in Tailwind (custom)
};
```

**Tailwind Mapping**:
- `sm`: 640px (not used, skip to tablet)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (not used)
- `2xl`: 1536px (not used)
- Custom: 1920px (large desktop)

**Justification**:
- **Mobile (0-767px)**: Single column, stacked layout, full-screen modals
- **Tablet (768-1023px)**: Two-column where appropriate, side-by-side panels
- **Desktop (1024-1919px)**: Multi-column, sidebar visible, optimal information density
- **Large Desktop (1920px+)**: Max-width container, centered content, prevent excessive width

**Alternatives Considered**:
- **Bootstrap breakpoints**: Similar but not aligned with Tailwind
- **Material Design breakpoints**: More granular, unnecessary complexity
- **Custom breakpoints**: Non-standard, harder maintenance

#### 3.2 CSS Strategy

**Decision**: Media queries + container queries (hybrid approach)

**Rationale**:
- Media queries for layout-level changes (sidebar, navigation)
- Container queries for component-level responsiveness (cards, tables)
- Best of both worlds: layout control + component flexibility

**Implementation Pattern**:
```css
/* Layout-level (media queries) */
@media (min-width: 768px) {
  .sidebar {
    display: block;
  }
  
  .main-content {
    margin-left: 16rem;
  }
}

/* Component-level (container queries) */
.task-card {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .task-card {
    display: grid;
    grid-template-columns: auto 1fr;
  }
}
```

**Layout Strategy**:
- **Flexbox**: For one-dimensional layouts (nav bars, lists)
- **Grid**: For two-dimensional layouts (task boards, dashboards)
- **Sticky positioning**: For action bars, headers

**Overflow Handling**:
```css
.container {
  max-width: 100vw;
  overflow-x: auto; /* Horizontal scroll for extreme widths */
  overflow-y: auto; /* Vertical scroll for content */
}

/* Prevent layout breaks */
* {
  box-sizing: border-box;
  min-width: 0; /* Allow flex items to shrink below content size */
}
```

**Alternatives Considered**:
- **Media queries only**: Less flexible for component-level changes
- **Container queries only**: Not supported in all browsers yet (needs polyfill)
- **JavaScript-based**: Adds complexity, worse performance

#### 3.3 Testing Approach

**Decision**: Playwright viewport testing with visual regression

**Rationale**:
- Playwright supports multiple viewports natively
- Visual regression catches layout issues automatically
- Can test across real device sizes efficiently

**Playwright Configuration**:
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 667 } }, // iPhone SE
    },
    {
      name: 'tablet',
      use: { viewport: { width: 768, height: 1024 } }, // iPad
    },
    {
      name: 'desktop',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'large-desktop',
      use: { viewport: { width: 2560, height: 1440 } },
    },
  ],
});
```

**Test Strategy**:
1. **Functional Tests**: Test core features at each breakpoint
2. **Visual Regression**: Screenshot comparison across viewports
3. **Layout Tests**: Verify no horizontal overflow, proper stacking
4. **Touch Tests**: Verify touch targets on mobile (min 44x44px)

**Visual Regression Setup**:
```typescript
import { test, expect } from '@playwright/test';

test('task board renders correctly on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/tasks');
  
  // Visual regression
  await expect(page).toHaveScreenshot('task-board-tablet.png');
  
  // Layout assertions
  const sidebar = page.locator('.sidebar');
  await expect(sidebar).toBeVisible();
  
  // No horizontal overflow
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.viewportSize()?.width;
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth!);
});
```

**Alternatives Considered**:
- **Manual testing only**: Time-consuming, inconsistent
- **Real device testing only**: Expensive, hard to automate
- **Responsive design mode only**: Doesn't catch all issues

---

## 4. Team Ownership Transfer Patterns

### Research Questions Resolved

#### 4.1 UX Flow Pattern

**Decision**: Two-step process: Transfer ownership → Delete/Leave team

**Rationale**:
- Prevents orphaned teams (always has an owner)
- Clear separation of concerns (transfer vs delete)
- Matches patterns from Slack, GitHub, Discord

**UX Flow**:
1. **User initiates deletion**:
   - System checks: Does team have other members?
   - If yes: Show modal "Transfer ownership before deleting"
   - If no: Allow immediate deletion

2. **Transfer Ownership Modal**:
   - List all team members (excluding current owner)
   - Radio buttons or dropdown to select new owner
   - Warning: "You will lose owner privileges. This cannot be undone."
   - Confirmation button: "Transfer Ownership"

3. **After Transfer**:
   - Current owner becomes regular member
   - New owner receives notification
   - Option to leave team or stay as member
   - Original owner can now delete team (if no other members)

**UI Components**:
```typescript
// TransferOwnershipDialog.svelte
<script lang="ts">
  let selectedMemberId: string | null = null;
  let members: TeamMember[] = [];
  
  async function transferOwnership() {
    if (!selectedMemberId) return;
    
    await teamService.transferOwnership(teamId, selectedMemberId);
    // Show success message
    // Update UI (current user is now member)
  }
</script>

<Modal>
  <h2>Transfer Team Ownership</h2>
  <p>Select a team member to become the new owner:</p>
  
  {#each members as member}
    <RadioButton
      value={member.id}
      bind:group={selectedMemberId}
    >
      {member.name} ({member.email})
    </RadioButton>
  {/each}
  
  <Warning>
    You will lose owner privileges. This action cannot be undone.
  </Warning>
  
  <Button on:click={transferOwnership} disabled={!selectedMemberId}>
    Transfer Ownership
  </Button>
</Modal>
```

**Alternatives Considered**:
- **Automatic transfer to oldest member**: User may not want that person as owner
- **Delete and reassign projects**: Complex, may lose team context
- **Force deletion with data loss**: Violates data integrity principles

#### 4.2 Edge Case Handling

**Decision**: Comprehensive edge case handling with user-friendly messages

**Edge Cases and Solutions**:

1. **Transfer to user who leaves immediately**:
   - **Solution**: Prevent new owner from leaving for 24 hours after transfer
   - **Message**: "You just became owner. Please wait 24 hours before leaving to ensure team stability."

2. **Circular ownership dependencies**:
   - **Solution**: Not possible with single owner model
   - **Prevention**: Only one owner at a time, transfer is atomic

3. **Transfer while operations in progress**:
   - **Solution**: Lock team during transfer, queue operations
   - **Message**: "Team ownership is being transferred. Please wait..."

4. **Rollback scenarios**:
   - **Solution**: No automatic rollback (too complex)
   - **Alternative**: New owner can transfer back if needed
   - **Audit trail**: Log all ownership transfers for accountability

**Database Transaction Pattern**:
```typescript
async function transferOwnership(teamId: string, newOwnerId: string) {
  return await supabase.rpc('transfer_team_ownership', {
    team_id: teamId,
    new_owner_id: newOwnerId,
    current_user_id: currentUser.id
  });
}

// SQL function (atomic transaction)
CREATE OR REPLACE FUNCTION transfer_team_ownership(
  team_id UUID,
  new_owner_id UUID,
  current_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Verify current user is owner
  IF NOT EXISTS (
    SELECT 1 FROM teams WHERE id = team_id AND owner_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Only team owner can transfer ownership';
  END IF;
  
  -- Verify new owner is a member
  IF NOT EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = team_id AND user_id = new_owner_id
  ) THEN
    RAISE EXCEPTION 'New owner must be a team member';
  END IF;
  
  -- Atomic transfer
  UPDATE teams 
  SET 
    owner_id = new_owner_id,
    previous_owner_id = current_user_id,
    ownership_transferred_at = NOW()
  WHERE id = team_id;
  
  -- Log transfer
  INSERT INTO team_ownership_history (team_id, from_user_id, to_user_id, transferred_at)
  VALUES (team_id, current_user_id, new_owner_id, NOW());
END;
$$ LANGUAGE plpgsql;
```

**User Messaging**:
- **Success**: "Ownership transferred to [Name]. You are now a team member."
- **Error - Not Owner**: "Only the team owner can transfer ownership."
- **Error - Not Member**: "New owner must be a team member. Invite them first."
- **Warning**: "You will lose owner privileges. This cannot be undone."

---

## 5. Testing Strategy & Coverage

### Research Questions Resolved

#### 5.1 Coverage Targets

**Decision**: 80% overall coverage with domain-specific targets

**Rationale**:
- 80% is industry standard for critical applications
- Higher coverage (90%+) has diminishing returns
- Focus on critical paths, not 100% coverage

**Domain-Specific Targets**:
- **Task Management**: 85% (critical user workflow)
- **Team Management**: 80% (data integrity critical)
- **Character API Integration**: 75% (external dependency, harder to test)
- **Offline Sync**: 90% (complex logic, high risk)
- **UI Components**: 70% (visual testing more important)
- **Utilities/Helpers**: 95% (pure functions, easy to test)

**Coverage Measurement**:
```bash
# Vitest coverage
bun test --coverage

# Coverage report
# Target: 80% statements, 80% branches, 80% functions, 80% lines
```

**Alternatives Considered**:
- **100% coverage**: Unrealistic, wastes time on trivial code
- **50% coverage**: Too low, misses critical bugs
- **No coverage target**: No accountability, inconsistent quality

#### 5.2 Test Pyramid

**Decision**: 70% unit tests, 20% integration tests, 10% E2E tests

**Rationale**:
- Unit tests: Fast, isolated, catch logic errors
- Integration tests: Verify service interactions
- E2E tests: Verify critical user journeys
- Pyramid ensures fast feedback loop

**Test Distribution**:
```
        /\
       /  \  E2E (10%) - Critical user journeys
      /____\
     /      \  Integration (20%) - Service interactions
    /________\
   /          \  Unit (70%) - Functions, components, utilities
  /____________\
```

**Examples**:
- **Unit**: `taskService.createTask()`, `formatDate()`, `TaskCard.svelte`
- **Integration**: `taskService + supabase`, `offlineSync + IndexedDB`
- **E2E**: "User creates task → views in kanban → deletes task"

**Alternatives Considered**:
- **Ice cream cone** (mostly E2E): Slow, flaky, hard to maintain
- **Hourglass** (mostly integration): Good but misses edge cases
- **Inverted pyramid**: Worst of all worlds

#### 5.3 Playwright Configuration

**Decision**: Multi-project setup with offline simulation and viewport testing

**Configuration**:
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  projects: [
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['iPhone 13'],
        // Offline simulation
        contextOptions: {
          offline: false, // Can be toggled per test
        }
      },
    },
    {
      name: 'tablet-chrome',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Offline Testing**:
```typescript
test('task creation works offline', async ({ page, context }) => {
  // Go offline
  await context.setOffline(true);
  
  // Create task
  await page.goto('/tasks');
  await page.click('button:has-text("Add Task")');
  await page.fill('input[name="title"]', 'Test Task');
  await page.click('button:has-text("Save")');
  
  // Verify task appears (optimistic UI)
  await expect(page.locator('text=Test Task')).toBeVisible();
  
  // Verify offline indicator
  await expect(page.locator('.offline-indicator')).toBeVisible();
  
  // Go online
  await context.setOffline(false);
  
  // Wait for sync
  await page.waitForSelector('.offline-indicator', { state: 'hidden' });
  
  // Verify task persisted
  await page.reload();
  await expect(page.locator('text=Test Task')).toBeVisible();
});
```

**Viewport Testing**:
```typescript
test('task board responsive layout', async ({ page }) => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' },
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/tasks');
    
    // Verify no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewport.width);
    
    // Visual regression
    await expect(page).toHaveScreenshot(`task-board-${viewport.name}.png`);
  }
});
```

**Flaky Test Prevention**:
- Use `page.waitForLoadState()` before assertions
- Use `page.waitForSelector()` instead of `page.locator().click()` immediately
- Retry failed tests in CI (max 2 retries)
- Use test isolation (fresh database state per test)

**Alternatives Considered**:
- **Cypress**: Good but Playwright is faster, better for CI
- **Puppeteer**: Lower-level, more setup required
- **Manual testing only**: Not scalable, inconsistent

---

## Summary of Decisions

### Character APIs
- **MyAnimeList**: Jikan API (no auth, 3 req/s)
- **AniList**: GraphQL API (no auth, 90 req/min)
- **IGDB**: REST API with Twitch OAuth (500 req/day)
- **Comic Vine**: REST API with API key (200 req/day)
- **TMDB**: REST API with API key (40 req/10s)
- **Deduplication**: Jaro-Winkler fuzzy matching with confidence scoring

### Offline Sync
- **Conflict Resolution**: User-prompted with last-write-wins fallback
- **Storage**: IndexedDB via Dexie.js
- **Processing**: FIFO with exponential backoff
- **Network Detection**: `navigator.onLine` + Supabase connection monitoring

### Responsive Design
- **Breakpoints**: Tailwind defaults (768px, 1024px) + custom 1920px
- **CSS Strategy**: Media queries + container queries
- **Testing**: Playwright viewport testing + visual regression

### Team Ownership
- **UX Flow**: Two-step (transfer → delete)
- **Edge Cases**: Comprehensive handling with user-friendly messages
- **Database**: Atomic transactions with audit trail

### Testing
- **Coverage Target**: 80% overall, domain-specific targets
- **Test Pyramid**: 70% unit, 20% integration, 10% E2E
- **Tools**: Playwright (E2E), Vitest (unit/integration)
- **Configuration**: Multi-project setup with offline simulation

---

## Next Steps

1. **Obtain API Keys**:
   - Register for IGDB (Twitch Developer account)
   - Register for Comic Vine API
   - Register for TMDB API
   - Store keys in environment variables

2. **Implement Character Service**:
   - Create API clients for each service
   - Implement deduplication algorithm
   - Add caching layer

3. **Implement Offline Sync**:
   - Set up Dexie.js database
   - Create sync queue processor
   - Build conflict resolution UI

4. **Implement Responsive Layouts**:
   - Add breakpoint utilities
   - Update components for responsive behavior
   - Add container queries where appropriate

5. **Implement Team Ownership Transfer**:
   - Create database function
   - Build transfer UI
   - Add audit logging

6. **Set Up Testing Infrastructure**:
   - Configure Playwright projects
   - Set up coverage reporting
   - Create test utilities

---

**Research Status**: ✅ Complete - All "NEEDS CLARIFICATION" items resolved



