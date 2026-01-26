# Feature Specification: MVP Cosplay Tracker Redesign

**Feature Branch**: `002-mvp-redesign`  
**Created**: October 30, 2025  
**Status**: Draft  
**Input**: User description: "Simplify the overall design for a simpler MVP and use the designs from the cosplay-tracker-react app folder to update to a more modern and polished design with clear buttons to help users start and manage their projects at different points in the process. Include team collaboration features."

**Constitution Alignment**: 
- ✅ **Project-Centric**: Focused on complete cosplay project workflow from idea to photoshoot
- ✅ **MVP First**: Reduced from 30+ features to 8 core pages
- ✅ **Modular**: Polymorphic entities and reusable components enable future expansion
- ✅ **Complete Workflow**: Covers full journey: Ideas → Planning → Execution → Photoshoots
- ✅ **Cost-Conscious**: Reuses existing React UI designs, minimizes conversion effort
- ✅ **Future-Ready**: Architecture supports adding features incrementally
- ✅ **Tech Stack**: SvelteKit + Supabase (existing stack, no changes)

## Overview

Transform the current cosplay tracker from a sprawling 30+ feature application into a focused MVP that delivers core value through a complete, polished workflow. The redesign will use modern UI patterns from the existing React designs while implementing a scalable architecture that supports future growth.

**Core Problem**: Current application has grown too complex with many half-implemented features, making it difficult to use and maintain. Users need a simple, beautiful tool to manage cosplay projects from inspiration to final photoshoot.

**Solution**: Focused MVP with 8 core pages covering the essential cosplay workflow: collecting ideas, planning projects, tracking resources, managing teams, and planning photoshoots. Modern, document-like inline editing throughout (similar to Notion/Linear) with clear visual guidance at each stage.

## Clarifications

### Session 2025-10-30

- Q: What are the specific permissions for each team role? → A: Permissive model - Owner has full control; Editor has full control except team management (cannot add/remove members, change roles, delete team); Viewer has read access plus ability to comment on items.
- Q: When should auto-save trigger for inline edits? → A: On blur - auto-save triggers only when user clicks away from field or tabs to next field, ensuring complete input before saving.
- Q: How should uploaded images be processed? → A: Smart compression - automatically compress images to max 2MB for display quality, generate 200px thumbnails for grid views, and keep original file available for downloads.
- Q: How should project progress be calculated from resource statuses? → A: Hybrid approach - average of project-level task completion % and resource completion %. Resources can have their own tasks for finer tracking (e.g., wig styling tasks, prop painting tasks). Resource progress = average of (resource status: needed=0%, acquired=25%, in-progress=50%, completed=100%) and any resource-specific task completion %.
- Q: What level of search sophistication is needed for MVP? → A: Fuzzy matching with typo tolerance - search should handle typos and similar spellings (e.g., "malnea" finds "Malenia", "genshn" finds "Genshin") using fuzzy string matching algorithms. Search across name, character, series, and tags fields.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture and Convert Ideas (Priority: P1)

A cosplayer browses Pinterest and finds inspiration for a character they want to cosplay. They need to quickly save this idea with reference images, estimate difficulty and cost, then convert it to an active project when ready to start.

**Why this priority**: This is the entry point to the entire workflow. Without capturing ideas, there are no projects to manage. This is the absolute minimum functionality needed for any value.

**Independent Test**: Can be fully tested by creating an idea with images and notes, browsing the ideas board, and converting an idea to a project. Delivers value even without other features by serving as an inspiration library.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they click "New Idea" and enter character name, series, reference images, difficulty, and estimated cost, **Then** the idea appears on their ideas board
2. **Given** a user has saved ideas, **When** they view the ideas board, **Then** they see all ideas in a visual grid with character images, difficulty badges, and cost estimates
3. **Given** a user views an idea detail page, **When** they click "Start Planning", **Then** a new project is created with the idea's data pre-filled and the idea is marked as converted
4. **Given** a user is viewing/editing an idea, **When** they click into a field to edit and then click away or tab to another field, **Then** changes save automatically on blur with a brief saving indicator, and the UI updates with success feedback
5. **Given** a user edits a required field and leaves it empty, **When** they blur the field, **Then** a validation error appears inline near the field and the save is prevented until corrected
6. **Given** a user has multiple ideas, **When** they filter by difficulty or search by character/series name, **Then** only matching ideas are displayed
7. **Given** a user searches for "malnea" (typo), **When** the search executes with fuzzy matching, **Then** "Malenia" ideas appear in results with exact matches ranked higher than fuzzy matches

---

### User Story 2 - Plan and Track Projects (Priority: P1)

A cosplayer starts building a Malenia cosplay and needs to track all the components (armor pieces, props, fabric, wig), budget, tasks, and progress. They need to see at a glance what's complete, what's in progress, and what still needs to be acquired.

**Why this priority**: Core value proposition - managing active cosplay builds. Essential for MVP. Without this, the app provides no project management value.

**Independent Test**: Can be fully tested by creating a project, adding resources (props, fabrics), creating tasks, tracking budget, and monitoring progress. Delivers standalone value for project tracking.

**Acceptance Scenarios**:

1. **Given** a user creates a new project, **When** they enter character name, series, status, deadline, and budget, **Then** the project appears in their projects list with status badge
2. **Given** a user views a project detail page, **When** they navigate between Overview, Resources, Tasks, and Gallery tabs, **Then** each tab displays the relevant information with inline editing capabilities
3. **Given** a project exists, **When** a user links existing resources or creates new ones from the Resources tab, **Then** the resources appear in the project with quantity and status tracking
4. **Given** a project has linked resources, **When** resource statuses are updated (needed → acquired → in-progress → completed), **Then** the project's overall progress percentage updates automatically as the average of task completion and resource completion
5. **Given** a user adds tasks to a project, **When** tasks are checked off as complete, **Then** the task completion percentage is reflected in the project overview and affects overall project progress
6. **Given** a resource has specific tasks (e.g., "Style wig" tasks for a wig resource), **When** those resource-specific tasks are completed, **Then** that resource's individual progress reflects both its status and task completion, contributing to overall project progress
7. **Given** a project has a budget set, **When** resources with costs are linked, **Then** the budget tracker shows spent vs. total and warns when approaching limit
8. **Given** a user views the projects list, **When** they filter by status (planning, in-progress, completed, archived), **Then** only projects matching that status are displayed

---

### User Story 3 - Build Shared Resource Library (Priority: P2)

A cosplayer has built a prop sword that they'll use in multiple cosplays. They need to store this in a resource library with details (material, cost, storage location) and link it to different projects without recreating the entry each time.

**Why this priority**: Enables resource reuse across projects, which is common in cosplay. Important but not critical for initial MVP since projects can function without shared resources.

**Independent Test**: Can be fully tested by creating resources, linking them to multiple projects, and viewing resource usage. Delivers value for users who reuse props/materials across builds.

**Acceptance Scenarios**:

1. **Given** a user is on the resources page, **When** they click "New Resource" and select a category (prop, fabric, wig, pattern, costume-piece, accessory, material), **Then** a category-specific form appears with relevant fields
2. **Given** a fabric resource is created, **When** the form displays, **Then** fabric-specific fields appear (fabric type, color, quantity, unit [yards/meters], width, stretch, washable)
3. **Given** a wig resource is created, **When** the form displays, **Then** wig-specific fields appear (color, length, style, lace type, heat resistant)
4. **Given** a prop resource is created, **When** the form displays, **Then** prop-specific fields appear (size, weight, material, fragile checkbox, requires assembly, storage location)
5. **Given** multiple resources exist, **When** a user views the resource library, **Then** they can filter by category and search by name
6. **Given** a resource exists, **When** viewing its detail page, **Then** it shows a "Used in Projects" section listing all projects linked to this resource
7. **Given** a resource is linked to a project, **When** viewing the resource detail, **Then** each project shows the quantity and status specific to that project

---

### User Story 4 - Manage Tools and Equipment (Priority: P2)

A cosplayer owns crafting tools (heat gun, dremel, sewing machine) and shoot equipment (ring light, backdrop). They need to track what they own, what condition it's in, rental costs for borrowed equipment, and which tools are available for upcoming projects.

**Why this priority**: Useful for organization but not critical for core project workflow. Users can manage projects without explicit tool tracking.

**Independent Test**: Can be fully tested by creating tools in both categories (crafting tools and shoot equipment), viewing the tools list, and accessing tool details. Delivers value for equipment inventory management.

**Acceptance Scenarios**:

1. **Given** a user creates a new tool and selects "Crafting Tool" category, **When** the form displays, **Then** crafting-specific fields appear (brand, model, purchase date, purchase price, condition, storage location, manual URL, warranty expiration)
2. **Given** a user creates a new tool and selects "Shoot Equipment" category, **When** the form displays, **Then** equipment-specific fields appear (brand, model, owned checkbox, rental cost per day, owner/source, specifications)
3. **Given** multiple tools exist, **When** a user views the tools page, **Then** tools are displayed with category badges and can be filtered by category
4. **Given** a user owns a heat gun, **When** they view its detail page, **Then** they see all maintenance info (condition, purchase date, warranty status, storage location)
5. **Given** a user tracks borrowed equipment, **When** viewing the equipment detail, **Then** rental cost and owner information are prominently displayed

---

### User Story 5 - Plan Photoshoots (Priority: P2)

A cosplayer has completed their Elden Ring cosplay and wants to plan a photoshoot. They need to create a shot list with specific poses, link the cosplay project(s) they'll be shooting, note the location and date, and track which shots have been captured.

**Why this priority**: Completes the full workflow (idea → build → shoot) but can wait until basic project management works. Important for completeness but not blocking.

**Independent Test**: Can be fully tested by creating a photoshoot, linking projects, adding shot list items, adding crew members, and marking shots as complete. Delivers value for shoot planning.

**Acceptance Scenarios**:

1. **Given** a user creates a new photoshoot, **When** they enter title, date, location, and link one or more projects, **Then** the photoshoot appears in the photoshoots list with linked project previews
2. **Given** a photoshoot exists, **When** viewing its detail page, **Then** tabs are available for Overview, Shot List, Crew, and Gallery
3. **Given** a user is planning shots, **When** they add items to the shot list (description, pose reference, reference image), **Then** each shot appears as a checklist item
4. **Given** a shot list exists, **When** shots are marked as completed during/after the shoot, **Then** completion percentage is displayed and completed shots are visually indicated
5. **Given** a photoshoot needs crew, **When** crew members are added with names, roles (photographer, assistant, makeup artist), and contact info, **Then** they appear in the crew tab
6. **Given** a photoshoot is completed, **When** final photos are uploaded to the gallery, **Then** they are displayed in the Gallery tab with options to link to specific shots

---

### User Story 6 - Collaborate with Team (Priority: P2)

A cosplayer works with friends on group cosplays and wants to share project visibility, assign tasks to team members, and track who's responsible for which components. Team members need appropriate access to view and edit shared projects.

**Why this priority**: Important for group cosplays and sharing with photographers/makeup artists, but single-user functionality must work first. Essential for MVP per user request.

**Independent Test**: Can be fully tested by creating a team, inviting members, sharing projects with team, and assigning tasks to team members. Delivers value for collaboration scenarios.

**Acceptance Scenarios**:

1. **Given** a user wants to collaborate, **When** they create a new team with a name, **Then** the team appears in their team selector
2. **Given** a team exists, **When** the user invites members via email, **Then** invited users receive notifications and can accept to join the team
3. **Given** a user is in multiple teams, **When** they use the team selector in the sidebar, **Then** switching teams updates the visible projects, resources, and photoshoots to show only that team's content
4. **Given** a project is created within a team context, **When** team members view the projects page, **Then** they can all see and access the shared project
5. **Given** a task exists on a team project, **When** the task is assigned to a specific team member, **Then** that member sees it in their task list and receives a notification
6. **Given** team members have different permission levels, **When** they access resources and tools, **Then** some members can edit while others can only view (based on role)
7. **Given** a user is viewing team settings, **When** they manage members, **Then** they can change roles, remove members, or transfer ownership

---

### User Story 7 - Track Timeline and Deadlines (Priority: P3)

A cosplayer has multiple projects with different deadlines (conventions, photoshoots) and needs a calendar/timeline view to see what's due when and avoid conflicts.

**Why this priority**: Nice to have for organization but not critical for core workflow. Users can track deadlines within individual projects initially.

**Independent Test**: Can be fully tested by viewing the calendar with projects, deadlines, and photoshoots displayed on a timeline. Delivers value for time management.

**Acceptance Scenarios**:

1. **Given** multiple projects with deadlines exist, **When** a user views the calendar page, **Then** all projects are displayed on a timeline with their deadline dates
2. **Given** photoshoots are scheduled, **When** viewing the calendar, **Then** photoshoot dates appear as events on the timeline
3. **Given** a user clicks a project or photoshoot on the calendar, **When** the item is selected, **Then** a quick preview appears with the option to open the full detail page
4. **Given** tasks have due dates, **When** viewing the calendar, **Then** upcoming task deadlines are indicated
5. **Given** the user navigates the calendar, **When** they switch between month/week/day views, **Then** the timeline adjusts to show appropriate detail level

---

### User Story 8 - Personalize Settings (Priority: P3)

A user wants to customize their profile, set preferences (theme, notifications), and manage account settings.

**Why this priority**: Basic functionality that can be minimal initially. Not blocking for core features.

**Independent Test**: Can be fully tested by updating profile information, changing theme, and adjusting notification preferences. Delivers value for personalization.

**Acceptance Scenarios**:

1. **Given** a user accesses settings, **When** they update their profile (name, avatar, bio), **Then** changes are saved and reflected throughout the app
2. **Given** a user prefers dark mode, **When** they toggle the theme setting, **Then** the entire app switches to dark mode and the preference persists
3. **Given** a user wants to manage notifications, **When** they adjust notification preferences (email, in-app), **Then** they only receive notifications matching their selected preferences

---

### Edge Cases

- **What happens when a resource is deleted that's linked to multiple projects?** The resource should be removed from all projects, and users should be warned about the impact before deletion is confirmed. Orphaned project-resource links should be cleaned up. Any tasks linked to that resource should either be deleted or converted to project-level tasks (user choice in confirmation dialog).

- **What happens when a project is deleted that's linked to a photoshoot?** The project should be unlinked from the photoshoot, but the photoshoot should remain. Users should be warned if they're deleting a project that's part of an upcoming photoshoot.

- **What happens when an idea is converted to a project?** The idea is marked as "converted" and locked from editing, but remains visible in the ideas board for reference. It links to the created project.

- **What happens when a user tries to link a resource to a project but it's already linked?** The system should allow updating the quantity or status of the existing link, not create a duplicate.

- **What happens when budget is exceeded?** The budget tracker should display a warning/error state when spent exceeds the total budget, helping users stay aware of cost overruns.

- **What happens when a team member is removed from a team?** They lose access to all team projects, resources, and photoshoots. Their assigned tasks should be reassigned or marked as unassigned.

- **What happens when a user leaves a team?** Same as removal - they lose access to team content. If they were the only owner, they should be prevented from leaving or required to transfer ownership first.

- **What happens when concurrent users edit the same project?** The system should handle concurrent edits gracefully, with last-write-wins for most fields. Critical conflicts (like simultaneous deletions) should be handled with optimistic locking or user notification.

- **What happens when uploading very large images?** Images should be validated for size limits (e.g., 10MB max), with clear error messages if exceeded. Consider automatic resizing/compression for uploaded images.

- **What happens when network connectivity is lost during editing?** Changes should be queued locally and synchronized when connection is restored, with clear indicators of sync status.

## Requirements *(mandatory)*

### Functional Requirements

#### Ideas Management
- **FR-001**: System MUST allow users to create ideas with character name, series, description, difficulty level (beginner/intermediate/advanced), estimated cost, reference images (multiple), tags, and notes
- **FR-002**: System MUST display ideas in a visual grid layout with image thumbnails, character names, difficulty badges, and cost estimates
- **FR-003**: System MUST allow users to filter ideas by difficulty level and search with fuzzy matching across character name, series, and tags (e.g., "malnea" finds "Malenia", "genshn" finds "Genshin")
- **FR-003a**: System MUST display search results ranked by relevance, with exact matches appearing before fuzzy matches
- **FR-004**: System MUST allow users to convert an idea to a project, pre-filling project fields with idea data and marking the idea as converted
- **FR-005**: System MUST preserve converted ideas in read-only mode with a link to the created project
- **FR-006**: System MUST support inline editing for all idea fields when in edit mode

#### Projects Management
- **FR-007**: System MUST allow users to create projects with character name, series, status (planning/in-progress/completed/archived), estimated budget, deadline date, description, cover image, and reference images
- **FR-008**: System MUST calculate and display project progress percentage using hybrid approach:
  - Calculate project-level task completion percentage (completed tasks / total tasks)
  - Calculate resource completion percentage: for each resource, average its status value (needed=0%, acquired=25%, in-progress=50%, completed=100%) with any resource-specific task completion percentage
  - Overall project progress = average of project-level task completion % and overall resource completion %
  - If project has no tasks or no resources, use only the available metric
- **FR-009**: System MUST allow users to track budget with estimated vs. spent amounts and warn when budget is exceeded
- **FR-010**: System MUST provide tabs within project details for Overview, Resources, Tasks, and Gallery
- **FR-011**: System MUST allow linking existing resources to projects with quantity and status (needed/acquired/in-progress/completed) per project
- **FR-012**: System MUST allow creating new resources directly from within a project
- **FR-013**: System MUST display resources linked to a project with the ability to update quantity and status inline
- **FR-014**: System MUST allow users to filter projects by status and search with fuzzy matching across character name, series, and tags
- **FR-015**: System MUST support inline editing throughout project detail pages

#### Resources Library
- **FR-016**: System MUST support polymorphic resource categories: prop, fabric, wig, pattern, costume-piece, accessory, material
- **FR-017**: System MUST display category-specific form fields based on selected resource category
- **FR-018**: For fabric resources, system MUST collect: fabric type, color, quantity, unit (yards/meters), width, stretch (yes/no), washable (yes/no)
- **FR-019**: For wig resources, system MUST collect: color, length, style, needs styling (yes/no), lace type (none/lace-front/full-lace), heat resistant (yes/no)
- **FR-020**: For prop resources, system MUST collect: dimensions, weight, material, fragile (yes/no), requires assembly (yes/no), storage location
- **FR-021**: For pattern resources, system MUST collect: pattern company, pattern number, size, difficulty level, digital file URL, physical pattern (yes/no)
- **FR-022**: For costume-piece resources, system MUST collect: piece type, size, material, color, needs alterations (yes/no)
- **FR-023**: For accessory resources, system MUST collect: accessory type, material, color, quantity
- **FR-024**: For material resources, system MUST collect: material type, brand, color/variant, quantity, unit
- **FR-025**: System MUST display all resources in a filterable list with category badges and fuzzy search across name, category, and tags with typo tolerance
- **FR-026**: System MUST show "Used in Projects" section on resource detail pages listing all projects linked to the resource
- **FR-027**: System MUST allow resources to be linked to multiple projects simultaneously with different quantities and statuses per project
- **FR-028**: All resources MUST support: name, description, multiple images, cost, tags, notes

#### Tools Management
- **FR-029**: System MUST support polymorphic tool categories: crafting-tool, shoot-equipment
- **FR-030**: For crafting tools, system MUST collect: brand, model, purchase date, purchase price, condition (new/good/fair/needs-repair), storage location, manual URL, warranty expiration date
- **FR-031**: For shoot equipment, system MUST collect: brand, model, owned (yes/no), rental cost per day, owner/source, specifications
- **FR-032**: System MUST display all tools in a filterable list with category badges
- **FR-033**: All tools MUST support: name, description, multiple images, tags, notes

#### Tasks Management
- **FR-034**: System MUST allow users to create tasks with title, description, due date, priority (low/medium/high), and completion status
- **FR-035**: Tasks MUST be linkable to a specific project
- **FR-036**: Tasks MAY be linkable to a specific resource within a project for granular tracking (e.g., "Style wig bangs" linked to wig resource, "Paint weathering" linked to prop resource)
- **FR-037**: System MUST display task lists with ability to check off completed tasks, showing both project-level tasks and resource-specific tasks
- **FR-038**: System MUST calculate task completion percentage separately for:
  - Project-level tasks (tasks not linked to a resource)
  - Resource-level tasks (tasks linked to a specific resource, contributing to that resource's progress)

#### Photoshoots Management
- **FR-039**: System MUST allow users to create photoshoots with title, date, location, description, and status (planning/scheduled/completed)
- **FR-040**: System MUST allow linking one or more projects to a photoshoot
- **FR-041**: System MUST allow creating shot list items with description, pose notes, reference image, and completion checkbox
- **FR-042**: System MUST allow adding crew members to photoshoots with name, role (photographer/assistant/makeup/other), and contact information
- **FR-043**: System MUST provide a gallery tab for uploading final photos from the photoshoot
- **FR-044**: System MUST calculate shot completion percentage based on checked shots
- **FR-045**: System MUST display photoshoots in a list view with linked project previews

#### Team Collaboration
- **FR-046**: System MUST allow users to create teams with a team name
- **FR-047**: System MUST allow team owners to invite members via email with pending invitation status
- **FR-048**: System MUST allow invited users to accept or decline team invitations
- **FR-049**: System MUST provide a team selector in the application sidebar
- **FR-050**: System MUST filter all content (projects, resources, tools, photoshoots) based on selected team context
- **FR-051**: System MUST allow assigning tasks to specific team members
- **FR-052**: System MUST support team member roles with different permission levels:
  - **Owner**: Full control over all team content and settings (create, edit, delete, archive all items; manage team members; change roles; delete team; transfer ownership)
  - **Editor**: Full control over team content except team management (create, edit, delete, archive projects/resources/tools/photoshoots; assign tasks; add comments) but CANNOT add/remove members, change roles, or delete the team
  - **Viewer**: Read-only access to all team content with ability to add comments on projects, resources, tools, and photoshoots but CANNOT create, edit, delete, or archive any items
- **FR-053**: System MUST allow team owners to manage members (change roles, remove members, transfer ownership)
- **FR-054**: System MUST prevent team owners from leaving a team unless ownership is transferred to another member
- **FR-055**: System MUST remove access to team content when a member is removed or leaves
- **FR-056**: System MUST display team member information on shared projects and photoshoots
- **FR-057**: System MUST allow Viewers to add comments on all entity types (ideas, projects, resources, tools, photoshoots) for collaboration feedback

#### Calendar & Timeline
- **FR-058**: System MUST display all projects with deadlines on a calendar timeline view
- **FR-059**: System MUST display all scheduled photoshoots on the calendar timeline
- **FR-060**: System MUST support multiple calendar views (month/week/day)
- **FR-061**: System MUST allow clicking timeline items to view quick previews or open full detail pages
- **FR-062**: System MUST indicate upcoming task deadlines on the calendar

#### User Settings
- **FR-063**: System MUST allow users to update profile information (name, avatar, bio)
- **FR-064**: System MUST support theme switching (light/dark mode) with preference persistence
- **FR-065**: System MUST allow users to configure notification preferences (email, in-app)

#### Cross-Cutting Requirements
- **FR-066**: System MUST implement inline editing for all entity detail pages (ideas, projects, resources, tools, photoshoots)
- **FR-067**: System MUST use a single detail page pattern for create/edit/view modes (no separate pages)
- **FR-068**: System MUST navigate to `/[entity]/new` for creation mode and `/[entity]/[id]` for view/edit mode
- **FR-069**: System MUST auto-save inline edits on field blur (when user clicks away from field or tabs to next field) without requiring explicit save buttons
- **FR-070**: System MUST show saving indicators during auto-save operations and display success/error feedback inline
- **FR-071**: System MUST provide clear edit mode indicators and allow toggling between view and edit modes
- **FR-072**: System MUST validate required fields before allowing save operations and display validation errors inline near the field
- **FR-073**: System MUST display loading states during data fetching and saving operations
- **FR-074**: System MUST display error messages when operations fail with actionable recovery options
- **FR-075**: System MUST support image uploads with validation (max 10MB per upload)
- **FR-076**: System MUST automatically process uploaded images to generate three versions:
  - **Thumbnail**: 200px width for grid/card displays
  - **Display**: Max 2MB compressed for full-size viewing in galleries
  - **Original**: Uncompressed original file preserved for downloads
- **FR-077**: System MUST display thumbnails in grid views (ideas board, projects list, resource library) and display-quality images in detail pages and galleries
- **FR-078**: System MUST provide download option for original uncompressed images
- **FR-079**: System MUST persist user authentication state across sessions

### Key Entities

- **Idea**: Represents a potential cosplay project with character inspiration, reference images, difficulty estimate, and cost estimate. Can be converted to a Project.

- **Project**: An active cosplay build with status tracking, budget management, linked resources, tasks, and progress calculation. Central entity connecting resources, tasks, and photoshoots.

- **Resource**: Polymorphic entity representing any physical item used in cosplay (props, fabrics, wigs, patterns, costume pieces, accessories, materials). Can be linked to multiple projects with different quantities and statuses. Contains category-specific metadata fields.

- **Tool**: Polymorphic entity representing equipment owned or used (crafting tools for making cosplay, shoot equipment for photography). Contains category-specific metadata fields.

- **ProjectResource**: Join entity linking Projects and Resources, storing project-specific quantity and status (needed/acquired/in-progress/completed).

- **Task**: A to-do item with title, description, due date, priority, and completion status. Linked to a Project and optionally to a specific Resource.

- **Photoshoot**: A planned or completed photography session linked to one or more Projects. Contains shot list, crew information, location, date, and final photo gallery.

- **Shot**: An individual shot in a photoshoot's shot list with description, pose reference, reference image, completion status, and final photos.

- **Team**: A collaboration group that shares projects, resources, tools, and photoshoots among members.

- **TeamMember**: Join entity linking Users and Teams with role (owner/editor/viewer) and invitation status.

- **User**: An authenticated user with profile information, preferences, and team memberships.

- **Comment**: A text comment added by a team member on any entity (idea, project, resource, tool, photoshoot). Contains comment text, author, timestamp, and reference to the entity being commented on. Allows team collaboration and feedback, particularly for Viewer role members.

### Key Relationships

- Idea → Project (one-to-one when converted)
- Project ↔ Resource (many-to-many through ProjectResource)
- Project → Task (one-to-many)
- Resource → Task (one-to-many, optional)
- Photoshoot ↔ Project (many-to-many)
- Photoshoot → Shot (one-to-many)
- Photoshoot → Crew Member (one-to-many)
- Team ↔ User (many-to-many through TeamMember)
- Team → Project/Resource/Tool/Photoshoot (one-to-many)
- User → Comment (one-to-many)
- Comment → Entity (Idea/Project/Resource/Tool/Photoshoot) (polymorphic many-to-one)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can capture a new cosplay idea with images and details in under 2 minutes
- **SC-002**: Users can convert an idea to an active project in under 30 seconds with pre-filled data
- **SC-003**: Users can create a new project and link 5 resources to it in under 5 minutes
- **SC-004**: Project progress percentage updates automatically within 2 seconds when resource status changes
- **SC-005**: Users can switch between teams and see filtered content in under 3 seconds
- **SC-006**: Calendar view displays 50+ projects and photoshoots without performance degradation
- **SC-007**: Inline editing allows field updates without page refresh, with changes persisting in under 2 seconds
- **SC-008**: Users can complete the full workflow (idea → project → linked resources → photoshoot) within 15 minutes on first use
- **SC-009**: Resource library displays 100+ items with filtering and fuzzy search results (including typo-tolerant matches) appearing in under 1 second
- **SC-010**: Fuzzy search correctly identifies matches with up to 2-character typos or transpositions (e.g., "malnea" finds "Malenia", "genshn" finds "Genshin")
- **SC-011**: 90% of users successfully complete primary task (create and track a project) on first attempt
- **SC-012**: Image uploads complete in under 10 seconds for images up to 10MB, with thumbnail and display versions generated automatically
- **SC-013**: Grid views (ideas board, projects list, resource library) load thumbnails for 50+ items in under 2 seconds
- **SC-014**: Mobile responsive design supports all features on devices 375px width and above
- **SC-015**: Application loads initial dashboard view in under 3 seconds on standard broadband connection
- **SC-016**: System supports 10 concurrent users per team without performance degradation
- **SC-017**: Budget tracking shows real-time spent vs. estimated amounts with visual warning when exceeding budget

## Assumptions

1. **Single User Initially**: While team features are included in MVP, the architecture assumes most users will start as single-user and invite teams later
2. **Image Storage**: Assumes Supabase storage buckets will be used for image uploads with public URLs, storing three versions per upload (thumbnail, display, original)
3. **Authentication**: Assumes existing Supabase auth is functional and supports email/password authentication
4. **Browser Support**: Assumes modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ support for image processing and compression
5. **Network Connectivity**: Assumes users have reliable internet connection; offline mode is not in MVP scope
6. **Data Retention**: Assumes indefinite data retention unless user explicitly deletes content (all three image versions deleted together)
7. **File Uploads**: Assumes maximum 10MB per image upload, with automatic processing to generate thumbnail (200px), display (max 2MB), and preserve original
8. **Image Processing**: Assumes server-side or client-side image compression library available (e.g., Sharp for Node.js or browser-native Canvas API)
9. **Concurrent Editing**: Assumes last-write-wins for most concurrent edits; optimistic locking for critical operations
10. **Team Size**: Assumes teams will typically have 2-10 members for MVP
11. **Notification System**: Assumes simple email notifications for team invitations and task assignments; complex in-app notification center is out of scope for MVP
12. **Performance**: Assumes typical use case of 50-100 projects per user/team
13. **Fuzzy Search**: Assumes fuzzy string matching library available (e.g., Fuse.js for JavaScript, PostgreSQL pg_trgm extension, or Levenshtein distance algorithm) with configurable similarity threshold
14. **Search Performance**: Assumes fuzzy search on up to 500 items per entity type (ideas, projects, resources) performs within success criteria timeframes
15. **React Design Reference**: Assumes React components in `cosplay-tracker-react/` folder accurately represent desired UI/UX and can be converted to Svelte equivalently

## Out of Scope (Deferred to Phase 2)

- **Marketplace**: Buying/selling cosplay items or commissioning work
- **Social Features**: Following other users, public profiles, activity feeds, likes/comments
- **Tutorials**: Creating or browsing cosplay tutorial content
- **Messages**: Direct messaging between users
- **Conventions Database**: Tracking convention dates, badges, hotel bookings
- **Advanced Permissions**: Fine-grained permissions beyond owner/editor/viewer roles
- **Offline Mode**: Working without internet connection with sync
- **Mobile Apps**: Native iOS/Android applications (mobile-responsive web is in scope)
- **Real-time Collaboration**: Seeing other users' cursors and edits in real-time (Google Docs style)
- **Version History**: Tracking and reverting changes to projects/resources
- **Export/Import**: Exporting projects to PDF or importing from other tools
- **Advanced Analytics**: Dashboard with charts, trends, and insights
- **Budget Integration**: Connecting to actual bank accounts or payment systems
- **Inventory Management**: Automatic stock tracking and reorder alerts
- **Pattern Generation**: Creating or generating sewing patterns
- **3D Preview**: Viewing 3D models of costumes or props

## Technical Notes

These notes document technical implementation details for reference during planning phase:

### Architecture Patterns

- **Polymorphic Entities**: Resources and Tools use category-based forms with enum values determining which metadata fields to display
- **Single Detail Page Pattern**: All entities use one page for create/edit/view (e.g., `/resources/new`, `/resources/[id]`, `/resources/[id]?edit`)
- **Base Component Extension**: All detail pages extend `DetailPageBase` component
- **Inline Editing**: Document-like editing throughout (similar to Notion/Linear) with auto-save
- **Switch Over If/Else**: Use switch statements for polymorphic type handling
- **Feature Flag Components**: Reusable components like `ResourceCard` with boolean props to show/hide elements

### UI/UX Patterns

- Reference designs from `cosplay-tracker-react/` including:
  - `ProjectCard`, `IdeaCard`, `ResourceCard`, `PhotoshootCard`
  - `InlineTextEditor` with variants (title, heading, body, caption)
  - `DetailFlyout` for quick previews
  - `AppSidebar` with team selector
  - Status badges with color coding
  - Progress bars and budget trackers

### Data Model Notes

- PostgreSQL with Supabase
- Many-to-many relationships via join tables (ProjectResource, PhotoshootProject, TeamMember)
- JSONB fields for polymorphic metadata (resource category-specific fields, tool category-specific fields)
- Enum types for status fields, categories, priorities
- Automatic timestamps (created_at, updated_at)
- RLS policies for team-based access control

### Component Architecture

- Base components: `DetailPageBase`, `PolymorphicForm`, inline editors
- Domain components: entity cards, list views, tab panels
- Shared UI: Button, Card, Badge, Progress, Modal, Drawer, Tabs (from Flowbite Svelte)
- Reusable stores for each entity type with CRUD operations

