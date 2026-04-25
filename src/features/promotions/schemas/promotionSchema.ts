import { z } from 'zod';

const optionalPositiveNumber = (min: number) =>
  z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(min).optional(),
  );

export const promotionSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or fewer'),
    description: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
      required_error: 'Discount type is required',
    }),
    discountValue: z.preprocess(
      (v) => (v === '' || v == null ? undefined : Number(v)),
      z.number({ required_error: 'Discount value is required' }).min(0.01, 'Must be at least 0.01'),
    ),
    maxDiscountAmount: optionalPositiveNumber(0.01),
    minimumOrderAmount: optionalPositiveNumber(0),
    scope: z.enum(['ALL', 'CATEGORY', 'BRAND', 'PRODUCT'], {
      required_error: 'Scope is required',
    }),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    usageLimit: optionalPositiveNumber(1),
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
    if (
      data.discountType === 'PERCENTAGE' &&
      data.discountValue !== undefined &&
      data.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount cannot exceed 100',
        path: ['discountValue'],
      });
    }
  });

export type PromotionFormValues = z.infer<typeof promotionSchema>;
