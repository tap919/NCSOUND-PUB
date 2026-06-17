import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../GlobalPlayer', () => ({
  GlobalPlayer: () => <div>Player</div>,
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ role: 'admin', user: { id: '1' }, loading: false, session: null, signOut: vi.fn() }),
}));

vi.mock('../../../store/usePlayerStore', () => ({
  usePlayerStore: () => ({ currentTrack: null }),
}));

import { Layout } from '../../layout/Layout';

function renderLayout() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div>Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  it('renders navigation links', () => {
    renderLayout();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Sync Catalog')).toBeInTheDocument();
    expect(screen.getByText('Submit Your Catalog')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderLayout();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
