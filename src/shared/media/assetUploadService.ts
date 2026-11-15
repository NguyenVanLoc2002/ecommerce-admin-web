import axios from 'axios';
import { apiClient } from '@/shared/lib/axios';

export type AssetPurpose = 'CATALOG_IMAGE' | 'CATEGORY_IMAGE' | 'BRAND_LOGO' | 'CUSTOMER_AVATAR' | 'CARRIER_LOGO';

export interface VerifiedAsset {
  assetId: string;
  storageKey: string;
  mediaUrl: string;
  contentType: string;
  sizeBytes: number;
}

interface PresignedUpload {
  assetId: string;
  storageKey: string;
  uploadUrl: string;
  requiredContentType: string;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return 'Choose a JPEG, PNG, or WebP image.';
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) return 'Image must be smaller than 10 MiB.';
  return null;
}

export const assetUploadService = {
  async uploadImage(
    file: File,
    purpose: AssetPurpose,
    onProgress: (percent: number) => void,
    onVerifying: () => void,
  ): Promise<VerifiedAsset> {
    const validationError = validateImageFile(file);
    if (validationError) throw new Error(validationError);

    const presigned = await apiClient.post<PresignedUpload>('/admin/catalog-uploads', {
      purpose,
      originalFilename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });
    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': presigned.requiredContentType },
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    onVerifying();
    return apiClient.post<VerifiedAsset>('/admin/catalog-uploads/complete', { storageKey: presigned.storageKey });
  },
};
