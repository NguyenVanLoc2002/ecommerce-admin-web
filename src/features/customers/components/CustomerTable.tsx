import { useMemo } from 'react';
import { Heart, SlidersHorizontal, UsersRound } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { Pagination } from '@/shared/components/table/Pagination';
import { TableToolbar } from '@/shared/components/table/TableToolbar';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { formatDateTime } from '@/shared/utils/formatDate';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { AdminCustomer, AdminCustomerFilter } from '../types/customer.types';
import { CustomerGenderBadge, CustomerStatusBadge } from './CustomerBadges';
import { CustomerRowActions } from './CustomerRowActions';

interface CustomerTableProps {
  data: PaginatedResponse<AdminCustomer> | undefined;
  isLoading: boolean;
  isError: boolean;
  isSearching?: boolean;
  onRetry: () => void;
  filters: AdminCustomerFilter;
  onFiltersChange: (updates: Partial<AdminCustomerFilter>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onOpenFilters: () => void;
  onView: (customer: AdminCustomer) => void;
  onEdit: (customer: AdminCustomer) => void;
}

function formatName(customer: AdminCustomer) {
  const fullName = `${customer.firstName} ${customer.lastName ?? ''}`.trim();
  return fullName || customer.email;
}

export function CustomerTable({
  data,
  isLoading,
  isError,
  isSearching,
  onRetry,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  onOpenFilters,
  onView,
  onEdit,
}: CustomerTableProps) {
  const activeFilterCount = [
    filters.email,
    filters.phoneNumber,
    filters.status,
    filters.gender,
    filters.minLoyaltyPoints,
    filters.maxLoyaltyPoints,
    filters.dateFrom,
    filters.dateTo,
    filters.deletedState && filters.deletedState !== 'ACTIVE' ? filters.deletedState : undefined,
  ].filter((value) => value !== undefined && value !== '').length;

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <p className="truncate text-sm font-semibold text-gray-900">
            {formatName(row.original)}
          </p>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="truncate font-medium text-gray-700">{row.original.email}</span>
        ),
      },
      {
        id: 'phoneNumber',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.phoneNumber ?? 'Not provided'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => <CustomerStatusBadge status={row.original.status} />,
      },
      {
        id: 'gender',
        header: 'Gender',
        cell: ({ row }) => <CustomerGenderBadge gender={row.original.gender} />,
      },
      {
        id: 'loyaltyPoints',
        header: 'Loyalty Points',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
            <Heart className="h-3.5 w-3.5 text-rose-400" aria-hidden />
            {row.original.loyaltyPoints.toLocaleString('vi-VN')}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => (
          <CustomerRowActions customer={row.original} onView={onView} onEdit={onEdit} />
        ),
      },
    ],
    [onEdit, onView],
  );

  if (isLoading) {
    return <SkeletonTable rows={8} />;
  }

  if (isError) {
    return <ErrorCard onRetry={onRetry} />;
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={filters.keyword ?? ''}
        onSearchChange={(keyword) =>
          onFiltersChange({ keyword: keyword || undefined, page: 0 })
        }
        searchPlaceholder="Search customers by name, email, or phone..."
        isSearching={isSearching}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenFilters}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                {activeFilterCount}
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
        onRowClick={onView}
        emptyState={
          <EmptyState
            icon={<UsersRound className="h-10 w-10" />}
            title="No customers found"
            message="Try adjusting your filters to find customer accounts."
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
