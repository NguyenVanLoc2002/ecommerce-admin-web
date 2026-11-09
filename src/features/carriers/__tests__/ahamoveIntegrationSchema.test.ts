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
      defaultServiceCode: 'BIKE',
      defaultPaymentMethod: null,
    });
  });

  it('requires a shipment service default before enabling AhaMove', () => {
    const result = ahamoveIntegrationSchema.safeParse({
      apiKey: null,
      secretKey: null,
      webhookSecret: null,
      baseUrl: 'https://partner-apistg.ahamove.com',
      enabled: true,
      phone: '84338710667',
      brandName: null,
      pickupWarehouseId: '018f58a9-f458-7e7f-9c74-0073f99b6ed5',
      defaultServiceCode: null,
      defaultPaymentMethod: null,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.defaultServiceCode).toContain(
      'Default service code is required when config is enabled',
    );
  });
});
