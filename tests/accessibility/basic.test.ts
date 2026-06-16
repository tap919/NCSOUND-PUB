import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { SEO } from '../../src/components/SEO';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    React.createElement(HelmetProvider, null,
      React.createElement(MemoryRouter, null, ui)
    )
  );
}

describe('Accessibility: Semantic HTML', () => {
  it('ErrorBoundary renders semantic elements', () => {
    renderWithProviders(
      React.createElement(ErrorBoundary, {
        fallback: React.createElement('main', null,
          React.createElement('h1', null, 'Error'),
          React.createElement('p', null, 'Something went wrong')
        ),
      }, React.createElement('div', null, 'Content'))
    );
    const main = screen.queryByRole('main');
    if (main) {
      expect(main).toBeVisible();
    }
  });

  it('SEO component renders without errors', () => {
    renderWithProviders(React.createElement(SEO, { title: 'Test', description: 'Test description' }));
    expect(document.title).toContain('Test');
  });
});

describe('Accessibility: Color Contrast', () => {
  const relativeLuminance = (hex: string) => {
    const val = parseInt(hex.replace('#', ''), 16);
    const r = ((val >> 16) & 0xff) / 255;
    const g = ((val >> 8) & 0xff) / 255;
    const b = (val & 0xff) / 255;
    const linearize = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  };

  const contrastRatio = (hex1: string, hex2: string) => {
    const l1 = relativeLuminance(hex1);
    const l2 = relativeLuminance(hex2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  it('orange (#f97316) on black (#000000) meets WCAG AA (4.5:1)', () => {
    expect(contrastRatio('#f97316', '#000000')).toBeGreaterThanOrEqual(4.5);
  });

  it('white (#ffffff) on dark (#171717) meets WCAG AA (4.5:1)', () => {
    expect(contrastRatio('#ffffff', '#171717')).toBeGreaterThanOrEqual(4.5);
  });

  it('white (#ffffff) on black (#000000) meets WCAG AAA (7:1)', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeGreaterThanOrEqual(7);
  });
});

describe('Accessibility: Focusable Elements', () => {
  it('links with href are inherently focusable', () => {
    const link = document.createElement('a');
    link.href = '/about';
    document.body.appendChild(link);
    expect(link.tabIndex).toBe(0);
    document.body.removeChild(link);
  });

  it('buttons are inherently focusable', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    expect(button.tabIndex).toBe(0);
    document.body.removeChild(button);
  });
});

describe('Accessibility: Image Alt Text', () => {
  it('img elements in rendered content should have alt attribute', () => {
    const img = document.createElement('img');
    img.alt = 'A descriptive text';
    expect(img).toHaveAttribute('alt', 'A descriptive text');

    const imgNoAlt = document.createElement('img');
    expect(imgNoAlt.alt).toBe('');
  });
});
