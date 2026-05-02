import { useEffect, useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import type { InvoiceStatus } from '@/shared/types/enums';
import type { InvoiceListParams } from '../types/invoice.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'PAID', label: 'Paid' },
  { value: 'VOIDED', label: 'Voided' },
];

interface InvoiceFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: InvoiceListParams;
  onApply: (updates: Partial<InvoiceListParams>) => void;
  onReset: () => void;
}

export function InvoiceFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: InvoiceFiltersDrawerProps) {
  const [local, setLocal] = useState<Partial<InvoiceListParams>>({});
  const merged = { ...filters, ...local };

  useEffect(() => {
    if (!open) {
      setLocal({});
      return;
    }

    setLocal({
      invoiceCode: filters.invoiceCode,
      orderCode: filters.orderCode,
      status: filters.status,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.invoiceCode,
    filters.orderCode,
    filters.status,
    open,
  ]);

  const set = (updates: Partial<InvoiceListParams>) =>
    setLocal((prev) => ({ ...prev, ...updates }));

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

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Invoices"
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
          <label className="text-sm font-medium text-gray-700">Invoice code</label>
          <Input
            value={merged.invoiceCode ?? ''}
            onChange={(e) => set({ invoiceCode: e.target.value || undefined })}
            placeholder="Search by invoice code"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Order code</label>
          <Input
            value={merged.orderCode ?? ''}
            onChange={(e) => set({ orderCode: e.target.value || undefined })}
            placeholder="Search by order code"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            options={STATUS_OPTIONS}
            value={merged.status ?? ''}
            onChange={(e) => set({ status: (e.target.value as InvoiceStatus) || undefined })}
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
