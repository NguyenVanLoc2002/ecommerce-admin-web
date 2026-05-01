import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse } from '@/shared/types/api.types';
import { cleanParams } from '@/shared/utils/cleanParams';
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
    apiClient.get<PaginatedResponse<InventoryStock>>('/admin/inventories', {
      params: sanitizeStockParams(params),
    }),

  adjustStock: (body: AdjustStockRequest) =>
    apiClient.post<void>('/admin/inventories/adjust', body),

  async getMovements(params: StockMovementParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await apiClient.get<PaginatedResponse<unknown>>('/admin/inventories/movements', {
      params: sanitizeMovementParams(params),
    });

    return {
      ...response,
      items: response.items.map((item) => normalizeStockMovement(item)),
    };
  },

  getReservations: (params: ReservationParams) =>
    apiClient.get<PaginatedResponse<Reservation>>('/admin/inventories/reservations', {
      params: sanitizeReservationParams(params),
    }),
};

function sanitizeStockParams(params: InventoryStockParams) {
  return cleanParams({
    page: params.page,
    size: params.size,
    sort: params.sort,
    variantId: normalizeString(params.variantId),
    warehouseId: normalizeString(params.warehouseId),
    productId: normalizeString(params.productId),
    sku: normalizeString(params.sku),
    keyword: normalizeString(params.keyword),
    variantStatus: normalizeString(params.variantStatus),
    outOfStock: params.outOfStock,
    lowStock: params.lowStock,
    lowStockThreshold: params.lowStockThreshold,
  });
}

function sanitizeMovementParams(params: StockMovementParams) {
  return cleanParams({
    page: params.page,
    size: params.size,
    sort: params.sort,
    variantId: normalizeString(params.variantId),
    warehouseId: normalizeString(params.warehouseId),
    movementType: normalizeString(params.movementType),
  });
}

function sanitizeReservationParams(params: ReservationParams) {
  return cleanParams({
    page: params.page,
    size: params.size,
    sort: params.sort,
    orderId: normalizeString(params.orderId),
    variantId: normalizeString(params.variantId),
    warehouseId: normalizeString(params.warehouseId),
    status: normalizeString(params.status),
  });
}

function normalizeString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeStockMovement(input: unknown): StockMovement {
  const record = toRecord(input);

  return {
    id: asString(record.id),
    warehouseId: asString(record.warehouseId),
    warehouseName: asString(record.warehouseName),
    variantId: asString(record.variantId),
    sku: asString(record.sku ?? record.variantSku),
    variantName: asString(record.variantName),
    movementType: asString(record.movementType ?? record.type),
    quantity: asNumber(record.quantity) ?? 0,
    note: asNullableString(record.note),
    referenceType: asNullableString(record.referenceType),
    referenceId: record.referenceId == null ? null : String(record.referenceId),
    beforeOnHand: asNullableNumber(record.beforeOnHand),
    beforeReserved: asNullableNumber(record.beforeReserved),
    beforeAvailable: asNullableNumber(record.beforeAvailable),
    afterOnHand: asNullableNumber(record.afterOnHand),
    afterReserved: asNullableNumber(record.afterReserved),
    afterAvailable: asNullableNumber(record.afterAvailable),
    createdAt: asString(record.createdAt),
    createdBy: asString(record.createdBy),
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

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asNullableNumber(value: unknown): number | null {
  return value == null ? null : asNumber(value);
}
