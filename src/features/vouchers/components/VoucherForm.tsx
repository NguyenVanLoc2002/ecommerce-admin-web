import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { FormToggle } from '@/shared/components/form/FormToggle';
import { FormActions } from '@/shared/components/form/FormActions';
import { Button } from '@/shared/components/ui/Button';
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload';
import { toast } from '@/shared/stores/uiStore';
import type { AppError } from '@/shared/types/api.types';
import { voucherSchema, type VoucherFormValues } from '../schemas/voucherSchema';
import type { Voucher } from '../types/voucher.types';
import { useCreateVoucher } from '../hooks/useCreateVoucher';
import { useUpdateVoucher } from '../hooks/useUpdateVoucher';

interface VoucherFormProps {
  voucher?: Voucher;
  promotionOptions: { value: string; label: string }[];
  onSuccess: () => void;
}

export function VoucherForm({ voucher, promotionOptions, onSuccess }: VoucherFormProps) {
  const isEditMode = voucher !== undefined;

  const defaultValues: VoucherFormValues = voucher
    ? {
        code: voucher.code,
        promotionId: voucher.promotionId,
        usageLimit: voucher.usageLimit ?? undefined,
        usageLimitPerUser: voucher.usageLimitPerUser ?? undefined,
        startDate: voucher.startDate.slice(0, 16),
        endDate: voucher.endDate.slice(0, 16),
        active: voucher.active,
      }
    : {
        code: null,
        promotionId: undefined as unknown as number,
        usageLimit: undefined,
        usageLimitPerUser: undefined,
        startDate: '',
        endDate: '',
        active: true,
      };

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues,
  });

  useBeforeUnload(form.formState.isDirty, 'Leave without saving?');

  const createVoucher = useCreateVoucher();
  const updateVoucher = useUpdateVoucher(voucher?.id ?? 0);

  const handleSubmit = form.handleSubmit((values) => {
    const onSuccess_ = () => {
      toast.success(isEditMode ? 'Voucher updated.' : 'Voucher created.');
      onSuccess();
    };

    const onError_ = (error: Error) => {
      const appError = error as AppError;
      if (appError.fieldErrors?.length) {
        appError.fieldErrors.forEach(({ field, message }) => {
          form.setError(field as keyof VoucherFormValues, { message });
        });
      } else if ((appError as AppError & { code?: string }).code === 'VOUCHER_CODE_ALREADY_EXISTS') {
        form.setError('code', { message: 'This code is already in use.' });
      } else {
        toast.error(appError.message ?? 'Something went wrong.');
      }
    };

    if (isEditMode) {
      updateVoucher.mutate(
        {
          usageLimit: values.usageLimit,
          usageLimitPerUser: values.usageLimitPerUser,
          startDate: values.startDate,
          endDate: values.endDate,
          active: values.active,
        },
        { onSuccess: onSuccess_, onError: onError_ },
      );
    } else {
      createVoucher.mutate(
        {
          code: values.code ?? null,
          promotionId: values.promotionId,
          usageLimit: values.usageLimit,
          usageLimitPerUser: values.usageLimitPerUser,
          startDate: values.startDate,
          endDate: values.endDate,
        },
        { onSuccess: onSuccess_, onError: onError_ },
      );
    }
  });

  const isPending = createVoucher.isPending || updateVoucher.isPending;

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Voucher Code
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <FormField
                  name="code"
                  placeholder="e.g. SALE20 (leave blank to auto-generate)"
                  disabled={isEditMode}
                  hint={isEditMode ? 'Code cannot be changed after creation.' : 'Leave blank to auto-generate.'}
                />
              </div>
              {!isEditMode && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => form.setValue('code', null, { shouldDirty: true })}
                  title="Clear code (auto-generate)"
                  className="mt-0 self-start h-9"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <FormSelect
            name="promotionId"
            label="Promotion"
            required
            options={[{ value: '', label: 'Select a promotion…' }, ...promotionOptions]}
            disabled={isEditMode}
            hint={isEditMode ? 'Promotion cannot be changed after creation.' : undefined}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="usageLimit"
            label="Total Usage Limit"
            type="number"
            placeholder="Leave blank for unlimited"
            hint="Max times this voucher can be redeemed"
          />
          <FormField
            name="usageLimitPerUser"
            label="Per-User Limit"
            type="number"
            placeholder="Leave blank for unlimited"
            hint="Max times one customer can use this voucher"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField name="startDate" label="Start Date" required type="datetime-local" />
          <FormField name="endDate" label="End Date" required type="datetime-local" />
        </div>

        {isEditMode && (
          <FormToggle name="active" label="Active" hint="Deactivating prevents further redemptions" />
        )}

        <FormActions isSubmitting={isPending} submitLabel={isEditMode ? 'Save changes' : 'Create voucher'} />
      </form>
    </FormProvider>
  );
}
