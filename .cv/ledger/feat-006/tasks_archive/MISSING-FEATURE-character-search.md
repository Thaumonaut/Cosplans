# Missing Feature: Character API Search

**Status:** Designed but not implemented  
**Found in:** `src/lib/types/character.ts`  
**Feature ID:** 004-bugfix-testing - User Story 3

---

## What Was Planned

### Character Search & Auto-Population
A character lookup system that would:

1. **Search multiple APIs** for character data:
   - MyAnimeList
   - AniList  
   - IGDB (video games)
   - ComicVine
   - TMDB

2. **Auto-populate character details:**
   - Character name
   - Series/source
   - Description
   - Reference images
   - Metadata

3. **Smart deduplication:**
   - Fuzzy matching across APIs
   - Confidence scoring
   - Name/series variant handling

4. **Custom title vs auto-title:**
   - Projects would have custom title field
   - Option to auto-generate title from: `{character} - {series}`
   - Example: "Saber - Fate/Stay Night"

---

## What Exists (Types Only)

### Types Defined (`character.ts`):
```typescript
- CharacterSource (API enum)
- ExternalCharacterData (single API result)
- AggregatedCharacter (merged from multiple APIs)
- CharacterSearchParams
- CharacterSearchResult
- FuzzyMatchConfig
```

### What's Missing:
- ❌ Character search service
- ❌ API integrations (MyAnimeList, AniList, etc.)
- ❌ Search UI component
- ❌ Auto-populate logic in CharacterCreationForm
- ❌ Title generation from character + series
- ❌ Database migration for character fields

---

## Why This Explains Current Issues

### 1. Series Field Required
- Form requires series because it was meant to be auto-filled from API
- Without API search, users must manually enter it
- This makes character creation painful

### 2. Character vs Title Confusion
- Projects currently use `character` field as the display name
- Was supposed to have separate `title` field
- Auto-title would format as: `{character} - {series}`

### 3. No Reference Images
- API search would provide character images
- Current upload-only approach is tedious

---

## Impact on Current System

### Broken Workflows:
1. **Character Creation** - Required fields block creation
2. **T-004 (Auto-moodboard)** - Tied to character/project creation
3. **User Experience** - Manual entry is time-consuming

### Workaround Needed:
Since API search isn't implemented:
1. Make series field actually optional
2. Add standalone title field to projects
3. Keep character + series separate
4. Update UI labels to be clear

---

## Implementation Estimate

### If We Built This Feature:

**Phase 1: Basic Search (8-12 hours)**
- AniList API integration (has GraphQL, easiest)
- Simple search component
- Auto-populate name + series

**Phase 2: Multi-API (16-20 hours)**
- MyAnimeList integration
- IGDB for games
- Deduplication logic

**Phase 3: Full Feature (24-32 hours)**
- ComicVine, TMDB
- Fuzzy matching engine
- Confidence scoring
- Image selection

**Total:** 48-64 hours for complete implementation

---

## Recommendation

### Short-term (Fix Current Broken State):
1. **Make series optional** - Let users create characters without it
2. **Add title field to projects** - Separate from character name
3. **Update CharacterCreationForm** - Remove required validation on series
4. **Hook up onSave** - Make form functional first

### Long-term (Full Feature):
1. Start with AniList only (GraphQL API is well-documented)
2. Add search modal to CharacterCreationForm
3. Implement auto-populate on selection
4. Add "manual entry" fallback
5. Expand to other APIs later

---

## Files to Update (Short-term Fix)

### 1. Project Schema
```typescript
// Add title field separate from character
interface Project {
  id: string;
  title: string; // NEW: Custom title
  character: string;
  series?: string; // Make optional
  // ...
}
```

### 2. CharacterCreationForm.svelte
```svelte
<!-- Line 163: Remove series requirement -->
disabled={saving || !characterName}
<!-- NOT: disabled={saving || !characterName || !series} -->

<!-- Add title field or auto-generate -->
```

### 3. Characters Page
```svelte
<!-- Hook up onSave handler -->
<CharacterCreationForm 
  onSave={async (data) => {
    await projectService.create({
      character: data.character,
      series: data.series,
      // ... create project
      // ... auto-create moodboard
    });
  }}
/>
```

---

## Related Features

This character search was likely part of a larger vision:
- Smart recommendations
- Duplicate detection (same character, different projects)
- Shared character database across team
- Auto-tagging based on series metadata
- Budget estimates based on character complexity

All of these depend on the API integration foundation.

---

## Decision Needed

**Question:** Do you want to:

A. **Fix current broken state** (4-6 hours)
   - Make series optional
   - Hook up form
   - Basic functionality working

B. **Implement basic character search** (8-12 hours)
   - AniList integration
   - Search modal
   - Auto-populate

C. **Both** - Fix now, add search later
   - Get unblocked immediately
   - Plan character search as separate feature

**Recommendation:** Option C - Fix the broken creation flow first, then plan character search as a proper feature with its own spec and tasks.
