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

import SubmitBrief from '../../pages/SubmitBrief';

function renderPage() {
  return render(
    <MemoryRouter>
      <SubmitBrief />
    </MemoryRouter>
  );
}

describe('SubmitBrief', () => {
  it('renders the brief heading', () => {
    renderPage();
    expect(screen.getByText('Submit a')).toBeVisible();
    expect(screen.getByText('Brief')).toBeVisible();
  });

  it('renders the form fields', () => {
    renderPage();
    expect(screen.getByText('Project Title / Network')).toBeVisible();
    expect(screen.getByText('Genre / Mood / Descriptors')).toBeVisible();
    expect(screen.getByText('Company Email')).toBeVisible();
  });

  it('renders the dispatch button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Dispatch Brief' })).toBeVisible();
  });
});
