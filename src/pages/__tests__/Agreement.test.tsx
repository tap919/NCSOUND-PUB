import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

vi.mock('../../components/SEO', () => ({
  SEO: ({ title }: { title: string }) => <title>{title}</title>,
}));

import Agreement from '../../pages/Agreement';

function renderAgreement() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Agreement />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('Agreement Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders contract title', () => {
    renderAgreement();
    expect(screen.getByText('NON-EXCLUSIVE ADMINISTRATION CONTRACT')).toBeVisible();
  });

  it('renders Grant of Rights section', () => {
    renderAgreement();
    expect(screen.getByText(/Grant of Rights/)).toBeVisible();
  });

  it('renders Compensation and Splits section', () => {
    renderAgreement();
    expect(screen.getByText(/Compensation & Splits/)).toBeVisible();
  });

  it('checkbox starts unchecked and sign button starts disabled', () => {
    renderAgreement();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    const signButton = screen.getByRole('button', { name: 'Sign & Lock In' });
    expect(signButton).toBeDisabled();
  });

  it('sign button enables when checkbox is checked', async () => {
    renderAgreement();
    const checkbox = screen.getByRole('checkbox');
    const user = userEvent.setup();
    await user.click(checkbox);
    const signButton = screen.getByRole('button', { name: 'Sign & Lock In' });
    expect(signButton).not.toBeDisabled();
  });
});
