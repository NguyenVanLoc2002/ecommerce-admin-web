import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import type { Role } from '@/shared/types/auth.types';
import { routes } from '@/constants/routes';

// ─── Guards ──────────────────────────────────────────────────────────────────

// Redirects unauthenticated users to /login, preserving the intended destination.
export function AuthGuard() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!accessToken) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${routes.login}?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}

// Redirects users whose role is not in the `required` list to /403.
interface RoleGuardProps {
  required: Role[];
}

export function RoleGuard({ required }: RoleGuardProps) {
  const role = useAuthStore((s) => s.role);

  if (!role || !required.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

// ─── Placeholder ─────────────────────────────────────────────────────────────
// Shown for all routes until the feature screens are implemented in later phases.

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Fashion Shop Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          This screen will be available in a future phase.
        </p>
      </div>
    </div>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ───────────────────────────────────────────────────── */}
        <Route path={routes.login} element={<PlaceholderPage title="Sign In" />} />
        <Route path="/403" element={<PlaceholderPage title="403 — Forbidden" />} />
        <Route path="/404" element={<PlaceholderPage title="404 — Not Found" />} />

        {/* ── Protected (requires authentication) ──────────────────────── */}
        <Route element={<AuthGuard />}>
          <Route path={routes.dashboard} element={<PlaceholderPage title="Dashboard" />} />

          {/* Products */}
          <Route path={routes.products.list} element={<PlaceholderPage title="Products" />} />
          <Route path={routes.products.create} element={<PlaceholderPage title="New Product" />} />
          <Route
            path={routes.products.edit(':id')}
            element={<PlaceholderPage title="Edit Product" />}
          />
          <Route
            path={routes.products.variants(':id')}
            element={<PlaceholderPage title="Manage Variants" />}
          />

          {/* Catalog */}
          <Route
            path={routes.categories.list}
            element={<PlaceholderPage title="Categories" />}
          />
          <Route path={routes.brands.list} element={<PlaceholderPage title="Brands" />} />

          {/* Inventory */}
          <Route
            path={routes.inventory.warehouses}
            element={<PlaceholderPage title="Warehouses" />}
          />
          <Route
            path={routes.inventory.stock}
            element={<PlaceholderPage title="Inventory" />}
          />
          <Route
            path={routes.inventory.reservations}
            element={<PlaceholderPage title="Reservations" />}
          />

          {/* Orders */}
          <Route path={routes.orders.list} element={<PlaceholderPage title="Orders" />} />
          <Route
            path={routes.orders.detail(':id')}
            element={<PlaceholderPage title="Order Detail" />}
          />

          {/* Payments */}
          <Route path={routes.payments.list} element={<PlaceholderPage title="Payments" />} />
          <Route
            path={routes.payments.detail(':id')}
            element={<PlaceholderPage title="Payment Detail" />}
          />

          {/* Shipments */}
          <Route
            path={routes.shipments.list}
            element={<PlaceholderPage title="Shipments" />}
          />
          <Route
            path={routes.shipments.create}
            element={<PlaceholderPage title="New Shipment" />}
          />
          <Route
            path={routes.shipments.detail(':id')}
            element={<PlaceholderPage title="Shipment Detail" />}
          />

          {/* Invoices */}
          <Route
            path={routes.invoices.detail(':id')}
            element={<PlaceholderPage title="Invoice" />}
          />

          {/* Promotions & Vouchers (ADMIN+) */}
          <Route element={<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route
              path={routes.promotions.list}
              element={<PlaceholderPage title="Promotions" />}
            />
            <Route
              path={routes.promotions.create}
              element={<PlaceholderPage title="New Promotion" />}
            />
            <Route
              path={routes.promotions.edit(':id')}
              element={<PlaceholderPage title="Edit Promotion" />}
            />
            <Route
              path={routes.vouchers.list}
              element={<PlaceholderPage title="Vouchers" />}
            />
            <Route
              path={routes.vouchers.create}
              element={<PlaceholderPage title="New Voucher" />}
            />
            <Route
              path={routes.vouchers.edit(':id')}
              element={<PlaceholderPage title="Edit Voucher" />}
            />
            <Route
              path={routes.vouchers.usages(':id')}
              element={<PlaceholderPage title="Voucher Usages" />}
            />
          </Route>

          {/* Reviews */}
          <Route path={routes.reviews.list} element={<PlaceholderPage title="Reviews" />} />

          {/* Audit Log (ADMIN+) */}
          <Route element={<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route
              path={routes.auditLog.list}
              element={<PlaceholderPage title="Audit Log" />}
            />
          </Route>
        </Route>

        {/* ── Catch-all ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
