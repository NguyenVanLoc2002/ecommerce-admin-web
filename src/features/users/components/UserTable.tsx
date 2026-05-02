import { useMemo } from 'react';
import { Plus, SlidersHorizontal, Users } from 'lucide-react';
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
import type { AdminUser, AdminUserListParams } from '../types/user.types';
import { UserRoleBadge, UserStatusBadge } from './UserBadges';
import { UserRowActions } from './UserRowActions';

interface UserTableProps {
  data: PaginatedResponse<AdminUser> | undefined;
  isLoading: boolean;
  isError: boolean;
  isSearching?: boolean;
  onRetry: () => void;
  filters: AdminUserListParams;
  onFiltersChange: (updates: Partial<AdminUserListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onOpenFilters: () => void;
  onCreate: () => void;
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
}

function formatName(user: AdminUser) {
  const fullName = `${user.firstName} ${user.lastName ?? ''}`.trim();
  return fullName || user.email;
}

export function UserTable({
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
  onCreate,
  onView,
  onEdit,
}: UserTableProps) {
  const activeFilterCount = [
    filters.email,
    filters.phoneNumber,
    filters.status,
    filters.role,
  ].filter((value) => value !== undefined && value !== '').length;

  const columns = useMemo<ColumnDef<AdminUser>[]>(
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
        enableSorting: true,
        cell: ({ row }) => (
          <span className="truncate font-medium text-gray-700">{row.original.email}</span>
        ),
      },
      {
        id: 'phoneNumber',
        header: 'Phone',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.phoneNumber ?? 'Not provided'}
          </span>
        ),
      },
      {
        id: 'roles',
        header: 'Roles',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            {row.original.roles.map((role) => (
              <UserRoleBadge key={role} role={role} />
            ))}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
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
          <UserRowActions user={row.original} onView={onView} onEdit={onEdit} />
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
        searchPlaceholder="Search staff by name, email, or phone..."
        isSearching={isSearching}
        actions={
          <>
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
            <Button size="sm" onClick={onCreate} leftIcon={<Plus className="h-4 w-4" />}>
              Add Staff
            </Button>
          </>
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
            icon={<Users className="h-10 w-10" />}
            title="No staff users found"
            message="Try adjusting your filters or create a new staff member."
            action={{ label: 'Add Staff', onClick: onCreate }}
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
