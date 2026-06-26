import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ValidationTab from '../../admin/dashboard/ValidationTab';

describe('ValidationTab', () => {
  it('renders queue heading', () => {
    render(<ValidationTab />);
    expect(screen.getByText('New Submissions Queue')).toBeVisible();
  });

  it('renders failed validation track', () => {
    render(<ValidationTab />);
    expect(screen.getByText('THE TAKEOVER')).toBeVisible();
    expect(screen.getByText(/Verification Failed/)).toBeVisible();
    expect(screen.getByText('Missing IPI for Co-writer')).toBeVisible();
    expect(screen.getByText('Ping Artist for Revision')).toBeVisible();
  });

  it('renders passed validation track', () => {
    render(<ValidationTab />);
    expect(screen.getByText('LATE NIGHT DRIVE')).toBeVisible();
    expect(screen.getByText(/Ready for Registry/)).toBeVisible();
    expect(screen.getByText('Send to Queues')).toBeVisible();
  });
});
