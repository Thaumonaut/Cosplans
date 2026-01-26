# Quickstart: Bug Fixing and Testing

**Feature**: `004-bugfix-testing`  
**Purpose**: Enable developers to quickly set up, verify bug fixes, and run tests

---

## Prerequisites

- **Node.js**: v18+ (Bun recommended)
- **Supabase CLI**: For database migrations
- **Git**: For version control
- **API Keys**: For character database integrations (optional for basic testing)

---

## Setup

### 1. Install Dependencies

```bash
# Install project dependencies
bun install

# Or with npm
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Variables**:
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Character API Keys (optional - for character search feature)
VITE_MYANIMELIST_API_KEY=  # Not required (uses Jikan API, no key needed)
VITE_ANILIST_API_KEY=      # Not required (public GraphQL API)
VITE_IGDB_CLIENT_ID=       # Required for IGDB (get from Twitch Developer)
VITE_IGDB_CLIENT_SECRET=   # Required for IGDB
VITE_COMICVINE_API_KEY=    # Required for Comic Vine (get from comicvine.gamespot.com/api/)
VITE_TMDB_API_KEY=         # Required for TMDB (get from themoviedb.org/settings/api)
```

**Obtaining API Keys**:

1. **IGDB (Twitch Developer)**:
   - Go to https://dev.twitch.tv/console/apps
   - Create a new application
   - Copy Client ID and generate Client Secret

2. **Comic Vine**:
   - Go to https://comicvine.gamespot.com/api/
   - Register and get API key (free tier: 200 requests/day)

3. **TMDB**:
   - Go to https://www.themoviedb.org/settings/api
   - Create API key (free tier: 40 requests/10 seconds)

**Note**: Character API integration is optional. The app will work without these keys, but character search will be limited to manual entry.

### 3. Database Setup

```bash
# Start Supabase locally (if using local development)
supabase start

# Run database migrations
bun run supabase db push

# Or manually
supabase migration up
```

**Migration Files**:
- `supabase/migrations/YYYYMMDD_add_task_soft_delete.sql`
- `supabase/migrations/YYYYMMDD_add_team_ownership_tracking.sql`
- `supabase/migrations/YYYYMMDD_add_user_personal_team.sql`
- `supabase/migrations/YYYYMMDD_create_characters_table.sql`
- `supabase/migrations/YYYYMMDD_create_team_ownership_history.sql`

### 4. Start Development Server

```bash
# Start dev server
bun run dev

# Server will be available at http://localhost:5173
```

---

## Running Tests

### All Tests

```bash
# Run all tests (unit + integration + E2E)
bun test

# Or with npm
npm test
```

### By Type

```bash
# Unit tests only
bun test:unit

# Integration tests only
bun test:integration

# End-to-end tests only
bun test:e2e

# With coverage
bun test --coverage
```

### Specific Bug Tests

```bash
# Task deletion with dependencies
bun test tests/e2e/tasks/task-deletion.spec.ts

# Task sync (kanban view)
bun test tests/e2e/tasks/task-sync.spec.ts

# Responsive layouts
bun test tests/e2e/responsive/

# Offline synchronization
bun test tests/e2e/persistence/offline-sync.spec.ts

# Character API integration
bun test tests/e2e/characters/

# Team management
bun test tests/e2e/teams/
```

### Test Coverage

```bash
# Generate coverage report
bun test --coverage

# View coverage report
open coverage/index.html

# Coverage targets:
# - Overall: 80%
# - Task Management: 85%
# - Offline Sync: 90%
# - Character API: 75%
```

---

## Bug Fix Verification Checklist

### P1 - Critical Fixes

#### Task Management
- [ ] **Task deletion**: Delete button visible on all task cards
- [ ] **Deletion confirmation**: Shows dialog with dependency counts (subtasks, resource links)
- [ ] **Soft delete**: Deleted tasks removed from all views (list, kanban, calendar)
- [ ] **Persistence**: Deleted tasks stay deleted after page refresh
- [ ] **Kanban sync**: Tasks appear in kanban view immediately after creation
- [ ] **View consistency**: Tasks appear in all views (list, kanban, table) consistently

#### Responsive Design
- [ ] **Mobile viewport**: Content constrained to device dimensions (no horizontal overflow)
- [ ] **Sidebar fixed**: Sidebar doesn't scroll with page content on mobile
- [ ] **Action bar sticky**: Action bar remains at top on all pages
- [ ] **Tablet headers**: Task board headers render correctly on tablets (no text truncation)
- [ ] **Button positioning**: "What should I do now" button positioned correctly on all screen sizes (320px+)

#### Data Persistence
- [ ] **Notes persistence**: Idea phase notes persist when transitioning to planning phase
- [ ] **Task relationships**: Tasks can be linked to resources and projects
- [ ] **Custom fields**: Custom field data persists across all views
- [ ] **Subtask tracking**: Subtasks tracked separately or together with main tasks

#### Team Management
- [ ] **Auto-create team**: New users automatically get personal team on signup
- [ ] **Team requirement**: All users always have at least one team

### P2 - Important Fixes

#### Navigation & Interface
- [ ] **Sidebar toggle**: Sidebar opens and closes reliably
- [ ] **Sidebar grouping**: Photoshoots, tools, resources, calendar grouped in dedicated section
- [ ] **Settings organization**: Settings shows "notifications" section (not "preferences")
- [ ] **Dark mode removed**: Dark mode toggle removed from settings

#### Team Management
- [ ] **Ownership transfer**: Team owner can transfer ownership to another member
- [ ] **Transfer validation**: System prevents transfer to non-members
- [ ] **Deletion protection**: Team deletion requires ownership transfer when members exist
- [ ] **Transfer flow**: Two-step process (transfer → delete) works correctly

### P3 - Enhanced Features

#### Character API Integration
- [ ] **Multi-API search**: Character search queries multiple APIs (MyAnimeList, AniList, IGDB, Comic Vine, TMDB)
- [ ] **API fallback**: System gracefully handles individual API failures
- [ ] **Deduplication**: Character results are deduplicated and merged correctly
- [ ] **Confidence scoring**: Results sorted by confidence score
- [ ] **User selection**: User can select from aggregated character results
- [ ] **Manual entry**: Manual character entry available when all APIs fail

#### Settings
- [ ] **Unified task settings**: Custom field creation moved to unified task settings page

### Resilience Features

#### Offline Sync
- [ ] **Local storage**: Changes saved to IndexedDB when network unavailable
- [ ] **Offline indicator**: Offline status displayed to user
- [ ] **Auto-sync**: Automatic sync retry when network restored
- [ ] **Conflict resolution**: User prompted for resolution when conflicts detected
- [ ] **Retry logic**: Exponential backoff for failed sync operations
- [ ] **Queue management**: Sync queue processes in FIFO order

#### Responsive Design
- [ ] **Extreme viewports**: Overflow scrolling prevents layout breaks
- [ ] **Breakpoints**: Layouts adapt correctly at 768px, 1024px, 1920px
- [ ] **Container queries**: Components respond to container size (where applicable)

---

## Common Development Tasks

### Adding a Bug Fix

1. **Write failing test first** (TDD approach):
   ```bash
   # Create test file
   touch tests/e2e/tasks/my-bug-fix.spec.ts
   
   # Write test that reproduces the bug
   # Test should fail initially
   ```

2. **Implement fix**:
   ```bash
   # Make code changes to fix the bug
   # Ensure test now passes
   ```

3. **Verify test passes**:
   ```bash
   bun test tests/e2e/tasks/my-bug-fix.spec.ts
   ```

4. **Update documentation** (if needed):
   - Update this checklist if it's a new bug
   - Update relevant docs if behavior changed

### Testing Responsive Layouts

```bash
# Run E2E tests with different viewports
bun test:e2e -- --project=mobile      # 375x667 (iPhone SE)
bun test:e2e -- --project=tablet       # 768x1024 (iPad)
bun test:e2e -- --project=desktop      # 1920x1080
bun test:e2e -- --project=large-desktop # 2560x1440

# Visual regression testing
bun test:e2e -- --update-snapshots    # Update screenshots
```

**Manual Testing**:
- Use browser DevTools responsive mode
- Test at breakpoints: 320px, 375px, 768px, 1024px, 1920px, 2560px
- Verify no horizontal overflow
- Verify touch targets are at least 44x44px on mobile

### Testing Offline Scenarios

```bash
# Playwright has built-in offline mode
# See tests/e2e/persistence/offline-sync.spec.ts for examples

# Run offline tests
bun test tests/e2e/persistence/offline-sync.spec.ts
```

**Manual Testing**:
1. Open browser DevTools → Network tab
2. Enable "Offline" mode
3. Perform actions (create task, update task, etc.)
4. Verify changes saved to IndexedDB
5. Verify offline indicator appears
6. Disable "Offline" mode
7. Verify automatic sync occurs
8. Verify changes appear on server

### Debugging Character API Integration

```bash
# Enable API logging
DEBUG=character-api:* bun run dev

# Test individual APIs
bun run scripts/test-character-api.ts --api myanimelist
bun run scripts/test-character-api.ts --api anilist
bun run scripts/test-character-api.ts --api igdb
bun run scripts/test-character-api.ts --api comicvine
bun run scripts/test-character-api.ts --api tmdb

# Test aggregation
bun run scripts/test-character-api.ts --query "Naruto" --all
```

**API Response Inspection**:
- Check browser Network tab for API requests
- Verify responses are cached in IndexedDB
- Check console for deduplication logs
- Verify confidence scores are calculated correctly

### Database Migrations

```bash
# Create new migration
supabase migration new add_feature_name

# Edit migration file
# supabase/migrations/YYYYMMDDHHMMSS_add_feature_name.sql

# Apply migration
supabase migration up

# Or push all migrations
bun run supabase db push

# Rollback migration (if needed)
supabase migration down
```

### Debugging Team Ownership Transfer

```bash
# Check team ownership
psql -h localhost -U postgres -d postgres -c "SELECT id, name, owner_id FROM teams;"

# Check ownership history
psql -h localhost -U postgres -d postgres -c "SELECT * FROM team_ownership_history ORDER BY transferred_at DESC LIMIT 10;"

# Test transfer via API
curl -X POST http://localhost:5173/api/teams/{team_id}/transfer-ownership \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"new_owner_id": "{user_id}"}'
```

---

## Troubleshooting

### Tests Failing

**Issue**: Tests fail with "Cannot find module" errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .svelte-kit
bun install
```

**Issue**: E2E tests fail with timeout errors
```bash
# Solution: Increase timeout in playwright.config.ts
# Or check if dev server is running
bun run dev
```

### Database Issues

**Issue**: Migration fails with "relation already exists"
```bash
# Solution: Check if migration was partially applied
supabase migration list

# Reset database (WARNING: deletes all data)
supabase db reset
```

**Issue**: RLS policies blocking queries
```bash
# Solution: Check RLS policies
psql -h localhost -U postgres -d postgres -c "SELECT * FROM pg_policies WHERE tablename = 'tasks';"

# Temporarily disable RLS for debugging (NOT for production)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

### API Integration Issues

**Issue**: Character API returns 401/403 errors
```bash
# Solution: Check API keys in .env
# Verify keys are correct and not expired
# Check rate limits (may have exceeded)
```

**Issue**: API responses not cached
```bash
# Solution: Check IndexedDB in browser DevTools
# Application → IndexedDB → CosplayTrackerSync → apiCache
# Verify TTL hasn't expired
```

### Offline Sync Issues

**Issue**: Changes not syncing after network restore
```bash
# Solution: Check sync queue in IndexedDB
# Application → IndexedDB → CosplayTrackerSync → syncQueue
# Check status: should be 'pending' or 'syncing'
# Check last_error for error messages
```

**Issue**: Conflicts not detected
```bash
# Solution: Verify server_version is being sent
# Check conflict detection logic in offlineService.ts
# Ensure timestamps are being compared correctly
```

---

## Performance Testing

### Load Testing

```bash
# Test with large datasets
# Create 1000 tasks
bun run scripts/seed-test-data.ts --tasks 1000

# Test view rendering performance
bun test tests/e2e/performance/task-list-rendering.spec.ts
```

### Memory Profiling

```bash
# Chrome DevTools → Performance tab
# Record while performing actions
# Check for memory leaks
# Verify IndexedDB cleanup (old sync items removed)
```

---

## Next Steps

1. **Review Plan**: Review `plan.md` for complete implementation details
2. **Review Research**: Check `research.md` for API details and patterns
3. **Review Data Model**: Check `data-model.md` for entity definitions
4. **Review Contracts**: Check `contracts/` for API specifications
5. **Start Implementation**: Use `/speckit.tasks` to break down into actionable tasks

---

## Resources

- **Research Document**: `research.md` - API details, patterns, best practices
- **Data Model**: `data-model.md` - Entity definitions and relationships
- **API Contracts**: `contracts/` - OpenAPI specifications
- **Plan**: `plan.md` - Complete implementation plan
- **Spec**: `spec.md` - Feature specification and requirements

---

## Constitutional Alignment

This bug fixing and quality improvement feature strongly aligns with constitutional principles:

- ✅ **Enables MVP Success**: Fixes critical blockers preventing reliable MVP delivery
- ✅ **Supports Complete Workflow**: Ensures all phases of cosplay lifecycle work correctly
- ✅ **Test-First Approach**: Comprehensive testing requirements (80% coverage target)
- ✅ **Data Privacy**: Confirmation dialogs prevent accidental data loss
- ✅ **Cost-Conscious**: All new integrations use free API tiers
- ✅ **Future-Ready**: Offline patterns and multi-API integration support planned enhancements
- ✅ **Tech Stack Compliance**: Uses established SvelteKit + Supabase + Tailwind stack

**Gate Status**: ✅ PASSED - Ready for implementation

---

**Quickstart Status**: ✅ Complete - All setup and verification instructions documented



