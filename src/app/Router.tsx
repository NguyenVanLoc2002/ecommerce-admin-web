import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import type { Role } from '@/shared/types/auth.types';
import { routes } from '@/constants/routes';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard';
import { ProductListPage, ProductEditPage, ProductVariantsPage } from '@/features/products';
import { CategoryListPage } from '@/features/categories';
import { BrandListPage } from '@/features/brands';
import { WarehouseListPage, StockPage, ReservationListPage } from '@/features/inventory';
import { OrderListPage, OrderDetailPage } from '@/features/orders';
import { ShipmentListPage, ShipmentDetailPage, CreateShipmentPage } from '@/features/shipments';
import { PaymentListPage, PaymentDetailPage } from '@/features/payments';
import { InvoiceListPage, InvoicePage } from '@/features/invoices';
import { PromotionListPage, PromotionEditPage } from '@/features/promotions';
import { VoucherListPage, VoucherEditPage, VoucherUsagesPage } from '@/features/vouchers';
import { ReviewModerationPage } from '@/features/reviews';
import { AuditLogPage } from '@/features/audit-log';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
        <Route path={routes.login} element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* ── Protected (requires authentication) ──────────────────────── */}
        <Route element={<AuthGuard />}>
          <Route path={routes.dashboard} element={<DashboardPage />} />

          {/* Products */}
          <Route path={routes.products.list} element={<ProductListPage />} />
          <Route path={routes.products.create} element={<ProductEditPage />} />
          <Route path={routes.products.edit(':id')} element={<ProductEditPage />} />
          <Route path={routes.products.variants(':id')} element={<ProductVariantsPage />} />

          {/* Catalog */}
          <Route path={routes.categories.list} element={<CategoryListPage />} />
          <Route path={routes.brands.list} element={<BrandListPage />} />

          {/* Inventory */}
          <Route path={routes.inventory.warehouses} element={<WarehouseListPage />} />
          <Route path={routes.inventory.stock} element={<StockPage />} />
          <Route path={routes.inventory.reservations} element={<ReservationListPage />} />

          {/* Orders */}
          <Route path={routes.orders.list} element={<OrderListPage />} />
          <Route path={routes.orders.detail(':id')} element={<OrderDetailPage />} />

          {/* Payments */}
          <Route path={routes.payments.list} element={<PaymentListPage />} />
          <Route path={routes.payments.detail(':id')} element={<PaymentDetailPage />} />

          {/* Shipments */}
          <Route path={routes.shipments.list} element={<ShipmentListPage />} />
          <Route path={routes.shipments.create} element={<CreateShipmentPage />} />
          <Route path={routes.shipments.detail(':id')} element={<ShipmentDetailPage />} />

          {/* Invoices */}
          <Route path={routes.invoices.list} element={<InvoiceListPage />} />
          <Route path={routes.invoices.detail(':id')} element={<InvoicePage />} />

          {/* Promotions (ADMIN+) */}
          <Route element={<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path={routes.promotions.list} element={<PromotionListPage />} />
            <Route path={routes.promotions.create} element={<PromotionEditPage />} />
            <Route path={routes.promotions.edit(':id')} element={<PromotionEditPage />} />
          </Route>

          {/* Vouchers — list + usages readable by all staff */}
          <Route path={routes.vouchers.list} element={<VoucherListPage />} />
          <Route path={routes.vouchers.usages(':id')} element={<VoucherUsagesPage />} />

          {/* Voucher create/edit (ADMIN+) */}
          <Route element={<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path={routes.vouchers.create} element={<VoucherEditPage />} />
            <Route path={routes.vouchers.edit(':id')} element={<VoucherEditPage />} />
          </Route>

          {/* Reviews */}
          <Route path={routes.reviews.list} element={<ReviewModerationPage />} />

          {/* Audit Log (ADMIN+) */}
          <Route element={<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path={routes.auditLog.list} element={<AuditLogPage />} />
          </Route>
        </Route>

        {/* ── Catch-all ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
