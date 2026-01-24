# Scaffold Meeting Minutes

**Date:** 2026-01-20
**Participants:** User, Claude (CV)

---

## Session 1: Vision & Milestones

### What "complete" means

A full suite of tools that grows with the user — from solo cosplayer to team to organization. Covers brainstorming, planning, execution, social media, conventions, photoshoots, and marketplace.

Core insight: **Start before the project.** Most tools begin at project creation. Cosplay Tracker starts at the idea — gathering inspiration, researching, comparing prices, deciding if an idea is even worth pursuing.

### AI Philosophy (firm boundary)

- **YES to assistive AI:** photoshoot locations, task breakdown, set design suggestions, planning help
- **NO to creative AI:** no image/video editing, no "make this look better" features
- AI features are opt-in and premium

---

## Session 2: Expanded Roadmap

### Design Philosophy (new)

**ADHD-friendly by design** — This is a core principle, not a feature. Affects everything:
- Moodboard "piles" for organized chaos
- Gamification for motivation (opt-in)
- "What should I do now" button
- Deadline calculators to prevent overwhelm
- Templates to avoid blank-page paralysis
- Progressive disclosure — simple by default, complexity when needed

### Mobile Strategy

**Critical constraint:** iOS does not support PWA Share Target API. Need native wrapper for iOS.

**Phase 1: Hybrid Approach** (v1.0)
- **Android:** PWA with Share Target — works natively
- **iOS:** Capacitor wrapper with native share extension
  - SvelteKit app wrapped for App Store
  - Share extension captures URLs from Instagram/TikTok
  - Same codebase, native capability
- "Share to Cosplans → pick moodboard" flow on both platforms
- Offline capture support

**Phase 2: Flutter Apps** (v3.0 or later)
- Full native iOS/Android apps
- Camera integration
- Better performance
- Push notifications
- Replaces Capacitor wrapper

### Revised Milestone Roadmap

**v1.0 — Planning & Ideation**
- Moodboards, idea formulation, research, price comparison
- Budget planning at idea stage (including sponsorship income tracking)
- Idea → Project conversion with tasks, resources, milestones
- Execution: resource tracking, photoshoots, conventions
- Motivation: checkpoints, milestones, "prevent con crunch"
- PWA with Share Target for mobile capture
- Basic notifications

**v1.5 — Quality of Life**
- Templates library
- Packing lists for conventions
- Measurements vault
- Deadline calculator / pace suggestions
- Improved offline support
- AI assistants (opt-in): task breakdown, planning help

**v2.0 — Social Media Tools**
- Post preparation and scheduling
- Multi-platform connections
- Content calendar
- Caption/hashtag library
- Watermarking (optional)

**v2.5 — Integrations**
- Google Calendar sync
- Google Docs/Sheets export
- iCal export
- Import from Trello, spreadsheets
- Data export (PDF, spreadsheet)

**v3.0 — Creator Portfolios & Services**
- Public portfolios
- Commission pages / service listings
- "Hire me" presence
- Testimonials display

**v3.5 — Creator Business Tools**
- Commission queue/waitlist
- Terms of service generator
- Simple contracts
- Price calculator / quote builder
- Availability calendar
- AI assistants: photoshoot locations, set design ideas

**v4.0 — Marketplace**
- Discovery: search/browse creators
- Booking system
- Payments integration
- Location-based search

**v4.5 — Trust & Safety**
- Verified badges
- Escrow payments
- Dispute resolution
- Reviews & ratings

**v5.0 — Social Platform**
- Community beyond transactions
- Portfolios become social profiles
- Following, discovery

**v5.5 — Community Features**
- Groups / interest communities
- User-created events / meetups
- Tutorials and guides (user-generated)
- Challenges and collabs
- Mentorship matching

### Features parked for later consideration

- **Public API** — Maybe someday, not prioritized
- **White-label/embedding** — Needs more thought
- **"Year in cosplay" analytics** — Fun but not critical

### Sponsorships placement

Sponsorship/brand deal tracking belongs in **budgeting tools** (v1.0) — track income alongside expenses.

---

## Session 3: Monetization & Collab Posts

### Monetization Philosophy

Not greedy — generous free tier that's genuinely useful. Low-cost features free, high-cost features (storage, AI) drive revenue.

**Five-tier pricing (doubles each level):**

| Tier | Price | Target |
|------|-------|--------|
| Free | $0 | Evaluating |
| Hobbyist | $2/mo | Casual, wants extras |
| Enthusiast | $8/mo | Active, small groups |
| Professional | $16/mo | Business tools |
| Studio | $32/mo + $5/seat (after 10) | Teams, productions |

**Key limits progression:**
- Team size: 3 → 5 → 10 → 25 → Unlimited
- Active projects: 2 → 5 → 15 → Unlimited → Unlimited
- Storage: 250MB → 1GB → 5GB → 20GB → 100GB+
- AI included: 0 → 10 → 50 → 250 → 1000/mo

**AI pay-per-use:** All tiers can buy extra AI requests (cheaper at higher tiers). Free tier can try AI at $0.10/request.

**Solo upgrade reasons:** More projects, AI access, better exports, budget itemization — not just "more teammates"

### Collab Posts ("Looking For Group")

**Concept:** Users create posts looking for others to join group cosplays, photoshoots, or meetups.

**Features:**
- Post types: group cosplay, photoshoot, meetup
- Free or paid entry (paid covers location, photographer, etc.)
- Application/approval flow
- Creates temp team for coordination
- Post-event: dissolve or convert to permanent team

**Placement:** v2.5 (between Social Media Tools and Creator Portfolios)

**Monetization:** Platform takes small % of paid event fees (premium users only can organize paid)

---

## Open questions resolved

- Social media scheduling → moved to v2.0 (out of v1.0)
- Creator portfolios → v3.0 as stepping stone before marketplace
- PWA Share Target → v1.0, Capacitor for iOS
- ADHD-friendly → design principle in contracts, not a feature checkbox
- Collab posts → v2.5
- Monetization → generous free tier, premium for scale/AI/collabs

## Next steps

- ~~Finalize and promote draft spec to official spec~~ **DONE** (2026-01-20)
- ~~Review with fresh eyes for any gaps~~ **DONE** - User approved

**Scaffold complete.** The draft has been promoted to `.cv/spec.md` (Approved status).

Moving forward:
1. Continue 006 moodboard development — this is the v1.0 core differentiator
2. Address 004 bugfixes as encountered
3. Plan 007 component consolidation after 006 stabilizes
4. Revisit spec when starting new version milestones
