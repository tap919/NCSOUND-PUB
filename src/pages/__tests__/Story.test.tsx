import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../components/SEO', () => ({
  SEO: ({ title }: { title: string }) => <title>{title}</title>,
}));

import Story from '../../pages/Story';

function renderPage() {
  return render(
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  );
}

describe('Story', () => {
  it('renders the story heading', () => {
    renderPage();
    expect(screen.getByText('NcSound')).toBeVisible();
  });

  it('renders chapter sections', () => {
    renderPage();
    expect(screen.getByText('PROLOGUE')).toBeVisible();
    expect(screen.getByText('CHAPTER I')).toBeVisible();
    expect(screen.getByText('CHAPTER II')).toBeVisible();
  });
});
