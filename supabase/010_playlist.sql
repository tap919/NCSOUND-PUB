-- Playlist submissions, credits, exclusive licensing

-- Playlist submissions with quality analysis
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

-- Submission credits (monthly allowance per user)
CREATE TABLE IF NOT EXISTS public.submission_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    monthly_limit INT DEFAULT 3,
    credits_used INT DEFAULT 0,
    month TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exclusive license offers
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

CREATE POLICY public_submit ON public.playlist_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY users_view_own ON public.playlist_submissions FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY admin_all_playlist ON public.playlist_submissions FOR ALL USING (public.is_admin());

CREATE POLICY users_own_credits ON public.submission_credits FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY admin_all_credits ON public.submission_credits FOR ALL USING (public.is_admin());

CREATE POLICY artists_own_offers ON public.exclusive_offers FOR ALL USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY admin_all_offers ON public.exclusive_offers FOR ALL USING (public.is_admin());
