-- RLS policies for tables missing protection
-- agreements: admin-only read, admin insert
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read_agreements" ON agreements FOR SELECT USING (public.is_admin());
CREATE POLICY "admin_insert_agreements" ON agreements FOR INSERT WITH CHECK (public.is_admin());

-- beat_store_products: public read for active, owner manage own
ALTER TABLE beat_store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_active_beats" ON beat_store_products FOR SELECT USING (status = 'active');
CREATE POLICY "artist_manage_own_beats" ON beat_store_products FOR ALL USING (artist_id = auth.uid());

-- Fix overly permissive track_writers SELECT
DROP POLICY IF EXISTS "public_read_track_writers" ON track_writers;
CREATE POLICY "track_writers_owner_select" ON track_writers FOR SELECT
  USING (track_id IN (SELECT id FROM tracks WHERE artist_id = auth.uid()));
CREATE POLICY "admin_read_track_writers" ON track_writers FOR SELECT USING (public.is_admin());

-- Performance indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_deals_brief_id ON deals(brief_id);
CREATE INDEX IF NOT EXISTS idx_beat_store_products_artist_id ON beat_store_products(artist_id);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_created_at ON royalty_statements(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_supervisor_access_requests_created_at ON supervisor_access_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_license_requests_created_at ON license_requests(created_at);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON royalty_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON beat_store_products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON agreements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
