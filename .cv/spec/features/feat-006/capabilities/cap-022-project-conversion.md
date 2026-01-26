# Capability Spec: CAP-022 — Idea-to-Project Conversion Wizard

**Feature:** FEAT-006 (Moodboard)
**Status:** Specified
**Version:** 1.0

---

## 22.1 Intent

Provide a guided workflow to promote a loose "Idea" (brainstorming phase) into a structured "Project" (execution phase), ensuring data continuity without duplicating work.

## 22.2 Functional Requirements

### Wizard Steps
1. **Select Scope:**
   - If Idea has multiple containers/options, select which one(s) to promote.
   - Option to create one project or split into multiple.
2. **Moodboard Handling:**
   - **Link (Default):** Project references the original Idea's moodboard (shared source of truth).
   - **Clone:** Duplicate the moodboard nodes for a fresh start (clean slate).
3. **Budget Carry-over:**
   - Select which budget items to copy to the project.
   - Convert "estimated" costs to "budgeted" baselines.
4. **Project Details:**
   - Set deadline/event date.
   - Confirm project name (defaults to Idea/Option name).

### Data Transformation
- Create `projects` record.
- Link `projects.source_idea_id`.
- If "Link Moodboard": `projects.moodboard_id` points to Idea's moodboard.
- If "Clone Moodboard": Bulk insert copy of nodes/edges to new moodboard.

## 22.3 Component Strategy

- **`ProjectConversionWizard.svelte`**: Multi-step modal component.
- Uses `ui/stepper.svelte` (if available) or simple tab navigation.

## 22.4 Design & UX

- **Clarity:** Clearly explain the difference between "Linking" and "Cloning" a moodboard.
- **Prevention:** Warn if converting an empty idea.

## 22.5 Verification

- **E2E:** User creates Idea -> adds items -> clicks "Convert to Project" -> verifies Project exists and sees the moodboard items.
