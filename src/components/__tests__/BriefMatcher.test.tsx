import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BriefMatcher } from '../../components/BriefMatcher';

let mockTracks: any[] = [];

const createQueryBuilder = () => {
  const builder: any = {};
  builder.select = () => builder;
  builder.eq = () => builder;
  builder.ilike = () => builder;
  builder.gte = () => builder;
  builder.lte = () => builder;
  builder.in = () => builder;
  builder.limit = () => builder;
  builder.order = () => builder;
  builder.then = (onFulfilled: any) =>
    Promise.resolve({ data: mockTracks, error: null }).then(onFulfilled);
  return builder;
};

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => createQueryBuilder(),
  },
}));

vi.mock('../../../lib/embeddings', () => ({
  buildBriefEmbeddingText: () => 'test embedding text',
  buildTrackEmbeddingText: () => 'test track text',
  cosineSimilarity: () => 0.5,
  rankBySimilarity: () => [],
}));

describe('BriefMatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTracks = [];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ text: '[]' }),
      })
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <BriefMatcher brief={{ genre: 'rock', mood: 'dark', bpmMin: 120, bpmMax: 140, energy: 'high' }} />
    );
    expect(container).toBeTruthy();
    expect(await screen.findByText(/No matching tracks found|AI Match Results/)).toBeVisible();
  });

  it('renders AI Match Results heading when tracks are found', async () => {
    mockTracks = [
      { id: '1', title: 'Test Track', genre: 'rock', bpm: 130, energy_level: 'high', artists: { stage_name: 'Artist' } },
    ];
    render(
      <MemoryRouter>
        <BriefMatcher brief={{ genre: 'rock' }} />
      </MemoryRouter>
    );
    const heading = await screen.findByText('AI Match Results', {}, { timeout: 5000 });
    expect(heading).toBeVisible();
  });

  it('renders no-matches message when no tracks found', async () => {
    render(<BriefMatcher brief={{ genre: 'nonexistent' }} />);
    const msg = await screen.findByText(/No matching tracks found/, {}, { timeout: 5000 });
    expect(msg).toBeVisible();
  });

  it('shows loading skeletons initially', async () => {
    const { container } = render(<BriefMatcher brief={{ genre: 'rock' }} />);
    await waitFor(() => {
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
