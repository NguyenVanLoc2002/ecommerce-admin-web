import { useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { Input } from '@/shared/components/ui/Input';
import type { ShipmentListParams } from '../types/shipment.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'RETURNED', label: 'Returned' },
];

interface ShipmentFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ShipmentListParams;
  onApply: (updates: Partial<ShipmentListParams>) => void;
  onReset: () => void;
}

export function ShipmentFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: ShipmentFiltersDrawerProps) {
  const [local, setLocal] = useState<Partial<ShipmentListParams>>({});

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

  const set = (updates: Partial<ShipmentListParams>) =>
    setLocal((prev) => ({ ...prev, ...updates }));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Shipments"
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
            options={STATUS_OPTIONS}
            value={merged.status ?? ''}
            onChange={(e) => set({ status: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Order code</label>
          <Input
            type="text"
            placeholder="e.g. ORD20260420001"
            value={merged.orderCode ?? ''}
            onChange={(e) => set({ orderCode: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Carrier</label>
          <Input
            type="text"
            placeholder="e.g. GHTK"
            value={merged.carrier ?? ''}
            onChange={(e) => set({ carrier: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">From date</label>
          <Input
            type="date"
            value={merged.dateFrom ?? ''}
            onChange={(e) => set({ dateFrom: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">To date</label>
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
