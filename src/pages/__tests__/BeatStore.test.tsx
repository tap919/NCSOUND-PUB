import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => {
      const chain: any = {};
      chain.then = (cb: (val: any) => void) => cb({ data: [], error: null });
      const handler: ProxyHandler<any> = {
        get(_target, prop) {
          if (prop === 'then') return chain.then;
          return () => new Proxy(chain, handler);
        },
      };
      return new Proxy(chain, handler);
    },
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import BeatStore from '../../pages/BeatStore';

function renderBeatStore() {
  return render(
    <MemoryRouter>
      <BeatStore />
    </MemoryRouter>
  );
}

describe('BeatStore (Regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = renderBeatStore();
    expect(container).toBeTruthy();
    expect(await screen.findByText('Beat Store')).toBeVisible();
  });

  it('renders the Beat Store heading', async () => {
    renderBeatStore();
    expect(await screen.findByText('Beat Store')).toBeVisible();
  });

  it('renders genre filter buttons', async () => {
    renderBeatStore();
    expect(await screen.findByText('All')).toBeVisible();
    expect(await screen.findByText('Soul')).toBeVisible();
    expect(await screen.findByText('Hip-Hop')).toBeVisible();
  });

  it('shows loading state initially', async () => {
    renderBeatStore();
    expect(await screen.findByText('Loading beats...')).toBeVisible();
  });

  it('does NOT render a play button (regression: play button removed, beats for sync only)', async () => {
    renderBeatStore();
    await screen.findByText('Beat Store');
    expect(screen.queryByRole('button', { name: /play/i })).toBeNull();
  });

  it('renders pricing tiers section', async () => {
    renderBeatStore();
    expect(await screen.findByText('First Wave Lease')).toBeVisible();
    expect(await screen.findByText('Standard Lease')).toBeVisible();
    expect(await screen.findByText('WAV + Stems')).toBeVisible();
  });
});
