import { describe, expect, it } from 'vitest';
import { ahamoveIntegrationSchema } from '../schemas/ahamoveIntegrationSchema';

describe('ahamoveIntegrationSchema', () => {
  it('accepts null defaults from the form state and trims populated fields', () => {
    const result = ahamoveIntegrationSchema.parse({
      apiKey: null,
      secretKey: null,
      webhookSecret: null,
      baseUrl: ' https://partner-apistg.ahamove.com ',
      enabled: true,
      phone: ' 84338710667 ',
      brandName: null,
      pickupWarehouseId: '018f58a9-f458-7e7f-9c74-0073f99b6ed5',
      pickupAddress: null,
      pickupShortAddress: null,
      pickupName: null,
      pickupPhone: null,
      pickupLat: null,
      pickupLng: null,
      defaultServiceCode: ' BIKE ',
      defaultPaymentMethod: null,
    });

    expect(result).toEqual({
      apiKey: null,
      secretKey: null,
      webhookSecret: null,
      baseUrl: 'https://partner-apistg.ahamove.com',
      enabled: true,
      phone: '84338710667',
      brandName: null,
      pickupWarehouseId: '018f58a9-f458-7e7f-9c74-0073f99b6ed5',
      pickupAddress: null,
      pickupShortAddress: null,
      pickupName: null,
      pickupPhone: null,
      pickupLat: null,
      pickupLng: null,
      defaultServiceCode: 'BIKE',
      defaultPaymentMethod: null,
    });
  });
});
