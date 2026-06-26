import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../lib/supabase', () => {
  const emptyResult = { data: [], error: null };
  const chainProxy: any = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: any) => resolve(emptyResult);
      }
      return (..._args: any[]) => chainProxy;
    },
  });
  return { supabase: { from: () => chainProxy } };
});

import SupervisorRequests from '../../../pages/admin/SupervisorRequests';

function renderSupervisorRequests() {
  return render(
    <MemoryRouter>
      <SupervisorRequests />
    </MemoryRouter>
  );
}

describe('Admin Supervisor Requests', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders heading', async () => {
    renderSupervisorRequests();
    await waitFor(() => expect(screen.getByText('Supervisor Requests')).toBeVisible());
  });

  it('shows empty state when no requests', async () => {
    renderSupervisorRequests();
    await waitFor(() => expect(screen.getByText('No requests yet.')).toBeVisible());
  });

  it('renders back link to dashboard', async () => {
    renderSupervisorRequests();
    await waitFor(() => expect(screen.getByText('Back to Dashboard')).toBeVisible());
  });
});
