import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';
import type {
  Brand,
  BrandListParams,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '../types/brand.types';

export const brandService = {
  getList: ({ deletedState, ...params }: BrandListParams) =>
    apiClient.get<PaginatedResponse<Brand>>('/admin/brands', {
      params: cleanParams({
        ...params,
        ...toSoftDeleteQuery(deletedState),
      }),
    }),

  getById: (id: EntityId) =>
    apiClient.get<Brand>(`/admin/brands/${id}`),

  create: (body: CreateBrandRequest) =>
    apiClient.post<Brand>('/admin/brands', body),

  update: (id: EntityId, body: UpdateBrandRequest) =>
    apiClient.patch<Brand>(`/admin/brands/${id}`, body),

  remove: (id: EntityId) =>
    apiClient.delete(`/admin/brands/${id}`),
};
