import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Search } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { SoftDeleteState } from '@/shared/types/api.types';
import { cn } from '@/shared/utils/cn';
import { Input } from '@/shared/components/ui/Input';
import { Select, type SelectOption } from '@/shared/components/ui/Select';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useVariants } from '@/features/products/hooks/useVariants';
import type { ProductListItem, ProductVariant } from '@/features/products/types/product.types';
import { useInventoryProductOptions } from '../hooks/useInventoryProductOptions';

interface InventoryVariantSelectorProps {
  open: boolean;
  disabled?: boolean;
}

interface InventoryVariantFormValues {
  variantId: string;
}

interface SelectedProductState {
  id: string;
  name: string;
  label: string;
}

export function InventoryVariantSelector({
  open,
  disabled,
}: InventoryVariantSelectorProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<InventoryVariantFormValues>();

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<SelectedProductState | null>(null);
  const debouncedProductSearch = useDebounce(productSearch, 300);

  useEffect(() => {
    if (!open) {
      return;
    }

    setProductSearch('');
    setSelectedProduct(null);
  }, [open]);

  const {
    data: productData,
    isLoading: productsLoading,
    isError: productsError,
  } = useInventoryProductOptions(debouncedProductSearch, open);

  const {
    data: variants,
    isLoading: variantsLoading,
    isError: variantsError,
  } = useVariants(selectedProduct?.id, { deletedState: SoftDeleteState.ACTIVE });

  const fetchedProductOptions = useMemo(
    () => (productData?.items ?? []).map((product) => toProductOption(product)),
    [productData],
  );

  const productOptions = useMemo<SelectOption[]>(() => {
    if (!selectedProduct) {
      return fetchedProductOptions;
    }

    return fetchedProductOptions.some((option) => option.value === selectedProduct.id)
      ? fetchedProductOptions
      : [{ value: selectedProduct.id, label: selectedProduct.label }, ...fetchedProductOptions];
  }, [fetchedProductOptions, selectedProduct]);

  const variantOptions = useMemo(
    () => (variants ?? []).map((variant) => toVariantOption(variant, selectedProduct?.name)),
    [selectedProduct?.name, variants],
  );

  const variantError = typeof errors.variantId?.message === 'string'
    ? errors.variantId.message
    : undefined;

  const productHelpText = productsError
    ? 'Could not load products. Try another search term.'
    : debouncedProductSearch && !productsLoading && fetchedProductOptions.length === 0
      ? 'No products match this search.'
      : 'Search products first, then choose a variant.';

  const variantHelpText = !selectedProduct
    ? 'Select a product before choosing a variant.'
    : variantsError
      ? 'Could not load variants for the selected product.'
      : variantsLoading
        ? 'Loading variants...'
        : variantOptions.length === 0
          ? 'This product has no variants available.'
          : 'Only the selected variant ID will be submitted.';

  const variantPlaceholder = !selectedProduct
    ? 'Select a product first'
    : variantsLoading
      ? 'Loading variants...'
      : variantsError
        ? 'Could not load variants'
        : variantOptions.length === 0
          ? 'No variants available'
          : 'Select variant...';

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="inventory-product-search" className="text-sm font-medium text-gray-700">
          Find product
        </label>
        <Input
          id="inventory-product-search"
          value={productSearch}
          onChange={(event) => setProductSearch(event.target.value)}
          placeholder="Search products by name..."
          disabled={disabled}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={productsLoading ? <Spinner size="sm" label="Loading products..." /> : undefined}
        />
        <p className={cn('text-xs', productsError ? 'text-danger-600' : 'text-gray-500')}>
          {productHelpText}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="inventory-product-select" className="text-sm font-medium text-gray-700">
            Product
          </label>
          <Select
            id="inventory-product-select"
            value={selectedProduct?.id ?? ''}
            disabled={disabled}
            onChange={(event) => {
              const nextProductId = event.target.value;
              const nextProduct = productData?.items.find((product) => String(product.id) === nextProductId);

              setSelectedProduct(
                nextProduct
                  ? {
                      id: String(nextProduct.id),
                      name: nextProduct.name,
                      label: formatProductLabel(nextProduct),
                    }
                  : null,
              );
              setValue('variantId', '', { shouldDirty: true, shouldValidate: true });
            }}
            options={[
              { value: '', label: 'Select product...' },
              ...productOptions,
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="variantId" className="text-sm font-medium text-gray-700">
            Variant
            <span className="ml-0.5 text-danger-500">*</span>
          </label>
          <Controller
            control={control}
            name="variantId"
            render={({ field }) => (
              <Select
                id="variantId"
                {...field}
                value={field.value ?? ''}
                disabled={
                  disabled
                  || !selectedProduct
                  || variantsLoading
                  || variantsError
                  || variantOptions.length === 0
                }
                error={!!variantError}
                options={[
                  { value: '', label: variantPlaceholder },
                  ...variantOptions,
                ]}
              />
            )}
          />
          {variantError ? (
            <p className="text-xs text-danger-600">{variantError}</p>
          ) : (
            <p className={cn('text-xs', variantsError ? 'text-danger-600' : 'text-gray-500')}>
              {variantHelpText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function toProductOption(product: ProductListItem): SelectOption {
  return {
    value: String(product.id),
    label: formatProductLabel(product),
  };
}

function formatProductLabel(product: ProductListItem): string {
  return `${product.name} (${product.activeVariantCount} active variants)`;
}

function toVariantOption(variant: ProductVariant, productName?: string): SelectOption {
  const primaryLabel = variant.variantName || variant.sku || String(variant.id);
  const skuLabel = variant.sku ? ` (${variant.sku})` : '';
  const productLabel = productName ? ` - ${productName}` : '';

  return {
    value: String(variant.id),
    label: `${primaryLabel}${skuLabel}${productLabel}`,
  };
}
