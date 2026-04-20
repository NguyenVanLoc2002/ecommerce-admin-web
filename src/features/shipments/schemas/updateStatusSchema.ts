import { z } from 'zod';
import type { ShipmentStatus } from '@/shared/types/enums';

export const SHIPMENT_STATUS_VALUES = [
  'PENDING',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FAILED',
  'RETURNED',
] as const satisfies readonly ShipmentStatus[];

export const updateStatusSchema = z.object({
  status: z.enum(SHIPMENT_STATUS_VALUES, {
    required_error: 'Status is required',
  }),
  note: z
    .string()
    .max(500, 'Note must be at most 500 characters')
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;
