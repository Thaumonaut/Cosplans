# Security Contract

> Source: Constitution Principle IX, Technical Standards
> Mapping: See `.cv/ledger/constitution-mapping.md`

## Data Privacy & User Rights (NON-NEGOTIABLE)

User data ownership and privacy MUST be protected at all levels.

### Core Privacy Principles

| Principle | Requirement |
|-----------|-------------|
| User Data Ownership | Users own all their data (projects, images, notes, posts) |
| Data Control | Users can export, delete, or modify their data at any time |
| Privacy Levels | Clear public/private/team-only visibility controls |
| GDPR Compliance | Design for GDPR compliance from the start |
| Transparent Terms | Clear, readable terms of service and privacy policy |
| No Data Mining | User data not sold or shared without explicit consent |
| Secure Storage | Encryption at rest and in transit |

## Privacy Levels

```typescript
type PrivacyLevel = 'private' | 'team' | 'public'

interface PrivacySettings {
  project: PrivacyLevel        // Who can view this project
  portfolio: PrivacyLevel      // Public portfolio visibility
  profile: PrivacyLevel        // Profile visibility on marketplace
  activityLog: PrivacyLevel    // Activity feed visibility
}
```

## Data Deletion Policy

| Type | Behavior |
|------|----------|
| Soft Delete | 30-day grace period for recovery |
| Hard Delete | Permanent after grace period or on user request |
| Cascade Rules | Deleting team deletes associated projects (with warning) |
| Export Before Delete | Mandatory data export offer before account deletion |

## Security Requirements

### Database Security

- **Supabase Row Level Security (RLS)** for ALL tables
- Team membership validated on all project queries
- No direct table access without RLS policies

### API Security

- Image access control through signed URLs
- API rate limiting to prevent abuse
- Session management with secure tokens
- HTTPS only (enforced by Cloudflare)

### Authentication

- Supabase Auth for all authentication
- OAuth providers: Google, GitHub (minimum)
- Email/password with verification
- Password reset via secure token

## Compliance Checklist

Before public launch:

- [ ] Privacy policy drafted and accessible
- [ ] Cookie consent (if using cookies)
- [ ] Data processing agreement (if EU users)
- [ ] User data export functionality
- [ ] User data deletion functionality
- [ ] Security audit completed
- [ ] RLS policies tested for all tables

## Incident Response

If a security issue is discovered:

1. Immediately disable affected functionality
2. Document the issue in `.cv/ledger/decisions.md`
3. Notify affected users if data was compromised
4. Implement fix with tests
5. Post-mortem analysis
