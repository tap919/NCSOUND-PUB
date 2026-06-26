# NCSOUND-PUB 50%→100% Sprint Plan

## **Scope**
Close the 50%→100% gap with **60%+ test coverage** and **full workflow validation**. Focus on high-risk components, E2E workflows, security, and operational readiness.

---

## **Sprint Phases**

### **Sprint 1 (50% Phase Lockdown) - Weeks 1-2**
**Goal**: Expand component coverage, close functional gaps, and stabilize high-risk areas.
**Success Criteria**: 50% of components `Pass`, 40%+ coverage.

#### **Week 1**
| **Task**                                      | **Owner**         | **Deliverables**                                                                                     |
|-----------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------|
| **Auth & Roles**                              | @core-team        | - Session persistence tests (E2E + unit)                                                            |
|                                               |                   | - Route guard integration tests (Supabase RLS)                                                       |
| **Artist Upload**                             | @artist-team      | - File validation (audio format/size)                                                               |
|                                               |                   | - Supabase storage integration tests                                                                |
| **Admin Dashboard**                           | @admin-team       | - Analytics query validation                                                                        |
|                                               |                   | - User management tests                                                                              |
| **Supabase Queries**                          | @core-team        | - Live DB CRUD tests                                                                                 |
|                                               |                   | - RLS policy validation (unit + integration)                                                         |

#### **Week 2**
| **Task**                                      | **Owner**         | **Deliverables**                                                                                     |
|-----------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------|
| **Seeded Test Env**                           | @core-team        | - Supabase seed scripts for test data                                                               |
|                                               |                   | - Deterministic E2E setup                                                                           |
| **Artist Dashboard**                          | @artist-team      | - Track upload status tests                                                                          |
|                                               |                   | - Royalty payouts (unit logic)                                                                      |
| **Catalog**                                   | @core-team        | - Track filtering/search tests                                                                       |
|                                               |                   | - Pagination validation                                                                              |
| **Security (npm audit, axe-core)**             | @core-team        | - Dependency scanning (CI integration)                                                              |
|                                               |                   | - Secret scanning (pre-commit hooks)                                                                |

---

### **Sprint 2 (100% Phase Foundation) - Weeks 3-4**
**Goal**: Implement E2E workflows, security, and performance baselines.
**Success Criteria**: All 100% phase blockers resolved, 60%+ coverage.

#### **Week 3**
| **Task**                                      | **Owner**         | **Deliverables**                                                                                     |
|-----------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------|
| **Stripe Checkout**                           | @core-team        | - Payment success/failure E2E tests                                                                 |
|                                               |                   | - Webhook validation (Stripe test mode)                                                             |
| **License Request Flow**                      | @core-team        | - PDF generation tests                                                                               |
|                                               |                   | - Resend email delivery validation                                                                   |
| **BeatStore**                                 | @core-team        | - Stripe checkout E2E flow                                                                           |
|                                               |                   | - Track preview tests                                                                                |
| **Supabase Policies**                         | @core-team        | - RLS validation for all roles (artist/admin/supervisor)                                             |

#### **Week 4**
| **Task**                                      | **Owner**         | **Deliverables**                                                                                     |
|-----------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------|
| **Admin LicenseRequests**                     | @admin-team       | - License generation (PDF) tests                                                                    |
|                                               |                   | - Stripe payment verification                                                                       |
| **Admin Inbox**                               | @admin-team       | - License request approval E2E                                                                       |
|                                               |                   | - Supervisor request triage tests                                                                   |
| **Performance (Load Testing)**                 | @core-team        | - API latency benchmarks                                                                             |
|                                               |                   | - Supabase query performance tests                                                                  |
| **Accessibility (axe-core)**                   | @core-team        | - Keyboard nav/ARIA label tests (Playwright)                                                         |
|                                               |                   | - Contrast/focus trap validation                                                                    |

---

### **Sprint 3 (100% Phase Sign-Off) - Weeks 5-6**
**Goal**: Operational readiness, monitoring, and release validation.
**Success Criteria**: 100% of components `Pass` or `Partial`, 80%+ coverage, operational docs complete.

#### **Week 5**
| **Task**                                      | **Owner**         | **Deliverables**                                                                                     |
|-----------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------|
| **Deploy Checklist**                          | @core-team        | - Build verification tests                                                                           |
|                                               |                   | - Rollback procedure docs                                                                           |
| **Monitoring**                                | @core-team        | - Error tracking (Sentry) setup                                                                      |
|                                               |                   | - Performance metrics (CI integration)                                                              |
| **Rollback**                                  | @core-team        | - Rollback validation tests                                                                          |
|                                               |                   | - Backup integrity checks                                                                           |

#### **Week 6**
| **Task**                                      | **Owner**         | **Deliverables**                                                                                     |
|-----------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------|
| **Final Validation**                          | @core-team        | - 100% phase blockers resolved                                                                      |
|                                               |                   | - 80%+ coverage (unit + E2E)                                                                        |
| **Operational Docs**                          | @core-team        | - Monitoring/alerting setup guide                                                                    |
|                                               |                   | - Incident response playbook                                                                       |

---

## **Dependencies**
- **Sprint 1**: Seeded Supabase test environment.
- **Sprint 2**: Stripe test credentials, CI/CD pipeline for E2E/security scans.
- **Sprint 3**: Production-like staging environment.

---

## **Risk Register**
| **Risk**                                      | **Mitigation**                                                                                     |
|-----------------------------------------------|------------------------------------------------------------------------------------------------------|
| Admin dashboard refactoring delays tests       | Prioritize `Dashboard.tsx` in Sprint 1; mock analytics queries early.                              |
| Stripe webhook validation requires test mode  | Use Stripe test keys in Sprint 2; validate locally before CI integration.                          |
| Supabase RLS policies block E2E tests         | Test RLS in isolation (unit) before E2E; use seeded test data.                                     |
| Low coverage in artist/royalties logic        | Focus Sprint 1 on `ArtistDashboard` and `Royalties` unit tests.                                    |

---

## **Evidence Tracking**
- Update `AUDIT_TRACKING_SHEET.md` with `Pass`/`Partial` status and evidence links.
- Link CI logs for coverage reports and E2E test results.