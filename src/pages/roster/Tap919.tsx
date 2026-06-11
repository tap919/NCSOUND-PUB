import { RosterTemplate } from '../../components/RosterTemplate';
import SpotifyEmbed from '../../components/SpotifyEmbed';

export default function Tap919() {
  return (
    <>
      <RosterTemplate
        name="Tap919"
        tagline="Producer · Founder · NcSound Publishing"
        role="NcSound Founder & Producer"
        bio="Terrence Perry II (Tap919) is the founder of NcSound Publishing, a producer, rapper, and curator based in Raleigh, NC. Hosted by DJ Skullator, Tap's catalog blends R&B, hip-hop, and pop remixes into an eclectic signature sound. With a relentless work ethic and a passion for cultivating local talent, Tap919 built NcSound to bridge the gap between street-level producers and elite music supervisors."
        imageUrl="/assets/pictures/tap919-1.jpg"
        links={[
          { platform: 'instagram', url: 'https://www.instagram.com/tap919/' },
          { platform: 'facebook', url: 'https://www.facebook.com/tap919' },
          { platform: 'youtube', url: 'https://www.youtube.com/@TheUpliftLab' },
          { platform: 'spotify', url: 'https://open.spotify.com/artist/5M3vgLWv05thJEkMv6JRRw' },
          { platform: 'soundcloud', url: 'https://soundcloud.com/tap919' },
          { platform: 'tiktok', url: 'https://www.tiktok.com/@tap919' },
        ]}
        bandcampArtist="Tap"
        stats={[
          { label: 'Role', value: 'Founder/Producer' },
          { label: 'Label', value: 'The Uplift Lab' },
          { label: 'Based', value: 'Raleigh, NC' },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-4">On Spotify</h3>
        <SpotifyEmbed type="artist" id="5M3vgLWv05thJEkMv6JRRw" height="352" />
      </div>
    </>
  );
}
