import { describe, it, expect, vi } from 'vitest';
import type { ComponentType } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock BandcampDiscography to avoid network and `fetch` interactions in unit tests
vi.mock('../../../components/BandcampDiscography', () => ({
  BandcampDiscography: () => <div data-testid="bandcamp-discography-stub" />,
}));

// Mock SpotifyEmbed so we don't render the iframe
vi.mock('../../../components/SpotifyEmbed', () => ({
  default: () => <div data-testid="spotify-embed-stub">Spotify</div>,
}));

import ARTProductions from '../ARTProductions';
import Niro from '../Niro';
import Soulyghost from '../Soulyghost';
import Tap919 from '../Tap919';

function renderPage(Page: ComponentType) {
  return render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>
  );
}

describe('Roster pages', () => {
  describe('Niro', () => {
    it('renders the artist name, tagline, role and bio', () => {
      renderPage(Niro);
      // Name appears twice (heading + photo overlay)
      expect(screen.getAllByText('Mr. Niro').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Recording Artist.*Songwriter.*Performer/)).toBeInTheDocument();
      expect(screen.getByText('NcSound Recording Artist')).toBeInTheDocument();
      expect(screen.getByText(/David Irby, known professionally as Mr\. Niro/)).toBeInTheDocument();
    });

    it('renders all expected social links', () => {
      renderPage(Niro);
      expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
        'href',
        'https://www.instagram.com/mr_niro/'
      );
      expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute(
        'href',
        'https://www.facebook.com/david.irby'
      );
      expect(screen.getByRole('link', { name: /youtube/i })).toHaveAttribute(
        'href',
        'https://www.youtube.com/@MrNiro'
      );
      expect(screen.getByRole('link', { name: /spotify/i })).toHaveAttribute(
        'href',
        'https://open.spotify.com/artist/4E9w0T14Qvi571AgqfOQpv'
      );
      expect(screen.getByRole('link', { name: /tiktok/i })).toHaveAttribute(
        'href',
        'https://www.tiktok.com/@mrniro919'
      );
    });

    it('renders the discography stats', () => {
      renderPage(Niro);
      expect(screen.getByText('Hip-Hop / Lyricism')).toBeInTheDocument();
      expect(screen.getByText('North Carolina')).toBeInTheDocument();
    });

    it('renders the music player link to /niro-music', () => {
      renderPage(Niro);
      const link = screen.getByRole('link', { name: /open music player/i });
      expect(link).toHaveAttribute('href', '/niro-music');
    });

    it('renders the Spotify embed', () => {
      renderPage(Niro);
      expect(screen.getByTestId('spotify-embed-stub')).toBeInTheDocument();
    });
  });

  describe('Tap919', () => {
    it('renders the artist name and bio', () => {
      renderPage(Tap919);
      expect(screen.getAllByText('Tap919').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/founder of NcSound Publishing/)).toBeInTheDocument();
      expect(screen.getByText(/Terrence Perry II/)).toBeInTheDocument();
    });

    it('renders Bandcamp link in addition to other socials', () => {
      renderPage(Tap919);
      expect(screen.getByRole('link', { name: /bandcamp/i })).toHaveAttribute(
        'href',
        'https://ncsound.bandcamp.com/album/nc-sound-presents-the-remix-vol-1'
      );
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
    });

    it('renders the bandcamp discography stub via RosterTemplate', () => {
      renderPage(Tap919);
      // RosterTemplate renders BandcampDiscography only when bandcampArtist prop is provided
      expect(screen.getByTestId('bandcamp-discography-stub')).toBeInTheDocument();
    });

    it('renders the stats grid', () => {
      renderPage(Tap919);
      expect(screen.getByText('Hip Hop, R&B, House')).toBeInTheDocument();
      expect(screen.getByText('North Carolina')).toBeInTheDocument();
    });
  });

  describe('ARTProductions', () => {
    it('renders the artist name and bio', () => {
      renderPage(ARTProductions);
      expect(screen.getAllByText('A.R.T. Productions').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Heavy-hitting beats from the underground')).toBeInTheDocument();
      expect(screen.getByText(/A\.R\.T\. Productions brings raw, unpolished energy/)).toBeInTheDocument();
    });

    it('renders only instagram and tiktok links', () => {
      renderPage(ARTProductions);
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tiktok/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /spotify/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /youtube/i })).not.toBeInTheDocument();
    });

    it('renders the producers-of section', () => {
      renderPage(ARTProductions);
      expect(screen.getByText(/A\.R\.T\. Productions produces the majority of releases for:/)).toBeInTheDocument();
      expect(screen.getByText(/Jamaal Matters — streaming now\./)).toBeInTheDocument();
    });

    it('renders the stats', () => {
      renderPage(ARTProductions);
      expect(screen.getByText('Boom Bap / Trap')).toBeInTheDocument();
      expect(screen.getByText('Jamaal Matters, Shyst Vader')).toBeInTheDocument();
    });
  });

  describe('Soulyghost', () => {
    it('renders the artist name and bio', () => {
      renderPage(Soulyghost);
      expect(screen.getAllByText('The Soulyghost').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Singer.*Songwriter.*Performer/)).toBeInTheDocument();
      expect(screen.getByText(/haunting melodies and soul-baring lyricism/)).toBeInTheDocument();
    });

    it('renders the expected social links', () => {
      renderPage(Soulyghost);
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /spotify/i })).toHaveAttribute(
        'href',
        'https://open.spotify.com/artist/5I0MlK68aOYfPGsIdmBrIr'
      );
      expect(screen.getByRole('link', { name: /tiktok/i })).toBeInTheDocument();
    });

    it('renders the Spotify embed', () => {
      renderPage(Soulyghost);
      expect(screen.getByTestId('spotify-embed-stub')).toBeInTheDocument();
    });

    it('does not render the bandcamp discography (no bandcampArtist prop)', () => {
      renderPage(Soulyghost);
      expect(screen.queryByTestId('bandcamp-discography-stub')).not.toBeInTheDocument();
      expect(screen.getByText(/Discography coming soon\./)).toBeInTheDocument();
    });
  });
});