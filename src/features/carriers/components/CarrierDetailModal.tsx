import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { formatDateTime } from '@/shared/utils/formatDate';
import { formatEnumLabel } from '@/shared/utils/formatEnumLabel';
import type { Carrier } from '../types/carrier.types';
import { CarrierConnectionBadge } from './CarrierConnectionBadge';

interface CarrierDetailModalProps {
  open: boolean;
  onClose: () => void;
  carrier?: Carrier;
  onConfigure: (carrier: Carrier) => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-right text-sm text-gray-800">{value}</div>
    </div>
  );
}

function SecretBadge({
  label,
  saved,
}: {
  label: string;
  saved: boolean;
}) {
  return <Badge variant={saved ? 'success' : 'default'}>{label}: {saved ? 'Saved' : 'Not saved'}</Badge>;
}

export function CarrierDetailModal({
  open,
  onClose,
  carrier,
  onConfigure,
}: CarrierDetailModalProps) {
  if (!carrier) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={carrier.name}
      description={`Carrier code ${carrier.code}`}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onConfigure(carrier)}>Configure</Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge type="entity" status={carrier.status} />
          <Badge variant="info">{formatEnumLabel(carrier.providerType)}</Badge>
          <Badge variant={carrier.configEnabled ? 'success' : 'default'}>
            {carrier.configEnabled ? 'Config enabled' : 'Config disabled'}
          </Badge>
          <CarrierConnectionBadge status={carrier.connectionStatus} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Metadata</h3>
            <div className="mt-3 divide-y divide-gray-100">
              <DetailRow label="Code" value={<span className="font-mono">{carrier.code}</span>} />
              <DetailRow label="Provider" value={formatEnumLabel(carrier.providerType)} />
              <DetailRow label="Base URL" value={carrier.baseUrl ?? <span className="text-gray-300">-</span>} />
              <DetailRow
                label="Last health check"
                value={carrier.lastHealthCheckAt ? formatDateTime(carrier.lastHealthCheckAt) : 'Not checked'}
              />
              <DetailRow label="Created" value={formatDateTime(carrier.createdAt)} />
              <DetailRow label="Updated" value={formatDateTime(carrier.updatedAt)} />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Stored secrets</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <SecretBadge label="API key" saved={carrier.hasApiKey} />
              <SecretBadge label="Secret key" saved={carrier.hasSecretKey} />
              <SecretBadge label="Webhook" saved={carrier.hasWebhookSecret} />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Raw secret values are never returned to the frontend. Use the config form to replace
              them when needed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Connection health</h3>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">Status</p>
                <div className="mt-1">
                  <CarrierConnectionBadge status={carrier.connectionStatus} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">Last error</p>
                <p className="mt-1 text-sm text-gray-600">
                  {carrier.lastHealthCheckError || 'No recent provider error'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Description</h3>
            <p className="mt-3 text-sm text-gray-600">
              {carrier.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-900">
            Advanced debug data
          </summary>
          {carrier.configJson ? (
            <pre className="mt-3 max-h-56 overflow-auto rounded-md bg-gray-950 px-4 py-3 text-xs text-gray-100">
              {carrier.configJson}
            </pre>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              No legacy config JSON stored for this carrier.
            </p>
          )}
        </details>
      </div>
    </Modal>
  );
}
