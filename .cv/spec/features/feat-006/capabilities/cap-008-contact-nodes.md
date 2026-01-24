# CAP-008: Contact Nodes

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-003 (Event, Contact, Checklist Nodes)

## Intent

Enable event coordinators, photographers, and cosplayers to track contacts (photographers, vendors, fellow cosplayers, venue staff) directly within project moodboards, maintaining relationships between people and projects/events.

## Functional Requirements

1. **Contact Node Creation**
   - Canvas context menu → "Create Contact Node"
   - Contact properties:
     - Name (required)
     - Role/Title (e.g., "Photographer", "Vendor", "Cosplayer")
     - Email (optional)
     - Phone (optional)
     - Social media links (optional, multiple)
     - Avatar/photo (optional)
     - Notes (optional)

2. **Contact Display**
   - Shows avatar (or default icon if none)
   - Name prominently displayed
   - Role shown as subtitle or badge
   - Contact method icons (email/phone) if provided
   - Quick actions: Email, Call (if mobile), View Profile

3. **Contact Linking**
   - Contacts can link to events (CAP-007) - "Attending", "Organizing"
   - Contacts can link to projects (character/prop containers)
   - Contacts can link to other contacts (network relationships)
   - Edge labels: "Photographer for", "Vendor for", "Collaborating with"

4. **Contact Search & Filter**
   - Global contact search across all moodboards
   - Filter by role, project, event
   - Recent contacts list in inspector

5. **Contact Reuse**
   - Contact data stored globally (not per-moodboard)
   - Reference same contact in multiple moodboards
   - Updates to contact propagate everywhere

## Data Model

### Database Schema
```sql
-- Global contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact nodes reference global contacts
ALTER TABLE moodboard_nodes ADD COLUMN contact_id UUID REFERENCES contacts(id);

CREATE INDEX idx_moodboard_nodes_contact_id 
  ON moodboard_nodes(contact_id) 
  WHERE node_type = 'contact';

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
```

### Type Definitions
```typescript
interface Contact {
  id: string;
  user_id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  social_links?: SocialLink[];
  avatar_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface SocialLink {
  platform: 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'website' | 'other';
  url: string;
}

interface ContactNode extends BaseMoodboardNode {
  node_type: 'contact';
  contact_id: string; // References global contact
  contact_data?: Contact; // Populated via join
}
```

## UI/UX Requirements

1. **Contact Node Card Design**
   - Avatar: 80x80px circle (or default user icon)
   - Name: Large, bold (16px)
   - Role: Smaller, gray (12px) or badge
   - Contact icons: Email/phone/social (3-4 icons max)
   - Hover: Quick action buttons appear (Email, Call, View)

2. **Contact Creation Dialog**
   - Search existing contacts first (autocomplete)
   - If not found: "Create New Contact" button
   - Form fields: Name, Role, Email, Phone, Social Links, Avatar, Notes
   - Avatar upload: File picker or URL input
   - Social links: Dynamic list (add/remove rows)
   - Save button creates contact + node

3. **Contact Reuse Flow**
   - Type name in autocomplete
   - If match found: Show existing contact with preview
   - Click to add node referencing that contact
   - Changes to contact reflected in all nodes

4. **Inspector Panel Integration**
   - Full contact details
   - Quick actions: Email (mailto:), Call (tel:), Social (open links)
   - Edit button: Opens contact edit dialog
   - Shows "Used in X moodboards" count
   - List of linked events/projects

5. **Contact Quick Actions**
   - Email: Opens default email client (mailto:)
   - Call: Opens phone app on mobile (tel:)
   - Social: Opens social media profile in new tab
   - Copy: Copies contact info to clipboard

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Contact creation/edit dialog
- `ui/button.svelte` - Action buttons
- `ui/input.svelte` - Text fields
- `ui/select.svelte` - Role dropdown
- `ui/avatar.svelte` (if exists) - Avatar display
- `base/InlineTextEditor.svelte` - Name editing

### New Components Required
- `moodboard/nodes/ContactNode.svelte` - Contact node card
- `moodboard/ContactDialog.svelte` - Contact creation/edit dialog
- `moodboard/ContactAutocomplete.svelte` - Search existing contacts
- `moodboard/SocialLinkEditor.svelte` - Social links input component

## Edge Cases

1. **Contact Deleted**: If global contact deleted, all nodes show "Contact not found" with option to detach
2. **Duplicate Detection**: Warn if creating contact with same email as existing
3. **No Contact Info**: If only name provided, disable quick action buttons
4. **Invalid Phone**: Validate phone format, show warning if invalid
5. **Invalid Email**: Validate email format, show warning if invalid
6. **Invalid Social URL**: Validate URL format
7. **Avatar Upload Failure**: Fallback to default icon, show error toast
8. **Large Avatar**: Resize images to 200x200px max (server-side)
9. **Multi-User Access**: If contact shared via team moodboard, all team members see same data

## Performance Considerations

- Autocomplete: Debounce search (300ms)
- Contact list: Paginate if > 100 contacts
- Avatar caching: CDN or local cache
- Lazy-load contact details in inspector
- Index on user_id and email for fast search

## Security Considerations

- Contacts private to user (unless team moodboard)
- Email/phone encrypted at rest (sensitive data)
- Social links validated (prevent XSS via javascript: URLs)
- Rate limit contact creation (prevent spam)
- Avatar uploads scanned for malware

## Testing Strategy

**Unit Tests:**
- Contact creation validation (required name)
- Email/phone format validation
- Social link URL validation
- Contact search/autocomplete

**Integration Tests:**
- Create contact → appears in autocomplete
- Reuse contact in multiple moodboards → updates propagate
- Delete contact → nodes show "not found"
- Link contact to event → edge created

**E2E Tests:**
- User creates contact with all fields → node appears
- User searches for existing contact, adds to moodboard → node created
- User edits contact name → all nodes update
- User clicks email icon → mailto: link opens

## Success Metrics

- Contact creation time < 1s
- Autocomplete response time < 300ms
- Reuse rate > 50% (indicates users leveraging global contacts)
- Quick action click rate > 30% (indicates usefulness)

## Dependencies

- **Requires:** Base node system, Supabase Storage (avatar uploads)
- **Required By:** None (standalone feature)
- **Related:** CAP-007 (Event Nodes link to contacts), CAP-013 (Batch import contacts)

## Open Questions

1. **Team Sharing**: Should contacts be shareable within teams? → Phase 2 (start with user-private)
2. **Contact Sync**: Integrate with phone contacts or Google Contacts? → Phase 2 (manual entry for now)
3. **Contact Groups**: Support grouping contacts (e.g., "Photographers")? → Phase 2 (use tags instead for now)

## References

- Council Decision 4: Event nodes need contact tracking
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Contact node interactions)
