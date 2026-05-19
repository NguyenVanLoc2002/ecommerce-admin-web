import { z, zodRequiredString } from '@/shared/lib/zod';

export const cancelShipmentProviderSchema = z.object({
  reason: zodRequiredString('Cancellation reason').max(500, 'Reason must be at most 500 characters'),
});

export type CancelShipmentProviderFormValues = z.infer<typeof cancelShipmentProviderSchema>;
