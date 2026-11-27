import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';

export type ProductBadge = { id: string; code: string; label: string; active: boolean; priority: number; version: number };
export type ProductBadgeInput = Omit<ProductBadge, 'id' | 'version'> & { version?: number };

const path = '/admin/product-badges';

export const productBadgeService = {
  list: (page: number) => apiClient.get<PaginatedResponse<ProductBadge>>(path, { params: { page } }),
  get: (id: string) => apiClient.get<ProductBadge>(path + '/' + id),
  save: (id: string | undefined, body: ProductBadgeInput) =>
    id ? apiClient.put<ProductBadge>(path + '/' + id, body) : apiClient.post<ProductBadge>(path, body),
  products: (id: string, page: number) =>
    apiClient.get<PaginatedResponse<{ id: string; name: string }>>(path + '/' + id + '/products', { params: { page } }),
  assign: (id: string, productId: string) => apiClient.put<void>(path + '/' + id + '/products/' + productId),
  unassign: (id: string, productId: string) => apiClient.delete<void>(path + '/' + id + '/products/' + productId),
};
