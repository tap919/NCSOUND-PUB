import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton, CardSkeleton, ErrorFallback, EmptyState } from '../ui';

describe('LoadingSkeleton', () => {
  it('renders with default lines', () => {
    const { container } = render(<LoadingSkeleton />);
    const wrapper = container.querySelector('.animate-pulse');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.children.length).toBe(4);
  });
});

describe('CardSkeleton', () => {
  it('renders', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('ErrorFallback', () => {
  it('renders message', () => {
    render(<ErrorFallback message="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Custom Title" description="Custom description" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });
});
