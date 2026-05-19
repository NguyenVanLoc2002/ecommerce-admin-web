import { z } from 'zod';

const optionalMoneyInput = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value?.trim() || null)
  .refine((value) => {
    if (value === null) {
      return true;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0;
  }, 'Shipping fee must be 0 or greater');

export const createShipmentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  carrierMode: z.enum(['orderSnapshot', 'configured', 'manual']),
  carrierId: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value?.trim() || null),
  carrier: z
    .string()
    .max(100, 'Carrier name must be at most 100 characters')
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  trackingNumber: z
    .string()
    .max(100, 'Tracking code must be at most 100 characters')
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
  estimatedDeliveryDate: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v || null),
  shippingFee: optionalMoneyInput,
  notes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null),
}).superRefine((values, ctx) => {
  if (values.carrierMode === 'configured' && !values.carrierId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Carrier selection is required',
      path: ['carrierId'],
    });
  }

  if (values.carrierMode === 'manual' && !values.carrier) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Carrier name is required',
      path: ['carrier'],
    });
  }
});

export type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;
