import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'admin-id', role: 'admin' }, signOut: vi.fn() }),
}));

vi.mock('../../components/AgentChat', () => ({
  default: () => null,
}));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterAll(() => {
  vi.unstubAllGlobals();
});

import AdminDashboard from '../../../pages/admin/Dashboard';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
}

describe('Admin Dashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    renderDashboard();
    expect(screen.getByText('System')).toBeVisible();
  });

  it('renders tab navigation', () => {
    renderDashboard();
    expect(screen.getByText('Metadata Layer')).toBeVisible();
    expect(screen.getByText('MLC Registry Sync')).toBeVisible();
    expect(screen.getByText('PRO / TuneRegistry')).toBeVisible();
    expect(screen.getByText('DDEX ERN Deliv.')).toBeVisible();
    expect(screen.getByText('Integrations')).toBeVisible();
    expect(screen.getByText('Deals & Cue Sheets')).toBeVisible();
  });

  it('renders sidebar header', () => {
    renderDashboard();
    expect(screen.getByText('System')).toBeVisible();
    expect(screen.getByText('Publishing Agent')).toBeVisible();
  });

  it('renders Exit Terminal button', () => {
    renderDashboard();
    expect(screen.getByText('Exit Terminal')).toBeVisible();
  });

  it('renders default tab content heading', () => {
    renderDashboard();
    expect(screen.getByText('Metadata Validation Engine')).toBeVisible();
  });
});
