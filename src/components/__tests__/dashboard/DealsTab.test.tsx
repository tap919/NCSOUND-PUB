import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DealsTab from '../../admin/dashboard/DealsTab';

describe('DealsTab', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('shows loading state initially', () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Promise(() => {}) as unknown as Response);
    render(<DealsTab />);
    expect(screen.getByText('Loading...')).toBeVisible();
  });

  it('renders deal metrics after data loads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        total_managed_fees: 12500.50,
        active_cue_sheets: 42,
        pending_payouts: 7,
      }),
    } as Response);

    render(<DealsTab />);
    await waitFor(() => {
      expect(screen.getByText('$12500.50')).toBeVisible();
    });
    expect(screen.getByText('Total Managed Fees')).toBeVisible();
    expect(screen.getByText('42')).toBeVisible();
    expect(screen.getByText('Active Cue Sheets')).toBeVisible();
    expect(screen.getByText('7')).toBeVisible();
    expect(screen.getByText('Pending Payouts')).toBeVisible();
  });

  it('handles fetch error gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    render(<DealsTab />);
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeVisible();
    });
  });
});
