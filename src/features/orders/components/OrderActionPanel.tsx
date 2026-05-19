import { useState } from 'react';
import { ArrowRight, CheckCircle2, PackageCheck, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import {
  getPhase3AdminErrorMessage,
  isConcurrencyErrorCode,
} from '@/shared/utils/adminPhase3Errors';
import type { OrderStatus } from '@/shared/types/enums';
import { useOrderAction } from '../hooks/useUpdateOrderStatus';
import type { Order, OrderAction } from '../types/order.types';

interface ActionDef {
  label: string;
  icon: React.ReactNode;
  action: OrderAction;
  variant: 'primary' | 'secondary' | 'danger';
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  confirmVariant?: 'default' | 'destructive';
}

const STATUS_ACTIONS: Partial<Record<OrderStatus, ActionDef[]>> = {
  PENDING: [
    {
      label: 'Confirm Order',
      icon: <CheckCircle2 className="h-4 w-4" />,
      action: 'confirm',
      variant: 'primary',
      confirmTitle: 'Confirm this order?',
      confirmDescription: 'The customer will be notified that their order is confirmed.',
      confirmLabel: 'Confirm',
    },
    {
      label: 'Cancel Order',
      icon: <XCircle className="h-4 w-4" />,
      action: 'cancel',
      variant: 'danger',
      confirmTitle: 'Cancel this order?',
      confirmDescription: 'This action cannot be undone. The customer will be notified.',
      confirmLabel: 'Cancel order',
      confirmVariant: 'destructive',
    },
  ],
  AWAITING_PAYMENT: [
    {
      label: 'Cancel Order',
      icon: <XCircle className="h-4 w-4" />,
      action: 'cancel',
      variant: 'danger',
      confirmTitle: 'Cancel this order?',
      confirmDescription: 'The order is awaiting payment. Cancelling will notify the customer.',
      confirmLabel: 'Cancel order',
      confirmVariant: 'destructive',
    },
  ],
  CONFIRMED: [
    {
      label: 'Mark as Processing',
      icon: <ArrowRight className="h-4 w-4" />,
      action: 'process',
      variant: 'primary',
      confirmTitle: 'Mark order as processing?',
      confirmDescription: 'The order will move to the processing stage.',
      confirmLabel: 'Mark processing',
    },
    {
      label: 'Cancel Order',
      icon: <XCircle className="h-4 w-4" />,
      action: 'cancel',
      variant: 'danger',
      confirmTitle: 'Cancel this order?',
      confirmDescription: 'This action cannot be undone.',
      confirmLabel: 'Cancel order',
      confirmVariant: 'destructive',
    },
  ],
  SHIPPED: [
    {
      label: 'Mark as Delivered',
      icon: <PackageCheck className="h-4 w-4" />,
      action: 'deliver',
      variant: 'primary',
      confirmTitle: 'Mark order as delivered?',
      confirmDescription: 'Confirm that the customer has received the order.',
      confirmLabel: 'Mark delivered',
    },
  ],
  DELIVERED: [
    {
      label: 'Mark as Completed',
      icon: <CheckCircle2 className="h-4 w-4" />,
      action: 'complete',
      variant: 'primary',
      confirmTitle: 'Mark order as completed?',
      confirmDescription: 'The order will be closed and no further changes can be made.',
      confirmLabel: 'Mark completed',
    },
  ],
};

interface OrderActionPanelProps {
  order: Order;
  refetch: () => void;
}

export function OrderActionPanel({ order, refetch }: OrderActionPanelProps) {
  const { confirm } = useConfirmDialog();
  const orderAction = useOrderAction(order.id);
  const [pendingAction, setPendingAction] = useState<OrderAction | null>(null);
  const actions = STATUS_ACTIONS[order.status] ?? [];

  if (actions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Actions</p>
        <p className="mt-2 text-sm text-gray-500">No actions available for this status.</p>
      </div>
    );
  }

  const handleAction = async (actionDef: ActionDef) => {
    if (pendingAction !== null || orderAction.isPending) {
      return;
    }

    const ok = await confirm({
      title: actionDef.confirmTitle,
      description: actionDef.confirmDescription,
      confirmLabel: actionDef.confirmLabel,
      variant: actionDef.confirmVariant ?? 'default',
    });
    if (!ok) {
      return;
    }

    setPendingAction(actionDef.action);
    try {
      await orderAction.mutateAsync(actionDef.action);
      toast.success('Order status updated.');
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to update order status.'));

        if (error.code === 'ORDER_STATUS_INVALID' || isConcurrencyErrorCode(error.code)) {
          void refetch();
        }
      } else {
        toast.error('Failed to update order status. Please try again.');
      }
    } finally {
      setPendingAction(null);
    }
  };

  const isPending = pendingAction !== null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">Actions</p>
      <div className="flex flex-col gap-2">
        {actions.map((actionDef) => {
          const isDanger = actionDef.variant === 'danger';

          return (
            <Button
              key={actionDef.action}
              variant={isDanger ? 'danger' : actionDef.variant}
              size={isDanger ? 'sm' : 'md'}
              className={isDanger ? 'w-full justify-start' : 'w-full'}
              leftIcon={actionDef.icon}
              isLoading={pendingAction === actionDef.action}
              disabled={isPending}
              onClick={() => void handleAction(actionDef)}
            >
              {actionDef.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
