import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
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
  ClipboardList,
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
  { label: 'Categories', to: routes.categories.list, icon: Tag },
  { label: 'Brands', to: routes.brands.list, icon: Building2 },
  { label: 'Inventory', to: routes.inventory.stock, icon: Warehouse },
  { label: 'Orders', to: routes.orders.list, icon: ShoppingCart },
  { label: 'Payments', to: routes.payments.list, icon: CreditCard },
  { label: 'Shipments', to: routes.shipments.list, icon: Truck },
  { label: 'Invoices', to: routes.invoices.detail(':id'), icon: FileText },
  { label: 'Promotions', to: routes.promotions.list, icon: Percent, adminOnly: true },
  { label: 'Vouchers', to: routes.vouchers.list, icon: Ticket, adminOnly: true },
  { label: 'Reviews', to: routes.reviews.list, icon: Star },
  { label: 'Audit Log', to: routes.auditLog.list, icon: ClipboardList, adminOnly: true },
];

export function Sidebar() {
  const role = useAuthStore((s) => s.role);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" aria-hidden />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-gray-900 transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-700">
          <span className="text-lg font-bold text-white tracking-tight">Fashion Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
