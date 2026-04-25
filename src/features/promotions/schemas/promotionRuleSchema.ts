import { z } from 'zod';

export const promotionRuleSchema = z.object({
  ruleType: z.enum(
    [
      'MIN_ORDER_AMOUNT',
      'SPECIFIC_PRODUCTS',
      'SPECIFIC_CATEGORIES',
      'SPECIFIC_BRANDS',
      'FIRST_ORDER',
    ],
    { required_error: 'Rule type is required' },
  ),
  ruleValue: z.string().min(1, 'Rule value is required'),
  description: z.string().optional(),
});

export type PromotionRuleFormValues = z.infer<typeof promotionRuleSchema>;
