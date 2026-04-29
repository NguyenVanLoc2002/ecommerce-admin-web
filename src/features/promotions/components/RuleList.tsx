import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import type { PromotionRule } from '../types/promotion.types';
import { useDeleteRule } from '../hooks/useDeleteRule';
import { RuleFormModal } from './RuleFormModal';

const RULE_TYPE_LABELS: Record<string, string> = {
  MIN_ORDER_AMOUNT: 'Min Order Amount',
  SPECIFIC_PRODUCTS: 'Specific Products',
  SPECIFIC_CATEGORIES: 'Specific Categories',
  SPECIFIC_BRANDS: 'Specific Brands',
  FIRST_ORDER: 'First Order',
};

interface RuleListProps {
  promotionId: string;
  rules: PromotionRule[];
  canWrite: boolean;
}

export function RuleList({ promotionId, rules, canWrite }: RuleListProps) {
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const { confirm } = useConfirmDialog();
  const deleteRule = useDeleteRule(promotionId);

  const handleDeleteRule = async (ruleId: string) => {
    const ok = await confirm({
      title: 'Remove rule?',
      description: 'This rule will be removed from the promotion.',
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (!ok) return;

    deleteRule.mutate(ruleId, {
      onSuccess: () => {
        toast.success('Rule removed.');
      },
      onError: (error) => {
        toast.error(error.message ?? 'Failed to remove rule.');
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Promotion Rules</h3>
        {canWrite && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setRuleModalOpen(true)}
          >
            Add Rule
          </Button>
        )}
      </div>

      {rules.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No rules configured. Add rules to restrict eligibility.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary">
                    {RULE_TYPE_LABELS[rule.ruleType] ?? rule.ruleType}
                  </Badge>
                  <span className="font-mono text-sm text-gray-800 truncate">
                    {rule.ruleValue}
                  </span>
                </div>
                {rule.description && (
                  <p className="text-xs text-gray-500">{rule.description}</p>
                )}
              </div>
              {canWrite && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void handleDeleteRule(rule.id)}
                  disabled={deleteRule.isPending}
                  title="Remove rule"
                  aria-label="Remove rule"
                  className="ml-3 shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-danger-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <RuleFormModal
        promotionId={promotionId}
        open={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
      />
    </div>
  );
}
