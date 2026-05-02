import { useMemo, useState } from 'react';
import { Layers, Copy, Check } from 'lucide-react';
import { DataTable } from '@/shared/components/table/DataTable';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatMoney } from '@/shared/utils/formatMoney';
import { resolveSoftDeleteState } from '@/shared/utils/softDelete';
import type { ColumnDef } from '@/shared/components/table/types';
import { SoftDeleteState, type SoftDeleteState as SoftDeleteStateValue } from '@/shared/types/api.types';
import type { VariantStatus } from '@/shared/types/enums';
import type { ProductVariant } from '../types/product.types';
import { VariantRowActions } from './VariantRowActions';

interface VariantTableProps {
  productId: string;
  variants: ProductVariant[];
  deletedState: SoftDeleteStateValue;
  onEdit: (variant: ProductVariant) => void;
  onAddNew: () => void;
}

function SkuCell({ sku }: { sku: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(sku).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="group inline-flex items-center gap-1.5">
      <span className="font-mono text-xs text-gray-700">{sku}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy SKU'}
        className="inline-flex h-5 w-5 items-center justify-center rounded text-gray-300 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-3 w-3 text-success-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

export function VariantTable({
  productId,
  variants,
  deletedState,
  onEdit,
  onAddNew,
}: VariantTableProps) {
  const columns = useMemo<ColumnDef<ProductVariant>[]>(
    () => [
      {
        id: 'sku',
        header: 'SKU',
        cell: ({ row }) => <SkuCell sku={row.original.sku} />,
      },
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.original.variantName}</p>
            {(row.original.attributes ?? []).length > 0 && (
              <p className="text-xs text-gray-400">
                {row.original.attributes
                  .map(
                    ({ attributeName, displayValue, value }) =>
                      `${attributeName}: ${displayValue ?? value}`,
                  )
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
            <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatMoney(row.original.basePrice)}</p>
            {row.original.salePrice != null && (
              <p className="text-xs text-success-600 tabular-nums">{formatMoney(row.original.salePrice)}</p>
            )}
          </div>
        ),
      },
      {
        id: 'recordStatus',
        header: 'Record Status',
        cell: ({ row }) => (
          <StatusBadge
            type="soft-delete"
            status={resolveSoftDeleteState(row.original, deletedState)}
          />
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
    [deletedState, productId, onEdit],
  );

  return (
    <DataTable
      data={variants}
      columns={columns}
      getRowId={(row) => String(row.id)}
      emptyState={
        <EmptyState
          icon={<Layers className="h-10 w-10" />}
          title={
            deletedState === SoftDeleteState.DELETED
              ? 'No deleted variants'
              : deletedState === SoftDeleteState.ALL
                ? 'No variants yet'
                : 'No active variants'
          }
          message={
            deletedState === SoftDeleteState.DELETED
              ? 'Deleted variants will appear here.'
              : 'Add your first variant to let customers choose options like size and color.'
          }
          action={{ label: 'Add variant', onClick: onAddNew }}
        />
      }
    />
  );
}
