import type { PaginationParams } from '@/shared/types/api.types';
import type { ProductStatus, VariantStatus } from '@/shared/types/enums';

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductBrand {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: ProductBrand | null;
  categories: ProductCategory[];
  shortDescription: string | null;
  description: string | null;
  status: ProductStatus;
  featured: boolean;
  variantCount: number;
  activeVariantCount: number;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VariantAttribute {
  attributeName: string;
  value: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  variantName: string;
  basePrice: number;
  salePrice: number | null;
  weightGram: number | null;
  status: VariantStatus;
  attributes: VariantAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams extends PaginationParams {
  keyword?: string;
  status?: string;
  categoryId?: number;
  brandId?: number;
  featured?: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  brandId: number | null;
  categoryIds: number[];
  shortDescription: string;
  description: string;
  status: ProductStatus;
  featured: boolean;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface CreateVariantRequest {
  sku: string;
  variantName: string;
  basePrice: number;
  salePrice: number | null;
  weightGram: number | null;
  status: VariantStatus;
  attributes: VariantAttribute[];
}

export type UpdateVariantRequest = Partial<CreateVariantRequest>;

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export interface BrandOption {
  id: number;
  name: string;
  slug: string;
}
