import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../components/SEO', () => ({ SEO: ({ title }: { title: string }) => <title>{title}</title> }));

import ProGuide from '../ProGuide';

function renderProGuide() {
  return render(
    <MemoryRouter>
      <ProGuide />
    </MemoryRouter>
  );
}

describe('Artist Pro Guide', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders PRO guide heading', () => {
    renderProGuide();
    expect(screen.getByText('PRO Registration Guide')).toBeVisible();
  });

  it('renders steps and sections', () => {
    renderProGuide();
    expect(screen.getByText('What is a PRO?')).toBeVisible();
    expect(screen.getByText('Major PROs')).toBeVisible();
    expect(screen.getByText('How to Register')).toBeVisible();
    expect(screen.getByText('Next Steps')).toBeVisible();
  });
});
