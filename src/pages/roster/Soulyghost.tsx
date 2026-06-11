import { RosterTemplate } from '../../components/RosterTemplate';
import SpotifyEmbed from '../../components/SpotifyEmbed';

export default function Soulyghost() {
  return (
    <>
      <RosterTemplate
        name="The Soulyghost"
        tagline="Singer · Songwriter · Performer"
        role="NcSound Recording Artist"
        bio="The Soulyghost is a singer and songwriter from Franklinton, NC whose haunting melodies and soul-baring lyricism have carved a distinct lane in independent music. With a discography that features collaborations with Madlib, Wildchild, Pharoah Monch, Che Nior, Conway the Machine, 38 Spesh, Styles P, Katt Williams, and Bishop Lamont, he stands as one of the most prominent voices coming out of North Carolina. His music bridges raw street narratives with soaring vocal performances, earning him a rapidly expanding reach that stretches far beyond the Carolinas."
        imageUrl="/assets/pictures/The Soulyghost/souly 2.jpg"
        links={[
          { platform: 'instagram', url: 'https://www.instagram.com/thesoulyghost/' },
          { platform: 'spotify', url: 'https://open.spotify.com/artist/5I0MlK68aOYfPGsIdmBrIr' },
          { platform: 'youtube', url: 'https://www.youtube.com/watch?v=g7D-bxoh7fo' },
          { platform: 'tiktok', url: 'https://www.tiktok.com/@thesoulyghost' },
        ]}
        stats={[
          { label: 'Role', value: 'Recording Artist' },
          { label: 'Genre', value: 'Singer / Songwriter' },
          { label: 'Based', value: 'Franklinton, NC' },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-4">On Spotify</h3>
        <SpotifyEmbed type="artist" id="5I0MlK68aOYfPGsIdmBrIr" height="352" />
      </div>
    </>
  );
}
