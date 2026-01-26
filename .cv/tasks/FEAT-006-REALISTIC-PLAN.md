# FEAT-006 Realistic Implementation Plan

**Updated:** 2026-01-24  
**Philosophy:** Fix broken → Add features → Polish design  
**Current State:** 71.5% functional, critical creation flows broken

---

## 🔴 PHASE 1: Fix Critical Broken Functionality (URGENT)

**Goal:** Make character/project creation work and auto-create moodboards  
**Timeline:** 1-2 days  
**Priority:** CRITICAL - Blocking all user workflows

### T-041: Fix Character/Project Creation Flow
**Time:** 4-6 hours  
**Status:** NOT STARTED  
**Priority:** CRITICAL

**Issues to Fix:**
1. Make `series` field **truly optional** in CharacterCreationForm
   - Remove `|| !series` from `disabled` validation (line 163)
   - Update label: "Series / Source (Optional)"
   - Allow creation with just character name

2. Hook up `onSave` handler in `/characters/+page.svelte`
   - Connect to projectService.create()
   - Handle success/error states
   - Close flyout on success

3. Add proper `title` field to projects
   - Separate from character name
   - Auto-generate: `{character}` or `{character} - {series}` if series exists
   - Allow custom override

**Verification:**
- [ ] Can create character with just name (no series)
- [ ] Can create character with series
- [ ] Project appears in list immediately
- [ ] Form closes on success
- [ ] Changes persist after refresh

**Files:**
- `src/lib/components/ideas/CharacterCreationForm.svelte`
- `src/routes/(auth)/characters/+page.svelte`
- `src/lib/types/domain/project.ts` (add title field)
- Database migration for `projects` table

---

### T-042: Implement Auto-Moodboard Creation
**Time:** 3-4 hours  
**Status:** NOT STARTED  
**Priority:** CRITICAL  
**Depends on:** T-041

**What to Build:**
1. Update `projectService.create()` to auto-create moodboard
   ```typescript
   async function create(data) {
     const project = await createProject(data);
     const moodboard = await moodboardsService.createForProject(project.id);
     return { project, moodboard };
   }
   ```

2. Link moodboard to project in database
   - Add `moodboard_id` to projects table
   - Or query by `entity_type='project'` and `entity_id`

3. Update idea creation similarly
   - Ideas also get auto-moodboards
   - Same pattern as projects

**Verification:**
- [ ] Create new project → moodboard exists
- [ ] Navigate to moodboard tab → loads immediately
- [ ] Create new idea → moodboard exists
- [ ] Database link is correct

**Files:**
- `src/lib/api/services/projectService.ts`
- `src/lib/api/services/ideaService.ts` (if exists)
- `src/lib/api/services/moodboardsService.ts`
- Database migration (if needed)

---

### T-043: Backfill Moodboards for Existing Projects/Ideas
**Time:** 2-3 hours  
**Status:** NOT STARTED  
**Priority:** HIGH  
**Depends on:** T-042

**What to Build:**
1. Migration script to create moodboards
   ```sql
   -- Create moodboard for each project without one
   INSERT INTO moodboards (entity_type, entity_id, ...)
   SELECT 'project', id, ...
   FROM projects
   WHERE NOT EXISTS (
     SELECT 1 FROM moodboards 
     WHERE entity_type = 'project' AND entity_id = projects.id
   );
   ```

2. Or on-demand creation
   - When user navigates to moodboard tab
   - Check if exists, create if not
   - Lazy creation pattern

**Verification:**
- [ ] Existing projects have moodboards
- [ ] Existing ideas have moodboards
- [ ] No duplicate moodboards created
- [ ] Migration is idempotent

**Files:**
- `supabase/migrations/YYYYMMDDHHMMSS_backfill_moodboards.sql`
- Or: `src/lib/api/services/moodboardsService.ts` (lazy creation)

---

## 🟡 PHASE 2: Critical Feature Gaps (HIGH PRIORITY)

**Goal:** Complete the broken features we claimed were done  
**Timeline:** 2-3 days

### T-044: Fix ContainerDropZone to Actually Appear
**Time:** 2-3 hours  
**Status:** NOT STARTED  
**Priority:** HIGH  
**Depends on:** None

**Issue:** Drop zone code exists but doesn't show when inside container

**Fix:**
1. Check `+page.svelte` - is `isDragging` state properly connected?
2. Verify ContainerDropZone renders when `draggedNodeId !== null`
3. Test: Drag node inside container → zone appears at top
4. Test: Drop on zone → node moves to parent

**Verification:**
- [ ] Inside container, drag any node
- [ ] Drop zone appears with visual indicator
- [ ] Drop node on zone
- [ ] Navigate to parent
- [ ] Node is at parent level

**Files:**
- `src/routes/(auth)/moodboard/[id]/+page.svelte`
- `src/lib/components/moodboard/ContainerDropZone.svelte`

---

### T-045: Make AddCardMenu Actually Create Nodes
**Time:** 3-4 hours  
**Status:** NOT STARTED  
**Priority:** HIGH  
**Blocks:** T-017, T-018, T-019 verification

**Issue:** Menu shows UI but clicking card type does nothing

**Fix:**
1. Hook up `onSelectType` callback in `+page.svelte`
2. Create node creation logic:
   ```svelte
   function handleSelectType(type, containerType) {
     const newNode = {
       nodeType: type,
       containerType,
       title: 'Untitled',
       parent_id: currentContainerId,
       position_x: 0,
       position_y: 0,
     };
     await moodboardsService.createNode(moodboardId, newNode);
   }
   ```

3. Wire up search filter
4. Close modal after creation
5. Show success feedback

**Verification:**
- [ ] Click card type → node created
- [ ] Node appears in current view
- [ ] Modal closes
- [ ] Can create all card types
- [ ] Search filter works

**Files:**
- `src/lib/components/moodboard/AddCardMenu.svelte`
- `src/routes/(auth)/moodboard/[id]/+page.svelte`

---

### T-046: Fix InspectorPanel Inline Editing
**Time:** 4-5 hours  
**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Depends on:** None

**Issue:** Panel shows node info but can't edit anything

**Fix:**
1. Verify InlineTextEditor components are rendering
2. Hook up `onUpdate` callback properly
3. Test each field: title, tags, notes, metadata
4. Implement save handlers
5. Add loading/success states
6. Fix pin/close buttons

**Verification:**
- [ ] Click node → inspector opens
- [ ] Edit title → saves
- [ ] Edit tags → saves  
- [ ] Edit notes → saves
- [ ] Pin button works
- [ ] Close button works
- [ ] Mobile: bottom sheet works

**Files:**
- `src/lib/components/moodboard/InspectorPanel.svelte`
- `src/routes/(auth)/moodboard/[id]/+page.svelte`

---

## 🟢 PHASE 3: Integration & Feature Parity (MEDIUM PRIORITY)

**Goal:** Replace reference tab with moodboard, add missing features  
**Timeline:** 3-5 days

### T-047: Replace Reference Tab with Moodboard Tab
**Time:** 2-3 hours  
**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Depends on:** T-041, T-042, T-043

**What to Do:**
1. Update project detail page tabs
   - Remove "References" tab
   - Rename/reorder to show "Moodboard" prominently

2. Update navigation/routes
   - `/project/[id]/moodboard` becomes primary
   - Redirect old `/project/[id]/references` → `/project/[id]/moodboard`

3. Data migration (if needed)
   - Move reference data to moodboard nodes?
   - Or keep both temporarily during transition?

**Verification:**
- [ ] Moodboard tab is visible
- [ ] Reference tab is gone (or hidden)
- [ ] All projects show moodboard
- [ ] Old reference links redirect

**Files:**
- Project detail page component
- Navigation components
- Route files

---

### T-048: Add Embedded Views to Gallery
**Time:** 4-6 hours  
**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Depends on:** T-047

**Feature:** Bring SocialMediaEmbed functionality to NodeCard

**What to Add:**
1. Expand cards to show embeds inline
   - Click card → expand to show full embed
   - Instagram, TikTok, YouTube embeds
   - Reuse existing `SocialMediaEmbed` component

2. Modal/lightbox for full view
   - Click expanded card → full modal
   - Better for images/videos
   - Swipe between cards

3. Toggle embed visibility
   - User preference: thumbnails vs embeds
   - Performance consideration

**Verification:**
- [ ] Click social media card → shows embed
- [ ] Click image card → full modal
- [ ] Embeds load correctly
- [ ] Can toggle embed mode
- [ ] Performance is acceptable (50+ cards)

**Files:**
- `src/lib/components/moodboard/NodeCard.svelte`
- `src/lib/components/moodboard/SocialMediaEmbed.svelte`

---

### T-049: Add Content Type Filtering to Gallery
**Time:** 3-4 hours  
**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Depends on:** None

**Feature:** Filter gallery view by node type

**What to Add:**
1. Filter UI in gallery view
   - Chip/badge filters for each type
   - Multi-select (show images + videos)
   - "All" option to clear

2. Filter logic
   ```svelte
   const filteredNodes = $derived(() => {
     if (activeFilters.length === 0) return nodes;
     return nodes.filter(n => activeFilters.includes(n.nodeType));
   });
   ```

3. Save filter preference
   - Remember last selection
   - Per-moodboard or global?

**Verification:**
- [ ] Filter chips appear above gallery
- [ ] Click filter → gallery updates
- [ ] Multi-select works
- [ ] Filter persists on view switch
- [ ] "Clear all" works

**Files:**
- `src/routes/(auth)/moodboard/[id]/+page.svelte`

---

## 🔵 PHASE 4: Design & Polish (LOW PRIORITY - LATER)

**Goal:** Redesign cards and nodes after functionality is complete  
**Timeline:** After Phase 3 complete

### T-050: Card & Node Redesign
**Time:** TBD - After functionality complete  
**Status:** DEFERRED  
**Priority:** LOW

**Current State:** 
- Design is functional placeholder
- Waiting for features before redesign

**When to Do This:**
- After all Phase 1-3 tasks complete
- After user testing of functionality
- Create separate design spec first

**Areas to Redesign:**
1. NodeCard component (gallery/list view)
2. Canvas node components
3. Container nodes
4. Specialized card types (color palette, measurements, fabric)
5. Overall moodboard aesthetics

**Approach:**
- Create design mockups first
- Get user feedback
- Implement in iterations
- A/B test if needed

---

## 📊 Updated Task Summary

### Critical Path (Must Fix):
1. ✅ **Phase 1** (1-2 days)
   - T-041: Fix creation flow
   - T-042: Auto-create moodboards
   - T-043: Backfill moodboards

2. ✅ **Phase 2** (2-3 days)
   - T-044: ContainerDropZone
   - T-045: AddCardMenu creation
   - T-046: InspectorPanel editing

3. ✅ **Phase 3** (3-5 days)
   - T-047: Replace reference tab
   - T-048: Embedded views
   - T-049: Content filtering

4. ⏸️ **Phase 4** (TBD - later)
   - T-050: Design overhaul

**Total Critical Work:** ~6-10 days to fix and complete functionality  
**Then:** Design iteration phase

---

## Scope Management

### Not Included in This Plan:
- Character API search (separate feature, nice-to-have)
- Ghost nodes (v1.1 feature)
- Calendar integration (v1.2 feature)
- Advanced canvas features
- Mobile capture (CP-05)
- Sharing features (CP-07)

### Included:
- Fix what's broken
- Complete what's claimed done
- Feature parity with reference tab
- Basic usability

---

## Success Criteria

### Phase 1 Done When:
- ✅ Can create characters/projects without errors
- ✅ Every project has a moodboard
- ✅ Auto-creation works for new items
- ✅ Existing items have moodboards

### Phase 2 Done When:
- ✅ Can move nodes in/out of containers
- ✅ Can create all card types from menu
- ✅ Can edit nodes in inspector

### Phase 3 Done When:
- ✅ Reference tab is replaced
- ✅ Embeds work in gallery
- ✅ Can filter by content type
- ✅ Feature parity achieved

### Ready for Design Phase When:
- ✅ All above criteria met
- ✅ No critical bugs
- ✅ Users can complete core workflows
- ✅ Performance is acceptable

---

## Next Steps

1. **Review this plan** - Does it match your vision?
2. **Start with T-041** - Fix character creation
3. **Then T-042** - Auto-moodboard creation
4. **Progress through phases** - Fix → Features → Polish

**Question:** Should I start implementing T-041 (fix character creation flow)?
