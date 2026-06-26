# Security Sprint — Design Spec

> **Objective:** Close all CRITICAL (C1-C6) and select HIGH/MEDIUM (H1, H2, H4, H5, H14, M5, M6) security audit findings. Key rotation handled by human.

## Covers

| # | Issue | What we do | Blocks on human? |
|---|---|---|---|
| C1-C3, C5 | Live keys committed | Update `.gitignore`, `.env.example`, add BFG instructions. Human must rotate keys in dashboards and run BFG | Partial — human rotates + runs BFG |
| C4 | No auth on API endpoints | Add Supabase JWT session middleware to protect all `/api/*` routes (except health, webhook) | No |
| C6 | LLM prompt injection | Sanitize `prompt` before Gemini — reject control chars, length limit, null guard | No |
| H1 | CORS wildcard fallback | Replace `'*'` with `APP_URL \|\| 'http://localhost:3000'`, warn if unset in prod | No |
| H2 | Webhook no rate limit | Add `whLimiter` (60 req/min) separate from general API limiter | No |
| H4 | Gemini key truthy check | Validate key format on startup, log warning if missing | No |
| H5 | `missingFields` wrong import | Fix import to use `sanitizeError` from the correct source, remove duplicate declaration | No |
| H14 | Webhook always returns 200 | Return 4xx/5xx on failures so Stripe retries | No |
| M5 | Rate limiter permissive | Lower Gemini to 10 req/min, add webhook limiter | No |
| M6 | No input validation on server | Add Zod schemas for POST/PUT endpoints (checkout, contact, email, agent chat) | No |

## Approach

### Batch A: Git hygiene (.gitignore + .env.example)

No code changes — just config:
- Confirm `.env` is in `.gitignore` (and not tracked)
- Add BFG instructions to `docs/release/SECURITY_KEYS_ROTATION.md`
- Scrub any real-looking placeholder values from `.env.example`

### Batch B: API Auth Middleware

Create `src/middleware/auth.ts`:
```ts
- Extract session from Authorization header (Bearer token)
- Verify with supabase.auth.getUser(token)
- Reject 401 if invalid/expired
- Optionally check role claim for admin endpoints
```

Apply to `server.ts`:
```ts
import { requireAuth, requireRole } from './middleware/auth';
app.use('/api/', requireAuth);
// Exceptions: health, webhook, login routes
```

Protected endpoints after:
- `/api/gemini` — require auth
- `/api/checkout` — require auth
- `/api/analyze/*` — require auth
- `/api/embeddings/generate` — require auth (admin)
- `/api/integrations/*` — require auth (admin)
- `/api/email/send` — require auth (admin)
- `/api/agent/chat` — require auth
- `/api/license/checkout` — require auth

### Batch C: Prompt Sanitization

Add to `server.ts` before the Gemini call:
```ts
function sanitizePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return '';
  return prompt
    .replace(/[\0\x08\x0B\x0C\x0E-\x1F]/g, '') // strip control chars
    .slice(0, 5000); // length limit
}
```

### Batch D: CORS Hardening

Replace the production origin fallback in `server.ts`:
```ts
const corsOrigin = process.env.NODE_ENV === 'production'
  ? (process.env.APP_URL || (() => { console.error('APP_URL not set in production'); return ''; })())
  : '*';
```

### Batch E: Rate Limiting

- Add `whLimiter` (60 req/min, windowMs: 60*1000) for webhook endpoint
- Lower Gemini rate limit: `geminiLimiter` (10 req/min)
- Keep existing `apiLimiter` (30 req/min)
- Keep `healthLimiter` (60 req/min)

### Batch F: Webhook Error Handling

In the Stripe Connect webhook handler:
```ts
// Instead of always returning 200:
if (error) {
  console.error('Webhook error:', error);
  return res.status(400).send({ error: 'Webhook processing failed' });
}
```

### Batch G: Input Validation (Zod)

Add schemas for these endpoints (Zod is already a dependency):
- `POST /api/checkout` — validate body fields
- `POST /api/contact` — validate contact form schema (reuse existing)
- `POST /api/email/send` — validate email fields
- `POST /api/agent/chat` — validate message field

### Batch H: Fixes

- Fix `missingFields` — it's defined inline in `server.ts` but also imported. Remove the import, keep the local function
- Gemini key validation: check `process.env.GEMINI_API_KEY?.startsWith('AIza')` on startup

## File Map

| Action | File |
|---|---|
| Create | `src/middleware/auth.ts` |
| Create | `docs/release/SECURITY_KEYS_ROTATION.md` |
| Modify | `server.ts` (CORS, auth middleware, prompt sanitization, rate limiters, webhook, Zod, missingFields) |
| Modify | `.gitignore` (ensure .env covered) |
| Modify | `.env.example` (scrub values) |

## Out of scope

- Key rotation in dashboards (human)
- BFG repo-cleaner execution (human, after keys rotated)
- Stripe instance reuse (H3) — deferred to Code Quality batch
- Embeddings API cost (H6) — deferred
- Client-side `window?.location` (H9) — deferred
- All Batch 3/4/5 items
