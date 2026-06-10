-- Track analysis results (BPM, key, energy, etc.)
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

-- Metadata quality scores (cached per artist)
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

CREATE POLICY admin_all_track_analysis ON public.track_analysis FOR ALL USING (public.is_admin());
CREATE POLICY artists_view_own_analysis ON public.track_analysis FOR SELECT USING (
    track_id IN (SELECT id FROM public.tracks WHERE artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()))
    OR public.is_admin()
);
CREATE POLICY admin_all_metadata_quality ON public.metadata_quality FOR ALL USING (public.is_admin());
