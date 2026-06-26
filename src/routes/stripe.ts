import { Router, type RequestHandler } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

interface StripeRouterDeps {
  supabaseClient: SupabaseClient | null;
  stripeModule: Stripe | null;
  requireAdmin: RequestHandler;
  financialLimiter: RequestHandler;
  webhookLimiter: RequestHandler;
  rawJson: RequestHandler;
  sanitizeError: (err: unknown) => string;
  log: (level: string, ...args: unknown[]) => void;
}

export function createStripeRouter({
  supabaseClient,
  stripeModule,
  requireAdmin,
  financialLimiter,
  webhookLimiter,
  rawJson,
  sanitizeError,
  log,
}: StripeRouterDeps): Router {
  const router = Router();

  // Connect onboarding
  router.post('/connect/onboard', financialLimiter, async (req, res) => {
    try {
      if (!stripeModule) return res.status(500).json({ error: 'Payments not configured' });
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { artistId } = req.body;
      if (!artistId) return res.status(400).json({ error: 'artistId required' });

      const { data: existing } = await supabaseClient
        .from('stripe_accounts')
        .select('*')
        .eq('artist_id', artistId)
        .single();

      let accountId: string;
      if (existing?.stripe_account_id) {
        accountId = existing.stripe_account_id;
      } else {
        const account = await stripeModule.accounts.create({
          type: 'express',
          capabilities: { transfers: { requested: true } },
        });
        accountId = account.id;
        await supabaseClient
          .from('stripe_accounts')
          .insert({ artist_id: artistId, stripe_account_id: accountId });
      }

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const link = await stripeModule.accountLinks.create({
        account: accountId,
        refresh_url: `${appUrl}/artist/dashboard`,
        return_url: `${appUrl}/artist/dashboard?connect=complete`,
        type: 'account_onboarding',
      });

      res.json({ url: link.url });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Connect webhook — must receive raw body for signature verification
  router.post(
    '/connect/webhook',
    webhookLimiter,
    rawJson,
    async (req, res) => {
      try {
        const webhookSecret =
          process.env.STRIPE_CONNECT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
        if (!stripeModule || !webhookSecret || !supabaseClient) {
          return res.status(503).json({ error: 'Stripe webhook not configured' });
        }

        const sig = req.headers['stripe-signature'];
        const event: Stripe.Event = stripeModule.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );

        if (event.type === 'account.updated') {
          const account = event.data.object as Stripe.Account;
          await supabaseClient
            .from('stripe_accounts')
            .update({
              onboarding_complete: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
            })
            .eq('stripe_account_id', account.id);
        }
        res.json({ received: true });
      } catch (webhookErr: any) {
        log('error', 'Stripe connect webhook error:', webhookErr.message);
        res.status(400).json({ error: 'Webhook verification failed' });
      }
    }
  );

  // Admin payout
  router.post('/payout', financialLimiter, requireAdmin, async (req, res) => {
    try {
      if (!stripeModule) return res.status(500).json({ error: 'Payments not configured' });
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { statementId, artistId, amount } = req.body;
      if (!artistId || !amount) return res.status(400).json({ error: 'artistId and amount required' });

      const { data: account } = await supabaseClient
        .from('stripe_accounts')
        .select('*')
        .eq('artist_id', artistId)
        .single();
      if (!account?.stripe_account_id)
        return res.status(400).json({ error: 'Artist has not connected Stripe' });
      if (!account.payouts_enabled)
        return res.status(400).json({ error: 'Artist Stripe account not ready for payouts' });

      const transfer = await stripeModule.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: account.stripe_account_id,
      });

      if (statementId) {
        await supabaseClient
          .from('royalty_statements')
          .update({ stripe_transfer_id: transfer.id, status: 'paid' })
          .eq('id', statementId);
      }

      res.json({ transfer_id: transfer.id, amount, status: 'paid' });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  return router;
}