import { useEffect, useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import {
  USER_FILTER_ROLE_VALUES,
  USER_STATUS_VALUES,
} from '../schemas/userSchema';
import type {
  AdminUserListParams,
  AdminUserRole,
  AdminUserStatus,
} from '../types/user.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...USER_STATUS_VALUES.map((status) => ({
    value: status,
    label: formatEnumLabel(status),
  })),
];

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  ...USER_FILTER_ROLE_VALUES.map((role) => ({
    value: role,
    label: formatEnumLabel(role),
  })),
];

interface UserFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: AdminUserListParams;
  onApply: (updates: Partial<AdminUserListParams>) => void;
  onReset: () => void;
}

export function UserFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: UserFiltersDrawerProps) {
  const [local, setLocal] = useState<Partial<AdminUserListParams>>({});
  const merged = { ...filters, ...local };

  useEffect(() => {
    if (!open) {
      setLocal({});
      return;
    }

    setLocal({
      email: filters.email,
      phoneNumber: filters.phoneNumber,
      status: filters.status,
      role: filters.role,
    });
  }, [filters.email, filters.phoneNumber, filters.role, filters.status, open]);

  const setFilters = (updates: Partial<AdminUserListParams>) => {
    setLocal((prev) => ({ ...prev, ...updates }));
  };

  const handleApply = () => {
    onApply(local);
    setLocal({});
    onClose();
  };

  const handleReset = () => {
    setLocal({});
    onReset();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Staff"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply filters
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Email">
          <Input
            value={merged.email ?? ''}
            onChange={(event) => setFilters({ email: event.target.value || undefined })}
            placeholder="Search by email"
          />
        </Field>

        <Field label="Phone number">
          <Input
            value={merged.phoneNumber ?? ''}
            onChange={(event) =>
              setFilters({ phoneNumber: event.target.value || undefined })
            }
            placeholder="Search by phone number"
          />
        </Field>

        <Field label="Status">
          <Select
            options={STATUS_OPTIONS}
            value={merged.status ?? ''}
            onChange={(event) =>
              setFilters({
                status: (event.target.value as AdminUserStatus) || undefined,
              })
            }
          />
        </Field>

        <Field label="Role">
          <Select
            options={ROLE_OPTIONS}
            value={merged.role ?? ''}
            onChange={(event) =>
              setFilters({ role: (event.target.value as AdminUserRole) || undefined })
            }
          />
        </Field>
      </div>
    </Drawer>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
