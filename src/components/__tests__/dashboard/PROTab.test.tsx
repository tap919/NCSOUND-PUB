import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PROTab from '../../admin/dashboard/PROTab';

describe('PROTab', () => {
  it('renders Active Link badge', () => {
    render(<PROTab />);
    expect(screen.getByText('Active Link')).toBeVisible();
  });

  it('renders TuneRegistry API Active heading', () => {
    render(<PROTab />);
    expect(screen.getByText('TuneRegistry API Active')).toBeVisible();
  });

  it('renders description text', () => {
    render(<PROTab />);
    expect(screen.getByText(/ASCAP & BMI/)).toBeVisible();
  });

  it('renders API payload mock', () => {
    render(<PROTab />);
    expect(screen.getByText(/NEON NIGHTS/)).toBeVisible();
    expect(screen.getByText(/NcSound Publishing/)).toBeVisible();
  });
});
