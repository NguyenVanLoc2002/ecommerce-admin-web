import { apiClient } from '@/shared/lib/axios';
import type { PaginatedResponse, EntityId } from '@/shared/types/api.types';
import type {
  Product,
  ProductListItem,
  ProductListParams,
  ProductVariant,
  ProductBrand,
  ProductCategory,
  ProductMedia,
  CreateProductRequest,
  UpdateProductRequest,
} from '../types/product.types';
import type { ProductStatus } from '@/shared/types/enums';
import { cleanParams } from '@/shared/utils/cleanParams';
import { toSoftDeleteQuery } from '@/shared/utils/softDelete';

export const productService = {
  async getList({
    deletedState,
    ...params
  }: ProductListParams): Promise<PaginatedResponse<ProductListItem>> {
    const response = await apiClient.get<PaginatedResponse<unknown>>('/admin/products', {
      params: cleanParams({
        ...params,
        ...toSoftDeleteQuery(deletedState),
      }),
    });

    return {
      ...response,
      items: response.items.map((item) => normalizeProductListItem(item)),
    };
  },

  async getById(id: EntityId): Promise<Product> {
    const response = await apiClient.get<unknown>(`/admin/products/${id}`);
    return normalizeProduct(response);
  },

  create: (body: CreateProductRequest) =>
    apiClient.post<Product>('/admin/products', body),

  update: (id: EntityId, body: UpdateProductRequest) =>
    apiClient.patch<Product>(`/admin/products/${id}`, body),

  updateStatus: (id: EntityId, status: ProductStatus) =>
    apiClient.patch<Product>(`/admin/products/${id}`, { status }),

  remove: (id: EntityId) =>
    apiClient.delete<void>(`/admin/products/${id}`),
};

function normalizeProductListItem(input: unknown): ProductListItem {
  const record = toRecord(input);
  const variants = Array.isArray(record.variants)
    ? record.variants.map((variant) => normalizeVariant(variant, String(record.id ?? '')))
    : [];

  const categoryNames = arrayOfStrings(record.categoryNames)
    ?? (Array.isArray(record.categories)
      ? record.categories.map((category) => normalizeCategory(category).name)
      : []);

  const brand = record.brand ? normalizeBrand(record.brand) : null;
  const variantCount = asNumber(record.variantCount)
    ?? variants.length
    ?? 0;
  const activeVariantCount = asNumber(record.activeVariantCount)
    ?? variants.filter((variant) => variant.status === 'ACTIVE').length;

  return {
    id: String(record.id ?? ''),
    name: asString(record.name),
    slug: asString(record.slug),
    shortDescription: asNullableString(record.shortDescription),
    thumbnailUrl: asNullableString(record.thumbnailUrl)
      ?? firstPrimaryMediaUrl(record.media),
    minPrice: asNullableNumber(record.minPrice),
    maxPrice: asNullableNumber(record.maxPrice),
    status: asString(record.status) as ProductStatus,
    featured: Boolean(record.featured),
    brandName: asNullableString(record.brandName) ?? brand?.name ?? null,
    categoryNames,
    createdAt: asString(record.createdAt),
    variantCount,
    activeVariantCount,
    isDeleted: asBoolean(record.isDeleted),
  };
}

function normalizeProduct(input: unknown): Product {
  const record = toRecord(input);
  const listItem = normalizeProductListItem(record);

  return {
    ...listItem,
    description: asNullableString(record.description),
    brand: record.brand ? normalizeBrand(record.brand) : null,
    categories: Array.isArray(record.categories)
      ? record.categories.map((category) => normalizeCategory(category))
      : [],
    variants: Array.isArray(record.variants)
      ? record.variants.map((variant) => normalizeVariant(variant, listItem.id))
      : [],
    media: Array.isArray(record.media)
      ? record.media.map((media) => normalizeMedia(media))
      : [],
    updatedAt: asString(record.updatedAt ?? record.createdAt),
  };
}

function normalizeVariant(input: unknown, productId: EntityId): ProductVariant {
  const record = toRecord(input);

  return {
    id: String(record.id ?? ''),
    productId: String(record.productId ?? productId),
    sku: asString(record.sku),
    barcode: asNullableString(record.barcode),
    variantName: asString(record.variantName),
    basePrice: asNumber(record.basePrice) ?? 0,
    salePrice: asNullableNumber(record.salePrice),
    compareAtPrice: asNullableNumber(record.compareAtPrice),
    weightGram: asNullableNumber(record.weightGram),
    status: asString(record.status) as ProductVariant['status'],
    attributes: Array.isArray(record.attributes)
      ? record.attributes.map((attribute) => {
          const attributeRecord = toRecord(attribute);
          return {
            attributeId: asString(attributeRecord.attributeId),
            attributeName: asString(attributeRecord.attributeName ?? attributeRecord.name),
            attributeCode: asString(attributeRecord.attributeCode),
            valueId: asString(attributeRecord.valueId),
            value: asString(attributeRecord.value),
            displayValue: asNullableString(attributeRecord.displayValue),
          };
        })
      : [],
    isDeleted: asBoolean(record.isDeleted),
  };
}

function normalizeBrand(input: unknown): ProductBrand {
  const record = toRecord(input);
  return {
    id: String(record.id ?? ''),
    name: asString(record.name),
    slug: asString(record.slug),
  };
}

function normalizeCategory(input: unknown): ProductCategory {
  const record = toRecord(input);
  return {
    id: String(record.id ?? ''),
    name: asString(record.name),
    slug: asString(record.slug),
  };
}

function normalizeMedia(input: unknown): ProductMedia {
  const record = toRecord(input);
  return {
    id: String(record.id ?? ''),
    mediaUrl: asString(record.mediaUrl),
    mediaType: asString(record.mediaType),
    sortOrder: asNumber(record.sortOrder) ?? 0,
    primary: Boolean(record.primary),
    variantId: record.variantId == null ? null : String(record.variantId),
  };
}

function firstPrimaryMediaUrl(input: unknown): string | null {
  if (!Array.isArray(input)) {
    return null;
  }

  const primary = input.find((entry) => Boolean(toRecord(entry).primary)) ?? input[0];
  return primary ? asNullableString(toRecord(primary).mediaUrl) : null;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNullableString(value: unknown): string | null {
  return value == null || value === '' ? null : String(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asNullableNumber(value: unknown): number | null {
  return value == null ? null : asNumber(value);
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function arrayOfStrings(value: unknown): string[] | null {
  return Array.isArray(value)
    ? value.map((entry) => asString(entry)).filter(Boolean)
    : null;
}
