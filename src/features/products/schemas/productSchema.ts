import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  brandId: z.number().nullable().optional(),
  categoryIds: z.array(z.number()).default([]),
  shortDescription: z
    .string()
    .max(300, 'Short description must be 300 characters or less')
    .default(''),
  description: z.string().default(''),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featured: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productSchema>;
