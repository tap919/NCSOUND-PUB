import { z } from 'zod';

export const emailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(998),
  html: z.string().min(1),
  from: z.string().email().optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
}).strict();

export const geminiSchema = z.object({
  prompt: z.string().min(1).max(4000),
}).strict();

export const agentChatSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).min(1),
  context: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const checkoutSchema = z.object({
  beatId: z.string().min(1),
  title: z.string().min(1),
  priceStr: z.string().min(1),
}).strict();

export const licenseCheckoutSchema = z.object({
  trackId: z.string().min(1),
  licenseType: z.union([z.literal('lease'), z.literal('buyout'), z.literal('sync')]),
  price: z.string().min(1),
  buyerEmail: z.string().email(),
  title: z.string().optional(),
}).strict();

export function validate(schema: z.ZodSchema, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join('; ');
    return { valid: false, error: message };
  }
  return { valid: true, data: result.data };
}
