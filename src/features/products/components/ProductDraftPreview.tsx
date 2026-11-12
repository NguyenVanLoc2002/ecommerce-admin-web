import { useWatch } from 'react-hook-form';
import { Badge } from '@/shared/components/ui/Badge';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import type { ProductFormValues } from '../schemas/productSchema';
import type { BrandOption, CategoryOption, Product } from '../types/product.types';

interface ProductDraftPreviewProps {
  product: Product;
  brands: BrandOption[];
  categories: CategoryOption[];
}

type ProductDraft = Required<Omit<ProductFormValues, 'brandId'>> & {
  brandId: string | null;
};

export function ProductDraftPreview({ product, brands, categories }: ProductDraftPreviewProps) {
  const values = useWatch<ProductFormValues>();
  const draft: ProductDraft = {
    name: values.name ?? product.name,
    slug: values.slug ?? product.slug,
    brandId: values.brandId ?? product.brand?.id ?? null,
    categoryIds: values.categoryIds ?? product.categories.map((category) => category.id),
    shortDescription: values.shortDescription ?? product.shortDescription ?? '',
    description: values.description ?? product.description ?? '',
    status: values.status ?? product.status,
    featured: values.featured ?? product.featured,
  };
  const changes = getChanges(product, draft);
  const brandName = brands.find((brand) => brand.id === draft.brandId)?.name ?? 'No brand assigned';
  const categoryNames = categories
    .filter((category) => draft.categoryIds.includes(category.id))
    .map((category) => category.name);

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-5" aria-label="Draft preview">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Draft preview</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Values here update before you save. Media is managed separately.
          </p>
        </div>
        {changes.length > 0 ? (
          <Badge variant="warning" className="shrink-0 whitespace-nowrap">
            {changes.length} unsaved
          </Badge>
        ) : (
          <Badge variant="default">Saved</Badge>
        )}
      </div>

      <div className="mt-5 border-t border-gray-200 pt-4">
        <p className="truncate text-base font-semibold text-gray-900">{draft.name || 'Untitled product'}</p>
        <p className="mt-1 truncate text-sm text-gray-500">{draft.slug || 'slug pending'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge type="product" status={draft.status} />
          {draft.featured && <Badge variant="warning">Featured</Badge>}
        </div>
      </div>

      <dl className="mt-5 space-y-3 border-t border-gray-200 pt-4 text-sm">
        <PreviewRow label="Brand" value={brandName} />
        <PreviewRow
          label="Categories"
          value={categoryNames.length > 0 ? categoryNames.join(', ') : 'No categories assigned'}
        />
        <PreviewRow label="Variants" value={`${product.activeVariantCount} active of ${product.variantCount}`} />
      </dl>

      {changes.length > 0 && (
        <div className="mt-5 border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Changed fields</h3>
          <p className="mt-2 text-sm leading-6 text-gray-700">{changes.join(', ')}</p>
        </div>
      )}
    </section>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="max-w-[11rem] text-right font-medium text-gray-800">{value}</dd>
    </div>
  );
}

function getChanges(product: Product, draft: ProductDraft): string[] {
  const previousCategories = product.categories.map((category) => category.id).sort().join(',');
  const draftCategories = [...draft.categoryIds].sort().join(',');

  return [
    product.name !== draft.name && 'Name',
    product.slug !== draft.slug && 'Slug',
    (product.brand?.id ?? null) !== draft.brandId && 'Brand',
    previousCategories !== draftCategories && 'Categories',
    (product.shortDescription ?? '') !== draft.shortDescription && 'Short description',
    (product.description ?? '') !== draft.description && 'Full description',
    product.status !== draft.status && 'Status',
    product.featured !== draft.featured && 'Featured',
  ].filter((label): label is string => Boolean(label));
}
