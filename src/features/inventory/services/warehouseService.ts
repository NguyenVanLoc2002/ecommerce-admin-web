import { apiClient } from '@/shared/lib/axios';
import type { EntityId, PaginatedResponse } from '@/shared/types/api.types';
import type {
  Warehouse,
  WarehouseListParams,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '../types/inventory.types';

export const warehouseService = {
  async getList(params: WarehouseListParams): Promise<PaginatedResponse<Warehouse>> {
    const response = await apiClient.get<unknown>('/admin/warehouses');
    const items = normalizeWarehouseCollection(response);
    const filtered = applyWarehouseFilters(items, params);
    const sorted = applyWarehouseSort(filtered, params.sort);

    return paginate(sorted, params.page, params.size);
  },

  create: (body: CreateWarehouseRequest) =>
    apiClient.post<Warehouse>('/admin/warehouses', body),

  update: (id: EntityId, body: UpdateWarehouseRequest) =>
    apiClient.patch<Warehouse>(`/admin/warehouses/${id}`, body),

  remove: (id: EntityId) =>
    apiClient.delete(`/admin/warehouses/${id}`),
};

function normalizeWarehouseCollection(input: unknown): Warehouse[] {
  if (Array.isArray(input)) {
    return input.map((item) => normalizeWarehouse(item));
  }

  if (isRecord(input) && Array.isArray(input.items)) {
    return input.items.map((item) => normalizeWarehouse(item));
  }

  return [];
}

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
  };
}

function applyWarehouseFilters(items: Warehouse[], params: WarehouseListParams): Warehouse[] {
  return items.filter((warehouse) => {
    const keyword = params.keyword?.trim().toLowerCase();
    const matchesKeyword = !keyword
      || warehouse.name.toLowerCase().includes(keyword)
      || warehouse.code.toLowerCase().includes(keyword)
      || warehouse.location?.toLowerCase().includes(keyword);

    const matchesStatus = !params.status || warehouse.status === params.status;

    return matchesKeyword && matchesStatus;
  });
}

function applyWarehouseSort(items: Warehouse[], sort?: string): Warehouse[] {
  if (!sort) return [...items];

  const [column, direction = 'asc'] = sort.split(',');
  const factor = direction === 'desc' ? -1 : 1;

  return [...items].sort((left, right) => {
    const leftValue = sortableWarehouseValue(left, column);
    const rightValue = sortableWarehouseValue(right, column);

    if (leftValue < rightValue) return -1 * factor;
    if (leftValue > rightValue) return 1 * factor;
    return 0;
  });
}

function sortableWarehouseValue(warehouse: Warehouse, column: string): string {
  switch (column) {
    case 'createdAt':
      return warehouse.createdAt;
    case 'code':
      return warehouse.code;
    case 'status':
      return warehouse.status;
    case 'location':
      return warehouse.location ?? '';
    case 'name':
    default:
      return warehouse.name;
  }
}

function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const safePage = Math.max(page, 0);
  const safeSize = Math.max(size, 1);
  const start = safePage * safeSize;
  const pagedItems = items.slice(start, start + safeSize);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / safeSize), 1);

  return {
    items: pagedItems,
    page: safePage,
    size: safeSize,
    totalItems,
    totalPages,
    hasNext: safePage + 1 < totalPages,
    hasPrevious: safePage > 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function toRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNullableString(value: unknown): string | null {
  return value == null || value === '' ? null : String(value);
}
