import { z } from 'zod';

export const adjustStockSchema = z.object({
  warehouseId: z.coerce
    .number({ required_error: 'Warehouse is required' })
    .positive('Select a warehouse'),
  variantId: z.coerce
    .number({ required_error: 'Variant is required' })
    .positive('Variant ID is required'),
  quantity: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, 'Quantity must not be zero'),
  reason: z.enum(['DAMAGE', 'RETURN', 'CORRECTION', 'OTHER']),
  note: z.string().max(500).default(''),
});

export type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;
