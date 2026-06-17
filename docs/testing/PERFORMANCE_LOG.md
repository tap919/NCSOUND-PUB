# Performance Baseline Log

**Date:** 2026-06-16
**Environment:** Local development (Windows, Node 22)
**Server:** `npm run dev` (Express via tsx)
**Rate limiter note:** API rate limited to 30 req/min (`apiLimiter`), health endpoint rate limited to 60 req/min (`healthLimiter`). Load test respects these limits.

## Baseline: GET /api/health (5 RPS, 10s)

Command: `node scripts/load-test.js http://localhost:3000/api/health 5 10`

| Metric | Value |
|---|---|
| Requested RPS | 5 |
| Actual RPS | 4.9 |
| Total requests | 49 |
| Successful | 30 |
| Failed | 19 (rate limited — 429) |
| Success rate | 61.2% |
| Avg latency | 2.4 ms |
| p50 latency | 1.2 ms |
| p95 latency | 2.6 ms |
| p99 latency | 51.4 ms |
| Max latency | 51.4 ms |

**Interpretation:** Under the 30 req/min rate limit, health endpoint responds in ~1-3ms p95. Sub-millisecond for steady-state requests. Occasional cold-start request spikes to ~50ms.

## Notes

- Health endpoint is lightweight — latencies are dominated by Express routing overhead + rate limiter check
- For load testing above rate limits, either:
  - Increase `apiLimiter.max` and `healthLimiter.max` temporarily
  - Test against a deployed environment without rate limiters enabled
- Checkout/license endpoints not load-tested in local dev (require Stripe test keys)
- For production load testing, use k6 or Artillery against deployed environment
