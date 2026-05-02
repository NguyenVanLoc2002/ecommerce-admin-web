import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { SoftDeleteFilter } from '@/shared/components/ui/SoftDeleteFilter';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { toast } from '@/shared/stores/uiStore';
import { SoftDeleteState, type SoftDeleteState as SoftDeleteStateValue } from '@/shared/types/api.types';
import { useVariants } from '../hooks/useVariants';
import { useVariantAttributes } from '../hooks/useVariantAttributes';
import { useCreateVariant } from '../hooks/useCreateVariant';
import { useUpdateVariant } from '../hooks/useUpdateVariant';
import { VariantTable } from './VariantTable';
import { VariantForm } from './VariantForm';
import type { ProductVariant } from '../types/product.types';
import type { VariantFormValues } from '../schemas/variantSchema';
import { buildVariantPayload } from '../utils/variantForm';

interface VariantPanelProps {
  productId: string;
}

export function VariantPanel({ productId }: VariantPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>();
  const [deletedState, setDeletedState] = useState<SoftDeleteStateValue>(SoftDeleteState.ACTIVE);

  const { data: variants, isLoading, isError, refetch } = useVariants(productId, { deletedState });
  const {
    data: variantAttributes,
    isLoading: isAttributesLoading,
    isError: isAttributesError,
    refetch: refetchAttributes,
  } = useVariantAttributes();
  const createVariant = useCreateVariant(productId);
  const updateVariant = useUpdateVariant(productId);

  const openAddForm = () => {
    setEditingVariant(undefined);
    setFormOpen(true);
  };

  const openEditForm = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingVariant(undefined);
  };

  const handleSubmit = async (values: VariantFormValues) => {
    const payload = buildVariantPayload(values);

    if (editingVariant) {
      await updateVariant.mutateAsync({ variantId: editingVariant.id, body: payload });
      toast.success('Variant updated.');
    } else {
      await createVariant.mutateAsync(payload);
      toast.success('Variant added.');
    }

    handleClose();
  };

  const isMutating = createVariant.isPending || updateVariant.isPending;

  if (isLoading) {
    return <SkeletonTable rows={4} />;
  }

  if (isError) {
    return <ErrorCard onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          <span className="tabular-nums">{variants?.length ?? 0}</span>{' '}
          <span className="text-gray-500">
            variant{(variants?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <SoftDeleteFilter value={deletedState} onChange={setDeletedState} className="h-9 w-32 text-sm" />
          <Button size="md" onClick={openAddForm} leftIcon={<Plus className="h-4 w-4" />}>
            Add variant
          </Button>
        </div>
      </div>

      <VariantTable
        productId={productId}
        variants={variants ?? []}
        deletedState={deletedState}
        onEdit={openEditForm}
        onAddNew={openAddForm}
      />

      <VariantForm
        open={formOpen}
        onClose={handleClose}
        variant={editingVariant}
        attributes={variantAttributes ?? []}
        isAttributesLoading={isAttributesLoading}
        isAttributesError={isAttributesError}
        onRetryAttributes={() => void refetchAttributes()}
        isSubmitting={isMutating}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
