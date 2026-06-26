import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MetricsTab from '../../admin/dashboard/MetricsTab';

describe('MetricsTab', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('shows loading state initially', () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Promise(() => {}) as unknown as Response);
    render(<MetricsTab />);
    expect(screen.getByText('Loading metrics...')).toBeVisible();
  });

  it('renders acquisition metrics after data loads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        total_catalog: 150,
        active_artists: 12,
        supervisor_accounts: 5,
        total_income: 45000,
      }),
    } as Response);

    render(<MetricsTab />);
    await waitFor(() => {
      expect(screen.getByText('Acquisition Dashboard')).toBeVisible();
    });
    expect(screen.getByText('150')).toBeVisible();
    expect(screen.getByText('Catalog Size')).toBeVisible();
    expect(screen.getByText('12')).toBeVisible();
    expect(screen.getByText('5')).toBeVisible();
    expect(screen.getByText('$45000')).toBeVisible();
  });

  it('renders card labels', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        total_catalog: 0,
        active_artists: 0,
        supervisor_accounts: 0,
        total_income: 0,
      }),
    } as Response);

    render(<MetricsTab />);
    await waitFor(() => {
      expect(screen.getByText('Catalog Size')).toBeVisible();
    });
    expect(screen.getByText('Artists')).toBeVisible();
    expect(screen.getByText('Supervisors')).toBeVisible();
    expect(screen.getByText('Sync Revenue')).toBeVisible();
  });

  it('handles fetch error gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    render(<MetricsTab />);
    await waitFor(() => {
      expect(screen.getByText('Loading metrics...')).toBeVisible();
    });
  });
});
