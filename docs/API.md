# API Reference

NcSound Publishing API. All endpoints are served from `server.ts` (Vite + Express).
Authentication is via Supabase JWT in the `Authorization: Bearer <token>` header,
or via the admin API key in `X-API-Key` for service-level endpoints.

## Conventions

- **Base URL**: same origin as the app (`/api/...`)
- **Content type**: `application/json` (Stripe webhooks use `application/json` raw)
- **Auth**: Supabase user JWT (`Authorization: Bearer ...`) OR admin key (`X-API-Key: <ADMIN_API_KEY>`)
- **Rate limits**: see `server.ts` — `healthLimiter`, `geminiLimiter`, `agentLimiter`, `financialLimiter`, `webhookLimiter`
- **Admin-only routes**: require a Supabase user with `app_metadata.role === "admin"`, or a valid `X-API-Key`

## Endpoints

### Health & AI

| Method | Path                       | Auth | Description                                  |
|--------|----------------------------|------|----------------------------------------------|
| GET    | `/api/health`              | —    | Liveness probe                                |
| POST   | `/api/gemini`              | —    | Generic Gemini proxy (rate-limited)           |
| POST   | `/api/analyze/classify`    | —    | Classify audio metadata via Gemini            |
| POST   | `/api/analyze/embed`       | —    | Embedding generation via Gemini               |
| POST   | `/api/analyze/audio`       | —    | Audio analysis                                |
| POST   | `/api/analyze/metadata`    | —    | Metadata analysis                             |
| GET    | `/api/analyze/status/:id`  | —    | Analysis job status                           |
| POST   | `/api/match/brief`         | —    | Match a track to a brief                      |
| POST   | `/api/pitch/generate`      | —    | Generate an AI pitch                          |
| POST   | `/api/playlist/analyze`    | —    | Analyze a playlist                            |
| POST   | `/api/playlist/submit`     | —    | Submit a playlist                             |
| GET    | `/api/playlist/credits/:u` | —    | Get user playlist credits                     |

### Tracks & Quality

| Method | Path                            | Auth   | Description                       |
|--------|---------------------------------|--------|-----------------------------------|
| POST   | `/api/upload-url`               | —      | Get signed upload URL             |
| GET    | `/api/youtube/feed`             | —      | YouTube feed proxy                |
| GET    | `/api/disco/export`             | —      | Export DISCO CSV                  |
| POST   | `/api/disco/playlist`           | —      | Build a DISCO playlist            |
| GET    | `/api/quality/scores`           | admin  | All quality scores                |
| GET    | `/api/quality/scores/:artistId` | admin  | Quality scores for one artist     |

### Embeddings (admin)

| Method | Path                          | Auth  | Description                              |
|--------|-------------------------------|-------|------------------------------------------|
| POST   | `/api/embeddings/generate`    | admin | Generate Gemini embeddings for tracks    |

### Integrations (admin)

| Method | Path                                       | Auth  | Description                                  |
|--------|--------------------------------------------|-------|----------------------------------------------|
| POST   | `/api/integrations/config`                 | admin | Upsert an integration config                 |
| GET    | `/api/integrations/configs`                | admin | List integration configs                     |
| DELETE | `/api/integrations/config/:id`             | admin | Delete an integration config                 |
| GET    | `/api/integrations/summary`                | admin | Integration summary                          |
| GET    | `/api/integrations/track/:trackId`         | admin | Track integration data                       |
| POST   | `/api/integrations/platform-income`        | admin | Record platform income                       |
| POST   | `/api/integrations/royalty-collection`     | admin | Trigger royalty collection                   |
| GET    | `/api/integrations/splits/:trackId`        | admin | Get splits for a track                       |
| POST   | `/api/integrations/spotify/sync`           | admin | Spotify OAuth + sync                         |
| POST   | `/api/integrations/soundcloud/sync`        | admin | SoundCloud connectivity check                |
| POST   | `/api/integrations/bandcamp/sync`          | admin | Bandcamp reachability check                  |
| POST   | `/api/integrations/cwr/generate`           | admin | Generate CWR export; returns **signed URL**  |
| GET    | `/api/integrations/cwr/exports`            | admin | List prior CWR exports                       |
| POST   | `/api/integrations/:platform/sync`         | —     | Placeholder sync for other platforms         |

### CWR / DDEX

| Method | Path                       | Auth  | Description                       |
|--------|----------------------------|-------|-----------------------------------|
| POST   | `/api/cwr/v2/generate`     | admin | CWR 2.2 compliant export          |
| POST   | `/api/ddex/generate`       | admin | DDEX ERN 4.3 XML                  |

### Email & Agent

| Method | Path                  | Auth  | Description                                          |
|--------|-----------------------|-------|------------------------------------------------------|
| POST   | `/api/email/send`     | admin | Send transactional email via Resend                  |
| POST   | `/api/agent/chat`     | admin | Conversational admin agent (function-calling Gemini) |

### Outreach (see `src/routes/outreach.ts`)

| Method | Path                       | Auth   | Description                                    |
|--------|----------------------------|--------|------------------------------------------------|
| POST   | `/api/outreach/create`     | —      | Create a draft campaign                        |
| POST   | `/api/outreach/send`       | admin  | Send a campaign — pass `dryRun: true` to preview |
| GET    | `/api/outreach/stats`      | —      | Campaign + recipient statistics                |

### Stripe & Licensing

| Method | Path                                | Auth   | Description                |
|--------|-------------------------------------|--------|----------------------------|
| POST   | `/api/checkout`                     | —      | Generic checkout session   |
| POST   | `/api/stripe/connect/onboard`       | —      | Stripe Connect onboarding  |
| POST   | `/api/stripe/connect/webhook`       | —      | Stripe Connect webhook     |
| POST   | `/api/stripe/payout`                | admin  | Trigger a payout           |
| POST   | `/api/license/checkout`             | —      | License checkout           |
| POST   | `/api/license/agreement`            | —      | Generate license agreement |
| GET    | `/api/license/view/:fileName`       | —      | Download signed agreement  |
| POST   | `/api/license/exclusive-offer`      | admin  | Make an exclusive offer    |
| GET    | `/api/license/exclusive-offers/:id` | —      | List exclusive offers      |
| POST   | `/api/subscription/checkout`        | —      | Subscription checkout      |

### Analytics (admin)

| Method | Path                          | Auth  | Description                |
|--------|-------------------------------|-------|----------------------------|
| GET    | `/api/analytics/admin`        | admin | Admin dashboard analytics  |
| GET    | `/api/analytics/supervisors`  | admin | Supervisor analytics       |

### Webhooks & Static

| Method | Path                  | Auth         | Description                 |
|--------|-----------------------|--------------|-----------------------------|
| POST   | `/api/webhook`        | —            | Generic inbound webhook     |
| GET    | `/sitemap.xml`        | —            | Sitemap                     |
| GET    | `/robots.txt`         | —            | Robots                      |
| GET    | `/favicon.ico`        | —            | Favicon (proxied)           |
| GET    | `/api/story/download` | —            | Story export download       |

## Error Format

All errors return JSON:

```json
{ "error": "Human-readable message" }
```

Status codes used:
- `400` — missing/invalid input
- `401` — missing or invalid auth
- `403` — authenticated but lacks role
- `404` — resource not found
- `429` — rate-limited
- `500` — server / upstream error (sanitized message)