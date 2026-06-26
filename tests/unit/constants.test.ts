import { describe, it, expect } from 'vitest';
import { SPLIT } from '../../src/lib/constants';

describe('SPLIT constant', () => {
  it('exports ARTIST and NCSOUND keys', () => {
    expect(SPLIT).toHaveProperty('ARTIST');
    expect(SPLIT).toHaveProperty('NCSOUND');
  });

  it('uses a default publisher share of 20%', () => {
    expect(SPLIT.NCSOUND).toBeCloseTo(0.20, 5);
    expect(SPLIT.ARTIST).toBeCloseTo(0.80, 5);
  });

  it('ARTIST + NCSOUND always equal 1', () => {
    expect(SPLIT.ARTIST + SPLIT.NCSOUND).toBeCloseTo(1, 10);
  });

  it('both shares are non-negative', () => {
    expect(SPLIT.ARTIST).toBeGreaterThanOrEqual(0);
    expect(SPLIT.NCSOUND).toBeGreaterThanOrEqual(0);
  });

  it('both shares are <= 1', () => {
    expect(SPLIT.ARTIST).toBeLessThanOrEqual(1);
    expect(SPLIT.NCSOUND).toBeLessThanOrEqual(1);
  });
});