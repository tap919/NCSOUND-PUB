# Deployment Guide

High-level deployment guide for NcSound Publishing.
For deeper operational details, see:
- [docs/testing/OPERATIONAL_READINESS.md](testing/OPERATIONAL_READINESS.md)
- [docs/testing/DEPLOY_CHECKLIST.md](testing/DEPLOY_CHECKLIST.md)
- [docs/operations/MONITORING.md](operations/MONITORING.md)
- [docs/KEY-ROTATION.md](KEY-ROTATION.md)

## 1. Prerequisites

- **Node.js** ≥ 20 (`engines` in `package.json`)
- **npm** ≥ 10
- A Supabase project (URL + anon key + service-role key)
- Stripe account (publishable + secret keys, webhook secret)
- Google Gemini API key
- Resend API key (transactional email)
- Sentry DSN (optional, error tracking)
- A reverse proxy / TLS terminator (Caddy, nginx, Cloudflare, etc.)

## 2. Environment Variables

Place these in `.env` (development) or your platform's secret store (production):

```bash
# Core
NODE_ENV=production
APP_URL=https://app.ncsound.example.com

# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only

# Auth
ADMIN_API_KEY=...               # server-only; grants admin via X-API-Key

# AI
GEMINI_API_KEY=...

# Payments
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_CONNECT_CLIENT_ID=...

# Email
RESEND_API_KEY=...

# Optional
SENTRY_DSN=...
```

Never commit `.env`. Rotate keys per [KEY-ROTATION.md](KEY-ROTATION.md).

## 3. Build

```bash
npm ci                  # install locked deps
npm run lint            # typecheck + eslint + npm audit
npm run test:unit       # unit + integration tests
npm run build           # vite build + esbuild bundle → dist/server.cjs
```

The build emits:
- Static frontend → `dist/public/`
- Server bundle → `dist/server.cjs`

## 4. Run

```bash
node dist/server.cjs    # production start
```

For local dev with HMR:
```bash
npm run dev
```

## 5. Reverse Proxy

Terminate TLS upstream and forward to the Node process on `localhost:3000`.
Set these response headers:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

Helmet (`helmet` middleware) sets most defaults; tune as needed for your CSP.

## 6. Storage Buckets

Create these Supabase Storage buckets:

| Bucket              | Purpose                                  |
|---------------------|------------------------------------------|
| `cwr-exports`       | CWR export text files (see `API.md`)     |
| `track-uploads`     | Original track uploads (signed URLs)     |
| `track-stems`       | Stems + remixes                          |

## 7. Health Check & Monitoring

- Health endpoint: `GET /api/health` (rate-limited)
- Configure your platform to scrape it
- Sentry captures unhandled errors and slow traces
- Logs are JSON via `pino` — ship to your log aggregator

See [docs/operations/MONITORING.md](operations/MONITORING.md) for alerts + SLOs.

## 8. Verification

After deploying:

```bash
# Liveness
curl -fsS https://app.ncsound.example.com/api/health

# E2E (requires live env vars — see .env.test.example)
npm run test:e2e

# Load test (requires k6)
TEST_URL=https://app.ncsound.example.com npm run load:test
```

If anything fails, refer to [docs/testing/REGRESSION_LOG.md](testing/REGRESSION_LOG.md).