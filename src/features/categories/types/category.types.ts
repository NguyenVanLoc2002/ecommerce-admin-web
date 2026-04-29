import type { PaginationParams, EntityId } from '@/shared/types/api.types';
import type { EntityStatus } from '@/shared/types/enums';

export interface Category {
  id: EntityId;
  name: string;
  slug: string;
  description: string | null;
  parentId: EntityId | null;
  status: EntityStatus;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListParams extends PaginationParams {
  name?: string;
  status?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description: string;
  parentId?: EntityId | null;
  status: EntityStatus;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
