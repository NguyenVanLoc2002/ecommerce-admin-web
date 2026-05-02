import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { toast } from '@/shared/stores/uiStore';
import { SoftDeleteState } from '@/shared/types/api.types';
import { buildSortParam, parseSortParam } from '@/shared/utils/sort';
import type { SortState } from '@/shared/components/table/types';
import { ProductAttributeTable } from '../components/ProductAttributeTable';
import { ProductAttributeForm } from '../components/ProductAttributeForm';
import { useProductAttributes } from '../hooks/useProductAttributes';
import { useCreateProductAttribute } from '../hooks/useCreateProductAttribute';
import { useUpdateProductAttribute } from '../hooks/useUpdateProductAttribute';
import type {
  ProductAttribute,
  ProductAttributeListParams,
} from '../types/productAttribute.types';
import type { ProductAttributeFormValues } from '../schemas/productAttributeSchema';

const DEFAULT_FILTERS: ProductAttributeListParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  keyword: undefined,
  type: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

export function ProductAttributeListPage() {
  const [filters, setFilters] = useTableFilters<ProductAttributeListParams>(DEFAULT_FILTERS);
  const sort = parseSortParam(filters.sort);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | undefined>();

  const debouncedKeyword = useDebounce(filters.keyword ?? '', 300);
  const queryParams: ProductAttributeListParams = {
    ...filters,
    keyword: debouncedKeyword || undefined,
  };

  const { data, isLoading, isError, refetch } = useProductAttributes(queryParams);
  const createAttribute = useCreateProductAttribute();
  const updateAttribute = useUpdateProductAttribute();

  const isSubmitting = createAttribute.isPending || updateAttribute.isPending;

  const openForm = (attribute?: ProductAttribute) => {
    setEditingAttribute(attribute);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingAttribute(undefined);
  };

  const handleSortChange = (nextSort: SortState) => {
    setFilters({ sort: buildSortParam(nextSort), page: 0 });
  };

  const handleSubmit = async (values: ProductAttributeFormValues) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim(),
      type: values.type,
      values: values.values.map((entry) => ({
        ...(entry.id ? { id: entry.id } : {}),
        value: entry.value.trim(),
        displayValue: entry.displayValue?.trim() || null,
      })),
    };

    if (editingAttribute) {
      await updateAttribute.mutateAsync({ id: editingAttribute.id, body: payload });
      toast.success('Product attribute updated.');
    } else {
      await createAttribute.mutateAsync(payload);
      toast.success('Product attribute created.');
    }

    closeForm();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Product Attributes"
          description="Manage reusable product attributes such as Color, Size, Material."
        />

        <ProductAttributeTable
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

      <ProductAttributeForm
        open={formOpen}
        onClose={closeForm}
        attribute={editingAttribute}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </AdminLayout>
  );
}
