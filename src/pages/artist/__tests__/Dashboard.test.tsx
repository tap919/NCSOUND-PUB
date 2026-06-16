import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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
vi.mock('../../../components/SEO', () => ({ SEO: ({ title }: { title: string }) => <title>{title}</title> }));
vi.mock('../../../components/AgentChat', () => ({ default: () => <div>AgentChat</div> }));
vi.mock('recharts', () => ({
  BarChart: () => <svg />,
  Bar: () => <svg />,
  XAxis: () => <svg />,
  YAxis: () => <svg />,
  CartesianGrid: () => <svg />,
  Tooltip: () => <svg />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

import Dashboard from '../Dashboard';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Artist Dashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', async () => {
    renderDashboard();
    expect(await screen.findByText('Dashboard')).toBeVisible();
  });

  it('renders tab navigation', async () => {
    renderDashboard();
    expect(await screen.findByText('My Catalog')).toBeVisible();
    expect(await screen.findByText('Royalties')).toBeVisible();
    expect(await screen.findByText('Insights')).toBeVisible();
  });

  it('shows loading state in catalog', async () => {
    renderDashboard();
    expect(await screen.findByText('Loading catalog...')).toBeVisible();
  });

  it('renders logout button', async () => {
    renderDashboard();
    expect(await screen.findByText('Sign Out')).toBeVisible();
  });

  it('renders AgentChat area', async () => {
    renderDashboard();
    expect(await screen.findByText('AgentChat')).toBeVisible();
  });
});
