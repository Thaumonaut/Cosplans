# Tasks

Active work items across all features.

---

## Feature Task Files

Detailed task breakdowns for each feature:

| Feature | File | Status |
|---------|------|--------|
| FEAT-006 | [`.cv/spec/features/feat-006/tasks.md`](spec/features/feat-006/tasks.md) | Active |

---

## Active (In Progress)

### [FEAT-006] Brainstorming & Moodboard
> **Full task list:** `.cv/spec/features/feat-006/tasks.md`
> **Spec version:** 3.0 (SFS-v2 — Hierarchical Architecture)


**Current focus:** Checkpoint 4 — Card Types

- [x] T-001: Database migration for moodboards table
- [x] T-002: Database migration for hierarchical nodes
- [x] T-003: Create moodboardsService
- [x] T-004: Auto-create moodboards on entity creation
- [x] T-005: Create moodboard routes
- [x] T-006: Create basic node CRUD operations
- [x] T-007: Install and configure Svelte Flow
- [x] T-008: Create base MoodboardNode component
- [x] T-009: Implement drill-in navigation for containers
- [x] T-010: Implement position persistence
- [x] T-011: Create ViewSwitcher component
- [x] T-012: Implement Gallery view (hierarchical)
- [x] T-013: Implement List view (hierarchical tree)
- [x] T-014: Integrate views into moodboard page
- [x] **COMPLETED** - T-015: Implement container card types (+ drag-and-drop)
- [x] **COMPLETED** - T-016: Implement reference card types (platform badges + metadata)
- [x] **COMPLETED** - T-017: Implement design card types (color palette + measurements)
- [x] **COMPLETED** - T-018: Implement budget and contact card types
- [x] **COMPLETED** - T-019: Implement Fabric card type
- [x] **COMPLETED** - T-020: Create Add Card menu

**Checkpoints:**
| CP | Name | Tasks | Status |
|----|------|-------|--------|
| 01 | Foundation | T-001 → T-006 | Complete (6/6) ✅ |
| 02 | Canvas Editor | T-007 → T-011 | Complete (5/5) ✅ |
| 03 | Gallery & List | T-012 → T-014 | Complete (3/3) ✅ |
| 04 | Card Types | T-015 → T-020 | Complete (6/6) ✅ |
| 05 | Mobile Capture | T-021 → T-024 | Not Started |
| 06 | Integration | T-025 → T-028 | Not Started |
| 07 | Sharing & Polish | T-029 → T-035 | Not Started |

**Pre-task work completed:**
- [x] Content filtering (all/posts/videos)
- [x] Notes functionality on ReferenceCard
- [x] Project-scoped references service
- [x] SocialMediaEmbed component
- [x] Metadata extraction service
- [x] Existing database schema (needs migration)

### [004] Bugfix & Testing
- [ ] Task deletion from all views
- [ ] Responsive layout fixes (mobile sidebar, action bar)
- [ ] Data persistence across phase transitions

---

## Blocked

*None currently*

---

## Backlog

### [007] Component Consolidation (Not Started)
- [ ] Delete `creation-flyout.svelte` (use `ui/CreationFlyout.svelte`)
- [ ] Delete `character-creation-form.svelte` (use `ideas/CharacterCreationForm.svelte`)
- [ ] Delete `inline-text-editor.svelte` (use `base/InlineTextEditor.svelte`)
- [ ] Audit `project-card.svelte` vs `cards/ProjectCard.svelte` imports
- [ ] Create base selector pattern for StatusSelector, PrioritySelector, StageSelector
- [ ] Standardize inline editor pattern

### [005] Undocumented Features (Partial)
- [ ] Add tests for theme builder
- [ ] Document Events page behavior
- [ ] Document Budget page behavior
- [ ] Document Timeline page behavior

### [003] Modern Task UI (Partial)
- [ ] Audit missing view modes
- [ ] Complete custom fields implementation

---

## Completed (Recent)

- [x] **2026-01-24** - T-020: Create Add Card menu - COMPLETED (006)
- [x] **2026-01-24** - T-019: Implement Fabric card type - COMPLETED (006)
- [x] **2026-01-24** - T-018: Implement budget and contact card types - COMPLETED (006)
- [x] **2026-01-24** - T-017: Implement design card types (color palette + measurements) - COMPLETED (006)
- [x] **2026-01-24** - T-016: Implement reference card types with platform badges and metadata - COMPLETED (006)
- [x] **2026-01-24** - T-015: Drag-and-drop for moving cards into/out of containers - COMPLETED (006)
- [x] **2026-01-22** - T-010: Implement position persistence with debouncing (006)
- [x] **2026-01-22** - Checkpoints 1-3 complete: Foundation, Canvas Editor, Gallery & List (006)
- [x] **2026-01-22** - Fix MoodboardCanvas import name collision (006)
- [x] **2026-01-22** - FEAT-006 spec rewritten to SFS-v2 format (v3.0)
- [x] **2026-01-22** - FEAT-006 design doc updated with hierarchical wireframes
- [x] **2026-01-22** - FEAT-006 task list regenerated for new architecture
- [x] **2026-01-20** - Content filtering in ReferencesTab (006)
- [x] **2026-01-20** - Add notes functionality to ReferenceCard (006)
- [x] **2026-01-20** - Implement project-scoped references in moodboard service (006)
- [x] **2026-01-19** - Refactor team service and enhance user setup process
- [x] **2026-01-19** - Enhance team service with user management

---

## Task Format

```markdown
### [FEAT-ID] Feature Name
- [ ] **STATUS** - Task description
  - Sub-task if needed
  - Blocker: description (if blocked)
```

Statuses: `IN PROGRESS`, `BLOCKED`, `REVIEW`, `NEXT`, (unchecked = backlog)
