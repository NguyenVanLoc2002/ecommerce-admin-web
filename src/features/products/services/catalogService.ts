import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { CategoryOption, BrandOption } from '../types/product.types';

export const catalogService = {
  getCategories: async (): Promise<CategoryOption[]> => {
    const response = await apiClient.get<PaginatedResponse<CategoryOption>>('/admin/categories', {
      params: { page: 0, size: 200, sort: 'name,asc' },
    });
    return response.items;
  },

  getBrands: async (): Promise<BrandOption[]> => {
    const response = await apiClient.get<PaginatedResponse<BrandOption>>('/admin/brands', {
      params: { page: 0, size: 200, sort: 'name,asc' },
    });
    return response.items;
  },
};
