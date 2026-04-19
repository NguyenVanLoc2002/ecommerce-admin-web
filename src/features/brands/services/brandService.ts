import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  Brand,
  BrandListParams,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '../types/brand.types';

export const brandService = {
  getList: (params: BrandListParams) =>
    apiClient.get<PaginatedResponse<Brand>>('/admin/brands', { params }),

  getById: (id: number) =>
    apiClient.get<Brand>(`/admin/brands/${id}`),

  create: (body: CreateBrandRequest) =>
    apiClient.post<Brand>('/admin/brands', body),

  update: (id: number, body: UpdateBrandRequest) =>
    apiClient.patch<Brand>(`/admin/brands/${id}`, body),

  remove: (id: number) =>
    apiClient.delete(`/admin/brands/${id}`),
};
