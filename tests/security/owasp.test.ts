import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { sanitizeError } from '../../src/lib/sanitize';

const contactSchema = z.object({
  'first-name': z.string().min(1, 'First name is required'),
  'last-name': z.string().optional(),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

describe('Security: Input Validation (contactSchema)', () => {
  it('rejects SQL injection in email field', () => {
    const result = contactSchema.safeParse({
      'first-name': 'Test',
      email: "' OR 1=1 --",
      message: 'Valid message here for testing',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('rejects XSS payload in email field', () => {
    const result = contactSchema.safeParse({
      'first-name': 'Test',
      email: '<script>alert("xss")</script>',
      message: 'Valid message here for testing',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty first-name', () => {
    const result = contactSchema.safeParse({
      'first-name': '',
      email: 'test@test.com',
      message: 'Valid message here for testing',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short message', () => {
    const result = contactSchema.safeParse({
      'first-name': 'Test',
      email: 'test@test.com',
      message: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects message exactly at boundary (9 chars)', () => {
    const result = contactSchema.safeParse({
      'first-name': 'Test',
      email: 'test@test.com',
      message: '123456789',
    });
    expect(result.success).toBe(false);
  });

  it('accepts message at minimum length (10 chars)', () => {
    const result = contactSchema.safeParse({
      'first-name': 'Test',
      email: 'test@test.com',
      message: '1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing @ in email', () => {
    const result = contactSchema.safeParse({
      'first-name': 'Test',
      email: 'notanemail',
      message: 'Valid message here for testing',
    });
    expect(result.success).toBe(false);
  });
});

describe('Security: sanitizeError', () => {
  it('redacts messages containing "key"', () => {
    const result = sanitizeError(new Error('API key sk_test_12345'));
    expect(result).toBe('Internal configuration error');
  });

  it('redacts messages containing "secret"', () => {
    const result = sanitizeError(new Error('Missing secret token'));
    expect(result).toBe('Internal configuration error');
  });

  it('redacts messages containing "token"', () => {
    const result = sanitizeError(new Error('Invalid bearer token'));
    expect(result).toBe('Internal configuration error');
  });

  it('redacts messages containing "password"', () => {
    const result = sanitizeError(new Error('Wrong password'));
    expect(result).toBe('Internal configuration error');
  });

  it('redacts messages containing "stripe"', () => {
    const result = sanitizeError(new Error('Stripe key not configured'));
    expect(result).toBe('Internal configuration error');
  });

  it('passes through safe messages', () => {
    const result = sanitizeError(new Error('File too large'));
    expect(result).toBe('File too large');
  });

  it('handles null input', () => {
    const result = sanitizeError(null);
    expect(result).toBe('An unexpected error occurred');
  });

  it('handles undefined input', () => {
    const result = sanitizeError(undefined);
    expect(result).toBe('An unexpected error occurred');
  });

  it('handles non-Error throw values', () => {
    const result = sanitizeError('A string error');
    expect(result).toBe('A string error');
  });

  it('truncates long messages to 300 characters', () => {
    const longMessage = 'x'.repeat(500);
    const result = sanitizeError(new Error(longMessage));
    expect(result.length).toBeLessThanOrEqual(300);
  });
});
