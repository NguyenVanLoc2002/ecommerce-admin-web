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

export const carrierConfigSchema = z.object({
  apiKey: optionalSecret,
  secretKey: optionalSecret,
  webhookSecret: optionalSecret,
  baseUrl: optionalText(500),
  enabled: z.boolean(),
  configJson: z
    .string()
    .nullish()
    .transform((value) => value?.trim() || null)
    .refine((value) => {
      if (!value) {
        return true;
      }

      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }, 'Config JSON must be valid JSON'),
});

export type CarrierConfigFormValues = z.infer<typeof carrierConfigSchema>;
