# Component Consolidation Specification

**Date**: 2026-01-08  
**Status**: Draft  
**Priority**: Medium

## Overview

Consolidate duplicate component implementations to improve code reusability, consistency, and testability.

## Problems

1. **Inconsistent Padding Management**: Components manage their own padding separately from Card, leading to inconsistent spacing
2. **Duplicate Image Upload**: `InlineImageUpload` is implemented separately in 7+ components
3. **Testing Overhead**: Duplicate implementations require duplicate tests
4. **Maintenance Burden**: Bug fixes and improvements must be applied to multiple locations

## Solutions

### 1. Card Padding Management ✅

**Status**: Completed

Updated `Card` component to:
- Handle all padding (both x and y) consistently with `p-6` default
- Expose `noPadding` prop for full-bleed content (images, etc.)
- Remove need for child components to manage their own padding

**Usage**:
```svelte
<!-- Default: Card handles all padding -->
<Card>
  <div>Content with padding</div>
</Card>

<!-- Full-bleed: No padding for images -->
<Card noPadding>
  <img src="..." />
</Card>
```

### 2. Shared Image Upload Component

**Status**: TODO

Create a single, reusable `ImageUploadZone` component to replace all instances of `InlineImageUpload`.

**Current Duplications**:
- `src/lib/components/ideas/IdeaDetail.svelte`
- `src/lib/components/projects/ProjectDetail.svelte`
- `src/lib/components/tools/ToolDetail.svelte`
- `src/lib/components/resources/ResourceDetail.svelte`
- `src/lib/components/projects/tabs/GalleryTab.svelte`
- `src/lib/components/photoshoots/PhotoshootDetail.svelte`
- `src/lib/components/domain/ShotListEditor.svelte`

**Proposed Component**: `src/lib/components/base/ImageUploadZone.svelte`

**Features**:
- Drag-and-drop support
- Multiple file upload
- Preview thumbnails
- Progress indication
- Error handling
- Customizable styling
- Folder/path configuration
- Max file size validation
- File type validation

**API**:
```svelte
<ImageUploadZone
  images={currentImages}
  folder="projects"
  multiple={true}
  maxSize={5 * 1024 * 1024}
  accept="image/*"
  onUpload={(urls) => handleUpload(urls)}
  onError={(error) => handleError(error)}
/>
```

## Benefits

1. **Consistency**: Single source of truth for common patterns
2. **Testability**: Test once, use everywhere
3. **Maintainability**: Fix bugs in one place
4. **Performance**: Shared code can be optimized once
5. **Developer Experience**: Clear, documented APIs

## Implementation Plan

- [x] Update Card component with padding management
- [ ] Create ImageUploadZone base component
- [ ] Replace InlineImageUpload in IdeaDetail
- [ ] Replace InlineImageUpload in ProjectDetail
- [ ] Replace InlineImageUpload in ToolDetail
- [ ] Replace InlineImageUpload in ResourceDetail
- [ ] Replace InlineImageUpload in GalleryTab
- [ ] Replace InlineImageUpload in PhotoshootDetail
- [ ] Replace InlineImageUpload in ShotListEditor
- [ ] Add comprehensive tests for ImageUploadZone
- [ ] Update documentation

## Testing

- Unit tests for ImageUploadZone component
- Integration tests for upload flow
- Visual regression tests for UI consistency
- Accessibility tests for keyboard navigation

## Notes

- Maintain backward compatibility during migration
- Consider creating a codemod for automated replacement
- Document migration guide for team




