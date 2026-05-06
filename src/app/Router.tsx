import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import type { Role } from '@/shared/types/auth.types';
import { routes } from '@/constants/routes';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard';
import { ProductListPage, ProductEditPage, ProductVariantsPage } from '@/features/products';
import { ProductAttributeListPage } from '@/features/product-attributes';
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
import { UserListPage } from '@/features/users';
import { CustomerListPage } from '@/features/customers';
import { AuditLogPage } from '@/features/audit-log';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function AuthGuard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const location = useLocation();

  if (!isAuthResolved) {
    return null;
  }

  if (!accessToken) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${routes.login}?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}

interface RoleGuardProps {
  required: Role[];
}

export function RoleGuard({ required }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);

  if (!isAuthResolved) {
    return null;
  }

  if (!role || !required.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.login} element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        <Route element={<AuthGuard />}>
          <Route path={routes.dashboard} element={<DashboardPage />} />

          <Route path={routes.products.list} element={<ProductListPage />} />
          <Route path={routes.products.create} element={<ProductEditPage />} />
          <Route path={routes.products.edit(':id')} element={<ProductEditPage />} />
          <Route path={routes.products.variants(':id')} element={<ProductVariantsPage />} />

          <Route path={routes.categories.list} element={<CategoryListPage />} />
          <Route path={routes.brands.list} element={<BrandListPage />} />

          <Route path={routes.warehouses.list} element={<WarehouseListPage />} />
          <Route path={routes.inventory.warehouses} element={<Navigate to={routes.warehouses.list} replace />} />
          <Route path={routes.inventory.stock} element={<StockPage />} />
          <Route path={routes.inventory.reservations} element={<ReservationListPage />} />

          <Route path={routes.orders.list} element={<OrderListPage />} />
          <Route path={routes.orders.detail(':id')} element={<OrderDetailPage />} />

          <Route path={routes.payments.list} element={<PaymentListPage />} />
          <Route path={routes.payments.detail(':id')} element={<PaymentDetailPage />} />

          <Route path={routes.shipments.list} element={<ShipmentListPage />} />
          <Route path={routes.shipments.create} element={<CreateShipmentPage />} />
          <Route path={routes.shipments.detail(':id')} element={<ShipmentDetailPage />} />

          <Route path={routes.invoices.list} element={<InvoiceListPage />} />
          <Route path={routes.invoices.detail(':id')} element={<InvoicePage />} />

          <Route element={<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path={routes.productAttributes.list} element={<ProductAttributeListPage />} />
            <Route path={routes.promotions.list} element={<PromotionListPage />} />
            <Route path={routes.promotions.create} element={<PromotionEditPage />} />
            <Route path={routes.promotions.edit(':id')} element={<PromotionEditPage />} />
          </Route>

          <Route path={routes.vouchers.list} element={<VoucherListPage />} />
          <Route path={routes.vouchers.usages(':id')} element={<VoucherUsagesPage />} />

          <Route element={<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path={routes.vouchers.create} element={<VoucherEditPage />} />
            <Route path={routes.vouchers.edit(':id')} element={<VoucherEditPage />} />
          </Route>

          <Route path={routes.reviews.list} element={<ReviewModerationPage />} />

          <Route path={routes.customers.list} element={<CustomerListPage />} />

          <Route element={<RoleGuard required={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path={routes.users.list} element={<UserListPage />} />
            <Route path={routes.auditLog.list} element={<AuditLogPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
