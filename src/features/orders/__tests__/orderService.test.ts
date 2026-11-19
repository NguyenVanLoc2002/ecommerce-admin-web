import { beforeEach, describe, expect, it, vi } from 'vitest';
import { orderService } from '../services/orderService';
import type { OrderItem } from '../types/order.types';
import { getOrderItemImage } from '../utils/orderItemImage';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
    post: vi.fn(),
  },
}));

function orderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'item-1',
    variantId: 'variant-1',
    productName: 'Cotton Tee',
    variantName: 'Brown / M',
    sku: 'FS-0108-M',
    unitPrice: 100000,
    quantity: 1,
    lineTotal: 100000,
    discountAmount: 0,
    ...overrides,
  };
}

describe('orderService', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('normalizes productImageUrl from order detail items', async () => {
    getMock.mockResolvedValue({
      id: 'order-1',
      orderCode: 'FS-0001',
      customerId: 'customer-1',
      customerNameSnapshot: 'Lan Nguyen',
      customerEmailSnapshot: 'lan@example.com',
      customerSnapshotAvailable: true,
      currentCustomerName: 'Current Name',
      currentCustomerEmail: 'current@example.com',
      currentCustomerProfileAvailable: true,
      status: 'PENDING',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      receiverName: 'Lan Nguyen',
      receiverPhone: '0900000000',
      shippingStreet: '1 Main',
      shippingWard: 'Ward 1',
      shippingDistrict: 'District 1',
      shippingCity: 'HCMC',
      subTotal: 100000,
      discountAmount: 0,
      shippingFee: 15000,
      totalAmount: 115000,
      items: [
        {
          id: 'item-1',
          variantId: 'variant-1',
          productName: 'Cotton Tee',
          variantName: 'Brown / M',
          sku: 'FS-0108-M',
          unitPrice: 100000,
          quantity: 1,
          lineTotal: 100000,
          discountAmount: 0,
          productImageUrl: '/uploads/products/cotton-tee.jpg',
        },
      ],
      createdAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-05-01T00:00:00Z',
    });

    const order = await orderService.getById('order-1');

    expect(getMock).toHaveBeenCalledWith('/admin/orders/order-1');
    expect(order.items[0].productImageUrl).toBe('/uploads/products/cotton-tee.jpg');
    expect(order.customerNameSnapshot).toBe('Lan Nguyen');
    expect(order.customerEmailSnapshot).toBe('lan@example.com');
    expect(order.customerSnapshotAvailable).toBe(true);
    expect(order.currentCustomerName).toBe('Current Name');
    expect(order.currentCustomerEmail).toBe('current@example.com');
    expect(order.currentCustomerProfileAvailable).toBe(true);
    expect(getOrderItemImage(order.items[0])).toBe('http://localhost:3000/uploads/products/cotton-tee.jpg');
  });

  it('keeps legacy snapshot absence distinct from current profile data in the admin list', async () => {
    getMock.mockResolvedValue({
      items: [{
        id: 'order-legacy',
        orderCode: 'FS-OLD',
        customerId: 'customer-1',
        customerNameSnapshot: null,
        customerEmailSnapshot: null,
        customerSnapshotAvailable: false,
        customerName: 'Current Name',
        customerEmail: 'current@example.com',
        currentCustomerProfileAvailable: true,
        status: 'PENDING',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        totalAmount: 10,
        createdAt: '2020-01-01T00:00:00Z',
      }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      last: true,
    });

    const page = await orderService.getList({ page: 0, size: 20 });

    expect(page.items[0].customerSnapshotAvailable).toBe(false);
    expect(page.items[0].customerNameSnapshot).toBeNull();
    expect(page.items[0].customerName).toBe('Current Name');
    expect(page.items[0].currentCustomerProfileAvailable).toBe(true);
  });

  it('serializes server-side search, filters, sort and pagination without blank values', async () => {
    getMock.mockResolvedValue({
      items: [], page: 1, size: 10, totalElements: 0, totalPages: 0, last: true,
    });

    await orderService.getList({
      page: 1,
      size: 10,
      sort: 'createdAt,asc',
      keyword: '  ORD-1  ',
      status: 'PROCESSING',
      paymentStatus: 'FAILED',
      paymentMethod: 'COD',
      shipmentStatus: 'IN_TRANSIT',
      createdFrom: '2026-01-01T00:00',
      createdTo: '2026-01-31T23:59',
    });

    expect(getMock).toHaveBeenCalledWith('/admin/orders', {
      params: {
        page: 1,
        size: 10,
        sort: 'createdAt,asc',
        keyword: 'ORD-1',
        status: 'PROCESSING',
        paymentStatus: 'FAILED',
        paymentMethod: 'COD',
        shipmentStatus: 'IN_TRANSIT',
        createdFrom: new Date('2026-01-01T00:00').toISOString().slice(0, 19),
        createdTo: new Date(new Date('2026-01-31T23:59').getTime() + 59_999).toISOString().slice(0, -1),
      },
    });
  });

  it('loads a persisted cancellation state for reconciliation controls', async () => {
    getMock.mockResolvedValue({
      id: 'operation-1',
      orderId: 'order-1',
      orderCode: 'ORD-1',
      shipmentId: 'shipment-1',
      idempotencyKey: 'cancel-key-1',
      status: 'UNKNOWN',
      orderStatus: 'SHIPPED',
      lastErrorCode: 'PROVIDER_CANCELLATION_OUTCOME_UNKNOWN',
      requestedAt: '2026-05-15T10:00:00Z',
      completedAt: null,
    });

    const operation = await orderService.getCancellation('order-1');

    expect(getMock).toHaveBeenCalledWith('/admin/orders/order-1/cancellation');
    expect(operation?.status).toBe('UNKNOWN');
    expect(operation?.shipmentId).toBe('shipment-1');
    expect(operation?.completedAt).toBeNull();
  });

  it('prefers primary variant media when the order item has no direct image URL', () => {
    const imageUrl = getOrderItemImage(orderItem({
      variantMedias: [
        {
          id: 'variant-secondary',
          mediaUrl: 'https://cdn.example.com/variant-secondary.jpg',
          mediaType: 'IMAGE',
          sortOrder: 0,
          primary: false,
        },
        {
          id: 'variant-primary',
          mediaUrl: 'https://cdn.example.com/variant-primary.jpg',
          mediaType: 'IMAGE',
          sortOrder: 2,
          primary: true,
        },
      ],
      productMedias: [
        {
          id: 'product-primary',
          mediaUrl: 'https://cdn.example.com/product-primary.jpg',
          mediaType: 'IMAGE',
          sortOrder: 0,
          primary: true,
        },
      ],
    }));

    expect(imageUrl).toBe('https://cdn.example.com/variant-primary.jpg');
  });

  it('uses product image media when variant media is unavailable and excludes video media', () => {
    const imageUrl = getOrderItemImage(orderItem({
      variantMedias: [
        {
          id: 'variant-video',
          mediaUrl: 'https://cdn.example.com/variant.mp4',
          mediaType: 'VIDEO',
          sortOrder: 0,
          primary: true,
        },
      ],
      productMedias: [
        {
          id: 'product-secondary',
          mediaUrl: 'https://cdn.example.com/product-secondary.jpg',
          mediaType: 'IMAGE',
          sortOrder: 0,
          primary: false,
        },
        {
          id: 'product-primary',
          mediaUrl: 'https://cdn.example.com/product-primary.jpg',
          mediaType: 'IMAGE',
          sortOrder: 3,
          primary: true,
        },
      ],
    }));

    expect(imageUrl).toBe('https://cdn.example.com/product-primary.jpg');
  });
});
