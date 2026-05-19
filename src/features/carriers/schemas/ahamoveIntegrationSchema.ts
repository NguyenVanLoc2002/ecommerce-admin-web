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

const optionalCoordinate = (label: string, min: number, max: number) =>
  z
    .string()
    .nullish()
    .transform((value) => value?.trim() || null)
    .refine((value) => value === null || !Number.isNaN(Number(value)), `${label} must be a number`)
    .refine((value) => {
      if (value === null) {
        return true;
      }

      const numericValue = Number(value);
      return numericValue >= min && numericValue <= max;
    }, `${label} must be between ${min} and ${max}`);

export const ahamoveIntegrationSchema = z
  .object({
    apiKey: optionalSecret,
    secretKey: optionalSecret,
    webhookSecret: optionalSecret,
    baseUrl: optionalUrl,
    enabled: z.boolean(),
    phone: optionalText(50),
    brandName: optionalText(200),
    pickupAddress: optionalText(500),
    pickupShortAddress: optionalText(255),
    pickupName: optionalText(200),
    pickupPhone: optionalText(50),
    pickupLat: optionalCoordinate('Pickup latitude', -90, 90),
    pickupLng: optionalCoordinate('Pickup longitude', -180, 180),
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
  });

export type AhamoveIntegrationFormValues = z.infer<typeof ahamoveIntegrationSchema>;
