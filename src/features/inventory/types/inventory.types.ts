import type { PaginationParams } from '@/shared/types/api.types';
import type { StockMovementType, StockAdjustmentReason, EntityStatus } from '@/shared/types/enums';

// ─── Warehouse ────────────────────────────────────────────────────────────────

export interface Warehouse {
  id: number;
  name: string;
  address: string | null;
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
  address: string;
  status: EntityStatus;
}

export type UpdateWarehouseRequest = Partial<CreateWarehouseRequest>;

// ─── Inventory Stock ──────────────────────────────────────────────────────────

export interface InventoryStock {
  id: number;
  warehouseId: number;
  warehouseName: string;
  variantId: number;
  variantSku: string;
  variantName: string;
  productId: number;
  productName: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  updatedAt: string;
}

export interface InventoryStockParams extends PaginationParams {
  keyword?: string;
  warehouseId?: number;
}

export interface ImportStockRequest {
  warehouseId: number;
  variantId: number;
  quantity: number;
  note: string;
}

export interface AdjustStockRequest {
  warehouseId: number;
  variantId: number;
  quantity: number;
  reason: StockAdjustmentReason;
  note: string;
}

// ─── Stock Movement ───────────────────────────────────────────────────────────

export interface StockMovement {
  id: number;
  warehouseId: number;
  warehouseName: string;
  variantId: number;
  variantSku: string;
  variantName: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  note: string | null;
  referenceId: number | null;
  createdAt: string;
  createdBy: string;
}

export interface StockMovementParams extends PaginationParams {
  variantId?: number;
  warehouseId?: number;
  type?: string;
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
  id: number;
  orderId: number;
  orderCode: string;
  variantId: number;
  variantSku: string;
  variantName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface ReservationParams extends PaginationParams {
  orderId?: number;
  variantId?: number;
  warehouseId?: number;
  status?: string;
}
