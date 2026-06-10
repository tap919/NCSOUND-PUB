-- NcSound Schema Patch 003 — Post-deployment fixes
-- Run AFTER full_deploy.sql (safe to run multiple times)

-- ==========================================
-- 1. AGREEMENTS RLS POLICY
-- Artist agreements should only be visible to the artist and admins
-- ==========================================
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS artists_own_agreements ON public.agreements
    FOR ALL
    USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
        OR public.is_admin()
    );

-- ==========================================
-- 2. BEAT STORE PRODUCTS — add missing columns
-- The Beat Store UI displays BPM, genre, mood, cover art, preview audio
-- ==========================================
ALTER TABLE public.beat_store_products
  ADD COLUMN IF NOT EXISTS bpm INT,
  ADD COLUMN IF NOT EXISTS genre TEXT,
  ADD COLUMN IF NOT EXISTS mood_tags TEXT[],
  ADD COLUMN IF NOT EXISTS cover_art_url TEXT,
  ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- ==========================================
-- 3. DEALS — add supervisor_id FK for direct supervisor reporting
-- ==========================================
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.supervisors(id) ON DELETE SET NULL;

-- ==========================================
-- 4. TRACK FILES — ensure seed data values match the CHECK constraint
-- The constraint allows: 'master', 'preview', 'instrumental', 'stems', 'clean'
-- Old schema used 'wav_master'/'mp3_preview' — those will be rejected
-- ==========================================
-- No ALTER needed — the constraint in full_deploy.sql is already correct.
-- Just documenting: valid values are ('master', 'preview', 'instrumental', 'stems', 'clean')
