# CAP-007: Event Nodes & Calendar Sync

**Parent Feature:** FEAT-006 Moodboard Organization & Container Detail Display Patterns  
**Status:** Planned  
**Priority:** Medium  
**Checkpoint:** CP-003 (Event, Contact, Checklist Nodes)

## Intent

Enable cosplayers and event coordinators to create event nodes that link directly to calendar systems (Google, Apple, Outlook), allowing project timelines and deadlines to integrate with real-world schedules.

## Functional Requirements

1. **Event Node Creation**
   - Canvas context menu → "Create Event Node"
   - Event properties:
     - Event name (required)
     - Date/time (start, end) (required)
     - Location (optional)
     - Description (optional)
     - Calendar provider (Google/Apple/Outlook)
     - Linked calendar event ID (if synced)

2. **Calendar Sync**
   - On event creation: Option "Add to Calendar"
   - OAuth flow for calendar provider (one-time)
   - Create calendar event via API
   - Store event ID for bidirectional sync
   - Sync status: Not synced, Syncing, Synced, Error

3. **Bidirectional Updates**
   - Update event in moodboard → push to calendar
   - Update event in calendar → poll/webhook updates moodboard
   - Conflict resolution: Last-write-wins (show warning)
   - Sync frequency: Polling every 15 minutes or webhook (if available)

4. **Event Node Display**
   - Shows date/time prominently (formatted)
   - Calendar icon with provider badge (Google/Apple/Outlook)
   - Countdown timer for upcoming events ("in 3 days")
   - Past events shown grayed out with "Past" badge
   - Link to calendar event (opens in browser/app)

5. **Event Linking**
   - Events can link to other nodes (cosplay, props, contacts)
   - Sequential edges (CAP-010) useful for event timelines
   - Multiple events can link to same project (e.g., photoshoot, convention)

6. **Reminders & Notifications**
   - Browser notification for events (1 day, 1 hour before)
   - Notification settings: Per-event or global
   - Requires notification permission

## Data Model

### Database Schema
```sql
-- Add to moodboard_nodes table
ALTER TABLE moodboard_nodes ADD COLUMN event_data JSONB DEFAULT NULL;

CREATE INDEX idx_moodboard_nodes_event_date 
  ON moodboard_nodes((event_data->>'start_date')) 
  WHERE node_type = 'event';
```

### Type Definitions
```typescript
interface EventNode extends BaseMoodboardNode {
  node_type: 'event';
  event_data: {
    start_date: string; // ISO 8601
    end_date?: string; // ISO 8601
    location?: string;
    calendar_provider?: 'google' | 'apple' | 'outlook';
    calendar_event_id?: string;
    sync_status: 'not_synced' | 'syncing' | 'synced' | 'error';
    last_synced_at?: string;
    reminder_enabled: boolean;
  };
}
```

### Calendar API Integration
```typescript
interface CalendarProvider {
  name: 'google' | 'apple' | 'outlook';
  
  // OAuth
  authorize(): Promise<AuthToken>;
  
  // CRUD
  createEvent(event: CalendarEvent): Promise<string>; // Returns event ID
  updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  
  // Sync
  fetchEvent(eventId: string): Promise<CalendarEvent>;
  subscribeToUpdates(eventId: string, callback: (event: CalendarEvent) => void): void;
}
```

## UI/UX Requirements

1. **Event Node Card Design**
   - Header: Calendar icon + provider badge
   - Title: Event name (editable inline)
   - Date/time: Large, formatted (e.g., "Tue, Jan 28, 2026, 2:00 PM")
   - Countdown: "in 5 days" or "3 hours ago" (dynamic)
   - Location: Pin icon + location name
   - Sync status: Small icon (checkmark/spinner/error)

2. **Event Creation Dialog**
   - Form fields: Name, Start Date/Time, End Date/Time, Location, Description
   - Calendar sync section:
     - Toggle: "Sync to Calendar"
     - Dropdown: Select provider (Google/Apple/Outlook)
     - "Connect Calendar" button (if not authorized)
   - Reminders: Checkbox "Enable reminders"
   - Create button

3. **Calendar OAuth Flow**
   - Click "Connect Calendar" → OAuth popup
   - User authorizes app
   - Success: "✓ Connected to [Provider]"
   - Error: "✗ Connection failed. Please try again."
   - Token stored securely (backend)

4. **Sync Indicators**
   - Synced: Green checkmark icon
   - Syncing: Spinner animation
   - Error: Red warning icon (tooltip shows error)
   - Not synced: Gray calendar icon

5. **Inspector Panel Integration**
   - Shows all event details
   - Link to calendar event: "View in [Provider]" button
   - Manual sync button: "Sync Now"
   - Unsync button: "Remove from Calendar" (keeps node, deletes calendar event)

## Components

### Reuse from Registry
- `ui/dialog.svelte` - Event creation dialog
- `ui/button.svelte` - Action buttons
- `ui/input.svelte` - Text fields
- `ui/select.svelte` - Calendar provider dropdown
- `ui/checkbox.svelte` - Reminders toggle
- `ui/badge.svelte` - Status badges
- `base/InlineTextEditor.svelte` - Event name editing

### New Components Required
- `moodboard/nodes/EventNode.svelte` - Event node card
- `moodboard/EventDialog.svelte` - Event creation/edit dialog
- `moodboard/CalendarSync.svelte` - Calendar sync UI component

## Edge Cases

1. **OAuth Failure**: Show error, allow retry, fallback to non-synced event
2. **Token Expiration**: Refresh token automatically, re-auth if refresh fails
3. **Sync Conflict**: If event changed in both places, show conflict dialog with merge options
4. **Calendar Event Deleted**: Poll detects deletion, mark node "Sync broken"
5. **Network Offline**: Queue sync operations, retry when online
6. **Rate Limiting**: Respect API limits (e.g., Google 1000 req/day), show warning if approaching
7. **Timezone Handling**: Store dates in UTC, display in user's timezone
8. **All-Day Events**: Handle events without specific time
9. **Recurring Events**: Phase 1 - not supported (create individual events), Phase 2 - add recurrence support

## Performance Considerations

- Polling: 15-minute interval (configurable)
- Batch sync: Sync multiple events in one API call
- Cache tokens: Refresh tokens stored securely, access tokens cached (1 hour)
- Debounce updates: Wait 5s after edit before syncing (avoid excessive API calls)
- Background sync: Use service worker for sync (if available)

## Security Considerations

- OAuth tokens stored encrypted in backend (not localStorage)
- API calls proxied through backend (never expose keys in client)
- Revoke tokens on account deletion or manual disconnect
- HTTPS required for calendar webhooks
- Validate calendar event IDs to prevent injection

## Testing Strategy

**Unit Tests:**
- Event node data validation (required fields)
- Date formatting and countdown calculation
- OAuth token refresh logic
- Conflict resolution (last-write-wins)

**Integration Tests:**
- Create event → sync to Google Calendar → verify event created
- Update event in moodboard → verify calendar updated
- Update event in calendar → verify moodboard updated (via polling)
- Delete event in calendar → verify node marked "sync broken"

**E2E Tests:**
- User creates event, enables sync, connects Google account → event appears in Google Calendar
- User edits event date in moodboard → date updates in calendar
- User clicks "View in Google" → opens correct calendar event

## Success Metrics

- Event creation time < 2s (without sync)
- Sync to calendar completes in < 5s
- Polling sync detects changes within 15 minutes
- OAuth success rate > 90%
- Sync error rate < 5%

## Dependencies

- **Requires:** Base node system
- **Required By:** None (standalone feature)
- **Related:** CAP-008 (Contact Nodes may link to events), CAP-010 (Sequential edges for timelines)

## Open Questions

1. **Recurrence Support**: Phase 1 or Phase 2? → Phase 2 (create individual events for now)
2. **Calendar Webhooks vs Polling**: Webhooks preferred but require backend infrastructure → Start with polling, add webhooks in Phase 2

## References

- Council Decision 4: "i think we should consider an event node that links directly with the calendar"
- Design artifact: `.cv/design/feat-006/interaction-patterns.md` (Event node interactions)
- API docs: Google Calendar API, Apple Calendar, Microsoft Graph API (Outlook)
