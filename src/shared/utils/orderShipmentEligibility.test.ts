import { describe, expect, it } from 'vitest';
import { getOrderShipmentEligibilityMessage, isOrderShipmentEligible } from './orderShipmentEligibility';

describe('order shipment eligibility', () => {
  it('allows COD orders in PROCESSING while payment is pending', () => {
    expect(isOrderShipmentEligible({ status: 'PROCESSING', paymentMethod: 'COD', paymentStatus: 'PENDING' })).toBe(true);
  });

  it('requires online payment before shipment creation', () => {
    const message = getOrderShipmentEligibilityMessage({
      status: 'PROCESSING',
      paymentMethod: 'ONLINE',
      paymentStatus: 'PENDING',
    });

    expect(message).toContain('Online payment must be paid');
  });

  it('allows paid online orders in PROCESSING', () => {
    expect(isOrderShipmentEligible({ status: 'PROCESSING', paymentMethod: 'ONLINE', paymentStatus: 'PAID' })).toBe(true);
  });

  it('requires the order to be PROCESSING', () => {
    const message = getOrderShipmentEligibilityMessage({
      status: 'CONFIRMED',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
    });

    expect(message).toContain('requires an order in Processing');
  });
});
