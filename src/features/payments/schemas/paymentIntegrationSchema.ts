import { z } from '@/shared/lib/zod';

const optionalSecret = z.string().nullish().transform((value) => value?.trim() ?? '');

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Must be at most ${max} characters`)
    .nullish()
    .transform((value) => value?.trim() ?? '');

const optionalUrl = z
  .string()
  .max(500, 'Must be at most 500 characters')
  .nullish()
  .transform((value) => value?.trim() ?? '')
  .refine((value) => {
    if (value === '') {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, 'Must be a valid URL');

const optionalPositiveInteger = (label: string) =>
  z
    .string()
    .nullish()
    .transform((value) => value?.trim() ?? '')
    .refine((value) => value === '' || /^\d+$/.test(value), `${label} must be a whole number`)
    .refine((value) => value === '' || Number(value) > 0, `${label} must be greater than 0`);

const optionalPositiveDecimal = (label: string) =>
  z
    .string()
    .nullish()
    .transform((value) => value?.trim() ?? '')
    .refine((value) => value === '' || !Number.isNaN(Number(value)), `${label} must be a number`)
    .refine((value) => value === '' || Number(value) > 0, `${label} must be greater than 0`);

export const momoPaymentIntegrationSchema = z.object({
  enabled: z.boolean(),
  environment: optionalText(100),
  partnerCode: optionalSecret,
  clearPartnerCode: z.boolean(),
  accessKey: optionalSecret,
  clearAccessKey: z.boolean(),
  secretKey: optionalSecret,
  clearSecretKey: z.boolean(),
  createUrl: optionalUrl,
  redirectUrl: optionalUrl,
  ipnUrl: optionalUrl,
  requestType: optionalText(100),
  lang: optionalText(20),
  connectTimeoutMs: optionalPositiveInteger('Connect timeout'),
  readTimeoutMs: optionalPositiveInteger('Read timeout'),
});

export type MomoPaymentIntegrationFormValues = z.infer<typeof momoPaymentIntegrationSchema>;

export const paypalPaymentIntegrationSchema = z.object({
  enabled: z.boolean(),
  environment: optionalText(100),
  clientId: optionalSecret,
  clearClientId: z.boolean(),
  clientSecret: optionalSecret,
  clearClientSecret: z.boolean(),
  baseUrl: optionalUrl,
  returnUrl: optionalUrl,
  cancelUrl: optionalUrl,
  webhookId: optionalText(255),
  currency: optionalText(20),
  brandName: optionalText(127),
  locale: optionalText(20),
  userAction: optionalText(100),
  paymentMethodPreference: optionalText(100),
  shippingPreference: optionalText(100),
  testConversionEnabled: z.boolean(),
  testConversionRateVndToUsd: optionalPositiveDecimal('Test conversion rate'),
  connectTimeoutMs: optionalPositiveInteger('Connect timeout'),
  readTimeoutMs: optionalPositiveInteger('Read timeout'),
});

export type PaypalPaymentIntegrationFormValues = z.infer<typeof paypalPaymentIntegrationSchema>;
