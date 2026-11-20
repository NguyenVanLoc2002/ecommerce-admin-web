import type { OrderPaymentStatus, OrderStatus, PaymentMethod } from '@/shared/types/enums';

export interface OrderShipmentEligibilityInput {
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderPaymentStatus | null;
}

export function getOrderShipmentEligibilityMessage(
  order: OrderShipmentEligibilityInput,
): string | null {
  if (order.status !== 'PROCESSING') {
    return `Shipment creation requires an order in Processing. This order is ${order.status.toLowerCase().replace(/_/g, ' ')}.`;
  }

  if (order.paymentMethod === 'ONLINE' && order.paymentStatus !== 'PAID') {
    return 'Online payment must be paid before this order can be shipped.';
  }

  return null;
}

export function isOrderShipmentEligible(order: OrderShipmentEligibilityInput): boolean {
  return getOrderShipmentEligibilityMessage(order) === null;
}
