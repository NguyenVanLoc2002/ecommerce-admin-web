import { z } from 'zod';

const attributeEntrySchema = z.object({
  key: z.string().min(1, 'Attribute name is required'),
  value: z.string().min(1, 'Attribute value is required'),
});

export const variantSchema = z
  .object({
    sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be 100 characters or less'),
    name: z
      .string()
      .min(1, 'Variant name is required')
      .max(255, 'Name must be 255 characters or less'),
    price: z.coerce
      .number({ invalid_type_error: 'Price is required' })
      .positive('Price must be greater than 0'),
    salePrice: z.coerce.number().positive().nullable().optional(),
    weight: z.coerce.number().positive().nullable().optional(),
    dimensions: z.string().max(100).nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    attributes: z.array(attributeEntrySchema).default([]),
  })
  .refine(
    (data) => data.salePrice == null || data.salePrice <= data.price,
    { message: 'Sale price must not exceed regular price', path: ['salePrice'] },
  );

export type VariantFormValues = z.infer<typeof variantSchema>;
