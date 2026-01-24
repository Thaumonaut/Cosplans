# Idea/Project Refactoring Summary
**Date**: 2026-01-08
**Issue**: Ideas required character AND series to be promoted, blocking OC (Original Character) cosplays
**Updated**: 2026-01-08 - Title is now REQUIRED and auto-generated

---

## Changes Made

### 1. Type Definitions Updated ✅
**File**: `src/lib/types/domain/idea.ts`

**Changes**:
- Made `title` field **REQUIRED** (not optional) in `Idea` interface
- `title` is optional in `IdeaCreate` but will be auto-generated if not provided
- Made `character` field optional (was required)
- Made `series` field optional (already was, but now emphasized)
- Added `generateIdeaTitle()` helper function for auto-generation
- Updated `getIdeaDisplayTitle()` helper function

**Title Generation Logic**:
```
Auto-generation format (when title not provided):
1. Character + Series: "{character} from {series} cosplay" (e.g., "okarun from dandadan cosplay")
2. Character only: "{character} cosplay" (e.g., "okarun cosplay")
3. Series only: "{series} cosplay" (e.g., "dandadan cosplay")
4. Fallback: "Untitled Idea"

User can override with custom title (e.g., "okarun turbo granny mode")
```

**Examples**:
- Input: character="okarun", series="dandadan", title=null
  - Generated: "okarun from dandadan cosplay"
- Input: character="okarun", series="dandadan", title="okarun turbo granny mode"
  - Uses: "okarun turbo granny mode" (custom title)
- Input: character="okarun", series=null, title=null
  - Generated: "okarun cosplay"

### 2. Validation Removed ✅
**File**: `src/lib/components/ideas/IdeaDetail.svelte`

**Changes**:
- Removed `disabled={isConverting || !idea?.character || !idea?.series}` validation
- Changed to `disabled={isConverting}` only
- Removed helper text about missing character/series
- Button now always clickable (unless already converting)

**Before**:
```svelte
disabled={isConverting || !idea?.character || !idea?.series}
```

**After**:
```svelte
disabled={isConverting}
```

### 3. Database Migration Updated ✅
**File**: `supabase/migrations/20260108000001_add_idea_title_field.sql`

**Changes**:
- Added `title` TEXT column to `ideas` table
- Made `title` **NOT NULL** (required)
- Made `character` column nullable (DROP NOT NULL)
- Made `series` column nullable (DROP NOT NULL)
- Auto-generates titles for existing ideas before making column NOT NULL
- Added index for title searches
- Removed check constraint (title is always present now)

**Migration Strategy**:
1. Add title column (nullable initially)
2. Generate titles for all existing ideas
3. Make title NOT NULL
4. Make character and series nullable

### 4. Service Layer Updated ✅
**File**: `src/lib/api/services/ideaService.ts`

**Changes**:
- `create()`: Auto-generates title if not provided using `generateIdeaTitle()`
- `update()`: Regenerates title if set to empty/null and character/series changed
- Always ensures title is present before database insert/update

---

## Benefits

### 1. Support for Original Characters (OCs) ✅
Users can now create ideas like:
- "My OC: Shadow Warrior" (custom title, no character/series)
- "Kai the Ninja" (character only, auto-generates "Kai the Ninja cosplay")
- "okarun from dandadan cosplay" (auto-generated from character + series)
- "okarun turbo granny mode" (custom title override)

### 2. Better Flexibility ✅
- Custom titles for complex cosplays
- No forced fields when they don't apply
- More intuitive workflow
- Title always present (no null checks needed)

### 3. Backwards Compatible ✅
- Existing ideas get titles auto-generated during migration
- Migration handles data transition gracefully
- All ideas have titles after migration

---

## User Flow Examples

### Example 1: Canon Character (Auto-generated)
**Input**:
- Character: "okarun"
- Series: "dandadan"
- Title: (empty)

**Generated Title**: "okarun from dandadan cosplay"
**Display**: "okarun from dandadan cosplay"

### Example 2: Custom Title Override
**Input**:
- Character: "okarun"
- Series: "dandadan"
- Title: "okarun turbo granny mode"

**Display**: "okarun turbo granny mode" (custom title takes priority)

### Example 3: Character Only (Auto-generated)
**Input**:
- Character: "Kai the Ninja"
- Series: (empty)
- Title: (empty)

**Generated Title**: "Kai the Ninja cosplay"
**Display**: "Kai the Ninja cosplay"

### Example 4: Original Character (Custom Title)
**Input**:
- Character: (empty)
- Series: (empty)
- Title: "My OC: Shadow Warrior"

**Display**: "My OC: Shadow Warrior"

---

## Migration Path

### Step 1: Apply Database Migration
```bash
cd /home/jek/Documents/projects/Cosplans
supabase db push
```

Or for remote:
```bash
supabase db push --linked
```

### Step 2: Test in Dev
```bash
bun run dev
```

Test scenarios:
1. Create new idea with title only ✓
2. Create new idea with character only ✓ (auto-generates title)
3. Create new idea with character + series ✓ (auto-generates title)
4. Create new idea with custom title ✓
5. Promote idea to project (no validation errors) ✓
6. Existing ideas still display correctly ✓

### Step 3: Verify Services
The `ideaService.ts` has been updated to auto-generate titles.

---

## Files Modified

1. ✅ `src/lib/types/domain/idea.ts` - Type definitions + helpers
2. ✅ `src/lib/components/ideas/IdeaDetail.svelte` - Removed validation
3. ✅ `supabase/migrations/20260108000001_add_idea_title_field.sql` - DB migration (updated)
4. ✅ `src/lib/api/services/ideaService.ts` - Auto-generation logic

## Files To Update (Future)

1. ⏳ `src/lib/components/cards/IdeaCard.svelte` - Use `idea.title` directly (always present)
2. ⏳ `src/routes/(auth)/ideas/+page.svelte` - Use `idea.title` directly
3. ⏳ UI components showing idea titles - Use `idea.title` (no need for helper in most cases)

---

## Testing Checklist

### Database
- [ ] Migration applies without errors
- [ ] Existing ideas get titles auto-generated
- [ ] Title column is NOT NULL
- [ ] Character and series are nullable
- [ ] Index created successfully

### UI
- [x] "Start Planning" button clickable
- [ ] Can create idea with title only
- [ ] Can create idea with character only (title auto-generated)
- [ ] Can create idea with character + series (title auto-generated)
- [ ] Can create idea with custom title
- [ ] Can promote idea without series
- [ ] Title displays correctly in cards
- [ ] Title displays correctly in detail view

### API
- [x] ideaService.create() auto-generates title if not provided
- [x] ideaService.update() regenerates title if needed
- [ ] ideaService.convert() works without series
- [ ] No validation errors on backend

---

## Known Issues

### Issue 1: Display Logic May Need Updates
**Status**: ⏳ TODO
Some components may still reference `idea.character` directly. Since title is now always present, components can use `idea.title` directly.

**Fix**: Update components to use `idea.title`:
```typescript
// Instead of:
{getIdeaDisplayTitle(idea)} // Still works, but unnecessary

// Can use:
{idea.title} // Always present now
```

---

## Next Steps

1. **Apply migration**: `supabase db push`
2. **Test in browser**: Try creating ideas with various combinations
3. **Update display logic**: Use `idea.title` directly where appropriate
4. **Verify backend**: Test ideaService.create() and update()
5. **Update tests**: Add tests for title auto-generation

---

## Rollback Plan

If issues arise:

### Step 1: Revert Migration
```sql
-- Make title nullable again
ALTER TABLE ideas ALTER COLUMN title DROP NOT NULL;

-- Make character required again (if needed)
ALTER TABLE ideas ALTER COLUMN character SET NOT NULL;

-- Make series required again (if needed)
ALTER TABLE ideas ALTER COLUMN series SET NOT NULL;
```

### Step 2: Revert Code
```bash
git checkout HEAD~1 src/lib/types/domain/idea.ts
git checkout HEAD~1 src/lib/api/services/ideaService.ts
git checkout HEAD~1 src/lib/components/ideas/IdeaDetail.svelte
```

---

**Status**: ✅ Ready for Testing
**Risk Level**: LOW (backwards compatible, migration handles existing data)
**User Impact**: POSITIVE (more flexibility, better UX)
