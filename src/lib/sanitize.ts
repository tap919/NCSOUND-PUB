const SENSITIVE_KEYWORDS = ['key', 'secret', 'token', 'password', 'authorization', 'bearer', 'stripe'];

export function sanitizeError(err: unknown): string {
  if (!err) return 'An unexpected error occurred';
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (SENSITIVE_KEYWORDS.some(s => lower.includes(s))) return 'Internal configuration error';
  return message.substring(0, 300);
}
