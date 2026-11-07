import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SoftDeleteState } from '@/shared/types/api.types';
import { categoryService } from '../services/categoryService';

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

describe('categoryService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
    getMock.mockResolvedValue({ items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });
  });

  it('requests deleted categories with isDeleted=true', async () => {
    await categoryService.getList({
      page: 0,
      size: 20,
      sort: 'name,asc',
      deletedState: SoftDeleteState.DELETED,
    });

    expect(getMock).toHaveBeenCalledWith('/admin/categories', {
      params: {
        page: 0,
        size: 20,
        sort: 'name,asc',
        isDeleted: true,
      },
    });
  });

  it('uses the documented category CRUD endpoints', async () => {
    const createBody = {
      parentId: null,
      name: 'Verification category',
      slug: 'verification-category',
      description: 'Created for catalog verification.',
      imageUrl: null,
      sortOrder: 10,
    };
    const updateBody = {
      name: 'Updated verification category',
      status: 'INACTIVE' as const,
    };

    await categoryService.create(createBody);
    await categoryService.update('category-1', updateBody);
    await categoryService.remove('category-1');

    expect(postMock).toHaveBeenCalledWith('/admin/categories', createBody);
    expect(patchMock).toHaveBeenCalledWith('/admin/categories/category-1', updateBody);
    expect(deleteMock).toHaveBeenCalledWith('/admin/categories/category-1');
  });
});
