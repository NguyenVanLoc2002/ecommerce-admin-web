import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, SlidersHorizontal } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDateTimeSeconds } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { AuditLog, AuditLogListParams } from '../types/auditLog.types';
import { AuditLogChangesCell } from './AuditLogChangesCell';

// Maps action prefixes to badge variants
type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';

function actionBadgeVariant(action: string): BadgeVariant {
  if (action.startsWith('ORDER_')) return 'primary';
  if (action.startsWith('PRODUCT_')) return 'info';
  if (action.startsWith('STOCK_')) return 'warning';
  if (action.startsWith('VOUCHER_')) return 'success';
  if (action.startsWith('PAYMENT_')) return 'primary';
  if (action.startsWith('REVIEW_')) return 'warning';
  if (action.startsWith('USER_')) return 'danger';
  return 'default';
}

function formatActionLabel(action: string): string {
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Maps entityType → route function for entity ID links
function buildEntityHref(entityType: string, entityId: number): string | null {
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
  filters.performedBy !== undefined ||
  filters.from !== undefined ||
  filters.to !== undefined;

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
        id: 'performedAt',
        header: 'Time',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums">
            {formatDateTimeSeconds(row.original.performedAt)}
          </span>
        ),
      },
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <Badge variant={actionBadgeVariant(row.original.action)}>
            {formatActionLabel(row.original.action)}
          </Badge>
        ),
      },
      {
        id: 'entity',
        header: 'Entity',
        cell: ({ row }) => {
          const { entityType, entityId } = row.original;
          const href = buildEntityHref(entityType, entityId);
          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {entityType}
              </span>
              {href ? (
                <button
                  type="button"
                  onClick={() => navigate(href)}
                  className="text-sm font-mono text-primary-600 hover:text-primary-700 hover:underline text-left"
                >
                  #{entityId}
                </button>
              ) : (
                <span className="font-mono text-sm text-gray-700">#{entityId}</span>
              )}
            </div>
          );
        },
      },
      {
        id: 'performedBy',
        header: 'Performed By',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.performedBy}</span>
        ),
      },
      {
        id: 'changes',
        header: 'Changes',
        className: 'min-w-[200px] max-w-[400px]',
        cell: ({ row }) => <AuditLogChangesCell changes={row.original.changes} />,
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
        getRowId={(row) => String(row.id)}
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
          onPageChange={(page) => onFiltersChange({ page } as Partial<AuditLogListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<AuditLogListParams>)}
        />
      )}
    </div>
  );
}
