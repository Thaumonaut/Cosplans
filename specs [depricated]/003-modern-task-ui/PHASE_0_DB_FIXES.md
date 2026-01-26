# Phase 0: Database Schema Fixes - Complete Review

## Summary
Comprehensive review and fixes for all database tables, columns, and relationships to ensure code matches actual database schema.

## Issues Found and Fixed

### 1. Non-Existent Tables Referenced in Code
**Status**: ✅ FIXED - Removed references

The following tables were referenced in code but don't exist in migrations:
- ❌ `task_custom_field_values` - Removed from `getTaskDetail()` query
- ❌ `custom_field_definitions` - Removed from `getTaskDetail()` query  
- ❌ `task_label_assignments` - Removed from `getTasks()` query and filter
- ❌ `task_labels` - Removed from `getTasks()` query
- ❌ `task_stage_deadlines` - Removed from `getTaskDetail()` query

**Action Taken**: Removed all references from TaskService queries. These features can be implemented later when tables are created.

### 2. Foreign Key Relationship Issues
**Status**: ✅ FIXED - Updated to fetch users separately

**Problem**: 
- `task_comments.user_id` references `auth.users(id)` 
- `task_attachments.uploaded_by` references `auth.users(id)`
- PostgREST cannot join `auth.users` directly with `public.users`

**Solution**: 
- Updated `CommentService.getComments()` to fetch comments first, then fetch users from `public.users` separately
- Updated `AttachmentService.getAttachments()` to fetch attachments first, then fetch users from `public.users` separately
- Updated `TaskService.getTaskDetail()` to fetch users separately for comments and attachments
- Transform `public.users.name` to `first_name`/`last_name` for API compatibility

### 3. Missing Columns
**Status**: ✅ FIXED - Removed from inserts

**Removed**:
- ❌ `created_by` - Doesn't exist in `tasks` table
- ❌ `photoshoot_id` - Doesn't exist in `tasks` table (tasks link to photoshoots via projects)

**Action Taken**: Removed from all insert/update operations in TaskService.

### 4. Column Name Mismatches
**Status**: ✅ FIXED - Added mapping layer

**Issue**: Database uses `stage_id`, code uses `status_id`

**Solution**: 
- Added `transformTaskFromDb()` to map `stage_id` → `status_id` in responses
- Map `status_id` → `stage_id` when writing to database
- All queries now use `stage_id` for database operations

## Verified Existing Tables

### Core Tables (✅ Exist)
1. ✅ `tasks` - Main task table
   - Columns: `id`, `project_id`, `resource_id`, `team_id`, `stage_id`, `title`, `description`, `completed`, `due_date`, `priority`, `assigned_to`, `created_at`, `updated_at`
   
2. ✅ `subtasks` - Child tasks
   - Migration: `20251103150000_create_subtasks.sql`
   
3. ✅ `task_comments` - Comments on tasks
   - Migration: `20251103150001_create_task_comments.sql`
   - Note: `user_id` references `auth.users(id)`
   
4. ✅ `task_attachments` - File attachments
   - Migration: `20251103150002_create_task_attachments.sql`
   - Note: `uploaded_by` references `auth.users(id)`
   
5. ✅ `task_notifications` - Task notifications
   - Migration: `20251103150003_create_task_notifications.sql`
   
6. ✅ `task_templates` - Reusable task patterns
   - Migration: `20251103150004_create_task_templates.sql`
   
7. ✅ `saved_task_views` - Saved filter/view configurations
   - Migration: `20251103150005_create_saved_task_views.sql`
   
8. ✅ `task_stages` - Task workflow stages
   - Migration: `20251103140002_create_task_stages.sql`

### Missing Tables (Marked Complete but Don't Exist)
These tables are marked as [X] complete in tasks.md but migration files don't exist:

1. ❌ `custom_field_definitions` - Should be `20251103150006_create_custom_field_definitions.sql`
2. ❌ `task_custom_field_values` - Should be `20251103150007_create_task_custom_field_values.sql`
3. ❌ `task_labels` - Should be `20251103150008_create_task_labels.sql`
4. ❌ `task_label_assignments` - Should be `20251103150009_create_task_label_assignments.sql`
5. ❌ `task_stage_deadlines` - Should be `20251103150010_create_task_stage_deadlines.sql`
6. ❌ `user_task_stats` - Should be `20251103150011_create_user_task_stats.sql`
7. ❌ `task_breakdown_patterns` - Should be `20251103150012_create_task_breakdown_patterns.sql`

**Action**: Code references removed. These tables can be created later when needed.

## Files Modified

1. ✅ `src/lib/services/task-service.ts`
   - Removed references to non-existent tables
   - Fixed user fetching for comments/attachments
   - Removed `created_by` and `photoshoot_id` from inserts
   - Added `stage_id` ↔ `status_id` mapping

2. ✅ `src/lib/services/comment-service.ts`
   - Fixed user fetching (fetch separately from `public.users`)

3. ✅ `src/lib/services/attachment-service.ts`
   - Fixed user fetching (fetch separately from `public.users`)

## Testing Checklist

- [ ] Verify task creation works without `created_by`/`photoshoot_id` errors
- [ ] Verify task queries work without missing table errors
- [ ] Verify comments display with user data
- [ ] Verify attachments display with uploader data
- [ ] Verify stage_id/status_id mapping works correctly
- [ ] Verify filters work (excluding label_ids filter)

## Next Steps

1. **For Missing Tables**: Create migrations when features are needed:
   - Custom fields (T016-T017)
   - Labels (T018-T019)
   - Stage deadlines (T020)
   - User stats (T021)
   - Breakdown patterns (T022)

2. **For TypeScript Errors**: Fix type inference issues in TaskService (separate task)

3. **Update tasks.md**: Mark T016-T022 as incomplete or create the migrations


