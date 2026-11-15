import { useCallback, useState } from 'react';
import { assetUploadService, validateImageFile, type AssetPurpose, type VerifiedAsset } from './assetUploadService';

export type AssetUploadStatus = 'idle' | 'uploading' | 'verifying' | 'verified' | 'error';

export function useAssetUpload(purpose: AssetPurpose) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [asset, setAsset] = useState<VerifiedAsset | null>(null);
  const [status, setStatus] = useState<AssetUploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback((file: File | null) => {
    setSelectedFile(file);
    setAsset(null);
    setProgress(0);
    const validationError = file ? validateImageFile(file) : null;
    setError(validationError);
    setStatus(validationError ? 'error' : 'idle');
  }, []);

  const upload = useCallback(async (file = selectedFile) => {
    if (!file) throw new Error('Choose an image before uploading.');
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      setStatus('error');
      throw new Error(validationError);
    }

    setStatus('uploading');
    setProgress(0);
    setError(null);
    try {
      const uploaded = await assetUploadService.uploadImage(
        file,
        purpose,
        setProgress,
        () => setStatus('verifying'),
      );
      setAsset(uploaded);
      setStatus('verified');
      return uploaded;
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : 'Image upload failed. Please try again.');
      throw cause;
    }
  }, [purpose, selectedFile]);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setAsset(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { selectedFile, asset, status, progress, error, selectFile, upload, reset };
}
