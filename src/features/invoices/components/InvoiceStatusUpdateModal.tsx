import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import type { InvoiceStatus } from '@/shared/types/enums';
import {
  INVOICE_STATUS_VALUES,
  updateInvoiceStatusSchema,
  type UpdateInvoiceStatusFormValues,
} from '../schemas/updateInvoiceStatusSchema';

const STATUS_OPTIONS = INVOICE_STATUS_VALUES.map((status) => ({
  value: status,
  label: formatEnumLabel(status),
}));

interface InvoiceStatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  currentStatus: InvoiceStatus;
  currentNotes: string | null;
  isSubmitting: boolean;
  onSubmit: (values: UpdateInvoiceStatusFormValues) => void;
}

export function InvoiceStatusUpdateModal({
  open,
  onClose,
  currentStatus,
  currentNotes,
  isSubmitting,
  onSubmit,
}: InvoiceStatusUpdateModalProps) {
  const form = useForm<UpdateInvoiceStatusFormValues>({
    resolver: zodResolver(updateInvoiceStatusSchema),
    defaultValues: {
      status: currentStatus,
      notes: currentNotes ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        status: currentStatus,
        notes: currentNotes ?? '',
      });
    }
  }, [currentNotes, currentStatus, form, open]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    form.reset({
      status: currentStatus,
      notes: currentNotes ?? '',
    });
    onClose();
  };

  const handleSaveClick = () => {
    void form.handleSubmit(onSubmit)();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Update Invoice Status"
      description={`Current status: ${formatEnumLabel(currentStatus)}`}
      size="sm"
      closeOnBackdropClick={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" isLoading={isSubmitting} onClick={handleSaveClick}>
            Save status
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <div className="space-y-4">
          <FormSelect
            name="status"
            label="Status"
            required
            options={STATUS_OPTIONS}
          />
          <FormField
            name="notes"
            label="Notes"
            placeholder="Optional note for this invoice status update"
            multiline
            rows={4}
            hint="Up to 1000 characters."
          />
        </div>
      </FormProvider>
    </Modal>
  );
}
