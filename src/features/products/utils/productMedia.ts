import type { EntityId } from '@/shared/types/api.types';
import type { ProductMedia, ProductVariant } from '../types/product.types';

export function sortMedia(media: ProductMedia[]): ProductMedia[] {
  return [...media].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return a.id.localeCompare(b.id);
  });
}

export function getVariantLabel(variants: ProductVariant[], variantId: EntityId | null): string | null {
  if (!variantId) {
    return null;
  }

  const variant = variants.find((item) => item.id === variantId);
  return variant?.variantName || variant?.sku || 'Variant';
}

export function getProductPreviewMedia(media: ProductMedia[]): ProductMedia | undefined {
  const sortedImages = sortMedia(media.filter((item) => item.mediaType === 'IMAGE'));
  const primaryImage = sortedImages.find((item) => item.primary);
  const sortedProductImages = sortedImages.filter((item) => item.variantId == null);
  const sortedVariantImages = sortedImages.filter((item) => item.variantId != null);

  return primaryImage ?? sortedProductImages[0] ?? sortedVariantImages[0];
}

export function getVariantMedia(media: ProductMedia[], variantId: EntityId): ProductMedia[] {
  return sortMedia(media.filter((item) => item.variantId === variantId));
}

export function getShortMediaName(mediaUrl: string): string {
  try {
    const pathname = new URL(mediaUrl).pathname;
    const filename = pathname.split('/').filter(Boolean).pop();
    return filename ? decodeURIComponent(filename) : mediaUrl;
  } catch {
    const filename = mediaUrl.split('/').filter(Boolean).pop();
    return filename || mediaUrl;
  }
}
