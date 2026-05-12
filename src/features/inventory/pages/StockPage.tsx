import { useState } from 'react';
import { AdjustStockModal } from '../components/AdjustStockModal';
import { ImportStockModal } from '../components/ImportStockModal';
import { InventoryFiltersDrawer } from '../components/InventoryFiltersDrawer';
import { InventoryStockTable } from '../components/InventoryStockTable';
import { StockMovementsTable } from '../components/StockMovementsTable';
import { useAdjustStock } from '../hooks/useAdjustStock';
import { useImportStock } from '../hooks/useImportStock';
import { useInventoryStock } from '../hooks/useInventoryStock';
import { useStockMovements } from '../hooks/useStockMovements';
import { useWarehouseOptions } from '../hooks/useWarehouseOptions';
import type { AdjustStockFormValues } from '../schemas/adjustStockSchema';
import type { ImportStockFormValues } from '../schemas/importStockSchema';
import type {
  InventoryStock,
  InventoryStockParams,
  StockMovementParams,
} from '../types/inventory.types';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import {
  getPhase3AdminErrorMessage,
  isConcurrencyErrorCode,
} from '@/shared/utils/adminPhase3Errors';
import { cn } from '@/shared/utils/cn';
import { cleanParams } from '@/shared/utils/cleanParams';

type ActiveTab = 'stock' | 'movements';

const DEFAULT_STOCK_FILTERS: InventoryStockParams = {
  page: 0,
  size: 20,
  sort: 'updatedAt,desc',
  variantId: undefined,
  warehouseId: undefined,
  productId: undefined,
  sku: undefined,
  keyword: undefined,
  variantStatus: undefined,
  outOfStock: undefined,
  lowStock: undefined,
  lowStockThreshold: undefined,
};

const DEFAULT_MOVEMENT_FILTERS: StockMovementParams = {
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
  variantId: undefined,
  warehouseId: undefined,
  movementType: undefined,
};

export function StockPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('stock');
  const [importOpen, setImportOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [stockFiltersOpen, setStockFiltersOpen] = useState(false);
  const [stockContext, setStockContext] = useState<InventoryStock | undefined>();

  const [stockFilters, setStockFilters, resetStockFilters] = useTableFilters<InventoryStockParams>(
    DEFAULT_STOCK_FILTERS,
    {
      namespace: 'stock',
      booleanKeys: ['outOfStock', 'lowStock'],
      numberKeys: ['lowStockThreshold'],
    },
  );
  const [movementFilters, setMovementFilters] = useTableFilters<StockMovementParams>(
    DEFAULT_MOVEMENT_FILTERS,
    {
      namespace: 'movements',
    },
  );

  const debouncedKeyword = useDebounce(stockFilters.keyword ?? '', 300);
  const stockQueryParams: InventoryStockParams = {
    ...stockFilters,
    keyword: debouncedKeyword || undefined,
  };
  const stockActiveFilterCount = Object.keys(
    cleanParams({
      keyword: stockFilters.keyword,
      sku: stockFilters.sku,
      warehouseId: stockFilters.warehouseId,
      productId: stockFilters.productId,
      variantId: stockFilters.variantId,
      variantStatus: stockFilters.variantStatus,
      outOfStock: stockFilters.outOfStock,
      lowStock: stockFilters.lowStock,
      lowStockThreshold: stockFilters.lowStockThreshold,
    }),
  ).length;

  const {
    data: stockData,
    isLoading: stockLoading,
    isError: stockError,
    refetch: refetchStock,
  } = useInventoryStock(stockQueryParams);
  const {
    data: movementsData,
    isLoading: movementsLoading,
    isError: movementsError,
    refetch: refetchMovements,
  } = useStockMovements(movementFilters);
  const { data: warehouseData } = useWarehouseOptions();
  const importStock = useImportStock();
  const adjustStock = useAdjustStock();

  const warehouses = warehouseData ?? [];

  const closeImport = () => {
    if (importStock.isPending) {
      return;
    }

    setImportOpen(false);
    setStockContext(undefined);
  };

  const closeAdjust = () => {
    if (adjustStock.isPending) {
      return;
    }

    setAdjustOpen(false);
    setStockContext(undefined);
  };

  const openImport = (stock?: InventoryStock) => {
    setStockContext(stock);
    setImportOpen(true);
  };

  const openAdjust = (stock: InventoryStock) => {
    setStockContext(stock);
    setAdjustOpen(true);
  };

  const handleImport = async (values: ImportStockFormValues) => {
    if (importStock.isPending) {
      return;
    }

    try {
      await importStock.mutateAsync(values);
      toast.success('Stock imported successfully.');
      closeImport();
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to import stock. Please try again.'));

        if (isConcurrencyErrorCode(error.code)) {
          void refetchStock();
          void refetchMovements();
        }
      } else {
        toast.error('Failed to import stock. Please try again.');
      }
    }
  };

  const handleAdjust = async (values: AdjustStockFormValues) => {
    if (adjustStock.isPending) {
      return;
    }

    try {
      await adjustStock.mutateAsync(values);
      toast.success('Stock adjusted successfully.');
      closeAdjust();
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(getPhase3AdminErrorMessage(error, 'Failed to adjust stock. Please try again.'));

        if (isConcurrencyErrorCode(error.code)) {
          void refetchStock();
          void refetchMovements();
        }
      } else {
        toast.error('Failed to adjust stock. Please try again.');
      }
    }
  };

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'stock', label: 'Stock Levels' },
    { id: 'movements', label: 'Movements Log' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Inventory"
          description="Track stock levels across all warehouses."
        />

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6" aria-label="Inventory tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'stock' && (
          <InventoryStockTable
            data={stockData}
            isLoading={stockLoading}
            isError={stockError}
            onRetry={() => void refetchStock()}
            filters={stockFilters}
            onFiltersChange={setStockFilters}
            onReset={resetStockFilters}
            onOpenFilters={() => setStockFiltersOpen(true)}
            activeFilterCount={stockActiveFilterCount}
            onImport={openImport}
            onAdjust={openAdjust}
            onImportNew={() => openImport()}
          />
        )}

        {activeTab === 'movements' && (
          <StockMovementsTable
            data={movementsData}
            isLoading={movementsLoading}
            isError={movementsError}
            onRetry={() => void refetchMovements()}
            filters={movementFilters}
            onFiltersChange={setMovementFilters}
            warehouses={warehouses}
          />
        )}
      </div>

      <InventoryFiltersDrawer
        open={stockFiltersOpen}
        onClose={() => setStockFiltersOpen(false)}
        filters={stockFilters}
        warehouses={warehouses}
        onApply={setStockFilters}
        onReset={resetStockFilters}
      />

      <ImportStockModal
        open={importOpen}
        onClose={closeImport}
        context={
          stockContext
            ? {
                warehouseId: stockContext.warehouseId,
                warehouseName: stockContext.warehouseName,
                variantId: stockContext.variantId,
                variantSku: stockContext.sku,
                variantName: stockContext.variantName,
              }
            : undefined
        }
        warehouses={warehouses}
        isSubmitting={importStock.isPending}
        onSubmit={(values) => void handleImport(values)}
      />

      <AdjustStockModal
        open={adjustOpen}
        onClose={closeAdjust}
        context={
          stockContext
            ? {
                warehouseId: stockContext.warehouseId,
                warehouseName: stockContext.warehouseName,
                variantId: stockContext.variantId,
                variantSku: stockContext.sku,
                variantName: stockContext.variantName,
              }
            : undefined
        }
        warehouses={warehouses}
        isSubmitting={adjustStock.isPending}
        onSubmit={(values) => void handleAdjust(values)}
      />
    </AdminLayout>
  );
}
