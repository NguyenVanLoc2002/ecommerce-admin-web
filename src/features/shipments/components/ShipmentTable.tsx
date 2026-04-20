import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Truck, Plus, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/shared/components/table/DataTable';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { Pagination } from '@/shared/components/table/Pagination';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDate, formatDateTime } from '@/shared/utils/formatDate';
import { routes } from '@/constants/routes';
import { cn } from '@/shared/utils/cn';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { ShipmentSummary, ShipmentListParams } from '../types/shipment.types';
import { ShipmentRowActions } from './ShipmentRowActions';

interface ShipmentTableProps {
  data: PaginatedResponse<ShipmentSummary> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: ShipmentListParams;
  onFiltersChange: (updates: Partial<ShipmentListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onOpenFilters: () => void;
  onCreateNew: () => void;
}

function TrackingCell({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      void navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    },
    [code],
  );

  return (
    <span className="group inline-flex items-center gap-1">
      <span className="font-mono text-sm font-semibold text-primary-600">{code}</span>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'invisible group-hover:visible p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors',
          copied && 'visible text-success-600',
        )}
        aria-label="Copy tracking code"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

export function ShipmentTable({
  data,
  isLoading,
  isError,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onOpenFilters,
  onCreateNew,
}: ShipmentTableProps) {
  const navigate = useNavigate();

  const hasActiveFilters =
    filters.status !== undefined ||
    filters.fromDate !== undefined ||
    filters.toDate !== undefined ||
    filters.orderId !== undefined;

  const columns = useMemo<ColumnDef<ShipmentSummary>[]>(
    () => [
      {
        id: 'tracking',
        header: 'Shipment',
        cell: ({ row }) => (
          <div>
            <button
              type="button"
              onClick={() => navigate(routes.shipments.detail(row.original.id))}
              className="group/tracking"
            >
              {row.original.trackingNumber ? (
                <TrackingCell code={row.original.trackingNumber} />
              ) : (
                <span className="font-mono text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                  #{row.original.id}
                </span>
              )}
            </button>
            <p className="mt-0.5 text-xs text-gray-400">
              Order{' '}
              <span className="font-mono">#{row.original.orderCode}</span>
            </p>
          </div>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-gray-900">{row.original.customer.fullName}</p>
            <p className="text-xs text-gray-400">{row.original.customer.phone}</p>
          </div>
        ),
      },
      {
        id: 'carrier',
        header: 'Carrier',
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.carrier ?? <span className="text-gray-300">—</span>}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => (
          <StatusBadge type="shipment" status={row.original.status} />
        ),
      },
      {
        id: 'estimatedDeliveryDate',
        header: 'Est. Delivery',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {row.original.estimatedDeliveryDate ? (
              formatDate(row.original.estimatedDeliveryDate)
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </span>
        ),
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDateTime(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-16',
        cell: ({ row }) => <ShipmentRowActions shipment={row.original} />,
      },
    ],
    [navigate],
  );

  if (isLoading) return <SkeletonTable rows={8} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) => onFiltersChange({ keyword: keyword || undefined })}
        searchPlaceholder="Search by tracking code or order…"
        actions={
          <>
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
            <Button
              size="sm"
              onClick={onCreateNew}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New Shipment
            </Button>
          </>
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
            title="No shipments found"
            message="Create a shipment to start tracking deliveries."
            action={{ label: 'New Shipment', onClick: onCreateNew }}
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<ShipmentListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<ShipmentListParams>)}
        />
      )}
    </div>
  );
}
