import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { FormSelect } from '@/shared/components/form/FormSelect';
import { toast } from '@/shared/stores/uiStore';
import type { PromotionRuleFormValues } from '../schemas/promotionRuleSchema';
import { promotionRuleSchema } from '../schemas/promotionRuleSchema';
import { useCreateRule } from '../hooks/useCreateRule';

const RULE_TYPE_OPTIONS = [
  { value: 'MIN_ORDER_AMOUNT', label: 'Minimum Order Amount' },
  { value: 'SPECIFIC_PRODUCTS', label: 'Specific Products' },
  { value: 'SPECIFIC_CATEGORIES', label: 'Specific Categories' },
  { value: 'SPECIFIC_BRANDS', label: 'Specific Brands' },
  { value: 'FIRST_ORDER', label: 'First Order' },
];

const RULE_VALUE_HINTS: Record<string, string> = {
  MIN_ORDER_AMOUNT: 'Enter minimum amount (e.g. 200000)',
  SPECIFIC_PRODUCTS: 'Enter comma-separated product IDs (e.g. 1,2,5)',
  SPECIFIC_CATEGORIES: 'Enter comma-separated category IDs (e.g. 3,7)',
  SPECIFIC_BRANDS: 'Enter comma-separated brand IDs (e.g. 2)',
  FIRST_ORDER: 'Value is set automatically',
};

interface RuleFormModalProps {
  promotionId: string;
  open: boolean;
  onClose: () => void;
}

export function RuleFormModal({ promotionId, open, onClose }: RuleFormModalProps) {
  const createRule = useCreateRule(promotionId);

  const form = useForm<PromotionRuleFormValues>({
    resolver: zodResolver(promotionRuleSchema),
    defaultValues: {
      ruleType: 'MIN_ORDER_AMOUNT',
      ruleValue: '',
      description: '',
    },
  });

  const selectedRuleType = form.watch('ruleType');
  const isFirstOrder = selectedRuleType === 'FIRST_ORDER';

  useEffect(() => {
    if (isFirstOrder) {
      form.setValue('ruleValue', 'true');
    } else {
      const current = form.getValues('ruleValue');
      if (current === 'true') {
        form.setValue('ruleValue', '');
      }
    }
  }, [isFirstOrder, form]);

  useEffect(() => {
    if (!open) {
      form.reset({ ruleType: 'MIN_ORDER_AMOUNT', ruleValue: '', description: '' });
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit((values) => {
    createRule.mutate(
      {
        ruleType: values.ruleType,
        ruleValue: values.ruleValue,
        description: values.description || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Rule added.');
          onClose();
        },
        onError: (error) => {
          toast.error(error.message ?? 'Failed to add rule.');
        },
      },
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Promotion Rule"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            isLoading={createRule.isPending}
            onClick={() => void handleSubmit()}
          >
            Add Rule
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <div className="space-y-4">
          <FormSelect
            name="ruleType"
            label="Rule Type"
            required
            options={RULE_TYPE_OPTIONS}
          />

          <FormField
            name="ruleValue"
            label="Rule Value"
            required
            hint={RULE_VALUE_HINTS[selectedRuleType]}
            disabled={isFirstOrder}
            placeholder={isFirstOrder ? 'true' : 'Enter rule value…'}
          />

          <FormField
            name="description"
            label="Description"
            placeholder="Optional description…"
          />
        </div>
      </FormProvider>
    </Modal>
  );
}
