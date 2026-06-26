import { useState, useEffect } from 'react';
import { ExternalLink, Headphones } from 'lucide-react';

interface BandcampRelease {
  title: string;
  url: string;
  artist: string;
  artUrl: string;
  type: string;
}

export function BandcampDiscography({ artist, bandcampUsername }: { artist?: string; bandcampUsername?: string }) {
  const [releases, setReleases] = useState<BandcampRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    // If artist has their own Bandcamp page, use that; otherwise fall back to main NcSound page
    const baseUrl = bandcampUsername
      ? `https://${bandcampUsername}.bandcamp.com`
      : 'https://ncsound.bandcamp.com';

    fetch(`/api/bandcamp/discography?artist=${artist || ''}&bandcampUrl=${encodeURIComponent(baseUrl)}`)
      .then(r => r.json())
      .then(data => {
        if (ignore) return;
        let items = data.releases || [];
        if (artist) {
          items = items.filter((r: BandcampRelease) =>
            r.artist.toLowerCase().includes(artist.toLowerCase())
          );
        }
        setReleases(items);
      })
      .catch(() => { if (!ignore) setError(true); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [artist, bandcampUsername]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="animate-pulse bg-neutral-800 aspect-square" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-neutral-500 font-sans text-sm text-center py-8 border border-neutral-800 bg-neutral-900">Bandcamp catalog unavailable</div>;
  }

  if (releases.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {releases.map((release) => (
        <a
          key={release.url}
          href={release.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 transition-all"
        >
          <div className="aspect-square overflow-hidden bg-neutral-800 relative">
            {release.artUrl ? (
              <img
                src={release.artUrl}
                alt={release.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-700">
                <Headphones className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ExternalLink className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="p-3">
            <h4 className="text-sm font-heading uppercase tracking-wider text-white truncate">{release.title}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">{release.type}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
