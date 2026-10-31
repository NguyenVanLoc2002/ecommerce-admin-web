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
  const sortedProductMedia = sortMedia(media.filter((item) => item.variantId == null));
  const sortedVariantMedia = sortMedia(media.filter((item) => item.variantId != null));
  const primaryProductMedia = sortedProductMedia.find((item) => item.primary);
  const primaryVariantMedia = sortedVariantMedia.find((item) => item.primary);

  return primaryProductMedia
    ?? sortedProductMedia[0]
    ?? primaryVariantMedia
    ?? sortedVariantMedia[0];
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
