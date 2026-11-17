import { useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import type { OrderPaymentStatus, OrderStatus, PaymentMethod } from '@/shared/types/enums';
import type { OrderListParams } from '../types/order.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'All methods' },
  { value: 'COD', label: 'Cash on delivery' },
  { value: 'ONLINE', label: 'Online' },
];

const SHIPMENT_STATUS_OPTIONS = [
  { value: '', label: 'All fulfillment statuses' },
  ...['PENDING', 'PICKING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED']
    .map((value) => ({ value, label: value.replace(/_/g, ' ') })),
];

interface OrderFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: OrderListParams;
  onApply: (updates: Partial<OrderListParams>) => void;
  onReset: () => void;
}

export function OrderFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: OrderFiltersDrawerProps) {
  const [local, setLocal] = useState<Partial<OrderListParams>>({});

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

  const set = (updates: Partial<OrderListParams>) =>
    setLocal((prev) => ({ ...prev, ...updates }));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Orders"
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
          <label htmlFor="filter-status" className="text-sm font-medium text-gray-700">Status</label>
          <Select
            id="filter-status"
            options={STATUS_OPTIONS}
            value={merged.status ?? ''}
            onChange={(e) =>
              set({ status: (e.target.value as OrderStatus) || undefined })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-payment-status" className="text-sm font-medium text-gray-700">Payment status</label>
          <Select
            id="filter-payment-status"
            options={PAYMENT_STATUS_OPTIONS}
            value={merged.paymentStatus ?? ''}
            onChange={(e) =>
              set({
                paymentStatus: (e.target.value as OrderPaymentStatus) || undefined,
              })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-payment-method" className="text-sm font-medium text-gray-700">Payment method</label>
          <Select id="filter-payment-method" options={PAYMENT_METHOD_OPTIONS}
            value={merged.paymentMethod ?? ''}
            onChange={(e) => set({ paymentMethod: (e.target.value as PaymentMethod) || undefined })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-shipment-status" className="text-sm font-medium text-gray-700">Fulfillment status</label>
          <Select id="filter-shipment-status" options={SHIPMENT_STATUS_OPTIONS}
            value={merged.shipmentStatus ?? ''}
            onChange={(e) => set({ shipmentStatus: e.target.value || undefined })} />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            Created from
            <input type="datetime-local" value={merged.createdFrom ?? ''}
              onChange={(e) => set({ createdFrom: e.target.value || undefined })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            Created to
            <input type="datetime-local" value={merged.createdTo ?? ''}
              onChange={(e) => set({ createdTo: e.target.value || undefined })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>
        </div>
      </div>
    </Drawer>
  );
}
