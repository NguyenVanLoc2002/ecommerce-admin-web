import { z } from 'zod';

const optionalPositiveInt = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number().int().min(1).optional(),
);

export const voucherSchema = z
  .object({
    code: z
      .string()
      .max(100, 'Code must be 100 characters or fewer')
      .regex(/^[A-Za-z0-9_-]*$/, 'Only letters, numbers, underscores, and hyphens allowed')
      .optional()
      .transform((v) => (v === '' ? null : (v ?? null))),
    promotionId: z.string().min(1, 'Promotion is required'),
    usageLimit: optionalPositiveInt,
    usageLimitPerUser: optionalPositiveInt,
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['endDate'],
      });
    }
  });

export type VoucherFormValues = z.infer<typeof voucherSchema>;
