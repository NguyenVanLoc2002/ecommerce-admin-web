import type { PaginationParams, EntityId } from '@/shared/types/api.types';
import type { DiscountType } from '@/shared/types/enums';

export interface Voucher {
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

export interface VoucherListParams extends PaginationParams {
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
