-- ============================================
-- Migration 013: Enable RLS on unprotected tables
-- Each statement uses IF EXISTS to handle partial deployments  
-- Note: artist_links table not present in production (skipped)
-- ============================================================

-- 1. public.users
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_self" ON public.users;
CREATE POLICY "users_self" ON public.users FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_admin" ON public.users;
CREATE POLICY "users_admin" ON public.users FOR ALL USING (auth.role() = 'service_role');

-- 2. public.supervisors
ALTER TABLE IF EXISTS public.supervisors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "supervisors_self" ON public.supervisors;
CREATE POLICY "supervisors_self" ON public.supervisors FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "supervisors_admin" ON public.supervisors;
CREATE POLICY "supervisors_admin" ON public.supervisors FOR ALL USING (auth.role() = 'service_role');

-- 3. public.track_writers
ALTER TABLE IF EXISTS public.track_writers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "track_writers_select" ON public.track_writers;
CREATE POLICY "track_writers_select" ON public.track_writers FOR SELECT USING (true);
DROP POLICY IF EXISTS "track_writers_admin" ON public.track_writers;
CREATE POLICY "track_writers_admin" ON public.track_writers FOR ALL USING (auth.role() = 'service_role');

-- 4. public.track_files
ALTER TABLE IF EXISTS public.track_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "track_files_admin" ON public.track_files;
CREATE POLICY "track_files_admin" ON public.track_files FOR ALL USING (auth.role() = 'service_role');

-- 5. public.registrations
ALTER TABLE IF EXISTS public.registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "registrations_admin" ON public.registrations;
CREATE POLICY "registrations_admin" ON public.registrations FOR ALL USING (auth.role() = 'service_role');

-- 6. public.briefs
ALTER TABLE IF EXISTS public.briefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "briefs_insert" ON public.briefs;
CREATE POLICY "briefs_insert" ON public.briefs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "briefs_admin" ON public.briefs;
CREATE POLICY "briefs_admin" ON public.briefs FOR ALL USING (auth.role() = 'service_role');

-- 7. public.deals
ALTER TABLE IF EXISTS public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deals_admin" ON public.deals;
CREATE POLICY "deals_admin" ON public.deals FOR ALL USING (auth.role() = 'service_role');

-- 8. public.deal_tracks
ALTER TABLE IF EXISTS public.deal_tracks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deal_tracks_admin" ON public.deal_tracks;
CREATE POLICY "deal_tracks_admin" ON public.deal_tracks FOR ALL USING (auth.role() = 'service_role');

-- 9. public.beat_store_orders
ALTER TABLE IF EXISTS public.beat_store_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "beat_orders_admin" ON public.beat_store_orders;
CREATE POLICY "beat_orders_admin" ON public.beat_store_orders FOR ALL USING (auth.role() = 'service_role');
