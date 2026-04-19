import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  InventoryStock,
  InventoryStockParams,
  ImportStockRequest,
  AdjustStockRequest,
  StockMovement,
  StockMovementParams,
  Reservation,
  ReservationParams,
} from '../types/inventory.types';

export const inventoryService = {
  getStock: (params: InventoryStockParams) =>
    apiClient.get<PaginatedResponse<InventoryStock>>('/admin/inventory/stock', { params }),

  importStock: (body: ImportStockRequest) =>
    apiClient.post<void>('/admin/inventory/import', body),

  adjustStock: (body: AdjustStockRequest) =>
    apiClient.post<void>('/admin/inventory/adjust', body),

  getMovements: (params: StockMovementParams) =>
    apiClient.get<PaginatedResponse<StockMovement>>('/admin/inventory/movements', { params }),

  getReservations: (params: ReservationParams) =>
    apiClient.get<PaginatedResponse<Reservation>>('/admin/inventory/reservations', { params }),
};
