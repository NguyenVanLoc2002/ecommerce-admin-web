import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ProductInventorySummary } from '../components/ProductInventorySummary';
import type { ProductVariant } from '../types/product.types';

const variants: ProductVariant[] = [
  {
    id: 'variant-in-stock',
    productId: 'product-1',
    sku: 'IN-STOCK',
    barcode: null,
    variantName: 'Available option',
    basePrice: 100000,
    salePrice: null,
    compareAtPrice: null,
    weightGram: null,
    status: 'ACTIVE',
    attributes: [],
  },
  {
    id: 'variant-out-of-stock',
    productId: 'product-1',
    sku: 'OUT-OF-STOCK',
    barcode: null,
    variantName: 'Unavailable option',
    basePrice: 100000,
    salePrice: null,
    compareAtPrice: null,
    weightGram: null,
    status: 'ACTIVE',
    attributes: [],
  },
];

describe('ProductInventorySummary', () => {
  it('summarizes active variants and quantities across warehouses', () => {
    const markup = renderToStaticMarkup(
      <ProductInventorySummary
        variants={variants}
        inventory={{
          items: [
            {
              id: 'stock-1',
              variantId: 'variant-in-stock',
              warehouseId: 'warehouse-1',
              onHand: 8,
              reserved: 2,
              available: 6,
            },
            {
              id: 'stock-2',
              variantId: 'variant-in-stock',
              warehouseId: 'warehouse-2',
              onHand: 4,
              reserved: 1,
              available: 3,
            },
          ],
          page: 0,
          size: 100,
          totalItems: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
        onViewInventory={vi.fn()}
      />,
    );

    expect(markup).toContain('1 of 2 active variants available to sell.');
    expect(markup).toContain('>12<');
    expect(markup).toContain('>3<');
    expect(markup).toContain('>9<');
  });

  it('does not claim that inactive variants make the product sellable', () => {
    const markup = renderToStaticMarkup(
      <ProductInventorySummary
        variants={[{ ...variants[0], status: 'INACTIVE' }]}
        inventory={{
          items: [
            {
              id: 'stock-1',
              variantId: 'variant-in-stock',
              warehouseId: 'warehouse-1',
              onHand: 8,
              reserved: 0,
              available: 8,
            },
          ],
          page: 0,
          size: 100,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
        onViewInventory={vi.fn()}
      />,
    );

    expect(markup).toContain('No active variants to stock.');
    expect(markup).not.toContain('available to sell.');
  });
});
