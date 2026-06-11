-- ==========================================
-- NCSOUND — Consolidated Migration 002-011
-- Run this entire file in Supabase SQL Editor
-- Safe to run multiple times
-- ==========================================

-- ==========================================
-- 002 — DEPLOYMENT FIXES
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_artist()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'artist' THEN
    INSERT INTO public.artists (user_id, legal_name, stage_name, status)
    VALUES (NEW.id, COALESCE(NEW.display_name, 'New Artist'), NEW.display_name, 'active');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_artist_user_created ON public.users;
CREATE TRIGGER on_artist_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  WHEN (NEW.role = 'artist')
  EXECUTE FUNCTION public.handle_new_artist();

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL,
    company TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'contact_submissions_insert') THEN
    CREATE POLICY contact_submissions_insert ON public.contact_submissions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.supervisor_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    links TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.supervisor_access_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supervisor_access_requests' AND policyname = 'supervisor_access_requests_insert') THEN
    CREATE POLICY supervisor_access_requests_insert ON public.supervisor_access_requests FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.saved_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

ALTER TABLE public.saved_tracks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_tracks' AND policyname = 'supervisors_manage_saved_tracks') THEN
    CREATE POLICY supervisors_manage_saved_tracks ON public.saved_tracks FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.license_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    requester_email TEXT NOT NULL,
    requester_name TEXT,
    company TEXT,
    project_name TEXT,
    use_type TEXT,
    budget_range TEXT,
    deadline DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.license_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'license_requests' AND policyname = 'license_requests_insert') THEN
    CREATE POLICY license_requests_insert ON public.license_requests FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.track_plays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.track_plays ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'track_plays' AND policyname = 'track_plays_insert') THEN
    CREATE POLICY track_plays_insert ON public.track_plays FOR INSERT WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS requester_email TEXT;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS requester_company TEXT;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS deadline DATE;

-- ==========================================
-- 003 — PATCH
-- ==========================================

ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agreements' AND policyname = 'artists_own_agreements') THEN
    CREATE POLICY artists_own_agreements ON public.agreements
      FOR ALL USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
        OR public.is_admin()
      );
  END IF;
END $$;

ALTER TABLE public.beat_store_products
  ADD COLUMN IF NOT EXISTS bpm INT,
  ADD COLUMN IF NOT EXISTS genre TEXT,
  ADD COLUMN IF NOT EXISTS mood_tags TEXT[],
  ADD COLUMN IF NOT EXISTS cover_art_url TEXT,
  ADD COLUMN IF NOT EXISTS preview_url TEXT;

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.supervisors(id) ON DELETE SET NULL;

-- ==========================================
-- 004 — INTEGRATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.integration_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL CHECK (platform IN (
        'mlc','bandcamp','spotify','soundcloud',
        'ascap','bmi','sesac','soundexchange','songtrust','hfa',
        'tuneregistry','apple_music'
    )),
    config_key TEXT NOT NULL,
    config_value TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, config_key, artist_id)
);

CREATE TABLE IF NOT EXISTS public.platform_income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN (
        'spotify','soundcloud','bandcamp','apple_music',
        'youtube','tiktok','amazon','deezer','pandora','other'
    )),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    stream_count BIGINT DEFAULT 0,
    download_count BIGINT DEFAULT 0,
    gross_revenue NUMERIC(12,4) DEFAULT 0.0000,
    net_revenue NUMERIC(12,4) DEFAULT 0.0000,
    currency TEXT DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_income_track ON public.platform_income(track_id);
CREATE INDEX IF NOT EXISTS idx_platform_income_artist ON public.platform_income(artist_id);
CREATE INDEX IF NOT EXISTS idx_platform_income_period ON public.platform_income(period_start, period_end);

CREATE TABLE IF NOT EXISTS public.royalty_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    collection_entity TEXT NOT NULL CHECK (collection_entity IN (
        'ascap','bmi','sesac','soundexchange','hfa','mlc','songtrust','other'
    )),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    source_type TEXT CHECK (source_type IN (
        'performance','mechanical','sync','broadcast','digital','neighboring','other'
    )),
    gross_amount NUMERIC(12,2) DEFAULT 0.00,
    net_amount NUMERIC(12,2) DEFAULT 0.00,
    fee_amount NUMERIC(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    statement_url TEXT,
    statement_file_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_royalty_collections_artist ON public.royalty_collections(artist_id);
CREATE INDEX IF NOT EXISTS idx_royalty_collections_entity ON public.royalty_collections(collection_entity);

CREATE TABLE IF NOT EXISTS public.cwr_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_type TEXT NOT NULL DEFAULT 'new_works' CHECK (export_type IN ('new_works','amendment','withdrawal')),
    file_name TEXT,
    file_url TEXT,
    record_count INT DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending','submitted','accepted','rejected')),
    submitted_at TIMESTAMPTZ,
    response_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cwr_export_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cwr_export_id UUID REFERENCES public.cwr_exports(id) ON DELETE CASCADE,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    transaction_type TEXT DEFAULT 'NWN' CHECK (transaction_type IN ('NWN','REV','AME')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.split_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    platform TEXT,
    writer_name TEXT NOT NULL,
    writer_share NUMERIC(5,2) DEFAULT 0.00 CHECK (writer_share >= 0 AND writer_share <= 100),
    publisher_share NUMERIC(5,2) DEFAULT 0.00 CHECK (publisher_share >= 0 AND publisher_share <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW public.income_summary AS
SELECT
    COALESCE(pi.artist_id, rc.artist_id) AS artist_id,
    COALESCE(pi.platform, rc.collection_entity) AS source,
    CASE WHEN pi.id IS NOT NULL THEN 'platform' ELSE 'royalty' END AS source_type,
    COALESCE(pi.period_start, rc.period_start) AS period_start,
    COALESCE(pi.period_end, rc.period_end) AS period_end,
    COALESCE(pi.gross_revenue, rc.gross_amount) AS gross_amount,
    COALESCE(pi.net_revenue, rc.net_amount) AS net_amount,
    pi.stream_count,
    pi.download_count,
    pi.track_id,
    pi.created_at
FROM public.platform_income pi
FULL OUTER JOIN public.royalty_collections rc
    ON pi.artist_id = rc.artist_id
    AND pi.period_start = rc.period_start;

ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cwr_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cwr_export_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_rules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'integration_configs' AND policyname = 'admin_all_integrations') THEN
    CREATE POLICY admin_all_integrations ON public.integration_configs FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_income' AND policyname = 'admin_all_platform_income') THEN
    CREATE POLICY admin_all_platform_income ON public.platform_income FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_income' AND policyname = 'artists_view_own_income') THEN
    CREATE POLICY artists_view_own_income ON public.platform_income
      FOR SELECT USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()) OR public.is_admin()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'royalty_collections' AND policyname = 'admin_all_royalty_collections') THEN
    CREATE POLICY admin_all_royalty_collections ON public.royalty_collections FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'royalty_collections' AND policyname = 'artists_view_own_royalties') THEN
    CREATE POLICY artists_view_own_royalties ON public.royalty_collections
      FOR SELECT USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()) OR public.is_admin()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cwr_exports' AND policyname = 'admin_all_cwr') THEN
    CREATE POLICY admin_all_cwr ON public.cwr_exports FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'split_rules' AND policyname = 'admin_all_split_rules') THEN
    CREATE POLICY admin_all_split_rules ON public.split_rules FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ==========================================
-- 005 — ANALYSIS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.track_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE UNIQUE,
    bpm NUMERIC(6,2),
    key TEXT,
    key_confidence NUMERIC(5,4),
    energy TEXT CHECK (energy IN ('low','medium','high','very_high')),
    energy_score NUMERIC(5,2),
    mood_tags TEXT[],
    genre TEXT,
    genre_confidence NUMERIC(5,4),
    instrumentation TEXT[],
    analysis_model TEXT DEFAULT 'gemini-2.5-pro',
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metadata_quality (
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE PRIMARY KEY,
    total_tracks INT DEFAULT 0,
    fields_filled JSONB DEFAULT '{}',
    overall_score NUMERIC(5,2) DEFAULT 0.00,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.track_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata_quality ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'track_analysis' AND policyname = 'admin_all_track_analysis') THEN
    CREATE POLICY admin_all_track_analysis ON public.track_analysis FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'track_analysis' AND policyname = 'artists_view_own_analysis') THEN
    CREATE POLICY artists_view_own_analysis ON public.track_analysis
      FOR SELECT USING (
        track_id IN (SELECT id FROM public.tracks WHERE artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()))
        OR public.is_admin()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'metadata_quality' AND policyname = 'admin_all_metadata_quality') THEN
    CREATE POLICY admin_all_metadata_quality ON public.metadata_quality FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ==========================================
-- 006 — VECTOR / EMBEDDINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.track_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE UNIQUE,
    embedding JSONB NOT NULL,
    model TEXT DEFAULT 'gemini-text-embedding',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.outreach_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id UUID REFERENCES public.briefs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','opened','replied','closed')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.outreach_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.outreach_campaigns(id) ON DELETE CASCADE,
    supervisor_id UUID REFERENCES public.supervisors(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','opened','replied','bounced','unsubscribed')),
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.brief_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id UUID REFERENCES public.briefs(id) ON DELETE CASCADE,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    relevance_score NUMERIC(5,4) DEFAULT 0.0000,
    match_reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','selected','rejected','pitched')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brief_id, track_id)
);

ALTER TABLE public.track_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'track_embeddings' AND policyname = 'admin_all_embeddings') THEN
    CREATE POLICY admin_all_embeddings ON public.track_embeddings FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outreach_campaigns' AND policyname = 'admin_all_outreach_campaigns') THEN
    CREATE POLICY admin_all_outreach_campaigns ON public.outreach_campaigns FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outreach_recipients' AND policyname = 'admin_all_outreach_recipients') THEN
    CREATE POLICY admin_all_outreach_recipients ON public.outreach_recipients FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brief_matches' AND policyname = 'admin_all_brief_matches') THEN
    CREATE POLICY admin_all_brief_matches ON public.brief_matches FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ==========================================
-- 008 — REVENUE / STRIPE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.stripe_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE UNIQUE,
    stripe_account_id TEXT NOT NULL,
    onboarding_complete BOOLEAN DEFAULT false,
    payouts_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_price_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
    role TEXT NOT NULL CHECK (role IN ('artist', 'supervisor')),
    features TEXT[],
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    status TEXT DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'active', 'past_due', 'canceled', 'incomplete_expired')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.license_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stripe_price_id TEXT,
    use_type TEXT NOT NULL CHECK (use_type IN ('micro', 'creator', 'indie_film', 'standard', 'custom')),
    term TEXT DEFAULT 'perpetual',
    territory TEXT DEFAULT 'worldwide',
    exclusivity TEXT DEFAULT 'non-exclusive',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.license_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    buyer_email TEXT NOT NULL,
    license_product_id UUID REFERENCES public.license_products(id),
    license_type TEXT NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL,
    stripe_payment_id TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_purchases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_accounts' AND policyname = 'admin_all_stripe_accounts') THEN
    CREATE POLICY admin_all_stripe_accounts ON public.stripe_accounts FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_accounts' AND policyname = 'artists_own_stripe') THEN
    CREATE POLICY artists_own_stripe ON public.stripe_accounts
      FOR ALL USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()) OR public.is_admin()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'admin_all_subscriptions') THEN
    CREATE POLICY admin_all_subscriptions ON public.subscriptions FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'users_own_subscriptions') THEN
    CREATE POLICY users_own_subscriptions ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'license_purchases' AND policyname = 'admin_all_license_purchases') THEN
    CREATE POLICY admin_all_license_purchases ON public.license_purchases FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ==========================================
-- 009 — INDEXES, CONSTRAINTS, TRIGGERS
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

CREATE OR REPLACE FUNCTION public.auto_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
          AND table_name NOT IN ('users')
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = format('trg_%s_updated_at', tbl) AND event_object_table = tbl) THEN
            EXECUTE format(
                'CREATE TRIGGER trg_%s_updated_at
                 BEFORE UPDATE ON public.%I
                 FOR EACH ROW
                 EXECUTE FUNCTION public.auto_update_updated_at()',
                tbl, tbl
            );
        END IF;
    END LOOP;
END;
$$;

-- ==========================================
-- 010 — PLAYLIST SUBMISSIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.playlist_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    artist_name TEXT NOT NULL,
    track_title TEXT NOT NULL,
    audio_url TEXT,
    genre TEXT,
    bpm NUMERIC(6,2),
    mood_tags TEXT[],
    description TEXT,
    quality_score NUMERIC(5,2),
    quality_feedback TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','analyzing','approved','rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submission_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    monthly_limit INT DEFAULT 3,
    credits_used INT DEFAULT 0,
    month TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exclusive_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    licensee_name TEXT NOT NULL,
    offer_amount NUMERIC(10,2) NOT NULL,
    ncsound_cut NUMERIC(10,2) DEFAULT 0.00,
    artist_payout NUMERIC(10,2) DEFAULT 0.00,
    pro_split NUMERIC(5,2) DEFAULT 50.00,
    mechanical_split NUMERIC(5,2) DEFAULT 50.00,
    publishing_split NUMERIC(5,2) DEFAULT 50.00,
    terms TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','negotiating','accepted','declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.playlist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusive_offers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlist_submissions' AND policyname = 'public_submit') THEN
    CREATE POLICY public_submit ON public.playlist_submissions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlist_submissions' AND policyname = 'users_view_own') THEN
    CREATE POLICY users_view_own ON public.playlist_submissions
      FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlist_submissions' AND policyname = 'admin_all_playlist') THEN
    CREATE POLICY admin_all_playlist ON public.playlist_submissions FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submission_credits' AND policyname = 'users_own_credits') THEN
    CREATE POLICY users_own_credits ON public.submission_credits
      FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submission_credits' AND policyname = 'admin_all_credits') THEN
    CREATE POLICY admin_all_credits ON public.submission_credits FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exclusive_offers' AND policyname = 'artists_own_offers') THEN
    CREATE POLICY artists_own_offers ON public.exclusive_offers
      FOR ALL USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()) OR public.is_admin()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exclusive_offers' AND policyname = 'admin_all_offers') THEN
    CREATE POLICY admin_all_offers ON public.exclusive_offers FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ==========================================
-- 011 — BEAT CATALOG EXTENSION
-- ==========================================

ALTER TABLE public.beat_store_products
  ADD COLUMN IF NOT EXISTS genre text,
  ADD COLUMN IF NOT EXISTS subgenres text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bpm integer,
  ADD COLUMN IF NOT EXISTS musical_key text,
  ADD COLUMN IF NOT EXISTS mood_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS energy text CHECK (energy IN ('low', 'medium', 'high', 'very_high')),
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS cover_art_url text,
  ADD COLUMN IF NOT EXISTS stems_available boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sync_suitability text CHECK (sync_suitability IN ('low', 'medium', 'high', 'very_high')),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS instrumentation text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_first_wave boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_wave_price numeric(10,2) DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS split_percentage integer DEFAULT 20;

CREATE INDEX IF NOT EXISTS idx_beat_store_products_genre ON public.beat_store_products(genre);
CREATE INDEX IF NOT EXISTS idx_beat_store_products_bpm ON public.beat_store_products(bpm);
CREATE INDEX IF NOT EXISTS idx_beat_store_products_first_wave ON public.beat_store_products(is_first_wave) WHERE is_first_wave = true;

ALTER TABLE public.beat_store_products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beat_store_products' AND policyname = 'Anyone can view active beats') THEN
    CREATE POLICY "Anyone can view active beats" ON public.beat_store_products
      FOR SELECT USING (status = 'active');
  END IF;
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================
SELECT 'Migration complete' AS status,
  (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') AS total_tables,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public') AS total_policies;
