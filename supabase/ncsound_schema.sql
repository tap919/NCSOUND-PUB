-- NcSound Publishing Database Schema
-- Paste this entire file into the Supabase SQL Editor and click "Run"

-- ==========================================
-- 1. EXTENSIONS & ENUMS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Auth & Identity
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('artist', 'supervisor', 'admin')),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    legal_name TEXT NOT NULL,
    stage_name TEXT,
    pro_affiliation TEXT,
    ipi_number TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.supervisors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company TEXT,
    specialties TEXT[],
    verified BOOLEAN DEFAULT false,
    tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'verified', 'preferred')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catalog & Rights
CREATE TABLE public.agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    admin_commission NUMERIC(5,2) DEFAULT 20.00,
    term_months INT DEFAULT 12,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    docusign_envelope_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    isrc TEXT,
    iswc TEXT,
    genre TEXT,
    bpm INT,
    key_signature TEXT,
    energy_level TEXT,
    mood_tags TEXT[],
    instrumentation TEXT[],
    ai_contribution BOOLEAN DEFAULT false,
    owns_master BOOLEAN DEFAULT true,
    owns_publishing BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'pending',
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'supervisors_only', 'private')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.track_writers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    writer_name TEXT NOT NULL,
    pro_affiliation TEXT,
    ipi_number TEXT,
    writer_share NUMERIC(5,2) DEFAULT 0.00,
    publisher_share NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.track_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL CHECK (file_type IN ('master', 'preview', 'instrumental', 'stems', 'clean')),
    storage_url TEXT NOT NULL,
    sample_rate INT,
    bit_depth INT,
    is_watermarked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    registry TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    iswc_returned TEXT,
    cwr_file_id TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licensing & Deals
CREATE TABLE public.briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervisor_id UUID REFERENCES public.supervisors(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    use_type TEXT,
    mood_tags TEXT[],
    bpm_min INT,
    bpm_max INT,
    budget_min NUMERIC(10,2),
    budget_max NUMERIC(10,2),
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id UUID REFERENCES public.briefs(id) ON DELETE SET NULL,
    licensee_name TEXT NOT NULL,
    sync_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    ncsound_cut NUMERIC(10,2) DEFAULT 0.00,
    artist_payout NUMERIC(10,2) DEFAULT 0.00,
    deal_date DATE DEFAULT CURRENT_DATE,
    cue_sheet_filed BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.deal_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    music_use_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments & Commerce
CREATE TABLE public.royalty_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    gross_amount NUMERIC(10,2) NOT NULL,
    net_payout NUMERIC(10,2) NOT NULL,
    stripe_transfer_id TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.beat_store_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    lease_price NUMERIC(10,2),
    exclusive_price NUMERIC(10,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold_exclusive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.beat_store_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.beat_store_products(id) ON DELETE CASCADE,
    buyer_email TEXT NOT NULL,
    license_type TEXT NOT NULL CHECK (license_type IN ('lease', 'exclusive', 'premium')),
    amount_paid NUMERIC(10,2) NOT NULL,
    stripe_payment_id TEXT,
    license_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. TRIGGERS
-- ==========================================

-- Trigger: enforce_split_totals
CREATE OR REPLACE FUNCTION check_split_totals()
RETURNS TRIGGER AS $$
DECLARE
    total_writer NUMERIC;
    total_publisher NUMERIC;
BEGIN
    SELECT COALESCE(SUM(writer_share), 0), COALESCE(SUM(publisher_share), 0)
    INTO total_writer, total_publisher
    FROM public.track_writers
    WHERE track_id = NEW.track_id AND id != NEW.id;

    IF (total_writer + NEW.writer_share) > 100.00 THEN
        RAISE EXCEPTION 'Total writer shares for track cannot exceed 100%%.';
    END IF;

    IF (total_publisher + NEW.publisher_share) > 100.00 THEN
        RAISE EXCEPTION 'Total publisher shares for track cannot exceed 100%%.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_split_totals
    BEFORE INSERT OR UPDATE ON public.track_writers
    FOR EACH ROW
    EXECUTE FUNCTION check_split_totals();

-- Trigger: auto_calculate_splits
CREATE OR REPLACE FUNCTION calc_sync_splits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sync_fee IS NOT NULL THEN
        NEW.ncsound_cut := NEW.sync_fee * 0.20;
        NEW.artist_payout := NEW.sync_fee * 0.80;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_splits
    BEFORE INSERT OR UPDATE OF sync_fee ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION calc_sync_splits();


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_statements ENABLE ROW LEVEL SECURITY;

-- admins bypass all RLS (implied for postgres, but let's be explicit if using an admin role field)
-- Usually Supabase handles the true admin (postgres/service_role) bypassing RLS automatically.
-- We can write a helper function to check if the current auth'd user is an admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- artists_own_data
CREATE POLICY artists_own_data ON public.artists
    FOR ALL
    USING (user_id = auth.uid() OR public.is_admin());

-- artists_own_tracks
CREATE POLICY artists_own_tracks ON public.tracks
    FOR ALL
    USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()) 
        OR public.is_admin()
    );

-- artists_own_statements
CREATE POLICY artists_own_statements ON public.royalty_statements
    FOR SELECT
    USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
        OR public.is_admin()
    );

-- supervisors_view_active_tracks
CREATE POLICY supervisors_view_active_tracks ON public.tracks
    FOR SELECT
    USING (
        (status = 'active' AND visibility IN ('public', 'supervisors_only'))
        OR public.is_admin()
    );
