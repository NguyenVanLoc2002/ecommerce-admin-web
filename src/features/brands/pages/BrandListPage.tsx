import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { toast } from '@/shared/stores/uiStore';
import { AppError, SoftDeleteState } from '@/shared/types/api.types';
import type { SortState } from '@/shared/components/table/types';
import { useBrands } from '../hooks/useBrands';
import { useCreateBrand } from '../hooks/useCreateBrand';
import { useUpdateBrand } from '../hooks/useUpdateBrand';
import { BrandTable } from '../components/BrandTable';
import { BrandForm } from '../components/BrandForm';
import type { Brand, BrandListParams } from '../types/brand.types';
import type { BrandFormValues } from '../schemas/brandSchema';

const DEFAULT_FILTERS: BrandListParams = {
  page: 0,
  size: 20,
  sort: 'name,asc',
  name: undefined,
  status: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

export function BrandListPage() {
  const [filters, setFilters] = useTableFilters<BrandListParams>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>();

  const debouncedName = useDebounce(filters.name ?? '', 300);
  const queryParams: BrandListParams = { ...filters, name: debouncedName || undefined };

  const { data, isLoading, isError, refetch } = useBrands(queryParams);
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const isSubmitting = createBrand.isPending || updateBrand.isPending;

  const openForm = (brand?: Brand) => {
    setEditingBrand(brand);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingBrand(undefined);
  };

  const handleSortChange = (newSort: SortState) => {
    setSort(newSort);
    setFilters({ sort: `${newSort.column},${newSort.direction}` });
  };

  const handleSubmit = async (values: BrandFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      logoUrl: values.logoUrl,
      status: values.status,
    };

    try {
      if (editingBrand) {
        await updateBrand.mutateAsync({ id: editingBrand.id, body: payload });
        toast.success('Brand saved.');
      } else {
        await createBrand.mutateAsync(payload);
        toast.success('Brand created.');
      }
      closeForm();
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'CONFLICT') {
          toast.error('A brand with this name or slug already exists.');
        } else if (err.fieldErrors?.length) {
          throw err;
        } else {
          toast.error(err.message || 'Failed to save brand. Please try again.');
        }
      } else {
        toast.error('Failed to save brand. Please try again.');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader title="Brands" description="Manage brands associated with your products." />

        <BrandTable
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

      <BrandForm
        open={formOpen}
        onClose={closeForm}
        brand={editingBrand}
        isSubmitting={isSubmitting}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </AdminLayout>
  );
}
