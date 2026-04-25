import type { PaginationParams } from '@/shared/types/api.types';
import type { DiscountType } from '@/shared/types/enums';

export interface Voucher {
  id: number;
  code: string;
  promotionId: number;
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
  id: number;
  orderId: number;
  orderCode: string;
  customerId: number;
  customerName: string;
  usedAt: string;
  discountAmount: number;
}

export interface VoucherListParams extends PaginationParams {
  code?: string;
  promotionId?: number;
  active?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateVoucherRequest {
  code?: string | null;
  promotionId: number;
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
