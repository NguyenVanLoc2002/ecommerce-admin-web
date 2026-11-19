import { describe, expect, it } from 'vitest';
import {
  mapShipmentFormToCreateRequest,
  mapShipmentFormToUpdateRequest,
} from '../utils/shipmentPayload';

describe('shipmentPayload', () => {
  it('creates a snapshot-reuse payload without explicit carrier fields', () => {
    const payload = mapShipmentFormToCreateRequest({
      orderId: 'order-1',
      carrierMode: 'orderSnapshot',
      checkoutCarrierId: 'carrier-1',
      carrierId: null,
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      shippingFee: null,
      estimatedCarrierCost: null,
      carrierCost: null,
      overrideNote: null,
      notes: 'Reuse checkout carrier',
    });

    expect(payload).toEqual({
      orderId: 'order-1',
      useManualCarrier: false,
      carrierId: null,
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      shippingFee: null,
      estimatedCarrierCost: null,
      note: 'Reuse checkout carrier',
      overrideReasonCode: null,
      overrideNote: null,
    });
  });

  it('keeps manual carrier text and parses the optional shipping fee', () => {
    const payload = mapShipmentFormToUpdateRequest({
      orderId: 'order-1',
      carrierMode: 'manual',
      carrierId: null,
      carrier: 'Viettel Post',
      trackingNumber: 'VT123',
      estimatedDeliveryDate: '2026-05-20',
      shippingFee: '45000',
      estimatedCarrierCost: null,
      carrierCost: null,
      overrideNote: null,
      notes: null,
    });

    expect(payload).toEqual({
      carrierId: null,
      carrier: 'Viettel Post',
      trackingNumber: 'VT123',
      estimatedDeliveryDate: '2026-05-20',
      shippingFee: 45000,
      estimatedCarrierCost: null,
      carrierCost: null,
      note: null,
    });
  });

  it('marks manual fulfillment explicitly so checkout carrier fallback is bypassed', () => {
    const payload = mapShipmentFormToCreateRequest({
      orderId: 'order-2',
      carrierMode: 'manual',
      checkoutCarrierId: 'checkout-carrier',
      carrierId: null,
      carrier: 'Local courier',
      trackingNumber: null,
      estimatedDeliveryDate: null,
      shippingFee: null,
      estimatedCarrierCost: null,
      carrierCost: null,
      overrideReasonCode: 'CUSTOMER_REQUEST',
      overrideNote: null,
      notes: null,
    });

    expect(payload.useManualCarrier).toBe(true);
    expect(payload.overrideReasonCode).toBe('CUSTOMER_REQUEST');
  });
});
