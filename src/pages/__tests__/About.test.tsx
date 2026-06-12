import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import About from '../About';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
  },
}));

describe('About', () => {
  it('renders header text', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <About />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/built for artist/i)).toBeInTheDocument();
    expect(screen.getByText(/about ncsound publishing/i)).toBeInTheDocument();
  });

  it('renders all artist roster entries', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <About />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText('TAP919')).toBeInTheDocument();
    expect(screen.getByText('Mr. Niro')).toBeInTheDocument();
    expect(screen.getByText('A.R.T. Productions')).toBeInTheDocument();
    expect(screen.getByText('The Soulyghost')).toBeInTheDocument();
  });

  it('renders all feature sections', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <About />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/artist-first payouts/i)).toBeInTheDocument();
    expect(screen.getByText(/north carolina roots/i)).toBeInTheDocument();
    expect(screen.getByText(/non-exclusive freedom/i)).toBeInTheDocument();
    expect(screen.getByText(/rapid clearing/i)).toBeInTheDocument();
  });
});
