// Centralised TanStack Query key factory.
// Each feature adds its own block here when implemented.
// Use the factory pattern: keys at each level are stable references so
// invalidateQueries({ queryKey: queryKeys.products.lists() }) works correctly.

export const queryKeys = {
  // ── Phase 3: Dashboard ──────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    orders: () => [...queryKeys.dashboard.all, 'orders'] as const,
    payments: () => [...queryKeys.dashboard.all, 'payments'] as const,
    pendingReviews: () => [...queryKeys.dashboard.all, 'pendingReviews'] as const,
    lowStock: () => [...queryKeys.dashboard.all, 'lowStock'] as const,
    shipmentsOutForDelivery: () =>
      [...queryKeys.dashboard.all, 'shipmentsOutForDelivery'] as const,
  },

  // ── Phase 4: Products ───────────────────────────────────────────────────
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.products.lists(), params] as const,
    detail: (id: number) => [...queryKeys.products.all, 'detail', id] as const,
  },

  variants: {
    all: ['variants'] as const,
    byProduct: (productId: number) =>
      [...queryKeys.variants.all, 'byProduct', productId] as const,
    detail: (id: number) => [...queryKeys.variants.all, 'detail', id] as const,
  },

  // ── Phase 5: Categories & Brands ────────────────────────────────────────
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.categories.lists(), params] as const,
  },

  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.brands.lists(), params] as const,
  },

  // ── Phase 6: Inventory ──────────────────────────────────────────────────
  warehouses: {
    all: ['warehouses'] as const,
    lists: () => [...queryKeys.warehouses.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.warehouses.lists(), params] as const,
  },

  inventory: {
    all: ['inventory'] as const,
    stock: (params: object) =>
      [...queryKeys.inventory.all, 'stock', params] as const,
    byVariant: (variantId: number) =>
      [...queryKeys.inventory.all, 'variant', variantId] as const,
    movements: (params: object) =>
      [...queryKeys.inventory.all, 'movements', params] as const,
    reservations: (params: object) =>
      [...queryKeys.inventory.all, 'reservations', params] as const,
  },

  // ── Phase 7: Orders ─────────────────────────────────────────────────────
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.orders.lists(), params] as const,
    detail: (id: number) => [...queryKeys.orders.all, 'detail', id] as const,
  },

  // ── Phase 8: Shipments ──────────────────────────────────────────────────
  shipments: {
    all: ['shipments'] as const,
    lists: () => [...queryKeys.shipments.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.shipments.lists(), params] as const,
    detail: (id: number) => [...queryKeys.shipments.all, 'detail', id] as const,
    events: (id: number) => [...queryKeys.shipments.all, 'events', id] as const,
  },

  // ── Phase 9: Payments ───────────────────────────────────────────────────
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.payments.lists(), params] as const,
    detail: (id: number) => [...queryKeys.payments.all, 'detail', id] as const,
    transactions: (id: number) =>
      [...queryKeys.payments.all, 'transactions', id] as const,
  },

  // ── Phase 10: Invoices ──────────────────────────────────────────────────
  invoices: {
    all: ['invoices'] as const,
    detail: (id: number) => [...queryKeys.invoices.all, 'detail', id] as const,
  },

  // ── Phase 11: Promotions & Vouchers ─────────────────────────────────────
  promotions: {
    all: ['promotions'] as const,
    lists: () => [...queryKeys.promotions.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.promotions.lists(), params] as const,
    detail: (id: number) => [...queryKeys.promotions.all, 'detail', id] as const,
  },

  vouchers: {
    all: ['vouchers'] as const,
    lists: () => [...queryKeys.vouchers.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.vouchers.lists(), params] as const,
    detail: (id: number) => [...queryKeys.vouchers.all, 'detail', id] as const,
    usages: (id: number, params: object) =>
      [...queryKeys.vouchers.all, 'usages', id, params] as const,
  },

  // ── Phase 12: Reviews ───────────────────────────────────────────────────
  reviews: {
    all: ['reviews'] as const,
    pending: (params: object) =>
      [...queryKeys.reviews.all, 'pending', params] as const,
    detail: (id: number) => [...queryKeys.reviews.all, 'detail', id] as const,
  },

  // ── Phase 13: Audit Log ─────────────────────────────────────────────────
  auditLog: {
    all: ['auditLog'] as const,
    lists: () => [...queryKeys.auditLog.all, 'list'] as const,
    list: (params: object) =>
      [...queryKeys.auditLog.lists(), params] as const,
  },
};
