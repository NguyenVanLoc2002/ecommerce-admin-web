import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SoftDeleteState } from '@/shared/types/api.types';
import { warehouseService } from '../services/warehouseService';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
  },
}));

describe('warehouseService.getList', () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue([]);
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
});
