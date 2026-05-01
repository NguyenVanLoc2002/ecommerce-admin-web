import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';
import type {
  CreateProductAttributeRequest,
  ProductAttribute,
  ProductAttributeListParams,
  UpdateProductAttributeRequest,
} from '../types/productAttribute.types';

export const productAttributeService = {
  getList: ({ deletedState, ...params }: ProductAttributeListParams) =>
    apiClient.get<PaginatedResponse<ProductAttribute>>('/admin/product-attributes', {
      params: cleanParams({
        ...params,
        ...toSoftDeleteQuery(deletedState),
      }),
    }),

  getById: (id: EntityId) =>
    apiClient.get<ProductAttribute>(`/admin/product-attributes/${id}`),

  create: (body: CreateProductAttributeRequest) =>
    apiClient.post<ProductAttribute>('/admin/product-attributes', body),

  update: (id: EntityId, body: UpdateProductAttributeRequest) =>
    apiClient.put<ProductAttribute>(`/admin/product-attributes/${id}`, body),

  remove: (id: EntityId) =>
    apiClient.delete<void>(`/admin/product-attributes/${id}`),
};
