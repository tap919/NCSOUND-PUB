# Sprint 1 Issues - Workflow Lockdown

Created as GitHub Issue Templates in `.github/ISSUE_TEMPLATE/`. Use these to create issues and track progress.

## Issue List

| Issue | Template | Owner | Status |
|-------|----------|-------|--------|
| Full Artist E2E Workflow | `sprint-1-artist-e2e.yml` | @artist-team | 🔄 In Progress |
| Supervisor Registration & Brief | `sprint-1-supervisor-e2e.yml` | @admin-team | ⬜ Open |
| Admin Approval/Triage E2E | `sprint-1-admin-e2e.yml` | @admin-team | 🔄 In Progress |
| 80%+ Coverage: Dashboards | `sprint-1-coverage-dashboards.yml` | @core-team | ⬜ Open |

## Completed This Sprint

### Infrastructure & Framework
- ✅ GitHub Issue Templates created (4 templates in `.github/ISSUE_TEMPLATE/`)
- ✅ E2E test framework verified: `e2e/auth.spec.ts` passes (17/21 tests, 4 skipped due to missing env vars)
- ✅ Supabase test seeding script: `scripts/seed.ts` + `npm run seed`
- ✅ Stripe test mode: `tests/e2e/test.mode` file triggers mock in `server.ts`

### New Tests Added
- ✅ `e2e/stripe.spec.ts` - Stripe checkout flow with mocked `/api/checkout`
- ✅ `e2e/admin-license-approval.spec.ts` - Admin approval workflow
- ✅ `src/__tests__/LicenseDoc.test.ts` - License PDF generation unit test
- ✅ `e2e/artist-workflow.spec.ts` - Artist workflow (blocked on seeded account auth)

### Verified Working
- ✅ CI gates: typecheck, lint, build, test, e2e all green
- ✅ Coverage: 35% statements / 39% lines (up from 2.7%)
- ✅ Build: `npm run build` completes reliably
- ✅ Stripe mock mode works in E2E via `test.mode` file

## Known Blockers
- **Seeded account auth**: `seed-test-accounts.sql` password hashes don't match Supabase verification. Login tests skipped in CI. Need to either:
  1. Fix SQL seed to use correct `crypt()` for Supabase
  2. Use Supabase Admin API to create test users in `global-setup.ts`
  3. Set `TEST_ARTIST_EMAIL`/`TEST_ARTIST_PASSWORD` env vars to real Supabase test users

## Next Steps for Sprint 1 Completion
1. Fix seeded account auth (highest priority)
2. Complete Artist E2E workflow test
3. Create Supervisor E2E test
4. Implement Dashboard coverage tests (target 80%)

## How to Create Issues
1. Go to **Issues → New Issue**
2. Select the appropriate template
3. Fill in details and assign owner
4. Add to **Sprint 1** project/milestone

## Tracking
Update the **Status** column above as issues move through:
- ⬜ Open
- 🔄 In Progress
- 👀 In Review
- ✅ Done

## Definition of Done
- All acceptance criteria met
- CI passes (typecheck, lint, test, e2e)
- Coverage report shows targets achieved
- Code reviewed and merged to `main`