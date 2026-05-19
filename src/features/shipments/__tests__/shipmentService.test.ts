import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shipmentService } from '../services/shipmentService';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
  },
}));

describe('shipmentService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  it('passes carrierId filters to the shipment list endpoint', async () => {
    getMock.mockResolvedValue({ items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });

    await shipmentService.getList({
      page: 0,
      size: 20,
      sort: 'createdAt,desc',
      orderCode: ' ORD-1 ',
      carrierId: 'carrier-123',
    });

    expect(getMock).toHaveBeenCalledWith('/admin/shipments', {
      params: {
        page: 0,
        size: 20,
        sort: 'createdAt,desc',
        orderCode: 'ORD-1',
        carrierId: 'carrier-123',
      },
    });
  });

  it('normalizes carrier metadata from shipment responses', async () => {
    postMock.mockResolvedValue({
      id: 'shipment-1',
      orderId: 'order-1',
      orderCode: 'ORD-1',
      shipmentCode: 'SHP-1',
      customer: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0912345678',
      },
      shippingAddress: {
        fullName: 'Jane Doe',
        phone: '0912345678',
        street: '1 Nguyen Hue',
        ward: 'Ben Nghe',
        district: 'District 1',
        province: 'HCM',
      },
      carrierId: 'carrier-123',
      carrier: 'GHN HCM',
      carrierCode: 'GHN_MAIN',
      carrierProviderType: 'GHN',
      carrierShipmentId: 'GHN-0001',
      providerStatus: 'READY_TO_PICK',
      providerTrackingUrl: 'https://tracking.example.com/GHN-0001',
      trackingNumber: null,
      status: 'PENDING',
      estimatedDeliveryDate: null,
      shippedAt: null,
      deliveredAt: null,
      shippingFee: 25000,
      note: null,
      events: [
        {
          id: 'event-1',
          status: 'PENDING',
          description: 'Shipment created',
          eventTime: '2026-05-15T10:00:00Z',
          createdBy: 'admin@example.com',
        },
      ],
      createdAt: '2026-05-15T10:00:00Z',
      updatedAt: '2026-05-15T10:00:00Z',
    });

    const shipment = await shipmentService.create({
      orderId: 'order-1',
      carrierId: 'carrier-123',
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      note: null,
    });

    expect(shipment.carrierId).toBe('carrier-123');
    expect(shipment.carrierCode).toBe('GHN_MAIN');
    expect(shipment.carrierProviderType).toBe('GHN');
    expect(shipment.carrierShipmentId).toBe('GHN-0001');
    expect(shipment.providerStatus).toBe('READY_TO_PICK');
    expect(shipment.providerTrackingUrl).toBe('https://tracking.example.com/GHN-0001');
    expect(shipment.shippingFee).toBe(25000);
    expect(shipment.events).toHaveLength(1);
  });

  it('calls the provider sync endpoint', async () => {
    postMock.mockResolvedValue({
      id: 'shipment-1',
      orderId: 'order-1',
      orderCode: 'ORD-1',
      shipmentCode: 'SHP-1',
      customer: { fullName: 'Jane', email: 'jane@example.com', phone: '0912345678' },
      shippingAddress: {
        fullName: 'Jane',
        phone: '0912345678',
        street: '1 Nguyen Hue',
        ward: 'Ben Nghe',
        district: 'District 1',
        province: 'HCM',
      },
      carrierId: 'carrier-123',
      carrier: 'GHN HCM',
      carrierCode: 'GHN_MAIN',
      carrierProviderType: 'GHN',
      carrierShipmentId: 'GHN-0001',
      providerStatus: 'PICKING',
      providerTrackingUrl: null,
      trackingNumber: 'TRACK-1',
      status: 'PICKING',
      estimatedDeliveryDate: null,
      shippedAt: null,
      deliveredAt: null,
      shippingFee: null,
      note: null,
      events: [],
      createdAt: '2026-05-15T10:00:00Z',
      updatedAt: '2026-05-15T10:00:00Z',
    });

    await shipmentService.syncProvider('shipment-1');

    expect(postMock).toHaveBeenCalledWith('/admin/shipments/shipment-1/provider/sync');
  });

  it('submits the provider cancel reason to the backend', async () => {
    postMock.mockResolvedValue({
      id: 'shipment-1',
      orderId: 'order-1',
      orderCode: 'ORD-1',
      shipmentCode: 'SHP-1',
      customer: { fullName: 'Jane', email: 'jane@example.com', phone: '0912345678' },
      shippingAddress: {
        fullName: 'Jane',
        phone: '0912345678',
        street: '1 Nguyen Hue',
        ward: 'Ben Nghe',
        district: 'District 1',
        province: 'HCM',
      },
      carrierId: 'carrier-123',
      carrier: 'GHN HCM',
      carrierCode: 'GHN_MAIN',
      carrierProviderType: 'GHN',
      carrierShipmentId: 'GHN-0001',
      providerStatus: 'CANCELLED',
      providerTrackingUrl: null,
      trackingNumber: 'TRACK-1',
      status: 'FAILED',
      estimatedDeliveryDate: null,
      shippedAt: null,
      deliveredAt: null,
      shippingFee: null,
      note: null,
      events: [],
      createdAt: '2026-05-15T10:00:00Z',
      updatedAt: '2026-05-15T10:00:00Z',
    });

    await shipmentService.cancelProvider('shipment-1', {
      reason: 'Operator requested cancellation',
    });

    expect(postMock).toHaveBeenCalledWith('/admin/shipments/shipment-1/provider/cancel', {
      reason: 'Operator requested cancellation',
    });
  });
});
