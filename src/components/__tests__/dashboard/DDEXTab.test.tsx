import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DDEXTab from '../../admin/dashboard/DDEXTab';

describe('DDEXTab', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:url'), revokeObjectURL: vi.fn() });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('renders DDEX ERN heading', () => {
    render(<DDEXTab />);
    expect(screen.getByText('DDEX ERN 4.3 Delivery')).toBeVisible();
  });

  it('renders description text', () => {
    render(<DDEXTab />);
    expect(screen.getByText(/Spotify, Apple Music, and Amazon/)).toBeVisible();
  });

  it('renders generate and export buttons', () => {
    render(<DDEXTab />);
    expect(screen.getByText('Generate ERN 4.3 XML')).toBeVisible();
    expect(screen.getByText('Export CWR v2.2')).toBeVisible();
  });

  it('shows generating status on button click', async () => {
    // Never resolve the fetch so we see the loading state
    vi.mocked(fetch).mockResolvedValueOnce(new Promise(() => {}) as unknown as Response);

    render(<DDEXTab />);
    fireEvent.click(screen.getByText('Generate ERN 4.3 XML'));

    await waitFor(() => {
      expect(screen.getAllByText(/Generating/).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows error message on failed generation', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'No tracks to export' }),
    } as Response);

    render(<DDEXTab />);
    fireEvent.click(screen.getByText('Generate ERN 4.3 XML'));

    await waitFor(() => {
      expect(screen.getByText(/Error: No tracks to export/)).toBeVisible();
    });
  });
});
