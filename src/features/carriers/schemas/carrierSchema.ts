import { zodRequiredString, z } from '@/shared/lib/zod';
import {
  CARRIER_PROVIDER_TYPE_VALUES,
  CARRIER_STATUS_VALUES,
} from '../types/carrier.types';

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .transform((value) => value?.trim() || null);

export const carrierSchema = z.object({
  code: zodRequiredString('Code').max(50, 'Code must be at most 50 characters'),
  name: zodRequiredString('Name').max(200, 'Name must be at most 200 characters'),
  providerType: z.enum(CARRIER_PROVIDER_TYPE_VALUES, {
    required_error: 'Provider type is required',
  }),
  status: z.enum(CARRIER_STATUS_VALUES, {
    required_error: 'Status is required',
  }),
  logoUrl: optionalText(500),
  description: optionalText(500),
});

export type CarrierFormValues = z.infer<typeof carrierSchema>;
