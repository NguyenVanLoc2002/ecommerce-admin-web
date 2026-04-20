// All route paths for the admin application.
// Always use these constants — never hardcode path strings in components.

export const routes = {
  login: '/login',
  dashboard: '/',

  products: {
    list: '/products',
    create: '/products/new',
    edit: (id: number | ':id') => `/products/${id}`,
    variants: (id: number | ':id') => `/products/${id}/variants`,
  },

  categories: {
    list: '/categories',
  },

  brands: {
    list: '/brands',
  },

  inventory: {
    warehouses: '/inventory/warehouses',
    stock: '/inventory/stock',
    reservations: '/inventory/reservations',
  },

  orders: {
    list: '/orders',
    detail: (id: number | ':id') => `/orders/${id}`,
  },

  payments: {
    list: '/payments',
    detail: (id: number | ':id') => `/payments/${id}`,
  },

  shipments: {
    list: '/shipments',
    create: '/shipments/new',
    detail: (id: number | ':id') => `/shipments/${id}`,
  },

  invoices: {
    list: '/invoices',
    detail: (id: number | ':id') => `/invoices/${id}`,
  },

  promotions: {
    list: '/promotions',
    create: '/promotions/new',
    edit: (id: number | ':id') => `/promotions/${id}`,
  },

  vouchers: {
    list: '/vouchers',
    create: '/vouchers/new',
    edit: (id: number | ':id') => `/vouchers/${id}`,
    usages: (id: number | ':id') => `/vouchers/${id}/usages`,
  },

  reviews: {
    list: '/reviews',
  },

  auditLog: {
    list: '/audit-log',
  },
} as const;
