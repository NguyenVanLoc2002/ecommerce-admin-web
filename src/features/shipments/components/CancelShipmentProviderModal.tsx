import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { FormField } from '@/shared/components/form/FormField';
import {
  cancelShipmentProviderSchema,
  type CancelShipmentProviderFormValues,
} from '../schemas/cancelShipmentProviderSchema';

interface CancelShipmentProviderModalProps {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (values: CancelShipmentProviderFormValues) => void;
}

export function CancelShipmentProviderModal({
  open,
  onClose,
  isSubmitting,
  onSubmit,
}: CancelShipmentProviderModalProps) {
  const form = useForm<CancelShipmentProviderFormValues>({
    resolver: zodResolver(cancelShipmentProviderSchema),
    defaultValues: {
      reason: 'Operator requested cancellation',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) {
      form.reset({ reason: 'Operator requested cancellation' });
    }
  }, [form, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel provider shipment?"
      description="This sends a cancellation request to the configured carrier provider and records the reason in the shipment timeline."
      size="md"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Keep shipment
          </Button>
          <Button
            variant="danger"
            form="cancel-provider-shipment-form"
            type="submit"
            isLoading={isSubmitting}
            disabled={!form.formState.isValid || isSubmitting}
          >
            Cancel provider shipment
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form
          id="cancel-provider-shipment-form"
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          noValidate
        >
          <FormField
            name="reason"
            label="Cancellation reason"
            required
            multiline
            rows={3}
            placeholder="Explain why this provider shipment should be cancelled..."
            disabled={isSubmitting}
          />
        </form>
      </FormProvider>
    </Modal>
  );
}
