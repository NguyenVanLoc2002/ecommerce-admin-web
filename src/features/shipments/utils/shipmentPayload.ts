import type { CreateShipmentFormValues } from '../schemas/createShipmentSchema';
import type { CreateShipmentRequest, UpdateShipmentRequest } from '../types/shipment.types';

function parseShippingFee(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return Number(value);
}

export function mapShipmentFormToCreateRequest(
  values: CreateShipmentFormValues,
): CreateShipmentRequest {
  return {
    orderId: values.orderId,
    useManualCarrier: values.carrierMode === 'manual',
    carrierId: values.carrierMode === 'configured' ? values.carrierId : null,
    carrier: values.carrierMode === 'manual' ? values.carrier : null,
    trackingNumber: values.trackingNumber ?? null,
    estimatedDeliveryDate: values.estimatedDeliveryDate ?? null,
    shippingFee: parseShippingFee(values.shippingFee),
    estimatedCarrierCost: parseShippingFee(values.estimatedCarrierCost),
    overrideReasonCode: values.overrideReasonCode ?? null,
    overrideNote: values.overrideNote ?? null,
    note: values.notes ?? null,
  };
}

export function mapShipmentFormToUpdateRequest(
  values: CreateShipmentFormValues,
): UpdateShipmentRequest {
  return {
    carrierId: values.carrierMode === 'configured' ? values.carrierId : null,
    carrier: values.carrierMode === 'manual' ? values.carrier : null,
    trackingNumber: values.trackingNumber ?? null,
    estimatedDeliveryDate: values.estimatedDeliveryDate ?? null,
    shippingFee: parseShippingFee(values.shippingFee),
    carrierCost: parseShippingFee(values.carrierCost),
    estimatedCarrierCost: parseShippingFee(values.estimatedCarrierCost),
    note: values.notes ?? null,
  };
}
