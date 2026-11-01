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
    expect(getOrderItemImage(order.items[0])).toBe('http://localhost:3000/uploads/products/cotton-tee.jpg');
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
