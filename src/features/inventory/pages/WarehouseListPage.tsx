import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { usePermission } from '@/constants/permissions';
import { toast } from '@/shared/stores/uiStore';
import { AppError, SoftDeleteState } from '@/shared/types/api.types';
import { useWarehouses } from '../hooks/useWarehouses';
import { useCreateWarehouse } from '../hooks/useCreateWarehouse';
import { useUpdateWarehouse } from '../hooks/useUpdateWarehouse';
import { WarehouseTable } from '../components/WarehouseTable';
import { WarehouseForm } from '../components/WarehouseForm';
import type { Warehouse, WarehouseListParams } from '../types/inventory.types';
import type { WarehouseFormValues } from '../schemas/warehouseSchema';

const DEFAULT_FILTERS: WarehouseListParams = {
  status: undefined,
  deletedState: SoftDeleteState.ACTIVE,
};

export function WarehouseListPage() {
  const canWrite = usePermission('warehouses', 'write');
  const [filters, setFilters] = useTableFilters<WarehouseListParams>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | undefined>();

  const { data, isLoading, isError, refetch } = useWarehouses(filters);
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

  const isSubmitting = createWarehouse.isPending || updateWarehouse.isPending;

  const openForm = (warehouse?: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingWarehouse(undefined);
  };

  const handleSubmit = async (values: WarehouseFormValues) => {
    try {
      if (editingWarehouse) {
        await updateWarehouse.mutateAsync({
          id: editingWarehouse.id,
          body: { name: values.name, location: values.location || undefined, status: values.status },
        });
        toast.success('Warehouse saved.');
      } else {
        await createWarehouse.mutateAsync({
          name: values.name,
          code: values.code,
          location: values.location || undefined,
        });
        toast.success('Warehouse created.');
      }
      closeForm();
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'CONFLICT') {
          toast.error('A warehouse with this name or code already exists.');
        } else if (err.fieldErrors?.length) {
          throw err;
        } else {
          toast.error(err.message || 'Failed to save warehouse. Please try again.');
        }
      } else {
        toast.error('Failed to save warehouse. Please try again.');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Warehouses"
          description="Manage your storage locations."
        />

        <WarehouseTable
          data={data}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          canWrite={canWrite}
          onEdit={openForm}
          onCreateNew={() => openForm()}
        />
      </div>

      <WarehouseForm
        open={formOpen}
        onClose={closeForm}
        warehouse={editingWarehouse}
        isSubmitting={isSubmitting}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </AdminLayout>
  );
}
