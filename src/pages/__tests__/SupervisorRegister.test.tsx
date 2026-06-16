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

import SupervisorRegister from '../../pages/SupervisorRegister';

function renderPage() {
  return render(
    <MemoryRouter>
      <SupervisorRegister />
    </MemoryRouter>
  );
}

describe('SupervisorRegister', () => {
  it('renders the verification heading', () => {
    renderPage();
    expect(screen.getByText('Supervisor')).toBeVisible();
    expect(screen.getByText('Verification')).toBeVisible();
  });

  it('renders the form fields', () => {
    renderPage();
    expect(screen.getByText('First Name')).toBeVisible();
    expect(screen.getByText('Last Name')).toBeVisible();
    expect(screen.getByText('Company Email')).toBeVisible();
  });

  it('renders the submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  });
});
