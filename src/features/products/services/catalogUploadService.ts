import axios from 'axios';
import { apiClient } from '@/shared/lib/axios';
import type { CatalogUploadRequest, PresignedCatalogUpload, VerifiedCatalogAsset } from '../types/product.types';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateCatalogImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return 'Choose a JPEG, PNG, or WebP image.';
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) return 'Image must be smaller than 10 MiB.';
  return null;
}

export const catalogUploadService = {
  async uploadImage(file: File, onProgress: (percent: number) => void, onVerifying: () => void): Promise<VerifiedCatalogAsset> {
    const validationError = validateCatalogImage(file);
    if (validationError) throw new Error(validationError);

    const request: CatalogUploadRequest = {
      purpose: 'CATALOG_IMAGE',
      originalFilename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    };
    const presigned = await apiClient.post<PresignedCatalogUpload>('/admin/catalog-uploads', request);
    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': presigned.requiredContentType },
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    onVerifying();
    const verified = await apiClient.post<VerifiedCatalogAsset>('/admin/catalog-uploads/complete', {
      storageKey: presigned.storageKey,
    });
    return verified;
  },
};
