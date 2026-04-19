import { CheckCircle2, Truck, PackageCheck, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';
import type { Order } from '../types/order.types';
import type { OrderStatus } from '@/shared/types/enums';

interface ActionDef {
  label: string;
  icon: React.ReactNode;
  nextStatus: OrderStatus;
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
      nextStatus: 'CONFIRMED',
      variant: 'primary',
      confirmTitle: 'Confirm this order?',
      confirmDescription: 'The customer will be notified that their order is confirmed.',
      confirmLabel: 'Confirm',
    },
    {
      label: 'Cancel Order',
      icon: <XCircle className="h-4 w-4" />,
      nextStatus: 'CANCELLED',
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
      nextStatus: 'CANCELLED',
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
      nextStatus: 'PROCESSING',
      variant: 'primary',
      confirmTitle: 'Mark order as processing?',
      confirmDescription: 'The order will move to the processing stage.',
      confirmLabel: 'Mark processing',
    },
    {
      label: 'Cancel Order',
      icon: <XCircle className="h-4 w-4" />,
      nextStatus: 'CANCELLED',
      variant: 'danger',
      confirmTitle: 'Cancel this order?',
      confirmDescription: 'This action cannot be undone.',
      confirmLabel: 'Cancel order',
      confirmVariant: 'destructive',
    },
  ],
  PROCESSING: [
    {
      label: 'Mark as Shipped',
      icon: <Truck className="h-4 w-4" />,
      nextStatus: 'SHIPPED',
      variant: 'primary',
      confirmTitle: 'Mark order as shipped?',
      confirmDescription: 'Confirm that the order has been handed to the carrier.',
      confirmLabel: 'Mark shipped',
    },
    {
      label: 'Cancel Order',
      icon: <XCircle className="h-4 w-4" />,
      nextStatus: 'CANCELLED',
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
      nextStatus: 'DELIVERED',
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
      nextStatus: 'COMPLETED',
      variant: 'primary',
      confirmTitle: 'Mark order as completed?',
      confirmDescription: 'The order will be closed and no further changes can be made.',
      confirmLabel: 'Mark completed',
    },
  ],
};

interface OrderActionPanelProps {
  order: Order;
}

export function OrderActionPanel({ order }: OrderActionPanelProps) {
  const { confirm } = useConfirmDialog();
  const updateStatus = useUpdateOrderStatus(order.id);
  const actions = STATUS_ACTIONS[order.status] ?? [];

  if (actions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Actions</p>
        <p className="mt-2 text-sm text-gray-500">No actions available for this status.</p>
      </div>
    );
  }

  const handleAction = async (action: ActionDef) => {
    const ok = await confirm({
      title: action.confirmTitle,
      description: action.confirmDescription,
      confirmLabel: action.confirmLabel,
      variant: action.confirmVariant ?? 'default',
    });
    if (!ok) return;

    try {
      await updateStatus.mutateAsync({ status: action.nextStatus });
      toast.success('Order status updated.');
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'ORDER_STATUS_INVALID') {
          toast.error('Order was updated by someone else. Refreshing…');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error(err.message || 'Failed to update order status.');
        }
      } else {
        toast.error('Failed to update order status. Please try again.');
      }
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Actions</p>
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <Button
            key={action.nextStatus}
            variant={action.variant === 'danger' ? 'danger' : action.variant}
            size="sm"
            className="w-full justify-start"
            leftIcon={action.icon}
            isLoading={updateStatus.isPending}
            onClick={() => void handleAction(action)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
