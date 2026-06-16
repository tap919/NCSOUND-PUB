import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

function createSupabaseMock(returnData: any[] | null = []) {
  const chain: any = {};
  const self = new Proxy(chain, {
    get(_target, prop) {
      if (prop === 'then') return chain.then;
      return () => self;
    },
  });
  chain.then = (cb: (val: any) => void) => cb({ data: returnData, error: null });
  return self;
}

vi.mock('../../../lib/supabase', () => ({ supabase: { from: () => createSupabaseMock() } }));
vi.mock('../../../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'test-id' }, signOut: vi.fn() }) }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import Royalties from '../Royalties';

function renderRoyalties() {
  return render(
    <MemoryRouter>
      <Royalties />
    </MemoryRouter>
  );
}

describe('Artist Royalties', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders royalties heading', async () => {
    renderRoyalties();
    expect(await screen.findByText('Royalties')).toBeVisible();
  });

  it('shows statement list area', async () => {
    renderRoyalties();
    expect(await screen.findByText('Statement History')).toBeVisible();
  });

  it('shows Stripe connect section', async () => {
    renderRoyalties();
    expect(await screen.findByText('Connect Stripe')).toBeVisible();
  });

  it('shows loading state initially', async () => {
    renderRoyalties();
    expect(await screen.findByText('Loading statements...')).toBeVisible();
  });
});
