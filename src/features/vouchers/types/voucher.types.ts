import type {
  PaginationParams,
  EntityId,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';
import type { DiscountType } from '@/shared/types/enums';

export interface Voucher extends SoftDeletableRecord {
  id: EntityId;
  code: string;
  promotionId: EntityId;
  promotionName: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minimumOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  usageLimitPerUser: number | null;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

export interface VoucherUsage {
  id: EntityId;
  orderId: EntityId;
  orderCode: string;
  customerId: EntityId;
  customerName: string;
  usedAt: string;
  discountAmount: number;
}

export interface VoucherListParams extends PaginationParams, SoftDeleteFilterParams {
  code?: string;
  promotionId?: EntityId;
  active?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateVoucherRequest {
  code?: string | null;
  promotionId: EntityId;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startDate: string;
  endDate: string;
}

export interface UpdateVoucherRequest {
  usageLimit?: number;
  usageLimitPerUser?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}
