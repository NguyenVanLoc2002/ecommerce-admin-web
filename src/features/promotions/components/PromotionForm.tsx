import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { FormToggle } from '@/shared/components/form/FormToggle';
import { FormActions } from '@/shared/components/form/FormActions';
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload';
import { toast } from '@/shared/stores/uiStore';
import type { AppError } from '@/shared/types/api.types';
import { promotionSchema, type PromotionFormValues } from '../schemas/promotionSchema';
import type { Promotion } from '../types/promotion.types';
import { useCreatePromotion } from '../hooks/useCreatePromotion';
import { useUpdatePromotion } from '../hooks/useUpdatePromotion';

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'Percentage (%)' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount (₫)' },
];

const SCOPE_OPTIONS = [
  { value: 'ALL', label: 'All orders' },
  { value: 'CATEGORY', label: 'Category' },
  { value: 'BRAND', label: 'Brand' },
  { value: 'PRODUCT', label: 'Product' },
];

interface PromotionFormProps {
  promotion?: Promotion;
  onSuccess: () => void;
}

export function PromotionForm({ promotion, onSuccess }: PromotionFormProps) {
  const isEditMode = promotion !== undefined;

  const defaultValues: PromotionFormValues = promotion
    ? {
        name: promotion.name,
        description: promotion.description ?? '',
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscountAmount: promotion.maxDiscountAmount ?? undefined,
        minimumOrderAmount: promotion.minimumOrderAmount ?? undefined,
        scope: promotion.scope,
        startDate: promotion.startDate.slice(0, 16),
        endDate: promotion.endDate.slice(0, 16),
        usageLimit: promotion.usageLimit ?? undefined,
        active: promotion.active,
      }
    : {
        name: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: undefined as unknown as number,
        maxDiscountAmount: undefined,
        minimumOrderAmount: undefined,
        scope: 'ALL',
        startDate: '',
        endDate: '',
        usageLimit: undefined,
        active: true,
      };

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues,
  });

  const discountType = form.watch('discountType');
  const isDirty = form.formState.isDirty;

  useBeforeUnload(isDirty, 'Leave without saving?');

  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion(promotion?.id ?? 0);

  const mutation = isEditMode ? updatePromotion : createPromotion;

  const handleSubmit = form.handleSubmit((values) => {
    const payload = isEditMode
      ? {
          name: values.name,
          description: values.description || undefined,
          discountValue: values.discountValue,
          maxDiscountAmount: values.maxDiscountAmount,
          minimumOrderAmount: values.minimumOrderAmount,
          startDate: values.startDate,
          endDate: values.endDate,
          usageLimit: values.usageLimit,
          active: values.active,
        }
      : {
          name: values.name,
          description: values.description || undefined,
          discountType: values.discountType,
          discountValue: values.discountValue,
          maxDiscountAmount: values.maxDiscountAmount,
          minimumOrderAmount: values.minimumOrderAmount,
          scope: values.scope,
          startDate: values.startDate,
          endDate: values.endDate,
          usageLimit: values.usageLimit,
        };

    mutation.mutate(payload as Parameters<typeof mutation.mutate>[0], {
      onSuccess: () => {
        toast.success(isEditMode ? 'Promotion updated.' : 'Promotion created.');
        onSuccess();
      },
      onError: (error) => {
        const appError = error as AppError;
        if (appError.fieldErrors?.length) {
          appError.fieldErrors.forEach(({ field, message }) => {
            form.setError(field as keyof PromotionFormValues, { message });
          });
        } else {
          toast.error(appError.message ?? 'Something went wrong.');
        }
      },
    });
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField name="name" label="Name" required placeholder="e.g. Summer Sale 20%" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            name="description"
            label="Description"
            multiline
            rows={3}
            placeholder="Optional description…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            name="discountType"
            label="Discount Type"
            required
            options={DISCOUNT_TYPE_OPTIONS}
            disabled={isEditMode}
          />

          <FormField
            name="discountValue"
            label={discountType === 'PERCENTAGE' ? 'Discount Value (%)' : 'Discount Value (₫)'}
            required
            type="number"
            placeholder={discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 50000'}
          />
        </div>

        {discountType === 'PERCENTAGE' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="maxDiscountAmount"
              label="Max Discount Amount (₫)"
              type="number"
              placeholder="e.g. 100000"
              hint="Cap the discount amount in VND"
            />
            <div />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="minimumOrderAmount"
            label="Minimum Order Amount (₫)"
            type="number"
            placeholder="e.g. 500000"
          />

          <FormSelect
            name="scope"
            label="Scope"
            required
            options={SCOPE_OPTIONS}
            disabled={isEditMode}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="startDate"
            label="Start Date"
            required
            type="datetime-local"
          />
          <FormField
            name="endDate"
            label="End Date"
            required
            type="datetime-local"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="usageLimit"
            label="Usage Limit"
            type="number"
            placeholder="Leave blank for unlimited"
            hint="Total number of times this promotion can be used"
          />
          <div />
        </div>

        {isEditMode && (
          <FormToggle name="active" label="Active" hint="Deactivating will prevent new uses" />
        )}

        <FormActions
          isSubmitting={mutation.isPending}
          submitLabel={isEditMode ? 'Save changes' : 'Create promotion'}
        />
      </form>
    </FormProvider>
  );
}
