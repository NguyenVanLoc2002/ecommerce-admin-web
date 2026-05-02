import { useEffect, useRef, useState } from 'react';
import { Eye, Lock, MoreHorizontal, Pencil, PowerOff, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { useUpdateCustomerStatus } from '../hooks/useUpdateCustomerStatus';
import type { AdminCustomer, CustomerStatus } from '../types/customer.types';

interface CustomerRowActionsProps {
  customer: AdminCustomer;
  onView: (customer: AdminCustomer) => void;
  onEdit: (customer: AdminCustomer) => void;
}

export function CustomerRowActions({
  customer,
  onView,
  onEdit,
}: CustomerRowActionsProps) {
  const { confirm } = useConfirmDialog();
  const deleteCustomer = useDeleteCustomer();
  const updateStatus = useUpdateCustomerStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const isMutating = deleteCustomer.isPending || updateStatus.isPending;
  const isDeleted = customer.isDeleted === true;

  const handleStatusChange = async (next: CustomerStatus, label: string) => {
    setMenuOpen(false);

    if (customer.status === next) {
      return;
    }

    const ok = await confirm({
      title: `${label} customer?`,
      description:
        next === 'ACTIVE'
          ? 'The customer will be able to sign in and shop again.'
          : 'The customer will not be able to sign in until the status is changed back.',
      confirmLabel: label,
      variant: next === 'ACTIVE' ? 'default' : 'destructive',
    });

    if (!ok) {
      return;
    }

    try {
      await updateStatus.mutateAsync({ id: customer.id, body: { status: next } });
      toast.success(`Customer ${label.toLowerCase()}d.`);
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(error.message || `Failed to ${label.toLowerCase()} customer.`);
      } else {
        toast.error(`Failed to ${label.toLowerCase()} customer.`);
      }
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);

    const ok = await confirm({
      title: 'Soft delete customer?',
      description:
        'The customer profile and linked account will be soft-deleted. They will no longer be able to sign in. Historical orders and reviews are preserved.',
      confirmLabel: 'Delete customer',
      variant: 'destructive',
    });

    if (!ok) {
      return;
    }

    try {
      await deleteCustomer.mutateAsync(customer.id);
      toast.success('Customer deleted.');
    } catch (error) {
      if (error instanceof AppError) {
        switch (error.code) {
          case 'CUSTOMER_NOT_FOUND':
            toast.error('Customer not found.');
            break;
          case 'FORBIDDEN':
            toast.error(error.message || 'You cannot delete this customer.');
            break;
          default:
            toast.error(error.message || 'Failed to delete customer.');
        }
      } else {
        toast.error('Failed to delete customer.');
      }
    }
  };

  return (
    <div className="relative flex justify-end" onClick={(event) => event.stopPropagation()}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon-sm"
        onClick={() => setMenuOpen((value) => !value)}
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <DropdownMenu open={menuOpen} anchorRef={buttonRef} onClose={() => setMenuOpen(false)}>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMenuOpen(false);
            onView(customer);
          }}
        >
          <Eye className="h-4 w-4 text-gray-400" />
          View details
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            setMenuOpen(false);
            onEdit(customer);
          }}
          disabled={isDeleted}
        >
          <Pencil className="h-4 w-4 text-gray-400" />
          Edit profile
        </button>
        <div className="my-1 border-t border-gray-100" />
        {customer.status !== 'ACTIVE' && (
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void handleStatusChange('ACTIVE', 'Activate')}
            disabled={isMutating || isDeleted}
          >
            <ShieldCheck className="h-4 w-4 text-success-500" />
            Activate
          </button>
        )}
        {customer.status !== 'INACTIVE' && (
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void handleStatusChange('INACTIVE', 'Deactivate')}
            disabled={isMutating || isDeleted}
          >
            <PowerOff className="h-4 w-4 text-warning-500" />
            Deactivate
          </button>
        )}
        {customer.status !== 'LOCKED' && (
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void handleStatusChange('LOCKED', 'Lock')}
            disabled={isMutating || isDeleted}
          >
            <Lock className="h-4 w-4 text-danger-500" />
            Lock
          </button>
        )}
        <div className="my-1 border-t border-gray-100" />
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void handleDelete()}
          disabled={isMutating || isDeleted}
          title={isDeleted ? 'Customer is already deleted' : 'Soft delete customer'}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </DropdownMenu>
    </div>
  );
}
