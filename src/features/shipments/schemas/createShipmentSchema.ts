import { z } from 'zod';

export const createShipmentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  carrier: z
    .string()
    .max(100, 'Carrier name must be at most 100 characters')
    .optional()
    .transform((v) => v?.trim() || null),
  trackingNumber: z
    .string()
    .max(100, 'Tracking code must be at most 100 characters')
    .optional()
    .transform((v) => v?.trim() || null),
  estimatedDeliveryDate: z
    .string()
    .optional()
    .transform((v) => v || null),
  notes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
    .transform((v) => v?.trim() || null),
});

export type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;
