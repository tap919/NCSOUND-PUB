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

import Profile from '../Profile';

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}

describe('Artist Profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders profile form', async () => {
    renderProfile();
    expect(await screen.findByText('Artist')).toBeVisible();
    expect(await screen.findByText('Profile')).toBeVisible();
    expect(await screen.findByText('Stage Name')).toBeVisible();
    expect(await screen.findByText('Legal Name')).toBeVisible();
  });

  it('renders save button', async () => {
    renderProfile();
    expect(await screen.findByText('Save Profile')).toBeVisible();
  });

  it('shows no links connected state', async () => {
    renderProfile();
    expect(await screen.findByText('Connected Platforms')).toBeVisible();
    expect(await screen.findByText(/No links added yet/)).toBeVisible();
  });
});
