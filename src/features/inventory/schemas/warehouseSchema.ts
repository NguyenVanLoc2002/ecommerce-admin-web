import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  address: z.string().max(500).default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
