import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
