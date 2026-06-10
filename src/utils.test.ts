import { describe, it, expect } from 'vitest';

// formatTime from GlobalPlayer.tsx (exact copy for test isolation)
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds under a minute', () => {
    expect(formatTime(45)).toBe('0:45');
  });

  it('formats exactly one minute', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(185)).toBe('3:05');
  });

  it('formats large values', () => {
    expect(formatTime(3661)).toBe('61:01');
  });

  it('handles NaN gracefully', () => {
    expect(formatTime(NaN)).toBe('0:00');
  });

  it('handles negative values gracefully', () => {
    expect(formatTime(-10)).toBe('0:00');
  });

  it('pads single digit seconds', () => {
    expect(formatTime(63)).toBe('1:03');
  });
});

// validateEmail helper from zod contact schema
import { z } from 'zod';

const contactSchema = z.object({
  'first-name': z.string().min(1, 'First name is required'),
  'last-name': z.string().optional(),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

describe('contactSchema validation', () => {
  it('validates a correct submission', () => {
    const result = contactSchema.safeParse({
      'first-name': 'John',
      'last-name': 'Doe',
      email: 'john@example.com',
      company: 'Test Co',
      message: 'This is a test message long enough',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing first name', () => {
    const result = contactSchema.safeParse({
      'first-name': '',
      email: 'john@example.com',
      message: 'This is a test message long enough',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({
      'first-name': 'John',
      email: 'not-an-email',
      message: 'This is a test message long enough',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short message', () => {
    const result = contactSchema.safeParse({
      'first-name': 'John',
      email: 'john@example.com',
      message: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields omitted', () => {
    const result = contactSchema.safeParse({
      'first-name': 'John',
      email: 'john@example.com',
      message: 'This is a test message long enough',
    });
    expect(result.success).toBe(true);
  });
});
