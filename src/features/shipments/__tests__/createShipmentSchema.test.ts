import { describe, expect, it } from 'vitest';
import { createShipmentSchema } from '../schemas/createShipmentSchema';

describe('createShipmentSchema', () => {
  it('accepts the order snapshot reuse flow without explicit carrier fields', () => {
    const result = createShipmentSchema.safeParse({
      orderId: 'order-1',
      carrierMode: 'orderSnapshot',
      carrierId: null,
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      shippingFee: null,
      notes: 'Reuse checkout carrier',
    });

    expect(result.success).toBe(true);
  });

  it('requires carrierId in configured-carrier mode', () => {
    const result = createShipmentSchema.safeParse({
      orderId: 'order-1',
      carrierMode: 'configured',
      carrierId: null,
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      shippingFee: null,
      notes: null,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.carrierId).toContain('Carrier selection is required');
  });

  it('requires manual carrier text in manual mode', () => {
    const result = createShipmentSchema.safeParse({
      orderId: 'order-1',
      carrierMode: 'manual',
      carrierId: null,
      carrier: '   ',
      trackingNumber: null,
      estimatedDeliveryDate: null,
      shippingFee: null,
      notes: null,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.carrier).toContain('Carrier name is required');
  });

  it('accepts a configured carrier without a manual carrier name', () => {
    const result = createShipmentSchema.safeParse({
      orderId: 'order-1',
      carrierMode: 'configured',
      carrierId: 'carrier-1',
      carrier: '',
      trackingNumber: '',
      estimatedDeliveryDate: '',
      shippingFee: '25000',
      notes: '',
    });

    expect(result.success).toBe(true);
  });
});
