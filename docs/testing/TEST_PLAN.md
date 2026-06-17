# Test Plan

## Product Overview

NcSound Publishing — sync licensing platform, beat store, and artist roster management system built on Supabase + React + Express.

## Test Strategy

| Layer | Tool | Scope | Owner |
|---|---|---|---|
| Unit | Vitest | Pure functions, utilities, hooks, validators, state stores, business rules | Engineering |
| Integration | Vitest | Module-to-module, API routes, DB queries, third-party boundaries | Engineering |
| E2E | Playwright | Full user workflows across auth, navigation, forms, media | Engineering + QA |
| Performance | Vitest / Lighthouse | Startup time, key flow latency, memory usage | Engineering |
| Security | Manual + automated | Input validation, auth boundaries, injection, secret scanning | Engineering + Security |
| Accessibility | axe-core / manual | Keyboard nav, ARIA labels, contrast, focus management | Engineering + QA |

## 100% Phase Coverage

### Unit tests (11 files)
- `src/lib/supabase.ts` — client initialization, anon key presence
- `src/store/usePlayerStore.ts` — play/pause/volume/mute state transitions
- `src/utils.test.ts` — formatTime + Zod schemas
- `src/lib/supabase-queries.test.ts` — query patterns for beat_store_products, tracks, albums
- `src/lib/contracts.test.ts` — data model contract validation
- Rate limiter tests

### Component tests (28 files)
- All public pages: Home, Catalog, BeatStore, About, NiroMusic, Story, NotFound, Privacy, Terms
- Admin pages: Dashboard, Control, Briefs, Inbox, LicenseRequests, SupervisorRequests
- Artist pages: Dashboard, Upload, Profile, Royalties, UploadBeat, RegistrationStatus, ProGuide
- Shared: SpotifyEmbed, BandcampDiscography, Layout, App, Toast, GlobalPlayer
- ErrorBoundary, SEO

### Integration tests (4 files)
- API routes: health, checkout, license checkout, contact, agent chat, email, analytics
- Supabase query contracts
- BandcampDiscography API parsing
- SpotifyEmbed URL generation

### E2E tests (5 Playwright spec files)
- Auth: artist login/logout/session, admin login, protected route redirects
- Workflows: browse → catalog → license, beat store checkout, contact form, agreement, supervisor register, 404
- Page smoke: all public pages load without errors
- User journeys: end-to-end flows across multiple pages
- A11y: axe-core scans on 16 public pages

### Security tests (2 files)
- OWASP common payloads: SQL injection, XSS, command injection, path traversal
- Sanitize error utility: API key redaction, unicode safety, stack trace removal

### Performance tests
- formatTime: 10k iterations < 100ms
- Zod validation: 1k iterations < 200ms
- Array filtering: 1k items < 10ms

### Regression tests
- Home crash: Play is not defined (missing import)
- GlobalPlayer shows mock data when no track loaded
- BeatStore play button removed (beats for sync only)
- Featured tracks crash: stale mock data on Home
- Home JSX parse error: missing div wrapper

## Infrastructure

- **CI:** GitHub Actions — typecheck, lint, test-with-coverage, build, security audit (npm audit + gitleaks), E2E (Chromium + Firefox + WebKit)
- **Coverage thresholds:** 31% (statements), 24% (branches), 26% (functions), 35% (lines)
- **Test count:** ~295 Vitest tests + ~30 Playwright E2E tests
- **Supabase:** RLS enabled on all 41 tables

## Known Gaps

- E2E auth tests require seeded Supabase test accounts (skip without env vars)
- Stripe checkout in test mode only
- No visual regression testing (Percy/Chromatic)
- No server-side API integration tests (supertest not installed)
- 345 lint warnings (pre-existing @typescript-eslint/no-explicit-any)
