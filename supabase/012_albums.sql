-- Migration 012: Albums table + extend tracks for album support
-- PG 14 compatible (uses DO blocks for conditional DDL)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'albums') THEN
    CREATE TABLE public.albums (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      cover_art_url TEXT,
      release_date DATE,
      track_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'album_id') THEN
    ALTER TABLE public.tracks ADD COLUMN album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'track_number') THEN
    ALTER TABLE public.tracks ADD COLUMN track_number INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tracks' AND column_name = 'duration_seconds') THEN
    ALTER TABLE public.tracks ADD COLUMN duration_seconds INT;
  END IF;
END $$;

GRANT ALL ON public.albums TO service_role;
GRANT SELECT ON public.albums TO anon;

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'albums' AND policyname = 'albums_public_select') THEN
    CREATE POLICY albums_public_select ON public.albums FOR SELECT USING (true);
  END IF;
END $$;

GRANT SELECT ON public.track_files TO anon;
