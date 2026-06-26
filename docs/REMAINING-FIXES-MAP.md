# Remaining Fixes — Batch Map

Total remaining: 45 items across 9 batches. Estimated: 3-4 sessions.

---

## Batch A — Stripe & Webhook Reliability (3 items)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| H3 | New Stripe instance per webhook call | Replace `new Stripe()` with imported `stripeModule` in webhook handlers (5 occurrences: lines 146, 1655, 1702, 1728, 1890 in server.ts) | `server.ts` | S |
| H14 | Stripe Connect webhook returns 200 on error | Return proper error status (e.g., 400) instead of blanket 200 | `server.ts:1719` | XS |
| H13 | Silent `catch {}` blocks | Add error logging + sensible fallback to 2 bare catches | `server.ts:2247,2288` | XS |

**Depends on**: Nothing

---

## Batch B — Infrastructure Configuration (4 items)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| H7 | SPA catch-all returns HTML for API 404s | Add check: if path starts with `/api/`, return JSON 404 instead of `index.html` | `server.ts:2383` | XS |
| H8 | Robots.txt has hardcoded localhost | Use `process.env.APP_URL || 'http://localhost:3000'` like sitemap already does | `server.ts:639` | XS |
| M9 | `npm run clean` targets `server.js` | Change to `server.cjs` in package.json clean script | `package.json:10` | XS |
| M10 | No Docker HEALTHCHECK | Add HEALTHCHECK to Dockerfile | `Dockerfile` | XS |

**Depends on**: Nothing

---

## Batch C — Sitemap & SEO (2 items)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| M2 | Missing `/roster/soulyghost` from sitemap | Add to `rosterRoutes` array | `server.ts:625` | XS |
| M3 | No `lastmod` in sitemap entries | Add `<lastmod>` based on current date or track update timestamps | `server.ts:629` | S |

**Depends on**: Nothing

---

## Batch D — Email & Key Validation (2 items)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| H9 | `window?.location?.origin` in server-side email | Replace with env variable (email is rendered server-side, `window` is undefined) | `src/lib/email.ts:134` | XS |
| H4 | Gemini key only checked for truthy | Add startup validation: test key with a simple `generateContent` call, log warning if invalid | `server.ts` startup section | S |

**Depends on**: Nothing

---

## Batch E — UI Fixes (4 items)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| H10 | Auto-play on Home page loads track on mount | Remove `playTrack` call from Home mount effect; let user click first | `src/pages/Home.tsx:58-62` | XS |
| H11 | Duplicate nav entries (Roster→/about, About→/about) | Change Roster to `/supervisor` or merge into About | `src/components/layout/Layout.tsx:12,16` | XS |
| M7 | Buttons missing `type="button"` | Scan and add `type="button"` to `<button>` elements without it (across all components) | multiple files | M |
| L8 | Hardcoded Unsplash fallback images | Replace with local placeholder SVGs or remove fallback | multiple pages | S |

**Depends on**: Nothing (H10, H11), Batch G (M7 can be combined with pass)

---

## Batch F — Code Quality (9 items)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| M1 | License "PDF" generates HTML | Either: (a) generate real PDF with `pdf-lib` or (b) rename endpoint to `/api/license/doc` and set correct content-type | `server.ts:1805+` | M |
| M8 | 80/20 split hardcoded | Move to env var (`NCSOUND_SPLIT=0.20`) or DB config table | `server.ts:2264-2265` + `.env.example` | S |
| M11 | Home page stats hardcoded (14 tracks, 3 artists) | Replace with live `SELECT count(*)` queries from Supabase | `src/pages/Home.tsx` | S |
| M12 | `audio-decode` typed as `any` | Add `@types/audio-decode` or inline type declaration | `server.ts:375` or new `.d.ts` | XS |
| M13 | Error truncation at 300 chars | Move truncation length to constant; optionally increase to 500 | `src/lib/sanitize.ts:14` | XS |
| M14 | Empty `clientId` in `getSpotifyAuthUrl` | Read from env var `SPOTIFY_CLIENT_ID` instead of empty string | `src/lib/integrations.ts:244` | XS |
| Q3 | Gemini client created per request | Hoist `GoogleGenAI` instantiation to startup (2 occurrences: gemini + playlist endpoints) | `server.ts` | S |
| Q4/Q5 | Client→server→Gemini round-trip for AI | Move classify/embedding calls to server-only; remove client-facing Gemini calls | `src/lib/analyze.ts`, `src/lib/embeddings.ts` | L |
| Q10 | Plaintext API keys in DB (integration_configs) | Add comment/TODO to encrypt at rest; not a code fix | — | XS (doc only) |

**Depends on**: Nothing (except Q4/Q5 is larger refactor)

---

## Batch G — Admin Analytics Performance (1 item)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| H12 | No pagination on admin analytics | Queries fetch ALL records from 6 tables. Add `.limit(1000)` or proper pagination with `range()` | `server.ts:2083-2089` | S |

**Depends on**: Nothing

---

## Batch H — UI/UX Pass (remaining L items)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| L1 | Footer admin link | Add `/admin` link visible only to logged-in admins | `src/components/layout/Layout.tsx` | S |
| L2 | 1213-line Dashboard.tsx (was 1284) | Break into sub-components: `StatCard`, `CatalogTable`, etc. | `src/pages/admin/Dashboard.tsx` | L |
| L3 | No loading skeletons | Add skeleton placeholders to dashboard, catalog, track detail | multiple pages | M |
| L4 | Grayscale artist images | Add CSS grayscale filter to roster images | roster component | XS |
| L5 | `pb-28` padding | Audit and adjust or comment why needed | layout component | XS |
| L6 | No PWA manifest/service worker | Add `manifest.json`, service worker registration | `index.html`, `main.tsx` | M |
| L7 | Missing `aria-label` on icon buttons | Audit interactive icons, add `aria-label` | multiple components | M |
| L9 | No focus trap in modals | Add focus trap to modal/dialog components | modal component(s) | S |
| L10 | No skip-to-content link | Add skip nav link at top of body | `Layout.tsx` | XS |

**Depends on**: Nothing (can be done in parallel with other batches)

---

## Batch I — Dashboard Refactor (Q items)

| ID | Issue | Fix | File(s) | Est. |
|----|-------|-----|---------|------|
| Q1 | Heavy `as any` usage | Add proper types incrementally — too broad for single pass | project-wide | XL |
| Q6 | AI logic in client code | Move Gemini client calls to server endpoints | `src/lib/analyze.ts` | M |
| Q7 | No React Query | Adopt TanStack Query for data fetching; start with most-used queries | project-wide | XL |
| Q8 | Excessive `any` in agent tool executor | Type tool definitions and results | `server.ts:1131+` | M |
| Q9 | Missing error types in webhook handler | Type the Stripe event with proper union discrimination | `server.ts:149+` | S |

**Depends on**: Nothing (Q7 is a larger architectural shift)

---

## Session Plan

| Session | Batches | Items | Est. time |
|---------|---------|-------|-----------|
| **1** | A + B + G | H3, H14, H13, H7, H8, M9, M10, H12 | ~2h |
| **2** | C + D | M2, M3, H9, H4 | ~1h |
| **3** | E + H (quick wins) | H10, H11, L1, L3, L4, L5, L7, L9, L10 | ~2h |
| **4** | F (medium) | M1, M8, M11, M12, M13, M14, Q3 | ~2h |
| **Later** | H(L2) + I | L2 (Dashboard), Q1, Q4/Q5, Q6, Q7, Q8, Q9 | 2-3 sessions |

**Keys rotated** (user): after all code fixes deploy, before going live.
