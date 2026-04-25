import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import type { ColumnDef, SortState, RowSelectionState } from './types';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId?: (row: T) => string;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onRowClick?: (row: T) => void;
  activeRowId?: string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

function SortIcon({ column, sort }: { column: string; sort?: SortState }) {
  if (!sort || sort.column !== column) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />;
  return sort.direction === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-gray-700" />
    : <ChevronDown className="h-3.5 w-3.5 text-gray-700" />;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  sort,
  onSortChange,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  activeRowId,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [hiddenColumns] = useState<Set<string>>(new Set());

  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.enableHiding || !hiddenColumns.has(col.id)),
    [columns, hiddenColumns],
  );

  const rowIds = useMemo(
    () => data.map((row, i) => (getRowId ? getRowId(row) : String(i))),
    [data, getRowId],
  );

  const allSelected = rowIds.length > 0 && rowIds.every((id) => rowSelection?.[id]);
  const someSelected = rowIds.some((id) => rowSelection?.[id]);

  const handleSelectAll = (checked: boolean) => {
    if (!onRowSelectionChange) return;
    const next: RowSelectionState = {};
    if (checked) rowIds.forEach((id) => (next[id] = true));
    onRowSelectionChange(next);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onRowSelectionChange || !rowSelection) return;
    onRowSelectionChange({ ...rowSelection, [id]: checked });
  };

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.enableSorting || !onSortChange) return;
    if (sort?.column === col.id) {
      onSortChange({ column: col.id, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ column: col.id, direction: 'asc' });
    }
  };

  const hasSelectColumn = columns.some((c) => c.id === 'select');

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-gray-200', className)}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {visibleColumns.map((col) => {
              if (col.id === 'select') {
                return (
                  <th key="select" scope="col" className="w-10 pl-4 pr-2 py-3">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                );
              }
              const ariaSort = col.enableSorting && sort?.column === col.id
                ? sort.direction === 'asc' ? 'ascending' : 'descending'
                : col.enableSorting ? 'none' : undefined;
              return (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide',
                    col.enableSorting && 'cursor-pointer select-none hover:text-gray-700',
                    col.headerClassName,
                  )}
                  onClick={() => handleSort(col)}
                  onKeyDown={(e) => {
                    if (col.enableSorting && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(col);
                    }
                  }}
                  tabIndex={col.enableSorting ? 0 : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {typeof col.header === 'function' ? col.header() : col.header}
                    {col.enableSorting && <SortIcon column={col.id} sort={sort} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length} className="p-0">
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const rowId = rowIds[index];
              const isSelected = rowSelection?.[rowId] ?? false;
              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer',
                    activeRowId === rowId
                      ? 'bg-primary-50'
                      : isSelected
                        ? 'bg-primary-50'
                        : 'hover:bg-gray-50',
                  )}
                >
                  {visibleColumns.map((col) => {
                    if (col.id === 'select') {
                      return (
                        <td key="select" className="pl-4 pr-2 py-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={(checked) => handleSelectRow(rowId, checked)}
                          />
                        </td>
                      );
                    }
                    const cellContent = col.cell
                      ? col.cell({ row: { original: row, index } })
                      : col.accessorKey !== undefined
                        ? String(row[col.accessorKey] ?? '')
                        : null;
                    return (
                      <td
                        key={col.id}
                        className={cn('px-4 py-3 text-gray-700', col.className)}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {hasSelectColumn && rowSelection && onRowSelectionChange && (
        <div className="sr-only" aria-live="polite">
          {Object.values(rowSelection).filter(Boolean).length} rows selected
        </div>
      )}
    </div>
  );
}
