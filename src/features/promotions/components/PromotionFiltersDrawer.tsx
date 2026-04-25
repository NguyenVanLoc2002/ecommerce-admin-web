import { useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { Input } from '@/shared/components/ui/Input';
import type { PromotionListParams } from '../types/promotion.types';

const SCOPE_OPTIONS = [
  { value: '', label: 'All scopes' },
  { value: 'ALL', label: 'All orders' },
  { value: 'CATEGORY', label: 'Category' },
  { value: 'BRAND', label: 'Brand' },
  { value: 'PRODUCT', label: 'Product' },
];

const ACTIVE_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

interface PromotionFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: PromotionListParams;
  onApply: (updates: Partial<PromotionListParams>) => void;
  onReset: () => void;
}

export function PromotionFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: PromotionFiltersDrawerProps) {
  const [local, setLocal] = useState<Partial<PromotionListParams>>({});

  const merged = { ...filters, ...local };

  const handleApply = () => {
    onApply(local);
    setLocal({});
    onClose();
  };

  const handleReset = () => {
    setLocal({});
    onReset();
    onClose();
  };

  const set = (updates: Partial<PromotionListParams>) =>
    setLocal((prev) => ({ ...prev, ...updates }));

  const activeValue =
    merged.active === undefined ? '' : merged.active === true ? 'true' : 'false';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Promotions"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply filters
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <Input
            placeholder="Search by name…"
            value={merged.name ?? ''}
            onChange={(e) => set({ name: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Scope</label>
          <Select
            options={SCOPE_OPTIONS}
            value={merged.scope ?? ''}
            onChange={(e) => set({ scope: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            options={ACTIVE_OPTIONS}
            value={activeValue}
            onChange={(e) => {
              const val = e.target.value;
              set({ active: val === '' ? undefined : val === 'true' });
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Start date from</label>
          <Input
            type="date"
            value={merged.dateFrom ?? ''}
            onChange={(e) => set({ dateFrom: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Start date to</label>
          <Input
            type="date"
            value={merged.dateTo ?? ''}
            onChange={(e) => set({ dateTo: e.target.value || undefined })}
          />
        </div>
      </div>
    </Drawer>
  );
}
