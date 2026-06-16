# Monitoring Setup

## Health check

- **Endpoint:** `GET /api/health`
- **Expected response:** `200 OK` with `{ status: "ok", uptime, timestamp }`
- **Frequency:** Every 30s (external monitoring), every 60s (internal keepalive)

## API endpoints to monitor

| Endpoint | Method | Purpose | Error Pattern |
|---|---|---|---|
| `/api/health` | GET | Service health | Non-200, timeout >5s |
| `/api/gemini` | POST | AI matching | 429 (rate limit), 502 (Gemini down) |
| `/api/checkout` | POST | Stripe checkout | 400 (validation), 500 (payment failure) |
| `/api/webhook` | POST | Stripe webhooks | 400 (signature invalid), 5xx |
| `/api/license/checkout` | POST | License purchases | Same as /api/checkout |
| `/api/agent/chat` | POST | AI agent chat | 429, timeout >30s |
| `/api/email/send` | POST | Email via Resend | 4xx/5xx if Resend is down |
| `/api/analytics/admin` | GET | Admin analytics | 500, timeout >10s |

## Error patterns and alerts

| Condition | Severity | Action |
|---|---|---|
| Health check fails >3 consecutive | Critical | Pager/email on-call |
| API error rate >5% over 5min | High | Investigate recent deploy |
| Stripe webhook fails >3 in 10min | High | Check Stripe Dashboard |
| Gemini API 429s | Medium | Rate limit hit, auto-retries handle |
| Server CPU >80% sustained | Warning | Consider scaling |
| Memory >500MB sustained | Warning | Check for leaks |

## Log format

- **Format:** Structured JSON (timestamp, level, message, requestId, error)
- **Levels:** debug, info, warn, error
- **Redaction:** API keys, tokens, passwords, Stripe secrets, personal emails
- **Storage:** stdout (captured by hosting platform)

## Supabase health indicators

- **Project Dashboard:** `https://supabase.com/dashboard/project/uwsundicdoewdhphjdhf`
- **Check:** Database connections, API requests, Auth rate limits, Edge Function errors
- **Alert on:** Auth failures >10/min, API latency >1s avg, Storage errors

## Stripe webhook monitoring

- **Dashboard:** `https://dashboard.stripe.com/webhooks`
- **Check:** Delivery attempts, failure rate, latest failures
- **Alert on:** Webhook endpoint disabled, >3 consecutive failures
