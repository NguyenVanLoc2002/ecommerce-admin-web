/* eslint-disable @typescript-eslint/unbound-method -- mocked client methods are called through their test doubles */
import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/lib/axios';
import { assetUploadService, validateImageFile } from '../assetUploadService';

vi.mock('axios', () => ({ default: { put: vi.fn() } }));
vi.mock('@/shared/lib/axios', () => ({ apiClient: { post: vi.fn() } }));

const presigned = {
  assetId: 'asset-1',
  storageKey: 'catalog/asset-1.png',
  uploadUrl: 'https://signed.example/upload',
  requiredContentType: 'image/png',
};
const verified = {
  assetId: 'asset-1',
  storageKey: 'catalog/asset-1.png',
  mediaUrl: 'https://assets.example/catalog/asset-1.png',
  contentType: 'image/png',
  sizeBytes: 4,
};

afterEach(() => vi.resetAllMocks());

describe('assetUploadService', () => {
  it('validates supported image formats and configured size boundary', () => {
    expect(validateImageFile(new File(['data'], 'image.png', { type: 'image/png' }))).toBeNull();
    expect(validateImageFile(new File(['data'], 'image.svg', { type: 'image/svg+xml' }))).toMatch(/JPEG, PNG, or WebP/);
    expect(validateImageFile(new File([], 'empty.png', { type: 'image/png' }))).toMatch(/10 MiB/);
  });

  it('requests an intent, uploads directly without auth headers, then verifies', async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce(presigned as never)
      .mockResolvedValueOnce(verified as never);
    vi.mocked(axios.put).mockResolvedValue({} as never);
    const onProgress = vi.fn();
    const onVerifying = vi.fn();
    const file = new File(['data'], 'image.png', { type: 'image/png' });

    const result = await assetUploadService.uploadImage(file, 'CATEGORY_IMAGE', onProgress, onVerifying);

    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/admin/catalog-uploads', {
      purpose: 'CATEGORY_IMAGE', originalFilename: 'image.png', contentType: 'image/png', sizeBytes: 4,
    });
    expect(axios.put).toHaveBeenCalledWith(presigned.uploadUrl, file, expect.objectContaining({
      headers: { 'Content-Type': 'image/png' },
    }));
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/admin/catalog-uploads/complete', { storageKey: presigned.storageKey });
    expect(onVerifying).toHaveBeenCalledOnce();
    expect(result).toEqual(verified);
  });

  it('rejects invalid files before creating an upload intent', async () => {
    const invalid = new File(['data'], 'image.gif', { type: 'image/gif' });

    await expect(assetUploadService.uploadImage(invalid, 'BRAND_LOGO', vi.fn(), vi.fn())).rejects.toThrow(/JPEG, PNG, or WebP/);
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('does not complete an asset when direct R2 upload fails', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(presigned as never);
    vi.mocked(axios.put).mockRejectedValueOnce(new Error('R2 unavailable'));

    await expect(assetUploadService.uploadImage(
      new File(['data'], 'image.png', { type: 'image/png' }), 'CATALOG_IMAGE', vi.fn(), vi.fn(),
    )).rejects.toThrow('R2 unavailable');
    expect(apiClient.post).toHaveBeenCalledOnce();
  });
});
