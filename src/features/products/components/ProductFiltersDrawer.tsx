import { useEffect, useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { SoftDeleteFilter } from '@/shared/components/ui/SoftDeleteFilter';
import type { ProductListParams } from '../types/product.types';
import type { MultiSelectOption } from '@/shared/components/ui/MultiSelectDropdown';
import { SoftDeleteState } from '@/shared/types/api.types';

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const FEATURED_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Featured only' },
  { value: 'false', label: 'Not featured' },
];

interface ProductFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ProductListParams;
  categoryOptions: MultiSelectOption[];
  brandOptions: MultiSelectOption[];
  onApply: (updates: Partial<ProductListParams>) => void;
  onReset: () => void;
}

export function ProductFiltersDrawer({
  open,
  onClose,
  filters,
  categoryOptions,
  brandOptions,
  onApply,
  onReset,
}: ProductFiltersDrawerProps) {
  const [localStatus, setLocalStatus] = useState<ProductListParams['status'] | ''>(
    filters.status ?? '',
  );
  const [localCategoryId, setLocalCategoryId] = useState<string>(
    filters.categoryId ? String(filters.categoryId) : '',
  );
  const [localBrandId, setLocalBrandId] = useState<string>(
    filters.brandId ? String(filters.brandId) : '',
  );
  const [localFeatured, setLocalFeatured] = useState<string>(
    typeof filters.featured === 'boolean' ? String(filters.featured) : '',
  );
  const [localMinPrice, setLocalMinPrice] = useState<string>(
    filters.minPrice != null ? String(filters.minPrice) : '',
  );
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(
    filters.maxPrice != null ? String(filters.maxPrice) : '',
  );
  const [localDeletedState, setLocalDeletedState] = useState(
    filters.deletedState ?? SoftDeleteState.ACTIVE,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setLocalStatus(filters.status ?? '');
    setLocalCategoryId(filters.categoryId ? String(filters.categoryId) : '');
    setLocalBrandId(filters.brandId ? String(filters.brandId) : '');
    setLocalFeatured(typeof filters.featured === 'boolean' ? String(filters.featured) : '');
    setLocalMinPrice(filters.minPrice != null ? String(filters.minPrice) : '');
    setLocalMaxPrice(filters.maxPrice != null ? String(filters.maxPrice) : '');
    setLocalDeletedState(filters.deletedState ?? SoftDeleteState.ACTIVE);
  }, [filters, open]);

  const handleApply = () => {
    onApply({
      status: localStatus || undefined,
      categoryId: localCategoryId || undefined,
      brandId: localBrandId || undefined,
      featured: parseOptionalBoolean(localFeatured),
      minPrice: parseOptionalNumber(localMinPrice),
      maxPrice: parseOptionalNumber(localMaxPrice),
      deletedState: localDeletedState,
      page: 0,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStatus('');
    setLocalCategoryId('');
    setLocalBrandId('');
    setLocalFeatured('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalDeletedState(SoftDeleteState.ACTIVE);
    onReset();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Products"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply filters</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            options={STATUS_OPTIONS}
            value={localStatus}
            onChange={(event) => setLocalStatus(event.target.value as ProductListParams['status'] | '')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Select
            options={[
              { value: '', label: 'Any category' },
              ...categoryOptions.map((category) => ({
                value: String(category.value),
                label: category.label,
              })),
            ]}
            value={localCategoryId}
            onChange={(event) => setLocalCategoryId(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Brand</label>
          <Select
            options={[
              { value: '', label: 'Any brand' },
              ...brandOptions.map((brand) => ({
                value: String(brand.value),
                label: brand.label,
              })),
            ]}
            value={localBrandId}
            onChange={(event) => setLocalBrandId(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Featured</label>
          <Select
            options={FEATURED_OPTIONS}
            value={localFeatured}
            onChange={(event) => setLocalFeatured(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Min price</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={localMinPrice}
              onChange={(event) => setLocalMinPrice(event.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Max price</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={localMaxPrice}
              onChange={(event) => setLocalMaxPrice(event.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
          Price filters match a single variant on the backend.
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Record Status</label>
          <SoftDeleteFilter value={localDeletedState} onChange={setLocalDeletedState} />
        </div>
      </div>
    </Drawer>
  );
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalBoolean(value: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}
