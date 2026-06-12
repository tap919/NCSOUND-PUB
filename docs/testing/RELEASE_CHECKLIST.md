# Release Checklist

## Pre-Release

### Code quality
- [ ] `npm run lint` passes (tsc --noEmit)
- [ ] `npm run test` passes (Vitest)
- [ ] `npm run test:e2e` passes (Playwright)
- [ ] No hardcoded secrets committed
- [ ] `.env.example` up to date with all required vars

### Testing
- [ ] Unit tests written for all changed code
- [ ] Integration tests cover changed boundaries
- [ ] Regression test added for every bug fix since last release
- [ ] E2E smoke pack passes
- [ ] Error handling reviewed for new features

### Documentation
- [ ] README updated if behavior changed
- [ ] DEPLOY.md updated if deployment steps changed
- [ ] Environment variables documented in `.env.example`

### Infrastructure
- [ ] Build runs cleanly (`npm run build`)
- [ ] CI pipeline passed on latest commit
- [ ] Supabase migrations applied

## Release

- [ ] Version bumped (if applicable)
- [ ] Tag created
- [ ] Release notes drafted
- [ ] Smoke test after deploy

## Post-Release

- [ ] Monitoring verified
- [ ] Known limitations documented
- [ ] Test completion records filed

## Sign-off

- **Product:** NcSound Publishing
- **Engineering owner:** __________________
- **QA owner:** __________________
- **Date:** __________________
