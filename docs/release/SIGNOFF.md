# Release v0.1.0 — Sign-off

## Exit criteria (from SOFTWARE_TESTING_STANDARD.md)

| Criterion | Status | Evidence |
|---|---|---|
| No open critical defects | ✅ | All known bugs have regression tests; no open criticals |
| No known data-loss defects | ✅ | Write operations use validated schemas + Supabase transactions |
| No known security blockers | ✅ | RLS enabled on all tables; secrets gitignored; sanitizeError redacts keys; OWASP test suite passes |
| No known unbounded resource leaks | ✅ | GlobalPlayer cleanup; Home useEffect cleanup; rate limiter on API |
| Monitoring and alerting configured | ✅ | Health endpoint, error pattern docs, Supabase + Stripe dashboards |
| Release notes, support notes, and known limitations documented | ✅ | `docs/release/v0.1.0.md` |

## Sign-off checklist

- [x] **Engineering:** All CI gates pass, 295 tests passing, 32.19% coverage, build produces valid output, Supabase migrations applied
- [ ] **QA:** Manual exploratory pass by someone other than the author (requires human tester)
- [ ] **Product:** Feature completeness verified against requirements (requires product owner)
- [ ] **Release/Ops:** Deploy checklist executed, rollback tested, monitoring verified (requires ops)

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
