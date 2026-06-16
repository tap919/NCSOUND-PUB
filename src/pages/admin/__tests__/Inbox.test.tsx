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

vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import Inbox from '../../../pages/admin/Inbox';

function renderInbox() {
  return render(
    <MemoryRouter>
      <Inbox />
    </MemoryRouter>
  );
}

describe('Admin Inbox', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders heading', async () => {
    renderInbox();
    await waitFor(() => expect(screen.getByText('Inbox')).toBeVisible());
  });

  it('shows empty state when no submissions', async () => {
    renderInbox();
    await waitFor(() => expect(screen.getByText('No submissions yet.')).toBeVisible());
  });

  it('shows pagination', async () => {
    renderInbox();
    await waitFor(() => expect(screen.getByText('Page 1')).toBeVisible());
    expect(screen.getByText('Previous')).toBeVisible();
    expect(screen.getByText('Next')).toBeVisible();
  });

  it('renders back link to dashboard', async () => {
    renderInbox();
    await waitFor(() => expect(screen.getByText('Back to Dashboard')).toBeVisible());
  });
});
