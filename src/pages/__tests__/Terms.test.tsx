import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../components/SEO', () => ({
  SEO: ({ title }: { title: string }) => <title>{title}</title>,
}));

import Terms from '../../pages/Terms';

function renderPage() {
  return render(
    <MemoryRouter>
      <Terms />
    </MemoryRouter>
  );
}

describe('Terms', () => {
  it('renders the terms heading', () => {
    renderPage();
    expect(screen.getByText('Terms of Service')).toBeVisible();
  });
});
