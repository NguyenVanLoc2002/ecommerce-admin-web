import { useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Select, type SelectOption } from '@/shared/components/ui/Select';
import { Input } from '@/shared/components/ui/Input';
import { AuditAction } from '@/shared/types/enums';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import type { AuditLogListParams } from '../types/auditLog.types';

const ACTION_OPTIONS: SelectOption[] = [
  { value: '', label: 'All actions' },
  ...Object.values(AuditAction).map((value) => ({
    value,
    label: formatEnumLabel(value),
  })),
];

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'All entity types' },
  { value: 'ORDER', label: 'Order' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'STOCK', label: 'Stock' },
  { value: 'VOUCHER', label: 'Voucher' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'USER', label: 'User' },
];

interface AuditLogFiltersProps {
  open: boolean;
  onClose: () => void;
  filters: AuditLogListParams;
  onApply: (updates: Partial<AuditLogListParams>) => void;
  onReset: () => void;
}

export function AuditLogFilters({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: AuditLogFiltersProps) {
  const [local, setLocal] = useState<Partial<AuditLogListParams>>({});

  const merged = { ...filters, ...local };

  const set = (updates: Partial<AuditLogListParams>) =>
    setLocal((previous) => ({ ...previous, ...updates }));

  const setAndApply = (updates: Partial<AuditLogListParams>) => {
    set(updates);
    onApply(updates);
  };

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
      title="Filter Audit Log"
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
          <label className="text-sm font-medium text-gray-700">Action</label>
          <Select
            options={ACTION_OPTIONS}
            value={merged.action ?? ''}
            onChange={(event) =>
              setAndApply({
                action: (event.target.value as AuditLogListParams['action']) || undefined,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Entity Type</label>
          <Select
            options={ENTITY_TYPE_OPTIONS}
            value={merged.entityType ?? ''}
            onChange={(event) => setAndApply({ entityType: event.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Entity ID</label>
          <Input
            type="text"
            value={merged.entityId ?? ''}
            onChange={(event) => set({ entityId: event.target.value || undefined })}
            placeholder="UUID"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Actor</label>
          <Input
            type="text"
            value={merged.actor ?? ''}
            onChange={(event) => set({ actor: event.target.value || undefined })}
            placeholder="Admin username or email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">From Date</label>
          <Input
            type="date"
            value={merged.fromDate ?? ''}
            onChange={(event) => set({ fromDate: event.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">To Date</label>
          <Input
            type="date"
            value={merged.toDate ?? ''}
            onChange={(event) => set({ toDate: event.target.value || undefined })}
          />
        </div>
      </div>
    </Drawer>
  );
}
