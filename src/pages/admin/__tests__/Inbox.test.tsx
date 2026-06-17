import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../lib/supabase', () => {
  function chain(returnData: any[] | null = []) {
    const thenFulfill = (cb: (val: any) => void) => cb({ data: returnData, error: null });
    return { then: thenFulfill, select: () => chain(returnData), order: () => chain(returnData), range: () => chain(returnData) };
  }
  return { supabase: { from: () => chain() } };
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
    await expect(screen.findByText('No submissions yet.', {}, { timeout: 5000 })).resolves.toBeVisible();
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
