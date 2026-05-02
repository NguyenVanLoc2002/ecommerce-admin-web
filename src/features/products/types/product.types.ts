import type {
  PaginationParams,
  EntityId,
  SoftDeleteFilterParams,
  SoftDeletableRecord,
} from '@/shared/types/api.types';
import type { ProductStatus, VariantStatus } from '@/shared/types/enums';

export interface ProductCategory {
  id: EntityId;
  name: string;
  slug: string;
}

export interface ProductBrand {
  id: EntityId;
  name: string;
  slug: string;
}

export interface VariantAttribute {
  attributeId: EntityId;
  attributeName: string;
  attributeCode: string;
  valueId: EntityId;
  value: string;
  displayValue: string | null;
}

export interface VariantAttributeDefinitionValue extends SoftDeletableRecord {
  id: EntityId;
  value: string;
  displayValue: string | null;
}

export interface VariantAttributeDefinition extends SoftDeletableRecord {
  id: EntityId;
  name: string;
  code: string;
  type: 'VARIANT' | 'DESCRIPTIVE';
  values: VariantAttributeDefinitionValue[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant extends SoftDeletableRecord {
  id: EntityId;
  productId: EntityId;
  sku: string;
  barcode: string | null;
  variantName: string;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice: number | null;
  weightGram: number | null;
  status: VariantStatus;
  attributes: VariantAttribute[];
}

export interface ProductMedia {
  id: EntityId;
  mediaUrl: string;
  mediaType: string;
  sortOrder: number;
  primary: boolean;
  variantId: EntityId | null;
}

export interface ProductListItem extends SoftDeletableRecord {
  id: EntityId;
  name: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  status: ProductStatus;
  featured: boolean;
  brandName: string | null;
  categoryNames: string[];
  createdAt: string;
  variantCount: number;
  activeVariantCount: number;
}

export interface Product extends ProductListItem {
  description: string | null;
  brand: ProductBrand | null;
  categories: ProductCategory[];
  variants: ProductVariant[];
  media: ProductMedia[];
  updatedAt: string;
}

export interface ProductListParams extends PaginationParams, SoftDeleteFilterParams {
  keyword?: string;
  status?: string;
  categoryId?: EntityId;
  brandId?: EntityId;
  minPrice?: number;
  maxPrice?: number;
  featured?: string;
}

export interface VariantListParams extends SoftDeleteFilterParams {}

export interface CreateProductRequest {
  name: string;
  slug: string;
  brandId: EntityId | null;
  categoryIds: EntityId[];
  shortDescription: string;
  description: string;
  status: ProductStatus;
  featured: boolean;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface CreateVariantRequest {
  sku: string | null;
  autoGenerateSku: boolean;
  barcode: string | null;
  autoGenerateBarcode: boolean;
  variantName: string | null;
  autoGenerateVariantName: boolean;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice: number | null;
  weightGram: number | null;
  status: VariantStatus;
  attributeValueIds: EntityId[];
}

export type UpdateVariantRequest = Partial<CreateVariantRequest>;

export interface CategoryOption {
  id: EntityId;
  name: string;
  slug: string;
}

export interface BrandOption {
  id: EntityId;
  name: string;
  slug: string;
}
