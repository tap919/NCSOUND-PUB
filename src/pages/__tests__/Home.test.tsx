import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              then: (cb: (val: any) => void) => cb({ data: [], error: null }),
            }),
          }),
        }),
        limit: () => ({
          single: () => ({
            then: (cb: (val: any) => void) => cb({ data: null, error: null }),
          }),
        }),
      }),
    }),
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

vi.mock('../../components/SpotifyEmbed', () => ({
  default: () => <div>SpotifyEmbed</div>,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

import Home from '../../pages/Home';

function renderHome() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('Home (Regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing (regression: missing div wrapper / import errors)', async () => {
    const { container } = renderHome();
    expect(container).toBeTruthy();
    expect(await screen.findByText(/The Only Beat Store That/i)).toBeVisible();
  });

  it('renders the hero heading', async () => {
    renderHome();
    expect(await screen.findByText(/The Only Beat Store That/i)).toBeVisible();
  });

  it('renders Submit Your Catalog link', async () => {
    renderHome();
    expect(await screen.findByRole('link', { name: 'Submit Your Catalog' })).toBeVisible();
  });

  it('renders Supervisor Access link', async () => {
    renderHome();
    expect(await screen.findByRole('link', { name: 'Supervisor Access' })).toBeVisible();
  });

  it('renders Featured Sync Catalog section', async () => {
    renderHome();
    expect(await screen.findByText('Featured Sync Catalog')).toBeVisible();
  });

  it('renders without featured tracks crashing (regression: stale mock data)', async () => {
    renderHome();
    expect(await screen.findByText('Featured Sync Catalog')).toBeVisible();
  });

  it('renders Listen section', async () => {
    renderHome();
    expect(await screen.findByText('Hear Our Artists')).toBeVisible();
  });

  it('renders email capture form', async () => {
    renderHome();
    expect(await screen.findByPlaceholderText('Enter your email')).toBeVisible();
  });
});
