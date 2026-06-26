import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App, { ProtectedRoute } from '../App';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute Integration', () => {
  it('redirects to fallbackPath if not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      role: null,
      session: null,
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <ProtectedRoute fallbackPath="/login">
              <div>Protected Content</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeDefined();
  });

  it('renders content if authenticated and role matches', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1' } as any,
      loading: false,
      role: 'artist',
      session: {} as any,
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <ProtectedRoute fallbackPath="/login" requiredRole="artist">
              <div>Protected Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('redirects if role does not match', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1' } as any,
      loading: false,
      role: 'artist',
      session: {} as any,
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute fallbackPath="/login" requiredRole="admin">
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeDefined();
  });
});
