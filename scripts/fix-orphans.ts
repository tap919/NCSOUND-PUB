import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// These are orphaned beat files that were copied to assets/music/beats/
// but never added to any manifest (from first aborted batch2 run)
// IMPORTANT: slug MUST match the actual filename (without .mp3)
const FIXES: Record<string, { title: string; genre: string; energy: string; moods: string[]; sync: string }> = {
  '70s-big-boss': { title: 'Big Boss', genre: 'Soul', energy: 'high', moods: ['confident', 'bold', '70s', 'driving'], sync: 'high' },
  '70s-break': { title: 'Seventy Break', genre: 'Soul', energy: 'medium', moods: ['groovy', 'retro', 'laid-back'], sync: 'medium' },
  '80s-bag': { title: 'Eighties Bag', genre: 'R&B', energy: 'medium', moods: ['smooth', 'retro', '80s', 'chill'], sync: 'medium' },
  '80s-rb-smooth': { title: '80s R&B Smooth', genre: 'R&B', energy: 'medium', moods: ['smooth', 'romantic', 'retro'], sync: 'high' },
  'basement-tears': { title: 'Basement Tears', genre: 'Soul', energy: 'low', moods: ['emotional', 'raw', 'introspective'], sync: 'high' },
  'beros-1': { title: 'Beros One', genre: 'Hip-Hop', energy: 'medium', moods: ['booming', 'confident'], sync: 'medium' },
  'beros-3': { title: 'Beros Three', genre: 'Hip-Hop', energy: 'high', moods: ['aggressive', 'hard'], sync: 'medium' },
  'big-bounce': { title: 'Big Bounce', genre: 'Hip-Hop', energy: 'high', moods: ['bouncy', 'energetic'], sync: 'medium' },
  'big-soul-2': { title: 'Big Soul Two', genre: 'Soul', energy: 'medium', moods: ['warm', 'full'], sync: 'high' },
  'big-soul-3': { title: 'Big Soul Three', genre: 'Soul', energy: 'medium', moods: ['soulful', 'rich'], sync: 'high' },
  'bioworld-1': { title: 'Bioworld One', genre: 'Cinematic', energy: 'medium', moods: ['ethereal', 'atmospheric'], sync: 'high' },
  'boneless-pimp': { title: 'Boneless Pimp', genre: 'Soul', energy: 'medium', moods: ['smooth', 'funky', 'cool'], sync: 'medium' },
  'boneless-wings-1': { title: 'Boneless Wings', genre: 'Soul', energy: 'medium', moods: ['funky', 'groovy'], sync: 'medium' },
  'broomstick-thunder-remix': { title: 'Broomstick Thunder', genre: 'Cinematic', energy: 'high', moods: ['dramatic', 'powerful', 'dark'], sync: 'high' },
  'chrome-symphony': { title: 'Chrome Symphony', genre: 'Electronic', energy: 'high', moods: ['sleek', 'futuristic', 'driving'], sync: 'high' },
  'cinder-hymn': { title: 'Cinder Hymn', genre: 'Cinematic', energy: 'low', moods: ['dark', 'melancholic', 'ethereal'], sync: 'high' },
  'dark-days': { title: 'Dark Days', genre: 'Soul', energy: 'low', moods: ['melancholic', 'emotional', 'sad'], sync: 'high' },
  'deep-grimy': { title: 'Deep Grimy', genre: 'Hip-Hop', energy: 'high', moods: ['dark', 'hard', 'gritty'], sync: 'medium' },
  'duh-duh': { title: 'Duh Duh', genre: 'Hip-Hop', energy: 'medium', moods: ['minimal', 'hard'], sync: 'medium' },
  'dungeon-shit': { title: 'Dungeon Shit', genre: 'Hip-Hop', energy: 'high', moods: ['dark', 'aggressive', 'grimy'], sync: 'medium' },
  'for-the-love': { title: 'For the Love', genre: 'Soul', energy: 'medium', moods: ['romantic', 'soulful', 'warm'], sync: 'high' },
};

const entries = Object.entries(FIXES).map(([file, info]) => ({
  sourceFile: '',
  title: info.title,
  // Use the file name as the slug so it matches the actual filename on disk
  slug: file,
  genre: info.genre,
  subgenres: [],
  mood_tags: info.moods,
  energy: info.energy,
  stems: false,
  ai_generated: false,
  sync_suitability: info.sync,
  description: `A ${info.energy}-energy ${info.genre} track with ${info.moods.join(', ')} vibes.`,
  instrumentation: [],
  file: file + '.mp3',
  audio_url: `/assets/music/beats/${file}.mp3`,
  is_first_wave: true,
  first_wave_price: 1.00,
  split_percentage: 20
}));

const outPath = join(process.cwd(), 'scripts', 'beat-manifest-orphans.json');
writeFileSync(outPath, JSON.stringify(entries, null, 2));
console.log(`Written ${entries.length} orphan entries to beat-manifest-orphans.json`);
