import type { PaginationParams } from '@/shared/types/api.types';
import type { ReviewStatus } from '@/shared/types/enums';

export interface Review {
  id: number;
  customerId: number;
  customerName: string;
  productId: number;
  productName: string;
  variantId: number;
  variantName: string;
  sku: string;
  orderItemId: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  adminNote: string | null;
  moderatedAt: string | null;
  moderatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReviewListParams extends PaginationParams {
  status?: ReviewStatus;
  productId?: number;
  customerId?: number;
  minRating?: number;
  maxRating?: number;
}

export const ModerationAction = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ModerationAction = (typeof ModerationAction)[keyof typeof ModerationAction];

export interface ModerateReviewRequest {
  action: ModerationAction;
  adminNote?: string | null;
}
