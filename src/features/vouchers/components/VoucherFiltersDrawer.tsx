import { useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { SoftDeleteFilter } from '@/shared/components/ui/SoftDeleteFilter';
import { Input } from '@/shared/components/ui/Input';
import type { VoucherListParams } from '../types/voucher.types';
import { SoftDeleteState } from '@/shared/types/api.types';

const ACTIVE_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

interface VoucherFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: VoucherListParams;
  onApply: (updates: Partial<VoucherListParams>) => void;
  onReset: () => void;
}

export function VoucherFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: VoucherFiltersDrawerProps) {
  const [local, setLocal] = useState<Partial<VoucherListParams>>({});

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

  const set = (updates: Partial<VoucherListParams>) =>
    setLocal((prev) => ({ ...prev, ...updates }));

  const activeValue =
    merged.active === true ? 'true' : merged.active === false ? 'false' : '';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Vouchers"
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
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            options={ACTIVE_OPTIONS}
            value={activeValue}
            onChange={(e) => {
              const val = e.target.value;
              set({
                active: val === 'true' ? true : val === 'false' ? false : undefined,
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Start Date (from)</label>
          <Input
            type="date"
            value={merged.dateFrom ?? ''}
            onChange={(e) => set({ dateFrom: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">End Date (to)</label>
          <Input
            type="date"
            value={merged.dateTo ?? ''}
            onChange={(e) => set({ dateTo: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Record Status</label>
          <SoftDeleteFilter
            value={merged.deletedState ?? SoftDeleteState.ACTIVE}
            onChange={(deletedState) => set({ deletedState })}
          />
        </div>
      </div>
    </Drawer>
  );
}
