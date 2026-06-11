import { RosterTemplate } from '../../components/RosterTemplate';
import SpotifyEmbed from '../../components/SpotifyEmbed';

export default function ARTProductions() {
  return (
    <div>
      <RosterTemplate
        name="A.R.T. Productions"
        tagline="Heavy-hitting beats from the underground"
        role="NcSound Producer"
        bio="A.R.T. Productions brings raw, unpolished energy to every track. Based in North Carolina, A.R.T. focuses on hard-hitting boom bap and trap instrumentals built for artists who demand authentic street sound. Currently working with artists including Jamaal Matters and Shyst Vader, A.R.T. is shaping the next wave of NC hip-hop. Every beat is crafted with precision — from gritty 808s to layered melodic progressions."
        imageUrl="/assets/pictures/art/art.jpg"
        links={[
          { platform: 'instagram', url: 'https://www.instagram.com/a_r_tproductions_/' },
        ]}
        stats={[
          { label: 'Genre', value: 'Boom Bap / Trap' },
          { label: 'Artists', value: 'Jamaal Matters, Shyst Vader' },
          { label: 'Based', value: 'North Carolina' },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-16">
        <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-4">On Spotify</h3>
        <p className="text-xs text-neutral-500 mb-3 font-sans">A.R.T. Productions produces the majority of releases for:</p>
        <SpotifyEmbed type="artist" id="6HMAHrmsvhEjnao8QHuOEY" height="352" />
        <p className="text-xs text-neutral-500 mt-3 font-sans">Jamaal Matters — streaming now.</p>
      </div>
    </div>
  );
}
