import { useMemo, useState } from 'react';
import { Image, ImageOff, Link, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Toggle } from '@/shared/components/ui/Toggle';
import { getShortMediaName, getVariantLabel, sortMedia } from '../utils/productMedia';
import type { ProductMedia, ProductVariant } from '../types/product.types';

type MediaFilter = 'all' | 'product' | 'variant';

interface ProductMediaSectionProps {
  media: ProductMedia[];
  variants: ProductVariant[];
  disabled?: boolean;
}

const MEDIA_TYPE_OPTIONS = [
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
];

const FILTERS: Array<{ value: MediaFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'product', label: 'Product gallery' },
  { value: 'variant', label: 'Variant media' },
];

export function ProductMediaSection({ media, variants, disabled }: ProductMediaSectionProps) {
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [isAdding, setIsAdding] = useState(false);

  const productMedia = useMemo(
    () => sortMedia(media.filter((item) => item.variantId == null)),
    [media],
  );
  const variantMedia = useMemo(
    () => sortMedia(media.filter((item) => item.variantId != null)),
    [media],
  );
  const visibleMedia = filter === 'product'
    ? productMedia
    : filter === 'variant'
      ? variantMedia
      : sortMedia(media);

  const variantOptions = [
    { value: '', label: 'Product gallery' },
    ...variants.map((variant) => ({
      value: variant.id,
      label: variant.variantName || variant.sku,
    })),
  ];

  return (
    <section className="space-y-4 border-t border-gray-200 pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Product Media
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage product gallery and variant-specific images.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsAdding((value) => !value)}
          disabled={disabled}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add media
        </Button>
      </div>

      <div className="rounded-lg border border-info-200 bg-info-50 px-4 py-3 text-sm text-info-800">
        Product detail already returns media. Media create, update, remove, primary, and reorder
        actions are prepared in UI only until a ProductMedia write API is available.
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = item.value === filter;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={[
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
                active
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {isAdding && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_8rem_8rem]">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="product-media-url">
                Media URL
              </label>
              <Input id="product-media-url" placeholder="https://cdn.example.com/product.jpg" disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="product-media-type">
                Type
              </label>
              <Select id="product-media-type" options={MEDIA_TYPE_OPTIONS} value="IMAGE" disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="product-media-sort">
                Sort order
              </label>
              <Input id="product-media-sort" type="number" value="0" disabled />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="product-media-variant">
                Assigned to
              </label>
              <Select id="product-media-variant" options={variantOptions} value="" disabled />
            </div>
            <div className="flex items-end">
              <Toggle checked={false} onChange={() => undefined} disabled label="Set as primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" disabled>
              Save media
            </Button>
          </div>
        </div>
      )}

      {visibleMedia.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300">
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-4 text-gray-300">
              <Image className="h-10 w-10" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No media yet</h3>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Add product images to improve catalog preview and variant display.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={() => setIsAdding(true)}
              disabled={disabled}
            >
              Add media
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleMedia.map((item) => (
            <MediaItemCard
              key={item.id}
              media={item}
              variantLabel={getVariantLabel(variants, item.variantId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MediaItemCard({
  media,
  variantLabel,
}: {
  media: ProductMedia;
  variantLabel: string | null;
}) {
  const isImage = media.mediaType === 'IMAGE';

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
          {isImage && media.mediaUrl ? (
            <img src={media.mediaUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="h-5 w-5 text-gray-400" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {media.primary && <Badge variant="primary">Primary</Badge>}
            <Badge variant={variantLabel ? 'info' : 'default'}>
              {variantLabel ? `Variant: ${variantLabel}` : 'Product gallery'}
            </Badge>
            <Badge>{media.mediaType || 'IMAGE'}</Badge>
          </div>
          <p className="mt-2 truncate text-sm font-medium text-gray-900">
            {getShortMediaName(media.mediaUrl)}
          </p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500">
            <Link className="h-3 w-3 shrink-0" aria-hidden />
            {media.mediaUrl}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Sort order <span className="font-medium tabular-nums text-gray-700">{media.sortOrder}</span>
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">
        <Button type="button" variant="secondary" size="sm" disabled leftIcon={<Star className="h-4 w-4" />}>
          Set primary
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled leftIcon={<Pencil className="h-4 w-4" />}>
          Edit URL
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled leftIcon={<Trash2 className="h-4 w-4" />}>
          Remove
        </Button>
      </div>
    </article>
  );
}
