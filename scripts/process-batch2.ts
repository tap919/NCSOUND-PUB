import { writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC = 'C:\\Users\\User\\Music\\vox and suno';
const OUT = join(process.cwd(), 'assets', 'music', 'beats');

const BEATS = [
  { src: 'Girl song .mp3', title: 'Girl Song', genre: 'R&B', energy: 'medium', moods: ['sweet','romantic','smooth'], sync: 'high' },
  { src: 'guitar funk sample .mp3', title: 'Guitar Funk', genre: 'Funk', energy: 'high', moods: ['funky','groovy','upbeat'], sync: 'high' },
  { src: 'hair down 70s fusion.mp3', title: 'Hair Down', genre: 'Funk', energy: 'medium', moods: ['funky','retro','groovy'], sync: 'high' },
  { src: 'hard horns.mp3', title: 'Hard Horns', genre: 'Funk', energy: 'high', moods: ['powerful','brass-heavy','confident'], sync: 'high' },
  { src: 'HeavyftNiro.mp3', title: 'Heavy ft Niro', genre: 'Hip-Hop', energy: 'high', moods: ['hard','heavy','intense'], sync: 'medium' },
  { src: 'Heros 1.mp3', title: 'Heros One', genre: 'Cinematic', energy: 'high', moods: ['epic','heroic','uplifting'], sync: 'high' },
  { src: 'Heros 2.mp3', title: 'Heros Two', genre: 'Cinematic', energy: 'medium', moods: ['triumphant','inspiring'], sync: 'high' },
  { src: 'Honest Liar.mp3', title: 'Honest Liar', genre: 'Soul', energy: 'medium', moods: ['introspective','emotional'], sync: 'high' },
  { src: 'horn in the way.mp3', title: 'Horn in the Way', genre: 'Soul', energy: 'medium', moods: ['brass-heavy','soulful'], sync: 'medium' },
  { src: 'immaculate vibes .mp3', title: 'Immaculate Vibes', genre: 'Soul', energy: 'medium', moods: ['warm','smooth','positive'], sync: 'high' },
  { src: 'in my feels.mp3', title: 'In My Feels', genre: 'R&B', energy: 'low', moods: ['emotional','vulnerable','sad'], sync: 'high' },
  { src: 'in pocket .mp3', title: 'In Pocket', genre: 'Funk', energy: 'high', moods: ['tight','funky','groovy'], sync: 'high' },
  { src: 'in pocket 2.mp3', title: 'In Pocket Two', genre: 'Funk', energy: 'high', moods: ['groovy','tight','bouncy'], sync: 'high' },
  { src: 'interlude (put audio quote at beginning).mp3', title: 'Interlude', genre: 'Soul', energy: 'low', moods: ['calm','transitional'], sync: 'high' },
  { src: "It's Alright Now 2.mp3", title: "Its Alright Now Two", genre: 'Soul', energy: 'medium', moods: ['hopeful','warming','soulful'], sync: 'high' },
  { src: "It's Alright Now 2 (Remix).mp3", title: "Its Alright Now Remix", genre: 'Soul', energy: 'medium', moods: ['soulful','reflective'], sync: 'high' },
  { src: 'jazz crew.mp3', title: 'Jazz Crew', genre: 'Jazz', energy: 'medium', moods: ['smooth','jazzy','cool'], sync: 'high' },
  { src: 'Kenny mystery .mp3', title: 'Kenny Mystery', genre: 'Jazz', energy: 'medium', moods: ['mysterious','jazzy'], sync: 'high' },
  { src: 'la la la.mp3', title: 'La La La', genre: 'R&B', energy: 'medium', moods: ['catchy','smooth','melodic'], sync: 'high' },
  { src: 'Lifelines.mp3', title: 'Lifelines', genre: 'Pop', energy: 'medium', moods: ['uplifting','hopeful'], sync: 'high' },
  { src: 'lonely pain to chop.mp3', title: 'Lonely Pain', genre: 'Soul', energy: 'low', moods: ['sad','lonely','emotional'], sync: 'high' },
  { src: 'melodic Kenny sample .mp3', title: 'Melodic Kenny', genre: 'Jazz', energy: 'medium', moods: ['melodic','jazzy','smooth'], sync: 'high' },
  { src: 'Niro heat.mp3', title: 'Niro Heat One', genre: 'Hip-Hop', energy: 'high', moods: ['hard','fiery','confident'], sync: 'medium' },
  { src: 'Niro heat 2.mp3', title: 'Niro Heat Two', genre: 'Hip-Hop', energy: 'high', moods: ['aggressive','hard'], sync: 'medium' },
  { src: 'Niro heat 3.mp3', title: 'Niro Heat Three', genre: 'Hip-Hop', energy: 'high', moods: ['intense','hard'], sync: 'medium' },
  { src: 'Niro heat 4.mp3', title: 'Niro Heat Four', genre: 'Hip-Hop', energy: 'high', moods: ['powerful','hard'], sync: 'medium' },
  { src: 'no mid 70s.mp3', title: 'No Mid 70s', genre: 'Soul', energy: 'medium', moods: ['retro','soulful','pure'], sync: 'high' },
  { src: 'Oche.m4a (Remix).mp3', title: 'Oche Remix', genre: 'Cinematic', energy: 'medium', moods: ['atmospheric','ethereal'], sync: 'high' },
  { src: 'Over_the_Horizon.m4a', title: 'Over the Horizon', genre: 'Cinematic', energy: 'low', moods: ['ethereal','atmospheric','vast'], sync: 'high' },
  { src: 'R & G.mp3', title: 'R and G', genre: 'Hip-Hop', energy: 'high', moods: ['hard','confident','aggressive'], sync: 'medium' },
  { src: 'reminiscing .mp3', title: 'Reminiscing', genre: 'Soul', energy: 'low', moods: ['nostalgic','reflective','soft'], sync: 'high' },
  { src: 'rimshot.mp3', title: 'Rimshot', genre: 'Hip-Hop', energy: 'medium', moods: ['classic','boom-bap','raw'], sync: 'medium' },
  { src: 'RiseAgainremixv1.2.1extv2.1.1.1.1.2.mp3', title: 'Rise Again', genre: 'Cinematic', energy: 'high', moods: ['epic','triumphant','uplifting'], sync: 'high' },
  { src: 'sad clout to chop.mp3', title: 'Sad Clout', genre: 'Soul', energy: 'low', moods: ['sad','emotional','dark'], sync: 'medium' },
  { src: 'sad party gospel.mp3', title: 'Sad Party Gospel', genre: 'Gospel', energy: 'medium', moods: ['emotional','soulful','bittersweet'], sync: 'high' },
  { src: 'Slow Soul.mp3', title: 'Slow Soul', genre: 'Soul', energy: 'low', moods: ['slow','romantic','smooth'], sync: 'high' },
  { src: 'smoking vibes.mp3', title: 'Smoking Vibes', genre: 'Soul', energy: 'medium', moods: ['cool','smooth','laid-back'], sync: 'high' },
  { src: 'smooth trap soul.mp3', title: 'Smooth Trap Soul', genre: 'Soul', energy: 'medium', moods: ['smooth','modern','trap-influenced'], sync: 'high' },
  { src: 'Soul Drilla.mp3', title: 'Soul Drilla', genre: 'Soul', energy: 'high', moods: ['intense','soulful','hard'], sync: 'medium' },
  { src: 'Soul Source .mp3', title: 'Soul Source', genre: 'Soul', energy: 'medium', moods: ['warm','authentic'], sync: 'high' },
  { src: 'soul train.mp3', title: 'Soul Train', genre: 'Funk', energy: 'high', moods: ['funky','groovy','retro'], sync: 'high' },
  { src: 'soul trapper .mp3', title: 'Soul Trapper', genre: 'Soul', energy: 'medium', moods: ['soulful','trap-influenced'], sync: 'medium' },
  { src: 'Southern Side of Heaven.mp3', title: 'Southern Side of Heaven', genre: 'Gospel', energy: 'medium', moods: ['heavenly','spiritual','uplifting'], sync: 'high' },
  { src: 'starchild.mp3', title: 'Starchild', genre: 'R&B', energy: 'medium', moods: ['ethereal','dreamy','smooth'], sync: 'high' },
  { src: 'sublime 70s.mp3', title: 'Sublime 70s', genre: 'Soul', energy: 'medium', moods: ['smooth','retro','classy'], sync: 'high' },
  { src: 'summer gutta.mp3', title: 'Summer Gutta', genre: 'Hip-Hop', energy: 'high', moods: ['summer','hard','confident'], sync: 'medium' },
  { src: 'the soul .mp3', title: 'The Soul', genre: 'Soul', energy: 'medium', moods: ['pure','soulful','classic'], sync: 'high' },
  { src: 'the vibes .mp3', title: 'The Vibes', genre: 'Soul', energy: 'medium', moods: ['vibey','warm','chill'], sync: 'high' },
  { src: 'trap gutta 1.mp3', title: 'Trap Gutta', genre: 'Trap', energy: 'high', moods: ['hard','dark','aggressive'], sync: 'medium' },
  { src: 'trap soul vox.mp3', title: 'Trap Soul Vox', genre: 'Soul', energy: 'medium', moods: ['soulful','trap','melodic'], sync: 'high' },
  { src: 'Trap-Coated Vice (Remix).mp3', title: 'Trap-Coated Vice', genre: 'Trap', energy: 'high', moods: ['dark','hard','gritty'], sync: 'medium' },
  { src: 'triumphant sample .mp3', title: 'Triumphant', genre: 'Cinematic', energy: 'high', moods: ['triumphant','epic','heroic'], sync: 'high' },
  { src: 'vgt .mp3', title: 'VGT', genre: 'Cinematic', energy: 'high', moods: ['video-game','epic','action'], sync: 'high' },
  { src: 'viberino (Remix).mp3', title: 'Viberino Remix', genre: 'R&B', energy: 'medium', moods: ['smooth','vibey'], sync: 'high' },
  { src: 'vibrant .mp3', title: 'Vibrant', genre: 'Pop', energy: 'high', moods: ['bright','energetic','colorful'], sync: 'high' },
  { src: 'vox boxing.mp3', title: 'Vox Boxing', genre: 'Hip-Hop', energy: 'high', moods: ['aggressive','hard','boxing'], sync: 'medium' },
  { src: 'Vudah vibe 2.m4a', title: 'Vudah Vibe Two', genre: 'R&B', energy: 'low', moods: ['ethereal','dreamy','smooth'], sync: 'high' },
  { src: 'Vudah vibes.m4a', title: 'Vudah Vibes', genre: 'R&B', energy: 'medium', moods: ['smooth','vibey','modern'], sync: 'high' },
  { src: 'wavy bounce .mp3', title: 'Wavy Bounce', genre: 'Hip-Hop', energy: 'high', moods: ['bouncy','energetic'], sync: 'medium' },
  { src: 'yeah baby sample .mp3', title: 'Yeah Baby', genre: 'Soul', energy: 'high', moods: ['fun','upbeat','groovy'], sync: 'high' },
  { src: 'yes lord.mp3', title: 'Yes Lord', genre: 'Gospel', energy: 'high', moods: ['praise','uplifting','spiritual'], sync: 'high' },
  { src: 'zeke guitar 1.mp3', title: 'Zeke Guitar One', genre: 'Soul', energy: 'medium', moods: ['guitar-driven','soulful'], sync: 'high' },
];

function slugify(t: string): string {
  return t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const seen = new Set<string>();
let copied = 0;
let locked = 0;

for (const b of BEATS) {
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
    if (e.code === 'EPERM') { console.log('🔒 Locked:', b.src); locked++; }
    else { console.log('✗ Error:', b.src, e.message); }
  }
}

// Generate manifest
const results = BEATS.filter(b => {
  const srcPath = join(SRC, b.src);
  return existsSync(srcPath);
}).map(b => {
  const slug = slugify(b.title);
  let cleanName = slug + '.mp3';
  return {
    sourceFile: join(SRC, b.src),
    title: b.title,
    slug,
    genre: b.genre,
    subgenres: [],
    mood_tags: b.moods,
    energy: b.energy,
    stems: false,
    ai_generated: false,
    sync_suitability: b.sync,
    description: `A ${b.energy}-energy ${b.genre} track with ${b.moods.join(', ')} vibes.`,
    instrumentation: [],
    file: cleanName,
    audio_url: `/assets/music/beats/${cleanName}`,
    is_first_wave: true,
    first_wave_price: 1.00,
    split_percentage: 20
  };
});

writeFileSync(join(process.cwd(), 'scripts', 'beat-manifest-batch2.json'), JSON.stringify(results, null, 2));

console.log(`\n=== Done: ${copied} copied, ${locked} locked, ${results.length} in manifest ===`);
