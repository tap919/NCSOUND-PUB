import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from '../SEO';

describe('SEO', () => {
  it('renders title with site suffix', () => {
    render(
      <HelmetProvider>
        <SEO title="Test Page" description="Test description" />
      </HelmetProvider>,
    );
    const helmet = document.querySelector('title');
    expect(helmet?.textContent).toContain('Test Page');
  });
});
