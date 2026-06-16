import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-id' } }),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ remaining: 5, monthly_limit: 10 }),
      })
    )
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

import PlaylistSubmit from '../../pages/PlaylistSubmit';

function renderPage() {
  return render(
    <MemoryRouter>
      <PlaylistSubmit />
    </MemoryRouter>
  );
}

describe('PlaylistSubmit', () => {
  it('renders the upload heading', async () => {
    renderPage();
    expect(await screen.findByText('Submit to')).toBeVisible();
    expect(await screen.findByText('Playlist')).toBeVisible();
  });

  it('renders the step indicator', async () => {
    renderPage();
    expect(await screen.findByText('Track Details')).toBeVisible();
  });
});
