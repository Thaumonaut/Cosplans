# Component Registry

> Last updated: 2026-01-20
> Total components: ~175

## Health Summary

| Category | Count | Health | Action |
|----------|-------|--------|--------|
| UI Primitives (`ui/`) | 60 | Good | Maintain |
| Base Editors/Selectors (`base/`) | 30 | Could consolidate | Create base classes |
| Cards (`cards/`) | 6 | Has duplicates | Consolidate |
| Tasks (`tasks/`) | 20+ | Well-organized | Maintain |
| Projects (`projects/`) | 11 | Well-organized | Maintain |
| Root Level | 7+ | Scattered | Relocate or delete |

---

## Critical Duplicates (Action Required)

| Root Component | Proper Location | Recommendation |
|----------------|-----------------|----------------|
| `creation-flyout.svelte` | `ui/CreationFlyout.svelte` | **DELETE** root, use `ui/` version |
| `character-creation-form.svelte` | `ideas/CharacterCreationForm.svelte` | **DELETE** root, use `ideas/` version |
| `inline-text-editor.svelte` | `base/InlineTextEditor.svelte` | **DELETE** root, use `base/` version |
| `project-card.svelte` | `cards/ProjectCard.svelte` | **AUDIT** imports, then consolidate |

---

## Folder Structure

### `ui/` - Flowbite Wrappers & Primitives (60 components)

Thin wrappers around Flowbite Svelte providing project-specific defaults.

**Card System:**
- `card.svelte`, `card-header.svelte`, `card-content.svelte`, `card-description.svelte`, `card-title.svelte`, `card-footer.svelte`, `card-action.svelte`

**Dialog System:**
- `dialog.svelte`, `dialog-header.svelte`, `dialog-title.svelte`, `dialog-description.svelte`, `dialog-footer.svelte`

**Form Inputs:**
- `button.svelte` (CVA-based, custom)
- `checkbox.svelte`, `input.svelte`, `label.svelte`, `select.svelte`, `switch.svelte`, `textarea.svelte`
- `date-picker.svelte` (wraps Flowbite Datepicker)

**Navigation:**
- `dropdown-menu.svelte`, `dropdown-menu-item.svelte`, `dropdown-menu-label.svelte`, `dropdown-menu-separator.svelte`
- `tabs.svelte`, `tabs-list.svelte`, `tabs-content.svelte`, `tabs-trigger.svelte`
- `navigation-menu.svelte` + related

**Sidebar System (complete):**
- `sidebar.svelte`, `sidebar-header.svelte`, `sidebar-footer.svelte`, `sidebar-content.svelte`
- `sidebar-group.svelte`, `sidebar-group-label.svelte`, `sidebar-group-content.svelte`
- `sidebar-menu.svelte`, `sidebar-menu-item.svelte`, `sidebar-menu-button.svelte`
- `sidebar-trigger.svelte`, `sidebar-provider.svelte`

**Utilities:**
- `badge.svelte`, `progress.svelte`, `separator.svelte`, `skeleton.svelte`
- `tooltip.svelte`, `toast.svelte`, `sheet.svelte`
- `avatar.svelte`, `avatar-image.svelte`, `avatar-fallback.svelte`
- `loading-spinner.svelte`, `color-picker.svelte`, `circular-color-picker.svelte`
- `coloris-wrapper.svelte`, `clickable-card.svelte`
- `CreationFlyout.svelte` (**preferred** over root version)

---

### `base/` - Domain-Agnostic Editors & Selectors (30 components)

Reusable building blocks for inline editing and selection.

**Inline Editors (share pattern):**
- `InlineTextEditor.svelte` - Text/textarea with save/cancel
- `InlineNumberEditor.svelte` - Currency-aware number input
- `InlineCheckbox.svelte` - Inline toggle
- `InlineTagInput.svelte` - Tag/chip input
- `InlineImageUpload.svelte` - Image upload with preview
- `InlineFileUpload.svelte` - File upload
- `InlineDatePicker.svelte` - Date selection

**Selectors (based on TagSelector):**
- `TagSelector.svelte` - **Base** for other selectors
- `StatusSelector.svelte` - Project status
- `PrioritySelector.svelte` - Priority levels
- `StageSelector.svelte` - Task stages with colors
- `DifficultySelector.svelte` - Difficulty rating
- `MaterialSelector.svelte` - Material search/create
- `InlineSelect.svelte` - Generic dropdown
- `InlineUserSelector.svelte` - User selection
- `InlineResourceSelector.svelte` - Resource selection
- `InlineProjectSelector.svelte` - Project selection

**Utilities:**
- `LoadingState.svelte` - Loading/error/empty container
- `ConfirmDialog.svelte` - Confirmation modal
- `ErrorToast.svelte` - Error notifications
- `CommentBox.svelte` - Comment editing
- `DetailCard.svelte` - Detail display card
- `DetailPageBase.svelte` - Detail page layout
- `Breadcrumbs.svelte` - Navigation breadcrumbs
- `HighlightedText.svelte` - Text highlighting
- `NotFound.svelte` - 404 state
- `PolymorphicForm.svelte` - Dynamic form builder
- `KeyboardShortcutsHandler.svelte` - Keyboard shortcuts
- `ImageLightbox.svelte` - Image viewer

---

### `cards/` - Card Components (6 components)

Display cards for various entities.

- `ProjectCard.svelte` - Flowbite-based project card
- `IdeaCard.svelte` - Idea/character card
- `PhotoshootCard.svelte` - Photoshoot card
- `ToolCard.svelte` - Tool/equipment card
- `ResourceCard.svelte` - Resource/material card
- ~~`project-card.svelte`~~ - **Legacy**, audit and remove

---

### `tasks/` - Task Management (20+ components)

Well-organized task UI components.

**Views:**
- `TaskListView.svelte`, `TaskBoardView.svelte`, `TaskTableView.svelte`
- `TaskCalendarView.svelte`, `TaskTimelineView.svelte`
- `EmbeddedTaskList.svelte`, `ViewModeSelector.svelte`

**Task Items:**
- `TaskCard.svelte`, `QuickTaskCreate.svelte`, `SubtaskList.svelte`

**Filtering:**
- `TaskFilterPanel.svelte`, `TaskStageSettings.svelte`

**Details:**
- `CommentThread.svelte`, `CommentInput.svelte`, `ActivityLog.svelte`, `AttachmentList.svelte`
- `CustomFieldsSection.svelte`, `CustomFieldInput.svelte`

**Gamification:**
- `CelebrationAnimation.svelte`, `StreakDisplay.svelte`, `DailyProgressBar.svelte`

**Focus:**
- `FocusMode.svelte`, `WhatToDoNow.svelte`

---

### `projects/` - Project Management (11 components)

**Detail View:**
- `ProjectDetail.svelte`
- `tabs/OverviewTab.svelte`
- `tabs/TasksTab.svelte`
- `tabs/ResourcesTab.svelte`
- `tabs/GalleryTab.svelte`

**Resource Linking:**
- `InlineResourceLinker.svelte`
- `ResourceLinkModal.svelte`

---

### `ideas/` - Idea Management (7 components)

- `CharacterCreationForm.svelte` (**preferred** over root version)
- `IdeaDetail.svelte`
- `NewIdeaDrawer.svelte`
- `ReferencesTab.svelte`
- `ReferenceCard.svelte`
- `ReferencesEmptyState.svelte`

---

### `domain/` - Domain Logic (4 components)

- `BudgetTracker.svelte` - Budget visualization
- `ProgressTracker.svelte` - Progress display
- `ResourcesList.svelte` - Resource management
- `ShotListEditor.svelte` - Shot list editing

---

### `loading-states/` - Loading Skeletons (4 components)

- `page-loading.svelte`
- `dashboard-loading.svelte`
- `budget-loading.svelte`
- `data-loader.svelte`

---

### Other Folders

- `resources/` - ResourceDetail, ResourcesList, UsedInProjectsSection
- `photoshoots/` - PhotoshootDetail
- `tools/` - ToolDetail
- `settings/` - CustomFieldsManagement
- `theme-builder/` - ThemePreview, VariableEditor, VariableHighlighter
- `auth/` - OAuthButtons
- `teams/` - OwnershipTransferDialog
- `moodboard/` - SocialMediaEmbed
- `layout/` - ResponsiveContainer
- `shared/` - OfflineIndicator
- `dev/` - Experimental implementations (Neodrag, Svelte-dnd, Shopify Draggable)

---

## Consolidation Patterns

### Pattern: Inline Editors

All inline editors follow the same pattern. Consider extracting to composable:

```typescript
// Shared behavior
interface InlineEditorProps<T> {
  value: T;
  onSave: (value: T) => void;
  onCancel?: () => void;
  validate?: (value: T) => string | null;
}
```

### Pattern: Selectors

All selectors wrap `TagSelector`. Could create:

```svelte
<!-- EnumSelector.svelte -->
<script lang="ts">
  type T = $$Generic;
  export let options: T[];
  export let value: T;
  export let labelKey: keyof T;
  // ...
</script>
```

---

## Spec 007: Component Consolidation

See `specs/007-component-consolidation/spec.md` for full consolidation plan.

**Priority:**
1. Delete root duplicates (immediate)
2. Audit imports for `project-card.svelte` (immediate)
3. Create base patterns for editors/selectors (medium-term)
4. Consider atomic design structure (long-term)
