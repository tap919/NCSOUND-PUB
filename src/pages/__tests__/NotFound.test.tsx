import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NotFound from '../../pages/NotFound';

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  );
}

describe('NotFound', () => {
  it('renders the 404 text', () => {
    renderPage();
    expect(screen.getByText('404')).toBeVisible();
  });

  it('renders the return home link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Return Home' })).toBeVisible();
  });
});
