import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import type { ShipmentStatus } from '@/shared/types/enums';
import {
  updateStatusSchema,
  type UpdateStatusFormValues,
} from '../schemas/updateStatusSchema';

const ALLOWED_TRANSITIONS: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  PENDING: ['PICKING', 'FAILED'],
  PICKING: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED', 'RETURNED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED', 'RETURNED'],
  FAILED: ['IN_TRANSIT', 'RETURNED'],
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Pending',
  PICKING: 'Picking',
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
  const allowedStatuses = useMemo(
    () => ALLOWED_TRANSITIONS[currentStatus] ?? [],
    [currentStatus],
  );
  const statusOptions = useMemo(
    () =>
      allowedStatuses.map((status) => ({
        value: status,
        label: STATUS_LABELS[status],
      })),
    [allowedStatuses],
  );

  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: allowedStatuses[0],
      note: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ status: allowedStatuses[0], note: '' });
    }
  }, [allowedStatuses, form, open]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    form.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (isSubmitting) {
      return;
    }

    void form.handleSubmit(onSubmit)();
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
            <Button size="sm" isLoading={isSubmitting} onClick={handleSubmit}>
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
              disabled={isSubmitting}
            />
            <FormField
              name="note"
              label="Note"
              placeholder="Optional note about this status change..."
              multiline
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </FormProvider>
      )}
    </Modal>
  );
}
