import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    session: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import ArtistLogin from '../../../pages/artist/Login';

function renderLogin() {
  return render(
    <MemoryRouter>
      <ArtistLogin />
    </MemoryRouter>
  );
}

describe('Artist Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders login form with email and password inputs', () => {
    renderLogin();
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    expect(emailInput).toBeVisible();
    expect(emailInput).toHaveAttribute('type', 'email');
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeVisible();
    expect(passwordInput).toHaveAttribute('required');
  });

  it('renders Sign in to Portal button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: 'Sign in to Portal' })).toBeVisible();
  });

  it('renders link to create account', () => {
    renderLogin();
    expect(screen.getByText(/Need an account/)).toBeVisible();
  });

  it('renders forgot password link', () => {
    renderLogin();
    expect(screen.getByText('Forgot Password?')).toBeVisible();
  });
});
