import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { FormField } from '@/shared/components/form/FormField';
import type { ShipmentStatus } from '@/shared/types/enums';
import {
  updateStatusSchema,
  type UpdateStatusFormValues,
} from '../schemas/updateStatusSchema';

const ALLOWED_TRANSITIONS: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  PENDING: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED', 'RETURNED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED', 'RETURNED'],
  FAILED: ['IN_TRANSIT', 'RETURNED'],
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  RETURNED: 'Returned',
};

interface ShipmentStatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  currentStatus: ShipmentStatus;
  isSubmitting: boolean;
  onSubmit: (values: UpdateStatusFormValues) => void;
}

export function ShipmentStatusUpdateModal({
  open,
  onClose,
  currentStatus,
  isSubmitting,
  onSubmit,
}: ShipmentStatusUpdateModalProps) {
  const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  const statusOptions = allowedStatuses.map((s) => ({
    value: s,
    label: STATUS_LABELS[s],
  }));

  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: allowedStatuses[0],
      note: '',
    },
  });

  // Reset form when reopened so stale values don't persist across sessions.
  useEffect(() => {
    if (open) {
      form.reset({ status: allowedStatuses[0], note: '' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    if (isSubmitting) return;
    form.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Update Shipment Status"
      description={`Current: ${STATUS_LABELS[currentStatus]}`}
      size="sm"
      closeOnBackdropClick={!isSubmitting}
      footer={
        allowedStatuses.length > 0 ? (
          <>
            <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              Update Status
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Close
          </Button>
        )
      }
    >
      {allowedStatuses.length === 0 ? (
        <p className="text-sm text-gray-500">
          No further transitions are available for this shipment.
        </p>
      ) : (
        <FormProvider {...form}>
          <div className="space-y-4">
            <FormSelect
              name="status"
              label="New Status"
              required
              options={statusOptions}
            />
            <FormField
              name="note"
              label="Note"
              placeholder="Optional note about this status change…"
              multiline
              rows={3}
            />
          </div>
        </FormProvider>
      )}
    </Modal>
  );
}
