# NcSound Build Plan — Phases 2a → 2d

**Objective**: Complete Tiers 1-4 (AI Placement Engine, Revenue Infrastructure, Distribution Pipeline, Real Analytics) with testing gates between each phase.

**Current state**: Tier 5 (Email/AI Agent/Cron) is built. All 37 unit tests + 54 E2E tests passing.

---

## Dependency Graph

```
Phase 2a (AI Metadata Pipeline)
  └─▶ Phase 2b (AI Sync Placement Engine) — depends on 2a's rich metadata
  ├─▶ Phase 2c (Revenue Infrastructure) — independent, can run parallel to 2b
  └─▶ Phase 2d (Distribution + Analytics) — depends on 2a for data quality, 2c for revenue data
```

**Parallel execution**: 2b and 2c can be worked simultaneously after 2a is complete.

---

## Phase 2a — AI Metadata Pipeline

**Goal**: Auto-detect BPM, key, energy, mood, genre from audio on upload. Replace hardcoded metadata quality score with real scoring.

**Estimated effort**: 4-6 steps

### Step 2a.1 — Audio Analysis Endpoint
- Create `POST /api/analyze/audio` that accepts a storage URL and uses a lightweight approach:
  - Download audio file header/segment
  - Compute BPM using a beat detection algorithm (or use `audio-decode` + custom BPM detection)
  - Store results in `track_analysis` table
- **Files**: `server.ts`, `supabase/005_analysis.sql`
- **Verify**: `curl /api/analyze/audio` returns BPM, key, energy

### Step 2a.2 — AI Mood/Genre Tagging
- Create `POST /api/analyze/metadata` that sends track info + waveform data to Gemini for classification
- Gemini prompt: "Classify this track's mood, genre, energy level, instrumentation from title and BPM/key data"
- Store in `tracks` table (mood_tags, genre, energy_level)
- **Files**: `server.ts` (new route), `src/lib/analyze.ts`
- **Verify**: POST with track ID returns enriched metadata

### Step 2a.3 — Wire Analysis into Upload Flow
- Update `Upload.tsx` step 3 to auto-call analysis on file upload
- Show detected BPM/key/mood with edit capability before final save
- **Files**: `src/pages/artist/Upload.tsx`
- **Verify**: Upload a track → metadata auto-filled

### Step 2a.4 — Real Metadata Quality Engine
- Build `GET /api/quality/scores` that queries all tracks and computes % completeness per field
- Build `GET /api/quality/artist/:id` for per-artist scores
- **Files**: `server.ts`, `src/lib/quality.ts`
- **Verify**: Returns real scores matching actual DB content

### Step 2a.5 — Wire Quality into Admin Dashboard
- Replace the hardcoded Metadata Quality Score mock in `Dashboard.tsx` with live data from `/api/quality/scores`
- **Files**: `src/pages/admin/Dashboard.tsx`
- **Verify**: Admin dashboard shows real metadata percentages

### Step 2a.6 — Tests
- Unit tests for audio analysis helpers
- E2E test: upload flow → metadata auto-filled
- **Verify**: `npm test` + `npx playwright test` pass

---

**Test Gate**: All 37+ existing tests + new tests pass. Manual verification: upload a track, confirm BPM/key/mood auto-detected.

---

## Phase 2b — AI Sync Placement Engine

**Goal**: Vector/semantic track-to-brief matching, auto-pitch generation, outreach tracking. This is your core differentiator.

**Estimated effort**: 6-8 steps

### Step 2b.1 — Vector Embeddings for Tracks
- Add `pgvector` extension to Supabase (or use existing `vectors` column in JSONB)
- Create `track_embeddings` table: track_id, model, embedding (vector), created_at
- Build `POST /api/embeddings/generate` that sends track metadata to Gemini for embedding
- Build `POST /api/embeddings/search` that finds semantically similar tracks
- **Files**: `supabase/006_vector.sql`, `server.ts`
- **Verify**: Search by text returns relevant tracks ranked by similarity

### Step 2b.2 — Semantic Brief Matching API
- Build `POST /api/match/brief` that:
  1. Takes a brief's requirements (mood, genre, BPM range, energy)
  2. Generates an embedding for the brief text
  3. Finds top-20 tracks by vector similarity + metadata filter
  4. Returns ranked shortlist with relevance scores
- **Files**: `server.ts`
- **Verify**: Submit a brief description → get ranked track list

### Step 2b.3 — Replace BriefMatcher Component
- Update `BriefMatcher.tsx` to use the new semantic API instead of SQL-only fallback
- Add relevance score display, match breakdown
- **Files**: `src/components/BriefMatcher.tsx`
- **Verify**: Brief matching shows vector-similar results

### Step 2b.4 — Auto-Pitch Generation
- Build `POST /api/pitch/generate` that:
  1. Takes a brief + matched tracks
  2. Uses Gemini to write personalized pitch email + DISCO playlist description
  3. Returns draft pitch text
- **Files**: `server.ts`
- **Verify**: Returns a well-written, personalized pitch

### Step 2b.5 — Outreach Tracking System
- Create `outreach_campaigns` table: id, brief_id, supervisor_id, subject, body, status (draft/sent/opened/replied), sent_at
- Create `outreach_recipients` table: id, campaign_id, supervisor_id, email, status
- Build `POST /api/outreach/create`, `POST /api/outreach/send`, `GET /api/outreach/stats`
- **Files**: `supabase/007_outreach.sql`, `server.ts`
- **Verify**: CRUD on campaigns, send marks as sent

### Step 2b.6 — Replace AIPitch Tab with Real Pipeline
- Update admin `Dashboard.tsx` AIPitch tab:
  - "Initialize Cross-Match" → triggers semantic match against open briefs
  - Show matched briefs with scores
  - "Generate Pitch" → creates outreach campaign
  - Show campaign stats, open rates, response rates
- **Files**: `src/pages/admin/Dashboard.tsx`
- **Verify**: End-to-end: click match → see results → generate pitch → track outreach

### Step 2b.7 — DISCO Playlist Generation
- Build `POST /api/disco/playlist` that auto-creates DISCO CSV from matched tracks
- Include curated playlist name, track order, mood descriptions
- **Files**: `server.ts`
- **Verify**: Downloadable CSV with ranked tracks

### Step 2b.8 — Tests
- Unit tests for matching algorithm, pitch generation
- E2E tests for outreach flow
- **Verify**: `npm test` + `npx playwright test` pass

---

**Test Gate**: All previous tests + new matching/outreach tests pass. Demo: submit a mock brief → get ranked matches → generate pitch → see it in outreach campaigns.

---

## Phase 2c — Revenue Infrastructure

**Goal**: Stripe Connect payouts, self-serve sync licensing, subscription tiers.

**Estimated effort**: 5-7 steps

### Step 2c.1 — Stripe Connect Onboarding
- Add Stripe Connect account creation on artist signup/PRO registration
- Create `stripe_accounts` table: artist_id, stripe_account_id, onboarding_complete, payouts_enabled
- Build `POST /api/stripe/connect/onboard` — returns onboarding link
- Build webhook handler for `account.updated` to track completion status
- **Files**: `supabase/008_stripe.sql`, `server.ts`
- **Verify**: Artist clicks "Connect Stripe" → onboarding flow → account linked

### Step 2c.2 — Automated Payout Pipeline
- Update `royalty_statements` to trigger Stripe transfers when status = 'paid'
- Build `POST /api/stripe/payout` — creates transfer to connected account
- Update admin "Log New Placement" to auto-generate royalty statement + payout
- **Files**: `server.ts`, `src/pages/admin/Dashboard.tsx`
- **Verify**: Log a deal → royalty statement created → Stripe transfer initiated

### Step 2c.3 — Self-Serve Sync License Checkout
- Replace static license tiers on `TrackDetail.tsx` with live Stripe prices
- Create products in Stripe: Micro ($75), Creator ($200), Indie Film ($350), Standard ($750)
- Build checkout session per license type
- Add webhook handling for license purchases
- **Files**: `server.ts`, `src/pages/TrackDetail.tsx`
- **Verify**: Click "License" → Stripe checkout → purchase recorded

### Step 2c.4 — License PDF Generation
- Use a PDF generation lib (jsPDF or PDFKit on server) to auto-generate license PDFs
- Template: track title, licensee, license type, fee, terms, NcSound as admin
- Upload generated PDF to Supabase Storage, store URL in `license_pdf_url`
- **Files**: `server.ts` (new route), `src/lib/license-pdf.ts`
- **Verify**: Purchase a license → PDF generated → downloadable

### Step 2c.5 — Subscription Tiers
- Create subscription plans in Stripe: Artist Basic ($9.99/mo), Artist Pro ($29.99/mo), Supervisor ($19.99/mo)
- Build checkout for subscriptions
- Add role/permission gating based on subscription status
- **Files**: `server.ts`, `supabase/009_subscriptions.sql`
- **Verify**: Subscribe → role/permissions updated

### Step 2c.6 — Tests
- Stripe webhook test suite (mock Stripe events)
- E2E: purchase flow → PDF generation → payout pipeline
- **Verify**: `npm test` + `npx playwright test` pass

---

**Test Gate**: All previous tests pass. Demo: artist connects Stripe → admin logs a deal → 80/20 payout auto-transfers → artist sees it.

---

## Phase 2d — Distribution + Analytics

**Goal**: DDEX ERN 4.3 XML, full CWR 2.2 standard, real analytics dashboards.

**Estimated effort**: 5-7 steps

### Step 2d.1 — Full CWR 2.2 Standard Compliance
- Replace simplified NWN export with full CWR 2.2 format:
  - Header record (HDR), Agreement record (AGR), Work record (NWN), Writer records (WRI), Publisher records (PUB)
  - Proper field positions, delimiters, encoding
- Add ISWC lookup, IPI validation
- **Files**: `server.ts` (update `/api/integrations/cwr/generate`)
- **Verify**: Generated CWR validated against CWR 2.2 spec

### Step 2d.2 — DDEX ERN 4.3 XML Generation
- Build `POST /api/ddex/generate` that produces ERN 4.3 XML:
  - Release profile, Deal profile
  - Track listings, audio assets, cover art
  - Territorial exclusions, pricing
- Use template-based XML generation (no heavy lib needed)
- **Files**: `server.ts`, `src/lib/ddex.ts`
- **Verify**: Valid ERN 4.3 XML output with sample data

### Step 2d.3 — Real Analytics: Artist Dashboard
- Replace all dash (`—`) metrics on artist Insights tab with real queries:
  - Supervisor Plays: count from `track_plays`
  - Track Saves: count from `saved_tracks`
  - Brief Matches: count from brief matching results
  - Top Performing Tracks: from `platform_income` aggregation
- Use recharts for visual charts (line/bar/pie)
- **Files**: `src/pages/artist/Dashboard.tsx`, `src/components/charts/`
- **Verify**: Artist sees real performance data, charts render

### Step 2d.4 — Real Analytics: Admin Dashboard
- Replace ALL hardcoded mock numbers in admin:
  - Total Catalog: DB count
  - Active Artists: DB count
  - Supervisor Accounts: DB count
  - MTD Placements: deal count this month
  - Total Managed Fees: sum of sync_fee from deals
  - Active Cue Sheets: count of deals with cue_sheet_filed
  - Pending Payouts: sum of pending royalty_statements
- Add recharts trend chart (revenue over time, placements by month)
- **Files**: `src/pages/admin/Dashboard.tsx`
- **Verify**: All numbers are real, charts animate

### Step 2d.5 — Supervisor Engagement Tracking
- Build `GET /api/analytics/supervisors` returning:
  - Total supervisors, active this month
  - Brief open rates, response rates
  - Track save counts, download counts
  - Placement-to-brief ratio
- **Files**: `server.ts`
- **Verify**: Returns aggregate supervisor metrics

### Step 2d.6 — PRO Registration Automation
- Build CWR upload to MLC portal (SFTP placeholder)
- Build TuneRegistry API integration for ASCAP/BMI registration
- Wire `registrations` table to auto-submit on metadata validation pass
- **Files**: `server.ts`, `src/lib/tuneregistry.ts`
- **Verify**: Track passes validation → auto-registration triggered

### Step 2d.7 — Tests
- CWR spec compliance tests
- DDEX XML validation tests
- Analytics query tests (mock data → verify chart output)
- **Verify**: `npm test` + `npx playwright test` pass

---

**Test Gate**: Full regression suite passes. Admin dashboard shows ONLY real data (zero hardcoded mocks). CWR and DDEX outputs validate against their respective specs.

---

## Rollback Protocol

If any phase introduces regressions:
1. `git diff` to identify changed files
2. `git checkout -- <files>` to revert specific changes
3. Re-run tests to confirm regression fixed
4. Document the issue in `plans/ISSUES.md`

## Overall Verification

After all phases complete:
- `npm run lint` — 0 errors
- `npm test` — all unit tests pass
- `npx playwright test` — all 54+ E2E tests pass
- `npm run build` — production build succeeds
- Manual: navigate admin dashboard — no hardcoded mock data visible
- Manual: upload a track — metadata auto-detected
- Manual: submit a brief — semantic matches returned with rankings
- Manual: connect Stripe — payout pipeline works end-to-end
