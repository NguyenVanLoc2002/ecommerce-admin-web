import { useState } from 'react';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { useTableFilters } from '@/shared/hooks/useTableFilters';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { toast } from '@/shared/stores/uiStore';
import { AppError } from '@/shared/types/api.types';
import { cn } from '@/shared/utils/cn';
import { cleanParams } from '@/shared/utils/cleanParams';
import { useInventoryStock } from '../hooks/useInventoryStock';
import { useStockMovements } from '../hooks/useStockMovements';
import { useImportStock } from '../hooks/useImportStock';
import { useAdjustStock } from '../hooks/useAdjustStock';
import { useWarehouseOptions } from '../hooks/useWarehouseOptions';
import { InventoryStockTable } from '../components/InventoryStockTable';
import { StockMovementsTable } from '../components/StockMovementsTable';
import { ImportStockModal } from '../components/ImportStockModal';
import { AdjustStockModal } from '../components/AdjustStockModal';
import { InventoryFiltersDrawer } from '../components/InventoryFiltersDrawer';
import type {
  InventoryStock,
  InventoryStockParams,
  StockMovementParams,
} from '../types/inventory.types';
import type { ImportStockFormValues } from '../schemas/importStockSchema';
import type { AdjustStockFormValues } from '../schemas/adjustStockSchema';

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

  const [stockFilters, setStockFilters, resetStockFilters] = useTableFilters<InventoryStockParams>(DEFAULT_STOCK_FILTERS, {
    namespace: 'stock',
    booleanKeys: ['outOfStock', 'lowStock'],
    numberKeys: ['lowStockThreshold'],
  });
  const [movementFilters, setMovementFilters] = useTableFilters<StockMovementParams>(DEFAULT_MOVEMENT_FILTERS, {
    namespace: 'movements',
  });

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

  const { data: stockData, isLoading: stockLoading, isError: stockError, refetch: refetchStock } =
    useInventoryStock(stockQueryParams);
  const { data: movementsData, isLoading: movementsLoading, isError: movementsError, refetch: refetchMovements } =
    useStockMovements(movementFilters);
  const { data: warehouseData } = useWarehouseOptions();
  const importStock = useImportStock();
  const adjustStock = useAdjustStock();

  const warehouses = warehouseData ?? [];

  const openImport = (stock?: InventoryStock) => {
    setStockContext(stock);
    setImportOpen(true);
  };

  const openAdjust = (stock: InventoryStock) => {
    setStockContext(stock);
    setAdjustOpen(true);
  };

  const handleImport = async (values: ImportStockFormValues) => {
    try {
      await importStock.mutateAsync(values);
      toast.success('Stock imported successfully.');
      setImportOpen(false);
      setStockContext(undefined);
    } catch (err) {
      if (err instanceof AppError) {
        toast.error(err.message || 'Failed to import stock. Please try again.');
      } else {
        toast.error('Failed to import stock. Please try again.');
      }
    }
  };

  const handleAdjust = async (values: AdjustStockFormValues) => {
    try {
      await adjustStock.mutateAsync(values);
      toast.success('Stock adjusted successfully.');
      setAdjustOpen(false);
      setStockContext(undefined);
    } catch (err) {
      if (err instanceof AppError) {
        toast.error(err.message || 'Failed to adjust stock. Please try again.');
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

        {/* Tab bar */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6" aria-label="Inventory tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-3 px-1 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
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
        onClose={() => {
          setImportOpen(false);
          setStockContext(undefined);
        }}
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
        onClose={() => {
          setAdjustOpen(false);
          setStockContext(undefined);
        }}
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
