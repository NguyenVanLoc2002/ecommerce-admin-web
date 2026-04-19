import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import type { SortState } from '@/shared/components/table/types';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useUpdateCategory } from '../hooks/useUpdateCategory';
import { CategoryTable } from '../components/CategoryTable';
import { CategoryForm } from '../components/CategoryForm';
import type { Category, CategoryListParams } from '../types/category.types';
import type { CategoryFormValues } from '../schemas/categorySchema';

const DEFAULT_FILTERS: CategoryListParams = {
  page: 0,
  size: 20,
  sort: 'name,asc',
};

export function CategoryListPage() {
  const [filters, setFilters, resetFilters] = useTableFilters<CategoryListParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  void resetFilters;

  const debouncedKeyword = useDebounce(filters.keyword ?? '', 300);
  const queryParams: CategoryListParams = { ...filters, keyword: debouncedKeyword || undefined };

  const { data, isLoading, isError, refetch } = useCategories(queryParams);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const openForm = (category?: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCategory(undefined);
  };

  const handleSortChange = (newSort: SortState) => {
    setSort(newSort);
    setFilters({ sort: `${newSort.column},${newSort.direction}` });
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, body: values });
        toast.success('Category saved.');
      } else {
        await createCategory.mutateAsync(values);
        toast.success('Category created.');
      }
      closeForm();
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'CONFLICT') {
          toast.error('A category with this name or slug already exists.');
        } else if (err.fieldErrors?.length) {
          throw err;
        } else {
          toast.error(err.message || 'Failed to save category. Please try again.');
        }
      } else {
        toast.error('Failed to save category. Please try again.');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Categories"
          description="Organise your product catalog into categories."
        />

        <CategoryTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={handleSortChange}
          onEdit={openForm}
          onCreateNew={() => openForm()}
        />
      </div>

      <CategoryForm
        open={formOpen}
        onClose={closeForm}
        category={editingCategory}
        isSubmitting={isSubmitting}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </AdminLayout>
  );
}
