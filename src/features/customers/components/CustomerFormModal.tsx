import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { toast } from '@/shared/stores/uiStore';
import type { AppError } from '@/shared/types/api.types';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import { useUpdateCustomer } from '../hooks/useUpdateCustomer';
import {
  CUSTOMER_GENDER_VALUES,
  updateCustomerSchema,
  type UpdateCustomerFormValues,
} from '../schemas/customerSchema';
import type { AdminCustomer, UpdateCustomerRequest } from '../types/customer.types';

const GENDER_OPTIONS = [
  { value: '', label: 'Not specified' },
  ...CUSTOMER_GENDER_VALUES.map((gender) => ({
    value: gender,
    label: formatEnumLabel(gender),
  })),
];

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  customer?: AdminCustomer;
}

export function CustomerFormModal({ open, onClose, customer }: CustomerFormModalProps) {
  const updateCustomer = useUpdateCustomer(customer?.id);

  const form = useForm<UpdateCustomerFormValues>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      firstName: '',
      lastName: undefined,
      phoneNumber: undefined,
      gender: undefined,
      birthDate: undefined,
      avatarUrl: undefined,
    },
  });

  const isSubmitting = updateCustomer.isPending;

  useEffect(() => {
    if (!open || !customer) {
      return;
    }

    form.reset({
      firstName: customer.firstName,
      lastName: customer.lastName ?? undefined,
      phoneNumber: customer.phoneNumber ?? undefined,
      gender: customer.gender ?? undefined,
      birthDate: customer.birthDate ?? undefined,
      avatarUrl: customer.avatarUrl ?? undefined,
    });
  }, [customer, form, open]);

  const handleServerError = (appError: AppError) => {
    if (appError.fieldErrors?.length) {
      appError.fieldErrors.forEach(({ field, message }) => {
        form.setError(field as never, { message });
      });
      return;
    }

    switch (appError.code) {
      case 'PHONE_ALREADY_EXISTS':
        form.setError('phoneNumber' as never, {
          message: 'This phone number is already in use.',
        });
        break;
      case 'CUSTOMER_NOT_FOUND':
      case 'USER_NOT_FOUND':
        toast.error('Customer not found.');
        break;
      case 'BAD_REQUEST':
      case 'VALIDATION_ERROR':
        toast.error(appError.message);
        break;
      case 'FORBIDDEN':
        toast.error(
          appError.message || 'You do not have permission to update this customer.',
        );
        break;
      default:
        toast.error(appError.message || 'Failed to save customer.');
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!customer) {
      return;
    }

    const payload: UpdateCustomerRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      gender: values.gender,
      birthDate: values.birthDate,
      avatarUrl: values.avatarUrl,
    };

    try {
      await updateCustomer.mutateAsync(payload);
      toast.success('Customer updated.');
      onClose();
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        handleServerError(error as AppError);
      } else {
        toast.error('Failed to update customer.');
      }
    }
  });

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Customer"
      description="Update profile details. Status, email and roles cannot be changed here."
      size="lg"
      closeOnBackdropClick={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            isLoading={isSubmitting}
            onClick={() => void handleSubmit()}
            disabled={!customer}
          >
            Save changes
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="firstName"
              label="First name"
              required
              placeholder="First name"
              autoComplete="given-name"
              disabled={isSubmitting}
            />
            <FormField
              name="lastName"
              label="Last name"
              placeholder="Last name"
              autoComplete="family-name"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="phoneNumber"
              label="Phone number"
              placeholder="0912345678 or +84912345678"
              autoComplete="tel"
              disabled={isSubmitting}
            />
            <FormSelect
              name="gender"
              label="Gender"
              options={GENDER_OPTIONS}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="birthDate"
              label="Birth date"
              type="date"
              disabled={isSubmitting}
            />
            <FormField
              name="avatarUrl"
              label="Avatar URL"
              placeholder="https://…"
              hint="Leave blank to clear the avatar."
              disabled={isSubmitting}
            />
          </div>
        </div>
      </FormProvider>
    </Modal>
  );
}
