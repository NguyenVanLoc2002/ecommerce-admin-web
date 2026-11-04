import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FolderTree, ImageOff, Plus, Tag } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { Pagination } from '@/shared/components/table/Pagination';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatDate } from '@/shared/utils/formatDate';
import { resolveSoftDeleteState } from '@/shared/utils/softDelete';
import type { ColumnDef, SortState } from '@/shared/components/table/types';
import { SoftDeleteState, type PaginatedResponse } from '@/shared/types/api.types';
import type { Category, CategoryListParams } from '../types/category.types';
import { CategoryRowActions } from './CategoryRowActions';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];
const RECORD_SCOPE_OPTIONS = [
  { value: SoftDeleteState.ACTIVE, label: 'Live' },
  { value: SoftDeleteState.DELETED, label: 'Deleted' },
  { value: SoftDeleteState.ALL, label: 'All' },
];
const EMPTY_CATEGORIES: Category[] = [];

interface CategoryTableRow {
  category: Category;
  depth: number;
  parentName: string | null;
  parentLoaded: boolean;
  ancestorIds: string[];
  ancestorHasNext: boolean[];
  isLastChild: boolean;
  hasChildren: boolean;
}

function CategoryThumbnail({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-8 w-8 shrink-0 rounded-md border border-gray-200 bg-white object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-400"
    >
      {imageUrl ? <ImageOff className="h-4 w-4" /> : <FolderTree className="h-4 w-4" />}
    </div>
  );
}

function TreeConnector({
  depth,
  ancestorHasNext,
  isLastChild,
}: Pick<CategoryTableRow, 'depth' | 'ancestorHasNext' | 'isLastChild'>) {
  if (depth === 0) {
    return null;
  }

  return (
    <div className="flex h-10 shrink-0 items-stretch" aria-hidden>
      {ancestorHasNext.map((hasNext, index) => (
        <div key={`ancestor-${index}`} className="relative h-10 w-6 shrink-0">
          {hasNext && (
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gray-300" />
          )}
        </div>
      ))}
      <div className="relative h-10 w-6 shrink-0">
        <span className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-gray-300" />
        {!isLastChild && (
          <span className="absolute left-1/2 bottom-0 h-1/2 w-px -translate-x-1/2 bg-gray-300" />
        )}
        <span className="absolute left-1/2 top-1/2 h-px w-4 bg-gray-300" />
      </div>
    </div>
  );
}

interface CategoryTableProps {
  data: PaginatedResponse<Category> | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  filters: CategoryListParams;
  onFiltersChange: (updates: Partial<CategoryListParams>) => void;
  sort: SortState | undefined;
  onSortChange: (sort: SortState) => void;
  onEdit: (category: Category) => void;
  onCreateNew: () => void;
}

export function CategoryTable({
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
}: CategoryTableProps) {
  const items = data?.items ?? EMPTY_CATEGORIES;
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  const rows = useMemo<CategoryTableRow[]>(() => {
    const categoriesById = new Map(items.map((item) => [String(item.id), item]));
    const itemOrder = new Map(items.map((item, index) => [String(item.id), index]));
    const childrenByParent = new Map<string, Category[]>();
    const roots: Category[] = [];

    for (const item of items) {
      if (item.parentId && categoriesById.has(String(item.parentId))) {
        const siblings = childrenByParent.get(String(item.parentId)) ?? [];
        siblings.push(item);
        childrenByParent.set(String(item.parentId), siblings);
        continue;
      }

      roots.push(item);
    }

    const compareByIncomingOrder = (left: Category, right: Category) =>
      (itemOrder.get(String(left.id)) ?? 0) - (itemOrder.get(String(right.id)) ?? 0);

    for (const siblings of childrenByParent.values()) {
      siblings.sort(compareByIncomingOrder);
    }
    roots.sort(compareByIncomingOrder);

    const visited = new Set<string>();
    const flattened: CategoryTableRow[] = [];

    const visit = (
      item: Category,
      depth: number,
      ancestorIds: string[],
      ancestorHasNext: boolean[],
      isLastChild: boolean,
    ) => {
      const id = String(item.id);
      if (visited.has(id)) return;
      visited.add(id);

      const parent = item.parentId ? categoriesById.get(String(item.parentId)) ?? null : null;
      const children = childrenByParent.get(id) ?? EMPTY_CATEGORIES;

      flattened.push({
        category: item,
        depth,
        parentName: parent?.name ?? null,
        parentLoaded: item.parentId ? categoriesById.has(String(item.parentId)) : true,
        ancestorIds,
        ancestorHasNext,
        isLastChild,
        hasChildren: children.length > 0,
      });

      children.forEach((child, index) => {
        visit(
          child,
          depth + 1,
          [...ancestorIds, id],
          [...ancestorHasNext, !isLastChild],
          index === children.length - 1,
        );
      });
    };

    roots.forEach((root, index) => {
      visit(root, 0, [], [], index === roots.length - 1);
    });

    items.forEach((item) => {
      if (!visited.has(String(item.id))) {
        visit(item, 0, [], [], true);
      }
    });

    return flattened;
  }, [items]);

  const visibleRows = useMemo(
    () =>
      rows.filter((row) => row.ancestorIds.every((ancestorId) => !collapsedIds.has(ancestorId))),
    [collapsedIds, rows],
  );

  const toggleCollapsed = (categoryId: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const columns = useMemo<ColumnDef<CategoryTableRow>[]>(
    () => [
      {
        id: 'category',
        header: 'Category',
        enableSorting: true,
        sortField: 'name',
        cell: ({ row }) => {
          const categoryId = String(row.original.category.id);
          const isCollapsed = collapsedIds.has(categoryId);

          return (
            <div className="flex min-w-0 items-center gap-2">
              <TreeConnector
                depth={row.original.depth}
                ancestorHasNext={row.original.ancestorHasNext}
                isLastChild={row.original.isLastChild}
              />
              {row.original.hasChildren ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleCollapsed(categoryId);
                  }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label={isCollapsed ? 'Expand category' : 'Collapse category'}
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <span className="h-5 w-5 shrink-0" aria-hidden />
              )}
              <CategoryThumbnail
                name={row.original.category.name}
                imageUrl={row.original.category.imageUrl}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {row.original.category.name}
                  </p>
                  {row.original.depth > 0 && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                      L{row.original.depth + 1}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate font-mono text-xs text-gray-400">
                    {row.original.category.slug}
                  </p>
                  {row.original.depth > 0 && row.original.parentName && (
                    <p className="truncate text-xs text-gray-400">
                      under {row.original.parentName}
                    </p>
                  )}
                  {row.original.depth > 0 && !row.original.parentLoaded && (
                    <p className="truncate text-xs text-gray-400">parent not loaded</p>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isDeleted = resolveSoftDeleteState(row.original.category, filters.deletedState);
          return (
            <div className="flex flex-col items-start gap-1">
              <StatusBadge type="entity" status={row.original.category.status} />
              {isDeleted === true && <StatusBadge type="soft-delete" status={true} />}
            </div>
          );
        },
      },
      {
        id: 'sortOrder',
        header: 'Sort Order',
        enableSorting: true,
        headerClassName: 'text-right',
        className: 'text-right',
        cell: ({ row }) => (
          row.original.category.sortOrder == null ? (
            <span className="text-sm text-gray-400">Not set</span>
          ) : (
            <span className="text-sm font-semibold tabular-nums text-gray-700">
              {row.original.category.sortOrder}
            </span>
          )
        ),
      },
      {
        id: 'createdAt',
        header: 'Created At',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-gray-500">
            {formatDate(row.original.category.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'w-16',
        cell: ({ row }) => (
          <CategoryRowActions category={row.original.category} onEdit={onEdit} />
        ),
      },
    ],
    [collapsedIds, filters.deletedState, onEdit],
  );

  if (isLoading) return <SkeletonTable rows={6} />;
  if (isError) return <ErrorCard onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px] max-w-md flex-1">
          <label
            htmlFor="category-search"
            className="mb-1 block px-1 text-[11px] font-medium uppercase tracking-wide text-gray-500"
          >
            Search
          </label>
          <Input
            id="category-search"
            value={filters.name ?? ''}
            onChange={(e) => onFiltersChange({ name: e.target.value || undefined })}
            placeholder="Search categories..."
            className="w-full"
          />
        </div>

        <div className="flex min-w-[140px] flex-col gap-1">
          <label
            htmlFor="category-status-filter"
            className="px-1 text-[11px] font-medium uppercase tracking-wide text-gray-500"
          >
            Status
          </label>
          <Select
            id="category-status-filter"
            options={STATUS_FILTER_OPTIONS}
            value={filters.status ?? ''}
            onChange={(e) => onFiltersChange({ status: e.target.value || undefined })}
            className="h-9 w-40 text-sm"
          />
        </div>

        <div className="flex min-w-[140px] flex-col gap-1">
          <label
            htmlFor="category-record-scope-filter"
            className="px-1 text-[11px] font-medium uppercase tracking-wide text-gray-500"
          >
            Record scope
          </label>
          <Select
            id="category-record-scope-filter"
            options={RECORD_SCOPE_OPTIONS}
            value={filters.deletedState ?? SoftDeleteState.ACTIVE}
            onChange={(e) =>
              onFiltersChange({ deletedState: e.target.value as SoftDeleteState })
            }
            className="h-9 w-40 text-sm"
          />
        </div>

        <div className="ml-auto flex items-end">
          <Button size="md" onClick={onCreateNew} leftIcon={<Plus className="h-4 w-4" />}>
            Add Category
          </Button>
        </div>
      </div>

      <DataTable
        data={visibleRows}
        columns={columns}
        getRowId={(row) => String(row.category.id)}
        sort={sort}
        onSortChange={onSortChange}
        emptyState={
          <EmptyState
            icon={<Tag className="h-10 w-10" />}
            title="No categories found"
            message={
              filters.deletedState === SoftDeleteState.DELETED
                ? 'Deleted categories will appear here.'
                : filters.deletedState === SoftDeleteState.ALL
                  ? 'Adjust your filters or add a new category.'
                  : 'Create your first category to organize your catalog.'
            }
            action={{ label: 'Add Category', onClick: onCreateNew }}
          />
        }
      />

      {data && data.totalPages > 1 && (
        <Pagination
          pagination={data}
          onPageChange={(page) => onFiltersChange({ page } as Partial<CategoryListParams>)}
          onPageSizeChange={(size) => onFiltersChange({ size } as Partial<CategoryListParams>)}
        />
      )}
    </div>
  );
}
