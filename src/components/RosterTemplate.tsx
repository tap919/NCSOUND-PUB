import { motion } from 'motion/react';
import { Headphones, ExternalLink, Globe, Music, Youtube, Camera, MessageCircle, Link2 } from 'lucide-react';
import { BandcampDiscography } from './BandcampDiscography';

interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

interface RosterTemplateProps {
  name: string;
  tagline: string;
  role: string;
  bio: string;
  imageUrl: string;
  photoUrl?: string;
  links?: SocialLink[];
  bandcampArtist?: string;
  bandcampUsername?: string;
  stats?: { label: string; value: string }[];
}

const platformIcons: Record<string, typeof Globe> = {
  spotify: Music,
  'apple-music': Music,
  soundcloud: Headphones,
  youtube: Youtube,
  instagram: Camera,
  twitter: MessageCircle,
  tiktok: MessageCircle,
  bandcamp: Headphones,
  website: Globe,
};

const platformLabels: Record<string, string> = {
  spotify: 'Spotify',
  'apple-music': 'Apple Music',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  tiktok: 'TikTok',
  bandcamp: 'Bandcamp',
  website: 'Website',
};

export function RosterTemplate({
  name, tagline, role, bio, imageUrl, photoUrl, links, bandcampArtist, bandcampUsername, stats
}: RosterTemplateProps) {
  const displayLinks = links?.filter(l => l.url) || [];
  const displayImage = photoUrl || imageUrl;

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center px-3 py-1 border border-orange-500/30 bg-orange-500/10 mb-4">
              <Headphones className="w-3 h-3 text-orange-500 mr-2" />
              <span className="text-orange-500 text-[10px] font-bold tracking-widest uppercase">{role}</span>
            </div>
            <h1 className="text-6xl sm:text-7xl font-heading font-bold uppercase tracking-tighter text-white leading-[0.9]">
              <span className="font-graffiti text-orange-500 text-7xl sm:text-8xl">{name}</span>
            </h1>
            <p className="mt-4 text-sm font-bold uppercase tracking-widest text-neutral-500">{tagline}</p>
            <p className="mt-6 text-lg font-sans text-neutral-400 leading-relaxed">{bio}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              {displayLinks.map(link => {
                const Icon = platformIcons[link.platform] || Link2;
                const label = link.label || platformLabels[link.platform] || link.platform;
                return (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center border border-neutral-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:border-orange-500 transition-colors gap-2">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </a>
                );
              })}
            </div>
            {stats && (
              <div className="grid grid-cols-3 gap-6 mt-10 p-6 bg-neutral-900/50 border border-neutral-800">
                {stats.map(s => (
                  <div key={s.label}>
                    <p className="font-heading text-3xl text-orange-500">{s.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="relative border-2 border-neutral-800 bg-neutral-900">
              <div className="absolute -inset-1 bg-orange-500/10 blur-xl" />
              <img src={displayImage} alt={name} className="relative w-full aspect-[4/5] object-cover grayscale contrast-125" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <p className="text-orange-500 font-graffiti text-3xl">{name}</p>
                <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">NcSound Publishing</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
            <Music className="w-6 h-6 text-orange-500" />
            <h2 className="text-3xl font-heading uppercase tracking-wider text-white">Discography</h2>
          </div>
          <p className="text-neutral-400 font-sans text-sm mb-8">Releases auto-synced from Bandcamp. New uploads appear here instantly.</p>
          {bandcampArtist ? (
            <BandcampDiscography artist={bandcampArtist} bandcampUsername={bandcampUsername} />
          ) : (
            <div className="p-12 text-center border border-neutral-800 bg-neutral-900">
              <p className="text-neutral-500 font-sans text-sm">Discography coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
