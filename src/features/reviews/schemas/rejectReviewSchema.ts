import { z } from 'zod';

export const rejectReviewSchema = z.object({
  adminNote: z
    .string()
    .min(10, 'Note must be at least 10 characters.')
    .max(500, 'Note must be 500 characters or fewer.'),
});

export type RejectReviewFormValues = z.infer<typeof rejectReviewSchema>;
