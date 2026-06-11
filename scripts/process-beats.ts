import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uwsubscribedoewdhphjdhf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const BEATS_DIR = join(process.cwd(), 'assets', 'music', 'beats');

interface BeatManifest {
  sourceFile: string;
  title: string;
  genre: string;
  subgenres: string[];
  mood_tags: string[];
  energy: 'low' | 'medium' | 'high' | 'very_high';
  stems: boolean;
  ai_generated: boolean;
  sync_suitability: 'low' | 'medium' | 'high' | 'very_high';
  description: string;
  instrumentation: string[];
}

function getAudioDuration(filePath: string): number {
  try {
    const result = execSync(`ffprobe -v quiet -print_format json -show_format "${filePath}"`, { encoding: 'utf-8' });
    const data = JSON.parse(result);
    return Math.round(parseFloat(data.format.duration));
  } catch {
    return 0;
  }
}

function sanitizeFileName(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.mp3';
}

async function main() {
  if (!SUPABASE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is required');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  if (!existsSync(BEATS_DIR)) {
    mkdirSync(BEATS_DIR, { recursive: true });
  }

  const manifestPath = join(process.cwd(), 'scripts', 'beat-manifest.json');
  const manifest: BeatManifest[] = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  console.log(`Processing ${manifest.length} beats...`);

  for (const beat of manifest) {
    if (!existsSync(beat.sourceFile)) {
      console.warn(`  SKIP: ${beat.title} — source not found: ${beat.sourceFile}`);
      continue;
    }

    const fileName = sanitizeFileName(beat.title);
    const destPath = join(BEATS_DIR, fileName);
    const audioUrl = `/assets/music/beats/${fileName}`;
    const duration = getAudioDuration(beat.sourceFile);

    copyFileSync(beat.sourceFile, destPath);
    console.log(`  COPIED: ${beat.title} (${duration}s) → ${fileName}`);

    // Estimate BPM by genre
    const bpmMap: Record<string, number> = {
      'Soul': 85, 'R&B': 78, 'Funk': 105, 'Jazz': 92,
      'Hip-Hop': 90, 'Trap': 140, 'Drill': 145, 'Cinematic': 80,
      'Electronic': 130
    };
    const bpm = bpmMap[beat.genre] || 100;

    const { error } = await supabase.from('beat_store_products').insert({
      artist_id: null,
      title: beat.title,
      lease_price: 1.00,
      exclusive_price: null,
      status: 'active',
      genre: beat.genre,
      subgenres: beat.subgenres,
      bpm,
      musical_key: null,
      mood_tags: beat.mood_tags,
      energy: beat.energy,
      duration_seconds: duration,
      audio_url: audioUrl,
      cover_art_url: null,
      stems_available: beat.stems,
      ai_generated: beat.ai_generated,
      sync_suitability: beat.sync_suitability,
      description: beat.description,
      instrumentation: beat.instrumentation,
      is_first_wave: true,
      first_wave_price: 1.00,
      split_percentage: 20
    });

    if (error) {
      console.error(`  ERROR inserting ${beat.title}:`, error.message);
    } else {
      console.log(`  INSERTED: ${beat.title} ✓`);
    }
  }

  console.log('\nDone! All beats processed.');
}

main().catch(console.error);
