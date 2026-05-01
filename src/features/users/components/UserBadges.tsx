import { Badge } from '@/shared/components/ui/Badge';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import type { AdminUserRole, AdminUserStatus } from '../types/user.types';

const roleVariantMap: Record<
  AdminUserRole,
  'default' | 'primary' | 'info' | 'warning'
> = {
  STAFF: 'default',
  ADMIN: 'info',
  SUPER_ADMIN: 'primary',
  CUSTOMER: 'warning',
};

const statusVariantMap: Record<
  AdminUserStatus,
  'success' | 'warning' | 'danger'
> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  LOCKED: 'danger',
};

export function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  return <Badge variant={statusVariantMap[status]}>{formatEnumLabel(status)}</Badge>;
}

export function UserRoleBadge({ role }: { role: AdminUserRole }) {
  return <Badge variant={roleVariantMap[role]}>{formatEnumLabel(role)}</Badge>;
}
