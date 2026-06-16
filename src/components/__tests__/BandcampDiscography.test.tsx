import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BandcampDiscography } from '../BandcampDiscography';

describe('BandcampDiscography', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            releases: [
              { title: 'Test Album', url: 'https://test.bandcamp.com', artist: 'Test', artUrl: 'test.jpg', type: 'album' },
            ],
          }),
      }),
    );
  });

  it('renders loading skeleton initially', () => {
    const { container } = render(<BandcampDiscography artist="Test" />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders releases after fetch', async () => {
    render(<BandcampDiscography artist="Test" />);
    await waitFor(() => {
      expect(screen.getByText('Test Album')).toBeInTheDocument();
    });
  });
});
