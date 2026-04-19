import type { PaginationParams } from '@/shared/types/api.types';
import type { EntityStatus } from '@/shared/types/enums';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: EntityStatus;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListParams extends PaginationParams {
  keyword?: string;
  status?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description: string;
  status: EntityStatus;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
