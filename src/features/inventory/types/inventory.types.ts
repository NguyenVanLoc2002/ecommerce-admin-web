import type {
  PaginationParams,
  EntityId,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';
import type { StockMovementType, EntityStatus } from '@/shared/types/enums';

// ─── Warehouse ────────────────────────────────────────────────────────────────

export interface Warehouse extends SoftDeletableRecord {
  id: EntityId;
  name: string;
  code: string;
  location: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseListParams extends SoftDeleteFilterParams {
  status?: EntityStatus;
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
  variantId?: EntityId;
  keyword?: string;
  warehouseId?: EntityId;
  productId?: EntityId;
  sku?: string;
  variantStatus?: string;
  outOfStock?: boolean;
  lowStock?: boolean;
  lowStockThreshold?: number;
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
  sku: string;
  variantName: string;
  movementType: string;
  quantity: number;
  note: string | null;
  referenceType: string | null;
  referenceId: EntityId | null;
  beforeOnHand: number | null;
  beforeReserved: number | null;
  beforeAvailable: number | null;
  afterOnHand: number | null;
  afterReserved: number | null;
  afterAvailable: number | null;
  createdAt: string;
  createdBy: string;
}

export interface StockMovementParams extends PaginationParams {
  variantId?: EntityId;
  warehouseId?: EntityId;
  movementType?: StockMovementType;
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
