-- Schema fixes: missing indexes, unique constraints, and triggers

-- ==========================================
-- 1. MISSING INDEXES for common query patterns
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON public.tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_status ON public.tracks(status);
CREATE INDEX IF NOT EXISTS idx_registrations_track_id ON public.registrations(track_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_artist ON public.royalty_statements(artist_id);
CREATE INDEX IF NOT EXISTS idx_beat_store_products_artist ON public.beat_store_products(artist_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON public.briefs(status);
CREATE INDEX IF NOT EXISTS idx_brief_matches_brief_id ON public.brief_matches(brief_id);
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_status ON public.outreach_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_license_purchases_track ON public.license_purchases(track_id);

-- ==========================================
-- 2. MISSING UNIQUE CONSTRAINTS
-- ==========================================
ALTER TABLE public.stripe_accounts ADD CONSTRAINT unique_stripe_account_artist UNIQUE (artist_id);
ALTER TABLE public.stripe_accounts ADD CONSTRAINT unique_stripe_account_id UNIQUE (stripe_account_id);
ALTER TABLE public.track_analysis ADD CONSTRAINT unique_track_analysis UNIQUE (track_id);
ALTER TABLE public.track_embeddings ADD CONSTRAINT unique_track_embedding UNIQUE (track_id);
ALTER TABLE public.subscription_plans ADD CONSTRAINT unique_stripe_price_id UNIQUE (stripe_price_id);

-- ==========================================
-- 3. AUTO-UPDATE updated_at TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.auto_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
          AND table_name NOT IN ('users') -- users handled by Supabase auth
    LOOP
        EXECUTE format(
            'CREATE TRIGGER IF NOT EXISTS trg_%s_updated_at
             BEFORE UPDATE ON public.%I
             FOR EACH ROW
             EXECUTE FUNCTION public.auto_update_updated_at()',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- ==========================================
-- 4. ADD MISSING ON DELETE CASCADE
-- Note: Only safe for tables where child depends on parent
-- Already added in migrations, verified below are the missing ones
-- ==========================================
-- metadata_quality references artists - already has ON DELETE CASCADE
-- stripe_accounts references artists - already has ON DELETE CASCADE
-- All new migrations already include CASCADE

-- ==========================================
-- 5. PREVENT DUPLICATE PLATFORM INCOME
-- ==========================================
ALTER TABLE public.platform_income
  ADD CONSTRAINT unique_platform_income_period
  UNIQUE (track_id, platform, period_start, period_end);

-- ==========================================
-- 6. PREVENT DUPLICATE INTEGRATION CONFIGS
-- ==========================================
ALTER TABLE public.integration_configs
  ADD CONSTRAINT unique_integration_config
  UNIQUE (platform, config_key, COALESCE(artist_id, '00000000-0000-0000-0000-000000000000'));
