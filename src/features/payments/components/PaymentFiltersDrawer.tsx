import { useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { Input } from '@/shared/components/ui/Input';
import type { PaymentMethod, PaymentStatus } from '@/shared/types/enums';
import type { PaymentListParams } from '../types/payment.types';

const METHOD_OPTIONS = [
  { value: '', label: 'All methods' },
  { value: 'COD', label: 'COD' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'MOMO', label: 'MoMo' },
  { value: 'ZALO_PAY', label: 'ZaloPay' },
  { value: 'VNPAY', label: 'VNPay' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'INITIATED', label: 'Initiated' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

interface PaymentFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: PaymentListParams;
  onApply: (updates: Partial<PaymentListParams>) => void;
  onReset: () => void;
}

export function PaymentFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: PaymentFiltersDrawerProps) {
  const [local, setLocal] = useState<Partial<PaymentListParams>>({});

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

  const set = (updates: Partial<PaymentListParams>) =>
    setLocal((prev) => ({ ...prev, ...updates }));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Payments"
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
          <label className="text-sm font-medium text-gray-700">Method</label>
          <Select
            options={METHOD_OPTIONS}
            value={merged.method ?? ''}
            onChange={(e) =>
              set({ method: (e.target.value as PaymentMethod) || undefined })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            options={STATUS_OPTIONS}
            value={merged.status ?? ''}
            onChange={(e) =>
              set({ status: (e.target.value as PaymentStatus) || undefined })
            }
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
