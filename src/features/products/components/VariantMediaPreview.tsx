import { ImageOff } from 'lucide-react';
import { getShortMediaName } from '../utils/productMedia';
import type { ProductMedia } from '../types/product.types';

interface VariantMediaPreviewProps {
  media: ProductMedia[];
}

export function VariantMediaPreview({ media }: VariantMediaPreviewProps) {
  const firstMedia = media[0];

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
        {firstMedia?.mediaType === 'IMAGE' && firstMedia.mediaUrl ? (
          <img src={firstMedia.mediaUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-4 w-4 text-gray-400" aria-hidden />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {media.length > 0 ? `${media.length} media` : 'No media'}
        </p>
        {firstMedia && (
          <p className="max-w-[11rem] truncate text-xs text-gray-500">
            {getShortMediaName(firstMedia.mediaUrl)}
          </p>
        )}
      </div>
    </div>
  );
}
