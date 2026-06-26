# Key & Secret Rotation Guide

## Secrets Inventory

| Variable | Service | Rotated | Last Rotation | Access |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Never | — | Project owner |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Never | — | Project owner |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key | Never | — | Project owner |
| `GEMINI_API_KEY` | Google AI (Gemini) | Never | — | Project owner |
| `STRIPE_SECRET_KEY` | Stripe secret key | Never | — | Project owner |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Never | — | Project owner |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Never | — | Project owner |
| `RESEND_API_KEY` | Resend email API key | Never | — | Project owner |
| `SPOTIFY_CLIENT_ID` | Spotify API client ID | Never | — | Project owner |
| `SPOTIFY_CLIENT_SECRET` | Spotify API client secret | Never | — | Project owner |
| `SOUNDCLOUD_CLIENT_ID` | SoundCloud API client ID | Never | — | Project owner |
| `SOUNDCLOUD_CLIENT_SECRET` | SoundCloud API client secret | Never | — | Project owner |
| `TUNEREGISTRY_API_KEY` | TuneRegistry API key | Never | — | Project owner |

## Rotation Procedure

### Supabase keys
1. Go to Supabase Dashboard → Settings → API
2. Generate new `anon` public key and/or `service_role` secret key
3. Update `.env` on all environments (local, staging, production)
4. Update `VITE_SUPABASE_ANON_KEY` if frontend config changes
5. Restart the server

### Gemini API key
1. Go to https://aistudio.google.com/apikey
2. Revoke old key, create new key
3. Update `GEMINI_API_KEY` in `.env`

### Stripe keys
1. Go to Stripe Dashboard → Developers → API keys
2. Roll secret key or webhook secret
3. For webhook secret: Stripe Dashboard → Developers → Webhooks → (endpoint) → "Signing secret"
4. Update `.env` and restart

### Resend key
1. Go to Resend Dashboard → API Keys
2. Create new key, delete old
3. Update `.env` and restart

### Spotify/SoundCloud/TuneRegistry
1. Go to each provider's developer dashboard
2. Regenerate client secret
3. Update `.env` and restart

## Emergency Revocation

If a key is compromised:
1. Revoke immediately at the provider dashboard
2. Deploy a placeholder `.env` with dummy values
3. Rotate all keys that share the same access scope
4. Investigate breach scope in server logs (no secrets logged)
5. Restore with new keys

## Who Has Access

All secrets are stored in:
- Local `.env` files (never committed)
- Environment variables on the hosting platform (Vercel/Railway/Render)

Only the project owner has access to the hosting platform and provider dashboards.
