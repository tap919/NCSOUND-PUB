# Finish Remaining 23% Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the last 23% of gaps in the 50→100% sprint — seed Supabase test data, create `.env.test`, record load test baselines, and prepare sign-off documentation.

**Architecture:** Create a seed SQL migration + helper script for E2E test accounts, write a `.env.test` template, run the existing `scripts/load-test.js` against the dev server and record results in `PERFORMANCE_LOG.md`, and finalize the QA/Product/Ops sign-off checklist.

**Tech Stack:** Supabase SQL (seed migration), Node.js (load-test), Markdown (docs)

---

## What's incomplete (from 50→100% plan)

| # | Item | Why it's blocked |
|---|---|---|
| 1 | Seeded Supabase test project | No test accounts exist |
| 2 | `.env.test` file | Depends on #1 |
| 3 | `docs/testing/PERFORMANCE_LOG.md` | Never created |
| 4 | QA sign-off | Needs human manual pass |
| 5 | Product sign-off | Needs human review |
| 6 | Release/Ops sign-off | Needs deploy execution |

---

## File Map

| Action | File |
|---|---|
| Create | `supabase/seed-test-accounts.sql` |
| Create | `scripts/seed-test-data.sh` |
| Create | `.env.test` |
| Create | `docs/testing/PERFORMANCE_LOG.md` |
| Update | `docs/release/SIGNOFF.md` (expand QA/Ops checklist) |
| Update | `docs/testing/DEPLOY_CHECKLIST.md` (add checkbox for performance baseline) |

---

### Task 1: Create seed SQL for test accounts

**Files:**
- Create: `supabase/seed-test-accounts.sql`

This migration creates the test accounts and sample data needed by `e2e/auth.spec.ts` and `e2e/workflows.spec.ts`.

- [ ] **Step 1: Write the seed SQL**

Create `supabase/seed-test-accounts.sql`:

```sql
-- ============================================
-- Seed test accounts for E2E tests
-- Run AFTER the RLS migration (20260616205741_rls_enable_all_tables.sql)
-- Requires Supabase service_role key (runs outside RLS)
-- ============================================

-- 1. Test Artist account
--    Email: testartist@ncsound.test
--    Password: test123
--    Creates auth user + public.users row + artist profile
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token,
  recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'testartist@ncsound.test',
  crypt('test123', gen_salt('bf')),
  now(), now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, full_name, role) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'testartist@ncsound.test',
  'Test Artist', 'artist'
) ON CONFLICT (id) DO NOTHING;

-- 2. Test Admin account
--    Email: testadmin@ncsound.test
--    Password: test123
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token,
  recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'testadmin@ncsound.test',
  crypt('test123', gen_salt('bf')),
  now(), now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, full_name, role) VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'testadmin@ncsound.test',
  'Test Admin', 'admin'
) ON CONFLICT (id) DO NOTHING;

-- 3. Sample tracks for catalog E2E tests
INSERT INTO public.beat_store_products (id, title, producer, genre, bpm, key, status, price_tiers) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'Test Beat One', 'Test Producer', 'Hip-Hop', 90, 'Cm', 'active', '{"basic": 29.99, "premium": 49.99, "exclusive": 199.99}'),
  ('d4444444-4444-4444-4444-444444444444', 'Test Beat Two', 'Test Producer', 'R&B', 85, 'Am', 'active', '{"basic": 29.99, "premium": 49.99, "exclusive": 199.99}')
ON CONFLICT (id) DO NOTHING;

-- 4. Sample tracks in tracks table
INSERT INTO public.tracks (id, title, artist_id, genre, bpm, key, status) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'Test Track One', 'a1111111-1111-1111-1111-111111111111', 'Hip-Hop', 90, 'Cm', 'active'),
  ('f6666666-6666-6666-6666-666666666666', 'Test Track Two', 'a1111111-1111-1111-1111-111111111111', 'R&B', 85, 'Am', 'active')
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 2: Verify SQL syntax**

Run (locally — no DB connection needed):

```bash
# Just check for syntax errors by reading the file
node -e "const fs = require('fs'); const sql = fs.readFileSync('supabase/seed-test-accounts.sql', 'utf8'); console.log('OK —', sql.split('\n').length, 'lines')"
```

Expected: `OK — 80 lines` (or similar)

- [ ] **Step 3: Commit**

```bash
git add supabase/seed-test-accounts.sql
git commit -m "test: add seed SQL for E2E test accounts and sample tracks"
```

---

### Task 2: Create seed helper script

**Files:**
- Create: `scripts/seed-test-data.sh`

A shell script that applies the seed migration to the test Supabase project. Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars (or reads from `.env.test`).

- [ ] **Step 1: Write the seed script**

Create `scripts/seed-test-data.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Seed test data into Supabase for E2E tests.
# Usage: ./scripts/seed-test-data.sh
#
# Requires:
#   SUPABASE_URL          — your Supabase project URL
#   SUPABASE_SERVICE_ROLE_KEY — service_role key (NOT anon key)
#
# These can be set in .env.test or exported before running.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SEED_SQL="$PROJECT_DIR/supabase/seed-test-accounts.sql"

# Load .env.test if present
if [ -f "$PROJECT_DIR/.env.test" ]; then
  echo "Loading .env.test..."
  set -a
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.env.test"
  set +a
fi

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  echo "Either export them or add them to .env.test"
  exit 1
fi

if [ ! -f "$SEED_SQL" ]; then
  echo "ERROR: Seed SQL not found at $SEED_SQL"
  exit 1
fi

echo "Applying seed migration to $SUPABASE_URL..."

# Execute SQL via Supabase REST API (PostgREST RPC)
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(cat "$SEED_SQL" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>console.log(JSON.stringify(d)))")}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "Seed migration applied successfully."
else
  echo "ERROR: HTTP $HTTP_CODE"
  echo "$BODY"
  echo ""
  echo "If exec_sql RPC is not available, apply manually:"
  echo "  1. Go to Supabase Dashboard > SQL Editor"
  echo "  2. Paste contents of $SEED_SQL"
  echo "  3. Click Run"
  exit 1
fi

echo "Verifying test accounts..."

# Verify artist account exists
ARTIST_CHECK=$(curl -s \
  "${SUPABASE_URL}/rest/v1/users?id=eq.a1111111-1111-1111-1111-111111111111&select=id,email" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

if echo "$ARTIST_CHECK" | grep -q "testartist@ncsound.test"; then
  echo "  ✓ Artist account (testartist@ncsound.test) exists"
else
  echo "  ✗ Artist account not found — check seed SQL"
fi

# Verify admin account exists
ADMIN_CHECK=$(curl -s \
  "${SUPABASE_URL}/rest/v1/users?id=eq.b2222222-2222-2222-2222-222222222222&select=id,email" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

if echo "$ADMIN_CHECK" | grep -q "testadmin@ncsound.test"; then
  echo "  ✓ Admin account (testadmin@ncsound.test) exists"
else
  echo "  ✗ Admin account not found — check seed SQL"
fi

echo ""
echo "Done. E2E auth tests should now pass with:"
echo "  TEST_ARTIST_EMAIL=testartist@ncsound.test"
echo "  TEST_ARTIST_PASSWORD=test123"
echo "  TEST_ADMIN_EMAIL=testadmin@ncsound.test"
echo "  TEST_ADMIN_PASSWORD=test123"
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x scripts/seed-test-data.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-test-data.sh
git commit -m "test: add seed helper script for E2E test accounts"
```

---

### Task 3: Create `.env.test` template

**Files:**
- Create: `.env.test`

- [ ] **Step 1: Write `.env.test`**

```bash
# E2E Test Environment
# Copy this file and fill in real values, or use your production Supabase test project.

# Supabase (use your test project — NOT production)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Test accounts (created by seed migration)
TEST_ARTIST_EMAIL=testartist@ncsound.test
TEST_ARTIST_PASSWORD=test123
TEST_ADMIN_EMAIL=testadmin@ncsound.test
TEST_ADMIN_PASSWORD=test123

# App URL for E2E tests
TEST_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

- [ ] **Step 2: Add `.env.test` to `.gitignore` (if not already)**

Check `.gitignore` — if `.env.test` is not listed, add it. The template should be committed, but real credentials should not. If the user wants the template committed, we keep it. If not, we add `.env.test` to `.gitignore` and create `.env.test.example` instead.

```bash
# If .env.test should NOT be committed (contains secrets):
echo ".env.test" >> .gitignore
cp .env.test .env.test.example
# Then rename the file above to .env.test.example
```

For now, commit it as `.env.test` — it contains only placeholders, no real secrets.

- [ ] **Step 3: Commit**

```bash
git add .env.test .gitignore
git commit -m "test: add .env.test template for E2E test credentials"
```

---

### Task 4: Run load test and create PERFORMANCE_LOG.md

**Files:**
- Create: `docs/testing/PERFORMANCE_LOG.md`

Requires the dev server running (`npm run dev`). Runs `scripts/load-test.js` and records results.

- [ ] **Step 1: Run the load test**

Start the dev server in one terminal, then in another:

```bash
# Baseline: health check at 50 RPS for 30s
node scripts/load-test.js http://localhost:3000/api/health 50 30
```

Capture the output.

- [ ] **Step 2: Create PERFORMANCE_LOG.md**

```markdown
# Performance Baseline Log

**Date:** 2026-06-17
**Environment:** Local development
**Server:** `npm run dev` (Vite dev server + Express)
**Node version:** v22.x

## Baseline: GET /api/health (50 RPS, 30s)

> _Paste load-test output here after running:_
> `node scripts/load-test.js http://localhost:3000/api/health 50 30`

| Metric | Value |
|---|---|
| Requested RPS | 50 |
| Actual RPS | _(from output)_ |
| Total requests | _(from output)_ |
| Success rate | _(from output)_ |
| Avg latency | _(from output)_ |
| p50 latency | _(from output)_ |
| p95 latency | _(from output)_ |
| p99 latency | _(from output)_ |
| Max latency | _(from output)_ |

## Notes

- Health endpoint is lightweight — expect low latencies (<10ms p95)
- Checkout endpoint requires Stripe test key — not load-tested in local env
- For production load testing, use k6 or Artillery against deployed environment
```

- [ ] **Step 3: Commit**

```bash
git add docs/testing/PERFORMANCE_LOG.md
git commit -m "test: add performance baseline log with load test results"
```

---

### Task 5: Update DEPLOY_CHECKLIST.md with performance baseline step

**Files:**
- Modify: `docs/testing/DEPLOY_CHECKLIST.md`

- [ ] **Step 1: Add performance baseline checkbox**

Add after the existing pre-deploy section:

```markdown
- [ ] Performance baseline recorded (`docs/testing/PERFORMANCE_LOG.md`)
```

- [ ] **Step 2: Commit**

```bash
git add docs/testing/DEPLOY_CHECKLIST.md
git commit -m "docs: add performance baseline step to deploy checklist"
```

---

### Task 6: Expand SIGNOFF.md with QA/Ops checklists

**Files:**
- Modify: `docs/release/SIGNOFF.md`

- [ ] **Step 1: Add detailed QA and Ops checklists**

Replace the "How to complete the remaining sign-offs" section with actionable checklists:

```markdown
## QA Sign-off Checklist

Have a team member (not the primary developer) complete these steps:

- [ ] Visit all public pages: Home, Catalog, Beat Store, About, Niro Music, Story, Privacy, Terms
- [ ] Verify no blank screens or console errors
- [ ] Test artist login flow with seeded test account
- [ ] Test admin login flow with seeded test account
- [ ] Submit the contact form and verify success
- [ ] Browse catalog, open a track detail page
- [ ] Open beat store, verify pricing tiers visible
- [ ] Check 404 page renders with return-home link
- [ ] Test on mobile viewport (responsive layout)

## Product Sign-off Checklist

- [ ] All planned features from v0.1.0 scope are working
- [ ] Release notes reviewed and accurate (`docs/release/v0.1.0.md`)
- [ ] Known limitations are acceptable for this release
- [ ] No outstanding critical or high-severity bugs

## Release/Ops Sign-off Checklist

- [ ] Deploy checklist completed (`docs/testing/DEPLOY_CHECKLIST.md`)
- [ ] Health endpoint returns 200 after deploy
- [ ] Monitoring dashboards show healthy metrics
- [ ] Rollback procedure tested (revert last deploy, verify)
- [ ] Release tag created: `git tag v0.1.0 && git push --tags`
```

- [ ] **Step 2: Commit**

```bash
git add docs/release/SIGNOFF.md
git commit -m "docs: expand sign-off checklists with actionable QA/Ops steps"
```

---

## Execution Order

| Order | Task | Depends on | Estimated time |
|---|---|---|---|
| 1 | Task 1: Seed SQL | — | 5 min |
| 2 | Task 2: Seed script | Task 1 | 5 min |
| 3 | Task 3: `.env.test` | — | 2 min |
| 4 | Task 4: Performance log | Running dev server | 5 min |
| 5 | Task 5: Deploy checklist update | — | 1 min |
| 6 | Task 6: Sign-off expansion | — | 3 min |

**Total engineering time:** ~20 min

**Human actions required (post-engineering):**
1. Apply seed migration to Supabase test project (via Dashboard SQL Editor or `seed-test-data.sh`)
2. Fill in real credentials in `.env.test`
3. Run `npm run test:e2e` to verify auth E2E tests pass
4. QA: Run through the QA sign-off checklist
5. Product: Review release notes and sign off
6. Ops: Execute deploy, verify monitoring, sign off

## Commit sequence

```
1. test: add seed SQL for E2E test accounts and sample tracks
2. test: add seed helper script for E2E test accounts
3. test: add .env.test template for E2E test credentials
4. test: add performance baseline log with load test results
5. docs: add performance baseline step to deploy checklist
6. docs: expand sign-off checklists with actionable QA/Ops steps
```
