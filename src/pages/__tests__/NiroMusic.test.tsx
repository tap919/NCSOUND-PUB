import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

function createSupabaseMock(returnData: any[] | null = []) {
  const thenFn = (cb: (val: any) => void) => cb({ data: returnData, error: null });
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') return thenFn;
      return () => new Proxy({}, handler);
    },
  };
  return new Proxy({}, handler);
}

vi.mock('../../lib/supabase', () => ({
  supabase: { from: () => createSupabaseMock() },
}));

vi.mock('../../components/SpotifyEmbed', () => ({
  default: () => <div>SpotifyEmbed</div>,
}));

import NiroMusic from '../../pages/NiroMusic';

function renderPage() {
  return render(
    <MemoryRouter>
      <NiroMusic />
    </MemoryRouter>
  );
}

describe('NiroMusic', () => {
  it('renders the music heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Niro')).toBeVisible();
      expect(screen.getByText('Music')).toBeVisible();
    });
  });

  it('renders the album area', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No albums available yet.')).toBeVisible();
    });
  });
});
