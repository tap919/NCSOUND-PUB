import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function getAudioDuration(filePath: string): number {
  try {
    const result = execSync(`ffprobe -v quiet -print_format json -show_format "${filePath}"`, { encoding: 'utf-8' });
    const data = JSON.parse(result);
    return Math.round(parseFloat(data.format.duration));
  } catch { return 0; }
}

function sanitizeFileName(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.mp3';
}

function esc(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (Array.isArray(val)) return `ARRAY[${val.map(v => `'${v.replace(/'/g, "''")}'`).join(', ')}]`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

const manifest: any[] = JSON.parse(readFileSync(join(process.cwd(), 'scripts', 'beat-manifest.json'), 'utf-8'));

const bpmMap: Record<string, number> = {
  'Soul': 85, 'R&B': 78, 'Funk': 105, 'Jazz': 92,
  'Hip-Hop': 90, 'Trap': 140, 'Drill': 145, 'Cinematic': 80, 'Electronic': 130
};

let sql = `-- Beat Catalog Seed Data (${manifest.length} beats)
-- Generated: ${new Date().toISOString()}
-- First Wave: $1 leases, 20% split

BEGIN;

`;

for (const beat of manifest) {
  if (!existsSync(beat.sourceFile)) {
    console.warn(`SKIP ${beat.title}: source not found`);
    continue;
  }
  const duration = getAudioDuration(beat.sourceFile);
  const bpm = bpmMap[beat.genre] || 100;
  const fileName = sanitizeFileName(beat.title);
  const audioUrl = `/assets/music/beats/${fileName}`;

  sql += `INSERT INTO public.beat_store_products (title, lease_price, status, genre, subgenres, bpm, musical_key, mood_tags, energy, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated, sync_suitability, description, instrumentation, is_first_wave, first_wave_price, split_percentage)
VALUES (
  ${esc(beat.title)},
  1.00,
  'active',
  ${esc(beat.genre)},
  ${esc(beat.subgenres)},
  ${bpm},
  NULL,
  ${esc(beat.mood_tags)},
  ${esc(beat.energy)},
  ${duration},
  ${esc(audioUrl)},
  NULL,
  false,
  ${esc(beat.ai_generated || false)},
  ${esc(beat.sync_suitability)},
  ${esc(beat.description)},
  ${esc(beat.instrumentation)},
  true,
  1.00,
  20
);

`;

  console.log(`  ${beat.title}: ${duration}s, ${bpm}BPM, ${beat.genre}`);
}

sql += 'COMMIT;\n';

const outPath = join(process.cwd(), 'supabase', 'seed_beats.sql');
writeFileSync(outPath, sql);
console.log(`\nSQL written to ${outPath}`);
