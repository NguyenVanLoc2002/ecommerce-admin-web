import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50).regex(/^[A-Za-z0-9_-]+$/, 'Code may only contain letters, digits, _ and -'),
  location: z.string().max(255).optional().default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
