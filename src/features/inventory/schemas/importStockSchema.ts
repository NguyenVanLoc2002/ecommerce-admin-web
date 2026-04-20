import { z } from 'zod';

export const importStockSchema = z.object({
  warehouseId: z.coerce
    .number({ required_error: 'Warehouse is required' })
    .positive('Select a warehouse'),
  variantId: z.coerce
    .number({ required_error: 'Variant is required' })
    .positive('Variant ID is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  note: z.string().max(500).default(''),
});

export type ImportStockFormValues = z.infer<typeof importStockSchema>;
