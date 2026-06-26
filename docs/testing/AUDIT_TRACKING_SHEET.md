# NCSOUND-PUB Audit Tracking Sheet

**Phase:** 50% → 100% Compliance
**Last Updated:** 2026-06-17
**Coverage Baseline:** 33% statements / 36% lines (335 tests passing)

---

## Overview
This sheet tracks **test coverage, risk, and phase targets** for NCSOUND-PUB's critical components and workflows. Status is updated as evidence is completed.

| **Status**  | **Definition**                                                                 |
|-------------|---------------------------------------------------------------------------------|
| Pass        | Tests exist and validate real behavior.                                         |
| Partial     | Tests exist but are cosmetic (e.g., shape validation, string checks).           |
| Missing     | No tests or critical gaps.                                                      |
| Blocked     | Depends on other fixes (e.g., environment setup, build issues).                 |

---

## Tracking Table

| **Component/Workflow**               | **Owner**         | **Current Tests**                                                                 | **Missing Tests**                                                                                     | **Risk Level** | **Phase Target** | **Evidence Link**                                                                 | **Status**  |
|---------------------------------------|-------------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|----------------|------------------|-----------------------------------------------------------------------------------|-------------|
| **Auth & Roles**                      | @core-team        | Unit: `useAuth.tsx` (shape), `supabase.test.ts` (role checks)                    | Session persistence, route guards, login/logout E2E, role-based access control (RBAC) integration    | High           | 100%             | [tests/integration/supabase.test.ts](tests/integration/supabase.test.ts)         | Partial     |
| **Login (Artist/Admin/Supervisor)**   | @core-team        | E2E: Redirects for unauth users                                                   | Full auth flow (login/logout/session expiry), role-specific redirects                                | High           | 100%             | [e2e/auth.spec.ts](e2e/auth.spec.ts)                                             | Partial     |
| **Session Persistence**               | @core-team        | None                                                                              | Session storage, token refresh, expiry handling                                                      | High           | 100%             | -                                                                                 | Missing     |
| **Route Guards**                      | @core-team        | Unit: Role checks (`isArtist`, `isAdmin`)                                         | Integration with Supabase RLS, E2E protected route validation                                         | High           | 100%             | [tests/integration/supabase.test.ts](tests/integration/supabase.test.ts)         | Partial     |
| **Artist Portal**                     | @artist-team      | Unit: `Upload.tsx` (shape), `Profile.tsx` (render)                                | Upload workflow (file validation, Supabase storage), royalties calculation, dashboard analytics      | Medium         | 50%              | [src/pages/artist/__tests__/](src/pages/artist/__tests__/)                       | Partial     |
| **Artist Dashboard**                  | @artist-team      | None                                                                              | Track upload status, royalty payouts, profile updates                                                | Medium         | 50%              | -                                                                                 | Missing     |
| **Artist Upload**                     | @artist-team      | Unit: `FileUpload.tsx` (shape)                                                    | File validation (audio format, size), Supabase storage integration, metadata extraction              | High           | 100%             | [src/components/FileUpload.tsx](src/components/FileUpload.tsx)                   | Partial     |
| **Artist Royalties**                  | @artist-team      | None                                                                              | Royalty calculation logic, payout history, Stripe Connect integration                                 | Medium         | 50%              | -                                                                                 | Missing     |
| **Admin Dashboard**                   | @admin-team       | Unit: `Dashboard.tsx` (render)                                                    | Analytics queries, user management, brief approval workflow                                           | High           | 100%             | [src/pages/admin/Dashboard.tsx](src/pages/admin/Dashboard.tsx)                   | Partial     |
| **Admin Briefs**                      | @admin-team       | None                                                                              | Brief creation, assignment, status tracking                                                           | Medium         | 50%              | -                                                                                 | Missing     |
| **Admin Inbox**                       | @admin-team       | None                                                                              | License request approval, supervisor request triage                                                   | Medium         | 50%              | -                                                                                 | Missing     |
| **Admin LicenseRequests**             | @admin-team       | None                                                                              | License generation (PDF), Stripe payment verification, contract signing                               | High           | 100%             | -                                                                                 | Missing     |
| **SupervisorRequests**                | @admin-team       | None                                                                              | Supervisor registration approval, brief assignment                                                    | Medium         | 50%              | -                                                                                 | Missing     |
| **SupervisorPortal**                  | @admin-team       | None                                                                              | Brief submission, track selection, feedback workflow                                                   | Medium         | 50%              | -                                                                                 | Missing     |
| **Catalog**                           | @core-team        | Unit: `Catalog.tsx` (render)                                                      | Track filtering, search, pagination, Supabase query integration                                       | Medium         | 50%              | [src/pages/Catalog.tsx](src/pages/Catalog.tsx)                                    | Partial     |
| **BeatStore**                         | @core-team        | Unit: `BeatStore.tsx` (render)                                                    | Stripe checkout flow, license request submission, track preview                                       | High           | 100%             | [src/pages/BeatStore.tsx](src/pages/BeatStore.tsx)                              | Partial     |
| **TrackDetail**                       | @core-team        | None                                                                              | Track metadata display, audio player integration, license request flow                                | Medium         | 50%              | -                                                                                 | Missing     |
| **License Request Flow**              | @core-team        | Unit: API shape (`/api/license/checkout`)                                         | Stripe webhook validation, PDF generation, email delivery (Resend)                                    | High           | 100%             | [tests/integration/api.test.ts](tests/integration/api.test.ts)                  | Partial     |
| **Stripe Checkout**                   | @core-team        | None                                                                              | Payment success/failure handling, webhook validation, order fulfillment                               | High           | 100%             | -                                                                                 | Missing     |
| **Supabase Queries**                  | @core-team        | Unit: Shape validation (`supabase-queries.test.ts`)                              | Live DB CRUD, RLS policies, edge cases (empty results, errors)                                        | High           | 100%             | [src/lib/__tests__/supabase.test.ts](src/lib/__tests__/supabase.test.ts)        | Partial     |
| **Supabase Policies**                 | @core-team        | None                                                                              | RLS validation for artist/admin/supervisor roles, data isolation                                      | High           | 100%             | -                                                                                 | Missing     |
| **Seeded Test Env**                   | @core-team        | None                                                                              | Test data generation, Supabase seed scripts, deterministic E2E setup                                  | Medium         | 50%              | -                                                                                 | Missing     |
| **AgentChat (Google Gemini)**         | @core-team        | Unit: API shape (`/api/agent/chat`)                                               | Gemini integration, prompt validation, response streaming                                             | Medium         | 50%              | [tests/integration/api.test.ts](tests/integration/api.test.ts)                  | Partial     |
| **Resend (Email)**                    | @core-team        | None                                                                              | Email template rendering, delivery validation, error handling                                         | Medium         | 50%              | -                                                                                 | Missing     |
| **Security (npm audit, axe-core)**    | @core-team        | Unit: String checks (`owasp.test.ts`)                                             | Real input validation, auth bypass, dependency scanning, secret scanning                              | High           | 100%             | [tests/security/owasp.test.ts](tests/security/owasp.test.ts)                     | Partial     |
| **Accessibility (axe-core)**          | @core-team        | Unit: String checks (`basic.test.ts`)                                             | Keyboard nav, ARIA labels, contrast, focus traps                                                      | Medium         | 50%              | [tests/accessibility/basic.test.ts](tests/accessibility/basic.test.ts)          | Partial     |
| **Performance (Load Testing)**        | @core-team        | Unit: Microbenchmarks (`baseline.test.ts`)                                        | API latency, Supabase query performance, memory leaks                                                 | Medium         | 50%              | [tests/performance/baseline.test.ts](tests/performance/baseline.test.ts)        | Partial     |
| **Deploy Checklist**                  | @core-team        | None                                                                              | Build verification, rollback testing, monitoring setup                                                | High           | 100%             | -                                                                                 | Missing     |
| **Monitoring**                        | @core-team        | None                                                                              | Error tracking, performance metrics, uptime alerts                                                    | Medium         | 50%              | -                                                                                 | Missing     |
| **Rollback**                          | @core-team        | None                                                                              | Rollback procedure, backup validation, data integrity                                                 | High           | 100%             | -                                                                                 | Missing     |

---

## Progress Summary

| **Metric**               | **Value**                                                                 |
|--------------------------|---------------------------------------------------------------------------|
| **Total Components**     | 28                                                                      |
| **Pass**                | 0 (0%)                                                                   |
| **Partial**             | 12 (43%)                                                                |
| **Missing**             | 16 (57%)                                                                |
| **Blocked**             | 0 (0%)                                                                   |
| **Coverage Target**     | 60% (50% phase) / 80% (100% phase)                                      |
| **Current Coverage**    | 33% statements / 36% lines (335 tests)                                  |

---

## Next Steps
1. **High-Risk First**: Address **auth, admin dashboard, Stripe checkout, and security** (100% phase blockers).
2. **50% Phase**: Expand coverage for **artist portal, catalog, and Supabase test env**.
3. **Operational Readiness**: Document **deploy checklist, monitoring, and rollback** procedures.
4. **Update Status**: Mark items as `Pass` when evidence is complete and linked.

> **Note**: Evidence links point to test files or CI logs. Update paths if files are moved.