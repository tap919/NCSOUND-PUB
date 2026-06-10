import { RosterTemplate } from '../../components/RosterTemplate';

export default function Tap919() {
  return (
    <RosterTemplate
      name="Tap919"
      tagline="Producer • Founder • NcSound Publishing"
      role="NcSound Founder & Producer"
      bio="Producer, rapper, and founder of NcSound Publishing out of Raleigh, NC. Creating hard-hitting beats and releasing music independently. Hosted by DJ Skullator, Tap's remix catalog blends R&B, hip-hop, and pop into an eclectic sound. With a relentless work ethic and a passion for cultivating local talent, Tap919 built NcSound to bridge the gap between street-level producers and elite music supervisors."
      imageUrl="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop"
      links={[
        { platform: 'instagram', url: 'https://www.instagram.com/tap919/' },
        { platform: 'spotify', url: 'https://open.spotify.com/artist/5M3vgLWv05thJEkMv6JRRw' },
        { platform: 'youtube', url: 'https://www.youtube.com/channel/UCc-BX8O8xIAHOdPUwEGzxZA' },
      ]}
      bandcampArtist="Tap"
      stats={[
        { label: 'Releases', value: '4' },
        { label: 'Founded', value: '2024' },
        { label: 'Based', value: 'Raleigh, NC' },
      ]}
    />
  );
}
