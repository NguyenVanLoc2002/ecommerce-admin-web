import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  InventoryStock,
  InventoryStockParams,
  AdjustStockRequest,
  StockMovement,
  StockMovementParams,
  Reservation,
  ReservationParams,
} from '../types/inventory.types';

export const inventoryService = {
  getStock: (params: InventoryStockParams) =>
    apiClient.get<PaginatedResponse<InventoryStock>>('/admin/inventories', { params }),

  adjustStock: (body: AdjustStockRequest) =>
    apiClient.post<void>('/admin/inventories/adjust', body),

  getMovements: (params: StockMovementParams) =>
    apiClient.get<PaginatedResponse<StockMovement>>('/admin/inventories/movements', { params }),

  getReservations: (params: ReservationParams) =>
    apiClient.get<PaginatedResponse<Reservation>>('/admin/inventories/reservations', { params }),
};
