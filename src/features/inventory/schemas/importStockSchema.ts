import { z } from 'zod';

export const importStockSchema = z.object({
  warehouseId: z.string().min(1, 'Select a warehouse'),
  variantId: z.string().min(1, 'Select a variant'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  note: z.string().max(500).default(''),
});

export type ImportStockFormValues = z.infer<typeof importStockSchema>;
