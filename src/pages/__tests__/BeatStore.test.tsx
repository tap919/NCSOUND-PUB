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

  it('renders without crashing', () => {
    const { container } = renderBeatStore();
    expect(container).toBeTruthy();
  });

  it('renders the Beat Store heading', () => {
    renderBeatStore();
    expect(screen.getByText('Beat Store')).toBeVisible();
  });

  it('renders genre filter buttons', () => {
    renderBeatStore();
    expect(screen.getByText('All')).toBeVisible();
    expect(screen.getByText('Soul')).toBeVisible();
    expect(screen.getByText('Hip-Hop')).toBeVisible();
  });

  it('shows loading state initially', () => {
    renderBeatStore();
    expect(screen.getByText('Loading beats...')).toBeVisible();
  });

  it('does NOT render a play button (regression: play button removed, beats for sync only)', () => {
    renderBeatStore();
    expect(screen.queryByRole('button', { name: /play/i })).toBeNull();
  });

  it('renders pricing tiers section', () => {
    renderBeatStore();
    expect(screen.getByText('First Wave Lease')).toBeVisible();
    expect(screen.getByText('Standard Lease')).toBeVisible();
    expect(screen.getByText('WAV + Stems')).toBeVisible();
  });
});
