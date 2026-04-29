import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonTable } from '@/shared/components/feedback/Skeleton';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { useVariants } from '../hooks/useVariants';
import { useCreateVariant } from '../hooks/useCreateVariant';
import { useUpdateVariant } from '../hooks/useUpdateVariant';
import { VariantTable } from './VariantTable';
import { VariantForm } from './VariantForm';
import type { ProductVariant } from '../types/product.types';
import type { VariantFormValues } from '../schemas/variantSchema';

interface VariantPanelProps {
  productId: string;
}

function entriesToAttributes(attributes: Array<{ key: string; value: string }>) {
  return attributes
    .filter((a) => a.key)
    .map(({ key, value }) => ({ attributeName: key, value }));
}

export function VariantPanel({ productId }: VariantPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>();

  const { data: variants, isLoading, isError, refetch } = useVariants(productId);
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
    const payload = {
      sku: values.sku,
      variantName: values.name,
      basePrice: values.price,
      salePrice: values.salePrice ?? null,
      weightGram: values.weight ?? null,
      status: values.status,
      attributes: entriesToAttributes(values.attributes),
    };

    try {
      if (editingVariant) {
        await updateVariant.mutateAsync({ variantId: editingVariant.id, body: payload });
        toast.success('Variant updated.');
      } else {
        await createVariant.mutateAsync(payload);
        toast.success('Variant added.');
      }
      handleClose();
    } catch (err) {
      if (err instanceof AppError) {
        if (err.code === 'CONFLICT') {
          toast.error('This SKU is already in use. Please choose a different one.');
        } else if (err.fieldErrors?.length) {
          // VariantForm will handle fieldErrors via thrown error; re-throw for the form
          throw err;
        } else {
          toast.error(err.message || 'Failed to save variant. Please try again.');
        }
      } else {
        toast.error('Failed to save variant. Please try again.');
      }
    }
  };

  const isMutating = createVariant.isPending || updateVariant.isPending;

  if (isLoading) return <SkeletonTable rows={4} />;
  if (isError) return <ErrorCard onRetry={() => void refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          <span className="tabular-nums">{variants?.length ?? 0}</span>{' '}
          <span className="text-gray-500">
            variant{(variants?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </p>
        <Button size="md" onClick={openAddForm} leftIcon={<Plus className="h-4 w-4" />}>
          Add variant
        </Button>
      </div>

      <VariantTable
        productId={productId}
        variants={variants ?? []}
        onEdit={openEditForm}
        onAddNew={openAddForm}
      />

      <VariantForm
        open={formOpen}
        onClose={handleClose}
        variant={editingVariant}
        isSubmitting={isMutating}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
}
