import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sanitizeError } from '../../src/lib/sanitize';

describe('sanitizeError', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('null/undefined input', () => {
    it('returns default message for null', () => {
      expect(sanitizeError(null)).toBe('An unexpected error occurred');
    });

    it('returns default message for undefined', () => {
      expect(sanitizeError(undefined)).toBe('An unexpected error occurred');
    });

    it('returns empty string for empty string', () => {
      // sanitizeError treats empty string as a (zero-length) message, not as nullish.
      expect(sanitizeError('')).toBe('');
    });
  });

  describe('plain Error objects', () => {
    it('returns the message for a normal Error', () => {
      expect(sanitizeError(new Error('boom'))).toBe('boom');
    });

    it('coerces non-Error values to strings', () => {
      expect(sanitizeError('something went wrong')).toBe('something went wrong');
      expect(sanitizeError(42)).toBe('42');
      expect(sanitizeError({ code: 'X' })).toBe('[object Object]');
    });
  });

  describe('sensitive pattern detection', () => {
    it.each([
      ['Stripe live key', 'failed to use sk_live_abcdef123'],
      ['Stripe test key', 'key=sk_test_1234567890'],
      ['Stripe publishable live', 'got pk_live_xyz'],
      ['Stripe publishable test', 'pk_test_abc'],
      ['JWT token', 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0'],
      ['api_key assignment', 'api_key: abc123def'],
      ['password assignment', 'password=hunter2'],
      ['authorization header', 'authorization: Bearer xyz'],
      ['bearer token', 'bearer: secret-token'],
    ])('redacts %s', (_label, message) => {
      expect(sanitizeError(new Error(message))).toBe('Internal configuration error');
    });

    it('does not redact ordinary error messages', () => {
      expect(sanitizeError(new Error('Track not found'))).toBe('Track not found');
      expect(sanitizeError(new Error('Database not configured'))).toBe('Database not configured');
    });
  });

  describe('length truncation', () => {
    it('truncates messages over 500 characters', () => {
      const longMsg = 'a'.repeat(800);
      const result = sanitizeError(new Error(longMsg));
      expect(result.length).toBe(500);
      expect(result).toBe('a'.repeat(500));
    });

    it('counts emoji as single grapheme clusters when truncating', () => {
      // 600 emoji = 600 graphemes in `[...message]` spread; slice(0, 500) keeps 500.
      // In UTF-16 code units that's 500 * 2 = 1000 (each emoji is a surrogate pair).
      const emoji = '🎵'.repeat(600);
      const result = sanitizeError(new Error(emoji));
      // The function caps at 500 grapheme clusters.
      expect([...result].length).toBe(500);
    });
  });
});