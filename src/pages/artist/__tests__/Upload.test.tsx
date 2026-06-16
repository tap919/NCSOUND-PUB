import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

import Upload from '../Upload';

function renderUpload() {
  return render(
    <MemoryRouter>
      <Upload />
    </MemoryRouter>
  );
}

describe('Artist Upload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders step 1 form fields', () => {
    renderUpload();
    expect(screen.getByText('Audio Assets')).toBeVisible();
    expect(screen.getByText(/Drag & Drop Main Master/)).toBeVisible();
  });

  it('renders artist name fields in step 2', () => {
    renderUpload();
    fireEvent.click(screen.getByText('Next Step'));
    expect(screen.getByText('Core Metadata')).toBeVisible();
    expect(screen.getByPlaceholderText('e.g. STREET ANTHEM')).toBeVisible();
  });

  it('renders publishing rights section in step 3', () => {
    renderUpload();
    fireEvent.click(screen.getByText('Next Step'));
    fireEvent.click(screen.getByText('Next Step'));
    expect(screen.getByText('Rights Declarations')).toBeVisible();
    expect(screen.getByText('Master Ownership Confirmation')).toBeVisible();
    expect(screen.getByText('Publishing Confirmation')).toBeVisible();
  });

  it('renders submit upload button', () => {
    renderUpload();
    fireEvent.click(screen.getByText('Next Step'));
    fireEvent.click(screen.getByText('Next Step'));
    expect(screen.getByText('Submit Track')).toBeVisible();
  });
});
