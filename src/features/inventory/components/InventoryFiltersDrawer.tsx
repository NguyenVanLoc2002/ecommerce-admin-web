import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select, type SelectOption } from '@/shared/components/ui/Select';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useProduct } from '@/features/products/hooks/useProduct';
import { useVariants } from '@/features/products/hooks/useVariants';
import type { ProductListItem, ProductVariant } from '@/features/products/types/product.types';
import type { InventoryStockParams, Warehouse } from '../types/inventory.types';
import { useInventoryProductOptions } from '../hooks/useInventoryProductOptions';

const VARIANT_STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const BOOLEAN_FILTER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Yes' },
];

interface InventoryFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: InventoryStockParams;
  warehouses: Warehouse[];
  onApply: (updates: Partial<InventoryStockParams>) => void;
  onReset: () => void;
}

export function InventoryFiltersDrawer({
  open,
  onClose,
  filters,
  warehouses,
  onApply,
  onReset,
}: InventoryFiltersDrawerProps) {
  const [productSearch, setProductSearch] = useState('');
  const [localSku, setLocalSku] = useState('');
  const [localWarehouseId, setLocalWarehouseId] = useState('');
  const [localProductId, setLocalProductId] = useState('');
  const [localVariantId, setLocalVariantId] = useState('');
  const [localVariantStatus, setLocalVariantStatus] = useState('');
  const [localOutOfStock, setLocalOutOfStock] = useState('');
  const [localLowStock, setLocalLowStock] = useState('');
  const [localLowStockThreshold, setLocalLowStockThreshold] = useState('');

  const debouncedProductSearch = useDebounce(productSearch, 300);

  const {
    data: productResults,
    isLoading: productsLoading,
    isError: productsError,
  } = useInventoryProductOptions(debouncedProductSearch, open);
  const { data: selectedProduct } = useProduct(localProductId || undefined);
  const {
    data: variants,
    isLoading: variantsLoading,
    isError: variantsError,
  } = useVariants(localProductId || undefined);

  useEffect(() => {
    if (!open) {
      return;
    }

    setProductSearch('');
    setLocalSku(filters.sku ?? '');
    setLocalWarehouseId(filters.warehouseId ? String(filters.warehouseId) : '');
    setLocalProductId(filters.productId ? String(filters.productId) : '');
    setLocalVariantId(filters.productId && filters.variantId ? String(filters.variantId) : '');
    setLocalVariantStatus(filters.variantStatus ?? '');
    setLocalOutOfStock(filters.outOfStock ? 'true' : '');
    setLocalLowStock(filters.lowStock ? 'true' : '');
    setLocalLowStockThreshold(
      typeof filters.lowStockThreshold === 'number' ? String(filters.lowStockThreshold) : '',
    );
  }, [filters, open]);

  const productOptions = useMemo<SelectOption[]>(() => {
    const options = (productResults?.items ?? []).map((product) => toProductOption(product));

    if (!localProductId || !selectedProduct) {
      return options;
    }

    const selectedOption = {
      value: String(selectedProduct.id),
      label: formatProductLabel(selectedProduct.name, selectedProduct.activeVariantCount),
    };

    return options.some((option) => option.value === selectedOption.value)
      ? options
      : [selectedOption, ...options];
  }, [localProductId, productResults, selectedProduct]);

  const variantOptions = useMemo<SelectOption[]>(
    () => (variants ?? []).map((variant) => toVariantOption(variant)),
    [variants],
  );

  const warehouseOptions = useMemo<SelectOption[]>(
    () => [
      { value: '', label: 'Any warehouse' },
      ...warehouses.map((warehouse) => ({
        value: String(warehouse.id),
        label: warehouse.name,
      })),
    ],
    [warehouses],
  );

  const productHelpText = productsError
    ? 'Could not load products. Try another search term.'
    : debouncedProductSearch && !productsLoading && productOptions.length === 0
      ? 'No products match this search.'
      : 'Search products first, then narrow down to a variant if needed.';

  const variantHelpText = !localProductId
    ? 'Select a product before choosing a variant.'
    : variantsError
      ? 'Could not load variants for the selected product.'
      : variantsLoading
        ? 'Loading variants...'
        : variantOptions.length === 0
          ? 'This product has no variants available.'
          : 'Optional, use this to narrow results to one variant.';

  const handleProductChange = (nextProductId: string) => {
    setLocalProductId(nextProductId);
    setLocalVariantId('');
  };

  const handleApply = () => {
    const parsedThreshold = Number(localLowStockThreshold);
    const hasValidThreshold =
      localLowStockThreshold.trim() !== '' && Number.isInteger(parsedThreshold) && parsedThreshold >= 0;

    onApply({
      sku: localSku.trim() || undefined,
      warehouseId: localWarehouseId || undefined,
      productId: localProductId || undefined,
      variantId: localProductId ? localVariantId || undefined : undefined,
      variantStatus: localVariantStatus || undefined,
      outOfStock: localOutOfStock === 'true' ? true : undefined,
      lowStock: localLowStock === 'true' ? true : undefined,
      lowStockThreshold: hasValidThreshold ? parsedThreshold : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setProductSearch('');
    setLocalSku('');
    setLocalWarehouseId('');
    setLocalProductId('');
    setLocalVariantId('');
    setLocalVariantStatus('');
    setLocalOutOfStock('');
    setLocalLowStock('');
    setLocalLowStockThreshold('');
    onReset();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter Inventory"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply filters
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="inventory-filter-sku" className="text-sm font-medium text-gray-700">
            SKU
          </label>
          <Input
            id="inventory-filter-sku"
            value={localSku}
            onChange={(event) => setLocalSku(event.target.value)}
            placeholder="Search exact or partial SKU..."
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-filter-warehouse" className="text-sm font-medium text-gray-700">
            Warehouse
          </label>
          <Select
            id="inventory-filter-warehouse"
            options={warehouseOptions}
            value={localWarehouseId}
            onChange={(event) => setLocalWarehouseId(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-filter-product-search" className="text-sm font-medium text-gray-700">
            Find product
          </label>
          <Input
            id="inventory-filter-product-search"
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Search products by name..."
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={productsLoading ? <Spinner size="sm" label="Loading products..." /> : undefined}
          />
          <p className={`text-xs ${productsError ? 'text-danger-600' : 'text-gray-500'}`}>
            {productHelpText}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-filter-product" className="text-sm font-medium text-gray-700">
            Product
          </label>
          <Select
            id="inventory-filter-product"
            value={localProductId}
            onChange={(event) => handleProductChange(event.target.value)}
            options={[
              { value: '', label: 'Any product' },
              ...productOptions,
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inventory-filter-variant" className="text-sm font-medium text-gray-700">
            Variant
          </label>
          <Select
            id="inventory-filter-variant"
            value={localVariantId}
            onChange={(event) => setLocalVariantId(event.target.value)}
            disabled={!localProductId || variantsLoading || variantsError || variantOptions.length === 0}
            options={[
              {
                value: '',
                label: !localProductId
                  ? 'Select a product first'
                  : variantsLoading
                    ? 'Loading variants...'
                    : variantsError
                      ? 'Could not load variants'
                      : variantOptions.length === 0
                        ? 'No variants available'
                        : 'Any variant',
              },
              ...variantOptions,
            ]}
          />
          <p className={`text-xs ${variantsError ? 'text-danger-600' : 'text-gray-500'}`}>
            {variantHelpText}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="inventory-filter-variant-status" className="text-sm font-medium text-gray-700">
              Variant status
            </label>
            <Select
              id="inventory-filter-variant-status"
              options={VARIANT_STATUS_OPTIONS}
              value={localVariantStatus}
              onChange={(event) => setLocalVariantStatus(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inventory-filter-threshold" className="text-sm font-medium text-gray-700">
              Low stock threshold
            </label>
            <Input
              id="inventory-filter-threshold"
              type="number"
              min="0"
              value={localLowStockThreshold}
              onChange={(event) => setLocalLowStockThreshold(event.target.value)}
              placeholder="e.g. 5"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="inventory-filter-out-of-stock" className="text-sm font-medium text-gray-700">
              Out of stock
            </label>
            <Select
              id="inventory-filter-out-of-stock"
              options={BOOLEAN_FILTER_OPTIONS}
              value={localOutOfStock}
              onChange={(event) => setLocalOutOfStock(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inventory-filter-low-stock" className="text-sm font-medium text-gray-700">
              Low stock
            </label>
            <Select
              id="inventory-filter-low-stock"
              options={BOOLEAN_FILTER_OPTIONS}
              value={localLowStock}
              onChange={(event) => setLocalLowStock(event.target.value)}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function toProductOption(product: ProductListItem): SelectOption {
  return {
    value: String(product.id),
    label: formatProductLabel(product.name, product.activeVariantCount),
  };
}

function toVariantOption(variant: ProductVariant): SelectOption {
  const primaryLabel = variant.variantName || variant.sku || String(variant.id);
  const suffix = variant.sku ? ` (${variant.sku})` : '';

  return {
    value: String(variant.id),
    label: `${primaryLabel}${suffix}`,
  };
}

function formatProductLabel(name: string, activeVariantCount: number): string {
  return `${name} (${activeVariantCount} active variants)`;
}
