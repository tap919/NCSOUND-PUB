import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

import LicenseRequests from '../../../pages/admin/LicenseRequests';

function renderLicenseRequests() {
  return render(
    <MemoryRouter>
      <LicenseRequests />
    </MemoryRouter>
  );
}

describe('Admin License Requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders heading', async () => {
    renderLicenseRequests();
    await waitFor(() => expect(screen.getByText('License Requests')).toBeVisible());
  });

  it('shows empty state when no requests', async () => {
    renderLicenseRequests();
    await waitFor(() => expect(screen.getByText('No license requests yet.')).toBeVisible());
  });

  it('renders back link to dashboard', async () => {
    renderLicenseRequests();
    await waitFor(() => expect(screen.getByText('Back to Dashboard')).toBeVisible());
  });
});
