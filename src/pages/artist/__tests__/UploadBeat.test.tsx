import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function createSupabaseMock(returnData: any[] | null = []) {
  const chain: any = {};
  const self = new Proxy(chain, {
    get(_target, prop) {
      if (prop === 'then') return chain.then;
      return () => self;
    },
  });
  chain.then = (cb: (val: any) => void) => cb({ data: returnData, error: null });
  return self;
}

vi.mock('../../../lib/supabase', () => ({ supabase: { from: () => createSupabaseMock() } }));
vi.mock('../../../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'test-id' }, signOut: vi.fn() }) }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import UploadBeat from '../UploadBeat';

function renderUploadBeat() {
  return render(
    <MemoryRouter>
      <UploadBeat />
    </MemoryRouter>
  );
}

describe('Artist UploadBeat', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders beat upload form', () => {
    renderUploadBeat();
    expect(screen.getByText('Upload')).toBeVisible();
    expect(screen.getByText('Beat')).toBeVisible();
    expect(screen.getByText(/List a new beat/)).toBeVisible();
  });

  it('renders title input', () => {
    renderUploadBeat();
    const titleInput = screen.getByPlaceholderText('e.g. Midnight Drive');
    expect(titleInput).toBeVisible();
    expect(titleInput).toHaveAttribute('required');
  });

  it('renders genre selector', () => {
    renderUploadBeat();
    const genreSelect = screen.getByRole('combobox');
    expect(genreSelect).toBeVisible();
  });

  it('renders lease price input', () => {
    renderUploadBeat();
    expect(screen.getByText('Lease Price (USD)')).toBeVisible();
    const priceInput = screen.getByPlaceholderText('29.99');
    expect(priceInput).toBeVisible();
  });
});
