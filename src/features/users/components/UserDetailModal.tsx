import { Mail, Phone, Shield, UserCircle } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { formatDateTime } from '@/shared/utils/formatDate';
import { useUser } from '../hooks/useUser';
import type { AdminUser } from '../types/user.types';
import { UserRoleBadge, UserStatusBadge } from './UserBadges';

interface UserDetailModalProps {
  open: boolean;
  userId?: string;
  onClose: () => void;
  onEdit: (user: AdminUser) => void;
}

function formatDisplayName(user: AdminUser) {
  const fullName = `${user.firstName} ${user.lastName ?? ''}`.trim();
  return fullName || user.email;
}

export function UserDetailModal({
  open,
  userId,
  onClose,
  onEdit,
}: UserDetailModalProps) {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useUser(open ? userId : undefined);

  const title = user ? formatDisplayName(user) : 'Staff details';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={user?.email}
      size="lg"
      footer={
        <>
          {user && <CopyValueButton value={user.id} label="Copy ID" />}
          {user && (
            <Button size="sm" onClick={() => onEdit(user)}>
              Edit staff
            </Button>
          )}
        </>
      }
    >
      {isLoading ? (
        <SkeletonDetail />
      ) : isError ? (
        <ErrorCard
          message={error instanceof Error ? error.message : 'Failed to load staff details.'}
          onRetry={() => void refetch()}
        />
      ) : !user ? (
        <EmptyState
          icon={<UserCircle className="h-10 w-10" />}
          title="Staff user not found"
          message="This staff account does not exist or has already been deleted."
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <UserStatusBadge status={user.status} />
            {user.roles.map((role) => (
              <UserRoleBadge key={role} role={role} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailItem label="First name" value={user.firstName} />
            <DetailItem label="Last name" value={user.lastName ?? 'Not provided'} />
            <DetailItem
              label="Email"
              value={user.email}
              icon={<Mail className="h-4 w-4 text-gray-400" />}
            />
            <DetailItem
              label="Phone number"
              value={user.phoneNumber ?? 'Not provided'}
              icon={<Phone className="h-4 w-4 text-gray-400" />}
            />
            <DetailItem
              label="Created at"
              value={formatDateTime(user.createdAt)}
            />
            <DetailItem
              label="Roles"
              icon={<Shield className="h-4 w-4 text-gray-400" />}
              value={
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((role) => (
                    <UserRoleBadge key={role} role={role} />
                  ))}
                </div>
              }
            />
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
        <div className="text-sm text-gray-800">{value}</div>
      </div>
    </div>
  );
}
