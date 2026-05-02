import { Cake, Heart, Mail, Phone, UserCircle } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { formatDate, formatDateTime } from '@/shared/utils/formatDate';
import { useCustomer } from '../hooks/useCustomer';
import type { AdminCustomer } from '../types/customer.types';
import { CustomerGenderBadge, CustomerStatusBadge } from './CustomerBadges';

interface CustomerDetailModalProps {
  open: boolean;
  customerId?: string;
  onClose: () => void;
  onEdit: (customer: AdminCustomer) => void;
}

function formatDisplayName(customer: AdminCustomer) {
  const fullName = `${customer.firstName} ${customer.lastName ?? ''}`.trim();
  return fullName || customer.email;
}

export function CustomerDetailModal({
  open,
  customerId,
  onClose,
  onEdit,
}: CustomerDetailModalProps) {
  const {
    data: customer,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomer(open ? customerId : undefined);

  const title = customer ? formatDisplayName(customer) : 'Customer details';
  const isDeleted = customer?.isDeleted === true;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={customer?.email}
      size="lg"
      footer={
        <>
          {customer && <CopyValueButton value={customer.id} label="Copy ID" />}
          {customer && !isDeleted && (
            <Button size="sm" onClick={() => onEdit(customer)}>
              Edit profile
            </Button>
          )}
        </>
      }
    >
      {isLoading ? (
        <SkeletonDetail />
      ) : isError ? (
        <ErrorCard
          message={
            error instanceof Error ? error.message : 'Failed to load customer details.'
          }
          onRetry={() => void refetch()}
        />
      ) : !customer ? (
        <EmptyState
          icon={<UserCircle className="h-10 w-10" />}
          title="Customer not found"
          message="This customer does not exist or has already been deleted."
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <CustomerStatusBadge status={customer.status} />
            <CustomerGenderBadge gender={customer.gender} />
            {isDeleted && (
              <span className="rounded-full border border-danger-200 bg-danger-50 px-2.5 py-0.5 text-xs font-medium text-danger-700">
                Deleted
              </span>
            )}
          </div>

          {customer.avatarUrl && (
            <div className="flex items-center gap-3">
              <img
                src={customer.avatarUrl}
                alt={formatDisplayName(customer)}
                className="h-16 w-16 rounded-full border border-gray-200 object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Avatar
                </p>
                <p className="mt-1 truncate text-sm text-gray-700">{customer.avatarUrl}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailItem label="First name" value={customer.firstName} />
            <DetailItem label="Last name" value={customer.lastName ?? 'Not provided'} />
            <DetailItem
              label="Email"
              value={customer.email}
              icon={<Mail className="h-4 w-4 text-gray-400" />}
            />
            <DetailItem
              label="Phone number"
              value={customer.phoneNumber ?? 'Not provided'}
              icon={<Phone className="h-4 w-4 text-gray-400" />}
            />
            <DetailItem
              label="Birth date"
              value={customer.birthDate ? formatDate(customer.birthDate) : 'Not provided'}
              icon={<Cake className="h-4 w-4 text-gray-400" />}
            />
            <DetailItem
              label="Loyalty points"
              value={customer.loyaltyPoints.toLocaleString('vi-VN')}
              icon={<Heart className="h-4 w-4 text-rose-400" />}
            />
            <DetailItem label="Customer ID" value={customer.id} />
            <DetailItem label="User ID" value={customer.userId} />
            <DetailItem label="Created at" value={formatDateTime(customer.createdAt)} />
            <DetailItem label="Updated at" value={formatDateTime(customer.updatedAt)} />
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-2 flex items-start gap-2">
        {icon}
        <div className="min-w-0 break-words text-sm text-gray-800">{value}</div>
      </div>
    </div>
  );
}
