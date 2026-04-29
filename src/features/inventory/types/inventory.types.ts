import type { PaginationParams, EntityId } from '@/shared/types/api.types';
import type { StockMovementType, EntityStatus } from '@/shared/types/enums';

// ─── Warehouse ────────────────────────────────────────────────────────────────

export interface Warehouse {
  id: EntityId;
  name: string;
  code: string;
  location: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseListParams extends PaginationParams {
  keyword?: string;
  status?: string;
}

export interface CreateWarehouseRequest {
  name: string;
  code: string;
  location?: string;
}

export interface UpdateWarehouseRequest {
  name?: string;
  location?: string;
  status?: EntityStatus;
}

// ─── Inventory Stock ──────────────────────────────────────────────────────────

export interface InventoryStock {
  id: EntityId;
  warehouseId: EntityId;
  warehouseName: string;
  variantId: EntityId;
  sku: string;
  variantName: string;
  productId: EntityId;
  productName: string;
  onHand: number;
  reserved: number;
  available: number;
  updatedAt: string;
}

export interface InventoryStockParams extends PaginationParams {
  keyword?: string;
  warehouseId?: EntityId;
}

export interface AdjustStockRequest {
  warehouseId: EntityId;
  variantId: EntityId;
  quantity: number;
  movementType: StockMovementType;
  note: string;
}

// ─── Stock Movement ───────────────────────────────────────────────────────────

export interface StockMovement {
  id: EntityId;
  warehouseId: EntityId;
  warehouseName: string;
  variantId: EntityId;
  variantSku: string;
  variantName: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  note: string | null;
  referenceId: EntityId | null;
  createdAt: string;
  createdBy: string;
}

export interface StockMovementParams extends PaginationParams {
  variantId?: EntityId;
  warehouseId?: EntityId;
  movementType?: string;
}

// ─── Reservation ──────────────────────────────────────────────────────────────

export const ReservationStatus = {
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export interface Reservation {
  id: EntityId;
  orderId: EntityId;
  orderCode: string;
  variantId: EntityId;
  variantSku: string;
  variantName: string;
  warehouseId: EntityId;
  warehouseName: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface ReservationParams extends PaginationParams {
  orderId?: EntityId;
  variantId?: EntityId;
  warehouseId?: EntityId;
  status?: string;
}
