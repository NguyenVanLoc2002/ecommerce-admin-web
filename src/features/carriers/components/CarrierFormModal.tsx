import { useEffect } from 'react';
import { FormProvider, useForm, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { AppError } from '@/shared/types/api.types';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import { carrierSchema, type CarrierFormValues } from '../schemas/carrierSchema';
import type { Carrier } from '../types/carrier.types';
import {
  CARRIER_PROVIDER_TYPE_VALUES,
  CARRIER_STATUS_VALUES,
} from '../types/carrier.types';

const PROVIDER_OPTIONS = CARRIER_PROVIDER_TYPE_VALUES.map((providerType) => ({
  value: providerType,
  label: formatEnumLabel(providerType),
}));

const STATUS_OPTIONS = CARRIER_STATUS_VALUES.map((status) => ({
  value: status,
  label: formatEnumLabel(status),
}));

interface CarrierFormModalProps {
  open: boolean;
  onClose: () => void;
  carrier?: Carrier;
  isSubmitting: boolean;
  onSubmit: (values: CarrierFormValues) => Promise<void>;
}

export function CarrierFormModal({
  open,
  onClose,
  carrier,
  isSubmitting,
  onSubmit,
}: CarrierFormModalProps) {
  const isEditMode = carrier !== undefined;

  const form = useForm<CarrierFormValues>({
    resolver: zodResolver(carrierSchema),
    defaultValues: {
      code: '',
      name: '',
      providerType: 'MANUAL',
      status: 'ACTIVE',
      logoUrl: null,
      description: null,
    },
  });

  const {
    clearErrors,
    formState: { errors },
    setError,
  } = form;

  useEffect(() => {
    if (!open) {
      return;
    }

    clearErrors();

    if (carrier) {
      form.reset({
        code: carrier.code,
        name: carrier.name,
        providerType: carrier.providerType,
        status: carrier.status,
        logoUrl: carrier.logoUrl,
        description: carrier.description,
      });
      return;
    }

    form.reset({
      code: '',
      name: '',
      providerType: 'MANUAL',
      status: 'ACTIVE',
      logoUrl: null,
      description: null,
    });
  }, [carrier, clearErrors, form, open]);

  const rootError = errors.root?.server?.message;

  const handleSubmit = form.handleSubmit(async (values) => {
    clearErrors();

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach(({ field, message }) => {
            setError(field as Path<CarrierFormValues>, { message });
          });
          return;
        }

        if (error.code === 'CONFLICT') {
          setError('code', { message: error.message || 'This carrier code already exists.' });
          return;
        }

        setError('root.server', { message: error.message });
        return;
      }

      setError('root.server', { message: 'Failed to save carrier. Please try again.' });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Carrier' : 'New Carrier'}
      description="Manage the carrier catalog entry used by shipment creation."
      size="lg"
      closeOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="carrier-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create carrier'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form id="carrier-form" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {rootError && (
              <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {rootError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                name="code"
                label="Code"
                required
                placeholder="e.g. GHN_MAIN"
                hint="Stable carrier identifier used by the backend."
                disabled={isSubmitting}
              />
              <FormField
                name="name"
                label="Name"
                required
                placeholder="e.g. Giao Hang Nhanh"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormSelect
                name="providerType"
                label="Provider Type"
                required
                options={PROVIDER_OPTIONS}
                disabled={isSubmitting}
              />
              <FormSelect
                name="status"
                label="Status"
                required
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            </div>

            <FormField
              name="logoUrl"
              label="Logo URL"
              placeholder="https://example.com/logo.svg"
              disabled={isSubmitting}
            />

            <FormField
              name="description"
              label="Description"
              multiline
              rows={4}
              placeholder="Optional operational notes for staff."
              disabled={isSubmitting}
            />
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
