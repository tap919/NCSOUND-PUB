import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const mockTrackData = {
  id: 'test-id',
  title: 'Test Track',
  genre: 'Soul',
  bpm: 90,
  key_signature: 'C minor',
  energy_level: 'high',
  mood_tags: ['smooth', 'warm'],
  instrumentation: ['piano', 'bass'],
  status: 'active',
  isrc: 'US-ABC-12-34567',
  iswc: 'T-123.456.789-0',
  artists: { stage_name: 'Test Artist', pro_affiliation: 'ASCAP' },
  track_writers: [],
  track_files: [],
  owns_master: true,
  owns_publishing: true,
  visibility: 'public',
};

const createQueryChain = (responseData: any) => {
  const chain: any = {
    then: (cb: (val: any) => void) => {
      cb({ data: responseData, error: null });
      return chain;
    },
    catch: vi.fn(),
  };
  ['select', 'eq', 'in', 'ilike', 'order', 'limit', 'single', 'insert'].forEach((method) => {
    chain[method] = () => chain;
  });
  return chain;
};

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => createQueryChain(mockTrackData),
  },
}));

vi.mock('../../store/usePlayerStore', () => ({
  usePlayerStore: () => ({
    currentTrack: null,
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    playTrack: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
  }),
}));

vi.mock('../../components/SEO', () => ({
  SEO: ({ title }: { title: string }) => <title>{title}</title>,
}));

import TrackDetail from '../../pages/TrackDetail';

function renderTrackDetail() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/catalog/test-id']}>
        <Routes>
          <Route path="/catalog/:id" element={<TrackDetail />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('TrackDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', async () => {
    const { container } = renderTrackDetail();
    await waitFor(() => {
      expect(screen.getByText('Test Track')).toBeVisible();
    });
    expect(container).toBeTruthy();
  });

  it('renders track metadata after data loads', async () => {
    renderTrackDetail();
    await waitFor(() => {
      expect(screen.getByText('Test Track')).toBeVisible();
    });
    expect(screen.getByText('Test Artist')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Test Track' })).toBeVisible();
    expect(screen.getByText('90')).toBeVisible();
    expect(screen.getByText('C minor')).toBeVisible();
    expect(screen.getAllByText('high').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Soul').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('smooth').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('warm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('piano').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('bass').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('US-ABC-12-34567')).toBeVisible();
  });
});
