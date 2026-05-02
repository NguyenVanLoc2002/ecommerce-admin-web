import { useEffect, useState } from 'react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { SoftDeleteFilter } from '@/shared/components/ui/SoftDeleteFilter';
import { SoftDeleteState } from '@/shared/types/api.types';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import {
  CUSTOMER_GENDER_VALUES,
  CUSTOMER_STATUS_VALUES,
} from '../schemas/customerSchema';
import type {
  AdminCustomerFilter,
  CustomerGender,
  CustomerStatus,
} from '../types/customer.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...CUSTOMER_STATUS_VALUES.map((status) => ({
    value: status,
    label: formatEnumLabel(status),
  })),
];

const GENDER_OPTIONS = [
  { value: '', label: 'Any gender' },
  ...CUSTOMER_GENDER_VALUES.map((gender) => ({
    value: gender,
    label: formatEnumLabel(gender),
  })),
];

interface CustomerFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: AdminCustomerFilter;
  onApply: (updates: Partial<AdminCustomerFilter>) => void;
  onReset: () => void;
}

interface LocalState {
  email: string;
  phoneNumber: string;
  status: CustomerStatus | '';
  gender: CustomerGender | '';
  minLoyaltyPoints: string;
  maxLoyaltyPoints: string;
  dateFrom: string;
  dateTo: string;
  deletedState: SoftDeleteState;
}

function initialLocalState(filters: AdminCustomerFilter): LocalState {
  return {
    email: filters.email ?? '',
    phoneNumber: filters.phoneNumber ?? '',
    status: (filters.status as CustomerStatus) ?? '',
    gender: (filters.gender as CustomerGender) ?? '',
    minLoyaltyPoints:
      filters.minLoyaltyPoints !== undefined
        ? String(filters.minLoyaltyPoints)
        : '',
    maxLoyaltyPoints:
      filters.maxLoyaltyPoints !== undefined
        ? String(filters.maxLoyaltyPoints)
        : '',
    dateFrom: filters.dateFrom ?? '',
    dateTo: filters.dateTo ?? '',
    deletedState: filters.deletedState ?? SoftDeleteState.ACTIVE,
  };
}

function parseLoyaltyPoints(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function CustomerFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: CustomerFiltersDrawerProps) {
  const [local, setLocal] = useState<LocalState>(() => initialLocalState(filters));

  useEffect(() => {
    if (open) {
      setLocal(initialLocalState(filters));
    }
  }, [filters, open]);

  const handleApply = () => {
    onApply({
      email: local.email.trim() || undefined,
      phoneNumber: local.phoneNumber.trim() || undefined,
      status: local.status || undefined,
      gender: local.gender || undefined,
      minLoyaltyPoints: parseLoyaltyPoints(local.minLoyaltyPoints),
      maxLoyaltyPoints: parseLoyaltyPoints(local.maxLoyaltyPoints),
      dateFrom: local.dateFrom || undefined,
      dateTo: local.dateTo || undefined,
      deletedState: local.deletedState,
      page: 0,
    });
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Customers"
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
            value={local.email}
            onChange={(event) => setLocal((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Search by email"
          />
        </Field>

        <Field label="Phone number">
          <Input
            value={local.phoneNumber}
            onChange={(event) =>
              setLocal((prev) => ({ ...prev, phoneNumber: event.target.value }))
            }
            placeholder="Search by phone number"
          />
        </Field>

        <Field label="Status">
          <Select
            options={STATUS_OPTIONS}
            value={local.status}
            onChange={(event) =>
              setLocal((prev) => ({
                ...prev,
                status: (event.target.value as CustomerStatus) || '',
              }))
            }
          />
        </Field>

        <Field label="Gender">
          <Select
            options={GENDER_OPTIONS}
            value={local.gender}
            onChange={(event) =>
              setLocal((prev) => ({
                ...prev,
                gender: (event.target.value as CustomerGender) || '',
              }))
            }
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Min loyalty points">
            <Input
              type="number"
              min={0}
              value={local.minLoyaltyPoints}
              onChange={(event) =>
                setLocal((prev) => ({ ...prev, minLoyaltyPoints: event.target.value }))
              }
              placeholder="0"
            />
          </Field>
          <Field label="Max loyalty points">
            <Input
              type="number"
              min={0}
              value={local.maxLoyaltyPoints}
              onChange={(event) =>
                setLocal((prev) => ({ ...prev, maxLoyaltyPoints: event.target.value }))
              }
              placeholder="No limit"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Created from">
            <Input
              type="date"
              value={local.dateFrom}
              onChange={(event) =>
                setLocal((prev) => ({ ...prev, dateFrom: event.target.value }))
              }
            />
          </Field>
          <Field label="Created to">
            <Input
              type="date"
              value={local.dateTo}
              onChange={(event) =>
                setLocal((prev) => ({ ...prev, dateTo: event.target.value }))
              }
            />
          </Field>
        </div>

        <Field label="Record status">
          <SoftDeleteFilter
            value={local.deletedState}
            onChange={(value) => setLocal((prev) => ({ ...prev, deletedState: value }))}
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
