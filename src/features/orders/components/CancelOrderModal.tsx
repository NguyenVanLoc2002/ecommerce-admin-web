import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { FormField } from '@/shared/components/form/FormField';

const cancelOrderSchema = z.object({ reason: z.string().trim().min(1).max(500) });

interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (reason: string) => void;
}

export function CancelOrderModal({ open, onClose, isSubmitting, onSubmit }: CancelOrderModalProps) {
  const form = useForm<{ reason: string }>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: { reason: 'Operator requested order cancellation' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) form.reset({ reason: 'Operator requested order cancellation' });
  }, [form, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel order?"
      description="The backend will coordinate shipment cancellation. If the carrier result is unknown, the order stays active until reconciliation. Paid orders are not refunded automatically."
      size="md"
      closeOnBackdropClick={false}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Keep order</Button>
          <Button
            variant="danger"
            form="cancel-order-form"
            type="submit"
            isLoading={isSubmitting}
            disabled={!form.formState.isValid || isSubmitting}
          >
            Request cancellation
          </Button>
        </>
      )}
    >
      <FormProvider {...form}>
        <form
          id="cancel-order-form"
          onSubmit={(event) => void form.handleSubmit(({ reason }) => onSubmit(reason))(event)}
          noValidate
        >
          <FormField
            name="reason"
            label="Cancellation reason"
            required
            multiline
            rows={3}
            placeholder="Explain why this order should be cancelled..."
            disabled={isSubmitting}
          />
        </form>
      </FormProvider>
    </Modal>
  );
}
