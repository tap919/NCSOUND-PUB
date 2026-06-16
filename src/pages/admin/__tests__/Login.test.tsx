import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    session: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import AdminLogin from '../../../pages/admin/Login';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>
  );
}

describe('Admin Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders System Access heading', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'System Access' })).toBeVisible();
  });

  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/admin@ncsound/i)).toBeVisible();
    expect(document.querySelector('input[type="password"]')).toBeVisible();
  });

  it('renders Authenticate button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: 'Authenticate' })).toBeVisible();
  });
});
