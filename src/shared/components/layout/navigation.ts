import type { ElementType } from 'react';
import {
  LayoutDashboard,
  Package,
  SlidersHorizontal,
  Tag,
  Building2,
  ShoppingCart,
  CreditCard,
  Truck,
  FileText,
  Boxes,
  Warehouse,
  Percent,
  Ticket,
  UsersRound,
  Star,
  PackageCheck,
  Landmark,
  ClipboardList,
  Users,
} from 'lucide-react';
import { routes } from '@/constants/routes';

export interface SidebarNavItem {
  label: string;
  to: string;
  icon: ElementType;
  adminOnly?: boolean;
  matchPrefixes?: string[];
}

export interface SidebarNavGroup {
  id: string;
  label: string;
  items: SidebarNavItem[];
}

export const dashboardNavItem: SidebarNavItem = {
  label: 'Dashboard',
  to: routes.dashboard,
  icon: LayoutDashboard,
};

export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    id: 'catalog',
    label: 'Catalog',
    items: [
      {
        label: 'Products',
        to: routes.products.list,
        icon: Package,
        matchPrefixes: [routes.products.list],
      },
      {
        label: 'Product Attributes',
        to: routes.productAttributes.list,
        icon: SlidersHorizontal,
        adminOnly: true,
        matchPrefixes: [routes.productAttributes.list],
      },
      {
        label: 'Categories',
        to: routes.categories.list,
        icon: Tag,
        matchPrefixes: [routes.categories.list],
      },
      {
        label: 'Brands',
        to: routes.brands.list,
        icon: Building2,
        matchPrefixes: [routes.brands.list],
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    items: [
      {
        label: 'Orders',
        to: routes.orders.list,
        icon: ShoppingCart,
        matchPrefixes: [routes.orders.list],
      },
      {
        label: 'Payments',
        to: routes.payments.list,
        icon: CreditCard,
        matchPrefixes: [routes.payments.list],
      },
      {
        label: 'Shipments',
        to: routes.shipments.list,
        icon: Truck,
        matchPrefixes: [routes.shipments.list],
      },
      {
        label: 'Invoices',
        to: routes.invoices.list,
        icon: FileText,
        matchPrefixes: [routes.invoices.list],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        label: 'Inventory',
        to: routes.inventory.stock,
        icon: Boxes,
        matchPrefixes: [routes.inventory.stock, routes.inventory.reservations],
      },
      {
        label: 'Warehouses',
        to: routes.warehouses.list,
        icon: Warehouse,
        matchPrefixes: [routes.warehouses.list, routes.inventory.warehouses],
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    items: [
      {
        label: 'Promotions',
        to: routes.promotions.list,
        icon: Percent,
        adminOnly: true,
        matchPrefixes: [routes.promotions.list],
      },
      {
        label: 'Vouchers',
        to: routes.vouchers.list,
        icon: Ticket,
        adminOnly: true,
        matchPrefixes: [routes.vouchers.list],
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    items: [
      {
        label: 'Customers',
        to: routes.customers.list,
        icon: UsersRound,
        matchPrefixes: [routes.customers.list],
      },
      {
        label: 'Reviews',
        to: routes.reviews.list,
        icon: Star,
        matchPrefixes: [routes.reviews.list],
      },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    items: [
      {
        label: 'Shipping Providers',
        to: routes.integrations.shippingProviders.list,
        icon: PackageCheck,
        matchPrefixes: [routes.integrations.shippingProviders.list],
      },
      {
        label: 'Payment Providers',
        to: routes.integrations.paymentProviders.list,
        icon: Landmark,
        matchPrefixes: [routes.integrations.paymentProviders.list],
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      {
        label: 'Staff',
        to: routes.users.list,
        icon: Users,
        adminOnly: true,
        matchPrefixes: [routes.users.list],
      },
      {
        label: 'Audit Log',
        to: routes.auditLog.list,
        icon: ClipboardList,
        adminOnly: true,
        matchPrefixes: [routes.auditLog.list],
      },
    ],
  },
];

export const breadcrumbGroupLabels: Record<string, string> = {
  products: 'Catalog',
  'product-attributes': 'Catalog',
  categories: 'Catalog',
  brands: 'Catalog',
  orders: 'Sales',
  payments: 'Sales',
  shipments: 'Sales',
  invoices: 'Sales',
  inventory: 'Operations',
  warehouses: 'Operations',
  promotions: 'Marketing',
  vouchers: 'Marketing',
  customers: 'Customers',
  reviews: 'Customers',
  users: 'Administration',
  'audit-log': 'Administration',
};

