import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { toast } from '@/shared/stores/uiStore';
import type { AppError } from '@/shared/types/api.types';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import { useCreateUser } from '../hooks/useCreateUser';
import { useUpdateUser } from '../hooks/useUpdateUser';
import {
  ASSIGNABLE_ROLE_VALUES,
  USER_STATUS_VALUES,
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from '../schemas/userSchema';
import type {
  AdminUser,
  AssignableAdminUserRole,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user.types';

const STATUS_OPTIONS = USER_STATUS_VALUES.map((status) => ({
  value: status,
  label: formatEnumLabel(status),
}));

const ROLE_OPTIONS = ASSIGNABLE_ROLE_VALUES.map((role) => ({
  value: role,
  label: formatEnumLabel(role),
}));

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: AdminUser;
}

function normalizeRoles(roles: string[]): AssignableAdminUserRole[] {
  return roles.filter((role): role is AssignableAdminUserRole =>
    ASSIGNABLE_ROLE_VALUES.includes(role as AssignableAdminUserRole),
  );
}

export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
  const isEditMode = user !== undefined;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id);

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: undefined,
      phoneNumber: undefined,
      roles: ['STAFF'],
    },
  });

  const updateForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: '',
      lastName: undefined,
      phoneNumber: undefined,
      status: 'ACTIVE',
      roles: ['STAFF'],
    },
  });

  const form = isEditMode ? updateForm : createForm;
  const isSubmitting = createUser.isPending || updateUser.isPending;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (user) {
      updateForm.reset({
        firstName: user.firstName,
        lastName: user.lastName ?? undefined,
        phoneNumber: user.phoneNumber ?? undefined,
        status: user.status,
        roles: normalizeRoles(user.roles),
      });
      return;
    }

    createForm.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: undefined,
      phoneNumber: undefined,
      roles: ['STAFF'],
    });
  }, [createForm, open, updateForm, user]);

  const handleServerError = (
    appError: AppError,
    targetForm: typeof form,
  ) => {
    if (appError.fieldErrors?.length) {
      appError.fieldErrors.forEach(({ field, message }) => {
        targetForm.setError(field as never, { message });
      });
      return;
    }

    switch (appError.code) {
      case 'EMAIL_ALREADY_EXISTS':
        targetForm.setError('email' as never, {
          message: 'This email is already in use.',
        });
        break;
      case 'PHONE_ALREADY_EXISTS':
        targetForm.setError('phoneNumber' as never, {
          message: 'This phone number is already in use.',
        });
        break;
      case 'BAD_REQUEST':
      case 'VALIDATION_ERROR':
        toast.error(appError.message);
        break;
      case 'FORBIDDEN':
        toast.error(appError.message || 'You do not have permission to update this staff account.');
        break;
      default:
        toast.error(appError.message || 'Failed to save staff account.');
    }
  };

  const handleCreateSubmit = createForm.handleSubmit(async (values) => {
    const payload: CreateUserRequest = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      roles: values.roles,
    };

    try {
      await createUser.mutateAsync(payload);
      toast.success('Staff account created.');
      onClose();
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        handleServerError(error as AppError, createForm);
      } else {
        toast.error('Failed to create staff account.');
      }
    }
  });

  const handleUpdateSubmit = updateForm.handleSubmit(async (values) => {
    const payload: UpdateUserRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      status: values.status,
      roles: values.roles,
    };

    try {
      await updateUser.mutateAsync(payload);
      toast.success('Staff account updated.');
      onClose();
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        handleServerError(error as AppError, updateForm);
      } else {
        toast.error('Failed to update staff account.');
      }
    }
  });

  const handleSubmitClick = () => {
    if (isEditMode) {
      void handleUpdateSubmit();
      return;
    }

    void handleCreateSubmit();
  };

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
      title={isEditMode ? 'Edit Staff' : 'New Staff'}
      description={
        isEditMode
          ? 'Update staff profile, status, and system role assignments.'
          : 'Create a staff account and assign one or more system roles.'
      }
      size="lg"
      closeOnBackdropClick={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" isLoading={isSubmitting} onClick={handleSubmitClick}>
            {isEditMode ? 'Save changes' : 'Create staff'}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <div className="space-y-4">
          {!isEditMode && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                name="email"
                label="Email"
                required
                placeholder="name@company.com"
                autoComplete="email"
                disabled={isSubmitting}
              />
              <FormField
                name="password"
                label="Password"
                type="password"
                required
                placeholder="Create a secure password"
                hint="8-64 characters, with uppercase, lowercase, and a digit."
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>
          )}

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
            {isEditMode && (
              <FormSelect
                name="status"
                label="Status"
                required
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            )}
          </div>

          <Controller
            control={form.control}
            name="roles"
            render={({ field, fieldState }) => {
              const selected = new Set(field.value ?? []);

              const toggleRole = (role: AssignableAdminUserRole, checked: boolean) => {
                const next = new Set(selected);
                if (checked) {
                  next.add(role);
                } else {
                  next.delete(role);
                }
                field.onChange(Array.from(next));
              };

              return (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Roles
                    <span className="ml-0.5 text-danger-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-3">
                    {ROLE_OPTIONS.map((role) => (
                      <Checkbox
                        key={role.value}
                        checked={selected.has(role.value as AssignableAdminUserRole)}
                        onChange={(checked) =>
                          toggleRole(role.value as AssignableAdminUserRole, checked)
                        }
                        disabled={isSubmitting}
                        label={role.label}
                      />
                    ))}
                  </div>
                  {!fieldState.error && (
                    <p className="text-xs text-gray-500">
                      Select one or more roles for this account.
                    </p>
                  )}
                  {fieldState.error && (
                    <p className="text-xs text-danger-600">{fieldState.error.message}</p>
                  )}
                </div>
              );
            }}
          />
        </div>
      </FormProvider>
    </Modal>
  );
}
