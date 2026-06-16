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

  it('renders without crashing (regression: missing div wrapper / import errors)', () => {
    const { container } = renderHome();
    expect(container).toBeTruthy();
  });

  it('renders the hero heading', () => {
    renderHome();
    expect(screen.getByText(/The Only Beat Store That/i)).toBeVisible();
  });

  it('renders Submit Your Catalog link', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'Submit Your Catalog' })).toBeVisible();
  });

  it('renders Supervisor Access link', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'Supervisor Access' })).toBeVisible();
  });

  it('renders Featured Sync Catalog section', () => {
    renderHome();
    expect(screen.getByText('Featured Sync Catalog')).toBeVisible();
  });

  it('renders without featured tracks crashing (regression: stale mock data)', () => {
    renderHome();
    expect(screen.getByText('Featured Sync Catalog')).toBeVisible();
  });

  it('renders Listen section', () => {
    renderHome();
    expect(screen.getByText('Hear Our Artists')).toBeVisible();
  });

  it('renders email capture form', () => {
    renderHome();
    expect(screen.getByPlaceholderText('Enter your email')).toBeVisible();
  });
});
