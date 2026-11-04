import { z } from 'zod';

const nullableTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}, z.string().nullable());

export const brandSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().trim().default(''),
  logoUrl: nullableTrimmedString.default(null),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
