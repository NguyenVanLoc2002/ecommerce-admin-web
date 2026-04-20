import type { PaginationParams } from '@/shared/types/api.types';
import type { EntityStatus } from '@/shared/types/enums';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  status: EntityStatus;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandListParams extends PaginationParams {
  keyword?: string;
  status?: string;
}

export interface CreateBrandRequest {
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  status: EntityStatus;
}

export type UpdateBrandRequest = Partial<CreateBrandRequest>;
