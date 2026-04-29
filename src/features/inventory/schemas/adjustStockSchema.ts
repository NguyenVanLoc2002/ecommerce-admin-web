import { z } from 'zod';

export const adjustStockSchema = z.object({
  warehouseId: z.string().min(1, 'Select a warehouse'),
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, 'Quantity must not be zero'),
  movementType: z.enum(['EXPORT', 'ADJUSTMENT', 'RETURN']),
  note: z.string().max(500).default(''),
});

export type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;
