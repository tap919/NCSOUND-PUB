const SENSITIVE_PATTERNS = [
  /sk_live_/i,
  /sk_test_/i,
  /pk_live_/i,
  /pk_test_/i,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /\b(?:api_key|apikey|secret|password|token|bearer|authorization)\s*[:=]\s*\S+/i,
];

const MAX_ERROR_LENGTH = 500;

export function sanitizeError(err: unknown): string {
  if (err == null) return 'An unexpected error occurred';
  const message = err instanceof Error ? err.message : String(err);
  if (SENSITIVE_PATTERNS.some(p => p.test(message))) return 'Internal configuration error';
  return [...message].slice(0, MAX_ERROR_LENGTH).join('');
}
