import type {
  EntityId,
  PaginationParams,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';
import type { ReviewStatus } from '@/shared/types/enums';

export interface Review extends SoftDeletableRecord {
  id: EntityId;
  customerId: EntityId;
  customerName: string;
  productId: EntityId;
  productName: string;
  variantId: EntityId;
  variantName: string | null;
  sku: string | null;
  orderItemId: EntityId;
  rating: number;
  comment: string;
  status: ReviewStatus;
  adminNote: string | null;
  moderatedAt: string | null;
  moderatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReviewListParams extends PaginationParams, SoftDeleteFilterParams {
  status?: ReviewStatus;
  productId?: EntityId;
  customerId?: EntityId;
  minRating?: number;
  maxRating?: number;
}

export const ModerationAction = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ModerationAction = (typeof ModerationAction)[keyof typeof ModerationAction];

export interface UpdateReviewStatusRequest {
  status: Exclude<ReviewStatus, 'PENDING'>;
  adminNote?: string | null;
}
