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

  it('renders royalties heading', () => {
    renderRoyalties();
    expect(screen.getByText('Royalties')).toBeVisible();
  });

  it('shows statement list area', () => {
    renderRoyalties();
    expect(screen.getByText('Statement History')).toBeVisible();
  });

  it('shows Stripe connect section', () => {
    renderRoyalties();
    expect(screen.getByText('Connect Stripe')).toBeVisible();
  });

  it('shows loading state initially', () => {
    renderRoyalties();
    expect(screen.getByText('Loading statements...')).toBeVisible();
  });
});
