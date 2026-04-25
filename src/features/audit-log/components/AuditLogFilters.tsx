import { useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { Input } from '@/shared/components/ui/Input';
import { AuditAction } from '@/shared/types/enums';
import type { AuditLogListParams } from '../types/auditLog.types';

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: AuditAction.ORDER_CREATED, label: 'Order Created' },
  { value: AuditAction.ORDER_CONFIRMED, label: 'Order Confirmed' },
  { value: AuditAction.ORDER_CANCELLED, label: 'Order Cancelled' },
  { value: AuditAction.ORDER_COMPLETED, label: 'Order Completed' },
  { value: AuditAction.PRODUCT_CREATED, label: 'Product Created' },
  { value: AuditAction.PRODUCT_UPDATED, label: 'Product Updated' },
  { value: AuditAction.PRODUCT_DELETED, label: 'Product Deleted' },
  { value: AuditAction.STOCK_IMPORTED, label: 'Stock Imported' },
  { value: AuditAction.STOCK_ADJUSTED, label: 'Stock Adjusted' },
  { value: AuditAction.VOUCHER_CREATED, label: 'Voucher Created' },
  { value: AuditAction.VOUCHER_UPDATED, label: 'Voucher Updated' },
  { value: AuditAction.VOUCHER_DELETED, label: 'Voucher Deleted' },
  { value: AuditAction.PAYMENT_COMPLETED, label: 'Payment Completed' },
  { value: AuditAction.REVIEW_MODERATED, label: 'Review Moderated' },
  { value: AuditAction.USER_DISABLED, label: 'User Disabled' },
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
            onChange={(e) =>
              set({
                action: (e.target.value as AuditLogListParams['action']) || undefined,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Entity Type</label>
          <Select
            options={ENTITY_TYPE_OPTIONS}
            value={merged.entityType ?? ''}
            onChange={(e) => set({ entityType: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Performed By</label>
          <Input
            type="text"
            value={merged.performedBy ?? ''}
            onChange={(e) => set({ performedBy: e.target.value || undefined })}
            placeholder="Admin username or email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">From Date</label>
          <Input
            type="date"
            value={merged.from ?? ''}
            onChange={(e) => set({ from: e.target.value || undefined })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">To Date</label>
          <Input
            type="date"
            value={merged.to ?? ''}
            onChange={(e) => set({ to: e.target.value || undefined })}
          />
        </div>
      </div>
    </Drawer>
  );
}
