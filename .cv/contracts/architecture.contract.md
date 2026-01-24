# Architecture Contract

> Source: Constitution Principles II, V, VII, Technical Standards
> Mapping: See `.cv/ledger/constitution-mapping.md`

## Team-Based Architecture (NON-NEGOTIABLE)

Every project MUST be associated with a team. Users collaborate through team membership.

### Data Model

```
User → TeamMember → Team → Project
```

### Team Types

| Type | Description | Status |
|------|-------------|--------|
| Personal | Single-user team (auto-created on registration) | MVP |
| Private | Invite-only multi-user team | MVP |
| Public | Open or request-to-join teams | Post-MVP |

### Architecture Rules

- Projects belong to teams, not directly to users
- Users access projects through team membership
- Team ownership determines project permissions
- Personal teams created automatically on user registration

## Modular Feature Organization

Features MUST be organized into clear domains with minimal coupling:

| Domain | Features |
|--------|----------|
| Main | Dashboard, Planning, Projects, Post-Production, Archive |
| Tracking | Calendar, Timeline, Tasks, Budget, Notes |
| Social | Marketplace, Profile, Messages, Tutorials, Patterns |
| Events | Photoshoots, Conventions, Meetups |
| Resources | Gallery, Characters, Moodboards (+ sub-categories) |

## Data Abstraction Layer

**Required Structure** (protects frontend from backend changes):

```
src/lib/
├── api/
│   ├── services/           # Service interfaces & implementations
│   └── types.ts            # API-specific types
├── types/
│   ├── domain/             # Domain models (UI-friendly)
│   └── api/                # API response types (backend shape)
└── transformers/           # API ↔ Domain transformations
```

## Future-Ready Design

Over-provision data models for known future features:

- Add nullable fields for upcoming features (e.g., `project.client_id`)
- Design permission system with future roles in mind
- Include status/type enums with future states
- Use feature flags for unreleased capabilities

### DO NOT

- Build infrastructure for non-MVP features
- Create complex caching layers before needed
- Over-engineer business logic before validation

## Mobile Architecture

**Critical constraint:** iOS does not support PWA Share Target API. Dual strategy required.

### Phase 1 (v1.0)

| Platform | Solution | Purpose |
|----------|----------|---------|
| Android | PWA with Share Target | Native share integration |
| iOS | Capacitor wrapper | App Store distribution + native share extension |

**Capacitor approach:**
- SvelteKit app wrapped for iOS
- Native share extension for "Share to Cosplans" flow
- Same codebase as web, minimal native code
- Enables App Store presence before Flutter

### Phase 2 (v3.0+)

| Platform | Solution | Purpose |
|----------|----------|---------|
| Android | Flutter app | Full native experience |
| iOS | Flutter app | Full native experience |

**Flutter approach:**
- Single codebase for both platforms
- Camera integration, push notifications
- Better offline support
- Replaces Capacitor wrapper

### Shared Considerations

- Offline-first data capture (inspiration doesn't wait for wifi)
- Sync conflict resolution
- Deep linking between web and mobile

## Cost-Conscious Infrastructure

| Threshold | Action |
|-----------|--------|
| Free services | No approval needed |
| < $20/month | Document justification in commit |
| $20-$50/month | Requires constitutional note |
| > $50/month | Requires amendment + user growth validation |

### Free Tier Stack (0-100 users)

- Cloudflare Pages/Workers (1M requests/month free)
- Cloudflare R2 (10GB storage free)
- Supabase (500MB DB, 2GB bandwidth, 50K MAU free)
