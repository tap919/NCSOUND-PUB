# Deploy Checklist

## Pre-deploy

- [ ] All CI gates pass (typecheck, lint, test, build, e2e, security scan)
- [ ] Coverage meets thresholds (31/24/26/35)
- [ ] Supabase migrations applied (`supabase db push`)
- [ ] Environment variables set in production:
  - `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
  - `STRIPE_SECRET_KEY` + `VITE_STRIPE_PUBLISHABLE_KEY`
  - `GEMINI_API_KEY`
  - `RESEND_API_KEY`
  - `APP_URL`
- [ ] Stripe webhook endpoint configured in Stripe Dashboard
- [ ] Supabase Auth configured (email/password, redirect URLs)
- [ ] No open critical or high-severity defects
- [ ] Performance baseline recorded (`docs/testing/PERFORMANCE_LOG.md`)

## Deploy

- [ ] Build: `npm run build`
- [ ] Upload `dist/` and `dist/server.cjs` to hosting
- [ ] Start server with `node dist/server.cjs`
- [ ] Verify health endpoint: `GET /api/health` returns 200

## Post-deploy

- [ ] Smoke test: all public pages render (home, catalog, beat-store, about, agreement)
- [ ] Smoke test: artist/admin login redirects correctly
- [ ] Smoke test: API endpoints return expected responses
- [ ] Monitoring dashboards verify healthy metrics
- [ ] Rollback procedure documented and accessible
- [ ] Release tag created: `git tag v0.1.0 && git push --tags`
