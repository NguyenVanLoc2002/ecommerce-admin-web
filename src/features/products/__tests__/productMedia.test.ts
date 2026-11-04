import { describe, expect, it } from 'vitest';
import { getProductPreviewMedia } from '../utils/productMedia';
import type { ProductMedia } from '../types/product.types';

function media(id: string, options: Partial<ProductMedia> = {}): ProductMedia {
  return {
    id,
    mediaUrl: `https://cdn.example.com/${id}`,
    mediaType: 'IMAGE',
    sortOrder: 0,
    primary: false,
    variantId: null,
    ...options,
  };
}

describe('getProductPreviewMedia', () => {
  it('prefers primary variant image over non-primary product gallery images', () => {
    const galleryImage = media('gallery', { sortOrder: 0 });
    const primaryVariantImage = media('variant-primary', {
      primary: true,
      variantId: 'variant-1',
    });

    expect(getProductPreviewMedia([galleryImage, primaryVariantImage])).toBe(primaryVariantImage);
  });

  it('ignores videos when choosing the product preview image', () => {
    const video = media('video-primary', { mediaType: 'VIDEO', primary: true });
    const image = media('gallery-image');

    expect(getProductPreviewMedia([video, image])).toBe(image);
  });
});
