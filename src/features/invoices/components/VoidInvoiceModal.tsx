import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { voidInvoiceSchema, type VoidInvoiceFormValues } from '../schemas/voidInvoiceSchema';

interface VoidInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (note: string) => void;
}

export function VoidInvoiceModal({
  open,
  onClose,
  isSubmitting,
  onSubmit,
}: VoidInvoiceModalProps) {
  const form = useForm<VoidInvoiceFormValues>({
    resolver: zodResolver(voidInvoiceSchema),
    defaultValues: { note: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) form.reset({ note: '' });
  }, [open, form]);

  const isConfirmDisabled = !form.formState.isValid || isSubmitting;

  const handleSubmit = (values: VoidInvoiceFormValues) => {
    onSubmit(values.note);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Void this invoice?"
      description="This action cannot be undone. The invoice will be permanently marked as voided."
      size="md"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            form="void-invoice-form"
            type="submit"
            isLoading={isSubmitting}
            disabled={isConfirmDisabled}
          >
            Void invoice
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form
          id="void-invoice-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FormField
            name="note"
            label="Void reason"
            required
            multiline
            rows={3}
            placeholder="Describe the reason for voiding this invoice…"
            disabled={isSubmitting}
          />
        </form>
      </FormProvider>
    </Modal>
  );
}
