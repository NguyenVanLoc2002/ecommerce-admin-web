import { useEffect, useState } from 'react';
import { ImageOff, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useAssetUpload } from './useAssetUpload';
import type { AssetPurpose, VerifiedAsset } from './assetUploadService';

interface ImageUploadFieldProps {
  purpose: AssetPurpose;
  label: string;
  url: string | null | undefined;
  storageKey: string | null | undefined;
  disabled?: boolean;
  onChange: (asset: Pick<VerifiedAsset, 'storageKey' | 'mediaUrl'> | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export function ImageUploadField({ purpose, label, url, storageKey, disabled, onChange, onUploadingChange }: ImageUploadFieldProps) {
  const { selectedFile: file, status, progress, error, selectFile: chooseFile, upload: uploadFile, reset } = useAssetUpload(purpose);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => setPreviewFailed(false), [previewUrl, url]);

  useEffect(() => {
    onUploadingChange?.(status === 'uploading' || status === 'verifying');
  }, [onUploadingChange, status]);

  const selectFile = (selected: File | null) => {
    chooseFile(selected);
    if (selected) {
      void uploadFile(selected)
        .then((asset) => onChange({ storageKey: asset.storageKey, mediaUrl: asset.mediaUrl }))
        .catch(() => undefined);
    }
  };

  const clearAsset = () => {
    reset();
    setPreviewUrl(null);
    onChange(null);
  };

  const imageUrl = previewUrl ?? url ?? null;

  return (
    <div className="space-y-3 rounded-md border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-500">JPEG, PNG or WebP · max 10 MiB. Legacy external URLs remain supported.</p>
        </div>
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
          {status === 'uploading' || status === 'verifying' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Choose image
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || status === 'uploading' || status === 'verifying'} onChange={(event) => selectFile(event.target.files?.[0] ?? null)} />
        </label>
      </div>

      {imageUrl && !previewFailed ? (
        <div className="flex items-center gap-3">
          <img src={imageUrl} alt={`${label} preview`} className="h-16 w-16 rounded border border-gray-200 object-contain" onError={() => setPreviewFailed(true)} />
          <div className="min-w-0 flex-1 text-xs text-gray-600">
            <p>{storageKey ? (status === 'verified' ? 'Uploaded and verified; save the form to attach.' : 'Managed R2 image') : 'External image URL'}</p>
            {storageKey && <p className="truncate font-mono">{storageKey}</p>}
          </div>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${label.toLowerCase()}`} disabled={disabled || status === 'uploading' || status === 'verifying'} onClick={clearAsset}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ) : <div className="flex items-center gap-2 text-xs text-gray-500"><ImageOff className="h-4 w-4" />{imageUrl ? 'Image preview failed to load.' : 'No image selected.'}</div>}

      {status === 'uploading' && <p role="status" className="text-xs text-info-700">Uploading… {progress}%</p>}
      {status === 'verifying' && <p role="status" className="text-xs text-info-700">Verifying image…</p>}
      {status === 'verified' && <p role="status" className="text-xs text-success-700">Upload verified. Save the form to attach this image.</p>}
      {status === 'error' && <div className="flex items-center justify-between gap-3"><p role="alert" className="text-xs text-danger-600">{error}</p><Button type="button" size="sm" variant="secondary" onClick={() => file && void uploadFile(file).then((asset) => onChange({ storageKey: asset.storageKey, mediaUrl: asset.mediaUrl })).catch(() => undefined)}>Retry</Button></div>}

      <label className="block space-y-1 text-xs text-gray-600">
        <span>Or use an existing external URL</span>
        <input className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm" type="url" value={url ?? ''} disabled={disabled || Boolean(storageKey) || status === 'uploading' || status === 'verifying'} placeholder="https://example.com/image.jpg" onChange={(event) => { reset(); onChange(event.target.value ? { storageKey: '', mediaUrl: event.target.value } : null); }} />
      </label>
      {storageKey && <p className="text-xs text-gray-500">To switch to a legacy URL, remove the managed image first.</p>}
    </div>
  );
}
