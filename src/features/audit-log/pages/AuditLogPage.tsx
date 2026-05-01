import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import type { SortState } from '@/shared/components/table/types';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditLogTable } from '../components/AuditLogTable';
import { AuditLogFilters } from '../components/AuditLogFilters';
import type { AuditLogListParams } from '../types/auditLog.types';

const DEFAULT_FILTERS: AuditLogListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  action: undefined,
  entityType: undefined,
  entityId: undefined,
  actor: undefined,
  fromDate: undefined,
  toDate: undefined,
};

const DEFAULT_SORT: SortState = {
  column: 'createdAt',
  direction: 'desc',
};

export function AuditLogPage() {
  const [filters, setFilters, resetFilters] = useTableFilters<AuditLogListParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState | undefined>(DEFAULT_SORT);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useAuditLogs(filters);

  const handleSortChange = (newSort: SortState) => {
    setSort(newSort);
    setFilters({ sort: `${newSort.column},${newSort.direction}` });
  };

  const handleFiltersApply = (updates: Partial<AuditLogListParams>) => {
    setFilters({ ...updates, page: 0 });
  };

  const handleFiltersReset = () => {
    setSort(DEFAULT_SORT);
    resetFilters();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Audit Log"
          description="Read-only record of all admin actions across the system."
        />

        <AuditLogTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={handleSortChange}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>

      <AuditLogFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={handleFiltersApply}
        onReset={handleFiltersReset}
      />
    </AdminLayout>
  );
}
