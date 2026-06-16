import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminControl from '../Control';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'admin-id', role: 'admin' }, signOut: vi.fn() }),
}));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url === '/api/health') {
      return Promise.resolve({ json: () => Promise.resolve({ status: 'ok' }) });
    }
    if (url === '/api/analytics/admin') {
      return Promise.resolve({ json: () => Promise.resolve({ status: 'ok' }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  }));
});

afterAll(() => {
  vi.unstubAllGlobals();
});

function renderControl() {
  return render(
    <MemoryRouter>
      <AdminControl />
    </MemoryRouter>
  );
}

describe('Admin Control', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders heading', async () => {
    renderControl();
    expect(await screen.findByText('Control')).toBeVisible();
    expect(screen.getByText('Center')).toBeVisible();
  });

  it('renders metric cards', async () => {
    renderControl();
    expect(await screen.findByText('Control')).toBeVisible();
    expect(screen.getByText('API Status')).toBeVisible();
    expect(screen.getByText('Database')).toBeVisible();
    expect(screen.getByText('Storage')).toBeVisible();
    expect(screen.getByText('Cron Jobs')).toBeVisible();
  });

  it('renders back link to dashboard', async () => {
    renderControl();
    expect(await screen.findByText('← Back to Admin')).toBeVisible();
  });
});
