import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';
import type { VariantAttributeDefinition } from '../types/product.types';

export const attributeCatalogService = {
  async getVariantAttributes(): Promise<VariantAttributeDefinition[]> {
    const response = await apiClient.get<PaginatedResponse<VariantAttributeDefinition>>(
      '/admin/product-attributes',
      {
        params: {
          type: 'VARIANT',
          page: 0,
          size: 100,
          sort: 'name,asc',
          ...toSoftDeleteQuery(),
        },
      },
    );

    return response.items;
  },
};
