import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, Film, ImageOff, Layers, Pencil, Tag } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { NotFoundState } from '@/shared/components/feedback/NotFoundState';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useBreadcrumbLabel } from '@/shared/components/layout';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { AppError } from '@/shared/types/api.types';
import { formatDateTime } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/formatMoney';
import { useProduct } from '../hooks/useProduct';
import { useProductInventory } from '../hooks/useProductInventory';
import { ProductInventorySummary } from '../components/ProductInventorySummary';
import type { Product, ProductMedia, ProductVariant } from '../types/product.types';
import { getProductPreviewMedia, sortMedia } from '../utils/productMedia';

function getPriceRange(product: Product): string {
  if (product.minPrice == null && product.maxPrice == null) {
    return 'No price set';
  }

  if (product.minPrice == null || product.minPrice === product.maxPrice) {
    return formatMoney(product.maxPrice ?? product.minPrice ?? 0);
  }

  if (product.maxPrice == null) {
    return formatMoney(product.minPrice);
  }

  return `${formatMoney(product.minPrice)} – ${formatMoney(product.maxPrice)}`;
}

function VariantPrice({ variant }: { variant: ProductVariant }) {
  const price = variant.salePrice ?? variant.basePrice;

  return (
    <div className="text-right">
      <p className="font-medium tabular-nums text-gray-900">{formatMoney(price)}</p>
      {variant.salePrice != null && (
        <p className="mt-0.5 text-xs tabular-nums text-gray-400 line-through">
          {formatMoney(variant.basePrice)}
        </p>
      )}
    </div>
  );
}

function MediaThumbnail({ item }: { item: ProductMedia }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (item.mediaType !== 'IMAGE' || hasImageError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
        {item.mediaType === 'VIDEO' ? (
          <Film className="h-6 w-6" aria-hidden />
        ) : (
          <ImageOff className="h-6 w-6" aria-hidden />
        )}
        <span className="text-xs">{item.mediaType === 'VIDEO' ? 'Video' : 'Image unavailable'}</span>
      </div>
    );
  }

  return (
    <img
      src={item.mediaUrl}
      alt=""
      className="h-full w-full object-cover"
      onError={() => setHasImageError(true)}
    />
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ?? '';
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const {
    data: inventory,
    isLoading: isInventoryLoading,
    isError: isInventoryError,
    refetch: refetchInventory,
  } = useProductInventory(productId);
  const isNotFound = isError && error instanceof AppError && error.code === 'PRODUCT_NOT_FOUND';
  const [hasPrimaryImageError, setHasPrimaryImageError] = useState(false);
  const primaryMedia = product ? getProductPreviewMedia(product.media) : undefined;

  useEffect(() => {
    setHasPrimaryImageError(false);
  }, [product?.id, primaryMedia?.mediaUrl]);

  useBreadcrumbLabel(
    productId ? routes.products.detail(productId) : undefined,
    isNotFound ? 'Not found' : (product?.name ?? 'Loading...'),
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <SkeletonDetail />
        </div>
      </AdminLayout>
    );
  }

  if (isNotFound) {
    return (
      <AdminLayout>
        <div className="p-6">
          <NotFoundState
            title="Product Not Found"
            message="Product not found or has been deleted."
          />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !product) {
    return (
      <AdminLayout>
        <div className="p-6">
          <ErrorCard onRetry={() => void refetch()} />
        </div>
      </AdminLayout>
    );
  }

  const media = sortMedia(product.media);
  const variants = product.variants;
  const activeVariantCount =
    product.activeVariantCount ?? variants.filter((variant) => variant.status === 'ACTIVE').length;
  const hasPrimaryMedia = media.some((item) => item.primary);
  const activeVariantIds = new Set(
    variants.filter((variant) => variant.status === 'ACTIVE').map((variant) => variant.id),
  );
  const availableByVariant = new Map<string, number>();
  for (const level of inventory?.items ?? []) {
    availableByVariant.set(
      level.variantId,
      (availableByVariant.get(level.variantId) ?? 0) + level.available,
    );
  }
  const activeVariantsInStock = [...activeVariantIds].filter(
    (variantId) => (availableByVariant.get(variantId) ?? 0) > 0,
  ).length;
  const readinessItems = [
    {
      label: activeVariantCount > 0 ? 'Active variants available' : 'No active variants',
      ready: activeVariantCount > 0,
      actionLabel: 'Manage variants',
      onAction: () => navigate(routes.products.variants(product.id)),
    },
    {
      label: hasPrimaryMedia ? 'Primary media selected' : 'No primary media selected',
      ready: hasPrimaryMedia,
      actionLabel: 'Manage media',
      onAction: () => navigate(routes.products.edit(product.id)),
    },
    {
      label: product.minPrice != null || product.maxPrice != null ? 'Price available' : 'No price available',
      ready: product.minPrice != null || product.maxPrice != null,
      actionLabel: 'Manage variants',
      onAction: () => navigate(routes.products.variants(product.id)),
    },
  ];
  const readinessWarningCount = readinessItems.filter((item) => !item.ready).length;
  const inventoryCheck = isInventoryLoading
    ? { label: 'Checking inventory', variant: 'default' as const, dot: false }
    : isInventoryError
      ? { label: 'Inventory could not be verified', variant: 'info' as const, dot: true }
      : activeVariantsInStock > 0
        ? {
            label: `${activeVariantsInStock} active variant${activeVariantsInStock === 1 ? '' : 's'} in stock`,
            variant: 'success' as const,
            dot: true,
          }
        : { label: 'No active variants in stock', variant: 'warning' as const, dot: true };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
        <PageHeader
          title={product.name}
          description="Catalog summary, sellability checks, and product configuration."
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Layers className="h-4 w-4" />}
                onClick={() => navigate(routes.products.variants(product.id))}
              >
                Manage variants
              </Button>
              <Button
                size="sm"
                leftIcon={<Pencil className="h-4 w-4" />}
                onClick={() => navigate(routes.products.edit(product.id))}
              >
                Edit product
              </Button>
            </>
          }
        />

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid lg:grid-cols-[17rem_minmax(0,1fr)]">
            <div className="flex min-h-56 items-center justify-center bg-gray-100">
              {primaryMedia?.mediaUrl && !hasPrimaryImageError ? (
                <img
                  src={primaryMedia.mediaUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={() => setHasPrimaryImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageOff className="h-8 w-8" aria-hidden />
                  <span className="text-sm">No preview image</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-sm text-gray-500">{product.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge type="product" status={product.status} />
                  {product.featured && <Badge variant="warning">Featured</Badge>}
                </div>
              </div>

              {product.shortDescription && (
                <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-600">
                  {product.shortDescription}
                </p>
              )}

              <dl className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Price range
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-gray-900">
                    {getPriceRange(product)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Variants
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {activeVariantCount} active of {product.variantCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Media
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {media.length} item{media.length === 1 ? '' : 's'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section
          className={
            readinessWarningCount > 0
              ? 'rounded-xl border border-warning-200 bg-warning-50 p-5'
              : 'rounded-xl border border-success-200 bg-success-50 p-5'
          }
          aria-labelledby="catalog-readiness-heading"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                {readinessWarningCount > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-warning-700" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-success-700" aria-hidden />
                )}
                <h2 id="catalog-readiness-heading" className="text-sm font-semibold text-gray-900">
                  Sellability readiness
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {readinessWarningCount > 0
                  ? `${readinessWarningCount} item${readinessWarningCount === 1 ? '' : 's'} need attention before this product is ready to sell.`
                  : 'The catalog information required to sell this product is in place.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {readinessItems.map((item) => (
                item.ready ? (
                  <Badge key={item.label} variant="success" dot>
                    {item.label}
                  </Badge>
                ) : (
                  <Button
                    key={item.label}
                    variant="secondary"
                    size="sm"
                    onClick={item.onAction}
                    rightIcon={<ChevronRight className="h-4 w-4" aria-hidden />}
                  >
                    {item.actionLabel}
                  </Button>
                )
              ))}
              <Badge variant={inventoryCheck.variant} dot={inventoryCheck.dot}>
                {inventoryCheck.label}
              </Badge>
            </div>
          </div>
        </section>

        <ProductInventorySummary
          variants={variants}
          inventory={inventory}
          isLoading={isInventoryLoading}
          isError={isInventoryError}
          onRetry={() => void refetchInventory()}
          onViewInventory={() =>
            navigate(`${routes.inventory.stock}?stock.productId=${encodeURIComponent(product.id)}`)
          }
        />

        <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">Description</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                {product.description || 'No full description has been added.'}
              </p>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Variants</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {variants.length > 5
                      ? `Showing 5 of ${product.variantCount} sellable options and their current pricing.`
                      : 'Sellable options and their current pricing.'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(routes.products.variants(product.id))}
                >
                  View all
                </Button>
              </div>
              {variants.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Layers className="mx-auto h-7 w-7 text-gray-300" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-gray-700">No variants yet</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a variant to make this product purchasable.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {variants.slice(0, 5).map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => navigate(routes.products.variants(product.id))}
                      className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                      aria-label={`Manage variant ${variant.variantName}`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {variant.variantName}
                          </p>
                          <StatusBadge type="variant" status={variant.status} />
                        </div>
                        <p className="mt-1 truncate font-mono text-xs text-gray-400">
                          {variant.sku}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <VariantPrice variant={variant} />
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Media</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Showing {Math.min(media.length, 12)} of {media.length} linked images and videos.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(routes.products.edit(product.id))}
                >
                  Manage media
                </Button>
              </div>
              {media.length === 0 ? (
                <p className="mt-5 text-sm text-gray-500">No media has been added.</p>
              ) : (
                <>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {media.slice(0, 12).map((item) => (
                    <a
                      key={item.id}
                      href={item.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${item.mediaType.toLowerCase()} media in a new tab`}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                      <MediaThumbnail item={item} />
                      {item.primary && (
                        <Badge className="absolute left-2 top-2" variant="primary">
                          Primary
                        </Badge>
                      )}
                    </a>
                  ))}
                </div>
                {media.length > 12 && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="link" size="sm" onClick={() => navigate(routes.products.edit(product.id))}>
                      View all media ({media.length})
                    </Button>
                  </div>
                )}
                </>
              )}
            </section>
          </div>

          <aside className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Catalog placement</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Brand</dt>
                <dd className="mt-1 font-medium text-gray-800">
                  {product.brand?.name || 'No brand assigned'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Categories
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {product.categories.length > 0 ? (
                    product.categories.map((category) => (
                      <Badge key={category.id} variant="default">
                        {category.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">No categories assigned</span>
                  )}
                </dd>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Created
                </dt>
                <dd className="mt-1 text-gray-700">{formatDateTime(product.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Last updated
                </dt>
                <dd className="mt-1 text-gray-700">{formatDateTime(product.updatedAt)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Tag className="h-4 w-4" aria-hidden />
                Internal ID
              </div>
              <CopyValueButton value={product.id} label="Copy ID" />
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
