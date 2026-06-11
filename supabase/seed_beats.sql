-- Beat Catalog Seed Data (23 beats)
-- Generated: 2026-06-11T08:16:40.866Z
-- First Wave: $1 leases, 20% split

BEGIN;

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Smooth Lead Soul',
  1.00,
  'active',
  'Soul',
  ARRAY['70s', 'Smooth Soul', 'Retro'],
  85,
  NULL,
  ARRAY['smooth', 'warm', 'nostalgic', 'romantic'],
  'medium',
  225,
  '/assets/music/beats/smooth-lead-soul.mp3',
  NULL,
  false,
  false,
  'very_high',
  'A silky 70s-inspired soul instrumental with smooth lead lines and warm analog texture. Perfect for romantic scenes, luxury brands, or emotional storytelling.',
  ARRAY['electric piano', 'strings', 'bass', 'drums', 'lead guitar'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Blaxploitation Groove',
  1.00,
  'active',
  'Funk',
  ARRAY['70s', 'Blaxploitation', 'Groove'],
  105,
  NULL,
  ARRAY['funky', 'confident', 'gritty', 'retro'],
  'high',
  208,
  '/assets/music/beats/blaxploitation-groove.mp3',
  NULL,
  false,
  false,
  'very_high',
  'Hard-hitting blaxploitation funk with wah-wah guitar, driving bass, and punchy horns. Made for car chases, crime dramas, and retro action scenes.',
  ARRAY['wah-wah guitar', 'horns', 'funk bass', 'drums', 'organ'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  '70s Drama',
  1.00,
  'active',
  'Cinematic',
  ARRAY['70s', 'Drama', 'Orchestral'],
  80,
  NULL,
  ARRAY['dramatic', 'intense', 'suspenseful', 'cinematic'],
  'high',
  229,
  '/assets/music/beats/70s-drama.mp3',
  NULL,
  false,
  false,
  'very_high',
  'Cinematic 70s drama with sweeping strings, tense builds, and dramatic crescendos. Ideal for thriller scenes, documentary climaxes, or period pieces.',
  ARRAY['strings', 'brass', 'timpani', 'piano', 'orchestra'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Unbreak',
  1.00,
  'active',
  'Soul',
  ARRAY['70s', 'Anthem', 'Gospel'],
  85,
  NULL,
  ARRAY['uplifting', 'triumphant', 'powerful', 'determined'],
  'very_high',
  131,
  '/assets/music/beats/unbreak.mp3',
  NULL,
  false,
  false,
  'high',
  'An uplifting anthem with gospel-tinged soul, building energy, and an unbreakable spirit. Perfect for sports montages, comeback stories, and inspirational content.',
  ARRAY['piano', 'choir', 'strings', 'drums', 'bass'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Memorex',
  1.00,
  'active',
  'Soul',
  ARRAY['70s', 'Funk', 'Retro'],
  85,
  NULL,
  ARRAY['groovy', 'bouncy', 'feel-good', 'nostalgic'],
  'medium',
  134,
  '/assets/music/beats/memorex.mp3',
  NULL,
  false,
  false,
  'high',
  'A warm, tape-saturated 70s groove with a feel-good bounce. Like rediscovering an old mixtape — nostalgic and instantly likable.',
  ARRAY['clavinet', 'bass', 'drums', 'strings', 'guitar'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Better Days',
  1.00,
  'active',
  'R&B',
  ARRAY['Neo Soul', 'Chill', 'Emotional'],
  78,
  NULL,
  ARRAY['hopeful', 'emotional', 'smooth', 'reflective'],
  'low',
  255,
  '/assets/music/beats/better-days.mp3',
  NULL,
  false,
  false,
  'high',
  'A heartfelt neo-soul instrumental with warm chords and a hopeful melody. Made for emotional scenes, montages about overcoming hardship, or romantic moments.',
  ARRAY['piano', 'soft drums', 'bass', 'strings', 'pad'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Chill Soul',
  1.00,
  'active',
  'R&B',
  ARRAY['Neo Soul', 'Chill', 'Lounge'],
  78,
  NULL,
  ARRAY['chill', 'smooth', 'laid-back', 'mellow'],
  'low',
  229,
  '/assets/music/beats/chill-soul.mp3',
  NULL,
  false,
  false,
  'high',
  'Laid-back neo-soul with a mellow groove and airy textures. Perfect for lounge scenes, dating show backgrounds, or chill lifestyle content.',
  ARRAY['electric piano', 'soft drums', 'bass', 'guitar', 'synth pad'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Smooth Talker',
  1.00,
  'active',
  'R&B',
  ARRAY['Smooth', 'Late Night', 'Slow Jam'],
  78,
  NULL,
  ARRAY['smooth', 'sensual', 'late-night', 'intimate'],
  'low',
  123,
  '/assets/music/beats/smooth-talker.mp3',
  NULL,
  false,
  false,
  'high',
  'A late-night slow jam with silky keys and a seductive groove. Made for intimate scenes, romantic dinners, or luxury brand campaigns.',
  ARRAY['piano', 'bass', 'soft drums', 'synth', 'pad'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Rich Soul',
  1.00,
  'active',
  'Soul',
  ARRAY['Neo Soul', 'Warm', 'Organic'],
  85,
  NULL,
  ARRAY['rich', 'warm', 'soulful', 'organic'],
  'medium',
  152,
  '/assets/music/beats/rich-soul.mp3',
  NULL,
  false,
  false,
  'high',
  'A full-bodied soul instrumental with rich harmonic layers and organic warmth. Feels like a Sunday afternoon — deep, soulful, and satisfying.',
  ARRAY['organ', 'guitar', 'bass', 'drums', 'horns'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Velvet Vocals',
  1.00,
  'active',
  'R&B',
  ARRAY['Smooth', 'Vocal', 'Ballad'],
  78,
  NULL,
  ARRAY['smooth', 'elegant', 'velvety', 'soft'],
  'low',
  153,
  '/assets/music/beats/velvet-vocals.mp3',
  NULL,
  false,
  false,
  'high',
  'A velvety smooth instrumental built for vocalists. Soft pads, gentle rhythms, and plenty of space for a top-line. Elegant and understated.',
  ARRAY['synth pad', 'soft drums', 'bass', 'piano', 'strings'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Gutta Knocking',
  1.00,
  'active',
  'Hip-Hop',
  ARRAY['Boom Bap', 'East Coast', 'Hardcore'],
  90,
  NULL,
  ARRAY['hard', 'street', 'grimey', 'confident'],
  'high',
  126,
  '/assets/music/beats/gutta-knocking.mp3',
  NULL,
  false,
  false,
  'medium',
  'Raw boom bap with hard-knocking drums and gritty samples. Street-ready and unapologetic. Made for urban dramas, documentary segments, or underground hip-hop projects.',
  ARRAY['drums', 'sample chops', 'bass', 'scratch'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Thug Pain',
  1.00,
  'active',
  'Hip-Hop',
  ARRAY['Boom Bap', 'Emotional', 'Storytelling'],
  90,
  NULL,
  ARRAY['emotional', 'dark', 'reflective', 'raw'],
  'medium',
  183,
  '/assets/music/beats/thug-pain.mp3',
  NULL,
  false,
  false,
  'medium',
  'Emotional boom bap with a melancholic sample and heavy drums. The sound of struggle and survival. Built for storytelling and raw narratives.',
  ARRAY['sample', 'drums', 'bass', 'strings', 'piano'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'G Ride',
  1.00,
  'active',
  'Hip-Hop',
  ARRAY['Trap', 'Southern', 'Bass Heavy'],
  90,
  NULL,
  ARRAY['hard', 'bouncy', 'street', 'heavy'],
  'very_high',
  126,
  '/assets/music/beats/g-ride.mp3',
  NULL,
  false,
  false,
  'medium',
  'Heavy bass-driven hip-hop with a bouncy groove and street energy. The soundtrack for cruising, confidence, and late-night drives through the city.',
  ARRAY['808 bass', 'hi-hats', 'drums', 'synth', 'vocal samples'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Summertime Fine',
  1.00,
  'active',
  'Hip-Hop',
  ARRAY['Summer', 'Chill', 'Melodic'],
  90,
  NULL,
  ARRAY['chill', 'sunny', 'smooth', 'laid-back'],
  'medium',
  112,
  '/assets/music/beats/summertime-fine.mp3',
  NULL,
  false,
  false,
  'high',
  'A sun-drenched summer hip-hop instrumental with melodic vibes and a relaxed bounce. Perfect for summer content, travel vlogs, or feel-good lifestyle media.',
  ARRAY['guitar', 'drums', 'bass', 'synth pad', 'melodic sample'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Drill Passion',
  1.00,
  'active',
  'Drill',
  ARRAY['UK Drill', 'Trap', 'Hard'],
  145,
  NULL,
  ARRAY['aggressive', 'dark', 'intense', 'energetic'],
  'very_high',
  195,
  '/assets/music/beats/drill-passion.mp3',
  NULL,
  false,
  false,
  'medium',
  'Hard-hitting UK drill with slidin 808s, skittering hi-hats, and dark melodic elements. High energy and intense — built for action sequences and urban content.',
  ARRAY['808 bass', 'hi-hats', 'drums', 'dark synth', 'vocal chop'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Trap Orbit',
  1.00,
  'active',
  'Trap',
  ARRAY['Melodic Trap', 'Atmospheric', 'Spacey'],
  140,
  NULL,
  ARRAY['atmospheric', 'spacey', 'melodic', 'dark'],
  'high',
  142,
  '/assets/music/beats/trap-orbit.mp3',
  NULL,
  false,
  false,
  'medium',
  'Atmospheric trap with spacey melodies, wide synths, and hard-hitting 808s. Floating between dark and melodic — like drifting through orbit.',
  ARRAY['synth', '808 bass', 'hi-hats', 'drums', 'atmospheric pad'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Trap Testimony',
  1.00,
  'active',
  'Trap',
  ARRAY['Emotional Trap', 'Storytelling', 'Melodic'],
  140,
  NULL,
  ARRAY['emotional', 'dark', 'reflective', 'powerful'],
  'high',
  157,
  '/assets/music/beats/trap-testimony.mp3',
  NULL,
  false,
  false,
  'high',
  'Emotional trap with cinematic melodies and a powerful narrative feel. Made for dramatic storytelling, video game cutscenes, or artist showcases.',
  ARRAY['piano', '808 bass', 'drums', 'strings', 'synth pad'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Jazz Vibes',
  1.00,
  'active',
  'Jazz',
  ARRAY['Smooth Jazz', 'Chill', 'Instrumental'],
  92,
  NULL,
  ARRAY['smooth', 'chill', 'sophisticated', 'relaxed'],
  'low',
  175,
  '/assets/music/beats/jazz-vibes.mp3',
  NULL,
  false,
  false,
  'very_high',
  'Smooth jazz with sophisticated harmonies and a relaxed vibe. Perfect for upscale environments, coffee shop scenes, or refined brand content.',
  ARRAY['piano', 'saxophone', 'bass', 'drums', 'guitar'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Guiraldi Style',
  1.00,
  'active',
  'Jazz',
  ARRAY['Contemporary Jazz', 'Bossa', 'Chill'],
  92,
  NULL,
  ARRAY['playful', 'whimsical', 'warm', 'nostalgic'],
  'low',
  165,
  '/assets/music/beats/guiraldi-style.mp3',
  NULL,
  false,
  false,
  'very_high',
  'Inspired by Vince Guaraldi''s iconic style — playful piano jazz with a warm, nostalgic feel. Think Charlie Brown meets modern sophistication.',
  ARRAY['piano', 'bass', 'drums', 'vibraphone', 'brushes'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Funk Groove',
  1.00,
  'active',
  'Funk',
  ARRAY['Classic Funk', 'Groove', 'Rhythm'],
  105,
  NULL,
  ARRAY['funky', 'groovy', 'energetic', 'bouncy'],
  'high',
  172,
  '/assets/music/beats/funk-groove.mp3',
  NULL,
  false,
  false,
  'very_high',
  'Pure funk with a driving groove that locks you in. Tight rhythm section, stabbing horns, and a bass line that won''t quit. Made to move.',
  ARRAY['bass', 'drums', 'horns', 'guitar', 'organ'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Lazy Guitar Soul',
  1.00,
  'active',
  'Soul',
  ARRAY['Guitar Soul', 'Chill', 'Blues'],
  85,
  NULL,
  ARRAY['lazy', 'warm', 'bluesy', 'relaxed'],
  'low',
  117,
  '/assets/music/beats/lazy-guitar-soul.mp3',
  NULL,
  false,
  false,
  'high',
  'A laid-back guitar-driven soul instrumental with a lazy afternoon feel. Bluesy licks, warm tones, and a relaxed groove. Perfect for slow-burn scenes.',
  ARRAY['guitar', 'bass', 'soft drums', 'organ', 'piano'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Dark Heart',
  1.00,
  'active',
  'Cinematic',
  ARRAY['Dark', 'Atmospheric', 'Drama'],
  80,
  NULL,
  ARRAY['dark', 'brooding', 'intense', 'mysterious'],
  'medium',
  162,
  '/assets/music/beats/dark-heart.mp3',
  NULL,
  false,
  false,
  'very_high',
  'A brooding cinematic instrumental with dark textures and building tension. Made for thriller sequences, mystery trailers, or emotional drama climaxes.',
  ARRAY['strings', 'synth pad', 'piano', 'percussion', 'bass drone'],
  true,
  1.00,
  20
);

INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  'Synth Demon',
  1.00,
  'active',
  'Electronic',
  ARRAY['Dark Synth', 'Industrial', 'Horror'],
  130,
  NULL,
  ARRAY['dark', 'menacing', 'industrial', 'aggressive'],
  'very_high',
  89,
  '/assets/music/beats/synth-demon.mp3',
  NULL,
  false,
  false,
  'high',
  'Aggressive dark synth with industrial textures and a menacing atmosphere. Made for horror trailers, cyberpunk scenes, or high-intensity action sequences.',
  ARRAY['synthesizer', 'distorted bass', 'industrial percussion', 'drone', 'effects'],
  true,
  1.00,
  20
);

COMMIT;
