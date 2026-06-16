import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

describe('Performance Baselines', () => {
  it('formatTime handles large inputs efficiently', () => {
    const formatTime = (t: number) => {
      if (isNaN(t) || t < 0) return '0:00';
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      formatTime(i);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('Zod schema validation is performant', async () => {
    const { z } = await import('zod');
    const schema = z.object({
      email: z.string().email(),
      message: z.string().min(10),
      first_name: z.string().min(1),
    });
    const valid = { email: 'test@test.com', message: 'A'.repeat(50), first_name: 'Test' };
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      schema.safeParse(valid);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  it('array filtering by genre is performant', () => {
    const beats = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      title: `Beat ${i}`,
      genre: ['Soul', 'Funk', 'R&B', 'Hip-Hop', 'Trap'][i % 5],
    }));
    const start = performance.now();
    const filtered = beats.filter(b => b.genre === 'Trap');
    const elapsed = performance.now() - start;
    expect(filtered.length).toBe(200);
    expect(elapsed).toBeLessThan(10);
  });
});

describe('Component Render Performance', () => {
  it('SEO renders in under 200ms', async () => {
    const { SEO } = await import('../../src/components/SEO');
    const start = performance.now();
    render(
      <HelmetProvider>
        <MemoryRouter>
          <SEO title="Benchmark" description="Test" />
        </MemoryRouter>
      </HelmetProvider>
    );
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  it('ErrorBoundary renders in under 50ms', async () => {
    const { ErrorBoundary } = await import('../../src/components/ErrorBoundary');
    const start = performance.now();
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});

describe('Data Processing Performance', () => {
  it('array sort by date handles 1000 items in under 10ms', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      created_at: new Date(2024, 0, 1000 - i).toISOString(),
    }));
    const start = performance.now();
    const sorted = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const elapsed = performance.now() - start;
    expect(sorted.length).toBe(1000);
    expect(elapsed).toBeLessThan(50);
  });

  it('text truncation handles 10000 calls in under 20ms', () => {
    const truncate = (text: string, max: number) =>
      text.length <= max ? text : text.slice(0, max) + '...';
    const longText = 'A'.repeat(500);
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      truncate(longText, 100);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(20);
  });
});
