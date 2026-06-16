import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

import CatalogSubmit from '../../pages/CatalogSubmit';

function renderPage() {
  return render(
    <MemoryRouter>
      <CatalogSubmit />
    </MemoryRouter>
  );
}

describe('CatalogSubmit', () => {
  it('renders the catalog heading', () => {
    renderPage();
    expect(screen.getByText(/Submit Your/)).toBeVisible();
    expect(screen.getByText(/Catalog for Publishing Administration/)).toBeVisible();
  });

  it('renders the Artist Information section', () => {
    renderPage();
    expect(screen.getByText('Artist Information')).toBeVisible();
  });

  it('renders the Publishing & Rights section', () => {
    renderPage();
    expect(screen.getByText('Publishing & Rights')).toBeVisible();
  });
});
