-- NcSound Publishing — Integration Framework
-- Paste into Supabase SQL Editor and run after ncsound_schema.sql

-- Integration configs (encrypted API keys/credentials per platform)
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

-- Platform income (streaming, downloads, sync from DSPs)
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

-- Royalty collections from PROs / collecting societies
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

-- CWR export tracking
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

-- Split rules (platform-specific overrides for track splits)
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

-- Income summary view
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

-- RLS policies
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cwr_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cwr_export_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_integrations ON public.integration_configs
    FOR ALL USING (public.is_admin());

CREATE POLICY admin_all_platform_income ON public.platform_income
    FOR ALL USING (public.is_admin());

CREATE POLICY artists_view_own_income ON public.platform_income
    FOR SELECT USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY admin_all_royalty_collections ON public.royalty_collections
    FOR ALL USING (public.is_admin());

CREATE POLICY artists_view_own_royalties ON public.royalty_collections
    FOR SELECT USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY admin_all_cwr ON public.cwr_exports
    FOR ALL USING (public.is_admin());

CREATE POLICY admin_all_split_rules ON public.split_rules
    FOR ALL USING (public.is_admin());
