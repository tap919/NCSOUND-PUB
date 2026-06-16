import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../components/SEO', () => ({
  SEO: ({ title }: { title: string }) => <title>{title}</title>,
}));

import Privacy from '../../pages/Privacy';

function renderPage() {
  return render(
    <MemoryRouter>
      <Privacy />
    </MemoryRouter>
  );
}

describe('Privacy', () => {
  it('renders the privacy heading', () => {
    renderPage();
    expect(screen.getByText('Privacy Policy')).toBeVisible();
  });
});
