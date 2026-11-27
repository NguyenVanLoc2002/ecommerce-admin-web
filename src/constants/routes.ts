import type { EntityKey } from '@/shared/types/api.types';

// All route paths for the admin application.
// Always use these constants — never hardcode path strings in components.

export const routes = {
  login: '/login',
  dashboard: '/',

  products: {
    list: '/products',
    create: '/products/new',
    detail: (id: EntityKey) => `/products/${id}`,
    edit: (id: EntityKey) => `/products/${id}/edit`,
    variants: (id: EntityKey) => `/products/${id}/variants`,
  },

  productBadges: {
    list: '/product-badges',
    create: '/product-badges/new',
    edit: (id: EntityKey) => `/product-badges/${id}/edit`,
  },

  sizeGuides: {
    list: '/size-guides',
    create: '/size-guides/new',
    edit: (id: EntityKey) => `/size-guides/${id}/edit`,
  },

  productAttributes: {
    list: '/product-attributes',
    create: '/product-attributes/new',
    edit: (id: EntityKey) => `/product-attributes/${id}/edit`,
  },

  categories: {
    list: '/categories',
    create: '/categories/new',
    edit: (id: EntityKey) => `/categories/${id}/edit`,
  },

  brands: {
    list: '/brands',
  },

  taxConfiguration: '/tax-configuration',

  carriers: {
    list: '/carriers',
  },

  integrations: {
    root: '/integrations',
    shippingProviders: {
      list: '/integrations/shipping-providers',
      detail: (id: EntityKey) => `/integrations/shipping-providers/${id}`,
    },
    paymentProviders: {
      list: '/integrations/payment-providers',
      detail: (providerCode: EntityKey) => `/integrations/payment-providers/${providerCode}`,
    },
  },

  shippingPolicy: '/shipping-policy',
  shippingCalendars: '/shipping-calendars',
  deliveryRules: '/delivery-rules',

  warehouses: {
    list: '/warehouses',
    create: '/warehouses/new',
    edit: (id: EntityKey) => `/warehouses/${id}/edit`,
  },

  inventory: {
    warehouses: '/inventory/warehouses',
    stock: '/inventory/stock',
    reservations: '/inventory/reservations',
  },

  orders: {
    returns: '/orders/returns',
    list: '/orders',
    detail: (id: EntityKey) => `/orders/${id}`,
  },

  payments: {
    list: '/payments',
    integrations: '/payments/integrations',
    detail: (id: EntityKey) => `/payments/${id}`,
  },

  shipments: {
    list: '/shipments',
    create: '/shipments/new',
    createForOrder: (orderId: EntityKey) => `/shipments/new?orderId=${encodeURIComponent(String(orderId))}`,
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
