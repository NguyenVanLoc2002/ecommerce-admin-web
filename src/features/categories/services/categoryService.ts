import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  Category,
  CategoryListParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

export const categoryService = {
  getList: (params: CategoryListParams) =>
    apiClient.get<PaginatedResponse<Category>>('/categories', { params }),

  getById: (id: number) =>
    apiClient.get<Category>(`/categories/${id}`),

  create: (body: CreateCategoryRequest) =>
    apiClient.post<Category>('/admin/categories', body),

  update: (id: number, body: UpdateCategoryRequest) =>
    apiClient.patch<Category>(`/admin/categories/${id}`, body),

  remove: (id: number) =>
    apiClient.delete(`/admin/categories/${id}`),
};
