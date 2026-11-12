import { AlertTriangle, CheckCircle2, PackageSearch, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import type { ProductVariant } from '../types/product.types';
import type { ProductInventoryResponse } from '../types/productInventory.types';

interface ProductInventorySummaryProps {
  variants: ProductVariant[];
  inventory: ProductInventoryResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onViewInventory: () => void;
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat().format(value);
}

export function ProductInventorySummary({
  variants,
  inventory,
  isLoading,
  isError,
  onRetry,
  onViewInventory,
}: ProductInventorySummaryProps) {
  const activeVariants = variants.filter((variant) => variant.status === 'ACTIVE');
  const inventoryByVariant = new Map<string, number>();
  let onHand = 0;
  let reserved = 0;
  let available = 0;

  for (const level of inventory?.items ?? []) {
    onHand += level.onHand;
    reserved += level.reserved;
    available += level.available;
    inventoryByVariant.set(
      level.variantId,
      (inventoryByVariant.get(level.variantId) ?? 0) + level.available,
    );
  }

  const activeVariantsInStock = activeVariants.filter(
    (variant) => (inventoryByVariant.get(variant.id) ?? 0) > 0,
  ).length;
  const noStockRecords = !isLoading && !isError && (inventory?.items.length ?? 0) === 0;
  const partialInventory = inventory?.hasNext ?? false;

  let status: React.ReactNode;
  if (isLoading) {
    status = <span className="text-sm text-gray-500">Checking current stock…</span>;
  } else if (isError) {
    status = (
      <div className="flex flex-wrap items-center gap-2 text-sm text-danger-700">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        <span>Inventory could not be loaded.</span>
        <Button variant="link" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
          Retry
        </Button>
      </div>
    );
  } else if (activeVariants.length === 0) {
    status = <span className="text-sm text-gray-500">No active variants to stock.</span>;
  } else if (noStockRecords) {
    status = <span className="text-sm text-warning-700">No stock records have been created yet.</span>;
  } else if (activeVariantsInStock === 0) {
    status = (
      <span className="flex items-center gap-2 text-sm font-medium text-danger-700">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        All active variants are out of stock.
      </span>
    );
  } else {
    status = (
      <span className="flex items-center gap-2 text-sm font-medium text-success-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        {activeVariantsInStock} of {activeVariants.length} active variants available to sell.
      </span>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6" aria-labelledby="inventory-summary-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PackageSearch className="h-4 w-4 text-gray-500" aria-hidden />
            <h2 id="inventory-summary-heading" className="text-sm font-semibold text-gray-900">
              Inventory availability
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Current sellable stock across warehouses. Adjustments are managed in Inventory.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onViewInventory}>
          View inventory
        </Button>
      </div>

      <div className="mt-5 border-y border-gray-100 py-4">{status}</div>

      {!isLoading && !isError && (
        <>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">On hand</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-gray-900">{formatQuantity(onHand)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Reserved</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-gray-900">{formatQuantity(reserved)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Available</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-gray-900">{formatQuantity(available)}</dd>
            </div>
          </dl>
          {partialInventory && (
            <p className="mt-4 text-xs text-warning-700">
              More than 100 stock records exist; open Inventory for the complete location-level view.
            </p>
          )}
        </>
      )}
    </section>
  );
}
