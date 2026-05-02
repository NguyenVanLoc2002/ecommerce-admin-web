import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Tag } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDate } from '@/shared/utils/formatDate';
import { resolveSoftDeleteState } from '@/shared/utils/softDelete';
import { routes } from '@/constants/routes';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import { SoftDeleteState, type PaginatedResponse } from '@/shared/types/api.types';
import type { PromotionSummary, PromotionListParams } from '../types/promotion.types';
import { PromotionRowActions } from './PromotionRowActions';

const SCOPE_LABELS: Record<string, string> = {
  ORDER: 'Order',
  CATEGORY: 'Category',
  BRAND: 'Brand',
  PRODUCT: 'Product',
  SHIPPING: 'Shipping',
};

interface PromotionTableProps {
  data: PaginatedResponse<PromotionSummary> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: PromotionListParams;
  onFiltersChange: (updates: Partial<PromotionListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onOpenFilters: () => void;
}

function formatDiscount(promotion: PromotionSummary): string {
  if (promotion.discountType === 'PERCENTAGE') {
    const base = `${promotion.discountValue}% off`;
    return promotion.maxDiscountAmount
      ? `${base} (max ${formatMoney(promotion.maxDiscountAmount)})`
      : base;
  }
  return `${formatMoney(promotion.discountValue)} off`;
}

export function PromotionTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onOpenFilters,
}: PromotionTableProps) {
  const navigate = useNavigate();

  const hasActiveFilters =
    filters.name !== undefined ||
    filters.scope !== undefined ||
    filters.active !== undefined ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined ||
    filters.deletedState !== undefined && filters.deletedState !== SoftDeleteState.ACTIVE;

  const columns = useMemo<ColumnDef<PromotionSummary>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        enableSorting: true,
        cell: ({ row }) => (
          <div>
            <button
              type="button"
              onClick={() => navigate(routes.promotions.edit(row.original.id))}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline text-left"
            >
              {row.original.name}
            </button>
            <p className="mt-0.5 text-xs text-gray-400">
              {SCOPE_LABELS[row.original.scope] ?? row.original.scope}
            </p>
          </div>
        ),
      },
      {
        id: 'discount',
        header: 'Discount',
        cell: ({ row }) => (
          <div>
            <span className="text-sm font-medium text-gray-900">
              {formatDiscount(row.original)}
            </span>
            {row.original.minimumOrderAmount != null && (
              <p className="mt-0.5 text-xs text-gray-400">
                Min: {formatMoney(row.original.minimumOrderAmount)}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'dates',
        header: 'Date Range',
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
          </span>
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
        id: 'usage',
        header: 'Usage',
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-gray-700">
            {row.original.usageCount}
            {' / '}
            {row.original.usageLimit != null ? row.original.usageLimit : '∞'}
          </span>
        ),
      },
      {
        id: 'active',
        header: 'Status',
        cell: ({ row }) =>
          row.original.active ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="default">Inactive</Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-20',
        cell: ({ row }) => <PromotionRowActions promotion={row.original} />,
      },
    ],
    [filters.deletedState, navigate],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.name ?? ''}
        onSearchChange={(name) => onFiltersChange({ name: name || undefined, page: 0 })}
        searchPlaceholder="Search by name…"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenFilters}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filters
            {hasActiveFilters && (
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
            icon={<Tag className="h-10 w-10" />}
            title="No promotions found"
            message={
              hasActiveFilters
                ? 'No promotions match your filters.'
                : filters.deletedState === SoftDeleteState.DELETED
                  ? 'Deleted promotions will appear here.'
                  : 'Create your first promotion to start offering discounts.'
            }
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<PromotionListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<PromotionListParams>)}
        />
      )}
    </div>
  );
}
