import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const mockThen = (cb: (val: any) => void) => cb({ data: [], error: null });

const createQueryChain = () => {
  const chain: any = {
    then: mockThen,
    catch: vi.fn(),
  };
  ['select', 'eq', 'in', 'ilike', 'order', 'limit', 'single'].forEach((method) => {
    chain[method] = () => chain;
  });
  return chain;
};

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => createQueryChain(),
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

import Catalog from '../../pages/Catalog';

function renderCatalog() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('Catalog Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders Licensed Sync heading', () => {
    renderCatalog();
    expect(screen.getByText('Licensed Sync')).toBeVisible();
  });

  it('renders search input', () => {
    renderCatalog();
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    expect(searchInput).toBeVisible();
  });

  it('renders Genre filter section', () => {
    renderCatalog();
    expect(screen.getByRole('heading', { name: 'Genre' })).toBeVisible();
  });

  it('renders 100% Pre-Cleared badge', () => {
    renderCatalog();
    expect(screen.getByText('100% Pre-Cleared')).toBeVisible();
  });
});
