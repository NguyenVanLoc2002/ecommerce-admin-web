import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, SlidersHorizontal } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { CopyValueButton } from '@/shared/components/ui/CopyValueButton';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDateTimeSeconds } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { AuditLog, AuditLogListParams } from '../types/auditLog.types';
import { AuditLogChangesCell } from './AuditLogChangesCell';

function buildEntityHref(entityType: string, entityId: string): string | null {
  switch (entityType) {
    case 'ORDER':
      return routes.orders.detail(entityId);
    case 'PRODUCT':
      return routes.products.edit(entityId);
    case 'VOUCHER':
      return routes.vouchers.edit(entityId);
    case 'PAYMENT':
      return routes.payments.detail(entityId);
    default:
      return null;
  }
}

function getEntityLabel(entityType: string): string {
  switch (entityType) {
    case 'ORDER':
      return 'Order record';
    case 'PRODUCT':
      return 'Product record';
    case 'VOUCHER':
      return 'Voucher record';
    case 'PAYMENT':
      return 'Payment record';
    default:
      return `${entityType.toLowerCase()} record`;
  }
}

function getEntityActionLabel(entityType: string): string {
  switch (entityType) {
    case 'ORDER':
      return 'View order';
    case 'PRODUCT':
      return 'View product';
    case 'VOUCHER':
      return 'View voucher';
    case 'PAYMENT':
      return 'View payment';
    default:
      return 'Open record';
  }
}

interface AuditLogTableProps {
  data: PaginatedResponse<AuditLog> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: AuditLogListParams;
  onFiltersChange: (updates: Partial<AuditLogListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onOpenFilters: () => void;
}

const hasActiveFilters = (filters: AuditLogListParams) =>
  filters.action !== undefined ||
  filters.entityType !== undefined ||
  filters.entityId !== undefined ||
  filters.actor !== undefined ||
  filters.fromDate !== undefined ||
  filters.toDate !== undefined;

export function AuditLogTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onOpenFilters,
}: AuditLogTableProps) {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        id: 'createdAt',
        header: 'Time',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums text-gray-500">
            {formatDateTimeSeconds(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => <StatusBadge type="audit-action" status={row.original.action} />,
      },
      {
        id: 'entity',
        header: 'Entity',
        cell: ({ row }) => {
          const { entityType, entityId } = row.original;
          const href = entityId ? buildEntityHref(entityType, entityId) : null;

          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {entityType}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {entityId ? getEntityLabel(entityType) : 'Unknown record'}
              </span>
              <div className="mt-1 flex items-center gap-2">
                {entityId && href && (
                  <button
                    type="button"
                    onClick={() => navigate(href)}
                    className="text-left text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {getEntityActionLabel(entityType)}
                  </button>
                )}
                {entityId && <CopyValueButton value={entityId} label="Copy ID" />}
              </div>
            </div>
          );
        },
      },
      {
        id: 'actor',
        header: 'Performed By',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.actor || '-'}</span>
        ),
      },
      {
        id: 'details',
        header: 'Details',
        className: 'min-w-[200px] max-w-[400px]',
        cell: ({ row }) => <AuditLogChangesCell details={row.original.details} />,
      },
    ],
    [navigate],
  );

  if (isLoading) return <SkeletonTable rows={10} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  const activeFilters = hasActiveFilters(filters);

  return (
    <div className="space-y-4">
      <TableToolbar
        filters={
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenFilters}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filters
            {activeFilters && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </Button>
        }
      />

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        sort={sort}
        onSortChange={onSortChange}
        emptyState={
          <EmptyState
            icon={<ClipboardList className="h-10 w-10" />}
            title="No audit log entries"
            message={
              activeFilters
                ? 'No entries match your filters.'
                : 'Admin actions will appear here as they happen.'
            }
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page })}
          onPageSizeChange={(size) => onFiltersChange({ size })}
        />
      )}
    </div>
  );
}
