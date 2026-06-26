import { Router, type RequestHandler } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

interface OutreachRouterDeps {
  supabaseClient: SupabaseClient | null;
  requireAdmin: RequestHandler;
  sanitizeError: (err: unknown) => string;
}

export function createOutreachRouter({
  supabaseClient,
  requireAdmin,
  sanitizeError,
}: OutreachRouterDeps): Router {
  const router = Router();

  // Create campaign
  router.post('/create', async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { brief_id, title, subject, body } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });
      const { data, error } = await supabaseClient
        .from('outreach_campaigns')
        .insert({ brief_id, title, subject, body, status: 'draft' })
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Send (or dry-run) campaign
  router.post('/send', requireAdmin, async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { campaignId, dryRun } = req.body;
      if (!campaignId) return res.status(400).json({ error: 'campaignId required' });

      const { data: campaign } = await supabaseClient
        .from('outreach_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

      const { data: supervisors } = await supabaseClient
        .from('supervisors')
        .select('*')
        .eq('verified', true);
      const recipients = supervisors || [];

      if (dryRun) {
        const previewRecipients: Array<{ supervisor_id: string; email: string; name: string }> = [];
        for (const s of recipients) {
          const { data: user } = await supabaseClient
            .from('users')
            .select('email')
            .eq('id', s.user_id)
            .single();
          if ((user as any)?.email) {
            previewRecipients.push({
              supervisor_id: s.id,
              email: (user as any).email,
              name: s.company || 'Supervisor',
            });
          }
        }
        return res.json({
          dryRun: true,
          campaign_id: campaignId,
          would_send_to: previewRecipients.length,
          recipients: previewRecipients,
        });
      }

      for (const s of recipients) {
        const { data: user } = await supabaseClient
          .from('users')
          .select('email')
          .eq('id', s.user_id)
          .single();
        if ((user as any)?.email) {
          await supabaseClient.from('outreach_recipients').insert({
            campaign_id: campaignId,
            supervisor_id: s.id,
            email: (user as any).email,
            name: s.company || 'Supervisor',
            status: 'pending',
          });
        }
      }

      await supabaseClient
        .from('outreach_campaigns')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', campaignId);

      res.json({ sent: recipients.length, campaign_id: campaignId });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Stats
  router.get('/stats', async (_req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data: campaigns } = await supabaseClient
        .from('outreach_campaigns')
        .select('*, outreach_recipients(*)')
        .order('created_at', { ascending: false });
      if (!campaigns) return res.json([]);

      const stats = campaigns.map((c: any) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        sent_at: c.sent_at,
        total: c.outreach_recipients?.length || 0,
        sent: c.outreach_recipients?.filter((r: any) => r.status === 'sent').length || 0,
        opened:
          c.outreach_recipients?.filter((r: any) => r.status === 'opened' || r.opened_at).length || 0,
        replied:
          c.outreach_recipients?.filter((r: any) => r.status === 'replied' || r.replied_at).length || 0,
      }));

      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  return router;
}