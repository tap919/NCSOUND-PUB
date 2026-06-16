import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-id' } }),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ remaining: 5, monthly_limit: 10 }),
  })
) as any;

import PlaylistSubmit from '../../pages/PlaylistSubmit';

function renderPage() {
  return render(
    <MemoryRouter>
      <PlaylistSubmit />
    </MemoryRouter>
  );
}

describe('PlaylistSubmit', () => {
  it('renders the upload heading', () => {
    renderPage();
    expect(screen.getByText('Submit to')).toBeVisible();
    expect(screen.getByText('Playlist')).toBeVisible();
  });

  it('renders the step indicator', () => {
    renderPage();
    expect(screen.getByText('Track Details')).toBeVisible();
  });
});
