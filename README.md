# NcSound Publishing

A comprehensive sync publishing hub designed for modern artists and music supervisors. 

## Features
- **Artist Portal:** Submit catalogs, sign performance agreements, and track royalties.
- **Supervisor Hub:** Private access for verified music supervisors to submit briefs, request AI cross-matches, and acquire one-stop clearance licenses via the integrated Beat Store.
- **Admin & Metadata Engine:** Validation framework for direct CWR delivery to The MLC and PRO integration (ASCAP/BMI) via TuneRegistry.

## Local Development

```bash
npm install
npm run dev
```

### Environment Variables
Setup your `.env` file based on `.env.example`.

Required:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: Supabase auth & data layer
- `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLISHABLE_KEY`: Store purchases and payouts
- `GEMINI_API_KEY`: Server-side API for custom supervisor brief matching

## Deployment

The application runs effectively on environments supporting full-stack React via Express + Vite middleware, specifically `tsx` for dev and `esbuild` for bunlding.

```bash
npm run build
npm run start
```
