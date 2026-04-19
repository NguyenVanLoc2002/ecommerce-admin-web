import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  Warehouse,
  WarehouseListParams,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '../types/inventory.types';

export const warehouseService = {
  getList: (params: WarehouseListParams) =>
    apiClient.get<PaginatedResponse<Warehouse>>('/admin/warehouses', { params }),

  create: (body: CreateWarehouseRequest) =>
    apiClient.post<Warehouse>('/admin/warehouses', body),

  update: (id: number, body: UpdateWarehouseRequest) =>
    apiClient.patch<Warehouse>(`/admin/warehouses/${id}`, body),

  remove: (id: number) =>
    apiClient.delete(`/admin/warehouses/${id}`),
};
