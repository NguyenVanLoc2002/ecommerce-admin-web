import { apiClient } from '@/shared/lib/axios';
import type { EntityId } from '@/shared/types/api.types';
import type {
  ProductVariant,
  CreateVariantRequest,
  UpdateVariantRequest,
} from '../types/product.types';

export const variantService = {
  getByProduct: (productId: EntityId) =>
    apiClient.get<ProductVariant[]>(`/admin/products/${productId}/variants`),

  create: (productId: EntityId, body: CreateVariantRequest) =>
    apiClient.post<ProductVariant>(`/admin/products/${productId}/variants`, body),

  update: (productId: EntityId, variantId: EntityId, body: UpdateVariantRequest) =>
    apiClient.patch<ProductVariant>(
      `/admin/products/${productId}/variants/${variantId}`,
      body,
    ),

  remove: (productId: EntityId, variantId: EntityId) =>
    apiClient.delete<void>(`/admin/products/${productId}/variants/${variantId}`),
};
