import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

function createSupabaseMock(returnData: any[] | null = []) {
  const thenFn = (cb: (val: any) => void) => cb({ data: returnData, error: null });
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') return thenFn;
      return () => new Proxy({}, handler);
    },
  };
  return new Proxy({}, handler);
}

vi.mock('../../lib/supabase', () => ({
  supabase: { from: () => createSupabaseMock() },
}));

import SupervisorPortal from '../../pages/SupervisorPortal';

function renderPage() {
  return render(
    <MemoryRouter>
      <SupervisorPortal />
    </MemoryRouter>
  );
}

describe('SupervisorPortal', () => {
  it('renders the hub heading', () => {
    renderPage();
    expect(screen.getByText('Music Supervisor')).toBeVisible();
    expect(screen.getByText('Hub')).toBeVisible();
  });

  it('renders the login form', () => {
    renderPage();
    expect(screen.getByText('Email')).toBeVisible();
    expect(screen.getByText('Access Key')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Enter Catalog' })).toBeVisible();
  });

  it('renders the 24-Hour Clearance feature', () => {
    renderPage();
    expect(screen.getByText('24-Hour Clearance')).toBeVisible();
  });
});
