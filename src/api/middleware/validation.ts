export interface ValidationRule<T> {
  field: keyof T;
  message: string;
  validator: (value: T[keyof T], payload: T) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export function validatePayload<T extends Record<string, unknown>>(
  payload: T,
  rules: Array<ValidationRule<T>>
): ValidationResult {
  const errors: Record<string, string[]> = {};
  for (const rule of rules) {
    const fieldValue = payload[rule.field];
    const isValid = rule.validator(fieldValue, payload);
    if (!isValid) {
      const key = String(rule.field);
      errors[key] = errors[key] ?? [];
      errors[key].push(rule.message);
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function requireFields<T extends Record<string, unknown>>(
  fields: Array<keyof T>
): Array<ValidationRule<T>> {
  return fields.map((field) => ({
    field,
    message: 'Field is required',
    validator: (value) => value !== undefined && value !== null && value !== ''
  }));
}
