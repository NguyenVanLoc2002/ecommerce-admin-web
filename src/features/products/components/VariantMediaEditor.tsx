import { Image, ImageOff, Plus, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { getShortMediaName } from '../utils/productMedia';
import type { ProductMedia } from '../types/product.types';

interface VariantMediaEditorProps {
  media: ProductMedia[];
  disabled?: boolean;
}

const MEDIA_TYPE_OPTIONS = [
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
];

export function VariantMediaEditor({ media, disabled }: VariantMediaEditorProps) {
  return (
    <section className="space-y-4 border-t border-gray-200 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Variant media</h3>
          <p className="mt-1 text-xs text-gray-500">
            Images assigned here stay attached to this variant. Primary is still product-wide.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={disabled} leftIcon={<Plus className="h-4 w-4" />}>
          Add media
        </Button>
      </div>

      <div className="rounded-lg border border-info-200 bg-info-50 px-4 py-3 text-sm text-info-800">
        Variant media is displayed from Product detail. Write actions need ProductMedia API support.
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem_8rem]">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="variant-media-url">
              Media URL
            </label>
            <Input id="variant-media-url" placeholder="https://cdn.example.com/variant.jpg" disabled />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="variant-media-type">
              Type
            </label>
            <Select id="variant-media-type" options={MEDIA_TYPE_OPTIONS} value="IMAGE" disabled />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="variant-media-sort">
              Sort order
            </label>
            <Input id="variant-media-sort" type="number" value="0" disabled />
          </div>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300">
          <EmptyState
            icon={<Image className="h-10 w-10" />}
            title="No variant media"
            message="Add media when this variant needs its own color, size, or style image."
            className="py-8"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {media.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                {item.mediaType === 'IMAGE' && item.mediaUrl ? (
                  <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="h-4 w-4 text-gray-400" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  {item.primary && <Badge variant="primary">Product primary</Badge>}
                  <Badge>{item.mediaType || 'IMAGE'}</Badge>
                  <Badge>Sort {item.sortOrder}</Badge>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-gray-900">
                  {getShortMediaName(item.mediaUrl)}
                </p>
                <p className="truncate text-xs text-gray-500">{item.mediaUrl}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="secondary" size="icon-sm" disabled aria-label="Set as product primary">
                  <Star className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" disabled aria-label="Remove media">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
