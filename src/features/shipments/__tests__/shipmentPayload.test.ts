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
      carrierId: null,
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      shippingFee: null,
      notes: 'Reuse checkout carrier',
    });

    expect(payload).toEqual({
      orderId: 'order-1',
      carrierId: null,
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      shippingFee: null,
      note: 'Reuse checkout carrier',
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
      notes: null,
    });

    expect(payload).toEqual({
      carrierId: null,
      carrier: 'Viettel Post',
      trackingNumber: 'VT123',
      estimatedDeliveryDate: '2026-05-20',
      shippingFee: 45000,
      note: null,
    });
  });
});
