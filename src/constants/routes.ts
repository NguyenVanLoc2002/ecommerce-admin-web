import type { EntityKey } from '@/shared/types/api.types';

// All route paths for the admin application.
// Always use these constants — never hardcode path strings in components.

export const routes = {
  login: '/login',
  dashboard: '/',

  products: {
    list: '/products',
    create: '/products/new',
    edit: (id: EntityKey | ':id') => `/products/${id}`,
    variants: (id: EntityKey | ':id') => `/products/${id}/variants`,
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
    detail: (id: EntityKey | ':id') => `/orders/${id}`,
  },

  payments: {
    list: '/payments',
    detail: (id: EntityKey | ':id') => `/payments/${id}`,
  },

  shipments: {
    list: '/shipments',
    create: '/shipments/new',
    detail: (id: EntityKey | ':id') => `/shipments/${id}`,
  },

  invoices: {
    list: '/invoices',
    detail: (id: EntityKey | ':id') => `/invoices/${id}`,
  },

  promotions: {
    list: '/promotions',
    create: '/promotions/new',
    edit: (id: EntityKey | ':id') => `/promotions/${id}`,
  },

  vouchers: {
    list: '/vouchers',
    create: '/vouchers/new',
    edit: (id: EntityKey | ':id') => `/vouchers/${id}`,
    usages: (id: EntityKey | ':id') => `/vouchers/${id}/usages`,
  },

  reviews: {
    list: '/reviews',
  },

  auditLog: {
    list: '/audit-log',
  },
} as const;
