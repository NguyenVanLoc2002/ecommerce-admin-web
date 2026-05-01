import type {
  PaginationParams,
  EntityId,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';
import type { DiscountType, PromotionScope, PromotionRuleType } from '@/shared/types/enums';

export interface PromotionRule {
  id: EntityId;
  promotionId: EntityId;
  ruleType: PromotionRuleType;
  ruleValue: string;
  description: string | null;
  createdAt: string;
}

export interface Promotion extends SoftDeletableRecord {
  id: EntityId;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minimumOrderAmount: number | null;
  scope: PromotionScope;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
  rules: PromotionRule[];
  createdAt: string;
  updatedAt: string;
}

export interface PromotionSummary extends SoftDeletableRecord {
  id: EntityId;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minimumOrderAmount: number | null;
  scope: PromotionScope;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionListParams extends PaginationParams, SoftDeleteFilterParams {
  name?: string;
  scope?: string;
  active?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreatePromotionRequest {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minimumOrderAmount?: number;
  scope: PromotionScope;
  startDate: string;
  endDate: string;
  usageLimit?: number;
}

export interface UpdatePromotionRequest {
  name?: string;
  description?: string;
  discountValue?: number;
  maxDiscountAmount?: number;
  minimumOrderAmount?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  usageLimit?: number;
}

export interface CreateRuleRequest {
  ruleType: PromotionRuleType;
  ruleValue: string;
  description?: string;
}
