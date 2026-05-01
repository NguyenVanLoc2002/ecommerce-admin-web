import { useMemo, useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { SoftDeleteFilter } from '@/shared/components/ui/SoftDeleteFilter';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDate } from '@/shared/utils/formatDate';
import { cn } from '@/shared/utils/cn';
import { resolveSoftDeleteState } from '@/shared/utils/softDelete';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import { SoftDeleteState, type PaginatedResponse } from '@/shared/types/api.types';
import type { EntityStatus } from '@/shared/types/enums';
import type { Brand, BrandListParams } from '../types/brand.types';
import { BrandRowActions } from './BrandRowActions';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const AVATAR_PALETTE = [
  'bg-blue-50 text-blue-700 ring-blue-100',
  'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'bg-amber-50 text-amber-700 ring-amber-100',
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-violet-50 text-violet-700 ring-violet-100',
  'bg-teal-50 text-teal-700 ring-teal-100',
];

function paletteIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % AVATAR_PALETTE.length;
}

function brandInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || trimmed[0]!.toUpperCase();
}

function BrandAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const showImage = logoUrl && !failed;

  if (showImage) {
    return (
      <img
        src={logoUrl}
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
      {brandInitials(name)}
    </div>
  );
}

interface BrandTableProps {
  data: PaginatedResponse<Brand> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: BrandListParams;
  onFiltersChange: (updates: Partial<BrandListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onEdit: (brand: Brand) => void;
  onCreateNew: () => void;
}

export function BrandTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onEdit,
  onCreateNew,
}: BrandTableProps) {
  const columns = useMemo<ColumnDef<Brand>[]>(
    () => [
      {
        id: 'name',
        header: 'Brand',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <BrandAvatar name={row.original.name} logoUrl={row.original.logoUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{row.original.name}</p>
              <p className="truncate font-mono text-xs text-gray-400">{row.original.slug}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'recordStatus',
        header: 'Record Status',
        cell: ({ row }) => (
          <StatusBadge
            type="soft-delete"
            status={resolveSoftDeleteState(row.original, filters.deletedState)}
          />
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge type="entity" status={row.original.status as EntityStatus} />
        ),
      },
      {
        id: 'productCount',
        header: 'Products',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: ({ row }) => (
          <span className="text-sm font-semibold tabular-nums text-gray-700">
            {row.original.productCount}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => (
          <BrandRowActions brand={row.original} onEdit={onEdit} />
        ),
      },
    ],
    [filters.deletedState, onEdit],
  );

  if (isLoading) return <SkeletonTable rows={6} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.name ?? ''}
        onSearchChange={(name) => onFiltersChange({ name: name || undefined })}
        searchPlaceholder="Search brands…"
        filters={
          <>
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={filters.status ?? ''}
              onChange={(e) => onFiltersChange({ status: e.target.value || undefined })}
              className="h-9 w-36 text-sm"
            />
            <SoftDeleteFilter
              value={filters.deletedState ?? SoftDeleteState.ACTIVE}
              onChange={(deletedState) => onFiltersChange({ deletedState })}
              className="h-9 w-32 text-sm"
            />
          </>
        }
        actions={
          <Button size="md" onClick={onCreateNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add Brand
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
            icon={<Briefcase className="h-10 w-10" />}
            title={
              filters.deletedState === SoftDeleteState.DELETED
                ? 'No deleted brands'
                : filters.deletedState === SoftDeleteState.ALL
                  ? 'No brands yet'
                  : 'No active brands'
            }
            message={
              filters.deletedState === SoftDeleteState.DELETED
                ? 'Deleted brands will appear here.'
                : 'Add brands to associate them with your products.'
            }
            action={{ label: 'Add Brand', onClick: onCreateNew }}
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<BrandListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<BrandListParams>)}
        />
      )}
    </div>
  );
}
