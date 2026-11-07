import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SoftDeleteState } from '@/shared/types/api.types';
import { brandService } from '../services/brandService';

const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

describe('brandService.getList', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
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

  it('uses the documented brand CRUD endpoints', async () => {
    const createBody = {
      name: 'Verification brand',
      slug: 'verification-brand',
      description: 'Created for catalog verification.',
      logoUrl: null,
    };
    const updateBody = {
      name: 'Updated verification brand',
      status: 'INACTIVE' as const,
    };

    await brandService.create(createBody);
    await brandService.update('brand-1', updateBody);
    await brandService.remove('brand-1');

    expect(postMock).toHaveBeenCalledWith('/admin/brands', createBody);
    expect(patchMock).toHaveBeenCalledWith('/admin/brands/brand-1', updateBody);
    expect(deleteMock).toHaveBeenCalledWith('/admin/brands/brand-1');
  });
});
