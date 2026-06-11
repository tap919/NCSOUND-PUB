import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function esc(val: any): string {
  if (val === null || val === undefined) return 'NULL,';
  if (typeof val === 'number') return val.toString() + ',';
  if (typeof val === 'boolean') return val ? 'true,' : 'false,';
  if (Array.isArray(val)) {
    const items = val.map((v: string) => "'" + v.replace(/'/g, "''") + "'");
    return 'ARRAY[' + items.join(',') + ']::text[],';
  }
  return "'" + String(val).replace(/'/g, "''") + "',";
}

function escLast(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (Array.isArray(val)) {
    const items = val.map((v: string) => "'" + v.replace(/'/g, "''") + "'");
    return 'ARRAY[' + items.join(',') + ']::text[]';
  }
  return "'" + String(val).replace(/'/g, "''") + "'";
}

// Read all manifests
const m1: any[] = JSON.parse(readFileSync(join(process.cwd(), 'scripts', 'beat-manifest.json'), 'utf8'));
const m2Path = join(process.cwd(), 'scripts', 'beat-manifest-batch2.json');
const m2: any[] = existsSync(m2Path) ? JSON.parse(readFileSync(m2Path, 'utf8')) : [];
const m2bPath = join(process.cwd(), 'scripts', 'beat-manifest-batch3.json');
const m2b: any[] = existsSync(m2bPath) ? JSON.parse(readFileSync(m2bPath, 'utf8')) : [];
const m3Path = join(process.cwd(), 'scripts', 'beat-manifest-orphans.json');
const m3: any[] = existsSync(m3Path) ? JSON.parse(readFileSync(m3Path, 'utf8')) : [];

// Build a map from slug -> beat entry (dedup by slug)
const slugMap = new Map<string, any>();

for (const b of [...m1, ...m2, ...m2b, ...m3]) {
  const key = b.slug || slugify(b.title);
  if (!slugMap.has(key)) {
    slugMap.set(key, { ...b, slug: key });
  }
}

// Verify against filesystem
const files = readdirSync(join(process.cwd(), 'assets', 'music', 'beats'))
  .filter(f => f.endsWith('.mp3'))
  .map(f => f.replace('.mp3', ''));

const inManifest = new Set(slugMap.keys());
const missingFromManifest = files.filter(f => !inManifest.has(f));
const inManifestNotOnDisk = [...inManifest].filter(k => !files.includes(k));

if (missingFromManifest.length > 0) {
  console.log('WARNING: Files not in any manifest:', missingFromManifest);
}
if (inManifestNotOnDisk.length > 0) {
  console.log('WARNING: Manifest entries with no file:', inManifestNotOnDisk);
}

// Sort by title for a nice order
const allBeats = [...slugMap.values()].sort((a, b) => a.title.localeCompare(b.title));

console.log(`Combining: ${m1.length} (batch1) + ${m2.length} (batch2) + ${m2b.length} (batch3/drive) + ${m3.length} (orphans) = ${allBeats.length} unique beats`);

function generateSQL(beats: any[]): string {
  const header = [
    '-- Beat catalog seed data (combined)',
    '-- Generated: ' + new Date().toISOString().split('T')[0],
    '-- Total beats: ' + beats.length,
    '',
    'INSERT INTO beat_store_products (title, slug, genre, subgenres, description, mood_tags, energy,',
    '  bpm, musical_key, duration_seconds, audio_url, cover_art_url, stems_available, ai_generated,',
    '  sync_suitability, instrumentation, is_first_wave, first_wave_price, split_percentage)',
    'VALUES',
    '',
  ];

  const rows = beats.map((b, i) => {
    const comma = i < beats.length - 1 ? ',' : ';';
    return [
      '(',
      esc(b.title),
      esc(b.slug),
      esc(b.genre || 'Other'),
      esc(b.subgenres || []),
      esc(b.description || 'A beat from NcSound catalog.'),
      esc(b.mood_tags || []),
      esc(b.energy || 'medium'),
      'NULL,',  // bpm
      'NULL,',  // musical_key
      'NULL,',  // duration_seconds
      esc(b.audio_url || ''),
      'NULL,',  // cover_art_url
      'false,', // stems_available
      'false,', // ai_generated
      esc(b.sync_suitability || 'medium'),
      esc(b.instrumentation || []),
      esc(b.is_first_wave !== undefined ? b.is_first_wave : true),
      esc(b.first_wave_price !== undefined ? b.first_wave_price : 1.00),
      escLast(b.split_percentage || 20),
      ')',
      comma
    ].join('\n      ');
  });

  return header.concat(rows, [''], ['-- End of seed data']).join('\n');
}

const sql = generateSQL(allBeats);
const outPath = join(process.cwd(), 'supabase', 'seed_beats_combined.sql');
writeFileSync(outPath, sql);
console.log('Written: ' + outPath);
console.log('Total beats: ' + allBeats.length);
