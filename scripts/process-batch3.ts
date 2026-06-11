import { existsSync, copyFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const SRC = join(process.cwd(), 'temp', 'drive-beats');
const OUT = join(process.cwd(), 'assets', 'music', 'beats');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/%20/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DRIVE_BEATS: { src: string; title: string; genre: string; energy: string; moods: string[]; sync: string; note?: string }[] = [
  { src: '01 Niro The Truth.mp3', title: 'Niro The Truth', genre: 'Hip-Hop', energy: 'high', moods: ['confident', 'lyrical', 'hard'], sync: 'medium', note: 'Artist track with vocals' },
  { src: '07 Track 7.wma', title: 'Track Seven', genre: 'Soul', energy: 'medium', moods: ['smooth', 'retro'], sync: 'medium', note: 'WMA format' },
  { src: 'africa.mp3', title: 'Africa', genre: 'Soul', energy: 'medium', moods: ['world', 'warm', 'melodic'], sync: 'high' },
  { src: 'alan_Current.wav', title: 'Alan Current', genre: 'Cinematic', energy: 'low', moods: ['ambient', 'ethereal'], sync: 'high', note: 'Sound bed' },
  { src: 'at your best.mp3', title: 'At Your Best', genre: 'R&B', energy: 'low', moods: ['romantic', 'smooth', 'slow'], sync: 'high' },
  { src: 'best vox.mp3', title: 'Best Vox', genre: 'R&B', energy: 'medium', moods: ['warm', 'vocal', 'soulful'], sync: 'medium', note: 'May contain vocals' },
  { src: 'betray.mp3', title: 'Betray', genre: 'Soul', energy: 'low', moods: ['emotional', 'dark', 'melancholic'], sync: 'high' },
  { src: 'better love.mp3', title: 'Better Love', genre: 'R&B', energy: 'medium', moods: ['romantic', 'smooth', 'sweet'], sync: 'high' },
  { src: 'big big.mp3', title: 'Big Big', genre: 'Hip-Hop', energy: 'high', moods: ['booming', 'hard', 'confident'], sync: 'medium' },
  { src: 'big brah s.mp3', title: 'Big Brah S', genre: 'Hip-Hop', energy: 'high', moods: ['hard', 'aggressive'], sync: 'medium' },
  { src: 'big brah.mp3', title: 'Big Brah', genre: 'Hip-Hop', energy: 'high', moods: ['hard', 'bold'], sync: 'medium' },
  { src: 'Big Gas.mp3', title: 'Big Gas', genre: 'Hip-Hop', energy: 'high', moods: ['bouncy', 'confident', 'energy'], sync: 'medium' },
  { src: 'Boombap soul.mp3', title: 'Boombap Soul', genre: 'Soul', energy: 'medium', moods: ['boom-bap', 'classic', 'soulful'], sync: 'high' },
  { src: 'bounce horror.mp3', title: 'Bounce Horror', genre: 'Hip-Hop', energy: 'high', moods: ['dark', 'bouncy', 'creepy'], sync: 'high' },
  { src: 'chaka type.wav', title: 'Chaka Type', genre: 'Funk', energy: 'high', moods: ['funk', 'groovy', 'dance'], sync: 'high' },
  { src: 'chasin paper.wav', title: 'Chasin Paper', genre: 'Hip-Hop', energy: 'high', moods: ['hard', 'ambitious', 'grind'], sync: 'medium' },
  { src: 'cnn cpu.mp3', title: 'CNN CPU', genre: 'Hip-Hop', energy: 'high', moods: ['hard', 'news-inspired', 'intense'], sync: 'medium' },
  { src: 'dreamwave 9150.mp3', title: 'Dreamwave 9150', genre: 'Electronic', energy: 'medium', moods: ['dreamy', 'synth', 'retro-futuristic'], sync: 'high' },
  { src: 'elictric bap.mp3', title: 'Elictric Bap', genre: 'Hip-Hop', energy: 'high', moods: ['boom-bap', 'gritty', 'hard'], sync: 'high' },
  { src: 'empo.mp3', title: 'Empo', genre: 'Soul', energy: 'medium', moods: ['soulful', 'smooth', 'warm'], sync: 'high' },
  { src: 'Feelin Free inst.wav', title: 'Feelin Free', genre: 'Soul', energy: 'medium', moods: ['free', 'uplifting', 'warm'], sync: 'high' },
  { src: 'feels.mp3', title: 'Feels', genre: 'R&B', energy: 'low', moods: ['emotional', 'sad', 'vulnerable'], sync: 'high' },
  { src: 'From sand.mp3', title: 'From Sand', genre: 'Cinematic', energy: 'low', moods: ['ethereal', 'atmospheric', 'desert'], sync: 'high' },
  { src: 'good sat 1.mp3', title: 'Good Sat', genre: 'Soul', energy: 'medium', moods: ['chill', 'saturday', 'laid-back'], sync: 'high' },
  { src: 'h START.mp3', title: 'H Start', genre: 'Hip-Hop', energy: 'high', moods: ['hard', 'intro', 'energetic'], sync: 'medium' },
  { src: 'Harmony%20High.mp3', title: 'Harmony High', genre: 'R&B', energy: 'medium', moods: ['harmonious', 'smooth', 'sweet'], sync: 'high' },
  { src: 'harvest.mp3', title: 'Harvest', genre: 'Soul', energy: 'medium', moods: ['warm', 'earthy', 'organic'], sync: 'high' },
  { src: 'Heavy ft Niro.mp3', title: 'Heavy (ft. Niro)', genre: 'Hip-Hop', energy: 'high', moods: ['hard', 'heavy'], sync: 'medium', note: 'May have vocals from Niro' },
  { src: 'iso beat.mp3', title: 'Iso Beat', genre: 'Hip-Hop', energy: 'medium', moods: ['minimal', 'hard', 'isolated'], sync: 'medium' },
  { src: 'lavish.mp3', title: 'Lavish', genre: 'Soul', energy: 'medium', moods: ['luxurious', 'smooth', 'rich'], sync: 'high' },
  { src: 'lay down.mp3', title: 'Lay Down', genre: 'Soul', energy: 'low', moods: ['smooth', 'slow', 'laid-back'], sync: 'high' },
  { src: 'Life_Is_Hard.mp3', title: 'Life Is Hard', genre: 'Soul', energy: 'low', moods: ['struggle', 'emotional', 'raw'], sync: 'high' },
  { src: 'Like Honey-Pink Flowers.mp3', title: 'Like Honey Pink Flowers', genre: 'R&B', energy: 'medium', moods: ['sweet', 'romantic', 'soft'], sync: 'high' },
  { src: 'lil banger.mp3', title: 'Lil Banger', genre: 'Hip-Hop', energy: 'high', moods: ['hard', 'bouncy', 'party'], sync: 'medium' },
  { src: 'love might.wav', title: 'Love Might', genre: 'R&B', energy: 'low', moods: ['romantic', 'slow', 'emotional'], sync: 'high' },
  { src: 'new live crew.mp3', title: 'New Live Crew', genre: 'Soul', energy: 'high', moods: ['live', 'funky', 'groovy'], sync: 'high' },
  { src: 'O Digga 1.mp3', title: 'O Digga One', genre: 'Hip-Hop', energy: 'high', moods: ['hard', 'aggressive', 'drill'], sync: 'medium' },
  { src: 'ohhhhhhh.wav', title: 'Ohhhhhhh', genre: 'Soul', energy: 'medium', moods: ['vocal', 'soulful', 'emotional'], sync: 'medium', note: 'Vocal-heavy track' },
  { src: 'past the shadows.m4a', title: 'Past the Shadows', genre: 'Cinematic', energy: 'low', moods: ['dark', 'atmospheric', 'mysterious'], sync: 'high' },
  { src: 'ppp loan.mp3', title: 'PPP Loan', genre: 'Hip-Hop', energy: 'high', moods: ['grind', 'hustle', 'hard'], sync: 'medium' },
  { src: 'Redemption.mp3', title: 'Redemption', genre: 'Soul', energy: 'medium', moods: ['redemption', 'emotional', 'hopeful'], sync: 'high' },
  { src: 'Robot Walk.wav', title: 'Robot Walk', genre: 'Electronic', energy: 'high', moods: ['robotic', 'glitch', 'futuristic'], sync: 'high' },
  { src: 'soul thuggin blackstorm.mp3', title: 'Soul Thuggin Blackstorm', genre: 'Soul', energy: 'high', moods: ['soulful', 'hard', 'thug'], sync: 'medium' },
];

const seen = new Set<string>();
let copied = 0;

for (const b of DRIVE_BEATS) {
  const srcPath = join(SRC, b.src);
  if (!existsSync(srcPath)) { console.log('✗ Missing:', b.src); continue; }

  let cleanName = slugify(b.title) + '.mp3';
  if (seen.has(cleanName)) cleanName = slugify(b.title) + '-2.mp3';
  seen.add(cleanName);

  const destPath = join(OUT, cleanName);
  try {
    copyFileSync(srcPath, destPath);
    console.log('✓', b.title);
    copied++;
  } catch (e: any) {
    console.log('✗ Error:', b.src, e.message);
  }
}

// Generate manifest
const manifest = DRIVE_BEATS.filter(b => existsSync(join(SRC, b.src))).map(b => {
  const cleanName = slugify(b.title) + '.mp3';
  return {
    sourceFile: join(SRC, b.src),
    title: b.title,
    slug: slugify(b.title),
    genre: b.genre,
    mood_tags: b.moods,
    energy: b.energy,
    sync_suitability: b.sync,
    description: (b.note || '') + ` A ${b.energy}-energy ${b.genre} track with ${b.moods.join(', ')} vibes.`,
    file: cleanName,
    audio_url: `/assets/music/beats/${cleanName}`,
    is_first_wave: true,
    first_wave_price: 1.00,
    split_percentage: 20
  };
});

const outPath = join(process.cwd(), 'scripts', 'beat-manifest-batch3.json');
writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`\nDone: ${copied} beats copied, ${manifest.length} in manifest`);
