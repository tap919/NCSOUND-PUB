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

  it('renders profile form', () => {
    renderProfile();
    expect(screen.getByText('Artist')).toBeVisible();
    expect(screen.getByText('Profile')).toBeVisible();
    expect(screen.getByText('Stage Name')).toBeVisible();
    expect(screen.getByText('Legal Name')).toBeVisible();
  });

  it('renders save button', () => {
    renderProfile();
    expect(screen.getByText('Save Profile')).toBeVisible();
  });

  it('shows no links connected state', () => {
    renderProfile();
    expect(screen.getByText('Connected Platforms')).toBeVisible();
    expect(screen.getByText(/No links added yet/)).toBeVisible();
  });
});
