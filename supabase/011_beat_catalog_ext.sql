-- Beat Catalog Extension
-- Adds rich metadata fields to beat_store_products for full catalog management

ALTER TABLE public.beat_store_products
  ADD COLUMN IF NOT EXISTS genre text,
  ADD COLUMN IF NOT EXISTS subgenres text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bpm integer,
  ADD COLUMN IF NOT EXISTS musical_key text,
  ADD COLUMN IF NOT EXISTS mood_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS energy text CHECK (energy IN ('low', 'medium', 'high', 'very_high')),
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS cover_art_url text,
  ADD COLUMN IF NOT EXISTS stems_available boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sync_suitability text CHECK (sync_suitability IN ('low', 'medium', 'high', 'very_high')),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS instrumentation text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_first_wave boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_wave_price numeric(10,2) DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS split_percentage integer DEFAULT 20;

-- Index for genre-based queries
CREATE INDEX IF NOT EXISTS idx_beat_store_products_genre ON public.beat_store_products(genre);
CREATE INDEX IF NOT EXISTS idx_beat_store_products_bpm ON public.beat_store_products(bpm);
CREATE INDEX IF NOT EXISTS idx_beat_store_products_first_wave ON public.beat_store_products(is_first_wave) WHERE is_first_wave = true;

-- Enable RLS
ALTER TABLE public.beat_store_products ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read active beats
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beat_store_products' AND policyname = 'Anyone can view active beats') THEN
    CREATE POLICY "Anyone can view active beats" ON public.beat_store_products
      FOR SELECT USING (status = 'active');
  END IF;
END $$;
