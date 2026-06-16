import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpotifyEmbed from '../SpotifyEmbed';

describe('SpotifyEmbed', () => {
  it('renders iframe with correct Spotify URL for artist type', () => {
    render(<SpotifyEmbed type="artist" id="abc123" />);
    const iframe = screen.getByTitle('Spotify artist');
    expect(iframe).toHaveAttribute('src', 'https://open.spotify.com/embed/artist/abc123?utm_source=generator');
  });

  it('renders iframe with correct URL for album type', () => {
    render(<SpotifyEmbed type="album" id="xyz789" />);
    const iframe = screen.getByTitle('Spotify album');
    expect(iframe).toHaveAttribute('src', 'https://open.spotify.com/embed/album/xyz789?utm_source=generator');
  });
});
