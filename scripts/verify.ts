import { readFileSync } from 'fs';
import { join } from 'path';

const sql = readFileSync(join(process.cwd(), 'supabase', 'seed_beats_combined.sql'), 'utf8');

const allBeats = JSON.parse(readFileSync(join(process.cwd(), 'scripts', 'beat-manifest.json'), 'utf8'));
const m2 = JSON.parse(readFileSync(join(process.cwd(), 'scripts', 'beat-manifest-batch2.json'), 'utf8'));
const m3 = JSON.parse(readFileSync(join(process.cwd(), 'scripts', 'beat-manifest-orphans.json'), 'utf8'));

const files: string[] = [];
// Collect all slugs from manifests
for (const b of [...allBeats, ...m2, ...m3]) {
  const s = b.slug || b.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  files.push(s);
}

console.log('Total manifest entries:', files.length);

const checks = ['interlude', 'lifelines', 'memorex', 'reminiscing', 'rimshot', 'starchild', 'triumphant', 'unbreak', 'vgt', 'vibrant'];
for (const c of checks) {
  const inManifest = files.includes(c);
  const inSql = sql.includes("'" + c + "'");
  console.log(c + ': manifest=' + inManifest + ' sql=' + inSql);
}
