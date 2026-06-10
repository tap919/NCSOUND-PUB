-- Track embeddings for semantic search
CREATE TABLE IF NOT EXISTS public.track_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE UNIQUE,
    embedding JSONB NOT NULL,
    model TEXT DEFAULT 'gemini-text-embedding',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outreach campaigns
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

-- Outreach recipients
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

-- Brief-track matches
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

CREATE POLICY admin_all_embeddings ON public.track_embeddings FOR ALL USING (public.is_admin());
CREATE POLICY admin_all_outreach_campaigns ON public.outreach_campaigns FOR ALL USING (public.is_admin());
CREATE POLICY admin_all_outreach_recipients ON public.outreach_recipients FOR ALL USING (public.is_admin());
CREATE POLICY admin_all_brief_matches ON public.brief_matches FOR ALL USING (public.is_admin());
