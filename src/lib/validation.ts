export function missingFields(body: Record<string, unknown>, fields: string[]): string | null {
  for (const f of fields) {
    if (body === undefined || body === null || body[f] === undefined || body[f] === null || body[f] === '') return `${f} is required`;
  }
  return null;
}

const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)/i,
  /forget\s+(all|previous)/i,
  /system\s+prompt/i,
  /you\s+are\s+(an?\s+)?(ai|assistant)/i,
].map(p => new RegExp(p.source, 'i'));

const MAX_PROMPT_LENGTH = 4000;

export function sanitizePrompt(input: string): string | null {
  if (typeof input !== 'string' || input.length === 0) return null;
  if (input.length > MAX_PROMPT_LENGTH) return `Prompt exceeds ${MAX_PROMPT_LENGTH} characters`;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) return 'Prompt contains disallowed instructions';
  }
  return null;
}

export function sanitizeMessages(messages: { content: string; role?: string }[]): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return 'messages array required';
  for (const m of messages) {
    if (typeof m.content === 'string') {
      const err = sanitizePrompt(m.content);
      if (err) return err;
    }
  }
  return null;
}
