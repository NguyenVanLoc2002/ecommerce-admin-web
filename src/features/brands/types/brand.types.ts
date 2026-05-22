import type {
  PaginationParams,
  EntityId,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';
import type { EntityStatus } from '@/shared/types/enums';

export interface Brand extends SoftDeletableRecord {
  id: EntityId;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  sortOrder: number | null;
  status: EntityStatus;
  createdAt: string;
}

export interface BrandListParams extends PaginationParams, SoftDeleteFilterParams {
  [key: string]: string | number | boolean | undefined;
  name?: string;
  status?: string;
}

export interface CreateBrandRequest {
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string;
}

export interface UpdateBrandRequest {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string;
  status?: EntityStatus;
}
