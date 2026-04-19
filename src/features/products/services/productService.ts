import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { ProductStatus } from '@/shared/types/enums';
import type {
  Product,
  ProductListParams,
  CreateProductRequest,
  UpdateProductRequest,
} from '../types/product.types';

export const productService = {
  getList: (params: ProductListParams) =>
    apiClient.get<PaginatedResponse<Product>>('/admin/products', { params }),

  getById: (id: number) =>
    apiClient.get<Product>(`/admin/products/${id}`),

  create: (body: CreateProductRequest) =>
    apiClient.post<Product>('/admin/products', body),

  update: (id: number, body: UpdateProductRequest) =>
    apiClient.patch<Product>(`/admin/products/${id}`, body),

  updateStatus: (id: number, status: ProductStatus) =>
    apiClient.patch<Product>(`/admin/products/${id}`, { status }),

  remove: (id: number) =>
    apiClient.delete<void>(`/admin/products/${id}`),
};
