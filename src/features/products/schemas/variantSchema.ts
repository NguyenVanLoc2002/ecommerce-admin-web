import { z } from 'zod';
import { VariantStatus } from '@/shared/types/enums';

const optionalNumber = (label: string, min: number) =>
  z.preprocess(
    (value) => (value === '' || value == null ? null : Number(value)),
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .min(min, `${label} must be ${min} or greater`)
      .nullable(),
  );

export const variantSchema = z
  .object({
    sku: z.string().trim().max(100, 'SKU must be 100 characters or less').default(''),
    autoGenerateSku: z.boolean().default(true),
    barcode: z.string().trim().max(100, 'Barcode must be 100 characters or less').default(''),
    autoGenerateBarcode: z.boolean().default(false),
    variantName: z
      .string()
      .trim()
      .max(255, 'Name must be 255 characters or less'),
    autoGenerateVariantName: z.boolean().default(true),
    basePrice: z.preprocess(
      (value) => (value === '' || value == null ? undefined : Number(value)),
      z
        .number({ required_error: 'Base price is required', invalid_type_error: 'Base price is required' })
        .min(0, 'Base price must be 0 or greater'),
    ),
    salePrice: optionalNumber('Sale price', 0),
    compareAtPrice: optionalNumber('Compare at price', 0),
    weightGram: z.preprocess(
      (value) => (value === '' || value == null ? null : Number(value)),
      z
        .number({ invalid_type_error: 'Weight must be a number' })
        .positive('Weight must be greater than 0')
        .nullable(),
    ),
    status: z.nativeEnum(VariantStatus, {
      errorMap: () => ({ message: 'Status is required' }),
    }),
    attributeValueIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.autoGenerateSku && !data.sku.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SKU is required when auto-generate is disabled',
        path: ['sku'],
      });
    }

    if (!data.autoGenerateVariantName && !data.variantName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Variant name is required when auto-generate is disabled',
        path: ['variantName'],
      });
    }

    if (data.salePrice != null && data.salePrice > data.basePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sale price must be less than or equal to base price',
        path: ['salePrice'],
      });
    }

    if (data.compareAtPrice != null && data.compareAtPrice < data.basePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Compare at price must be greater than or equal to base price',
        path: ['compareAtPrice'],
      });
    }
  });

export type VariantFormValues = z.infer<typeof variantSchema>;
