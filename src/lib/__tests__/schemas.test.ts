import { describe, it, expect } from 'vitest';
import { emailSchema, geminiSchema, agentChatSchema, checkoutSchema, licenseCheckoutSchema, validate } from '../schemas';

describe('emailSchema', () => {
  it('validates correct email submission', () => {
    const r = emailSchema.safeParse({ to: 'test@example.com', subject: 'Hello', html: '<p>Body</p>' });
    expect(r.success).toBe(true);
  });

  it('accepts array of recipients', () => {
    const r = emailSchema.safeParse({ to: ['a@x.com', 'b@x.com'], subject: 'Hi', html: 'Body' });
    expect(r.success).toBe(true);
  });

  it('rejects missing subject', () => {
    const r = emailSchema.safeParse({ to: 'test@x.com', html: 'Body' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const r = emailSchema.safeParse({ to: 'not-an-email', subject: 'Hi', html: 'Body' });
    expect(r.success).toBe(false);
  });

  it('rejects extra unknown fields', () => {
    const r = emailSchema.safeParse({ to: 'a@x.com', subject: 'Hi', html: 'Body', extra: 'field' });
    expect(r.success).toBe(false);
  });

  it('accepts optional fields (from, cc, bcc)', () => {
    const r = emailSchema.safeParse({ to: 'a@x.com', subject: 'Hi', html: 'Body', from: 'b@x.com', cc: 'c@x.com' });
    expect(r.success).toBe(true);
  });
});

describe('geminiSchema', () => {
  it('validates correct prompt', () => {
    const r = geminiSchema.safeParse({ prompt: 'Hello' });
    expect(r.success).toBe(true);
  });

  it('rejects empty prompt', () => {
    const r = geminiSchema.safeParse({ prompt: '' });
    expect(r.success).toBe(false);
  });

  it('rejects missing prompt', () => {
    const r = geminiSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it('rejects extra fields', () => {
    const r = geminiSchema.safeParse({ prompt: 'Hi', extra: true });
    expect(r.success).toBe(false);
  });
});

describe('agentChatSchema', () => {
  it('validates correct chat', () => {
    const r = agentChatSchema.safeParse({ messages: [{ role: 'user', content: 'hello' }] });
    expect(r.success).toBe(true);
  });

  it('rejects empty messages', () => {
    const r = agentChatSchema.safeParse({ messages: [] });
    expect(r.success).toBe(false);
  });

  it('rejects missing messages', () => {
    const r = agentChatSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it('accepts optional context', () => {
    const r = agentChatSchema.safeParse({ messages: [{ role: 'user', content: 'hi' }], context: { foo: 'bar' } });
    expect(r.success).toBe(true);
  });
});

describe('checkoutSchema', () => {
  it('validates correct checkout', () => {
    const r = checkoutSchema.safeParse({ beatId: '1', title: 'Track', priceStr: '9.99' });
    expect(r.success).toBe(true);
  });

  it('rejects missing fields', () => {
    const r = checkoutSchema.safeParse({ beatId: '1' });
    expect(r.success).toBe(false);
  });
});

describe('licenseCheckoutSchema', () => {
  it('validates correct license checkout', () => {
    const r = licenseCheckoutSchema.safeParse({ trackId: '1', licenseType: 'sync', price: '50', buyerEmail: 'a@x.com' });
    expect(r.success).toBe(true);
  });

  it('rejects invalid license type', () => {
    const r = licenseCheckoutSchema.safeParse({ trackId: '1', licenseType: 'invalid', price: '50', buyerEmail: 'a@x.com' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const r = licenseCheckoutSchema.safeParse({ trackId: '1', licenseType: 'lease', price: '50', buyerEmail: 'bad' });
    expect(r.success).toBe(false);
  });
});

describe('validate helper', () => {
  it('returns valid true for correct data', () => {
    const r = validate(emailSchema, { to: 'a@x.com', subject: 'S', html: 'B' });
    expect(r.valid).toBe(true);
    expect(r.data).toBeDefined();
  });

  it('returns valid false with error message', () => {
    const r = validate(emailSchema, { to: 'bad' });
    expect(r.valid).toBe(false);
    expect(r.error).toBeTruthy();
  });
});
