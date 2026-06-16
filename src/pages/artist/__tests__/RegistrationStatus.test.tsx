import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

import RegistrationStatus from '../RegistrationStatus';

function renderRegistrationStatus() {
  return render(
    <MemoryRouter>
      <RegistrationStatus />
    </MemoryRouter>
  );
}

describe('Artist RegistrationStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders status heading', () => {
    renderRegistrationStatus();
    expect(screen.getByText('Registration')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();
  });

  it('shows loading state initially', () => {
    renderRegistrationStatus();
    expect(screen.getByText('Loading registrations...')).toBeVisible();
  });

  it('handles empty registrations', async () => {
    renderRegistrationStatus();
    await waitFor(() => {
      expect(screen.getByText(/metadata validation/)).toBeVisible();
    });
  });
});
