import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { RosterTemplate } from '../../components/RosterTemplate';
import SpotifyEmbed from '../../components/SpotifyEmbed';

export default function Niro() {
  return (
    <>
      <RosterTemplate
        name="Mr. Niro"
        tagline="Recording Artist · Songwriter · Performer"
        role="NcSound Recording Artist"
        bio="David Irby, known professionally as Mr. Niro, is a recording artist and songwriter from North Carolina. With a distinctive flow and authentic street narratives, Niro brings raw energy and lyrical depth to every track. His music blends hard-hitting hip-hop with melodic sensibilities, drawing from real-life experiences and NC's rich musical heritage."
        imageUrl="/assets/pictures/Niro/niro-solo.jpg"
        links={[
          { platform: 'instagram', url: 'https://www.instagram.com/mr_niro/' },
          { platform: 'facebook', url: 'https://www.facebook.com/david.irby' },
          { platform: 'youtube', url: 'https://www.youtube.com/@MrNiro' },
          { platform: 'spotify', url: 'https://open.spotify.com/artist/4E9w0T14Qvi571AgqfOQpv' },
          { platform: 'tiktok', url: 'https://www.tiktok.com/@mrniro919' },
        ]}
        stats={[
          { label: 'Role', value: 'Recording Artist' },
          { label: 'Genre', value: 'Hip-Hop / Drill' },
          { label: 'Based', value: 'North Carolina' },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10">
        <div className="bg-neutral-900 border border-neutral-800 p-8 text-center">
          <h2 className="text-2xl font-heading uppercase tracking-wider text-white mb-2">Full Discography</h2>
          <p className="text-neutral-400 font-sans mb-6">Stream all 3 albums — 1111, Isolated, and Reloaded — 25 tracks.</p>
          <Link to="/niro-music" className="inline-flex items-center gap-2 bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-orange-400 transition-colors">
            <Music className="w-4 h-4" /> Open Music Player
          </Link>
        </div>
        <div>
          <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-4">On Spotify</h3>
          <SpotifyEmbed type="artist" id="4E9w0T14Qvi571AgqfOQpv" height="352" />
        </div>
      </div>
    </>
  );
}
