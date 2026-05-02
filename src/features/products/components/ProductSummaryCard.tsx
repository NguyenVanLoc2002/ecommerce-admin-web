import { Badge } from '@/shared/components/ui/Badge';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatDateTime } from '@/shared/utils/formatDate';
import type { Product } from '../types/product.types';

interface ProductSummaryCardProps {
  product: Product;
}

export function ProductSummaryCard({ product }: ProductSummaryCardProps) {
  const mediaCount = product.media.length;
  const categoryNames = product.categories.map((category) => category.name).filter(Boolean);
  const variantCount = product.variants.length || product.variantCount;
  const activeVariantCount = product.activeVariantCount
    || product.variants.filter((variant) => variant.status === 'ACTIVE').length;
  const primaryMedia = product.media.find((media) => media.primary) ?? product.media[0];

  return (
    <aside className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            {primaryMedia?.mediaUrl ? (
              <img
                src={primaryMedia.mediaUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                No media
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">{product.name}</p>
            <p className="mt-1 truncate text-sm text-gray-500">{product.slug}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge type="product" status={product.status} />
              {product.featured && <Badge variant="warning">Featured</Badge>}
            </div>
          </div>
        </div>

        {product.shortDescription && (
          <p className="mt-4 text-sm leading-6 text-gray-600">{product.shortDescription}</p>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Product Details
        </h2>

        <div className="mt-4 space-y-3">
          <DetailRow label="Brand" value={product.brand?.name || 'No brand assigned'} />
          <DetailRow
            label="Categories"
            value={categoryNames.length > 0 ? categoryNames.join(', ') : 'No categories assigned'}
          />
          <DetailRow label="Variants" value={`${activeVariantCount} active of ${variantCount}`} />
          <DetailRow label="Media" value={`${mediaCount} item${mediaCount === 1 ? '' : 's'}`} />
          <DetailRow label="Created" value={formatDateTime(product.createdAt)} />
          <DetailRow label="Updated" value={formatDateTime(product.updatedAt)} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Internal Reference
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Keep the UUID hidden by default, copy it only when needed for support or tracing.
            </p>
          </div>
          <CopyValueButton value={product.id} label="Copy ID" />
        </div>
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="max-w-[15rem] text-right text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}
