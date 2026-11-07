import { apiClient } from '@/shared/lib/axios';

export interface WarehouseOption {
  id: string;
  name: string;
  code: string;
}

export const warehouseOptionService = {
  getActive: () => apiClient.get<WarehouseOption[]>('/admin/warehouses', {
    params: { status: 'ACTIVE' },
  }),
};
