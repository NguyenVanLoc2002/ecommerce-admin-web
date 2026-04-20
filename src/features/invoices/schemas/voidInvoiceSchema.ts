import { z } from 'zod';

export const voidInvoiceSchema = z.object({
  note: z.string().trim().min(1, 'Void reason is required').max(500, 'Maximum 500 characters'),
});

export type VoidInvoiceFormValues = z.infer<typeof voidInvoiceSchema>;
