import { describe, it, expect, vi } from 'vitest';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

vi.mock('../App', () => ({
  default: () => null,
}));

vi.mock('../hooks/useAuth', () => ({
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock('../components/Toast', () => ({
  ToastContainer: () => null,
}));

vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }: any) => <>{children}</>,
}));

describe('main', () => {
  it('module can be imported', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await expect(import('../main')).resolves.toBeDefined();
  });
});
