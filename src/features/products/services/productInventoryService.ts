import { apiClient } from '@/shared/lib/axios';
import type { EntityId } from '@/shared/types/api.types';
import type { ProductInventoryResponse } from '../types/productInventory.types';

const PRODUCT_INVENTORY_PAGE_SIZE = 100;

export const productInventoryService = {
  getByProductId: (productId: EntityId) =>
    apiClient.get<ProductInventoryResponse>('/admin/inventories', {
      params: {
        productId,
        page: 0,
        size: PRODUCT_INVENTORY_PAGE_SIZE,
        sort: 'updatedAt,desc',
      },
    }),
};
