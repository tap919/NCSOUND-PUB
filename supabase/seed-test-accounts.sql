-- ============================================
-- Seed test accounts for E2E tests
-- Run AFTER the RLS migration (20260616205741_rls_enable_all_tables.sql)
-- Requires Supabase service_role key (runs outside RLS)
-- ============================================

-- 1. Test Artist account
--    Email: testartist@ncsound.test
--    Password: test123
--    Creates auth user + public.users row + artist profile
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token,
  recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'testartist@ncsound.test',
  crypt('test123', gen_salt('bf')),
  now(), now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, full_name, role) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'testartist@ncsound.test',
  'Test Artist', 'artist'
) ON CONFLICT (id) DO NOTHING;

-- 2. Test Admin account
--    Email: testadmin@ncsound.test
--    Password: test123
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token,
  recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'testadmin@ncsound.test',
  crypt('test123', gen_salt('bf')),
  now(), now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, full_name, role) VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'testadmin@ncsound.test',
  'Test Admin', 'admin'
) ON CONFLICT (id) DO NOTHING;

-- 3. Sample tracks for catalog E2E tests
INSERT INTO public.beat_store_products (id, title, producer, genre, bpm, key, status, price_tiers) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'Test Beat One', 'Test Producer', 'Hip-Hop', 90, 'Cm', 'active', '{"basic": 29.99, "premium": 49.99, "exclusive": 199.99}'),
  ('d4444444-4444-4444-4444-444444444444', 'Test Beat Two', 'Test Producer', 'R&B', 85, 'Am', 'active', '{"basic": 29.99, "premium": 49.99, "exclusive": 199.99}')
ON CONFLICT (id) DO NOTHING;

-- 4. Sample tracks in tracks table
INSERT INTO public.tracks (id, title, artist_id, genre, bpm, key, status) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'Test Track One', 'a1111111-1111-1111-1111-111111111111', 'Hip-Hop', 90, 'Cm', 'active'),
  ('f6666666-6666-6666-6666-666666666666', 'Test Track Two', 'a1111111-1111-1111-1111-111111111111', 'R&B', 85, 'Am', 'active')
ON CONFLICT (id) DO NOTHING;
