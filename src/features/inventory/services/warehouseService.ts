import { apiClient } from '@/shared/lib/axios';
import type { EntityId } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';
import type {
  Warehouse,
  WarehouseListParams,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '../types/inventory.types';

export const warehouseService = {
  async getList(params: WarehouseListParams): Promise<Warehouse[]> {
    const response = await apiClient.get<unknown[]>('/admin/warehouses', {
      params: sanitizeWarehouseParams(params),
    });

    return Array.isArray(response) ? response.map((item) => normalizeWarehouse(item)) : [];
  },

  async create(body: CreateWarehouseRequest): Promise<Warehouse> {
    const response = await apiClient.post<unknown>('/admin/warehouses', body);
    return normalizeWarehouse(response);
  },

  async update(id: EntityId, body: UpdateWarehouseRequest): Promise<Warehouse> {
    const response = await apiClient.patch<unknown>(`/admin/warehouses/${id}`, body);
    return normalizeWarehouse(response);
  },

  remove: (id: EntityId) =>
    apiClient.delete(`/admin/warehouses/${id}`),
};

function normalizeWarehouse(input: unknown): Warehouse {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    name: asString(record.name),
    code: asString(record.code),
    location: asNullableString(record.location),
    status: asString(record.status) as Warehouse['status'],
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt ?? record.createdAt),
    isDeleted: asBoolean(record.isDeleted),
  };
}


function toRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNullableString(value: unknown): string | null {
  return value == null || value === '' ? null : String(value);
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function sanitizeWarehouseParams(params: WarehouseListParams) {
  return cleanParams({
    status: normalizeString(params.status),
    ...toSoftDeleteQuery(params.deletedState),
  });
}

function normalizeString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
