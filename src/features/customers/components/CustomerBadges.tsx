import { Badge } from '@/shared/components/ui/Badge';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import type { CustomerGender, CustomerStatus } from '../types/customer.types';

const statusVariantMap: Record<CustomerStatus, 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  LOCKED: 'danger',
};

const genderVariantMap: Record<CustomerGender, 'info' | 'primary' | 'default'> = {
  MALE: 'info',
  FEMALE: 'primary',
  OTHER: 'default',
};

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge variant={statusVariantMap[status]}>{formatEnumLabel(status)}</Badge>;
}

export function CustomerGenderBadge({ gender }: { gender: CustomerGender | null }) {
  if (!gender) {
    return <span className="text-sm text-gray-400">—</span>;
  }
  return <Badge variant={genderVariantMap[gender]}>{formatEnumLabel(gender)}</Badge>;
}
