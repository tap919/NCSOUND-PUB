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

## 25% Phase Test Plan

### Unit tests
- [ ] `src/lib/supabase.ts` — client initialization, anon key presence
- [ ] `src/store/usePlayerStore.ts` — play/pause/volume/mute state transitions
- [ ] `src/utils.test.ts` — existing coverage for formatTime + Zod schemas
- [ ] GlobalPlayer component — renders when track set, hidden when null
- [ ] BeatStore component — renders beat list, genre filtering, empty state
- [ ] Home component — renders listen section, featured tracks, error state
- [ ] NiroMusic component — album loading, track play/pause/next
- [ ] Roster pages — all 4 roster pages render with correct social links
- [ ] ErrorBoundary — catches errors, renders fallback UI
- [ ] SEO component — renders meta tags with correct title/description

### Integration tests
- [ ] Supabase client — query returns data from beat_store_products
- [ ] Supabase client — tracks query with nested album relationship
- [ ] Contact form submission — valid payload inserts successfully
- [ ] BandcampDiscography — parses API response into releases
- [ ] SpotifyEmbed — renders correct iframe URL from artist ID
- [ ] API health check — server responds 200 at /api/health

### E2E smoke tests
- [ ] Home page loads without console errors
- [ ] Navigation — all public pages reachable
- [ ] Beat Store — displays beat list from DB
- [ ] Roster pages — each artist page loads with links
- [ ] Niro Music — albums load, tracks playable
- [ ] Contact form — valid submission shows success toast

### Security tests
- [ ] No hardcoded secrets in source code
- [ ] Supabase anon key restricted to SELECT only
- [ ] XSS vectors checked in contact form inputs
- [ ] RLS policies verified on public tables

## 50% Phase Plan (Future)

- Component unit coverage > 60%
- Integration coverage for all API routes
- E2E coverage for auth flows, CRUD operations
- Performance baselines captured
- Accessibility smoke on all public pages

## 100% Phase Plan (Future)

- Full automated coverage for all critical workflows
- Security review completed
- Performance and soak testing completed
- Recovery and rollback tested
- Release validation completed
