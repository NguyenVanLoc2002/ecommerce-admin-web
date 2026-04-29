import type { PaginationParams, EntityId } from '@/shared/types/api.types';
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
  attributeName: string;
  value: string;
}

export interface ProductVariant {
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

export interface ProductListItem {
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

export interface ProductListParams extends PaginationParams {
  keyword?: string;
  status?: string;
  categoryId?: EntityId;
  brandId?: EntityId;
  featured?: string;
}

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
  sku: string;
  barcode?: string | null;
  variantName: string;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice?: number | null;
  weightGram: number | null;
  status: VariantStatus;
  attributes: VariantAttribute[];
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
