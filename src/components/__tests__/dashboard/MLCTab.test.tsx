import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MLCTab from '../../admin/dashboard/MLCTab';

describe('MLCTab', () => {
  it('renders export DISCO CSV link', () => {
    render(<MLCTab />);
    expect(screen.getByText(/Export DISCO CSV/)).toBeVisible();
  });

  it('renders Deduplication Engine section', () => {
    render(<MLCTab />);
    expect(screen.getByText('Deduplication Engine')).toBeVisible();
    expect(screen.getByText(/MLC Search API Connected/)).toBeVisible();
  });

  it('renders Awaiting CWR Export section', () => {
    render(<MLCTab />);
    expect(screen.getByText('Awaiting CWR Export')).toBeVisible();
    expect(screen.getByText(/works/)).toBeVisible();
  });

  it('renders Registry Injection Queue table', () => {
    render(<MLCTab />);
    expect(screen.getByText('Registry Injection Queue')).toBeVisible();
    expect(screen.getByText('Work Title')).toBeVisible();
    expect(screen.getByText('STREET ANTHEM VOL 1')).toBeVisible();
  });

  it('renders Review buttons for queue items', () => {
    render(<MLCTab />);
    const reviewButtons = screen.getAllByText('Review');
    expect(reviewButtons.length).toBeGreaterThanOrEqual(1);
  });
});
