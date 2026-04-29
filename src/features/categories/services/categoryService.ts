import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import type {
  Category,
  CategoryListParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

export const categoryService = {
  getList: (params: CategoryListParams) =>
    apiClient.get<PaginatedResponse<Category>>('/admin/categories', { params }),

  getById: (id: EntityId) =>
    apiClient.get<Category>(`/categories/${id}`),

  create: (body: CreateCategoryRequest) =>
    apiClient.post<Category>('/admin/categories', body),

  update: (id: EntityId, body: UpdateCategoryRequest) =>
    apiClient.patch<Category>(`/admin/categories/${id}`, body),

  remove: (id: EntityId) =>
    apiClient.delete(`/admin/categories/${id}`),
};
