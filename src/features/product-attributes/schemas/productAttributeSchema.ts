import { z } from 'zod';
import { ProductAttributeType } from '../types/productAttribute.types';

const attributeValueSchema = z.object({
  id: z.string().optional(),
  value: z
    .string()
    .trim()
    .min(1, 'Value is required')
    .max(100, 'Value must be 100 characters or fewer'),
  displayValue: z
    .string()
    .trim()
    .max(100, 'Display value must be 100 characters or fewer')
    .optional(),
});

export const productAttributeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(100, 'Name must be 100 characters or fewer'),
    code: z
      .string()
      .trim()
      .min(1, 'Code is required')
      .max(50, 'Code must be 50 characters or fewer'),
    type: z.nativeEnum(ProductAttributeType, {
      errorMap: () => ({ message: 'Type is required' }),
    }),
    values: z.array(attributeValueSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const seen = new Map<string, number>();

    data.values.forEach((entry, index) => {
      const normalized = entry.value.trim().toUpperCase();
      if (!normalized) {
        return;
      }

      const duplicateIndex = seen.get(normalized);
      if (duplicateIndex !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate values are not allowed',
          path: ['values', index, 'value'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate values are not allowed',
          path: ['values', duplicateIndex, 'value'],
        });
        return;
      }

      seen.set(normalized, index);
    });
  });

export type ProductAttributeFormValues = z.infer<typeof productAttributeSchema>;
