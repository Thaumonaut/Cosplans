# Cosplay Tracker — Complete Product Specification

> **Status:** Approved
> **Version:** 0.1.0
> **Last Updated:** 2026-01-20

---

## Vision

A comprehensive platform that grows with cosplayers — from solo hobbyist planning their first costume to teams running cosplay businesses with clients, marketplace services, and social presence.

**Core differentiator:** We start *before* the project. Most tools begin at project creation. Cosplay Tracker starts at the idea — gathering inspiration, researching materials, comparing prices, deciding if an idea is even worth pursuing. Then it guides you through planning, execution, and beyond.

---

## Design Philosophy

### ADHD-Friendly by Design

This is a core principle, not a feature checkbox. It affects every design decision:

- **Moodboard "piles"** — Organized chaos, group related things spatially
- **Progressive disclosure** — Simple by default, complexity reveals when needed
- **"What should I do now" button** — Combat choice paralysis
- **Deadline calculator** — "You have X weeks, here's a suggested pace"
- **Templates** — Avoid blank-page paralysis
- **Gamification (opt-in)** — Streaks, badges, celebrations for motivation
- **Checkpoints and milestones** — Break big projects into wins

### AI Philosophy

- **YES to assistive AI:** Photoshoot locations, task breakdown, set design suggestions, planning help, budget estimation
- **NO to creative AI:** No image/video editing, no "make this look better" features
- **Opt-in and premium:** Users choose to enable AI features; primary monetization path

---

## Target Users

| Persona | Description | Grows into |
|---------|-------------|------------|
| **Solo Cosplayer** | Personal team, 1-5 projects, needs planning help | Team lead, commissioner |
| **Cosplay Group** | Private team, collaborative planning, shared resources | Organization |
| **Creator/Commissioner** | Offers services (photography, props, wigs) | Marketplace seller |
| **Professional** | Runs cosplay as business, needs client management | Full platform user |

The platform scales: start simple, unlock complexity as needed.

---

## Competitive Landscape

### Direct Competitor

| Aspect | Cosplan.app | Cosplans.com (us) |
|--------|-------------|-------------------|
| Starting point | Project creation | Idea/inspiration capture |
| Moodboards | Not core feature | **Core differentiator** — infinite canvas |
| Social media capture | Not mentioned | Share Target for Instagram/TikTok |
| ADHD-friendly design | Not emphasized | Core design principle |
| Convention lookup | Has discovery | Manual first, lookup in v1.5 |
| Community | Wikis, discovery | Collab posts (v2.5), full social (v5.0) |
| Pricing | Free + premium exports | Tiered $0/2/8/16/32 |

**Our positioning vs Cosplan.app:**
> "Cosplan helps you manage projects. Cosplans helps you figure out what to build in the first place — then manage it."

### Indirect Competitors

| Competitor | What they do well | Where Cosplans wins |
|------------|-------------------|---------------------|
| **Trello/Asana** | Task management | No ideation phase, no moodboards, not cosplay-aware |
| **Notion** | Flexible docs + databases | Steep learning curve, no visual moodboards, generic |
| **Milanote** | Visual moodboards | No project management, no budgets, no cosplay workflow |
| **Pinterest** | Inspiration collection | Can't plan, can't budget, can't track progress |
| **Spreadsheets** | Budgets, lists | No visual inspiration, tedious, not integrated |
| **Discord/Facebook** | Find collaborators | No project tools, chaotic, hard to organize |

### Key Differentiators

1. **Start at ideation, not project creation** — capture inspiration before committing
2. **Visual moodboards + project management** — one tool, not two
3. **Social media capture** — Share Target from Instagram/TikTok directly to moodboards
4. **ADHD-friendly throughout** — progressive disclosure, "what should I do now," templates
5. **Convention and photoshoot aware** — built for the cosplay workflow

---

## Mobile Strategy

**Critical constraint:** iOS does not support PWA Share Target API.

| Phase | Android | iOS | Timeline |
|-------|---------|-----|----------|
| Phase 1 | PWA with Share Target | Capacitor wrapper + native share extension | v1.0 |
| Phase 2 | Flutter app | Flutter app | v3.0+ |

**Key flow:** Share from Instagram/TikTok → Cosplans → Select moodboard → Captured.

---

## Version Roadmap

### v1.0 — Planning & Ideation
*The differentiator. Start before the project.*

**Moodboards & Ideation**
- View modes:
  - **Gallery**: Responsive grid of rich media cards
    - Social media embeds (Instagram, TikTok, YouTube) displayed inline
    - Platform badges with color coding for quick identification
    - Image thumbnails with lightbox zoom on click
    - Notes and captions shown below media content
    - Unified card design across all contexts (ideas, projects, standalone moodboards)
    - Modern hover states and shadows for depth
  - **List**: Compact table view with sortable columns (v1.0 - basic list)
  - **Canvas**: Infinite drag-and-drop workspace
    - Drag nodes to position, snap to 20px grid
    - Zoom and pan navigation
    - 48px touch targets for mobile accessibility
    - Resize handles visible on hover
    - Context menu for quick actions
    - No connections in v1.0 (added in v1.5)
- Content types: images, social media embeds, notes, sketches, budget items, contacts, containers
- Tags for organization
- Multi-character support with tab navigation (container nodes with drill-in)
- Share moodboards publicly (OAuth login to comment)
- *v1.5: Full canvas with connections, piles, minimap*
- *v2.0: Enhanced table view, Timeline view*
- *v3.0: Graph view with relationship visualization*

**Research & Comparison**
- Social media URL parsing (Instagram, TikTok, Pinterest, YouTube, Facebook)
- Price comparison across suppliers
- Contact/vendor tracking
- Multiple "options" per idea for comparison

**Budget Planning**
- Budget itemization at idea stage
- Link items to suppliers/contacts
- Sponsorship/brand deal income tracking
- Budget carries forward to project

**Idea → Project Conversion**
- Wizard flow: choose option → review data → add details → confirm
- Shared moodboard (project references idea's board)
- Budget baseline from idea

**Project Execution**
- Tasks with subtasks, priorities, stages
- Resource tracking (props, materials, outfits, tools)
- Milestones and checkpoints
- Progress photos / build log
- "What should I do now" suggestions

**Events**
- Conventions: name, dates, location, link to projects (minimal for v1.0)
- Photoshoots: crew, locations, shot lists, link to projects
- *v1.5: Packing lists, personal schedules, con database lookup*
- *v2.0+: Hotel tracking, badge reminders, AI location suggestions*

**Mobile**
- Android: PWA with Share Target
- iOS: Capacitor wrapper with share extension
- Offline capture support

**Offline Support (v1.0 scope)**
- Queue new items locally, sync on reconnect
- Show "pending sync" indicator for unsynced items
- Last-write-wins for conflicts (with timestamp)
- "Conflict detected" dialog when needed — user chooses version
- Retry failed syncs 3x, then surface error with manual retry
- *Not v1.0: real-time collab editing, automatic merge, full offline mode*

**Touch Interaction Pattern (Milanote-style)**
- Swipe to pan canvas/board
- Tap to select/interact
- Tap and hold to grab and drag
- Pinch to zoom (canvas)
- Edit button on cards for inline editing without opening detail view
- Consistent across moodboards and task boards

**Foundation**
- Team-based architecture (personal, private teams)
- Basic notifications (deadlines, reminders)
- Responsive design (mobile-first)
- Onboarding: Empty states with clear prompts ("Add your first inspiration")
- *v1.5: Quick setup wizard ("What are you working on?" → creates first idea)*

---

### v1.5 — Quality of Life
*Polish and productivity boosters.*

- **Browser extension** — One-click save from desktop browsers (Chrome, Firefox)
- **Templates library** — Convention prep, armor build, group cosplay, photoshoot planning
- **Packing lists** — Convention packing with categories, reusable lists
- **Measurements vault** — Personal sizing, wig cap, shoe size reference
- **Deadline calculator** — Pace suggestions based on time remaining
- **Contacts/vendors tracker** — People you've worked with, bought from, want to remember
- **Improved offline** — Better sync, conflict resolution
- **AI assistants (opt-in)** — Task breakdown, planning help, budget estimation

---

### v2.0 — Social Media Tools
*Outbound presence. Post to other platforms.*

- **Post preparation** — Draft posts with images, captions
- **Multi-platform scheduling** — Instagram, TikTok, Twitter/X, Facebook
- **Content calendar** — Visual timeline of planned posts
- **Caption/hashtag library** — Save and reuse
- **Watermarking** — Auto-watermark before posting (optional)
- **Basic analytics** — Track post performance (via platform APIs)

---

### v2.5 — Collab Posts & Integrations
*Find others. Connect your tools.*

**Collab Posts ("Looking For Group")**
- **Create collab posts** — Group cosplay, photoshoot, meetup
- **Post details** — Theme, date, location, roles needed, free or paid entry
- **Paid events** — Fee covers costs (location, photographer, props)
- **Application flow** — Request to join, organizer approves
- **Event teams** — Auto-created for coordination (technically teams, UI treats separately)
  - Shown in "Events" section of team dropdown (bottom, separate from regular teams)
  - Notification badges per event (like Discord servers)
  - Auto-archive 30 days after event date
  - Can promote to permanent team if group continues
- **Events management page** — Manage all event teams in one place without switching contexts

**Integrations**
- **Google Calendar sync** — Push events and deadlines
- **Google Docs/Sheets** — Export project summaries, budgets
- **iCal export** — For non-Google calendar users
- **Import tools** — Trello boards, spreadsheets
- **Data export** — Full backup as JSON, PDF reports, spreadsheets
- **Link-in-bio page** — Simple landing page for social profiles

---

### v3.0 — Creator Portfolios & Services
*Inbound presence. Your home base on Cosplans.*

- **Real-time collaboration** — See teammates' cursors, live edits on moodboards
- **Public portfolios** — Showcase completed work
- **Service listings** — Commission pages (like Pixieset, Etsy storefronts)
- **"Hire me" presence** — Rates, availability, contact
- **Testimonials** — Display client feedback
- **Shareable links** — Direct URL to your portfolio

---

### v3.5 — Creator Business Tools
*Run your cosplay business.*

- **Commission queue/waitlist** — Public or private status
- **Terms of service generator** — Clear policies from templates
- **Simple contracts** — Agreement templates for commission work
- **Price calculator** — Base price + complexity + rush fee = quote
- **Availability calendar** — "Booked until March"
- **AI assistants** — Photoshoot location suggestions, set design ideas

---

### v4.0 — Marketplace
*Discovery and transactions.*

- **Search & browse** — Find creators by skill, location, price, style
- **Booking system** — Request, confirm, manage appointments
- **Payments via Stripe Connect** — Sellers connect Stripe account, platform fee auto-deducted, PCI compliant
- **Location-based search** — "Photographers near me"
- **Categories** — Photographers, commissioners, wig stylists, prop makers, MUAs

---

### v4.5 — Trust & Safety
*Build confidence in transactions.*

- **Verified badges** — Identity verification, skill verification
- **Escrow via Stripe** — Hold payment until delivery confirmed (Stripe handles funds)
- **Dispute resolution** — Mediation for problems
- **Reviews & ratings** — Two-way feedback system
- **Full moderation system** — Content review queue, appeals process

### Content Policy

| Space | Adult content | Visibility |
|-------|---------------|------------|
| Private moodboards/teams | Allowed | Team members only |
| Age-gated events (18+) | Allowed for planning | Invite-only, age verified |
| Collab post listings | Not allowed | Public |
| Portfolios | Not allowed | Public |
| Marketplace | Not allowed | Public |

**Moderation rollout:**
- v1.0: None needed (all content private)
- v2.5: Report button on collab posts, 18+ event flag with age gate
- v3.0: Report on portfolios, basic review queue
- v4.5: Full moderation, appeals, verified badges

---

### v5.0 — Social Platform
*Community beyond transactions.*

- **Social profiles** — Portfolios become followable profiles
- **Activity feeds** — See what creators you follow are working on
- **Discovery** — Trending projects, featured creators
- **Direct messaging** — Chat between users
- **Notifications** — Rich notification center

---

### v5.5 — Community Features
*Bring cosplayers together.*

- **Groups** — Interest-based communities (Demon Slayer cosplayers, Texas meetups)
- **User events** — Create and promote meetups, gatherings
- **Tutorials & guides** — User-generated how-tos
- **Challenges & collabs** — Community prompts, group projects
- **Mentorship matching** — Connect experienced cosplayers with beginners

---

### Future / Unscheduled

- **Public API** — Let others build on the platform (low priority)
- **White-label/embedding** — Cosplay groups embed tools on their sites
- **"Year in cosplay" analytics** — Fun retrospective insights
- **Multi-language (i18n)** — Global community support
- **Regional expansion** — Asia region first (Japan, Korea, SEA), then EU if demand

---

## Cross-Cutting Concerns

These evolve across versions rather than shipping in one release:

| Concern | v1.0 | v2.0 | v3.0+ |
|---------|------|------|-------|
| Notifications | Basic (deadlines) | Richer (comments, bookings) | Full center |
| Data export | JSON backup | PDF, spreadsheet | GDPR tools |
| Accessibility | Foundation (semantic HTML, ARIA) | Audit & improve | Ongoing |
| AI features | Task breakdown, planning | Set design, locations | Expanded |
| Gamification | Basic (streaks, celebrations) | Badges, achievements | Community challenges |

---

## Monetization

### Philosophy

**Generous free tier, always.** Cosplay is already expensive — this tool should help, not add to the burden. The free tier must be genuinely useful for solo cosplayers, not a crippled trial.

Revenue goal: "Keep the lights on" — cover infrastructure costs and enable sustainable development, not maximize extraction.

Upgrade triggers come from scale (teams, storage) and premium features (AI), not artificial limitations on core functionality.

### Dual Subscription Model

Personal and team subscriptions are separate — your personal tier controls what *you* can do, team tier controls what *the team* can do together.

#### Personal Tiers (your account)

| Tier | Monthly | Annual | Features |
|------|---------|--------|----------|
| **Free** | $0 | — | 2 teams, 3 personal projects, 500MB, 5 AI/mo |
| **Hobbyist** | $2/mo | $20/yr | 5 teams, 10 projects, 3GB, 20 AI/mo, PDF export |
| **Enthusiast** | $8/mo | $80/yr | 10 teams, unlimited projects, 10GB, 75 AI/mo, spreadsheet export |
| **Professional** | $16/mo | $160/yr | Unlimited teams, 25GB, 300 AI/mo, branded exports, priority support |

#### Team Tiers (per team)

| Tier | Monthly | Annual | Features |
|------|---------|--------|----------|
| **Free Team** | $0 | — | 3 members, 3 projects, 1GB, 50 resources, basic budgets |
| **Team+** | $5/mo | $50/yr | 10 members, 15 projects, 10GB, 250 resources, budget categories |
| **Team Pro** | $15/mo | $150/yr | 25 members, unlimited projects, 50GB, invoicing, organize collabs |
| **Studio** | $40/mo + $5/seat | $400/yr + $50/seat | Unlimited, 200GB+, reports, analytics, dedicated support |

#### How It Works

- **Personal tier** controls: AI requests, personal storage, teams you can join, export formats
- **Team tier** controls: team size, team projects, shared storage, shared resources, budget tools
- A Free user can join a Team Pro team and use team resources normally
- A Professional user in a Free Team is still limited by team's caps on shared resources

### AI Pay-Per-Use

Users can purchase additional AI requests beyond their personal tier allowance:

| Tier | Included | Pay-per-use rate |
|------|----------|------------------|
| Free | 5/mo | $0.10/request |
| Hobbyist | 20/mo | $0.08/request |
| Enthusiast | 75/mo | $0.06/request |
| Professional | 300/mo | $0.04/request |

*Rates are estimates — will adjust based on actual API costs.*

### Revenue Streams

| Stream | Description | Version |
|--------|-------------|---------|
| Personal subscriptions | Monthly/annual personal tier fees | v1.0 |
| Team subscriptions | Monthly/annual team tier fees | v1.0 |
| AI pay-per-use | Burst usage beyond tier cap | v1.5 |
| Collab post fees | ~5-10% of paid event fees | v2.5 |
| Marketplace fees | ~5-15% of transactions | v4.0 |
| Featured listings | Boost visibility | v4.0 |

### Upgrade Triggers

| Journey | Why they upgrade |
|---------|------------------|
| Free → Hobbyist | More projects, AI access, better exports |
| Hobbyist → Enthusiast | Multiple groups, more storage, more AI |
| Enthusiast → Professional | Business tools, invoicing, unlimited projects |
| Professional → Studio | Whole team needs access, high volume |

### Annual Bundles (Personal + Team)

| Bundle | Includes | Annual | Effective monthly |
|--------|----------|--------|-------------------|
| **Duo** | Hobbyist + Team+ | $60/yr | $5/mo |
| **Creator** | Enthusiast + Team Pro | $200/yr | ~$17/mo |
| **Pro Bundle** | Professional + Team Pro | $280/yr | ~$23/mo |
| **Studio Bundle** | Professional + Studio | $500/yr + seats | ~$42/mo + seats |

### Monetization Timeline

**Approach:** Tiers visible from launch, but generous Founder grace period.

| Phase | When | What happens |
|-------|------|--------------|
| **v1.0 Launch** | Now | Tier structure visible in UI. All users get "Founder" status. |
| **Founder Period** | 12 months | Founders get Enthusiast + Team+ features free. Usage data collected. |
| **Grace End** | v2.0 or 12 months | Founders choose: stay Free (with limits) or subscribe. |
| **Early Supporter Pricing** | At grace end | Founders who subscribe get 20% off forever. |

**Founder Perks:**
- Enthusiast personal + Team+ team features free during grace period
- "Founding Member" badge on profile (permanent)
- 20% lifetime discount if they subscribe before grace ends
- Input into feature prioritization (surveys, feedback channels)

**Why this approach:**
- Transparent from day one — no surprise paywalls
- Rewards early adopters who take a chance on unproven product
- Real usage data informs whether limits are fair
- Natural conversion point with incentive to subscribe

---

## Development Approach

### Test-Driven Development (TDD)

Every feature follows the TDD pipeline:

1. **Write failing test first** — Define expected behavior before implementation
2. **Implement until test passes** — Build the minimum to satisfy the test
3. **Refactor with confidence** — Tests prevent regressions

### Test Layers

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Vitest | Services, utilities, pure functions |
| Integration | Vitest | Supabase operations, API services, RLS policies |
| E2E | Playwright | Critical user journeys across browsers |
| Regression | Playwright | Ensure fixed bugs stay fixed |

### Critical Journeys (must have E2E coverage)

- Signup / login / logout
- Create moodboard, add items via URL paste
- Share Target flow (mobile capture)
- Idea → Project conversion
- Task CRUD and stage transitions
- Team creation and member invite

### Coverage Targets

- Services: 80%+
- Critical paths: 100% E2E coverage
- Bug fixes: Regression test required before closing

---

## Tech Stack (Non-Negotiable)

| Layer | Technology |
|-------|------------|
| Framework | SvelteKit + Svelte 5 |
| Runtime | Bun |
| Styling | Tailwind CSS + Flowbite Svelte |
| Backend | Supabase (auth, database, real-time, storage) |
| Deployment | Cloudflare Pages/Workers |
| Storage | Cloudflare R2 |
| Mobile (Phase 1) | PWA (Android) + Capacitor (iOS) |
| Mobile (Phase 2) | Flutter |
| Canvas | @xyflow/svelte (Svelte Flow) |

---

## Current Specs Mapping to v1.0

| Spec | Description | v1.0 Scope |
|------|-------------|------------|
| 003 - Modern Task UI | Task views, custom fields | Core |
| 004 - Bugfix & Testing | Stability, quality | Foundation |
| 005 - Undocumented Features | Theme builder, timeline, budget views | Partial (theme builder optional) |
| 006 - Brainstorming & Moodboard | Moodboards, social media integration, budgets | **Core differentiator** |
| 007 - Component Consolidation | Code health, reduce duplicates | Foundation |

**Removed from v1.0 (moved to v2.0):**
- Social media post scheduling
- Multi-platform posting
- Post analytics

---

## Success Metrics

### v1.0 Success

| Metric | Target | How to measure |
|--------|--------|----------------|
| Activation | 60% of signups create 1+ moodboard item in first session | Analytics |
| Engagement | Average 5+ items per moodboard | Database query |
| Idea → Project conversion | 30% of ideas convert to projects within 30 days | Database query |
| Retention | 40% weekly active users after 4 weeks | Analytics |
| Mobile capture | 25% of moodboard items added via share target | Analytics |
| NPS | 40+ (good) | User survey |

### Long-term Success

| Metric | Target | Version |
|--------|--------|---------|
| Solo → Team upgrade | 20% of active users join/create multi-person team | v1.5+ |
| Creator portfolios | 10% of active users create public portfolio | v3.0 |
| Marketplace transactions | 100+ transactions/month | v4.0 |
| Community engagement | 50% of users in 1+ group | v5.0 |

---

## Appendix: Feature Scope from Constitution

The full feature scope matrix lives in `.specify/memory/constitution.md` (section "Feature Scope Matrix"). This spec summarizes the vision; the constitution provides exhaustive feature lists per phase.

---

*This document is the single source of truth for product direction. Implementation details live in individual specs (`specs/00X-*/spec.md`). Architectural constraints live in contracts (`.cv/contracts/`).*
