import { writeFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const SRC_DIR = 'C:\\Users\\User\\Music\\vox and suno';
const ALREADY_PROCESSED = [
  '70s blaxploitation groove.mp3', '70s drama.mp3', '70s memorex.mp3',
  '70s smooth lead soul.mp3', '70s unbreak.mp3', 'better days .mp3',
  'chill soul.mp3', 'dark heart.mp3', 'Drill Passion.mp3', 'funk groove.mp3',
  'G Ride 2.mp3', 'guiraldi style.mp3', 'gutta knockin.mp3', 'jazz vibes.mp3',
  'lazy guitar soul.mp3', 'rich soul.mp3', 'smooth talker.mp3',
  'summertime fine.mp3', 'synth demon.mp3', 'thug pain.mp3', 'Trap Orbit.mp3',
  'trap testimony .mp3', 'velvet vocals .mp3'
];

const EXCLUDE = [
  'track-man-export.mid', 'Uploaded File (Remix) (Remix) (Remix).mp3'
];

const SKIP_PREFIXES = ['Recording (', 'Recording'];

interface FileInfo {
  name: string;
  ext: string;
  sizeKb: number;
}

function getFiles(): FileInfo[] {
  const results: FileInfo[] = [];
  const lines = execSync(`cmd /c dir "${SRC_DIR}" /b /a-d`, { encoding: 'utf-8' })
    .split('\r\n').filter(Boolean);

  for (const f of lines) {
    if (ALREADY_PROCESSED.includes(f)) continue;
    if (EXCLUDE.includes(f)) continue;
    if (SKIP_PREFIXES.some(p => f.startsWith(p))) continue;
    if (f.endsWith('.mid')) continue;
    const fp = join(SRC_DIR, f);
    if (!existsSync(fp)) continue;
    const stat = statSync(fp);
    const ext = f.split('.').pop()?.toLowerCase() || '';
    if (!['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'wma'].includes(ext)) continue;
    results.push({ name: f, ext, sizeKb: Math.round(stat.size / 1024) });
  }
  return results;
}

async function analyzeBatch(files: FileInfo[]): Promise<any[]> {
  const prompt = `You are a music catalog curator. Classify each audio file as an instrumental beat (for sync licensing catalog) or non-beat.

Rules:
- A beat is an instrumental music production that could be licensed for TV/film/games
- Voice memos, vocal takes, covers, sound effects, short clips under 15KB, or files with "Recording" in name are NOT beats
- Files ending in .m4a with "vox", "vibe", or short names might be phone recordings
- .m4a files under 60KB are probably phone voice memos, NOT beats
- File names with "Cover", "interlude", "vox" in them are likely NOT beats
- Multiple "(Remix)" tags suggest low-quality duplicates — skip if clearly worse than original

For each BEAT, suggest:
- title: short, professional title (NO spaces at start/end, NO file extension)
- genre: Soul / Funk / R&B / Hip-Hop / Trap / Drill / Jazz / Cinematic / Electronic / Gospel / Pop / Rock / Lo-Fi / Reggae
- energy: low / medium / high / very_high
- mood_tags: array of 2-4 words
- sync_suitability: low / medium / high

Respond with JSON ARRAY only. Example:
[{"index":0,"is_beat":true,"title":"Midnight Groove","genre":"Soul","energy":"medium","mood_tags":["smooth","warm"],"sync_suitability":"high","note":""},{"index":1,"is_beat":false,"title":"","genre":"","energy":"","mood_tags":[],"sync_suitability":"","note":"voice memo - phone recording"}]

Files to analyze:
${files.map((f, i) => `[${i}] "${f.name}" — ext:${f.ext}, size:${f.sizeKb}KB`).join('\n')}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    }
  );

  const data: any = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = text.match(/\[[\s\S]*?\]/);
  if (!jsonMatch) {
    console.error('No JSON in response. Text:', text.slice(0, 500));
    return [];
  }
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  if (!GEMINI_KEY) { console.error('GEMINI_API_KEY env var required'); process.exit(1); }

  const files = getFiles();
  console.log(`Analyzing ${files.length} files via Gemini...\n`);

  const allResults: any[] = [];
  for (let i = 0; i < files.length; i += 15) {
    const batch = files.slice(i, i + 15);
    console.log(`Batch ${Math.floor(i / 15) + 1}/${Math.ceil(files.length / 15)} (${batch.length} files)...`);
    try {
      const classifications = await analyzeBatch(batch);
      for (const c of classifications) {
        const file = batch[c.index];
        if (c.is_beat) {
          allResults.push({ sourceFile: join(SRC_DIR, file.name), ...c });
          console.log(`  ✓ BEAT: ${c.title || '?'} (${file.name})`);
        } else {
          console.log(`  ✗ SKIP: ${file.name} — ${c.note || 'not a beat'}`);
        }
      }
    } catch (err: any) {
      console.error(`Batch failed: ${err.message}`);
    }
    if (i + 15 < files.length) await new Promise(r => setTimeout(r, 1500));
  }

  const manifest = allResults.map(r => ({
    sourceFile: r.sourceFile,
    title: r.title || r.sourceFile.split('\\').pop()!.replace(/\.\w+$/, ''),
    genre: r.genre || 'Other',
    subgenres: [],
    mood_tags: r.mood_tags || [],
    energy: r.energy || 'medium',
    stems: false,
    ai_generated: false,
    sync_suitability: r.sync_suitability || 'medium',
    description: r.note || '',
    instrumentation: []
  }));

  const outPath = join(process.cwd(), 'scripts', 'beat-manifest-batch2.json');
  writeFileSync(outPath, JSON.stringify(manifest, null, 2));
  console.log(`\nDone! ${manifest.length} beats written to beat-manifest-batch2.json`);
}

main().catch(console.error);
