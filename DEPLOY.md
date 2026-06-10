# NcSound Publishing — Deployment Checklist

## Step 1: Set Environment Variables
Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=https://uwsundicdoewdhphjdhf.supabase.co
VITE_SUPABASE_ANON_KEY=<from Supabase Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Settings → API>
VITE_STRIPE_PUBLISHABLE_KEY=<from Stripe Dashboard>
STRIPE_SECRET_KEY=<from Stripe Dashboard>
STRIPE_WEBHOOK_SECRET=<from Stripe Dashboard webhook config>
GEMINI_API_KEY=<from Google AI Studio>
APP_URL=http://localhost:3000
```

Where to find keys:
- **Supabase**: Project Settings → API → Project URL, anon key, service_role key
- **Stripe**: Developers → API Keys → Publishable key, Secret key
- **Stripe Webhook**: Developers → Webhooks → Add endpoint → `yourdomain.com/api/webhook` → Select `checkout.session.completed` event

## Step 2: Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/full_deploy.sql`
3. Copy the ENTIRE contents
4. Paste into SQL Editor
5. Click **Run**
6. Expected result: "Success. No rows returned."

## Step 3: Configure Auth
1. Supabase Dashboard → Authentication → Settings
2. **Turn OFF** "Confirm email" for development (or leave ON for production)
3. Set **Site URL** to `http://localhost:3000`
4. Add redirect URLs:
   - `http://localhost:3000/artist/dashboard`
   - `http://localhost:3000/admin/dashboard`
5. Add your production domain when deploying

## Step 4: Create Storage Buckets
Supabase Dashboard → Storage → Create buckets:

| Name | Public? | Purpose |
|------|---------|---------|
| `track-audio` | No | WAV masters, instrumentals, stems |
| `track-previews` | Yes | Watermarked MP3 previews |
| `beat-store` | Yes | Beat store MP3 previews |
| `cover-art` | Yes | Track and beat artwork |
| `agreements` | No | Signed contract PDFs |

## Step 5: Generate TypeScript Types
In terminal:
```bash
npx supabase login
npx supabase gen types typescript --project-id uwsundicdoewdhphjdhf > src/types/supabase.ts
```

## Step 6: Install & Start
```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Step 7: Test the Connection
- Open browser → `http://localhost:3000`
- Homepage should load with hero and navigation
- Click through all navigation links
- Verify `/catalog`, `/beat-store`, `/supervisor`, `/about` all render

## Step 8: First User Signup
1. Go to `/artist/login`
2. Click "Need an account?"
3. Sign up with email + password
4. After signup, the auth trigger automatically:
   - Creates row in `public.users`
   - Creates row in `public.artists`
5. Login and you should see the artist dashboard

## One-Time Admin Setup
After your first signup, manually set your user role to admin in Supabase:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

Then log into `/admin/login` with the same credentials — you'll have full admin access.

## Production Deployment
```bash
npm run build   # Builds frontend + server bundle
npm start       # Runs production server on port 3000
```

Deploy the `dist/` folder + `server.cjs` to any Node.js host (Railway, Render, Fly.io, etc.)
