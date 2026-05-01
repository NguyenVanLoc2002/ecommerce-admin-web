import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inventoryService } from '../services/inventoryService';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
  },
}));

describe('inventoryService.getMovements', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('sends only active movement filters and maps movementType response fields', async () => {
    getMock.mockResolvedValue({
      items: [
        {
          id: 'move-1',
          variantId: 'variant-1',
          variantName: 'Blue / M',
          sku: 'SKU-001',
          warehouseId: 'warehouse-1',
          warehouseName: 'Main Warehouse',
          movementType: 'EXPORT',
          quantity: 3,
          note: 'Damaged stock',
          createdBy: 'admin@example.com',
          createdAt: '2026-05-01T10:00:00Z',
        },
      ],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const response = await inventoryService.getMovements({
      page: 0,
      size: 20,
      sort: 'createdAt,desc',
      warehouseId: 'warehouse-1',
      movementType: 'EXPORT',
    });

    expect(getMock).toHaveBeenCalledWith('/admin/inventories/movements', {
      params: {
        page: 0,
        size: 20,
        sort: 'createdAt,desc',
        warehouseId: 'warehouse-1',
        movementType: 'EXPORT',
      },
    });

    expect(response.items[0]).toMatchObject({
      id: 'move-1',
      variantId: 'variant-1',
      variantName: 'Blue / M',
      sku: 'SKU-001',
      warehouseId: 'warehouse-1',
      warehouseName: 'Main Warehouse',
      movementType: 'EXPORT',
      quantity: 3,
      note: 'Damaged stock',
      createdBy: 'admin@example.com',
      createdAt: '2026-05-01T10:00:00Z',
    });
  });

  it('removes empty movement filters and supports legacy fallback fields', async () => {
    getMock.mockResolvedValue({
      items: [
        {
          id: 'move-2',
          variantId: 'variant-2',
          variantName: '',
          variantSku: 'SKU-LEGACY',
          warehouseId: 'warehouse-2',
          warehouseName: '',
          type: 'IMPORT',
          quantity: '5',
          note: null,
          createdBy: 'system',
          createdAt: '2026-05-01T12:00:00Z',
        },
      ],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const response = await inventoryService.getMovements({
      page: 0,
      size: 20,
      sort: 'createdAt,desc',
      warehouseId: undefined,
      movementType: undefined,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/inventories/movements', {
      params: {
        page: 0,
        size: 20,
        sort: 'createdAt,desc',
      },
    });

    expect(response.items[0]).toMatchObject({
      sku: 'SKU-LEGACY',
      movementType: 'IMPORT',
      quantity: 5,
    });
  });
});

describe('inventoryService.getStock', () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({
      items: [],
      page: 0,
      size: 20,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it('sends the full supported inventory filter set and removes empty params', async () => {
    await inventoryService.getStock({
      page: 0,
      size: 20,
      sort: 'updatedAt,desc',
      variantId: 'variant-1',
      warehouseId: 'warehouse-1',
      productId: 'product-1',
      sku: 'SKU-001',
      keyword: 'blue tee',
      variantStatus: 'ACTIVE',
      outOfStock: true,
      lowStock: true,
      lowStockThreshold: 5,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/inventories', {
      params: {
        page: 0,
        size: 20,
        sort: 'updatedAt,desc',
        variantId: 'variant-1',
        warehouseId: 'warehouse-1',
        productId: 'product-1',
        sku: 'SKU-001',
        keyword: 'blue tee',
        variantStatus: 'ACTIVE',
        outOfStock: true,
        lowStock: true,
        lowStockThreshold: 5,
      },
    });
  });

  it('omits empty inventory filter params', async () => {
    await inventoryService.getStock({
      page: 0,
      size: 20,
      sort: 'updatedAt,desc',
      variantId: undefined,
      warehouseId: '',
      productId: undefined,
      sku: '   ',
      keyword: '',
      variantStatus: undefined,
      outOfStock: undefined,
      lowStock: undefined,
      lowStockThreshold: undefined,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/inventories', {
      params: {
        page: 0,
        size: 20,
        sort: 'updatedAt,desc',
      },
    });
  });
});
