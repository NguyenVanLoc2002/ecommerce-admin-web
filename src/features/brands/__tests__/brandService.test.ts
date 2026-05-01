import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SoftDeleteState } from '@/shared/types/api.types';
import { brandService } from '../services/brandService';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
  },
}));

describe('brandService.getList', () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({ items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });
  });

  it('requests active brands by default', async () => {
    await brandService.getList({
      page: 0,
      size: 20,
      sort: 'name,asc',
      deletedState: SoftDeleteState.ACTIVE,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/brands', {
      params: {
        page: 0,
        size: 20,
        sort: 'name,asc',
      },
    });
  });

  it('requests deleted brands with isDeleted=true', async () => {
    await brandService.getList({
      page: 0,
      size: 20,
      sort: 'name,asc',
      deletedState: SoftDeleteState.DELETED,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/brands', {
      params: {
        page: 0,
        size: 20,
        sort: 'name,asc',
        isDeleted: true,
      },
    });
  });

  it('requests all brands with includeDeleted=true', async () => {
    await brandService.getList({
      page: 0,
      size: 20,
      sort: 'name,asc',
      deletedState: SoftDeleteState.ALL,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/brands', {
      params: {
        page: 0,
        size: 20,
        sort: 'name,asc',
        includeDeleted: true,
      },
    });
  });
});
