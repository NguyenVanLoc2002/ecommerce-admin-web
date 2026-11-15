import * as React from 'react';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/constants/routes';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonDetail } from '@/shared/components/feedback/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { useBeforeUnload } from '@/shared/hooks/useBeforeUnload';
import { toast } from '@/shared/stores/uiStore';
import { useCreateWarehouse } from '../hooks/useCreateWarehouse';
import { useUpdateWarehouse } from '../hooks/useUpdateWarehouse';
import { warehouseService } from '../services/warehouseService';
import { WarehouseForm } from '../components/WarehouseForm';
import type { WarehouseFormValues } from '../schemas/warehouseSchema';

function toOptionalNumber(value: string) {
  return value === '' ? undefined : Number(value);
}

function toWarehousePayload(values: WarehouseFormValues) {
  return {
    name: values.name,
    location: values.location || undefined,
    pickupAddress: values.pickupAddress || undefined,
    pickupShortAddress: values.pickupShortAddress || undefined,
    pickupContactName: values.pickupContactName || undefined,
    pickupContactPhone: values.pickupContactPhone || undefined,
    pickupLat: toOptionalNumber(values.pickupLat),
    pickupLng: toOptionalNumber(values.pickupLng),
  };
}

export function WarehouseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = useCallback((dirty: boolean) => setIsDirty(dirty), []);
  useBeforeUnload(isDirty);

  React.useEffect(() => {
    if (!isDirty) return;

    // BrowserRouter has no route-blocking API; guard same-origin links and browser history here.
    document.addEventListener('click', handleInternalLinkClick, true);
    let restoringHistory = false;
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;
    window.history.pushState(window.history.state, '', currentUrl);
    const handlePopState = () => {
      if (restoringHistory) {
        restoringHistory = false;
        return;
      }
      if (window.confirm('You have unsaved changes. Leave this page?')) {
        setIsDirty(false);
      } else {
        restoringHistory = true;
        window.history.forward();
      }
    };
    function handleInternalLinkClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(target instanceof HTMLAnchorElement) || target.target === '_blank' || target.hasAttribute('download')) return;
      const destination = new URL(target.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === location.pathname && destination.search === location.search) return;
      const nextUrl = `${destination.pathname}${destination.search}${destination.hash}`;
      if (nextUrl === currentUrl) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (window.confirm('You have unsaved changes. Leave this page?')) {
        setIsDirty(false);
        navigate(nextUrl);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('click', handleInternalLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, location.hash, location.pathname, location.search, navigate]);
  const isEdit = Boolean(id);
  const warehouseQuery = useQuery({
    queryKey: ['warehouses', 'detail', id],
    queryFn: () => warehouseService.getById(id!),
    enabled: isEdit,
  });
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const isSubmitting = createWarehouse.isPending || updateWarehouse.isPending;

  const leave = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Leave this page?')) return;
    setIsDirty(false);
    navigate(routes.warehouses.list);
  };

  const handleSubmit = async (values: WarehouseFormValues) => {
    if (id) {
      await updateWarehouse.mutateAsync({
        id,
        body: { ...toWarehousePayload(values), status: values.status },
      });
      toast.success('Warehouse saved.');
    } else {
      await createWarehouse.mutateAsync({ ...toWarehousePayload(values), code: values.code });
      toast.success('Warehouse created.');
    }
    setIsDirty(false);
    navigate(routes.warehouses.list);
  };

  if (isEdit && warehouseQuery.isLoading) return <AdminLayout><div className="p-6"><SkeletonDetail /></div></AdminLayout>;
  if (isEdit && (warehouseQuery.isError || !warehouseQuery.data)) return <AdminLayout><div className="p-6"><ErrorCard onRetry={() => void warehouseQuery.refetch()} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <PageHeader
          title={isEdit ? 'Edit Warehouse' : 'Create Warehouse'}
          description="Manage warehouse details and the pickup profile used by shipping providers."
          actions={<Button type="button" variant="secondary" onClick={leave}>Back to warehouses</Button>}
        />
        <WarehouseForm
          warehouse={warehouseQuery.data}
          isSubmitting={isSubmitting}
          onCancel={leave}
          onSubmit={handleSubmit}
          onDirtyChange={markDirty}
        />
      </div>
    </AdminLayout>
  );
}
