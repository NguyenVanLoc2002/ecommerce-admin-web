import { describe, expect, it } from 'vitest';
import { cancelShipmentProviderSchema } from '../schemas/cancelShipmentProviderSchema';

describe('cancelShipmentProviderSchema', () => {
  it('requires a cancellation reason before submitting the provider cancel action', () => {
    const result = cancelShipmentProviderSchema.safeParse({ reason: '   ' });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.reason).toContain('Cancellation reason is required');
  });
});
