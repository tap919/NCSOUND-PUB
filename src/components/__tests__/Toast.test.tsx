import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ToastContainer, toast } from '../Toast';

describe('ToastContainer', () => {
  it('renders without error', () => {
    const { container } = render(<ToastContainer />);
    expect(container).toBeTruthy();
  });
});

describe('toast', () => {
  it('is a function', () => {
    expect(typeof toast).toBe('function');
  });
});
