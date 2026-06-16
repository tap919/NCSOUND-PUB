import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../lib/supabase', () => {
  function createSupabaseMock(returnData: any[] | null = []) {
    const self: any = {};
    self.then = (cb: (val: any) => void) => cb({ data: returnData, error: null });
    return new Proxy(self, {
      get(_, prop) {
        if (prop === 'then') return self.then;
        return () => self;
      },
    });
  }
  return { supabase: { from: () => createSupabaseMock() } };
});

import Briefs from '../../../pages/admin/Briefs';

function renderBriefs() {
  return render(
    <MemoryRouter>
      <Briefs />
    </MemoryRouter>
  );
}

describe('Admin Briefs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders heading', async () => {
    renderBriefs();
    await waitFor(() => expect(screen.getByText('Briefs & Matching')).toBeVisible());
  });

  it('shows empty state when no briefs', async () => {
    renderBriefs();
    await waitFor(() => expect(screen.getByText('No briefs yet.')).toBeVisible());
  });

  it('renders back link to dashboard', async () => {
    renderBriefs();
    await waitFor(() => expect(screen.getByText('Back to Dashboard')).toBeVisible());
  });
});
