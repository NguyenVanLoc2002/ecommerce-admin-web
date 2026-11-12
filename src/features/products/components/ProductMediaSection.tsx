import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image, ImageOff, Link, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Toggle } from '@/shared/components/ui/Toggle';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { toast } from '@/shared/stores/uiStore';
import { AppError, type EntityId } from '@/shared/types/api.types';
import { useCreateProductMedia, useDeleteProductMedia, useUpdateProductMedia } from '../hooks/useProductMediaMutations';
import { productMediaSchema, type ProductMediaFormValues } from '../schemas/productMediaSchema';
import { getShortMediaName, getVariantLabel, sortMedia } from '../utils/productMedia';
import type { ProductMedia, ProductVariant } from '../types/product.types';

type MediaFilter = 'all' | 'product' | 'variant';

interface ProductMediaSectionProps {
  productId: EntityId;
  media: ProductMedia[];
  variants: ProductVariant[];
  disabled?: boolean;
}

const MEDIA_TYPE_OPTIONS = [
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
];

const FILTERS: Array<{ value: MediaFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'product', label: 'Product gallery' },
  { value: 'variant', label: 'Variant media' },
];

function getDefaultValues(media: ProductMedia[], item?: ProductMedia): ProductMediaFormValues {
  return {
    mediaUrl: item?.mediaUrl ?? '',
    mediaType: item?.mediaType ?? 'IMAGE',
    sortOrder: item?.sortOrder ?? media.length,
    primary: item?.primary ?? false,
    variantId: item?.variantId ?? '',
  };
}

export function ProductMediaSection({ productId, media, variants, disabled }: ProductMediaSectionProps) {
  const { confirm } = useConfirmDialog();
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [editingMedia, setEditingMedia] = useState<ProductMedia | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const createMedia = useCreateProductMedia(productId);
  const updateMedia = useUpdateProductMedia(productId);
  const deleteMedia = useDeleteProductMedia(productId);
  const form = useForm<ProductMediaFormValues>({
    resolver: zodResolver(productMediaSchema),
    defaultValues: getDefaultValues(media),
  });

  const productMedia = useMemo(() => sortMedia(media.filter((item) => item.variantId == null)), [media]);
  const variantMedia = useMemo(() => sortMedia(media.filter((item) => item.variantId != null)), [media]);
  const visibleMedia = filter === 'product' ? productMedia : filter === 'variant' ? variantMedia : sortMedia(media);
  const isSubmitting = createMedia.isPending || updateMedia.isPending;
  const variantOptions = [
    { value: '', label: 'Product gallery' },
    ...variants.map((variant) => ({ value: variant.id, label: variant.variantName || variant.sku })),
  ];

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingMedia(undefined);
    form.reset(getDefaultValues(media));
  };

  const openCreateEditor = () => {
    setEditingMedia(undefined);
    form.reset(getDefaultValues(media));
    setIsEditorOpen(true);
  };

  const openEditEditor = (item: ProductMedia) => {
    setEditingMedia(item);
    form.reset(getDefaultValues(media, item));
    setIsEditorOpen(true);
  };

  const setServerErrors = (error: unknown) => {
    if (error instanceof AppError && error.fieldErrors?.length) {
      error.fieldErrors.forEach(({ field, message }) => {
        const fieldName = field === 'variantId' || field === 'mediaUrl' || field === 'mediaType'
          || field === 'sortOrder' || field === 'primary' ? field : 'root.server';
        form.setError(fieldName, { message });
      });
      return;
    }
    form.setError('root.server', {
      message: error instanceof AppError ? error.message : 'Failed to save media. Please try again.',
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    form.clearErrors('root.server');
    const payload = {
      mediaUrl: values.mediaUrl.trim(),
      mediaType: values.mediaType,
      sortOrder: values.sortOrder,
      primary: values.primary,
      variantId: values.variantId || null,
    };
    try {
      if (editingMedia) {
        await updateMedia.mutateAsync({ mediaId: editingMedia.id, body: payload });
        toast.success('Media updated.');
      } else {
        await createMedia.mutateAsync(payload);
        toast.success('Media added.');
      }
      closeEditor();
    } catch (error) {
      setServerErrors(error);
    }
  });

  const handleSetPrimary = async (item: ProductMedia) => {
    try {
      await updateMedia.mutateAsync({ mediaId: item.id, body: { primary: true } });
      toast.success('Primary media updated.');
    } catch (error) {
      toast.error(error instanceof AppError ? error.message : 'Failed to set primary media.');
    }
  };

  const handleDelete = async (item: ProductMedia) => {
    const confirmed = await confirm({
      title: 'Remove media?',
      description: `This removes ${getShortMediaName(item.mediaUrl)} from the product. The remote asset will not be deleted.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteMedia.mutateAsync(item.id);
      toast.success('Media removed.');
    } catch (error) {
      toast.error(error instanceof AppError ? error.message : 'Failed to remove media.');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Product media</h2>
          <p className="mt-1 text-sm text-gray-500">Add URL-based gallery media or assign it to an active variant.</p>
        </div>
        <Button type="button" size="sm" onClick={openCreateEditor} disabled={disabled} leftIcon={<Plus className="h-4 w-4" />}>Add media</Button>
      </div>

      <div className="rounded-lg border border-info-200 bg-info-50 px-4 py-3 text-sm text-info-800">
        Media URLs are stored by the catalog. Removing media only removes its catalog entry, not the remote asset.
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter product media">
        {FILTERS.map((item) => {
          const active = item.value === filter;
          return <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={active} className={[
            'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
            active ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
          ].join(' ')}>{item.label}</button>;
        })}
      </div>

      {isEditorOpen && (
        <FormProvider {...form}>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_8rem_8rem]">
              <Field id="product-media-url" label="Media URL" error={form.formState.errors.mediaUrl?.message}><Input id="product-media-url" placeholder="https://cdn.example.com/product.jpg" disabled={isSubmitting} error={Boolean(form.formState.errors.mediaUrl)} {...form.register('mediaUrl')} /></Field>
              <Field id="product-media-type" label="Type" error={form.formState.errors.mediaType?.message}><Select id="product-media-type" options={MEDIA_TYPE_OPTIONS} disabled={isSubmitting} error={Boolean(form.formState.errors.mediaType)} {...form.register('mediaType')} /></Field>
              <Field id="product-media-sort" label="Sort order" error={form.formState.errors.sortOrder?.message}><Input id="product-media-sort" type="number" min="0" disabled={isSubmitting} error={Boolean(form.formState.errors.sortOrder)} {...form.register('sortOrder')} /></Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="product-media-variant" label="Assigned to" error={form.formState.errors.variantId?.message}><Select id="product-media-variant" options={variantOptions} disabled={isSubmitting} error={Boolean(form.formState.errors.variantId)} {...form.register('variantId')} /></Field>
              <div className="flex items-end pb-1"><Toggle checked={form.watch('primary')} onChange={(primary) => form.setValue('primary', primary, { shouldValidate: true })} disabled={isSubmitting} label="Set as primary image" /></div>
            </div>
            {form.formState.errors.primary?.message && <p className="mt-2 text-xs text-danger-600">{form.formState.errors.primary.message}</p>}
            {form.formState.errors.root?.server?.message && <p className="mt-2 text-sm text-danger-700">{form.formState.errors.root.server.message}</p>}
            <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <Button type="button" variant="secondary" size="sm" onClick={closeEditor} disabled={isSubmitting}>Cancel</Button>
              <Button type="button" size="sm" isLoading={isSubmitting} onClick={() => void handleSubmit()}>{editingMedia ? 'Save changes' : 'Add media'}</Button>
            </div>
          </div>
        </FormProvider>
      )}

      {visibleMedia.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300"><div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="mb-4 text-gray-300"><Image className="h-10 w-10" /></div><h3 className="text-sm font-semibold text-gray-900">No media yet</h3>
          <p className="mt-1 max-w-xs text-sm text-gray-500">Add a hosted image or video URL to improve catalog preview and variant display.</p>
          <Button type="button" size="sm" className="mt-4" onClick={openCreateEditor} disabled={disabled}>Add media</Button>
        </div></div>
      ) : <div className="grid gap-3 md:grid-cols-2">{visibleMedia.map((item) => <MediaItemCard key={item.id} media={item} variantLabel={getVariantLabel(variants, item.variantId)} isMutating={updateMedia.isPending || deleteMedia.isPending} onEdit={() => openEditEditor(item)} onSetPrimary={() => void handleSetPrimary(item)} onDelete={() => void handleDelete(item)} />)}</div>}
    </section>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>{children}{error && <p className="text-xs text-danger-600">{error}</p>}</div>;
}

function MediaItemCard({ media, variantLabel, isMutating, onEdit, onSetPrimary, onDelete }: { media: ProductMedia; variantLabel: string | null; isMutating: boolean; onEdit: () => void; onSetPrimary: () => void; onDelete: () => void }) {
  const isImage = media.mediaType === 'IMAGE';
  return <article className="rounded-lg border border-gray-200 bg-white p-3"><div className="flex gap-3"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">{isImage && media.mediaUrl ? <img src={media.mediaUrl} alt="" className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-gray-400" aria-hidden />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2">{media.primary && <Badge variant="primary">Primary</Badge>}<Badge variant={variantLabel ? 'info' : 'default'}>{variantLabel ? `Variant: ${variantLabel}` : 'Product gallery'}</Badge><Badge>{media.mediaType}</Badge></div><p className="mt-2 truncate text-sm font-medium text-gray-900">{getShortMediaName(media.mediaUrl)}</p><p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500"><Link className="h-3 w-3 shrink-0" aria-hidden />{media.mediaUrl}</p><p className="mt-2 text-xs text-gray-500">Sort order <span className="font-medium tabular-nums text-gray-700">{media.sortOrder}</span></p></div></div><div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3"><Button type="button" variant="secondary" size="sm" disabled={isMutating || media.primary || !isImage} onClick={onSetPrimary} leftIcon={<Star className="h-4 w-4" />}>Set primary</Button><Button type="button" variant="secondary" size="sm" disabled={isMutating} onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />}>Edit</Button><Button type="button" variant="ghost" size="sm" disabled={isMutating} onClick={onDelete} leftIcon={<Trash2 className="h-4 w-4" />}>Remove</Button></div></article>;
}
