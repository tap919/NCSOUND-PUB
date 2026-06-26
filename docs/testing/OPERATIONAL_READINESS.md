# Operational Readiness & Incident Response

## Rollback Procedure
If a deployment causes a regression or critical failure:

1. **Verify**: Use `/api/health` to confirm the extent of the failure.
2. **Revert**:
   - If using hosting with versioning (e.g., Vercel, Netlify): Use the provider's dashboard to revert to the last stable deployment.
   - If using static hosting/VPS: Re-upload the previous `dist/` directory and restart the server (`node dist/server.cjs`).
3. **Notify**: Post in the #incidents channel with:
   - Impacted users
   - Symptoms
   - Time of revert
4. **Post-Mortem**: Document the failure in `REGRESSION_LOG.md` and ensure a regression test is added before attempting a re-deploy.

## Backup Integrity Checks
- **Supabase**: 
  - Daily backups are handled by Supabase automatically (PITR available on Pro plans).
  - Monthly: Verify restore capability by attempting a local import of a backup.
- **Content**: 
  - Tracks and assets in Supabase Storage are immutable; ensure bucket policies are set to prevent accidental deletion.

## Monitoring & Alerting
- **Error Tracking**: Integration with Sentry (or similar) is required for error reporting.
- **Performance Metrics**: 
  - Monitor `/api/health` latency via uptime monitoring (e.g., UptimeRobot, BetterStack).
  - Use `npm run test:e2e` in CI to catch regression before deployment.

## Incident Response Playbook
| **Incident Type** | **Response** | **Escalation** |
|---|---|---|
| **Site Down** | Check health endpoint; check hosting logs; revert deployment. | Engineering Lead |
| **Data Loss** | Stop all writes; check Supabase status; initiate PITR restore. | CTO |
| **Payment Failure** | Check Stripe Dashboard for webhook errors; review `/api/webhook` logs. | Finance Team |
| **Security Breach** | Rotate secrets (see `KEY-ROTATION.md`); audit logs. | Security Lead |

---
*Last updated: 2026-06-17*
