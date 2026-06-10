import { RosterTemplate } from '../../components/RosterTemplate';

export default function ARTProductions() {
  return (
    <RosterTemplate
      name="A.R.T. Productions"
      tagline="Heavy-hitting beats from the underground"
      role="NcSound Producer"
      bio="A.R.T. Productions brings raw, unpolished energy to every track. Based in North Carolina, A.R.T. focuses on hard-hitting boom bap and trap instrumentals built for artists who demand authentic street sound. Every beat is crafted with precision — from gritty 808s to layered melodic progressions."
      imageUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop"
      links={[
        { platform: 'instagram', url: 'https://www.instagram.com/a_r_tproductions_/' },
      ]}
      stats={[
        { label: 'Genre', value: 'Boom Bap' },
        { label: 'Based', value: 'North Carolina' },
        { label: 'Status', value: 'Active' },
      ]}
    />
  );
}
