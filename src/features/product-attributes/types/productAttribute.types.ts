import type {
  EntityId,
  PaginationParams,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';

export const ProductAttributeType = {
  VARIANT: 'VARIANT',
  DESCRIPTIVE: 'DESCRIPTIVE',
} as const;

export type ProductAttributeType =
  (typeof ProductAttributeType)[keyof typeof ProductAttributeType];

export interface ProductAttributeValue extends SoftDeletableRecord {
  id: EntityId;
  value: string;
  displayValue: string | null;
}

export interface ProductAttribute extends SoftDeletableRecord {
  id: EntityId;
  name: string;
  code: string;
  type: ProductAttributeType;
  values: ProductAttributeValue[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeListParams extends PaginationParams, SoftDeleteFilterParams {
  keyword?: string;
  type?: ProductAttributeType;
}

export interface ProductAttributeValueInput {
  id?: EntityId;
  value: string;
  displayValue?: string | null;
}

export interface CreateProductAttributeRequest {
  name: string;
  code: string;
  type: ProductAttributeType;
  values: ProductAttributeValueInput[];
}

export type UpdateProductAttributeRequest = Partial<CreateProductAttributeRequest>;
