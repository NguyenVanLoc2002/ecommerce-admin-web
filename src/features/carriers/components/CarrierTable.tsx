import { useMemo, useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { Pagination } from '@/shared/components/table/Pagination';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Select } from '@/shared/components/ui/Select';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatDateTime } from '@/shared/utils/formatDate';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import { cn } from '@/shared/utils/cn';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { Carrier, CarrierListParams } from '../types/carrier.types';
import { CARRIER_PROVIDER_TYPE_VALUES } from '../types/carrier.types';
import { CarrierConnectionBadge } from './CarrierConnectionBadge';
import { CarrierRowActions } from './CarrierRowActions';

const PROVIDER_OPTIONS = [
  { value: '', label: 'All providers' },
  ...CARRIER_PROVIDER_TYPE_VALUES.map((providerType) => ({
    value: providerType,
    label: formatEnumLabel(providerType),
  })),
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const CONFIG_OPTIONS = [
  { value: '', label: 'All configs' },
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
];

const AVATAR_PALETTE = [
  'bg-sky-50 text-sky-700 ring-sky-100',
  'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'bg-amber-50 text-amber-700 ring-amber-100',
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-indigo-50 text-indigo-700 ring-indigo-100',
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

function paletteIndex(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }

  return hash % AVATAR_PALETTE.length;
}

function CarrierAvatar({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !failed;

  if (showImage) {
    return (
      <img
        src={logoUrl ?? ''}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-md border border-gray-100 bg-white object-contain p-0.5"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold ring-1 ring-inset',
        AVATAR_PALETTE[paletteIndex(name)],
      )}
    >
      {initials(name)}
    </div>
  );
}

function countSavedSecrets(carrier: Carrier) {
  return Number(carrier.hasApiKey) + Number(carrier.hasSecretKey) + Number(carrier.hasWebhookSecret);
}

interface CarrierTableProps {
  data: PaginatedResponse<Carrier> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: CarrierListParams;
  onFiltersChange: (updates: Partial<CarrierListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onCreateNew: () => void;
  onView: (carrier: Carrier) => void;
  onEdit: (carrier: Carrier) => void;
  onConfigure: (carrier: Carrier) => void;
}

export function CarrierTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onCreateNew,
  onView,
  onEdit,
  onConfigure,
}: CarrierTableProps) {
  const columns = useMemo<ColumnDef<Carrier>[]>(
    () => [
      {
        id: 'name',
        header: 'Carrier',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <CarrierAvatar name={row.original.name} logoUrl={row.original.logoUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{row.original.name}</p>
              <p className="truncate font-mono text-xs text-gray-400">{row.original.code}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'providerType',
        header: 'Provider',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant="info">{formatEnumLabel(row.original.providerType)}</Badge>
            {row.original.baseUrl && (
              <p className="max-w-[220px] truncate text-xs text-gray-500">{row.original.baseUrl}</p>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Catalog',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="space-y-1">
            <StatusBadge type="entity" status={row.original.status} />
            <p className="text-xs text-gray-500">
              {row.original.status === 'ACTIVE' ? 'Selectable in catalog' : 'Hidden from selection'}
            </p>
          </div>
        ),
      },
      {
        id: 'configEnabled',
        header: 'Config',
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant={row.original.configEnabled ? 'success' : 'default'}>
              {row.original.configEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <p className="text-xs text-gray-500">
              {countSavedSecrets(row.original)} / 3 secrets saved
            </p>
          </div>
        ),
      },
      {
        id: 'connectionStatus',
        header: 'Connection',
        cell: ({ row }) => (
          <div className="space-y-1">
            <CarrierConnectionBadge status={row.original.connectionStatus} />
            <p className="max-w-[220px] truncate text-xs text-gray-500">
              {row.original.lastHealthCheckError ?? 'No recent provider error'}
            </p>
          </div>
        ),
      },
      {
        id: 'lastHealthCheckAt',
        header: 'Last health check',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {row.original.lastHealthCheckAt ? formatDateTime(row.original.lastHealthCheckAt) : 'Not checked'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => (
          <CarrierRowActions
            carrier={row.original}
            onView={onView}
            onEdit={onEdit}
            onConfigure={onConfigure}
          />
        ),
      },
    ],
    [onConfigure, onEdit, onView],
  );

  if (isLoading) {
    return <SkeletonTable rows={6} />;
  }

  if (isError) {
    return <ErrorCard onRetry={onRetry} />;
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) => onFiltersChange({ keyword: keyword || undefined })}
        searchPlaceholder="Search shipping providers..."
        filters={
          <>
            <Select
              options={PROVIDER_OPTIONS}
              value={filters.providerType ?? ''}
              onChange={(event) =>
                onFiltersChange({ providerType: event.target.value as Carrier['providerType'] || undefined })
              }
              className="h-9 w-40 text-sm"
            />
            <Select
              options={STATUS_OPTIONS}
              value={filters.status ?? ''}
              onChange={(event) =>
                onFiltersChange({ status: event.target.value as Carrier['status'] || undefined })
              }
              className="h-9 w-36 text-sm"
            />
            <Select
              options={CONFIG_OPTIONS}
              value={filters.enabled === undefined ? '' : String(filters.enabled)}
              onChange={(event) =>
                onFiltersChange({
                  enabled: event.target.value === '' ? undefined : event.target.value === 'true',
                })
              }
              className="h-9 w-36 text-sm"
            />
          </>
        }
        actions={
          <Button size="md" onClick={onCreateNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add carrier
          </Button>
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        sort={sort}
        onSortChange={onSortChange}
        emptyState={
          <EmptyState
            icon={<Truck className="h-10 w-10" />}
            title="No shipping providers found"
            message="Create carrier entries before staff start using provider-backed shipment flows."
            action={{ label: 'Add carrier', onClick: onCreateNew }}
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page })}
          onPageSizeChange={(size) => onFiltersChange({ size, page: 0 })}
        />
      )}
    </div>
  );
}
