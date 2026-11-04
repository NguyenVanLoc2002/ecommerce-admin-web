import type {
  PaginationParams,
  EntityId,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';
import type { EntityStatus } from '@/shared/types/enums';

export interface Category extends SoftDeletableRecord {
  id: EntityId;
  parentId: EntityId | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: EntityStatus;
  sortOrder: number | null;
  createdAt: string;
}

export interface CategoryListParams extends PaginationParams, SoftDeleteFilterParams {
  [key: string]: string | number | boolean | undefined;
  name?: string;
  slug?: string;
  parentId?: EntityId;
  status?: string;
}

export interface CreateCategoryRequest {
  parentId?: EntityId | null;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

export interface UpdateCategoryRequest {
  parentId?: EntityId | null;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
  status?: EntityStatus;
  sortOrder?: number | null;
}
