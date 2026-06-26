import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecordsTab from '../../admin/dashboard/RecordsTab';

describe('RecordsTab', () => {
  it('renders Label Roster heading', () => {
    render(<RecordsTab />);
    expect(screen.getByText(/Label Roster/)).toBeVisible();
  });

  it('renders Add Artist button', () => {
    render(<RecordsTab />);
    expect(screen.getByText('Add Artist')).toBeVisible();
  });

  it('renders artist entries', () => {
    render(<RecordsTab />);
    expect(screen.getByText('Raleigh Phantoms')).toBeVisible();
    expect(screen.getByText('Sarah Jenkins')).toBeVisible();
  });

  it('renders release counts', () => {
    render(<RecordsTab />);
    const releases = screen.getAllByText('4');
    expect(releases.length).toBeGreaterThanOrEqual(1);
  });

  it('renders unrecouped amounts', () => {
    render(<RecordsTab />);
    const amounts = screen.getAllByText('$1,250');
    expect(amounts.length).toBe(2);
  });
});
