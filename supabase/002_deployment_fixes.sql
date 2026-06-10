-- NcSound Deployment Fixes & Schema Extensions
-- Run this AFTER ncsound_schema.sql

-- ==========================================
-- 1. ARTIST AUTO-CREATION TRIGGER
-- When a public.users row is created with role='artist',
-- auto-create the matching artists row
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_artist()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'artist' THEN
    INSERT INTO public.artists (user_id, legal_name, stage_name, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.display_name, 'New Artist'),
      NEW.display_name,
      'active'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_artist_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  WHEN (NEW.role = 'artist')
  EXECUTE FUNCTION public.handle_new_artist();

-- ==========================================
-- 2. CONTACT SUBMISSIONS TABLE
-- Stores contact form inquiries from the About page
-- ==========================================
CREATE TABLE public.contact_submissions (
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

CREATE POLICY contact_submissions_insert ON public.contact_submissions
    FOR INSERT
    WITH CHECK (true);

-- ==========================================
-- 3. SUPERVISOR ACCESS REQUESTS TABLE
-- Stores pending supervisor verification requests
-- ==========================================
CREATE TABLE public.supervisor_access_requests (
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

CREATE POLICY supervisor_access_requests_insert ON public.supervisor_access_requests
    FOR INSERT
    WITH CHECK (true);

-- ==========================================
-- 4. SAVED TRACKS (Supervisor Playlist)
-- Supervisors can save tracks for later review
-- ==========================================
CREATE TABLE public.saved_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

ALTER TABLE public.saved_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY supervisors_manage_saved_tracks ON public.saved_tracks
    FOR ALL
    USING (user_id = auth.uid());

-- ==========================================
-- 5. LICENSE REQUESTS
-- Supervisors request to license specific tracks
-- ==========================================
CREATE TABLE public.license_requests (
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

CREATE POLICY license_requests_insert ON public.license_requests
    FOR INSERT
    WITH CHECK (true);

-- ==========================================
-- 6. TRACK PLAYS (Analytics)
-- Tracks how many times supervisors preview tracks
-- ==========================================
CREATE TABLE public.track_plays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.track_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY track_plays_insert ON public.track_plays
    FOR INSERT
    WITH CHECK (true);

-- ==========================================
-- 7. EXTEND BRIEFS TABLE WITH ADDITIONAL FIELDS
-- (Run as ALTER since table already exists)
-- ==========================================
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS requester_email TEXT;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS requester_company TEXT;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS deadline DATE;
