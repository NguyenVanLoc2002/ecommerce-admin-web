import { z } from 'zod';

export const adjustStockSchema = z.object({
  warehouseId: z.string().min(1, 'Select a warehouse'),
  variantId: z.string().min(1, 'Select a variant'),
  quantity: z.coerce
    .number()
    .int()
    .min(1, 'Quantity must be at least 1'),
  movementType: z.enum(['EXPORT', 'ADJUSTMENT', 'RETURN']),
  note: z.string().max(500).default(''),
});

export type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;
