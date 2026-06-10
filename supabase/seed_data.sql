-- NcSound Seed Data
-- Run AFTER full_deploy.sql to populate sample data

-- Sample artists
INSERT INTO public.artists (user_id, legal_name, stage_name, pro_affiliation, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tap919', 'Tap919', 'BMI', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Niro Artist', 'Mr. Niro', 'ASCAP', 'active');

-- Sample tracks
INSERT INTO public.tracks (artist_id, title, genre, bpm, key_signature, energy_level, mood_tags, instrumentation, status, visibility, owns_master, owns_publishing) VALUES
  ((SELECT id FROM public.artists WHERE stage_name = 'Tap919'), 'Snooze Remix', 'R&B', 92, 'C min', 'Medium', ARRAY['Chill', 'Smooth', 'Night'], ARRAY['Piano', '808', 'Pad'], 'active', 'public', true, true),
  ((SELECT id FROM public.artists WHERE stage_name = 'Tap919'), 'I Want It That Way Remix', 'Pop', 98, 'G maj', 'High', ARRAY['Energetic', 'Uplifting'], ARRAY['Guitar', 'Drums', 'Bass'], 'active', 'public', true, true),
  ((SELECT id FROM public.artists WHERE stage_name = 'Tap919'), 'Loyal Remix', 'Hip-Hop', 88, 'D min', 'High', ARRAY['Boom Bap', 'Gritty'], ARRAY['808', 'Hi-hat', 'Sample'], 'active', 'supervisors_only', true, true),
  ((SELECT id FROM public.artists WHERE stage_name = 'Mr. Niro'), 'Top 5', 'Hip-Hop', 95, 'E min', 'High', ARRAY['Hard', 'Confident'], ARRAY['808', 'Strings', 'Clap'], 'active', 'public', true, true),
  ((SELECT id FROM public.artists WHERE stage_name = 'Mr. Niro'), 'The War Freestyle', 'Drill', 140, 'Bb min', 'Very High', ARRAY['Aggressive', 'Dark'], ARRAY['Hi-hat', '808', 'Synth'], 'active', 'supervisors_only', true, true);

-- Sample track files
INSERT INTO public.track_files (track_id, file_type, storage_url, is_watermarked) VALUES
  ((SELECT id FROM public.tracks WHERE title = 'Snooze Remix'), 'master', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', false),
  ((SELECT id FROM public.tracks WHERE title = 'Snooze Remix'), 'preview', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', true),
  ((SELECT id FROM public.tracks WHERE title = 'I Want It That Way Remix'), 'master', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', false);

-- Sample writers
INSERT INTO public.track_writers (track_id, writer_name, writer_share, publisher_share) VALUES
  ((SELECT id FROM public.tracks WHERE title = 'Snooze Remix'), 'Tap919', 50.00, 50.00),
  ((SELECT id FROM public.tracks WHERE title = 'Snooze Remix'), 'NcSound Publishing', 50.00, 50.00);

-- Sample beat store products
INSERT INTO public.beat_store_products (artist_id, title, lease_price, exclusive_price, status) VALUES
  ((SELECT id FROM public.artists WHERE stage_name = 'Tap919'), 'Midnight Drive', 29.99, 299.99, 'active'),
  ((SELECT id FROM public.artists WHERE stage_name = 'Tap919'), 'Summer Nights', 39.99, 399.99, 'active'),
  ((SELECT id FROM public.artists WHERE stage_name = 'Mr. Niro'), 'Street Dreams', 49.99, 499.99, 'active'),
  ((SELECT id FROM public.artists WHERE stage_name = 'Tap919'), 'Neon Lights', 34.99, 349.99, 'active');
