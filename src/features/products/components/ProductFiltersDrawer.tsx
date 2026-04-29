import { useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import type { ProductListParams } from '../types/product.types';
import type { MultiSelectOption } from '@/shared/components/ui/MultiSelectDropdown';
import { MultiSelectDropdown } from '@/shared/components/ui/MultiSelectDropdown';

const STATUS_OPTIONS = [
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
  brandOptions: MultiSelectOption[];
  onApply: (updates: Partial<ProductListParams>) => void;
  onReset: () => void;
}

export function ProductFiltersDrawer({
  open,
  onClose,
  filters,
  brandOptions,
  onApply,
  onReset,
}: ProductFiltersDrawerProps) {
  const [localStatus, setLocalStatus] = useState<string[]>(
    filters.status ? filters.status.split(',') : [],
  );
  const [localBrandId, setLocalBrandId] = useState<string>(
    filters.brandId ? String(filters.brandId) : '',
  );
  const [localFeatured, setLocalFeatured] = useState<string>(filters.featured ?? '');

  const handleApply = () => {
    onApply({
      status: localStatus.length > 0 ? localStatus.join(',') : undefined,
      brandId: localBrandId || undefined,
      featured: localFeatured || undefined,
      page: 0,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStatus([]);
    setLocalBrandId('');
    setLocalFeatured('');
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
          <MultiSelectDropdown
            options={STATUS_OPTIONS}
            value={localStatus}
            onChange={(v) => setLocalStatus(v as string[])}
            placeholder="Any status"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Brand</label>
          <Select
            options={[{ value: '', label: 'Any brand' }, ...brandOptions.map((b) => ({ value: String(b.value), label: b.label }))]}
            value={localBrandId}
            onChange={(e) => setLocalBrandId(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Featured</label>
          <Select
            options={FEATURED_OPTIONS}
            value={localFeatured}
            onChange={(e) => setLocalFeatured(e.target.value)}
          />
        </div>
      </div>
    </Drawer>
  );
}
