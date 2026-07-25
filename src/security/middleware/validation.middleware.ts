import DOMPurify from 'dompurify';
import { z, type ZodSchema } from 'zod';

export class ValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super('Validation failed');
  }
}

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, { USE_PROFILES: { html: false } });
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, sanitizeValue(val)]));
  }
  return value;
};

export const validationMiddleware = {
  sanitize<T>(payload: T): T {
    return sanitizeValue(payload) as T;
  },
  validate<T>(schema: ZodSchema<T>, payload: unknown): T {
    const sanitized = sanitizeValue(payload);
    const result = schema.safeParse(sanitized);
    if (!result.success) {
      throw new ValidationError(result.error.errors.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`));
    }
    return result.data;
  },
  createPasswordSchema(minLength = 8) {
    return z
      .string()
      .min(minLength, `Minimum ${minLength} characters`)
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character');
  }
};
