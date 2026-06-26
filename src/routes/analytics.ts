import { Router, type RequestHandler } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AnalyticsRouterDeps {
  supabaseClient: SupabaseClient | null;
  requireAdmin: RequestHandler;
  sanitizeError: (err: unknown) => string;
  log: (level: string, ...args: unknown[]) => void;
}

export function createAnalyticsRouter({
  supabaseClient,
  requireAdmin,
  sanitizeError,
  log,
}: AnalyticsRouterDeps): Router {
  const router = Router();

  // Admin dashboard metrics
  router.get('/admin', requireAdmin, async (_req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const [tracksRes, artistsRes, supervisorsRes, dealsRes, statementsRes, incomeRes] =
        await Promise.all([
          supabaseClient.from('tracks').select('*', { count: 'exact', head: true }),
          supabaseClient.from('artists').select('*', { count: 'exact', head: true }),
          supabaseClient.from('supervisors').select('*', { count: 'exact', head: true }),
          supabaseClient.from('deals').select('sync_fee').limit(1000),
          supabaseClient.from('royalty_statements').select('net_payout, status').limit(1000),
          supabaseClient.from('income_summary').select('net_amount').limit(1000),
        ]);

      if ((dealsRes.data?.length || 0) >= 1000) log('warn', 'deals query hit 1000 limit');
      if ((incomeRes.data?.length || 0) >= 1000)
        log('warn', 'income_summary query hit 1000 limit');

      const totalManagedFees = (dealsRes.data || []).reduce(
        (s: number, d: any) => s + parseFloat(d.sync_fee || 0),
        0
      );
      const activeCueSheets = (dealsRes.data || []).length;
      const pendingPayouts = (statementsRes.data || []).filter(
        (s: any) => s.status === 'pending'
      ).length;
      const totalIncome = (incomeRes.data || []).reduce(
        (s: number, i: any) => s + (parseFloat(i.net_amount) || 0),
        0
      );
      const mtdDate = new Date();
      mtdDate.setDate(1);
      const mtdIncome = (incomeRes.data || [])
        .filter((i: any) => i.created_at >= mtdDate.toISOString())
        .reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);

      res.json({
        total_catalog: tracksRes.count || 0,
        active_artists: artistsRes.count || 0,
        supervisor_accounts: supervisorsRes.count || 0,
        mtd_placements: mtdIncome > 0 ? Math.ceil(mtdIncome / 1000) : 0,
        total_managed_fees: totalManagedFees,
        active_cue_sheets: activeCueSheets,
        pending_payouts: pendingPayouts,
        total_income: totalIncome,
      });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Supervisor analytics
  router.get('/supervisors', requireAdmin, async (_req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const [supervisorsRes, briefsRes, matchesRes] = await Promise.all([
        supabaseClient.from('supervisors').select('*', { count: 'exact', head: true }),
        supabaseClient.from('briefs').select('*'),
        supabaseClient.from('brief_matches').select('*'),
      ]);

      const openBriefs = (briefsRes.data || []).filter((b: any) => b.status === 'open').length;
      const totalMatches = matchesRes.count || matchesRes.data?.length || 0;

      res.json({
        total_supervisors: supervisorsRes.count || 0,
        open_briefs: openBriefs,
        total_briefs: briefsRes.data?.length || 0,
        total_matches: totalMatches,
      });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  return router;
}