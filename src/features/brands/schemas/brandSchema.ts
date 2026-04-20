import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).default(''),
  logoUrl: z
    .string()
    .url('Must be a valid URL')
    .max(1000)
    .nullable()
    .or(z.literal(''))
    .transform((v) => (v === '' ? null : v))
    .default(null),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
