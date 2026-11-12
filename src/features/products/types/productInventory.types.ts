import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';

export interface ProductInventoryLevel {
  id: EntityId;
  variantId: EntityId;
  warehouseId: EntityId;
  onHand: number;
  reserved: number;
  available: number;
}

export type ProductInventoryResponse = PaginatedResponse<ProductInventoryLevel>;
