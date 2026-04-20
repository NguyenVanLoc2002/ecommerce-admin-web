import { apiClient } from '@/shared/lib/axios';
import type {
  ProductVariant,
  CreateVariantRequest,
  UpdateVariantRequest,
} from '../types/product.types';

export const variantService = {
  getByProduct: (productId: number) =>
    apiClient.get<ProductVariant[]>(`/admin/products/${productId}/variants`),

  create: (productId: number, body: CreateVariantRequest) =>
    apiClient.post<ProductVariant>(`/admin/products/${productId}/variants`, body),

  update: (productId: number, variantId: number, body: UpdateVariantRequest) =>
    apiClient.patch<ProductVariant>(
      `/admin/products/${productId}/variants/${variantId}`,
      body,
    ),

  remove: (productId: number, variantId: number) =>
    apiClient.delete<void>(`/admin/products/${productId}/variants/${variantId}`),
};
