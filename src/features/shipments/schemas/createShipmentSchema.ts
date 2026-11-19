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
  }, 'Amount must be 0 or greater');

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
  estimatedCarrierCost: optionalMoneyInput,
  carrierCost: optionalMoneyInput,
  checkoutCarrierId: z.string().nullable().optional(),
  checkoutCarrierName: z.string().nullable().optional(),
  overrideReasonCode: z.enum([
    'CHECKOUT_CARRIER_UNAVAILABLE',
    'CUSTOMER_REQUEST',
    'SERVICE_ISSUE',
    'COST_CHANGE',
    'OTHER',
  ]).nullable().optional(),
  overrideNote: z.string().max(500, 'Override note must be at most 500 characters')
    .nullable().optional().transform((v) => v?.trim() || null),
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

  const hasCheckoutCarrier = Boolean(values.checkoutCarrierId || values.checkoutCarrierName?.trim());
  const requestedCarrierId = values.carrierMode === 'orderSnapshot'
    ? values.checkoutCarrierId
    : values.carrierMode === 'configured' ? values.carrierId : null;
  const isOverride = hasCheckoutCarrier && values.carrierMode !== 'orderSnapshot'
    && (values.carrierMode === 'configured'
      ? requestedCarrierId !== values.checkoutCarrierId
      : Boolean(values.checkoutCarrierId)
        || (values.carrier?.trim() !== values.checkoutCarrierName?.trim()));
  if (isOverride && !values.overrideReasonCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Select a reason for changing the checkout carrier',
      path: ['overrideReasonCode'],
    });
  }
  if (isOverride && values.overrideReasonCode === 'OTHER' && !values.overrideNote) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Add a note when selecting Other',
      path: ['overrideNote'],
    });
  }
});

export type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;
