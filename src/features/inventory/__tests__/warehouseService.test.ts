import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SoftDeleteState } from '@/shared/types/api.types';
import { warehouseService } from '../services/warehouseService';

const { getMock, postMock, patchMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
  },
}));

describe('warehouseService.getList', () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue([]);
    postMock.mockReset();
    patchMock.mockReset();
  });

  it('requests active warehouses by default without pagination params', async () => {
    await warehouseService.getList({
      deletedState: SoftDeleteState.ACTIVE,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/warehouses', {
      params: {},
    });
  });

  it('requests filtered warehouses with status and deleted-only params', async () => {
    await warehouseService.getList({
      status: 'INACTIVE',
      deletedState: SoftDeleteState.DELETED,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/warehouses', {
      params: {
        status: 'INACTIVE',
        isDeleted: true,
      },
    });
  });

  it('requests all warehouses with includeDeleted=true', async () => {
    await warehouseService.getList({
      deletedState: SoftDeleteState.ALL,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/warehouses', {
      params: {
        includeDeleted: true,
      },
    });
  });

  it('sends pickup profile fields for warehouse writes', async () => {
    const body = {
      name: 'Main warehouse',
      code: 'MAIN-01',
      pickupAddress: '123 Nguyen Hue',
      pickupShortAddress: 'District 1',
      pickupContactName: 'Warehouse team',
      pickupContactPhone: '0900000000',
      pickupLat: 10.77689,
      pickupLng: 106.70081,
    };

    await warehouseService.create(body);
    await warehouseService.update('warehouse-1', { pickupAddress: body.pickupAddress, pickupLat: body.pickupLat });

    expect(postMock).toHaveBeenCalledWith('/admin/warehouses', body);
    expect(patchMock).toHaveBeenCalledWith('/admin/warehouses/warehouse-1', {
      pickupAddress: '123 Nguyen Hue',
      pickupLat: 10.77689,
    });
  });
});
