import { z } from 'zod';

const nullableTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}, z.string().nullable());

const nullableInteger = z.preprocess((value) => {
  if (value == null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : Number(trimmed);
  }
  return value;
}, z
  .number({ invalid_type_error: 'Sort order must be a number' })
  .int('Sort order must be a whole number')
  .nullable());

export const categorySchema = z.object({
  parentId: nullableTrimmedString.default(null),
  name: z.string().trim().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().trim().default(''),
  imageUrl: nullableTrimmedString.default(null),
  sortOrder: nullableInteger.default(null),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
