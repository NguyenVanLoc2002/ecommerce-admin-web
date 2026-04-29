import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, SlidersHorizontal, Ticket } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatDate } from '@/shared/utils/formatDate';
import { toast } from '@/shared/stores/uiStore';
import { routes } from '@/constants/routes';
import type { ColumnDef } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { Voucher, VoucherListParams } from '../types/voucher.types';
import { VoucherRowActions } from './VoucherRowActions';

interface VoucherTableProps {
  data: PaginatedResponse<Voucher> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: VoucherListParams;
  onFiltersChange: (updates: Partial<VoucherListParams>) => void;
  onOpenFilters: () => void;
}

function formatDiscount(voucher: Voucher): string {
  if (voucher.discountType === 'PERCENTAGE') {
    const base = `${voucher.discountValue}% off`;
    return voucher.maxDiscountAmount
      ? `${base} (max ${formatMoney(voucher.maxDiscountAmount)})`
      : base;
  }
  return `${formatMoney(voucher.discountValue)} off`;
}

export function VoucherTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  onOpenFilters,
}: VoucherTableProps) {
  const navigate = useNavigate();

  const hasActiveFilters =
    filters.active !== undefined ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined;

  const columns = useMemo<ColumnDef<Voucher>[]>(
    () => [
      {
        id: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(routes.vouchers.edit(row.original.id))}
              className="font-mono text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              {row.original.code}
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(row.original.code);
                toast.success('Code copied.');
              }}
              title="Copy code"
              className="text-gray-400 hover:text-gray-600"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
      {
        id: 'promotion',
        header: 'Promotion',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.promotionName}</span>
        ),
      },
      {
        id: 'discount',
        header: 'Discount',
        cell: ({ row }) => (
          <div>
            <span className="text-sm font-medium text-gray-900">{formatDiscount(row.original)}</span>
            {row.original.minimumOrderAmount != null && (
              <p className="mt-0.5 text-xs text-gray-400">
                Min: {formatMoney(row.original.minimumOrderAmount)}
              </p>
            )}
          </div>
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
        id: 'dates',
        header: 'Date Range',
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
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
        className: 'w-24',
        cell: ({ row }) => <VoucherRowActions voucher={row.original} />,
      },
    ],
    [navigate],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.code ?? ''}
        onSearchChange={(code) => onFiltersChange({ code: code || undefined, page: 0 })}
        searchPlaceholder="Search by code…"
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
        emptyState={
          <EmptyState
            icon={<Ticket className="h-10 w-10" />}
            title="No vouchers found"
            message={
              hasActiveFilters
                ? 'No vouchers match your filters.'
                : 'Create your first voucher to let customers apply discount codes.'
            }
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<VoucherListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<VoucherListParams>)}
        />
      )}
    </div>
  );
}
