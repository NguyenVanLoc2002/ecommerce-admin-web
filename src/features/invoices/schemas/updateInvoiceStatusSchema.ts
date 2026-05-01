import { z } from 'zod';
import type { InvoiceStatus } from '@/shared/types/enums';

export const INVOICE_STATUS_VALUES = ['ISSUED', 'PAID', 'VOIDED'] as const satisfies readonly InvoiceStatus[];

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(INVOICE_STATUS_VALUES, {
    required_error: 'Status is required',
  }),
  notes: z
    .string()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional()
    .transform((value) => value?.trim() || undefined),
});

export type UpdateInvoiceStatusFormValues = z.infer<typeof updateInvoiceStatusSchema>;
