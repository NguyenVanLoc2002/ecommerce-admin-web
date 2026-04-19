import { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatMoney } from '@/shared/utils/formatMoney';
import type { ColumnDef } from '@/shared/components/table/types';
import type { VariantStatus } from '@/shared/types/enums';
import type { ProductVariant } from '../types/product.types';
import { VariantRowActions } from './VariantRowActions';

interface VariantTableProps {
  productId: number;
  variants: ProductVariant[];
  onEdit: (variant: ProductVariant) => void;
  onAddNew: () => void;
}

export function VariantTable({ productId, variants, onEdit, onAddNew }: VariantTableProps) {
  const columns = useMemo<ColumnDef<ProductVariant>[]>(
    () => [
      {
        id: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-gray-600">{row.original.sku}</span>
        ),
      },
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">{row.original.name}</p>
            {Object.keys(row.original.attributes ?? {}).length > 0 && (
              <p className="text-xs text-gray-400">
                {Object.entries(row.original.attributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">{formatMoney(row.original.price)}</p>
            {row.original.salePrice != null && (
              <p className="text-xs text-success-600">{formatMoney(row.original.salePrice)}</p>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge type="variant" status={row.original.status as VariantStatus} />
        ),
      },
      {
        id: 'actions',
        header: '',
        className: 'w-12',
        cell: ({ row }) => (
          <VariantRowActions
            productId={productId}
            variant={row.original}
            onEdit={onEdit}
          />
        ),
      },
    ],
    [productId, onEdit],
  );

  return (
    <DataTable
      data={variants}
      columns={columns}
      getRowId={(row) => String(row.id)}
      emptyState={
        <EmptyState
          icon={<Layers className="h-10 w-10" />}
          title="No variants yet"
          message="Add your first variant to let customers choose options like size and color."
          action={{ label: 'Add variant', onClick: onAddNew }}
        />
      }
    />
  );
}
