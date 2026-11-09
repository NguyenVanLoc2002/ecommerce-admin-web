import { z } from '@/shared/lib/zod';

const optionalSecret = z
  .string()
  .nullish()
  .transform((value) => value?.trim() || null);

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Must be at most ${max} characters`)
    .nullish()
    .transform((value) => value?.trim() || null);

const optionalUrl = z
  .string()
  .max(500, 'Must be at most 500 characters')
  .nullish()
  .transform((value) => value?.trim() || null)
  .refine((value) => {
    if (!value) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, 'Base URL must be a valid URL');

export const ahamoveIntegrationSchema = z
  .object({
    apiKey: optionalSecret,
    secretKey: optionalSecret,
    webhookSecret: optionalSecret,
    baseUrl: optionalUrl,
    enabled: z.boolean(),
    phone: optionalText(50),
    brandName: optionalText(200),
    pickupWarehouseId: z.string().uuid('Select a valid pickup warehouse').nullish().transform((value) => value ?? null),
    defaultServiceCode: optionalText(100),
    defaultPaymentMethod: optionalText(50),
  })
  .superRefine((value, ctx) => {
    if (value.enabled && !value.baseUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['baseUrl'],
        message: 'Base URL is required when config is enabled',
      });
    }

    if (value.enabled && !value.defaultServiceCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['defaultServiceCode'],
        message: 'Default service code is required when config is enabled',
      });
    }
  });

export type AhamoveIntegrationFormValues = z.infer<typeof ahamoveIntegrationSchema>;
