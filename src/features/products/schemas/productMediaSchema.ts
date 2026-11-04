import { z } from 'zod';

export const productMediaSchema = z.object({
  mediaUrl: z.string().trim().url('Enter a valid URL.').max(500),
  mediaType: z.enum(['IMAGE', 'VIDEO']),
  sortOrder: z.coerce.number().int().min(0, 'Sort order cannot be negative.'),
  primary: z.boolean(),
  variantId: z.string(),
}).superRefine((values, context) => {
  if (values.primary && values.mediaType !== 'IMAGE') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['primary'],
      message: 'Only image media can be primary.',
    });
  }
});

export type ProductMediaFormValues = z.infer<typeof productMediaSchema>;
