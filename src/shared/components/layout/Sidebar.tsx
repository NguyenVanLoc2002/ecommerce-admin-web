import { NavLink, useMatch } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  SlidersHorizontal,
  Tag,
  Building2,
  Warehouse,
  ShoppingCart,
  CreditCard,
  Truck,
  FileText,
  Percent,
  Ticket,
  Star,
  Users,
  UsersRound,
  ClipboardList,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { routes } from '@/constants/routes';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { Role } from '@/shared/types/auth.types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: routes.dashboard, icon: LayoutDashboard },
  { label: 'Products', to: routes.products.list, icon: Package },
  { label: 'Product Attributes', to: routes.productAttributes.list, icon: SlidersHorizontal, adminOnly: true },
  { label: 'Categories', to: routes.categories.list, icon: Tag },
  { label: 'Brands', to: routes.brands.list, icon: Building2 },
  { label: 'Warehouses', to: routes.warehouses.list, icon: Warehouse },
  { label: 'Inventory', to: routes.inventory.stock, icon: Boxes },
  { label: 'Orders', to: routes.orders.list, icon: ShoppingCart },
  { label: 'Payments', to: routes.payments.list, icon: CreditCard },
  { label: 'Shipments', to: routes.shipments.list, icon: Truck },
  { label: 'Invoices', to: routes.invoices.list, icon: FileText },
  { label: 'Promotions', to: routes.promotions.list, icon: Percent, adminOnly: true },
  { label: 'Vouchers', to: routes.vouchers.list, icon: Ticket, adminOnly: true },
  { label: 'Reviews', to: routes.reviews.list, icon: Star },
  { label: 'Customers', to: routes.customers.list, icon: UsersRound },
  { label: 'Staff', to: routes.users.list, icon: Users, adminOnly: true },
  { label: 'Audit Log', to: routes.auditLog.list, icon: ClipboardList, adminOnly: true },
];

function formatRole(role: string | null): string {
  if (!role) return '';
  return role
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const match = useMatch({ path: item.to, end: item.to === routes.dashboard });
  const isActive = !!match;

  return (
    <NavLink
      to={item.to}
      end={item.to === routes.dashboard}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-gray-800 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white',
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" aria-hidden />
      {item.label}
    </NavLink>
  );
}

export function Sidebar() {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex h-screen min-h-0 w-64 shrink-0 flex-col overflow-hidden bg-gray-900 transition-transform duration-300 lg:static lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-700/60 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
              <Package className="h-4 w-4 text-white" aria-hidden />
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">Fashion Admin</span>
          </div>
          <button
            type="button"
            className="rounded p-2 text-gray-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Main navigation">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return <SidebarNavItem key={item.to} item={item} />;
          })}
        </nav>

        <div className="shrink-0 border-t border-gray-700/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700">
              <User className="h-4 w-4 text-gray-300" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user ? (`${user.firstName} ${user.lastName}`.trim() || user.email) : '—'}
              </p>
              <p className="truncate text-xs text-gray-400">{formatRole(role)}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
