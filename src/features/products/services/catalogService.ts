import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { CategoryOption, BrandOption } from '../types/product.types';

export const catalogService = {
  getCategories: () =>
    apiClient.get<PaginatedResponse<CategoryOption>>('/categories', {
      params: { page: 0, size: 200, sort: 'name,asc' },
    }),

  getBrands: () =>
    apiClient.get<PaginatedResponse<BrandOption>>('/brands', {
      params: { page: 0, size: 200, sort: 'name,asc' },
    }),
};
