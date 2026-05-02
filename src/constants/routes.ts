import type { EntityKey } from '@/shared/types/api.types';

// All route paths for the admin application.
// Always use these constants — never hardcode path strings in components.

export const routes = {
  login: '/login',
  dashboard: '/',

  products: {
    list: '/products',
    create: '/products/new',
    edit: (id: EntityKey) => `/products/${id}`,
    variants: (id: EntityKey) => `/products/${id}/variants`,
  },

  productAttributes: {
    list: '/product-attributes',
  },

  categories: {
    list: '/categories',
  },

  brands: {
    list: '/brands',
  },

  warehouses: {
    list: '/warehouses',
  },

  inventory: {
    warehouses: '/inventory/warehouses',
    stock: '/inventory/stock',
    reservations: '/inventory/reservations',
  },

  orders: {
    list: '/orders',
    detail: (id: EntityKey) => `/orders/${id}`,
  },

  payments: {
    list: '/payments',
    detail: (id: EntityKey) => `/payments/${id}`,
  },

  shipments: {
    list: '/shipments',
    create: '/shipments/new',
    detail: (id: EntityKey) => `/shipments/${id}`,
  },

  invoices: {
    list: '/invoices',
    detail: (id: EntityKey) => `/invoices/${id}`,
  },

  promotions: {
    list: '/promotions',
    create: '/promotions/new',
    edit: (id: EntityKey) => `/promotions/${id}`,
  },

  vouchers: {
    list: '/vouchers',
    create: '/vouchers/new',
    edit: (id: EntityKey) => `/vouchers/${id}`,
    usages: (id: EntityKey) => `/vouchers/${id}/usages`,
  },

  reviews: {
    list: '/reviews',
  },

  users: {
    list: '/users',
  },

  customers: {
    list: '/customers',
  },

  auditLog: {
    list: '/audit-log',
  },
} as const;
