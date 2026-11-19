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
import { useCancellationOperation } from '../hooks/useCancellationOperation';
import type { Order, OrderAction } from '../types/order.types';
import { CancelOrderModal } from './CancelOrderModal';

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
      label: 'Cancel Order', icon: <XCircle className="h-4 w-4" />, action: 'cancel', variant: 'danger',
      confirmTitle: 'Cancel this order?',
      confirmDescription: 'The carrier must confirm cancellation before the order is finalized.',
      confirmLabel: 'Request cancellation', confirmVariant: 'destructive',
    },
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
  PROCESSING: [
    {
      label: 'Cancel Order', icon: <XCircle className="h-4 w-4" />, action: 'cancel', variant: 'danger',
      confirmTitle: 'Cancel this order?',
      confirmDescription: 'The shipment must be cancelled or reconciled before the order is finalized.',
      confirmLabel: 'Request cancellation', confirmVariant: 'destructive',
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
  const cancellation = useCancellationOperation(order.id);
  const [pendingAction, setPendingAction] = useState<OrderAction | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
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

    if (actionDef.action === 'cancel') {
      setCancelModalOpen(true);
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
      await orderAction.mutateAsync({ action: actionDef.action });
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

  const handleCancelOrder = async (reason: string) => {
    if (pendingAction !== null || orderAction.isPending) return;
    setPendingAction('cancel');
    try {
      const operation = await orderAction.mutateAsync({ action: 'cancel', reason });
      if ('idempotencyKey' in operation && operation.status === 'UNKNOWN') {
        toast.warning('Cancellation is awaiting reconciliation. The order has not been marked cancelled.');
      } else if ('idempotencyKey' in operation && operation.status === 'REJECTED') {
        toast.error('The provider did not confirm cancellation. The order remains active.');
      } else {
        toast.success('Order cancellation confirmed.');
      }
      setCancelModalOpen(false);
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to cancel order.'));
        if (error.code === 'ORDER_STATUS_INVALID' || isConcurrencyErrorCode(error.code)) void refetch();
      } else {
        toast.error('Failed to cancel order. Please try again.');
      }
    } finally {
      setPendingAction(null);
    }
  };

  const handleReconcile = async (confirmed: boolean) => {
    if (cancellation.reconcile.isPending) return;
    const ok = await confirm({
      title: confirmed ? 'Confirm carrier cancellation?' : 'Confirm shipment remains active?',
      description: confirmed
        ? 'Use this only after verifying with the carrier that the shipment was cancelled.'
        : 'Use this only after verifying with the carrier that the shipment is still active.',
      confirmLabel: 'Record verified result',
      variant: confirmed ? 'destructive' : 'default',
    });
    if (!ok) return;
    try {
      const operation = await cancellation.reconcile.mutateAsync({
        confirmed,
        note: confirmed ? 'Admin verified carrier cancellation' : 'Admin verified carrier shipment remains active',
      });
      toast.success(operation.status === 'CONFIRMED'
        ? 'Cancellation reconciled and order finalized.'
        : 'Cancellation reconciled; order remains active.');
    } catch (error) {
      toast.error(error instanceof AppError
        ? getPhase3AdminErrorMessage(error, 'Failed to reconcile cancellation.')
        : 'Failed to reconcile cancellation. Please try again.');
    }
  };

  const isPending = pendingAction !== null;

  return (
    <>
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
        {cancellation.data && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3" role="status">
            <p className="text-sm font-medium text-amber-900">
              Cancellation: {cancellation.data.status.toLowerCase().replace('_', ' ')}
            </p>
            {(cancellation.data.status === 'UNKNOWN' || cancellation.data.status === 'PENDING') && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  isLoading={cancellation.reconcile.isPending}
                  onClick={() => void handleReconcile(true)}
                >
                  Carrier confirmed cancelled
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={cancellation.reconcile.isPending}
                  onClick={() => void handleReconcile(false)}
                >
                  Carrier confirms still active
                </Button>
              </div>
            )}
          </div>
        )}
        {cancellation.isError && (
          <div className="mt-4 rounded-md border border-danger-200 bg-danger-50 p-3" role="alert">
            <p className="text-sm text-danger-700">Cancellation state could not be loaded.</p>
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => void cancellation.refetch()}>
              Retry
            </Button>
          </div>
        )}
      </div>
      <CancelOrderModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        isSubmitting={pendingAction === 'cancel'}
        onSubmit={(reason) => void handleCancelOrder(reason)}
      />
    </>
  );
}
