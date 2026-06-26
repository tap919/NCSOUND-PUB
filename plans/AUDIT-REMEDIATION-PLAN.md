# NcSound Publishing — Audit Remediation Implementation Plan

**Generated:** 2026-06-26
**Source:** Full codebase audit (unit tests, typecheck, lint, build, security, infrastructure)
**Current readiness:** 78%
**Target readiness:** 95%+
**Total items:** 45 (12 already done, 33 need work)

---

## Execution Overview

```
Batch 1 (XS Quick Wins)          ~30 min    → 12 items
Batch 2 (S Fixes)                ~2h        → 8 items
Batch 3 (M/L Refactors)          ~3h        → 5 items
Batch 4 (Security & Infra)       ~2h        → 8 items
```

**Dependencies:** None between batches. All batches can run in parallel.
**Exception:** Batch 3 items (Q4/Q5) create new server endpoints that benefit from Q3 (Gemini hoist).

---

## BATCH 1 — XS Quick Wins (12 items, ~30 min)

All changes are isolated single-line or few-line edits.

### 1.1 Fix 4 Failing Tests
**Problem:** Admin empty-state tests timeout — components render `Loading...` indefinitely because the Supabase mock chain doesn't resolve properly for `.select().order()`.
**Files:**
- `src/pages/admin/__tests__/Briefs.test.tsx`
- `src/pages/admin/__tests__/Inbox.test.tsx`
- `src/pages/admin/__tests__/LicenseRequests.test.tsx`
- `src/pages/admin/__tests__/SupervisorRequests.test.tsx`
**Fix:** Replace `waitFor(() => expect(...).toBeVisible())` with `findByText()` which auto-waits, or fix the Supabase mock to return `{ data: [], error: null }` on `.order()` chain. All 4 files use the same mock pattern — the Proxy mock intercepts all property access as `() => self` but the `then` on the resolved chain must return the data. The issue is the mock's `then` method — when the component `await`s the query, the promise resolves to `self` (the Proxy) rather than `{ data: [], error: null }`.
**Verify:** `npx vitest run` — 0 failures

### 1.2 Fix Playwright TypeScript Error
**Problem:** `test.skip('string')` — first arg must be boolean.
**File:** `e2e/admin-license-approval.spec.ts:26`
**Fix:** Change to `test.skip()` (already inside `if` block, skip is unconditional).
**Verify:** `npx tsc --noEmit` — 0 errors

### 1.3 Fix Webhook Error Status (H14)
**Problem:** Stripe Connect webhook returns 200 when not configured, preventing Stripe retries.
**File:** `server.ts:1733`
**Fix:** Change `return res.status(200).send()` to `return res.status(503).json({ error: 'Stripe not configured' })`

### 1.4 Fix Silent Catch with Fake Data (H13)
**Problem:** Credits endpoint silently returns `{ monthly_limit: 3, credits_used: 0, remaining: 3 }` on error — clients see fake data.
**File:** `server.ts:2264-2267`
**Fix:** Change to `res.status(500).json({ error: 'Credits lookup failed' })`

### 1.5 Add audio-decode Type Declaration (M12)
**Problem:** `audio-decode` imported as `any`, losing type safety.
**File:** `server.ts:418-423`
**Fix:** Create `src/types/audio-decode.d.ts`:
```ts
declare module 'audio-decode' {
  function decode(data: Uint8Array): Promise<{
    channelData: Float32Array[];
    sampleRate: number;
    getChannelData: (ch: number) => Float32Array;
  }>;
  export default decode;
}
```
Remove `: any` casts from `decodeModule` and `audioDataDecoded`.

### 1.6 Extract Error Truncation Constant (M13)
**Problem:** Magic number 300 in error truncation.
**File:** `src/lib/sanitize.ts:14`
**Fix:** Add `const MAX_ERROR_LENGTH = 500;` at top, replace `300` with the constant.

### 1.7 Fix Empty Spotify clientId (M14)
**Problem:** `getSpotifyAuthUrl` uses empty string for `clientId`.
**File:** `src/lib/integrations.ts:242`
**Fix:** Change to `const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';` and add `VITE_SPOTIFY_CLIENT_ID=` to `.env.example`.

### 1.8 Verify Already-Done Items (6 items)
These were identified as already complete during audit. Mark them done:
- **H3:** Stripe instances — already using `stripeModule` everywhere (`server.ts:73` is only `new Stripe()`)
- **H7:** SPA catch-all — `/api/*` 404 handler present (`server.ts:2407-2409`)
- **H8:** Robots.txt — already using `process.env.APP_URL` (`server.ts:675-678`)
- **M2:** Sitemap — `/roster/soulyghost` already present (`server.ts:662`)
- **E-H10:** Auto-play — no `playTrack()` call in Home.tsx mount effect
- **E-H11:** Duplicate nav — no Roster entry in Layout.tsx navigation array
- **D-H9:** Email — already using `process.env.APP_URL`, no `window` reference
- **H-L1:** Footer admin link — already conditional on `role === 'admin'`
- **H-L10:** SkipLink — already rendered in Layout.tsx with `id="main-content"` target
- **M7:** type="button" — all buttons across 13 files already have proper attributes
- **M9:** clean script — `package.json:14` already targets `server.cjs`

---

## BATCH 2 — S Fixes (8 items, ~2h)

### 2.1 Move 80/20 Split to Environment (M8)
**Problem:** Revenue split hardcoded in `src/lib/constants.ts`.
**Files:**
- `src/lib/constants.ts:1-4`
- `.env.example` (add `NCSOUND_SPLIT=0.20`)
**Fix:**
```ts
// src/lib/constants.ts
const split = parseFloat(process.env.NCSOUND_SPLIT || '0.20');
export const SPLIT = {
  ARTIST: 1 - split,
  NCSOUND: split,
};
```
Add validation: `if (split <= 0 || split >= 1) throw new Error('NCSOUND_SPLIT must be between 0 and 1');`

### 2.2 Home Page Live Stats (M11)
**Problem:** Stats hardcoded as "14 tracks, 3 artists" on `src/pages/Home.tsx:218-236`.
**Fix:** Add `useState` + `useEffect` to fetch live counts from Supabase:
```tsx
const [stats, setStats] = useState({ tracks: 0, artists: 0 });
useEffect(() => {
  (async () => {
    const [tracksRes, artistsRes] = await Promise.all([
      supabase.from('tracks').select('*', { count: 'exact', head: true }),
      supabase.from('artists').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ tracks: tracksRes.count || 0, artists: artistsRes.count || 0 });
  })();
}, []);
```
Replace `"14"` → `{stats.tracks || '—'}` and `"3"` → `{stats.artists || '—'}`.

### 2.3 Hoist Gemini Client to Startup (Q3)
**Problem:** `new GoogleGenAI()` instantiated on every request in `server.ts`.
**File:** `server.ts:298-299` (and 354-355, 2169-2170)
**Fix:** Create a singleton at module level:
```ts
let geminiClient: InstanceType<typeof GoogleGenAI> | null = null;
function getGemini() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}
```
Replace `new GoogleGenAI({ apiKey })` calls with `getGemini()`. Guard endpoints with `if (!ai) return res.status(500).json({ error: 'Gemini not configured' })`.

### 2.4 Analytics Pagination (H12)
**Problem:** Admin analytics fetches up to 10,000 rows from 3 tables into memory.
**File:** `server.ts:2097-2104`
**Fix:** Add `.limit(1000)` to `dealsRes`, `statementsRes`, `incomeRes`. Better: use `count: 'exact', head: true` for counts and only fetch last 100 rows for recent data:
```ts
const [tracksRes, artistsRes, supervisorsRes, dealsRes, statementsRes, incomeRes] = await Promise.all([
  supabaseClient.from('tracks').select('*', { count: 'exact', head: true }),
  supabaseClient.from('artists').select('*', { count: 'exact', head: true }),
  supabaseClient.from('supervisors').select('*', { count: 'exact', head: true }),
  supabaseClient.from('deals').select('sync_fee').limit(1000),
  supabaseClient.from('royalty_statements').select('net_payout, status').limit(1000),
  supabaseClient.from('income_summary').select('net_amount').limit(1000),
]);
```

### 2.5 Fix Playwright E2E Skip Syntax (already covered in 1.2)
Mark as done in this batch.

### 2.6 Add Missing RLS Policies (Security)
**Problem:** `agreements` and `beat_store_products` have no RLS policies.
**File:** `supabase/migrations/20260616205741_rls_enable_all_tables.sql` (or new migration)
**Fix:** Add RLS policies:
```sql
-- agreements: only admin can read, owner can insert
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read_agreements" ON agreements FOR SELECT USING (public.is_admin());
CREATE POLICY "admin_insert_agreements" ON agreements FOR INSERT WITH CHECK (public.is_admin());

-- beat_store_products: public read for active products, owner write
ALTER TABLE beat_store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_active_beats" ON beat_store_products FOR SELECT USING (status = 'active');
CREATE POLICY "artist_manage_own_beats" ON beat_store_products FOR ALL USING (artist_id = auth.uid());
```

### 2.7 Add Database Indexes
**Problem:** No indexes on commonly queried columns.
**File:** New migration or append to existing
**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_deals_brief_id ON deals(brief_id);
CREATE INDEX IF NOT EXISTS idx_beat_store_products_artist_id ON beat_store_products(artist_id);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_created_at ON royalty_statements(created_at);
```

### 2.8 Add PWA Manifest Improvements (L6)
**Problem:** Manifest has JPEG icon, no 512x512, no description.
**File:** `public/manifest.json`
**Fix:** Add fields:
```json
{
  "name": "NcSound Publishing",
  "short_name": "NcSound",
  "description": "Sync licensing platform for independent artists",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#050505",
  "theme_color": "#f97316",
  "icons": [
    { "src": "/assets/brand/ncsound-logo.jpg", "sizes": "192x192", "type": "image/jpeg", "purpose": "any" },
    { "src": "/assets/brand/ncsound-logo.jpg", "sizes": "512x512", "type": "image/jpeg", "purpose": "any maskable" }
  ]
}
```

---

## BATCH 3 — M/L Refactors (5 items, ~3h)

### 3.1 License Endpoint Rename (M1)
**Problem:** `/api/license/doc` generates HTML but implies PDF.
**File:** `server.ts:1823-1886`
**Fix (quick):** Rename endpoint to `/api/license/agreement` and update content-type to `text/html` explicitly. Update all client references.
**Fix (full):** Install `pdf-lib`, generate real PDF buffer, upload as `application/pdf`. Template already exists as HTML — convert to PDF layout.

### 3.2 Gemini Client-to-Server Refactor (Q4/Q5)
**Problem:** Client code calls `/api/gemini` proxy; should be server-only endpoints.
**Files:**
- `src/lib/analyze.ts` (client calls `/api/gemini` for classification)
- `src/lib/embeddings.ts` (client calls `/api/gemini` for embeddings)
- `server.ts` (create dedicated endpoints)
**Fix:**
1. Create `POST /api/analyze/classify` on server — takes track metadata, calls Gemini, returns classification
2. Create `POST /api/analyze/embed` on server — takes text, returns embedding vector
3. Update `src/lib/analyze.ts` to call `/api/analyze/classify` instead of `/api/gemini`
4. Update `src/lib/embeddings.ts` to call `/api/analyze/embed` instead of `/api/gemini`
5. Remove the generic `/api/gemini` proxy endpoint (or keep for backward compat with deprecation warning)

### 3.3 Dashboard Sub-Component Extraction (L2)
**Problem:** `src/pages/admin/Dashboard.tsx` is 337 lines with 3 inline sub-components and 6 inline tab blocks.
**File:** `src/pages/admin/Dashboard.tsx`
**Fix:** Extract to `src/components/admin/dashboard/`:
- `MLCTab.tsx` (lines 94-142)
- `PROTab.tsx` (lines 145-168)
- `DDEXTab.tsx` (replace `LiveDdexPanel`)
- `DealsTab.tsx` (replace `LiveDealsPanel`)
- `RecordsTab.tsx` (lines 174-207)
- `MetricsTab.tsx` (replace `LiveMetricsPanel`)
Update `TABS` map to reference new components.

### 3.4 Service Worker Enhancement (L6)
**Problem:** Minimal SW with no cache versioning.
**Files:** `public/sw.js`, `src/main.tsx`
**Fix:** Add cache versioning and static asset strategy:
```js
const CACHE_NAME = 'ncsound-v1';
const STATIC_ASSETS = ['/', '/catalog', '/beat-store', '/about'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
```

### 3.5 Dockerfile Improvements
**Problem:** Runs as root, no `.dockerignore`, deprecated `--only=production`.
**Files:** `Dockerfile`, `.dockerignore` (new)
**Fix:**
```dockerfile
# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
USER appuser
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "dist/server.cjs"]
```

```
# .dockerignore
node_modules/
dist/
.env
.env.*
coverage/
test-results/
playwright-report/
.git/
AgentBrowser-main/
*.md
plans/
docs/
```

---

## BATCH 4 — Security & Infrastructure (8 items, ~2h)

### 4.1 Rotate All Live Keys (CRITICAL)
**Problem:** `.env` contains live production Stripe keys, Supabase service role, Gemini API key, Resend key. These must be rotated before any public deployment.
**Files:** All provider dashboards
**Fix:**
1. Generate new Stripe keys (publishable + secret)
2. Rotate Supabase service role key
3. Rotate Gemini API key
4. Rotate Resend API key
5. Update `.env` with new keys
6. Update hosting platform env vars
7. Update `KEY-ROTATION.md` with rotation dates

### 4.2 Add ADMIN_API_KEY Audit Logging (Auth Security)
**Problem:** `ADMIN_API_KEY` bypass in `src/middleware/auth.ts` has no logging.
**File:** `src/middleware/auth.ts`
**Fix:** Add logging when API key is used:
```ts
if (adminApiKey && req.headers['x-api-key'] === adminApiKey) {
  console.warn(`[AUTH] Admin API key used from ${req.ip} at ${new Date().toISOString()}`);
  return next();
}
```

### 4.3 Add Structured Logging
**Problem:** MONITORING.md specifies structured JSON logging but server uses `console.log/error`.
**File:** `server.ts`
**Fix:** Create `src/lib/logger.ts`:
```ts
export function log(level: string, message: string, meta?: Record<string, unknown>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }));
}
```
Replace `console.log`/`console.error` calls in `server.ts` with `log('info', ...)` / `log('error', ...)`.

### 4.4 Add Rate Limiting to Auth Middleware
**Problem:** No rate limiting on auth attempts.
**File:** `src/middleware/auth.ts`
**Fix:** Add `express-rate-limit` to auth endpoints:
```ts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many authentication attempts' },
});
app.use('/api/auth', authLimiter);
```

### 4.5 Update .gitignore for .env Safety
**Problem:** `.env` is tracked (contains live keys).
**File:** `.gitignore`
**Fix:** Ensure `.env` is in `.gitignore`:
```
.env
.env.local
.env.*.local
```
Run `git rm --cached .env` to untrack without deleting.

### 4.6 Add Updated-At Trigger
**Problem:** `updated_at` columns exist but never auto-update.
**File:** New migration
**Fix:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ... (repeat for all tables)
```

### 4.7 Fix track_writers RLS
**Problem:** `track_writers` has `FOR SELECT USING (true)` — writer PII publicly readable.
**File:** `supabase/migrations/20260616205741_rls_enable_all_tables.sql` (or new migration)
**Fix:**
```sql
DROP POLICY IF EXISTS "public_read_track_writers" ON track_writers;
CREATE POLICY "track_writers_own_data" ON track_writers FOR SELECT
  USING (track_id IN (SELECT id FROM tracks WHERE artist_id = auth.uid()));
CREATE POLICY "admin_read_track_writers" ON track_writers FOR SELECT
  USING (public.is_admin());
```

### 4.8 Add Sentry Error Tracking
**Problem:** No error tracking configured.
**Files:** `server.ts`, `src/main.tsx`
**Fix:**
```ts
// server.ts
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });

// src/main.tsx
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: import.meta.env.MODE });
```
Add `SENTRY_DSN` and `VITE_SENTRY_DSN` to `.env.example`.

---

## Verification Checklist

After all batches complete:

| Check | Command | Expected |
|-------|---------|----------|
| Typecheck | `npx tsc --noEmit` | 0 errors |
| Lint | `npx eslint .` | 0 errors (warnings OK) |
| Unit tests | `npx vitest run` | 0 failures, 340+ pass |
| Coverage | `npx vitest run --coverage` | Statements ≥31%, Branches ≥24% |
| Build | `npx vite build` | Success, no hangs |
| Docker build | `docker build .` | Image builds successfully |
| E2E | `npx playwright test` | All 318 tests pass |
| Security | `.env` not in git | `git ls-files .env` returns empty |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Fixing tests breaks mocks | 4 tests still fail | Verify mock chain resolution before/after |
| RLS migration breaks app | Data access errors | Test against staging Supabase before prod |
| Gemini refactor breaks AI features | AI classification unavailable | Keep `/api/gemini` as fallback during transition |
| Key rotation breaks integrations | Services stop working | Rotate one at a time, verify each |
| Service worker caching stale assets | Users see old version | Use cache-busting filenames via Vite |
